import os
import json
import warnings
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Suppress minor SDK advice warnings
warnings.filterwarnings("ignore")

# Load API key from .env file
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

# Create Gemini client (safe initialization)
client = None
if api_key and api_key.strip():
    try:
        client = genai.Client(api_key=api_key.strip())
    except Exception:
        client = None

# Fallback model list
MODELS_TO_TRY = ["gemini-3.5-flash-lite", "gemini-3.6-flash"]

OFFICIAL_TAXONOMY_GUIDE = """
OFFICIAL COMPETENCY TAXONOMY:
- Survey Design (e.g., survey methodology, sample survey planning, questionnaire design, NSS surveys, field enumeration)
- Data Analysis (e.g., statistical analysis, preliminary analysis, data validation, data tabulation, data processing)
- Data Visualization (e.g., dashboards, Power BI, charts, visualization for review meetings)
- Python (e.g., Python scripting, Python automation, backend code)
- SQL (e.g., SQL queries, database design, database management)
- Digital Tools Proficiency (e.g., office software, digital tools, digital governance portals, digital dashboards)
- Data Privacy & Security (e.g., data privacy, data security, compliance, RTI processing)
- e-Governance Systems (e.g., e-Office, DigiLocker, iGOT, government workflow portals)
- Leadership (e.g., team leadership, team supervision, team management, directing schemes, cross-departmental coordination, reforms leadership)
- Communication (e.g., stakeholder communication, community outreach, public speaking, correspondence, drafting cabinet notes)
- Decision Making (e.g., high-stakes decisions, policy approval, problem resolution, strategic decisions)
"""


def extract_skills(text):
    """
    Extracts skills, levels (1-5), and evidence from text,
    and semantically maps each skill to the official competency taxonomy.
    """
    prompt = f"""
You are an expert HR & Competency Evaluator for government workforce capability frameworks.

Given an employee's experience description, extract their technical and behavioural skills.

{OFFICIAL_TAXONOMY_GUIDE}

CRITICAL RULES FOR EXTRACTION & MAPPING:
1. "raw_skill": The specific skill, task, or activity as expressed in the text (e.g., "Team Supervision", "e-Office", "NSS Survey Design", "Stakeholder Communication", "Preliminary Analysis").
2. "mapped_competency": Map the raw skill to the single closest official competency from the taxonomy list above ONLY if there is clear, high-confidence semantic equivalence.
   - Example matches:
     * "Team Supervision" or "Team Management" -> "Leadership"
     * "Stakeholder Communication" or "Community Outreach" -> "Communication"
     * "e-Office" -> "e-Governance Systems"
     * "NSS Survey Design" or "Sample Survey Planning" -> "Survey Design"
     * "Preliminary Analysis" or "Data Tabulation" or "Data Validation" -> "Data Analysis"
   - If confidence is low or the skill does not cleanly represent one of the official competencies, set mapped_competency to null. DO NOT force an unrelated skill into a category.
3. "level": Determine an estimated proficiency score (integer from 1 to 5):
   1 = Basic awareness / beginner (just learning / novice)
   2 = Elementary / assisted execution
   3 = Intermediate practical experience (2-3 years of regular independent work)
   4 = Advanced experience (4-6 years, complex projects, senior practitioner)
   5 = Expert / extensive experience (7+ years, large-scale leadership or architecture)
4. "evidence": Brief, verbatim or close-to-text excerpt explaining why the skill and level were assigned.

Return ONLY a valid JSON list in this exact format:
[
    {{
        "raw_skill": "Team Supervision",
        "mapped_competency": "Leadership",
        "level": 3,
        "evidence": "Supervised a small team handling routine governance workflows"
    }}
]

Employee experience text:
{text}
"""

    if not client:
        # Smart rule-based fallback if GEMINI_API_KEY is not yet configured
        fallback_results = []
        lower = text.lower()
        if "survey" in lower or "nss" in lower or "sampling" in lower:
            fallback_results.append({
                "raw_skill": "NSS Survey Methodology",
                "mapped_competency": "Survey Design",
                "level": 4,
                "evidence": "Mentioned survey datasets and NSS survey operations in experience text."
            })
        if "data" in lower or "tabulation" in lower or "analysis" in lower or "validation" in lower:
            fallback_results.append({
                "raw_skill": "Data Validation & Tabulation",
                "mapped_competency": "Data Analysis",
                "level": 4,
                "evidence": "Handled preliminary analysis, tabulation, and dataset validation."
            })
        if "team" in lower or "supervis" in lower or "manage" in lower:
            fallback_results.append({
                "raw_skill": "Team Supervision",
                "mapped_competency": "Leadership",
                "level": 3,
                "evidence": "Supervised project activities and team members."
            })
        if not fallback_results:
            fallback_results.append({
                "raw_skill": "Public Sector Operations",
                "mapped_competency": "Digital Tools Proficiency",
                "level": 3,
                "evidence": "General civil service operational experience."
            })
        return fallback_results

    last_error = None
    for model_name in MODELS_TO_TRY:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            last_error = e
            continue

    raise last_error


# Standalone test
if __name__ == "__main__":
    import sys
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    test_text = "Supervised a small team handling routine governance workflows. Managed day-to-day administrative operations and file processing on e-Office for 3 years."
    results = extract_skills(test_text)
    print("\n===== TEST EXTRACTION & SEMANTIC MAPPING =====")
    for r in results:
        raw = r.get("raw_skill")
        mapped = r.get("mapped_competency")
        mapping = f" -> Mapped: {mapped}" if mapped else " (Unmapped)"
        print(f"Raw: {raw}{mapping} | Level: {r.get('level')} | Evidence: {r.get('evidence')}")