from fastapi.testclient import TestClient
from app import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["total_employees_loaded"] == 25
    assert len(data["competency_domains"]) == 4


def test_competency_framework():
    response = client.get("/competency-framework")
    assert response.status_code == 200
    framework = response.json()
    assert "Statistical Skills" in framework
    assert "Technical Skills" in framework
    assert "Digital Governance Skills" in framework
    assert "Behavioural Skills" in framework
    assert "Survey Design" in framework["Statistical Skills"]


def test_employees_endpoints():
    # 1. List all employees
    resp = client.get("/employees")
    assert resp.status_code == 200
    emps = resp.json()
    assert len(emps) == 25

    # 2. Filter by department
    resp_dept = client.get("/employees?department=Finance")
    assert resp_dept.status_code == 200
    assert len(resp_dept.json()) > 0

    # 3. Get single employee E001 (Vivek Reddy)
    resp_e1 = client.get("/employees/E001")
    assert resp_e1.status_code == 200
    e1 = resp_e1.json()
    assert e1["name"] == "Vivek Reddy"
    assert e1["designation"] == "Statistical Officer"
    assert "Survey Design" in e1["required_competency_profile"]


def test_quiz_on_government_skill_flow():
    # 1. Generate quiz on 'Survey Design' for employee E001
    quiz_resp = client.post("/generate-quiz", json={
        "employee_id": "E001",
        "skill": "Survey Design",
        "question_count": 5
    })
    assert quiz_resp.status_code == 200
    body = quiz_resp.json()
    assert body["skill"] == "Survey Design"
    assert len(body["questions"]) == 5

    # Check anti-cheat: answers must not be sent to client
    for q in body["questions"]:
        assert "correct_option" not in q
        assert "explanation" not in q

    # 2. Submit quiz answers for E001
    answers = [{"question_id": q["question_id"], "selected_option": 1} for q in body["questions"]]
    sub_resp = client.post("/submit-quiz", json={
        "quiz_id": body["quiz_id"],
        "employee_id": "E001",
        "designation": "Statistical Officer",
        "answers": answers
    })
    assert sub_resp.status_code == 200
    sub_data = sub_resp.json()
    assert sub_data["name"] == "Vivek Reddy"
    assert sub_data["department"] == "Ministry of Electronics & IT"
    assert "current_level" in sub_data
    assert "required_level" in sub_data
    assert "gap" in sub_data
    assert "recommended_courses" in sub_data

    # 3. Verify that employee E001's profile in the database now has quiz_assessed_skills updated!
    emp_after = client.get("/employees/E001").json()
    assert emp_after["quiz_assessed_skills"] is not None
    assert "Survey Design" in emp_after["quiz_assessed_skills"]
    assert emp_after["quiz_assessed_skills"]["Survey Design"]["verified_level"] == sub_data["current_level"]


def test_direct_recommendations():
    resp = client.get("/recommendations?skill=Survey Design&current_level=1&required_level=4")
    assert resp.status_code == 200
    data = resp.json()
    assert data["gap"] == 3
    assert data["status"] == "High Priority"
    assert len(data["recommended_courses"]) > 0


def test_learning_paths_dashboard():
    # 1. Fetch learning paths matching the website UI
    resp = client.get("/learning-paths")
    assert resp.status_code == 200
    data = resp.json()
    assert data["summary"]["recommended"] == 2
    assert data["summary"]["in_progress"] == 1
    assert data["summary"]["completed"] == 1
    assert data["summary"]["focus_areas"] == 10
    assert len(data["paths"]) == 4

    # 2. Update SQL for Data Management from 42% In Progress to 100% Completed
    up_resp = client.post("/learning-paths/update-progress", json={
        "path_id": "lp-sql",
        "progress": 100
    })
    assert up_resp.status_code == 200
    updated = up_resp.json()["updated_path"]
    assert updated["progress"] == 100
    assert updated["status"] == "Completed"

    # 3. Check updated dashboard summary
    check = client.get("/learning-paths").json()
    assert check["summary"]["in_progress"] == 0
    assert check["summary"]["completed"] == 2


if __name__ == "__main__":
    print("[RUNNING TESTS] Starting official database test suite...")
    test_health_endpoint()
    print("  [PASS] test_health_endpoint (25 employees, 4 domains)")
    test_competency_framework()
    print("  [PASS] test_competency_framework (Rubrics & Levels 1-5)")
    test_employees_endpoints()
    print("  [PASS] test_employees_endpoints (Filters & E001)")
    test_quiz_on_government_skill_flow()
    print("  [PASS] test_quiz_on_government_skill_flow (Survey Design & DB update)")
    test_direct_recommendations()
    print("  [PASS] test_direct_recommendations")
    test_learning_paths_dashboard()
    print("  [PASS] test_learning_paths_dashboard (Dashboard UI cards & Progress)")
    print("\n============================================================")
    print("  SUCCESS: ALL 6 COMPREHENSIVE TESTS PASSED (6/6)")
    print("============================================================")

