import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
AUTHORITY_FILE = BASE_DIR / "database" / "authorities.json"


def load_authorities():
    with AUTHORITY_FILE.open("r", encoding="utf-8") as file:
        return json.load(file)


def classify_problem(description: str):
    text = description.lower()
    authorities = load_authorities()

    best_match = None
    best_score = 0

    for item in authorities:
        score = 0
        for keyword in item.get("keywords", []):
            if keyword.lower() in text:
                score += 1

        if score > best_score:
            best_score = score
            best_match = item

    if best_match is None:
        return {
            "category": "general",
            "authority": "Local / Relevant Grievance Authority",
            "reason": "The problem could not be confidently matched to one of the current categories.",
            "official_channel": "Check the relevant official government or institutional grievance channel.",
            "website": "https://pgportal.gov.in/",
            "steps": [
                "Add more specific details about the problem.",
                "Mention the location or organization involved.",
                "Keep relevant evidence.",
                "Use the official complaint channel suggested above."
            ],
            "confidence": "low"
        }

    confidence = "high" if best_score >= 2 else "medium"

    return {
        "category": best_match["category"],
        "authority": best_match["authority"],
        "reason": best_match["reason"],
        "official_channel": best_match["official_channel"],
        "website": best_match["website"],
        "steps": best_match["steps"],
        "confidence": confidence
    }
