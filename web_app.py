import streamlit as st
import json
import time
from collections import defaultdict

# Member 2 Modules
from data_loader import load_employees, load_requirements, load_courses
from skill_extractor import extract_skills
from skill_normalizer import normalize_extracted_skills
from gap_analyzer import merge_skills, calculate_skill_gaps

# Set page config
st.set_page_config(
    page_title="AI Skill Intelligence Platform (PS 26101)",
    page_icon="🇮🇳",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Styling - StatSkill Design System
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    html, body, [class*="css"] { font-family: 'Plus Jakarta Sans', sans-serif; }
    .stApp { background-color: #F8FAFC; }
    .main-header { font-size: 2.2rem; font-weight: 800; color: #0F172A; margin-bottom: 0.2rem; letter-spacing: -0.02em; }
    .sub-header { font-size: 1rem; color: #64748B; margin-bottom: 1.5rem; }
    .hero-banner { background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); border-radius: 14px; padding: 24px 30px; color: white; margin-bottom: 24px; border: 1px solid #334155; }
    .stat-card { background: white; border-radius: 12px; padding: 18px; border: 1px solid #E2E8F0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .metric-card { background: white; border-radius: 10px; padding: 16px; border-left: 4px solid #EA580C; border-top: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
    .stButton>button { border-radius: 8px; font-weight: 600; }
    .stButton>button[kind="primary"] { background-color: #EA580C; border-color: #EA580C; }
    .stButton>button[kind="primary"]:hover { background-color: #C2410C; border-color: #C2410C; }
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    </style>
""", unsafe_allow_html=True)

# Question bank for diagnostic pre-quiz & post-quiz
QUESTION_BANK = {
    "Survey Design": [
        {"id": "sd-1", "level": 1, "prompt": "What is the very first step in designing a statistical survey?", "options": ["Data entry into software", "Defining clear survey objectives and target population", "Printing questionnaires", "Data tabulation"], "answer": 1},
        {"id": "sd-2", "level": 2, "prompt": "In survey methodology, what is a 'sampling frame'?", "options": ["A graphic map display", "A complete list of target population units from which a sample is drawn", "Statistical estimation software", "The total field survey budget"], "answer": 1},
        {"id": "sd-3", "level": 3, "prompt": "What type of survey question is: 'Rate your satisfaction from 1 (Very Poor) to 5 (Excellent)'?", "options": ["Binary dichotomy", "Likert scale question", "Open-ended narrative", "Filter screening question"], "answer": 1},
        {"id": "sd-4", "level": 4, "prompt": "When sampling across diverse geographic zones with unequal variances, which sampling design is optimal?", "options": ["Simple Random Sampling", "Stratified Random Sampling with Neyman Allocation", "Convenience Quota Sampling", "Snowball Network Sampling"], "answer": 1},
        {"id": "sd-5", "level": 5, "prompt": "How is non-sampling error primarily controlled in large-scale national sample surveys?", "options": ["Increasing sample size indefinitely", "Standardized field manuals, double-entry validation, and post-stratification weighting", "Ignoring non-respondents", "Relying strictly on phone surveys"], "answer": 1},
    ],
    "Python": [
        {"id": "py-1", "level": 1, "prompt": "Which symbol starts a single-line comment in Python?", "options": ["#", "//", "<!--", "*"], "answer": 0},
        {"id": "py-2", "level": 2, "prompt": "Which keyword is used to define a function in Python?", "options": ["func", "def", "function", "lambda"], "answer": 1},
        {"id": "py-3", "level": 3, "prompt": "Which built-in module handles JSON serialization and deserialization in Python?", "options": ["json", "pickle", "requests", "csv"], "answer": 0},
        {"id": "py-4", "level": 4, "prompt": "What advantage does a generator expression provide over a list comprehension?", "options": ["Faster indexing", "Memory-efficient lazy evaluation without loading everything in RAM", "Static typing", "Direct hardware compilation"], "answer": 1},
        {"id": "py-5", "level": 5, "prompt": "What does the Python GIL (Global Interpreter Lock) primarily restrict?", "options": ["Multi-process execution", "True concurrent multi-threaded execution of Python bytecode", "Garbage collection", "Asynchronous I/O"], "answer": 1},
    ],
    "Communication": [
        {"id": "com-1", "level": 1, "prompt": "Which element is vital for official government administrative correspondence?", "options": ["Informal slang", "Clarity, concise language, and formal professional tone", "Poetic metaphors", "Emoji icons"], "answer": 1},
        {"id": "com-2", "level": 2, "prompt": "Active listening in public administration primarily requires:", "options": ["Thinking of replies while the citizen speaks", "Paying full attention, clarifying points, and summarizing understanding", "Quick interruptions", "Passive silence"], "answer": 1},
        {"id": "com-3", "level": 3, "prompt": "When communicating public policy changes to diverse stakeholders, the best practice is:", "options": ["Dense legal jargon", "Tailored messaging addressing specific public impacts and practical FAQs", "A single unannounced memo", "No proactive outreach"], "answer": 1},
        {"id": "com-4", "level": 4, "prompt": "In crisis communication, the institutional 'Golden Rule' to preserve trust is:", "options": ["Delaying public statements for several weeks", "Communicating transparently, acknowledging known facts, and explaining next action steps promptly", "Deflecting blame to other departments", "Speculating on rumors"], "answer": 1},
        {"id": "com-5", "level": 5, "prompt": "Strategic institutional communication aligns daily department messaging with:", "options": ["Internal rumors", "Long-term organizational vision, national priorities, and citizen trust", "Personal preferences", "Unverified claims"], "answer": 1},
    ]
}

# Cache loaders
@st.cache_data
def get_data():
    return load_employees(), load_requirements(), load_courses()

employees, requirements, catalog = get_data()

# Initialize Session State
if "phase" not in st.session_state:
    st.session_state.phase = 1
if "extracted_data" not in st.session_state:
    st.session_state.extracted_data = None
if "selected_skill" not in st.session_state:
    st.session_state.selected_skill = "Survey Design"
if "true_level" not in st.session_state:
    st.session_state.true_level = None
if "course_completed" not in st.session_state:
    st.session_state.course_completed = False
if "upgraded_level" not in st.session_state:
    st.session_state.upgraded_level = None

# Sidebar Controls
st.sidebar.image("https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg", width=65)
st.sidebar.title("🇮🇳 Civil Service Portal")
st.sidebar.markdown("**Problem Statement PS 26101**  \nAI Skill Intelligence & Learning Platform")

emp_names = [f"{e['name']} ({e['employee_id']}) - {e['designation']}" for e in employees]
selected_emp_idx = st.sidebar.selectbox("Select Government Official:", range(len(emp_names)), format_func=lambda x: emp_names[x])
emp = employees[selected_emp_idx]

st.sidebar.divider()
st.sidebar.markdown(f"**Ministry:** {emp.get('department', 'N/A')}")
st.sidebar.markdown(f"**Experience:** {emp.get('years_experience', emp.get('experience_years', 0))} Years")

if st.sidebar.button("🔄 Reset Workflow Session"):
    st.session_state.phase = 1
    st.session_state.extracted_data = None
    st.session_state.true_level = None
    st.session_state.course_completed = False
    st.session_state.upgraded_level = None
    st.rerun()

# Header
st.markdown('<div class="main-header">🇮🇳 AI Skill Intelligence & Upskilling Platform</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Closed-Loop Competency Baseline, Adaptive Verification, and Course Prescription</div>', unsafe_allow_html=True)

# Workflow Progress Bar
cols = st.columns(3)
with cols[0]:
    if st.session_state.phase == 1:
        st.info("📌 **Phase 1: Diagnostic Baseline**")
    elif st.session_state.phase > 1:
        st.success("✅ **Phase 1 Completed**")
with cols[1]:
    if st.session_state.phase == 2:
        st.info("📌 **Phase 2: Prescription & Courses**")
    elif st.session_state.phase > 2:
        st.success("✅ **Phase 2 Completed**")
    else:
        st.text("⏳ Phase 2: Pending")
with cols[2]:
    if st.session_state.phase == 3:
        st.info("📌 **Phase 3: Upskilling & Level Up**")
    elif st.session_state.upgraded_level:
        st.success("✅ **Phase 3: Level Up Achieved!**")
    else:
        st.text("⏳ Phase 3: Pending")

st.divider()

# ===========================================================================
# PHASE 1: DIAGNOSTIC BASELINE
# ===========================================================================
if st.session_state.phase == 1:
    st.markdown("### 📋 Step 1: Profile & Resume Assessment")
    
    col_l, col_r = st.columns([1, 1])
    with col_l:
        st.markdown(f"**Employee:** {emp['name']} (`{emp['employee_id']}`)")
        st.markdown(f"**Designation:** {emp['designation']}")
        resume_input = st.text_area("Resume / Past Experience Record:", value=emp.get("resume_text", ""), height=130)
    
    with col_r:
        role_reqs = requirements.get(emp['designation'], {})
        st.markdown(f"**Role Competency Benchmark ({emp['designation']}):**")
        for k, v in role_reqs.items():
            st.markdown(f"- **{k}:** Level {v} required")
    
    if st.button("🚀 Analyze Profile with Gemini AI", type="primary"):
        with st.spinner("Analyzing experience text and mapping to official civil service taxonomy..."):
            raw = extract_skills(resume_input)
            normalized = normalize_extracted_skills(raw)
            st.session_state.extracted_data = normalized
            
    if st.session_state.extracted_data:
        st.markdown("#### 🎯 AI-Extracted Competencies (Claimed Baseline)")
        cols_skills = st.columns(len(st.session_state.extracted_data))
        skills_found = []
        for i, item in enumerate(st.session_state.extracted_data):
            sk = item.get("mapped_competency") or item.get("raw_skill")
            skills_found.append((sk, item["level"]))
            with cols_skills[i % len(cols_skills)]:
                st.metric(label=sk, value=f"Level {item['level']}", help=item.get("evidence", ""))
        
        st.markdown("---")
        st.markdown("### ✍️ Step 2: Member 3 Adaptive Diagnostic PRE-QUIZ")
        st.info("💡 **Empirical Verification:** The candidate claims proficiency on their resume. To prevent self-reporting bias, Member 3 administers a quick 5-level adaptive diagnostic quiz to identify their TRUE current level.")
        
        selectable_skills = [s[0] for s in skills_found if s[0] in QUESTION_BANK]
        if not selectable_skills:
            selectable_skills = list(QUESTION_BANK.keys())
            
        test_skill = st.selectbox("Select Competency to Verify:", selectable_skills, index=0)
        st.session_state.selected_skill = test_skill
        
        questions = QUESTION_BANK.get(test_skill, [])
        with st.form("pre_quiz_form"):
            st.markdown(f"#### Diagnostic Evaluation for: **{test_skill}**")
            user_answers = {}
            for q in questions:
                st.markdown(f"**[Level {q['level']}] {q['prompt']}**")
                user_answers[q['id']] = st.radio(
                    f"Choose answer for {q['id']}:", 
                    range(len(q['options'])), 
                    format_func=lambda x, opts=q['options']: opts[x],
                    key=f"pre_{q['id']}"
                )
                st.write("")
            
            submit_pre = st.form_submit_button("Submit Diagnostic Pre-Quiz")
            if submit_pre:
                correct_count = 0
                max_level_passed = 1
                for q in questions:
                    if user_answers[q['id']] == q['answer']:
                        correct_count += 1
                        if q['level'] > max_level_passed:
                            max_level_passed = q['level']
                
                # Empirical verified level:
                # If they passed up to level 3 questions, verified level = 3
                st.session_state.true_level = max(1, min(max_level_passed, 3 if correct_count < 5 else 5))
                st.session_state.phase = 2
                st.rerun()

# ===========================================================================
# PHASE 2: PRESCRIPTION & COURSES
# ===========================================================================
elif st.session_state.phase == 2:
    st.markdown("### 📊 Phase 2: Skill Gap Analysis & Course Prescription")
    target_skill = st.session_state.selected_skill
    true_lvl = st.session_state.true_level
    req_lvl = requirements.get(emp['designation'], {}).get(target_skill, 4)
    gap = max(0, req_lvl - true_lvl)
    
    st.success(f"✅ **Diagnostic Pre-Quiz Completed!** Evaluated True Baseline Level for **{target_skill}**: **Level {true_lvl}**")
    
    m1, m2, m3, m4 = st.columns(4)
    with m1:
        st.metric("Competency", target_skill)
    with m2:
        st.metric("Verified Current Level", f"Level {true_lvl}")
    with m3:
        st.metric("Role Required Level", f"Level {req_lvl}")
    with m4:
        status_label = "Meets Requirement" if gap == 0 else ("Needs Improvement" if gap == 1 else "High Priority")
        st.metric("Skill Gap", f"{gap}", delta=f"-{gap} Gap" if gap > 0 else "0", delta_color="inverse")
    
    st.markdown("---")
    st.markdown("### 🎓 Member 3: Targeted Course Recommendations")
    st.write(f"The recommendation engine searches the **50-course iGOT Karmayogi catalog** for courses bridging **Level {true_lvl} $\\rightarrow$ Level {req_lvl}**:")
    
    recommended = []
    for c in catalog:
        c_skills = c.get("competencies_v3", c.get("skills", []))
        diff = c.get("difficulty_level", 1)
        if any(target_skill.lower() == s.lower() for s in c_skills) and (true_lvl < diff <= req_lvl):
            recommended.append(c)
    
    if recommended:
        for idx, c in enumerate(recommended, 1):
            with st.container():
                st.markdown(f"""
                <div class="metric-card">
                    <h4>{idx}. [{c.get('channel', 'iGOT')}] {c.get('name')}</h4>
                    <p><b>Proficiency Target:</b> Level {c.get('difficulty_level')} &nbsp;|&nbsp; <b>Duration:</b> {c.get('duration_hours', 0)} Hours &nbsp;|&nbsp; <b>ID:</b> <code>{c.get('identifier', 'N/A')}</code></p>
                    <p style="color: #4B5563;">{c.get('description', 'Comprehensive iGOT module.')}</p>
                </div>
                """, unsafe_allow_html=True)
                st.write("")
        
        st.markdown("---")
        st.markdown("### 🚀 Proceed to Upskilling")
        st.info("Simulate the employee studying and completing the prescribed iGOT course.")
        if st.button("🎓 Complete Prescribed Course & Proceed to Mastery Test", type="primary"):
            st.session_state.course_completed = True
            st.session_state.phase = 3
            st.rerun()
    else:
        st.warning("No courses required; requirement is already satisfied!")
        if st.button("Back to Phase 1"):
            st.session_state.phase = 1
            st.rerun()

# ===========================================================================
# PHASE 3: UPSKILLING & LEVEL UP
# ===========================================================================
elif st.session_state.phase == 3:
    st.markdown("### 🏆 Phase 3: Post-Quiz Mastery Test & Level Up")
    target_skill = st.session_state.selected_skill
    req_lvl = requirements.get(emp['designation'], {}).get(target_skill, 4)
    true_lvl = st.session_state.true_level
    
    st.success("🎉 **Course Completed!** Employee completed 100% of the prescribed curriculum.")
    
    if not st.session_state.upgraded_level:
        st.markdown(f"#### 📝 Course Mastery Test (Target Level {req_lvl})")
        st.write(f"To officially upgrade the employee's competency record, pass the Level {req_lvl} mastery evaluation:")
        
        # Pull the specific question for the required level
        target_q_list = [q for q in QUESTION_BANK.get(target_skill, []) if q['level'] == req_lvl]
        target_q = target_q_list[0] if target_q_list else QUESTION_BANK[target_skill][-1]
        
        with st.form("post_quiz_form"):
            st.markdown(f"**[Level {target_q['level']} Question] {target_q['prompt']}**")
            ans = st.radio(
                "Select your answer:", 
                range(len(target_q['options'])),
                format_func=lambda x, opts=target_q['options']: opts[x],
                key="post_q_ans"
            )
            
            submit_post = st.form_submit_button("Submit Mastery Assessment")
            if submit_post:
                if ans == target_q['answer']:
                    st.session_state.upgraded_level = req_lvl
                    st.rerun()
                else:
                    st.error("Incorrect answer. Please review the course materials and try again.")
    else:
        st.balloons()
        st.markdown(f"""
        <div style="background-color: #D1FAE5; border-left: 6px solid #10B981; padding: 20px; border-radius: 8px;">
            <h2 style="color: #065F46; margin: 0;">🎉 Verified Mastery Achieved!</h2>
            <p style="color: #047857; font-size: 1.1rem; margin-top: 5px;">
                Employee successfully demonstrated <b>Level {st.session_state.upgraded_level}</b> competence in <b>{target_skill}</b>.
            </p>
        </div>
        """, unsafe_allow_html=True)
        
        st.write("")
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Previous Verified Level", f"Level {true_lvl}")
        with col2:
            st.metric("New Official Level", f"Level {st.session_state.upgraded_level}", delta=f"+{st.session_state.upgraded_level - true_lvl} Level Up!")
        with col3:
            st.metric("Final Skill Gap", "0", delta="Requirement Satisfied", delta_color="normal")
            
        st.markdown("### 🟢 Dashboard Status: [MEETS REQUIREMENT]")
        st.success(f"Official record for {emp['name']} has been updated across the National Civil Service Competency Registry.")
        
        if st.button("Start New Assessment"):
            st.session_state.phase = 1
            st.session_state.extracted_data = None
            st.session_state.true_level = None
            st.session_state.course_completed = False
            st.session_state.upgraded_level = None
            st.rerun()
