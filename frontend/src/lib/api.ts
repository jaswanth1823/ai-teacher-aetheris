const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface LearnerProfile {
  level: "Beginner" | "Intermediate" | "Advanced";
  available_time_minutes: number;
  language: string;
  subject_goal?: string;
  teaching_style?: string;
  existing_knowledge?: string;
}

export interface BlackboardAction {
  type: "latex" | "mermaid" | "code" | "diagram" | "bullet_points" | "3d_simulation" | "clear";
  title: string;
  content: string;
  language?: string;
  execution_output?: string;
  highlight_lines?: number[];
}

export interface InteractiveQuestion {
  question_id: string;
  question_type: "conceptual_mcq" | "short_answer" | "explain_in_words" | "calculation";
  prompt: string;
  options?: string[];
  expected_concept: string;
  hints: string[];
}

export interface LessonBeat {
  beat_id: number;
  timestamp_sec: number;
  spoken_text: string;
  avatar_emotion: "welcoming" | "explaining" | "questioning" | "encouraging" | "celebrating" | "thinking";
  avatar_gesture: "neutral" | "pointing_board" | "nodding" | "hand_open" | "sketching";
  board_action: BlackboardAction;
  is_checkpoint: boolean;
  question?: InteractiveQuestion;
}

export interface LessonPlanResponse {
  lesson_id: string;
  lesson_title: string;
  total_duration_minutes: number;
  target_level: string;
  language: string;
  summary: string;
  beats: LessonBeat[];
}

export interface MisconceptionAnalysis {
  is_correct: boolean;
  error_type: string;
  root_cause: string;
  explanation_analogy: string;
  remediation_board_action: BlackboardAction;
  follow_up_question: string;
}

export interface AssessmentReport {
  lesson_id: string;
  topic: string;
  score_percentage: number;
  total_questions: number;
  correct_count: number;
  strong_concepts: string[];
  weak_concepts: string[];
  revision_recommendation: string;
  seven_day_plan: { day: number; task: string }[];
}

export interface DocUploadResponse {
  doc_id: string;
  filename: string;
  total_pages: number;
  file_size_kb: number;
  chapters_detected: string[];
  summary: string;
}

// ---------------------------------------------------------
// API Client Functions
// ---------------------------------------------------------

export async function uploadMaterial(file: File, subjectHint?: string): Promise<DocUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (subjectHint) {
    formData.append("subject_hint", subjectHint);
  }

  const res = await fetch(`${API_BASE_URL}/api/upload-material`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${await res.text()}`);
  }
  return res.json();
}

export async function generateLesson(payload: {
  topic?: string;
  doc_id?: string;
  profile: LearnerProfile;
}): Promise<LessonPlanResponse> {
  const res = await fetch(`${API_BASE_URL}/api/generate-lesson`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Lesson generation failed: ${await res.text()}`);
  }
  return res.json();
}

export async function evaluateResponse(payload: {
  lesson_id: string;
  beat_id: number;
  question_id: string;
  student_answer: string;
  question_prompt?: string;
  expected_concept?: string;
  language?: string;
}): Promise<MisconceptionAnalysis> {
  const res = await fetch(`${API_BASE_URL}/api/evaluate-response`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      language: payload.language || "English",
    }),
  });

  if (!res.ok) {
    throw new Error(`Evaluation failed: ${await res.text()}`);
  }
  return res.json();
}

export async function generateTTSAudio(text: string, language: string = "English"): Promise<string> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/generate-tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
    });

    if (!res.ok) return "";
    const data = await res.json();
    return data.audio_base64 ? `data:audio/mp3;base64,${data.audio_base64}` : "";
  } catch (err) {
    console.warn("TTS fetch fallback:", err);
    return "";
  }
}

export async function submitFinalAssessment(lesson_id: string, answers: Record<string, string>): Promise<AssessmentReport> {
  const res = await fetch(`${API_BASE_URL}/api/final-assessment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lesson_id, answers }),
  });

  if (!res.ok) {
    throw new Error(`Assessment failed: ${await res.text()}`);
  }
  return res.json();
}
