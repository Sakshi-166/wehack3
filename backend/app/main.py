from pathlib import Path
import json
from datetime import datetime, timezone

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .classifier import classify_problem

BASE_DIR = Path(__file__).resolve().parents[2]
DATABASE_FILE = BASE_DIR / "database" / "complaints.json"
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Kya Karu? API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def save_complaint(record):
    try:
        with DATABASE_FILE.open("r", encoding="utf-8") as file:
            complaints = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        complaints = []

    complaints.append(record)

    with DATABASE_FILE.open("w", encoding="utf-8") as file:
        json.dump(complaints, file, indent=2, ensure_ascii=False)


@app.get("/health")
def health():
    return {"status": "ok", "message": "Kya Karu backend is running"}


@app.post("/api/report")
async def report(
    description: str = Form(...),
    location: str = Form(""),
    files: list[UploadFile] = File(default=[]),
):
    result = classify_problem(description)

    saved_files = []

    for uploaded_file in files:
        if not uploaded_file.filename:
            continue

        safe_name = Path(uploaded_file.filename).name
        destination = UPLOAD_DIR / safe_name

        content = await uploaded_file.read()
        destination.write_bytes(content)
        saved_files.append(safe_name)

    record = {
        "created_at": datetime.now(timezone.utc).isoformat(),
        "description": description,
        "location": location,
        "attachments": saved_files,
        "category": result["category"],
        "authority": result["authority"],
    }

    save_complaint(record)

    return {
        **result,
        "location": location,
        "attachments": saved_files,
        "message": "Your problem has been routed to the most relevant authority available in the current database."
    }
