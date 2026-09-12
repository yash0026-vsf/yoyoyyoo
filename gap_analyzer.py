def merge_skills(existing_skills, extracted_skills):
    """
    Merges existing skills with newly extracted skills.
    Performs case-insensitive matching and takes the maximum proficiency level.
    """
    final_skills = existing_skills.copy()

    # Map lowercase skill names to their existing dictionary keys
    lower_to_key = {k.strip().lower(): k for k in final_skills.keys()}

    for item in extracted_skills:
        skill = item["skill"].strip()
        level = item["level"]
        skill_lower = skill.lower()

        if skill_lower in lower_to_key:
            existing_key = lower_to_key[skill_lower]
            final_skills[existing_key] = max(
                final_skills[existing_key],
                level
            )
        else:
            final_skills[skill] = level
            lower_to_key[skill_lower] = skill

    return final_skills


def calculate_skill_gaps(current_skills, required_skills):
    """
    Compares current evaluated skills against role benchmark requirements.
    Uses case-insensitive lookup so 'SQL' matches 'Sql' or 'sql'.
    """
    results = []

    # Case-insensitive lookup dictionary for evaluated current skills
    current_lookup = {k.strip().lower(): v for k, v in current_skills.items()}

    for skill, required_level in required_skills.items():
        # Look up case-insensitively
        current_level = current_lookup.get(skill.strip().lower(), 0)

        gap = max(
            required_level - current_level,
            0
        )

        if gap == 0:
            status = "Meets Requirement"
        elif gap == 1:
            status = "Needs Improvement"
        else:
            status = "High Priority"

        results.append({
            "skill": skill,
            "current_level": current_level,
            "required_level": required_level,
            "gap": gap,
            "status": status
        })

    return results