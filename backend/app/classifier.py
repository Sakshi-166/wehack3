import json
import re
from pathlib import Path

DATA_FILE = Path(__file__).parent / "data" / "authorities.json"
with open(DATA_FILE, "r", encoding="utf-8") as f:
    AUTHORITIES = json.load(f)

def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower().strip())

def classify_problem(text: str) -> dict:
    text = normalize(text)
    scores = {}
    matched = {}

    for category, data in AUTHORITIES.items():
        found = [k for k in data["keywords"] if k.lower() in text]
        scores[category] = len(found)
        matched[category] = found

    best = max(scores, key=scores.get)

    if scores[best] == 0:
        return {
            "category": "general",
            "category_label": "General / Need More Details",
            "authority": "Please provide a little more information",
            "phone": "",
            "email": "",
            "portal": "",
            "explanation": "I could not confidently identify the responsible category. Tell me what happened and your city/state, and I can narrow it down.",
            "matched_keywords": []
        }

    data = AUTHORITIES[best]
    return {
        "category": best,
        "category_label": data["label"],
        "authority": data["authority"],
        "phone": data["phone"],
        "email": data["email"],
        "portal": data["portal"],
        "explanation": data["explanation"],
        "matched_keywords": matched[best]
    }

