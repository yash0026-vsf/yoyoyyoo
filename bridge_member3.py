"""Bridge Connector: Member 2 (AI Skill Assessment & Gap Analysis) 
                 <-> Member 3 (Adaptive Quiz & Course Recommender)

This script demonstrates the complete end-to-end flow:
1. Ingests employee profile & extracts skills from resume (Member 2)
2. Normalizes & semantically maps skills to official iGOT competencies (Member 2)
3. Evaluates skill gaps against benchmark role requirements (Member 2)
4. Hands off the skill gaps to Member 3's engine to:
   a) Generate an adaptive 1-5 level evaluation quiz (Member 3)
   b) Recommend targeted bridging courses from the course catalog (Member 3)

Compatible with:
- Member 3's running FastAPI server (http://127.0.0.1:8000)
- OR direct local Python fallback if Member 3 server is offline
"""

import sys
import json
import urllib.request
import urllib.error

# Member 2 modules
from data_loader import load_employees, load_requirements, load_courses
from skill_extractor import extract_skills
from skill_normalizer import normalize_extracted_skills
from gap_analyzer import merge_skills, calculate_skill_gaps

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def call_member3_api_quiz(employee_id: str, skill: str, count: int = 3, base_url: str = "http://127.0.0.1:8000"):
    """Calls Member 3's /generate-quiz endpoint if running."""
    url = f"{base_url}/generate-quiz"
    payload = json.dumps({
        "employee_id": employee_id,
        "skill": skill,
        "question_count": count
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception:
        return None


def call_member3_api_recommendations(skill: str, current_level: int, required_level: int, base_url: str = "http://127.0.0.1:8000"):
    """Calls Member 3's /recommendations endpoint if running."""
    import urllib.parse
    params = urllib.parse.urlencode({
        "skill": skill,
        "current_level": current_level,
        "required_level": required_level
    })
    url = f"{base_url}/recommendations?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": "Member2-Bridge"})
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception:
        return None


def local_member3_recommend_courses(skill: str, current_level: int, required_level: int, catalog: list[dict]):
    """Member 3's core recommendation algorithm applied across the official 50-course catalog.
    Matches courses bridging current_level < difficulty_level <= required_level.
    """
    if current_level >= required_level:
        return []

    recommended = []
    for course in catalog:
        # Check if course covers the skill (handles both Member 3 'skills' and Member 1 'competencies_v3')
        course_skills = course.get("competencies_v3", course.get("skills", []))
        diff_level = course.get("difficulty_level", 1)
        
        matches_skill = any(skill.lower() == s.lower() for s in course_skills)
        if matches_skill and (current_level < diff_level <= required_level):
            recommended.append({
                "course_id": course.get("identifier", course.get("course_id", "N/A")),
                "name": course.get("name"),
                "difficulty_level": diff_level,
                "duration_hours": course.get("duration_hours", 0),
                "channel": course.get("channel", "iGOT Karmayogi"),
                "reason": f"Bridges gap from Level {current_level} to Level {required_level} by mastering Level {diff_level} concepts."
            })

    recommended.sort(key=lambda c: c["difficulty_level"])
    return recommended


def run_pipeline_for_employee(employee: dict, requirements: dict, catalog: list[dict], member3_api_url: str = "http://127.0.0.1:8000"):
    emp_id = employee.get("employee_id", "Unknown")
    name = employee.get("name", "Unknown")
    role = employee.get("designation") or employee.get("current_role", "Unknown Role")
    resume_text = employee.get("resume_text") or employee.get("experience_description", "")
    existing_skills = employee.get("existing_skills") or employee.get("quiz_assessed_skills") or {}

    print("\n" + "=" * 70)
    print(f"[STEP 1: PROFILE INGESTION & SKILL EXTRACTION]")
    print(f"Employee: {name} ({emp_id}) | Role: {role}")
    print(f"Resume: \"{resume_text}\"")
    print("=" * 70)

    # 1. Member 2: Skill Extraction & Normalization
    raw_extracted = extract_skills(resume_text)
    normalized = normalize_extracted_skills(raw_extracted)

    print("\n[AI Mapped Competencies]")
    for item in normalized:
        raw = item.get("raw_skill", item.get("skill"))
        mapped = item.get("mapped_competency")
        print(f"  - '{raw}' -> Mapped: {mapped or 'Unmapped'} | Extracted Level: {item['level']}")

    # 2. Member 2: Gap Analysis
    final_skills = merge_skills(existing_skills, normalized)
    role_benchmarks = employee.get("required_competency_profile") or requirements.get(role, {})
    gaps = calculate_skill_gaps(final_skills, role_benchmarks)

    print("\n" + "=" * 70)
    print(f"[STEP 2: GAP ANALYSIS (MEMBER 2)]")
    print(f"Role Benchmarks for '{role}': {role_benchmarks}")
    print("-" * 70)

    gapped_skills = []
    for g in gaps:
        status_tag = f"[{g['status'].upper()}]"
        print(f"  {status_tag:<18} {g['skill']:<22} Current: {g['current_level']} | Req: {g['required_level']} | Gap: {g['gap']}")
        if g["gap"] > 0:
            gapped_skills.append(g)

    # 3. Member 3 Handoff: Adaptive Quiz & Targeted Course Recommendations
    print("\n" + "=" * 70)
    print(f"[STEP 3: MEMBER 3 INTEGRATION (QUIZ GENERATION & COURSE RECOMMENDATIONS)]")
    print("=" * 70)

    if not gapped_skills:
        print("  All requirements met! No quiz or course recommendations needed.")
        return

    for target in gapped_skills:
        skill_name = target["skill"]
        curr_lvl = target["current_level"]
        req_lvl = target["required_level"]

        print(f"\nProcessing Gap for '{skill_name}' (Current Level: {curr_lvl} -> Target: {req_lvl}):")

        # Check Member 3 API for live quiz generation
        quiz_data = call_member3_api_quiz(emp_id, skill_name, count=3, base_url=member3_api_url)
        if quiz_data and "questions" in quiz_data:
            print(f"  [API] Successfully retrieved adaptive quiz from Member 3 API (Quiz ID: {quiz_data['quiz_id']})")
            for q in quiz_data["questions"]:
                print(f"    - [Level {q['difficulty']}] {q['prompt']}")
        else:
            print(f"  [Notice] Member 3 API server not active at {member3_api_url}. Running local recommendation resolver.")

        # Recommendations: Try API first, fallback to Member 3's algorithm on local catalog
        rec_data = call_member3_api_recommendations(skill_name, curr_lvl, req_lvl, base_url=member3_api_url)
        courses = []
        if rec_data and "recommended_courses" in rec_data:
            courses = rec_data["recommended_courses"]
        else:
            courses = local_member3_recommend_courses(skill_name, curr_lvl, req_lvl, catalog)

        print(f"  Recommended Courses ({len(courses)} courses found to bridge gap):")
        if courses:
            for c in courses:
                print(f"     - [{c.get('channel', 'iGOT')}] {c.get('name')} (Level {c.get('difficulty_level')}, {c.get('duration_hours')}h)")
                print(f"       Reason: {c.get('reason')}")
        else:
            print("     - No specific courses matching this exact level bracket in catalog.")


def main():
    employees = load_employees()
    requirements = load_requirements()
    catalog = load_courses()

    print("\n" + "#" * 70)
    print("CONNECTED PIPELINE: MEMBER 2 (GAP ANALYSIS) + MEMBER 3 (RECOMMENDATIONS)")
    print("#" * 70)

    # Run for the first employee as demonstration
    if employees:
        run_pipeline_for_employee(employees[0], requirements, catalog)

    print("\n" + "#" * 70)
    print("PIPELINE EXECUTION COMPLETE")
    print("#" * 70 + "\n")


if __name__ == "__main__":
    main()
