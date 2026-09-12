"""Backend Integration Server (FastAPI)
Brings the Backend API together with Member 2's AI Skill Assessment & Gap Analysis engine.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict

# Member 2 Modules
from data_loader import load_employees, load_requirements, load_courses
from skill_extractor import extract_skills
from skill_normalizer import normalize_extracted_skills
from gap_analyzer import merge_skills, calculate_skill_gaps

app = FastAPI(
    title="AI Skill Intelligence Platform - Connected Backend",
    description="Backend API integrated with Member 2 AI Assessment & Member 3/1 Datasets",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas (Matching backend models/schemas.py)
class SkillLevel(BaseModel):
    skill: str
    level: int

class AssessRequest(BaseModel):
    employee_id: str
    experience_text: str

class AssessResponse(BaseModel):
    employee_id: str
    extracted_skills: List[SkillLevel]

class SkillGap(BaseModel):
    skill: str
    current_level: int
    required_level: int
    gap: int

class GapAnalysisResponse(BaseModel):
    employee_id: str
    role: str
    gaps: List[SkillGap]

# In-memory datasets
EMPLOYEES = {e["employee_id"]: e for e in load_employees()}
REQUIREMENTS = load_requirements()
COURSES = load_courses()

@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "Connected Backend API (Member 2 + Backend)",
        "docs_url": "/docs"
    }

# 1. Connected /assess endpoint (Member 2 Real AI Extraction)
@app.post("/assess", response_model=AssessResponse, tags=["Assess"])
def assess_experience(request: AssessRequest):
    """Real AI Skill Extraction using Gemini LLM + Semantic Taxonomy Normalization."""
    text = request.experience_text.strip()
    if not text:
        return AssessResponse(employee_id=request.employee_id, extracted_skills=[])

    raw = extract_skills(text)
    normalized = normalize_extracted_skills(raw)

    skills_out = [
        SkillLevel(
            skill=item.get("mapped_competency") or item.get("raw_skill", item.get("skill")),
            level=int(item.get("level", 1))
        )
        for item in normalized
    ]
    return AssessResponse(employee_id=request.employee_id, extracted_skills=skills_out)

# 2. Connected /gap-analysis/{employee_id} endpoint (Member 2 Real Gap Engine)
@app.get("/gap-analysis/{employee_id}", response_model=GapAnalysisResponse, tags=["Gap Analysis"])
def gap_analysis(employee_id: str):
    """Real Skill Gap Analysis against role benchmarks."""
    emp = EMPLOYEES.get(employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee {employee_id} not found")

    role = emp.get("designation") or emp.get("current_role", "")
    required = REQUIREMENTS.get(role, {})
    existing = emp.get("existing_skills") or emp.get("quiz_assessed_skills") or {}

    calculated = calculate_skill_gaps(existing, required)
    gaps_out = [
        SkillGap(
            skill=c["skill"],
            current_level=c["current_level"],
            required_level=c["required_level"],
            gap=c["gap"]
        )
        for c in calculated
    ]
    return GapAnalysisResponse(employee_id=employee_id, role=role, gaps=gaps_out)

# 3. Recommendations endpoint (Catalog lookup)
@app.get("/recommendations/{employee_id}", tags=["Recommendations"])
def get_recommendations_for_employee(employee_id: str):
    emp = EMPLOYEES.get(employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee {employee_id} not found")

    role = emp.get("designation") or emp.get("current_role", "")
    required = REQUIREMENTS.get(role, {})
    existing = emp.get("existing_skills") or {}
    gaps = calculate_skill_gaps(existing, required)

    gapped_skills = {g["skill"]: g for g in gaps if g["gap"] > 0}
    recommended = []

    for c in COURSES:
        c_skills = c.get("competencies_v3", c.get("skills", []))
        diff = c.get("difficulty_level", 1)
        for s_name, g in gapped_skills.items():
            if any(s_name.lower() == s.lower() for s in c_skills) and (g["current_level"] < diff <= g["required_level"]):
                recommended.append({
                    "course_name": c.get("name"),
                    "skill": s_name,
                    "difficulty_level": diff,
                    "duration_hours": c.get("duration_hours", 0),
                    "channel": c.get("channel", "iGOT Karmayogi"),
                    "identifier": c.get("identifier")
                })
                break

    return {
        "employee_id": employee_id,
        "role": role,
        "recommended_courses": recommended
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
