"""Complete 3-Phase Closed-Loop Skill Intelligence Workflow

PHASE 1: DIAGNOSTIC BASELINE
  1. User Profile / Resume Ingested
  2. Member 2 (AI Extractor): Estimates preliminary/claimed level from resume text
  3. Member 3 (Pre-Quiz): Adaptive diagnostic quiz across Levels 1-5 to verify the claim
  4. Member 2 (Gap Engine): Sets TRUE empirical baseline level from quiz score

PHASE 2: PRESCRIPTION & COURSES
  5. Member 2: Compares True Current Level vs. Role Benchmark -> Identifies Gaps
  6. Member 3 (Recommender): Prescribes targeted iGOT courses bridging the gap

PHASE 3: UPSKILLING & LEVEL UP
  7. Employee completes prescribed course
  8. Member 3 (Post-Quiz): Generates mastery test for the course target level
  9. Member 2: Employee passes -> Upgrades Current Level (Level 2 -> Level 3)
  10. Final Gap becomes 0 (Meets Requirement) -> Dashboard turns GREEN!
"""

import sys
import json
import uuid
from dataclasses import dataclass
from collections import defaultdict

# Member 2 Modules
from data_loader import load_employees, load_requirements, load_courses
from skill_extractor import extract_skills
from skill_normalizer import normalize_extracted_skills
from gap_analyzer import merge_skills, calculate_skill_gaps

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


# ---------------------------------------------------------------------------
# Pre-Quiz & Post-Quiz Engine (Member 3 Aligned)
# ---------------------------------------------------------------------------
@dataclass
class QuizQuestion:
    question_id: str
    skill: str
    difficulty: int
    prompt: str
    options: list[str]
    correct_option: int
    explanation: str


# Curated question bank covering official competencies across levels 1 to 5
QUESTION_BANK = [
    # Python
    QuizQuestion("py-1", "Python", 1, "Which symbol starts a comment in Python?", ["#", "//", "<!--", "*"], 0, "# is used for single-line comments."),
    QuizQuestion("py-2", "Python", 2, "Which keyword is used to define a function in Python?", ["func", "def", "function", "lambda"], 1, "Functions use the 'def' keyword."),
    QuizQuestion("py-3", "Python", 3, "Which built-in module is used for handling JSON in Python?", ["json", "pickle", "requests", "csv"], 0, "The 'json' module serializes/deserializes JSON."),
    QuizQuestion("py-4", "Python", 4, "What does a generator expression offer over list comprehensions?", ["Faster indexing", "Memory-efficient lazy evaluation", "Static typing", "Multi-threading"], 1, "Generators evaluate lazily on demand without allocating full memory."),
    QuizQuestion("py-5", "Python", 5, "What does the Python GIL (Global Interpreter Lock) primarily restrict?", ["Multi-process execution", "True concurrent multi-threaded execution of Python bytecode", "Garbage collection", "File I/O"], 1, "The GIL limits bytecode execution to one native thread at a time."),

    # Survey Design
    QuizQuestion("sd-1", "Survey Design", 1, "What is the first step in designing a statistical survey?", ["Data entry", "Defining survey objectives and target population", "Printing questionnaires", "Tabulation"], 1, "Defining clear objectives and population comes first."),
    QuizQuestion("sd-2", "Survey Design", 2, "In survey methodology, what is a 'sampling frame'?", ["A picture frame for maps", "A complete list of units from which a sample is drawn", "The statistical software used", "The total budget"], 1, "A sampling frame is the actual list/roster of the target population."),
    QuizQuestion("sd-3", "Survey Design", 3, "What type of question is: 'Rate your satisfaction from 1 (Very Poor) to 5 (Excellent)'?", ["Binary question", "Likert scale question", "Open-ended question", "Filter question"], 1, "Likert scales measure graded degrees of opinion."),
    QuizQuestion("sd-4", "Survey Design", 4, "When sampling across diverse geographic zones with unequal variances, which sampling design is optimal?", ["Simple Random Sampling", "Stratified Random Sampling with Neyman Allocation", "Convenience Sampling", "Snowball Sampling"], 1, "Stratified sampling with Neyman allocation minimizes variance for fixed sample size."),
    QuizQuestion("sd-5", "Survey Design", 5, "How is non-sampling error primarily controlled in large-scale national sample surveys?", ["Increasing sample size to infinity", "Standardized field manuals, double-entry validation, and post-stratification weighting", "Ignoring non-respondents", "Using telephone surveys only"], 1, "Rigorous field protocols, audits, and calibration weighting control non-sampling bias."),

    # Communication
    QuizQuestion("com-1", "Communication", 1, "Which of the following is essential in official government correspondence?", ["Slang words", "Clarity, concise language, and formal tone", "Long complex metaphors", "Emoji icons"], 1, "Official correspondence requires clarity and professional tone."),
    QuizQuestion("com-2", "Communication", 2, "Active listening primarily involves:", ["Thinking about your reply while the other speaks", "Paying full attention, clarifying, and summarizing key points", "Interrupting quickly", "Remaining silent forever"], 1, "Active listening requires full engagement, comprehension, and feedback."),
    QuizQuestion("com-3", "Communication", 3, "When communicating a policy shift to diverse public stakeholders, the best approach is:", ["Technical jargon", "Tailored messaging addressing specific public impacts and FAQs", "A single one-line memo", "No briefing"], 1, "Tailored messaging ensures clear stakeholder understanding and buy-in."),
    QuizQuestion("com-4", "Communication", 4, "In crisis communication, what is the 'Golden Rule' for institutional credibility?", ["Delay all statements for weeks", "Communicate transparently, acknowledge known facts, and specify action steps promptly", "Blame other departments", "Speculate freely"], 1, "Prompt, factual, and transparent communication prevents panic and maintains trust."),
    QuizQuestion("com-5", "Communication", 5, "Strategic organizational communication aligns daily messaging with:", ["Short-term gossip", "Long-term institutional vision, policy priorities, and citizen trust", "Personal preferences", "Unverified claims"], 1, "Strategic communication drives organizational alignment and public mandate."),
]


def generate_pre_quiz(skill: str, count: int = 5) -> list[QuizQuestion]:
    """Generates an adaptive diagnostic Pre-Quiz covering levels 1 through 5."""
    matching = [q for q in QUESTION_BANK if q.skill.lower() == skill.lower()]
    matching.sort(key=lambda q: q.difficulty)
    return matching[:count]


def evaluate_quiz(questions: list[QuizQuestion], answers: dict[str, int]) -> tuple[int, int, int]:
    """Computes verified empirical competency level (1-5) based on quiz answers.
    Level = highest difficulty level where candidate achieved passing accuracy (>= 60%).
    """
    correct_by_level = defaultdict(int)
    total_by_level = defaultdict(int)
    total_correct = 0

    for q in questions:
        total_by_level[q.difficulty] += 1
        selected = answers.get(q.question_id)
        if selected == q.correct_option:
            total_correct += 1
            correct_by_level[q.difficulty] += 1

    empirical_level = 1
    for diff in range(1, 6):
        if total_by_level[diff] > 0:
            rate = correct_by_level[diff] / total_by_level[diff]
            if rate >= 0.60:
                empirical_level = diff

    return empirical_level, total_correct, len(questions)


def recommend_courses(skill: str, current_level: int, required_level: int, catalog: list[dict]):
    """Member 3 recommendation: matches courses bridging current_level < difficulty <= required_level."""
    if current_level >= required_level:
        return []
    
    courses = []
    for c in catalog:
        c_skills = c.get("competencies_v3", c.get("skills", []))
        diff = c.get("difficulty_level", 1)
        if any(skill.lower() == s.lower() for s in c_skills) and (current_level < diff <= required_level):
            courses.append({
                "course_id": c.get("identifier", c.get("course_id", "N/A")),
                "name": c.get("name"),
                "difficulty_level": diff,
                "duration_hours": c.get("duration_hours", 0),
                "channel": c.get("channel", "iGOT Karmayogi"),
                "reason": f"Bridges gap from Level {current_level} to Level {required_level} by mastering Level {diff} concepts."
            })
    courses.sort(key=lambda x: x["difficulty_level"])
    return courses


# ---------------------------------------------------------------------------
# Master 3-Phase Execution Flow
# ---------------------------------------------------------------------------
def run_full_workflow():
    employees = load_employees()
    requirements = load_requirements()
    catalog = load_courses()

    employee = employees[0] # Vivek Reddy (E001)
    emp_id = employee["employee_id"]
    name = employee["name"]
    role = employee["designation"]
    resume_text = employee["resume_text"]
    role_benchmarks = requirements.get(role, {})

    print("\n" + "#" * 74)
    print("      CIVIL SERVICE AI SKILL INTELLIGENCE: FULL 3-PHASE CLOSED LOOP")
    print("#" * 74)

    # -----------------------------------------------------------------------
    # PHASE 1: DIAGNOSTIC BASELINE
    # -----------------------------------------------------------------------
    print("\n" + "=" * 74)
    print("┌────────────────────────────────────────────────────────────────────────┐")
    print("│                    PHASE 1: DIAGNOSTIC BASELINE                        │")
    print("└────────────────────────────────────────────────────────────────────────┘")
    print(f"Candidate: {name} ({emp_id}) | Role: {role}")
    print(f"Resume: \"{resume_text}\"")
    print("-" * 74)

    print("\n[Step 1 & 2] Member 2: AI Skill Extractor evaluating claimed levels from resume...")
    raw_extracted = extract_skills(resume_text)
    normalized = normalize_extracted_skills(raw_extracted)

    claimed_levels = {}
    for item in normalized:
        skill = item.get("mapped_competency") or item.get("raw_skill")
        claimed_levels[skill] = max(claimed_levels.get(skill, 1), item["level"])
        print(f"  • Claimed '{item.get('raw_skill')}' -> Competency: '{skill}' | Claimed Level: {item['level']}")

    # Pick a skill to run the diagnostic Pre-Quiz (e.g. Survey Design or Python)
    target_skill = "Survey Design"
    claimed_lvl = claimed_levels.get(target_skill, 5)

    print(f"\n[Step 3] Member 3: Generating Diagnostic PRE-QUIZ for '{target_skill}'...")
    print(f"  Candidate claims Level {claimed_lvl} on resume. Verifying with 5-question adaptive quiz...")
    
    pre_quiz = generate_pre_quiz(target_skill, count=5)
    for q in pre_quiz:
        print(f"    - [Q{q.question_id} | Level {q.difficulty}] {q.prompt}")

    # Simulated candidate takes Pre-Quiz:
    # Let's simulate candidate gets Level 1, 2, 3 right, but misses Level 4 and 5 questions!
    simulated_pre_answers = {
        "sd-1": 1, # Correct (Level 1)
        "sd-2": 1, # Correct (Level 2)
        "sd-3": 1, # Correct (Level 3)
        "sd-4": 0, # Incorrect (Level 4, selected Simple Random instead of Stratified)
        "sd-5": 0, # Incorrect (Level 5)
    }

    true_level, correct, total = evaluate_quiz(pre_quiz, simulated_pre_answers)
    print(f"\n[Step 4] Member 2: Diagnostic Pre-Quiz Result Evaluated:")
    print(f"  Score: {correct}/{total} ({round((correct/total)*100, 1)}%)")
    print(f"  -> Candidate Claimed Level: Level {claimed_lvl}")
    print(f"  -> VERIFIED TRUE LEVEL:     Level {true_level} (Solid through Level 3, failed Level 4 & 5)")

    # -----------------------------------------------------------------------
    # PHASE 2: PRESCRIPTION & COURSES
    # -----------------------------------------------------------------------
    print("\n" + "=" * 74)
    print("┌────────────────────────────────────────────────────────────────────────┐")
    print("│                    PHASE 2: PRESCRIPTION & COURSES                     │")
    print("└────────────────────────────────────────────────────────────────────────┘")
    required_level = role_benchmarks.get(target_skill, 4)
    initial_gap = max(0, required_level - true_level)

    print(f"\n[Step 5] Member 2: Gap Engine comparing True Current Level vs. Role Benchmark:")
    print(f"  Competency:     {target_skill}")
    print(f"  Verified Level: Level {true_level}")
    print(f"  Required Level: Level {required_level} (for '{role}')")
    print(f"  Current Gap:    {initial_gap} -> Status: [NEEDS IMPROVEMENT]")

    print(f"\n[Step 6] Member 3: Recommender prescribing targeted iGOT courses to bridge gap:")
    recommended = recommend_courses(target_skill, true_level, required_level, catalog)
    for idx, c in enumerate(recommended, 1):
        print(f"  Course {idx}: [{c['channel']}] \"{c['name']}\"")
        print(f"             Level: {c['difficulty_level']} | Duration: {c['duration_hours']} hours | ID: {c['course_id']}")
        print(f"             Why: {c['reason']}")

    # -----------------------------------------------------------------------
    # PHASE 3: UPSKILLING & LEVEL UP
    # -----------------------------------------------------------------------
    print("\n" + "=" * 74)
    print("┌────────────────────────────────────────────────────────────────────────┐")
    print("│                    PHASE 3: UPSKILLING & LEVEL UP                      │")
    print("└────────────────────────────────────────────────────────────────────────┘")
    prescribed_course = recommended[0]
    print(f"\n[Step 7] Employee completes prescribed course: \"{prescribed_course['name']}\" (Level {prescribed_course['difficulty_level']})")
    print("  Status: Course Completed! 100% video lectures & practical exercises completed.")

    print(f"\n[Step 8] Member 3: Generating POST-QUIZ (Course Mastery Test for Level {required_level})...")
    post_quiz = [q for q in pre_quiz if q.difficulty == required_level]
    if not post_quiz:
        post_quiz = [pre_quiz[-1]]
    post_q = post_quiz[0]
    print(f"  Mastery Question: [Level {post_q.difficulty}] {post_q.prompt}")
    print(f"  Options: {post_q.options}")

    # Simulated candidate takes Post-Quiz and passes with flying colors!
    print("  Candidate submits answer: Option B (Stratified Random Sampling with Neyman Allocation)")
    post_answers = {post_q.question_id: post_q.correct_option}
    post_level, p_correct, p_total = evaluate_quiz([post_q], post_answers)

    print(f"\n[Step 9] Member 2: Post-Quiz Graded:")
    print(f"  Score: 1/1 (100%) - Candidate successfully demonstrated Level {required_level} mastery!")
    upgraded_level = required_level
    print(f"  🎉 UPGRADING CURRENT LEVEL: Level {true_level} ➔ Level {upgraded_level}!")

    # Final gap analysis
    final_gap = max(0, required_level - upgraded_level)
    print(f"\n[Step 10] Final Assessment & Dashboard State:")
    print(f"  Competency:     {target_skill}")
    print(f"  New Level:      Level {upgraded_level}")
    print(f"  Required Level: Level {required_level}")
    print(f"  Final Gap:      {final_gap} ➔ Status: [MEETS REQUIREMENT] ✅")
    print(f"  Dashboard Tag:  🟢 GREEN (Target Met for Designation: {role})")

    print("\n" + "#" * 74)
    print("                3-PHASE CLOSED-LOOP PIPELINE COMPLETED")
    print("#" * 74 + "\n")


if __name__ == "__main__":
    run_full_workflow()
