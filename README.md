# 🧠 AI Skill Assessment, Gap Analysis & Learning Bridge (PS 26101)

> **SIH 2026 Problem Statement PS 26101: AI Skill Intelligence & Learning Platform**  
> Aligned with India's **iGOT Karmayogi** civil service competency framework.

This repository powers **Member 2's AI Skill Assessment & Gap Analysis engine** and provides the **closed-loop integration bridge with Member 3 (Adaptive AI Quiz & Course Recommender)**.

---

## 🔄 Complete 3-Phase Closed-Loop Architecture

The platform operates across 3 interconnected phases to ensure evidence-backed, empirical civil service upskilling:

```
┌────────────────────────────────────────────────────────────────────────┐
│                     PHASE 1: DIAGNOSTIC BASELINE                       │
└────────────────────────────────────────────────────────────────────────┘
  1. User Profile / Resume Ingested
     ▼
  2. Member 2 (AI Skill Extractor):
     Uses Google Gemini to semantically extract competencies & claimed levels (1–5) with evidence.
     ▼
  3. Member 3 (Diagnostic Pre-Quiz):
     Generates an adaptive 5-question test across Levels 1–5 to verify the claim.
     ▼
  4. Member 2 (True Baseline Engine):
     Adjusts claimed level to empirical TRUE Current Level based on quiz performance.

                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     PHASE 2: PRESCRIPTION & COURSES                    │
└────────────────────────────────────────────────────────────────────────┘
  5. Member 2 (Gap Analyzer):
     Compares True Current Level vs. Benchmark Role Requirements (e.g. Statistical Officer).
     Calculates: Gap = max(0, Required - Current)
     Assigns Status: [MEETS REQUIREMENT], [NEEDS IMPROVEMENT], or [HIGH PRIORITY].
     ▼
  6. Member 3 (Course Recommender):
     Prescribes targeted courses from the official 50-course iGOT/NSSTA catalog
     strictly within the gap bracket: (Current_Level < Course_Level <= Required_Level).

                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     PHASE 3: UPSKILLING & LEVEL UP                     │
└────────────────────────────────────────────────────────────────────────┘
  7. Employee completes the prescribed course.
     ▼
  8. Member 3 (Course Mastery Post-Quiz):
     Generates a target-level mastery assessment test.
     ▼
  9. Member 2 (Competency Upgrade Engine):
     Employee passes mastery test (>= 60%) ➔ Level upgraded (e.g. Level 3 ➔ Level 4).
     ▼
 10. Dashboard Reflection:
     Final Gap becomes 0 ➔ Status turns to [MEETS REQUIREMENT] ➔ 🟢 GREEN Badge!
```

---

## 🎯 Key Features

1. **Semantic Taxonomy Alignment**:
   - Maps arbitrary resume text (`"NSS Survey Design"`, `"Team Supervision"`, `"e-Office"`) into official civil service competency rubrics (`Survey Design`, `Leadership`, `e-Governance Systems`) while preserving full traceability (`raw_skill -> mapped_competency -> level -> evidence`).
2. **True Empirical Verification (Pre-Quiz)**:
   - Prevents self-reporting bias by verifying claimed resume skills with adaptive multiple-choice diagnostic tests.
3. **Automated Gap Analysis**:
   - Benchmarks civil servants against 8 government designations (`Statistical Officer`, `Section Officer`, `Deputy Secretary`, `Data Analyst`, etc.).
4. **Targeted Course Prescription**:
   - Matches gaps directly to relevant courses from the 50-course iGOT Karmayogi & NSSTA catalogs.
5. **Verified Level Up (Post-Quiz)**:
   - Guarantees promotions and level upgrades are backed by verifiable post-course mastery evaluations.

---

## 📁 Repository Structure

```text
├── frontend/                        # Complete StatSkill React + Tailwind UI (Member 5)
│   ├── src/                         # TanStack Router, Recharts, Competency UI components
│   ├── public/                      # Static assets & government logos
│   ├── package.json                 # Frontend dependencies & build scripts
│   └── vite.config.ts               # Vite & Tailwind configuration
│
├── data/
│   ├── employees.json               # 25 real government employee profiles across ministries
│   ├── employee_requirement.json    # Benchmark role skill requirements across 8 designations
│   ├── competency_framework.json    # Official 4-category, 10-competency 1–5 level rubrics
│   └── courses.json                 # 50 iGOT Karmayogi & NSSTA course catalog entries
│
├── skill_extractor.py               # Gemini Flash-Lite semantic skill extractor & taxonomy mapper
├── skill_normalizer.py              # Acronym handler (SQL, ML, AI) and casing standardizer
├── gap_analyzer.py                  # Case-insensitive skill merger & gap calculator
├── data_loader.py                   # UTF-8 data loaders for all JSON datasets
│
├── statskill_backend.py             # Connected FastAPI REST server powering the React frontend
├── backend_server.py                # Member 4 backend router integration
├── main.py                          # Batch pipeline: processes all 25 employees
├── bridge_member3.py                # Direct connector to Member 3's Quiz & Recommendation API
├── workflow_3phase.py               # Full end-to-end 3-Phase Closed-Loop executable demo
├── web_app.py                       # Interactive Streamlit portal
│
├── requirements.txt                 # Python dependencies (FastAPI, Streamlit, google-genai)
├── .env.example                     # Environment template (API key placeholder)
└── .gitignore                       # Protects private .env, node_modules, and caches
```

---

## 🚀 Getting Started

### 1. Prerequisites & Installation

Clone the repository and install required packages:
```bash
git clone https://github.com/yash0026-vsf/skill_assessment_.git
cd skill_assessment_
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(You can obtain a free Gemini API key from [Google AI Studio](https://aistudio.google.com/)).*

---

## 💻 How to Run

### Option A: Run the Complete 3-Phase Closed-Loop Demo
Demonstrates the entire lifecycle: **Resume $\rightarrow$ Claimed Level $\rightarrow$ Pre-Quiz $\rightarrow$ True Level $\rightarrow$ Gap Analysis $\rightarrow$ Course Recommendation $\rightarrow$ Post-Quiz $\rightarrow$ Level Up (0 Gap)**:
```bash
python workflow_3phase.py
```

### Option B: Batch Process All 25 Employee Profiles
Extracts skills, maps to official competencies, and conducts gap analyses across all 25 government employees:
```bash
python main.py
```

### Option C: Run Member 2 $\leftrightarrow$ Member 3 Integration Bridge
Tests the API / local connector between Member 2 and Member 3:
```bash
python bridge_member3.py
```

---

## 🤝 Team Integration Matrix

| Module | Member | Responsibilities | Status |
|---|---|---|---|
| **Data & Taxonomy** | Member 1 | Employee datasets, iGOT course catalog, competency rubric | ✅ Integrated |
| **Skill Assessment & Gaps** | **Member 2 (This Repo)** | Resume extraction, semantic mapping, rule-based gap engine | ✅ Completed |
| **Quiz & Recommendations** | Member 3 | Adaptive pre/post quiz generator, course recommender API | ✅ Connected |
| **Backend & Dashboard** | Members 4 & 5 | Unified REST API & user interface | 🔄 Handoff Ready |

---

## 🛡️ Security & Privacy Note
- **Never commit `.env`** or API keys to any public repository.
- Personal data in `data/employees.json` is synthetic and strictly designed for testing and hackathon demonstration purposes.
