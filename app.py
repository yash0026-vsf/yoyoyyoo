"""Skill Intelligence API - Official Government Competency Platform (SIH 2026).

Role 3 Module for AI Skill Intelligence & Learning Platform (PS 26101).
Integrated with official Ministry Competency Framework and Employee Profiles:
- 4 Competency Domains (Statistical, Technical, Digital Governance, Behavioural)
- 10 Skills with Level 1-5 Rubric Definitions
- 25 Government Employee Profiles (E001 to E025) across Ministries
- Adaptive AI Quiz Generator (Levels 1-5) & Empirical Gap Scoring
- Targeted Government & Technical Course Roadmap (iGOT / Public Sector aligned)
"""
from __future__ import annotations

import hashlib
import json
import logging
import os
import re
import uuid
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("skill_intelligence")

app = FastAPI(
    title="AI Skill Intelligence API (SIH 2026 - PS 26101)",
    description="Adaptive AI Quiz Generator, Government Competency Gap Assessment & Course Recommender.",
    version="2.2.0",
)

# ---------------------------------------------------------------------------
# CORS Configuration (Enables Frontend Integration)
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Dataset Loaders (Competency Framework, Employees, Role Requirements)
# ---------------------------------------------------------------------------
DATA_DIR = Path("data")

def load_json_file(filename: str, default: dict | list):
    filepath = DATA_DIR / filename
    if filepath.exists():
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load {filepath}: {e}")
    return default

COMPETENCY_FRAMEWORK: dict = load_json_file("competency_framework.json", {})
EMPLOYEES_LIST: list[dict] = load_json_file("employees.json", [])
EMPLOYEES_DB: dict[str, dict] = {emp["employee_id"]: emp for emp in EMPLOYEES_LIST}
ROLE_REQUIREMENTS: dict[str, dict[str, int]] = load_json_file("employee_requirement.json", {
    "Statistical Officer": {"Survey Design": 4, "Data Analysis": 4, "Python": 2, "Communication": 3},
    "Programme Officer": {"Communication": 4, "Leadership": 3, "e-Governance Systems": 3},
    "Data Analyst (Govt.)": {"Python": 4, "SQL": 4, "Data Visualization": 4, "Data Analysis": 4},
    "Section Officer": {"e-Governance Systems": 3, "Decision Making": 3, "Communication": 3},
    "Deputy Secretary": {"Leadership": 4, "Decision Making": 4, "e-Governance Systems": 3},
    "Under Secretary": {"Decision Making": 4, "Leadership": 3, "Communication": 4},
    "Joint Secretary": {"Leadership": 5, "Decision Making": 5, "Communication": 5},
    "Assistant Director": {"Data Analysis": 3, "Digital Tools Proficiency": 3, "Communication": 3},
    "Data Analyst": {"Python": 3, "Data Analysis": 4, "Survey Design": 3, "Statistical Analysis": 4, "SQL": 3},
    "Data Scientist": {"Python": 4, "Machine Learning": 4, "Statistical Analysis": 4, "SQL": 3, "Deep Learning": 3},
    "Software Engineer": {"Python": 4, "SQL": 3, "Data Structures": 4, "System Design": 3, "FastAPI": 3},
})


# ---------------------------------------------------------------------------
# Gemini Client Initialization
# ---------------------------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_client = None
MODELS_TO_TRY = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]

if GEMINI_API_KEY and GEMINI_API_KEY.strip() and GEMINI_API_KEY != "your_actual_gemini_api_key_here":
    try:
        from google import genai
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        logger.info("[AI] Google Gemini client initialized successfully.")
    except Exception as exc:
        logger.warning(f"[AI] Gemini client error: {exc}. Using curated bank.")
else:
    logger.info("[AI] Running in local mode with curated question bank & competency rubrics.")


# ---------------------------------------------------------------------------
# Course Catalogue Aligned with Government Competency Framework & iGOT
# ---------------------------------------------------------------------------
COURSES = [
    # --- Statistical Skills ---
    {"course_id": "sd-101", "name": "Introduction to Survey Concepts & Data Collection", "skills": ["Survey Design"], "difficulty_level": 1, "duration_hours": 6, "provider": "MoSPI / iGOT", "description": "Fundamentals of questionnaires, enumerator guidelines, and field data collection."},
    {"course_id": "sd-201", "name": "Survey Instrument Design & Field Practices", "skills": ["Survey Design"], "difficulty_level": 2, "duration_hours": 10, "provider": "MoSPI / iGOT", "description": "Formulating question sets, field testing, and supervised enumerator workflows."},
    {"course_id": "sd-301", "name": "Independent Survey Sampling & Methodology", "skills": ["Survey Design"], "difficulty_level": 3, "duration_hours": 15, "provider": "MoSPI / iGOT", "description": "Stratified random sampling, questionnaire validation, and survey execution."},
    {"course_id": "sd-401", "name": "NSS Survey Methodology & Multi-Region Design", "skills": ["Survey Design"], "difficulty_level": 4, "duration_hours": 20, "provider": "MoSPI", "description": "Nationwide survey design, multi-stage sampling frames, and quality audits."},
    {"course_id": "sd-501", "name": "National Survey Methodology Architecture & Masterclass", "skills": ["Survey Design"], "difficulty_level": 5, "duration_hours": 24, "provider": "MoSPI / UN-DESA", "description": "Designing national statistical frameworks, enumerator training systems, and global standards."},

    {"course_id": "da-101", "name": "Basic Numeracy & Tabular Statistics for Officers", "skills": ["Data Analysis"], "difficulty_level": 1, "duration_hours": 6, "provider": "iGOT Karmayogi", "description": "Reading summary tables, percentages, ratios, and interpreting administrative figures."},
    {"course_id": "da-201", "name": "Descriptive Data Analysis & Tabulation", "skills": ["Data Analysis"], "difficulty_level": 2, "duration_hours": 8, "provider": "iGOT Karmayogi", "description": "Summary statistics, variance analysis, and reporting tables."},
    {"course_id": "da-301", "name": "Applied Data Analysis & Statistical Inferences", "skills": ["Data Analysis"], "difficulty_level": 3, "duration_hours": 12, "provider": "iGOT Karmayogi", "description": "Correlation, regression models, hypothesis tests, and administrative insights."},
    {"course_id": "da-401", "name": "Advanced Econometrics & Sampling Theory", "skills": ["Data Analysis"], "difficulty_level": 4, "duration_hours": 18, "provider": "National Statistical Systems Training", "description": "Sampling theory, panel data regressions, and policy modeling."},
    {"course_id": "da-501", "name": "National Analytical Frameworks & Policy Impact Modeling", "skills": ["Data Analysis"], "difficulty_level": 5, "duration_hours": 24, "provider": "NITI Aayog / MoSPI", "description": "Designing nationwide analytical frameworks and econometrics for public policy."},

    {"course_id": "dv-101", "name": "Introduction to Graphical Reporting & Charts", "skills": ["Data Visualization"], "difficulty_level": 1, "duration_hours": 4, "provider": "iGOT Karmayogi", "description": "Basic bar charts, line graphs, and report presentations."},
    {"course_id": "dv-201", "name": "Data Visualization Essentials with Excel", "skills": ["Data Visualization"], "difficulty_level": 2, "duration_hours": 6, "provider": "iGOT Karmayogi", "description": "Pivot tables, distribution histograms, and report charts."},
    {"course_id": "dv-301", "name": "BI Dashboards for Public Administration", "skills": ["Data Visualization"], "difficulty_level": 3, "duration_hours": 10, "provider": "NIC / MeitY", "description": "Building interactive dashboards and KPI tracking for ministries."},
    {"course_id": "dv-401", "name": "Executive Visualization Standards & Reporting", "skills": ["Data Visualization"], "difficulty_level": 4, "duration_hours": 14, "provider": "MeitY", "description": "Ministry-level review dashboards and visualization standards."},
    {"course_id": "dv-501", "name": "Enterprise Dashboard Architecture & Interactive Analytics", "skills": ["Data Visualization"], "difficulty_level": 5, "duration_hours": 20, "provider": "MeitY", "description": "Large-scale interactive analytics architecture for nationwide mission monitoring."},

    # --- Technical Skills ---
    {"course_id": "py-101", "name": "Python Foundations & Basics", "skills": ["Python"], "difficulty_level": 1, "duration_hours": 6, "provider": "NIC / iGOT", "description": "Python syntax fundamentals, data types, and setting up the Python environment."},
    {"course_id": "py-201", "name": "Basic Python for Officers", "skills": ["Python"], "difficulty_level": 2, "duration_hours": 10, "provider": "National Informatics Centre (NIC)", "description": "Python syntax, control structures, and basic automation scripts."},
    {"course_id": "py-301", "name": "Python for Administrative Data Processing", "skills": ["Python"], "difficulty_level": 3, "duration_hours": 14, "provider": "NIC", "description": "Pandas dataframes, CSV/Excel parsing, data cleaning, and reporting."},
    {"course_id": "py-401", "name": "Production-Grade Python & Analytics Pipelines", "skills": ["Python"], "difficulty_level": 4, "duration_hours": 18, "provider": "MeitY / Digital India", "description": "Developing robust Python applications and automated ETL workflows."},
    {"course_id": "py-501", "name": "Enterprise Python Architecture & High Performance Systems", "skills": ["Python"], "difficulty_level": 5, "duration_hours": 24, "provider": "NIC / MeitY", "description": "Architecting mission-critical Python systems, concurrency, and security."},

    {"course_id": "sql-101", "name": "Introduction to Database Tables & Queries", "skills": ["SQL"], "difficulty_level": 1, "duration_hours": 6, "provider": "NIC / iGOT", "description": "Understanding relational tables, records, fields, and simple SELECT statements."},
    {"course_id": "sql-201", "name": "SQL Querying Essentials for Public Databases", "skills": ["SQL"], "difficulty_level": 2, "duration_hours": 8, "provider": "NIC", "description": "SELECT queries, filtering, aggregation, and basic table relationships."},
    {"course_id": "sql-301", "name": "Intermediate SQL: Joins, CTEs & Aggregations", "skills": ["SQL"], "difficulty_level": 3, "duration_hours": 12, "provider": "NIC", "description": "Multi-table joins, subqueries, and administrative reporting queries."},
    {"course_id": "sql-401", "name": "Advanced SQL & Database Performance Tuning", "skills": ["SQL"], "difficulty_level": 4, "duration_hours": 16, "provider": "NIC", "description": "Window functions, schema design, index optimization, and query plans."},
    {"course_id": "sql-501", "name": "National Database Architecture & Scalability Tuning", "skills": ["SQL"], "difficulty_level": 5, "duration_hours": 24, "provider": "NIC", "description": "Distributed database schemas, partition strategies, and high-concurrency optimization."},

    {"course_id": "dt-101", "name": "Office Productivity & Basic Digital Literacy", "skills": ["Digital Tools Proficiency"], "difficulty_level": 1, "duration_hours": 4, "provider": "iGOT Karmayogi", "description": "Word processing, spreadsheet basics, email etiquette, and cyber security."},
    {"course_id": "dt-201", "name": "Digital India Portals & Workflow Orientation", "skills": ["Digital Tools Proficiency"], "difficulty_level": 2, "duration_hours": 6, "provider": "Digital India", "description": "Operating standard government e-portals and reporting interfaces."},
    {"course_id": "dt-301", "name": "Advanced Public Digital Platforms & Workflows", "skills": ["Digital Tools Proficiency"], "difficulty_level": 3, "duration_hours": 10, "provider": "iGOT Karmayogi", "description": "Inter-departmental digital tools, file tracking, and MIS portals."},
    {"course_id": "dt-401", "name": "Digital Tool Mentorship & Departmental Training", "skills": ["Digital Tools Proficiency"], "difficulty_level": 4, "duration_hours": 14, "provider": "Digital India", "description": "Training staff on modern digital workflows and operational troubleshooting."},
    {"course_id": "dt-501", "name": "National Digital Strategy & Platform Adoption", "skills": ["Digital Tools Proficiency"], "difficulty_level": 5, "duration_hours": 20, "provider": "MeitY", "description": "Formulating department-wide digital transformation strategies and governance."},

    # --- Digital Governance Skills ---
    {"course_id": "dp-101", "name": "Cyber Hygiene & Data Security Awareness", "skills": ["Data Privacy & Security"], "difficulty_level": 1, "duration_hours": 4, "provider": "CERT-In / iGOT", "description": "Basic cyber awareness, phishing defense, password safety, and device security."},
    {"course_id": "dp-201", "name": "Data Privacy & Information Security Basics", "skills": ["Data Privacy & Security"], "difficulty_level": 2, "duration_hours": 6, "provider": "CERT-In / MeitY", "description": "DPDP Act awareness, classification of sensitive information, and password hygiene."},
    {"course_id": "dp-301", "name": "Data Privacy Norms in Public Sector Workflows", "skills": ["Data Privacy & Security"], "difficulty_level": 3, "duration_hours": 10, "provider": "MeitY", "description": "Applying data privacy standards, anonymization, and handling citizen records."},
    {"course_id": "dp-401", "name": "Government Data Auditing & Compliance", "skills": ["Data Privacy & Security"], "difficulty_level": 4, "duration_hours": 14, "provider": "MeitY / CERT-In", "description": "Process auditing for regulatory compliance and security vulnerability assessment."},
    {"course_id": "dp-501", "name": "National Data Governance Policy & Privacy Architecture", "skills": ["Data Privacy & Security"], "difficulty_level": 5, "duration_hours": 22, "provider": "MeitY / Cabinet Secretariat", "description": "Designing statutory compliance frameworks, regulatory oversight, and privacy policies."},

    {"course_id": "eg-101", "name": "Overview of Digital Governance & Citizen Delivery", "skills": ["e-Governance Systems"], "difficulty_level": 1, "duration_hours": 4, "provider": "Digital India", "description": "Introduction to citizen services, e-Kranti pillars, and electronic service delivery."},
    {"course_id": "eg-201", "name": "e-Office Systems Training", "skills": ["e-Governance Systems"], "difficulty_level": 2, "duration_hours": 8, "provider": "NIC / DARPG", "description": "File management, receipt dispatch, and digital signature integration on e-Office."},
    {"course_id": "eg-301", "name": "Integrated e-Governance Platforms (iGOT, DigiLocker)", "skills": ["e-Governance Systems"], "difficulty_level": 3, "duration_hours": 12, "provider": "Digital India", "description": "Operating multiple national platforms and coordinating scheme deliverables."},
    {"course_id": "eg-401", "name": "Administration & Management of e-Governance Systems", "skills": ["e-Governance Systems"], "difficulty_level": 4, "duration_hours": 16, "provider": "MeitY", "description": "System administration, stakeholder onboarding, and workflow customization."},
    {"course_id": "eg-501", "name": "Enterprise e-Governance Architecture & Interoperability", "skills": ["e-Governance Systems"], "difficulty_level": 5, "duration_hours": 24, "provider": "MeitY / Digital India", "description": "Designing national API frameworks, cloud infrastructure, and interoperability standards."},

    # --- Behavioural Skills ---
    {"course_id": "lead-101", "name": "Self-Management & Individual Excellence in Public Service", "skills": ["Leadership"], "difficulty_level": 1, "duration_hours": 6, "provider": "DoPT / iGOT", "description": "Personal accountability, time management, and proactive task delivery."},
    {"course_id": "lead-201", "name": "Task Coordination & Team Leadership", "skills": ["Leadership"], "difficulty_level": 2, "duration_hours": 8, "provider": "DoPT / iGOT", "description": "Leading small project tasks, coordinating team handoffs, and peer support."},
    {"course_id": "lead-301", "name": "Leadership & Project Management for Public Sector", "skills": ["Leadership"], "difficulty_level": 3, "duration_hours": 14, "provider": "DoPT / iGOT", "description": "Managing field implementation teams and handling operational roadblocks."},
    {"course_id": "lead-401", "name": "Leadership Development Programme (Cross-Departmental)", "skills": ["Leadership"], "difficulty_level": 4, "duration_hours": 20, "provider": "DoPT", "description": "Leading cross-ministry initiatives and driving flagship scheme implementation."},
    {"course_id": "lead-501", "name": "Strategic Leadership & Institutional Vision", "skills": ["Leadership"], "difficulty_level": 5, "duration_hours": 24, "provider": "DoPT", "description": "Setting organizational vision, policy reform, and national strategy formulation."},

    {"course_id": "comm-101", "name": "Official Drafting & Reporting Essentials", "skills": ["Communication"], "difficulty_level": 1, "duration_hours": 6, "provider": "ISTM", "description": "Standard written communication, office memos, and clarity in official reporting."},
    {"course_id": "comm-201", "name": "RTI Act & Official Communication Procedures", "skills": ["Communication"], "difficulty_level": 2, "duration_hours": 8, "provider": "DoPT / ISTM", "description": "Routine government correspondence, file notings, and handling RTI responses."},
    {"course_id": "comm-301", "name": "Effective Stakeholder & Inter-Departmental Communication", "skills": ["Communication"], "difficulty_level": 3, "duration_hours": 12, "provider": "ISTM", "description": "Drafting briefs, presenting complex scheme updates, and stakeholder outreach."},
    {"course_id": "comm-401", "name": "Cabinet Notes & High-Stakes Public Communications", "skills": ["Communication"], "difficulty_level": 4, "duration_hours": 16, "provider": "ISTM / Cabinet Secretariat", "description": "Reviewing cabinet notes, inter-ministerial memoranda, and press releases."},
    {"course_id": "comm-501", "name": "Executive Spokesperson & Crisis Communication Masterclass", "skills": ["Communication"], "difficulty_level": 5, "duration_hours": 20, "provider": "Cabinet Secretariat", "description": "Public media briefings, crisis communication management, and stakeholder diplomacy."},

    {"course_id": "dm-101", "name": "Rules of Business & Administrative Procedures", "skills": ["Decision Making"], "difficulty_level": 1, "duration_hours": 6, "provider": "DoPT / ISTM", "description": "Understanding delegation of financial and administrative powers and office manuals."},
    {"course_id": "dm-201", "name": "Routine Administrative Decision Making & Precedent Analysis", "skills": ["Decision Making"], "difficulty_level": 2, "duration_hours": 8, "provider": "DoPT", "description": "Applying rules to clear routine casework and resolving file ambiguities."},
    {"course_id": "dm-301", "name": "Decision Making under Administrative Ambiguity", "skills": ["Decision Making"], "difficulty_level": 3, "duration_hours": 10, "provider": "DoPT", "description": "Evaluating operational tradeoffs, scheme guidelines, and risk factors."},
    {"course_id": "dm-401", "name": "High-Impact Public Policy Decision Making", "skills": ["Decision Making"], "difficulty_level": 4, "duration_hours": 16, "provider": "DoPT / NITI Aayog", "description": "Making policy roll-out decisions, budget management, and contingency planning."},
    {"course_id": "dm-501", "name": "National Strategic Policy Decision Frameworks", "skills": ["Decision Making"], "difficulty_level": 5, "duration_hours": 24, "provider": "NITI Aayog / Cabinet Secretariat", "description": "Formulating governance decision-making frameworks, risk management, and regulatory design."},
]


# ---------------------------------------------------------------------------
# Data Models & Fingerprinting
# ---------------------------------------------------------------------------
@dataclass(frozen=True)
class Question:
    question_id: str
    skill: str
    difficulty: int
    prompt: str
    options: list[str]
    correct_option: int
    explanation: str

    @property
    def fingerprint(self) -> str:
        normalized = re.sub(r"\W+", "", self.prompt.lower())
        return hashlib.sha256(f"{self.skill.lower()}:{normalized}".encode()).hexdigest()


# ---------------------------------------------------------------------------
# Curated Question Bank Covering Rubric Skills (Levels 1 to 5)
# ---------------------------------------------------------------------------
QUESTION_BANK: list[Question] = [
    # Python
    Question("py-1a", "Python", 1, "Which symbol starts a single-line Python comment?", ["#", "//", "<!--", "*"], 0, "Python comments start with #."),
    Question("py-2a", "Python", 2, "What does len([10, 20, 30]) return?", ["2", "3", "30", "Error"], 1, "The list contains three items."),
    Question("py-3a", "Python", 3, "What does a Python dictionary store?", ["Only numbers", "Key-value pairs", "Only text", "Sorted files"], 1, "Dictionaries map unique keys to values."),
    Question("py-4a", "Python", 4, "What is a generator expression mainly useful for?", ["Creating classes", "Memory-efficient lazy iteration", "Writing files", "Installing packages"], 1, "Generators produce items on-demand, conserving RAM."),
    Question("py-5a", "Python", 5, "Which dual magic methods define the Python Context Manager protocol?", ["__enter__ and __exit__", "__init__ and __str__", "__iter__ and __next__", "__get__ and __set__"], 0, "Context managers implement __enter__ and __exit__."),

    # SQL
    Question("sql-1a", "SQL", 1, "Which SQL command is used to read data from a table?", ["GET", "SELECT", "READ", "PULL"], 1, "SELECT retrieves data."),
    Question("sql-2a", "SQL", 2, "Which clause filters rows BEFORE grouping occurs in SQL?", ["WHERE", "HAVING", "ORDER BY", "LIMIT"], 0, "WHERE filters individual rows before GROUP BY aggregation."),
    Question("sql-3a", "SQL", 3, "Which JOIN retains all rows from the left table regardless of a match?", ["INNER JOIN", "RIGHT JOIN", "LEFT JOIN", "CROSS JOIN"], 2, "LEFT JOIN preserves left-table rows."),
    Question("sql-4a", "SQL", 4, "Which feature computes ranks or running totals without collapsing rows?", ["GROUP BY", "Window function (OVER)", "DELETE", "DISTINCT"], 1, "Window functions compute across sets of rows while preserving each individual row."),
    Question("sql-5a", "SQL", 5, "What is a Common Table Expression (CTE) defined with?", ["DEFINE TABLE", "WITH", "CREATE CTE", "TEMPORARY"], 1, "A CTE is defined using the WITH statement."),

    # Survey Design
    Question("sd-1a", "Survey Design", 1, "What is a questionnaire pre-test (pilot survey) primarily conducted for?", ["To publish final findings", "To identify confusing questions and check response feasibility", "To replace enumerator training", "To calculate final sampling weights"], 1, "Pre-testing checks question clarity and field viability."),
    Question("sd-2a", "Survey Design", 2, "What is the primary difference between open-ended and closed-ended survey questions?", ["Closed-ended questions provide pre-defined answer choices", "Open-ended questions cannot be answered in words", "Closed-ended questions take longer to code", "Open-ended questions are never used in surveys"], 0, "Closed-ended questions offer structured, pre-defined response categories."),
    Question("sd-3a", "Survey Design", 3, "When conducting a stratified random sample, how are subgroups (strata) formed?", ["Randomly without criteria", "By grouping homogeneous units sharing specific characteristics", "By selecting only the largest administrative districts", "By convenience sampling"], 1, "Strata group units with similar characteristics to reduce variance."),
    Question("sd-4a", "Survey Design", 4, "In large-scale nationwide surveys (like NSS), what is the main purpose of multi-stage sampling?", ["To eliminate all sampling errors", "To construct a feasible sampling frame when a full listing of all households is impractical", "To avoid collecting demographic data", "To ensure only urban areas are surveyed"], 1, "Multi-stage sampling allows sampling primary units (villages/blocks) before listing households."),
    Question("sd-5a", "Survey Design", 5, "What is the design effect (Deff) in survey methodology?", ["The ratio of variance of an estimator under complex design to simple random sampling", "The time taken to administer a survey", "The total number of survey enumerators", "The cost per completed survey schedule"], 0, "Design effect measures variance inflation due to clustering and stratification compared to SRS."),

    # Data Analysis
    Question("da-1a", "Data Analysis", 1, "What does the median of an ordered dataset represent?", ["The most frequent value", "The middle value separating the higher half from the lower half", "The arithmetic average", "The difference between maximum and minimum"], 1, "The median divides ordered data into two equal halves."),
    Question("da-2a", "Data Analysis", 2, "Which metric is least affected by extreme outliers in skewed income distributions?", ["Mean", "Median", "Standard deviation", "Variance"], 1, "The median is robust against extreme values."),
    Question("da-3a", "Data Analysis", 3, "What does a correlation coefficient of r = 0.85 between two variables indicate?", ["No relationship", "A strong positive linear association", "A strong negative linear association", "One variable causes the other"], 1, "0.85 indicates a strong positive linear relationship."),
    Question("da-4a", "Data Analysis", 4, "In ordinary least squares (OLS) multiple regression, what does the R-squared value represent?", ["The percentage of variation in the dependent variable explained by the independent variables", "The standard deviation of residuals", "The statistical significance of the intercept", "The sample size"], 0, "R-squared measures the proportion of variance explained by model predictors."),
    Question("da-5a", "Data Analysis", 5, "What is the primary purpose of applying survey sampling weights during tabulation?", ["To standardize font sizes in reports", "To ensure sample estimates accurately reflect the target population distribution", "To hide non-response rates", "To increase the sample size artificially"], 1, "Weights adjust for unequal selection probabilities and non-response."),

    # e-Governance Systems
    Question("eg-1a", "e-Governance Systems", 1, "What is the primary purpose of the DigiLocker platform in India?", ["Online gaming", "Secure cloud issuance, verification, and sharing of authentic digital documents", "E-commerce shopping", "Social media streaming"], 1, "DigiLocker enables paperless digital document verification."),
    Question("eg-2a", "e-Governance Systems", 2, "In the government e-Office workflow, what does DSC stand for?", ["Data Storage Controller", "Digital Signature Certificate", "Direct Sector Code", "Digital Security Clearance"], 1, "DSC stands for Digital Signature Certificate used for authenticating files."),
    Question("eg-3a", "e-Governance Systems", 3, "What is the main objective of the iGOT Karmayogi platform?", ["Tax collection", "Online competency-based capacity building for civil servants", "Railway ticket reservation", "Passport application submission"], 1, "iGOT Karmayogi is the national competency-based training portal for government officials."),
    Question("eg-4a", "e-Governance Systems", 4, "What does an API gateway ensure when integrating diverse ministerial portals?", ["Replaces databases", "Centralizes authentication, rate limiting, and secure data exchange between disparate systems", "Manages printer drivers", "Generates Excel files"], 1, "An API gateway securely orchestrates data exchange between microservices."),
    Question("eg-5a", "e-Governance Systems", 5, "In enterprise e-governance architecture, what is the core benefit of adopting open standards and interoperability frameworks?", ["Vendor lock-in", "Seamless cross-departmental data exchange without proprietary dependencies", "Requiring paper backups", "Slow release cycles"], 1, "Interoperability allows seamless cross-agency integration without vendor lock-in."),

    # Data Privacy & Security
    Question("dp-1a", "Data Privacy & Security", 1, "Why should sensitive citizen records (such as Aadhaar or health data) be encrypted at rest?", ["To make file sizes smaller", "To prevent unauthorized access even if the underlying storage media is compromised", "To speed up internet downloads", "To allow public search engines to read them"], 1, "Encryption at rest safeguards data from unauthorized access if physical storage is breached."),
    Question("dp-2a", "Data Privacy & Security", 2, "Under the Digital Personal Data Protection (DPDP) Act, what is a Data Principal?", ["The government entity processing data", "The individual citizen to whom the personal data relates", "The cloud hosting provider", "The software vendor"], 1, "The Data Principal is the individual whose personal data is processed."),
    Question("dp-3a", "Data Privacy & Security", 3, "What is data anonymization in public sector reporting?", ["Deleting all datasets permanently", "Irreversibly removing personally identifiable information so individuals cannot be re-identified", "Writing files in uppercase", "Publishing raw phone numbers"], 1, "Anonymization removes personal identifiers to protect privacy in published datasets."),
    Question("dp-4a", "Data Privacy & Security", 4, "What is the principle of 'Data Minimization' in privacy governance?", ["Collecting only the personal data strictly necessary for the specified purpose", "Storing data on miniature USB drives", "Minimizing the number of computers in an office", "Limiting reports to one page"], 0, "Data minimization requires collecting only what is strictly necessary."),
    Question("dp-5a", "Data Privacy & Security", 5, "In a privacy impact audit, what is the primary risk addressed by differential privacy techniques?", ["Slow network queries", "Preventing reconstruction of individual records from published aggregate statistical queries", "Hard drive failure", "CSS formatting bugs"], 1, "Differential privacy injects calibrated noise to prevent inferring individual records from aggregate statistics."),
]

QUIZ_HISTORY: dict[tuple[str, str], set[str]] = defaultdict(set)
QUIZZES: dict[str, list[Question]] = {}


# ---------------------------------------------------------------------------
# Dynamic AI Question Generation (Gemini 2.5 Flash)
# ---------------------------------------------------------------------------
def generate_questions_with_gemini(skill: str, levels: list[int]) -> list[Question]:
    """Generates novel multiple-choice questions on-the-fly using Google Gemini."""
    if not gemini_client:
        return []

    # Check if rubric description exists in COMPETENCY_FRAMEWORK
    rubric_hints = ""
    for domain, skills_dict in COMPETENCY_FRAMEWORK.items():
        if skill in skills_dict:
            rubric_hints = f"Rubric definitions for this skill:\n" + "\n".join([f"Level {lvl}: {desc}" for lvl, desc in skills_dict[skill].items()])
            break

    prompt = f"""You are an expert technical and governance interviewer designing a standardized evaluation test for the skill: '{skill}'.
Generate exactly {len(levels)} multiple-choice question(s), one for each difficulty level listed in: {levels}.

{rubric_hints}

Return ONLY a valid JSON array in this exact format:
[
  {{
    "difficulty": 1,
    "prompt": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_option": 0,
    "explanation": "Why this option is correct."
  }}
]

Rules:
- Exactly 4 options per question.
- 'correct_option' must be the 0-indexed integer (0, 1, 2, or 3).
- Output must be strict JSON with no markdown fences or preamble.
"""
    for model_name in MODELS_TO_TRY:
        try:
            response = gemini_client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            raw_text = response.text.strip()
            clean_json = re.sub(r"^```(?:json)?\s*", "", raw_text)
            clean_json = re.sub(r"\s*```$", "", clean_json).strip()
            
            data = json.loads(clean_json)
            generated: list[Question] = []
            for item in data:
                q_id = f"ai-{skill.lower()[:3]}-{item.get('difficulty', 1)}-{uuid.uuid4().hex[:6]}"
                q = Question(
                    question_id=q_id,
                    skill=skill,
                    difficulty=int(item["difficulty"]),
                    prompt=item["prompt"],
                    options=list(item["options"]),
                    correct_option=int(item["correct_option"]),
                    explanation=item.get("explanation", "Correct choice."),
                )
                generated.append(q)
            logger.info(f"[AI] Successfully generated {len(generated)} questions for {skill} using {model_name}.")
            return generated
        except Exception as exc:
            logger.warning(f"[AI] Generation with {model_name} failed: {exc}. Trying next model...")

    return []


# ---------------------------------------------------------------------------
# Quiz Generation & Scoring Logic
# ---------------------------------------------------------------------------
def questions_for_new_quiz(employee_id: str, skill: str, count: int) -> list[Question]:
    available = [q for q in QUESTION_BANK if q.skill.lower() == skill.lower()]
    seen = QUIZ_HISTORY[(employee_id, skill.lower())]
    fresh = [q for q in available if q.fingerprint not in seen]

    # If the static bank doesn't have enough unseen questions, generate dynamically with Gemini!
    if len(fresh) < count and gemini_client:
        needed_levels = []
        for level in range(1, 6):
            if not any(q.difficulty == level for q in fresh):
                needed_levels.append(level)
        while len(needed_levels) < (count - len(fresh)):
            needed_levels.append((len(needed_levels) % 5) + 1)

        ai_questions = generate_questions_with_gemini(skill, needed_levels)
        for q in ai_questions:
            if q.fingerprint not in seen:
                QUESTION_BANK.append(q)
                fresh.append(q)

    if not fresh:
        raise HTTPException(
            404,
            f"No questions available for skill '{skill}'. Please check spelling or configure GEMINI_API_KEY in .env for on-the-fly generation."
        )

    # Prioritize 1 question from each difficulty level first
    chosen: list[Question] = []
    for level in range(1, 6):
        match = next((q for q in fresh if q.difficulty == level), None)
        if match and len(chosen) < count:
            chosen.append(match)

    for q in fresh:
        if q not in chosen and len(chosen) < count:
            chosen.append(q)

    return chosen[:count]


def level_from_answers(questions: list[Question], answers: list[Answer]) -> tuple[int, int, int]:
    answer_map = {answer.question_id: answer.selected_option for answer in answers}
    correct_by_level = defaultdict(int)
    asked_by_level = defaultdict(int)
    total_correct = 0

    for question in questions:
        asked_by_level[question.difficulty] += 1
        if answer_map.get(question.question_id) == question.correct_option:
            total_correct += 1
            correct_by_level[question.difficulty] += 1

    # Competency is the highest difficulty level where the candidate achieved >= 60% accuracy
    level = 1
    for difficulty in range(1, 6):
        if asked_by_level[difficulty] and (correct_by_level[difficulty] / asked_by_level[difficulty]) >= 0.60:
            level = difficulty

    return level, total_correct, len(questions)


def recommend(skill: str, current_level: int, required_level: int) -> list[dict]:
    if current_level >= required_level:
        return []
    candidates = [c for c in COURSES if skill.lower() in [s.lower() for s in c["skills"]]]
    useful = [c for c in candidates if current_level < c["difficulty_level"] <= required_level]
    useful.sort(key=lambda c: c["difficulty_level"])
    return [
        {
            **c,
            "reason": f"Bridges gap from Level {current_level} to {required_level} by mastering Level {c['difficulty_level']} competencies."
        }
        for c in useful
    ]


def gap_status(gap: int) -> str:
    """Matches Member 2's gap_analyzer.py status wording exactly."""
    if gap <= 0:
        return "Meets Requirement"
    if gap == 1:
        return "Needs Improvement"
    return "High Priority"


# ---------------------------------------------------------------------------
# API Request / Response Schemas
# ---------------------------------------------------------------------------
class QuizRequest(BaseModel):
    employee_id: str = Field(..., description="Unique employee identifier (e.g. E001)", min_length=1)
    skill: str = Field(..., description="Skill to test (e.g. Survey Design, Python, e-Governance Systems)")
    question_count: int = Field(default=5, ge=1, le=10, description="Number of questions (1-10)")


class Answer(BaseModel):
    question_id: str
    selected_option: int = Field(ge=0, le=3)


class SubmitQuizRequest(BaseModel):
    quiz_id: str
    employee_id: str
    role: str | None = None
    designation: str | None = None
    answers: list[Answer]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/health", tags=["System"])
def health():
    return {
        "status": "ok",
        "service": "AI Skill Intelligence Platform (SIH 2026)",
        "version": "2.2.0",
        "ai_generator_active": gemini_client is not None,
        "total_employees_loaded": len(EMPLOYEES_DB),
        "available_roles": list(ROLE_REQUIREMENTS.keys()),
        "competency_domains": list(COMPETENCY_FRAMEWORK.keys()) if COMPETENCY_FRAMEWORK else [],
    }


@app.get("/competency-framework", tags=["Framework"])
def get_competency_framework():
    """Returns the official 4-domain competency framework and Level 1-5 rubric definitions."""
    return COMPETENCY_FRAMEWORK


@app.get("/employees", tags=["Employees"])
def list_employees(
    department: str | None = Query(None, description="Filter by ministry / department"),
    designation: str | None = Query(None, description="Filter by designation / role"),
):
    """Returns government employee profiles from the official database."""
    results = list(EMPLOYEES_DB.values())
    if department:
        results = [e for e in results if department.lower() in e.get("department", "").lower()]
    if designation:
        results = [e for e in results if designation.lower() in e.get("designation", "").lower()]
    return results


@app.get("/employees/{employee_id}", tags=["Employees"])
def get_employee(employee_id: str):
    """Returns a single employee profile, their required competency profile, and quiz assessment status."""
    emp = EMPLOYEES_DB.get(employee_id.upper()) or EMPLOYEES_DB.get(employee_id)
    if not emp:
        raise HTTPException(404, f"Employee with ID '{employee_id}' not found.")
    return emp


@app.get("/roles", tags=["Requirements"])
def get_roles():
    """Returns benchmark role requirements for all official government designations."""
    return ROLE_REQUIREMENTS


@app.post("/generate-quiz", tags=["Quiz"])
def generate_quiz(request: QuizRequest):
    """Generates an adaptive quiz across difficulty levels 1 to 5 for any rubric skill.
    Auto-detects employee's role from database if available.
    """
    questions = questions_for_new_quiz(request.employee_id, request.skill, request.question_count)
    quiz_id = str(uuid.uuid4())
    QUIZZES[quiz_id] = questions

    QUIZ_HISTORY[(request.employee_id, request.skill.lower())].update(q.fingerprint for q in questions)

    # Return questions with answer keys stripped to prevent client-side inspection
    return {
        "quiz_id": quiz_id,
        "employee_id": request.employee_id,
        "skill": request.skill,
        "question_count": len(questions),
        "questions": [
            {
                "question_id": q.question_id,
                "difficulty": q.difficulty,
                "prompt": q.prompt,
                "options": q.options,
            }
            for q in questions
        ],
    }


@app.post("/submit-quiz", tags=["Quiz"])
def submit_quiz(request: SubmitQuizRequest):
    """Submits answers, computes verified competency level (1-5),
    calculates skill gap against employee's required role profile, updates the database,
    and returns personalized course recommendations.
    """
    questions = QUIZZES.get(request.quiz_id)
    if not questions:
        raise HTTPException(404, "Quiz ID not found or session expired. Please generate a new quiz.")

    skill = questions[0].skill
    emp_record = EMPLOYEES_DB.get(request.employee_id.upper()) or EMPLOYEES_DB.get(request.employee_id)

    role_name = request.role or request.designation
    if not role_name and emp_record:
        role_name = emp_record.get("designation") or emp_record.get("current_role")
    if not role_name:
        role_name = "Statistical Officer"

    # Fetch required level from employee's specific profile or the global role benchmark catalog
    required_level = 3
    if emp_record and "required_competency_profile" in emp_record:
        required_level = emp_record["required_competency_profile"].get(skill, 3)
    elif role_name in ROLE_REQUIREMENTS:
        required_level = ROLE_REQUIREMENTS[role_name].get(skill, 3)

    current_level, correct, total = level_from_answers(questions, request.answers)
    gap = max(0, required_level - current_level)
    status = gap_status(gap)

    # Persist the verified assessment to the employee's profile in the database
    if emp_record:
        if emp_record.get("quiz_assessed_skills") is None:
            emp_record["quiz_assessed_skills"] = {}
        emp_record["quiz_assessed_skills"][skill] = {
            "verified_level": current_level,
            "required_level": required_level,
            "gap": gap,
            "status": status,
            "score_pct": round((correct / total) * 100, 1) if total else 0.0,
            "assessed_at": datetime.now(timezone.utc).isoformat(),
        }

    answer_map = {a.question_id: a.selected_option for a in request.answers}
    feedback = [
        {
            "question_id": q.question_id,
            "difficulty": q.difficulty,
            "correct": answer_map.get(q.question_id) == q.correct_option,
            "selected_option": answer_map.get(q.question_id),
            "correct_option": q.correct_option,
            "explanation": q.explanation,
        }
        for q in questions
    ]

    return {
        "employee_id": request.employee_id,
        "name": emp_record.get("name") if emp_record else None,
        "department": emp_record.get("department") if emp_record else None,
        "role": role_name,
        "designation": role_name,
        "assessment_source": "quiz",
        "skill": skill,
        "score": {
            "correct": correct,
            "total": total,
            "percentage": round((correct / total) * 100, 1) if total else 0.0,
        },
        "current_level": current_level,
        "required_level": required_level,
        "gap": gap,
        "status": status,
        "recommended_courses": recommend(skill, current_level, required_level),
        "feedback": feedback,
    }


@app.get("/recommendations", tags=["Recommendations"])
def get_recommendations(
    skill: str = Query(..., description="Target skill"),
    current_level: int = Query(..., ge=1, le=5, description="Candidate's current level (1-5)"),
    required_level: int = Query(..., ge=1, le=5, description="Role benchmark required level (1-5)"),
):
    """Directly fetch recommended courses to bridge a given skill gap."""
    gap = max(0, required_level - current_level)
    return {
        "skill": skill,
        "current_level": current_level,
        "required_level": required_level,
        "gap": gap,
        "status": gap_status(gap),
        "recommended_courses": recommend(skill, current_level, required_level),
    }


# ---------------------------------------------------------------------------
# Learning Paths & Progress State (Matches Frontend Dashboard UI)
# ---------------------------------------------------------------------------
LEARNING_PATHS_DB = [
    {
        "id": "lp-python",
        "title": "Python for Official Statistics",
        "provider": "iGOT",
        "duration": "8 hours",
        "domain": "Technical",
        "description": "Build practical Python skills for statistical data processing, analysis, and automation.",
        "tags": ["Python", "Data Analysis", "Automation"],
        "status": "Recommended",
        "priority": "High priority",
        "progress": 0,
        "skill": "Python",
    },
    {
        "id": "lp-metadata",
        "title": "Data Quality and Metadata Standards",
        "provider": "NSSTA",
        "duration": "6 hours",
        "domain": "Statistical",
        "description": "Strengthen your understanding of data quality frameworks, metadata, and statistical standards.",
        "tags": ["Data Quality", "Metadata", "Standards"],
        "status": "Recommended",
        "priority": "High priority",
        "progress": 0,
        "skill": "Data Analysis",
    },
    {
        "id": "lp-sql",
        "title": "SQL for Data Management",
        "provider": "iGOT",
        "duration": "5 hours",
        "domain": "Technical",
        "description": "Develop practical SQL capabilities for querying, transforming, and managing statistical datasets.",
        "tags": ["SQL", "Data Management"],
        "status": "In Progress",
        "priority": "Medium priority",
        "progress": 42,
        "skill": "SQL",
    },
    {
        "id": "lp-viz",
        "title": "Effective Data Visualization",
        "provider": "iGOT",
        "duration": "4 hours",
        "domain": "Technical",
        "description": "Learn how to communicate statistical findings through clear and effective visualizations.",
        "tags": ["Visualization", "Communication"],
        "status": "Completed",
        "priority": "Medium priority",
        "progress": 100,
        "skill": "Data Visualization",
    },
]


@app.get("/learning-paths", tags=["Dashboard"])
def get_learning_paths(filter: str | None = Query(None, description="Filter by status: Recommended, In Progress, Completed")):
    """Returns official learning paths and summary counts matching the website dashboard."""
    paths = LEARNING_PATHS_DB
    if filter and filter.lower() != "all":
        paths = [p for p in paths if p["status"].lower() == filter.lower()]

    recommended_count = sum(1 for p in LEARNING_PATHS_DB if p["status"] == "Recommended")
    in_progress_count = sum(1 for p in LEARNING_PATHS_DB if p["status"] == "In Progress")
    completed_count = sum(1 for p in LEARNING_PATHS_DB if p["status"] == "Completed")

    return {
        "summary": {
            "recommended": recommended_count,
            "in_progress": in_progress_count,
            "completed": completed_count,
            "focus_areas": 10,
        },
        "paths": paths,
    }


class UpdateProgressRequest(BaseModel):
    path_id: str = Field(..., description="ID of the learning path (e.g. lp-sql)")
    progress: int = Field(..., ge=0, le=100, description="New progress percentage (0-100)")
    status: Literal["Recommended", "In Progress", "Completed"] | None = None


@app.post("/learning-paths/update-progress", tags=["Dashboard"])
def update_learning_path_progress(request: UpdateProgressRequest):
    """Updates learning path progress (e.g., changes SQL for Data Management from 42% In Progress to 100% Completed)."""
    target = next((p for p in LEARNING_PATHS_DB if p["id"] == request.path_id or p["title"].lower() == request.path_id.lower()), None)
    if not target:
        raise HTTPException(404, f"Learning path '{request.path_id}' not found.")

    target["progress"] = request.progress
    if request.status:
        target["status"] = request.status
    elif request.progress >= 100:
        target["status"] = "Completed"
    elif request.progress > 0:
        target["status"] = "In Progress"
    else:
        target["status"] = "Recommended"

    return {"message": "Progress updated successfully", "updated_path": target}


@app.post("/learning-paths/complete-all", tags=["Dashboard"])
def complete_all_learning_paths():
    """Sets all courses and learning paths to 100% Completed."""
    for path in LEARNING_PATHS_DB:
        path["progress"] = 100
        path["status"] = "Completed"

    return {
        "message": "All learning paths marked as 100% Completed.",
        "summary": {
            "recommended": 0,
            "in_progress": 0,
            "completed": len(LEARNING_PATHS_DB),
            "focus_areas": 10,
        },
        "paths": LEARNING_PATHS_DB,
    }

