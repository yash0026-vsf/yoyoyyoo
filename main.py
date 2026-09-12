import sys
import time
from data_loader import load_employees, load_requirements
from gap_analyzer import merge_skills, calculate_skill_gaps
from skill_extractor import extract_skills
from skill_normalizer import normalize_extracted_skills

# Ensure stdout handles UTF-8 on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Expose top-level FastAPI application for Render, Uvicorn, and cloud deployments
from statskill_backend import app



def analyze_employee(employee, requirements):
    """Processes a single employee: extracts skills, normalizes, merges, and calculates gaps."""
    employee_id = employee.get("employee_id", "Unknown ID")
    name = employee.get("name", "Unknown")
    designation = employee.get("designation") or employee.get("current_role", "Unknown Role")
    department = employee.get("department", "N/A")
    exp_years = employee.get("years_experience", employee.get("experience_years", 0))
    past_trainings = employee.get("past_trainings", [])
    existing_skills = employee.get("existing_skills") or employee.get("quiz_assessed_skills") or {}
    text = employee.get("resume_text") or employee.get("experience_description", "")

    print("\n" + "=" * 60)
    print(f"[EMPLOYEE] {name} ({employee_id})")
    print(f"Role: {designation} | Dept: {department} | Experience: {exp_years} years")
    if past_trainings:
        print(f"Past Trainings: {', '.join(past_trainings)}")
    print(f"Resume Text: \"{text}\"")
    print("=" * 60)

    # Determine required competency profile (from employee object or benchmark catalog)
    required_skills = employee.get("required_competency_profile") or requirements.get(designation)
    if not required_skills:
        print(f"[WARNING] No requirement benchmark found for designation '{designation}'.")
        print("Skipping gap analysis for this employee.\n")
        return

    # Extract skills via Gemini LLM with automatic retry on temporary spike
    print("\n[AI] Extracting skills using Gemini...")
    extracted_skills = []
    max_retries = 3
    for attempt in range(1, max_retries + 1):
        try:
            extracted_skills = extract_skills(text)
            break
        except Exception as e:
            if attempt < max_retries:
                print(f"   Waiting... temporary issue ({e}). Retrying in 3 seconds (attempt {attempt}/{max_retries})...")
                time.sleep(3)
            else:
                print(f"[ERROR] Failed to extract skills after {max_retries} attempts: {e}")
                extracted_skills = []

    # Normalize extracted skills
    normalized_skills = normalize_extracted_skills(extracted_skills)

    print("\n[EXTRACTED SKILLS & TAXONOMY MAPPING]")
    if normalized_skills:
        for item in normalized_skills:
            raw = item.get("raw_skill", item.get("skill", ""))
            mapped = item.get("mapped_competency")
            if mapped:
                mapping_str = f" -> Mapped to: '{mapped}'"
            else:
                mapping_str = " (Unmapped)"
            print(f"  - {raw}{mapping_str} | Level {item['level']}")
            print(f"    Evidence: \"{item.get('evidence', '')}\"")
    else:
        print("  (None extracted or text was empty)")

    # Merge existing and extracted skills (taking max level for duplicates)
    final_skills = merge_skills(existing_skills, normalized_skills)

    print("\n[FINAL EVALUATED SKILLS]")
    for skill, level in sorted(final_skills.items()):
        print(f"  - {skill}: Level {level}")

    # Calculate skill gaps
    results = calculate_skill_gaps(final_skills, required_skills)

    print("\n[SKILL GAP ANALYSIS]")
    for item in results:
        status = item["status"]
        if status == "Meets Requirement":
            tag = "[OK]             "
        elif status == "Needs Improvement":
            tag = "[NEEDS IMPROVE]  "
        else:
            tag = "[HIGH PRIORITY]  "

        print(
            f"  {tag} {item['skill']:<24} "
            f"Current: {item['current_level']} | Req: {item['required_level']} | "
            f"Gap: {item['gap']:<2} -> {status}"
        )


def main():
    # Load dataset & requirements
    employees = load_employees()
    requirements = load_requirements()

    print("\n" + "#" * 60)
    print(f"=== AI SKILL ASSESSMENT PIPELINE: PROCESSING {len(employees)} EMPLOYEES ===")
    print("#" * 60)

    for index, employee in enumerate(employees, start=1):
        print(f"\n>>> Processing Record {index} of {len(employees)}...")
        analyze_employee(employee, requirements)
        # Polite pause between API calls to respect rate limits
        if index < len(employees):
            time.sleep(1)

    print("\n" + "#" * 60)
    print("=== ALL EMPLOYEES PROCESSED SUCCESSFULLY ===")
    print("#" * 60 + "\n")


if __name__ == "__main__":
    main()