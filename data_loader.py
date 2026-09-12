import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")


def load_employees(file_path=None):
    """Loads government employee profiles provided by Member 1."""
    if file_path is None:
        file_path = os.path.join(DATA_DIR, "employees.json")

    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def load_requirements(file_path=None):
    """Loads benchmark competency requirements for designations."""
    if file_path is None:
        file_path = os.path.join(DATA_DIR, "employee_requirement.json")

    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def load_competency_framework(file_path=None):
    """Loads competency categories and 1-5 level rubrics."""
    if file_path is None:
        file_path = os.path.join(DATA_DIR, "competency_framework.json")

    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def load_courses(file_path=None):
    """Loads sample course database provided by Member 1."""
    if file_path is None:
        file_path = os.path.join(DATA_DIR, "courses.json")

    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)