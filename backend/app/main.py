from pathlib import Path
import uuid
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from .classifier import classify_problem

app = FastAPI(title="Kya Karu? API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_TYPES = {"image/jpeg","image/png","image/webp","video/mp4","video/webm","video/quicktime"}

@app.get("/")
def root():
    return {"message": "Kya Karu? API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/report")
async def report(message: str = Form(""), file: UploadFile | None = File(None)):
    attachment = None

    if file and file.filename:
        if file.content_type not in ALLOWED_TYPES:
            return {"ok": False, "error": "Please upload an image or video file."}

        content = await file.read()
        if len(content) > 15 * 1024 * 1024:
            return {"ok": False, "error": "File is too large. Please keep it below 15 MB."}

        ext = Path(file.filename).suffix.lower()
        saved_name = f"{uuid.uuid4().hex}{ext}"
        (UPLOAD_DIR / saved_name).write_bytes(content)

        attachment = {
            "original_name": file.filename,
            "type": "image" if file.content_type.startswith("image/") else "video",
            "size_bytes": len(content)
        }

    result = classify_problem(message)

    if attachment:
        result["attachment_note"] = (
            f"I received your {attachment['type']} attachment. "
            "For this lightweight MVP, the written description is used for routing."
        )

    return {"ok": True, "result": result, "attachment": attachment}

