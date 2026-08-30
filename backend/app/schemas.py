from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field
import uuid

# ---------------------------------------------------------
# 1. Learner Profile & Configuration
# ---------------------------------------------------------

class LearnerProfile(BaseModel):
    level: Literal["Beginner", "Intermediate", "Advanced"] = Field(
        default="Beginner",
        description="Target educational level of the student"
    )
    available_time_minutes: int = Field(
        default=20,
        description="Total available time for the lesson (e.g., 5, 20, 60 minutes)"
    )
    language: str = Field(
        default="English",
        description="Preferred language or dialect (e.g., English, Hindi, Hinglish, Tamil, Spanish)"
    )
    subject_goal: Optional[str] = Field(
        default="Master core concepts and problem solving",
        description="Primary learning goal of the student"
    )
    teaching_style: Optional[str] = Field(
        default="Socratic with intuitive analogies and live visual demonstrations",
        description="Teacher tone and pedagogy preference"
    )
    existing_knowledge: Optional[str] = Field(
        default="",
        description="Prior background knowledge or prerequisite concepts known"
    )


# ---------------------------------------------------------
# 2. Smart Blackboard & Visual Synchronization Models
# ---------------------------------------------------------

class BlackboardAction(BaseModel):
    type: Literal["latex", "mermaid", "code", "diagram", "bullet_points", "3d_simulation", "clear"] = Field(
        default="bullet_points",
        description="Visual format to render on the smart digital blackboard"
    )
    title: str = Field(
        default="Key Concept",
        description="Header or title for the blackboard card"
    )
    content: str = Field(
        default="",
        description="Raw LaTeX equation, Mermaid markdown diagram, code snippet, or formatted text"
    )
    language: Optional[str] = Field(
        default=None,
        description="Programming language if type is 'code' (e.g., python, javascript, cpp)"
    )
    execution_output: Optional[str] = Field(
        default=None,
        description="Simulated console output if code execution demonstration is shown"
    )
    highlight_lines: Optional[List[int]] = Field(
        default_factory=list,
        description="Lines of code or equations to emphasize"
    )


# ---------------------------------------------------------
# 3. Interactive Socratic Questioning & Checkpoint Models
# ---------------------------------------------------------

class InteractiveQuestion(BaseModel):
    question_id: str = Field(
        default_factory=lambda: f"q_{uuid.uuid4().hex[:8]}",
        description="Unique identifier for the checkpoint question"
    )
    question_type: Literal["conceptual_mcq", "short_answer", "explain_in_words", "calculation"] = Field(
        default="conceptual_mcq",
        description="Question format presented to the student"
    )
    prompt: str = Field(
        ...,
        description="The question prompt delivered by the AI teacher"
    )
    options: Optional[List[str]] = Field(
        default=None,
        description="Multiple-choice options if question_type is 'conceptual_mcq'"
    )
    expected_concept: str = Field(
        ...,
        description="The fundamental understanding or scientific law being tested"
    )
    hints: List[str] = Field(
        default_factory=list,
        description="Progressive pedagogical hints if the student struggles"
    )


# ---------------------------------------------------------
# 4. Multi-Track Lesson Beat & Structured Plan
# ---------------------------------------------------------

class LessonBeat(BaseModel):
    beat_id: int = Field(
        ...,
        description="Sequential index of the teaching beat"
    )
    timestamp_sec: float = Field(
        default=0.0,
        description="Estimated start time in seconds for synchronization"
    )
    spoken_text: str = Field(
        ...,
        description="Conversational script spoken by the AI avatar"
    )
    avatar_emotion: Literal["welcoming", "explaining", "questioning", "encouraging", "celebrating", "thinking"] = Field(
        default="explaining",
        description="Facial expression and state for the AI avatar"
    )
    avatar_gesture: Literal["neutral", "pointing_board", "nodding", "hand_open", "sketching"] = Field(
        default="pointing_board",
        description="Gesture performed by the avatar"
    )
    board_action: BlackboardAction = Field(
        ...,
        description="Visual action rendered simultaneously on the smart blackboard"
    )
    is_checkpoint: bool = Field(
        default=False,
        description="Whether this beat pauses the video for student interaction"
    )
    question: Optional[InteractiveQuestion] = Field(
        default=None,
        description="Interactive question attached to this checkpoint beat"
    )


class LessonPlanRequest(BaseModel):
    topic: Optional[str] = Field(
        default=None,
        description="Direct topic or question provided by the student"
    )
    doc_id: Optional[str] = Field(
        default=None,
        description="Identifier of previously uploaded learning document"
    )
    profile: LearnerProfile = Field(
        default_factory=LearnerProfile,
        description="Personalized learner profile"
    )


class LessonPlanResponse(BaseModel):
    lesson_id: str = Field(
        default_factory=lambda: f"lsn_{uuid.uuid4().hex[:8]}",
        description="Unique identifier for the generated lesson"
    )
    lesson_title: str = Field(
        ...,
        description="Human-readable title of the lesson"
    )
    total_duration_minutes: int = Field(
        ...,
        description="Pacing duration (e.g. 5, 20, 60 minutes)"
    )
    target_level: str = Field(
        ...,
        description="Beginner, Intermediate, or Advanced"
    )
    language: str = Field(
        ...,
        description="Teaching language (English, Hindi, Hinglish, etc.)"
    )
    summary: str = Field(
        ...,
        description="High-level pedagogical roadmap and objectives"
    )
    beats: List[LessonBeat] = Field(
        ...,
        description="Sequential multi-track beats of the video teaching experience"
    )


# ---------------------------------------------------------
# 5. Misconception Diagnostic & Adaptive Remediation
# ---------------------------------------------------------

class StudentResponsePayload(BaseModel):
    lesson_id: str
    beat_id: int
    question_id: str
    student_answer: str
    audio_base64: Optional[str] = None
    language: str = "English"


class MisconceptionAnalysis(BaseModel):
    is_correct: bool = Field(
        ...,
        description="Whether the student's answer accurately captures the concept"
    )
    error_type: Literal["none", "intuitive_misconception", "definition_confusion", "calculation_error", "incomplete_reasoning"] = Field(
        default="none",
        description="Categorization of the cognitive obstacle"
    )
    root_cause: str = Field(
        default="",
        description="Exact reason why the student arrived at the misconception"
    )
    explanation_analogy: str = Field(
        ...,
        description="Spoken re-explanation using a memorable analogy in the student's chosen language"
    )
    remediation_board_action: BlackboardAction = Field(
        ...,
        description="Dynamic visual to illustrate the correction on the blackboard"
    )
    follow_up_question: str = Field(
        ...,
        description="Socratic micro-question to verify the misconception is resolved"
    )


# ---------------------------------------------------------
# 6. Final Assessment, Analytics & 7-Day Plan
# ---------------------------------------------------------

class AssessmentQuestion(BaseModel):
    id: str = Field(default_factory=lambda: f"aq_{uuid.uuid4().hex[:6]}")
    question: str
    type: Literal["mcq", "short_answer", "problem"] = "mcq"
    options: Optional[List[str]] = None
    correct_answer: str
    concept_tested: str
    explanation: str


class AssessmentSubmission(BaseModel):
    lesson_id: str
    answers: Dict[str, str] = Field(
        ...,
        description="Map of question_id to student's selected or written answer"
    )


class AssessmentReport(BaseModel):
    lesson_id: str
    topic: str
    score_percentage: float
    total_questions: int
    correct_count: int
    strong_concepts: List[str]
    weak_concepts: List[str]
    revision_recommendation: str
    seven_day_plan: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Day-by-day micro tasks for retention and revision"
    )


# ---------------------------------------------------------
# 7. Document Upload & TTS Schemas
# ---------------------------------------------------------

class DocUploadResponse(BaseModel):
    doc_id: str
    filename: str
    total_pages: int
    file_size_kb: float
    chapters_detected: List[str]
    summary: str


class TTSRequest(BaseModel):
    text: str
    language: str = "English"
    voice: Optional[str] = None
    speed: Optional[float] = 1.0


class TTSResponse(BaseModel):
    audio_base64: str
    format: str = "audio/mp3"
    duration_sec: float
    language: str
