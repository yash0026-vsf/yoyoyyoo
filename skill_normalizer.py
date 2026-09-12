# Common technical acronyms that should remain uppercase
COMMON_ACRONYMS = {
    "sql": "SQL",
    "ml": "ML",
    "ai": "AI",
    "api": "API",
    "nlp": "NLP",
    "aws": "AWS",
    "etl": "ETL",
    "bi": "BI",
}


def normalize_skill(skill):
    """Cleans whitespace, handles common acronyms, and title-cases skill names."""
    if not skill or not isinstance(skill, str):
        return ""

    cleaned = skill.strip()
    lower = cleaned.lower()

    if lower in COMMON_ACRONYMS:
        return COMMON_ACRONYMS[lower]

    return cleaned.title()


def normalize_extracted_skills(extracted_skills):
    """
    Normalizes extracted skills while preserving traceability:
    - raw_skill: Cleaned original skill/task as stated in text
    - mapped_competency: Official competency from taxonomy (or None)
    - skill: The effective competency used for scoring and gap analysis
             (uses mapped_competency if mapped, else falls back to raw_skill)
    """
    normalized_skills = []

    for item in extracted_skills:
        raw = item.get("raw_skill") or item.get("skill", "")
        mapped = item.get("mapped_competency")

        norm_raw = normalize_skill(raw) if raw else ""
        norm_mapped = normalize_skill(mapped) if mapped else None

        # Effective skill: mapped competency takes precedence for benchmark gap matching
        effective_skill = norm_mapped if norm_mapped else norm_raw

        normalized_skills.append({
            "raw_skill": norm_raw,
            "mapped_competency": norm_mapped,
            "skill": effective_skill,
            "level": int(item.get("level", 1)),
            "evidence": item.get("evidence", "")
        })

    return normalized_skills