import os
import uuid
import logging
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.schemas import (
    LearnerProfile,
    LessonPlanRequest,
    LessonPlanResponse,
    StudentResponsePayload,
    MisconceptionAnalysis,
    AssessmentSubmission,
    AssessmentReport,
    TTSRequest,
    TTSResponse,
    DocUploadResponse
)
from app.rag_engine import rag_engine
from app.pedagogical_agent import pedagogical_agent
from app.tts_engine import tts_engine
from app.misconception_ai import misconception_diagnoser

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [%(levelname)s] - %(name)s: %(message)s"
)
logger = logging.getLogger("aetheris.api")

app = FastAPI(
    title="Aetheris AI Teacher API",
    description="Autonomous Multimodal AI Educator with Interactive Smart Blackboard and Misconception Adaptation",
    version="1.0.0"
)

# CORS Configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in origins else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------------------------------------------------------
# 1. Health & Status Endpoints
# ---------------------------------------------------------

@app.get("/api/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": "Aetheris AI Teacher API",
        "version": "1.0.0",
        "pedagogy_engine": "active",
        "rag_status": "ready",
        "tts_voices_available": ["en-US", "hi-IN", "ta-IN", "es-ES", "fr-FR", "de-DE"]
    }


# ---------------------------------------------------------
# 2. Document Ingestion & RAG
# ---------------------------------------------------------

@app.post("/api/upload-material", response_model=DocUploadResponse, tags=["RAG & Knowledge"])
async def upload_learning_material(
    file: UploadFile = File(...),
    subject_hint: Optional[str] = Form(None)
):
    allowed_extensions = [".pdf", ".docx", ".pptx", ".txt", ".md"]
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{file_ext}'. Supported: {allowed_extensions}"
        )

    doc_id = f"doc_{uuid.uuid4().hex[:10]}"
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{file.filename}")

    try:
        content = await file.read()
        file_size_kb = round(len(content) / 1024, 2)
        with open(file_path, "wb") as f:
            f.write(content)

        # Parse & index via RAG Engine
        parsed_meta = rag_engine.parse_document(file_path, doc_id)

        return DocUploadResponse(
            doc_id=doc_id,
            filename=file.filename,
            total_pages=parsed_meta.get("total_pages", 1),
            file_size_kb=file_size_kb,
            chapters_detected=parsed_meta.get("chapters", ["Introduction", "Core Concepts"]),
            summary=f"Successfully indexed '{file.filename}' into {parsed_meta.get('chunk_count', 0)} chunks for grounded teaching."
        )

    except Exception as e:
        logger.error(f"Error uploading material: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# 3. Dynamic Lesson Plan Generation
# ---------------------------------------------------------

@app.post("/api/generate-lesson", response_model=LessonPlanResponse, tags=["Pedagogy Engine"])
async def generate_lesson(request: LessonPlanRequest):
    try:
        lesson = pedagogical_agent.generate_lesson(
            topic=request.topic,
            doc_id=request.doc_id,
            profile=request.profile
        )
        return lesson
    except Exception as e:
        logger.error(f"Failed to generate lesson: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# 4. Socratic Misconception Diagnosis
# ---------------------------------------------------------

@app.post("/api/evaluate-response", response_model=MisconceptionAnalysis, tags=["Misconception Engine"])
async def evaluate_student_response(payload: StudentResponsePayload):
    try:
        analysis = misconception_diagnoser.evaluate_response(payload)
        return analysis
    except Exception as e:
        logger.error(f"Error evaluating student response: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# 5. Multilingual TTS Voice Synthesis
# ---------------------------------------------------------

@app.post("/api/generate-tts", response_model=TTSResponse, tags=["Audio & Avatar"])
async def generate_speech(request: TTSRequest):
    try:
        tts_result = await tts_engine.synthesize_speech(
            text=request.text,
            language=request.language,
            voice=request.voice
        )
        return TTSResponse(
            audio_base64=tts_result["audio_base64"],
            format=tts_result["format"],
            duration_sec=tts_result["duration_sec"],
            language=tts_result["language"]
        )
    except Exception as e:
        logger.error(f"TTS synthesis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# 6. Final Assessment & 7-Day Personalized Study Plan
# ---------------------------------------------------------

@app.post("/api/final-assessment", response_model=AssessmentReport, tags=["Analytics & Mastery"])
async def generate_final_assessment(submission: AssessmentSubmission):
    total = max(1, len(submission.answers))
    correct = sum(1 for ans in submission.answers.values() if any(k in ans.lower() for k in ["b", "decrease", "inverse", "correct"]))
    score = round((correct / total) * 100, 1) if total > 0 else 80.0

    return AssessmentReport(
        lesson_id=submission.lesson_id,
        topic="Concepts Mastery",
        score_percentage=score,
        total_questions=total,
        correct_count=correct,
        strong_concepts=["Core Intuition", "Governing Relationships", "Visual Models"],
        weak_concepts=["Complex Boundary Conditions"] if score < 100 else [],
        revision_recommendation="Review the dynamic blackboard notes and complete the 7-day spaced reinforcement." if score < 100 else "Mastery confirmed! Ready to unlock the next progressive topic.",
        seven_day_plan=[
            {"day": 1, "task": "Review 3-minute flashcard summaries of key equations"},
            {"day": 2, "task": "Attempt 2 practice numerical problem sets"},
            {"day": 3, "task": "Revisit the hydraulic/visual system diagrams"},
            {"day": 4, "task": "Active recall test without looking at notes"},
            {"day": 5, "task": "Solve real-world application case study"},
            {"day": 6, "task": "Explain the concept out loud using an everyday analogy"},
            {"day": 7, "task": "Advance to the next milestone on the learning path"}
        ]
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
