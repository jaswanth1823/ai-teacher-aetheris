import os
import json
import uuid
import logging
from typing import List, Dict, Any, Optional

from app.schemas import (
    LearnerProfile,
    LessonPlanResponse,
    LessonBeat,
    BlackboardAction,
    InteractiveQuestion
)
from app.rag_engine import rag_engine

logger = logging.getLogger("aetheris.pedagogy")

class PedagogicalAgent:
    """
    Cognitive Pedagogical Brain modeling an expert Human Educator.
    Implements the 8-stage pedagogical cycle:
    Understand -> Plan -> Explain -> Demonstrate -> Checkpoint -> Adapt -> Re-evaluate.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.has_gemini = bool(self.api_key and len(self.api_key.strip()) > 5)
        if self.has_gemini:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel("gemini-1.5-flash")
                logger.info("PedagogicalAgent initialized with Google Gemini 1.5 Flash.")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini client: {e}. Falling back to rule-based engine.")
                self.has_gemini = False
        else:
            logger.info("No GEMINI_API_KEY found. PedagogicalAgent running in high-fidelity deterministic mode.")

    def generate_lesson(
        self,
        topic: Optional[str],
        doc_id: Optional[str],
        profile: LearnerProfile
    ) -> LessonPlanResponse:
        """
        Synthesizes a complete multi-track synchronized lesson plan.
        """
        # 1. Gather Grounded Knowledge
        context = ""
        resolved_topic = topic or "Fundamental Concepts"
        if doc_id and doc_id in rag_engine.in_memory_docs:
            context = rag_engine.retrieve_context(doc_id, resolved_topic, top_k=4)
            if not topic:
                resolved_topic = rag_engine.in_memory_docs[doc_id]["chapters"][0]
        else:
            context = rag_engine.synthesize_topic_curriculum(resolved_topic, profile.level, profile.language)

        # 2. Determine Beat Count based on Time Allocation
        if profile.available_time_minutes <= 5:
            target_beats = 3
        elif profile.available_time_minutes <= 25:
            target_beats = 5
        else:
            target_beats = 8

        # 3. Attempt LLM Generation if API key is active
        if self.has_gemini:
            try:
                return self._generate_with_gemini(resolved_topic, context, profile, target_beats)
            except Exception as e:
                logger.error(f"Gemini generation error: {e}. Falling back to structured generator.")

        # 4. Fallback: Robust High-Fidelity Pedagogical Builder
        return self._generate_structured_lesson(resolved_topic, profile, target_beats)

    def _generate_with_gemini(
        self,
        topic: str,
        context: str,
        profile: LearnerProfile,
        target_beats: int
    ) -> LessonPlanResponse:
        """
        Generates dynamic lesson with Gemini using strict JSON schema.
        """
        prompt = f"""
You are AETHERIS, an expert human teacher conducting a synchronized video lecture.
Topic: {topic}
Learner Level: {profile.level} (Beginner: simple analogies, Intermediate: mechanics & logic, Advanced: rigorous math/code)
Available Time: {profile.available_time_minutes} minutes ({target_beats} core beats)
Teaching Language: {profile.language} (If Hinglish: write spoken text in conversational Hindi-English mix e.g., 'Aaj hum dekhenge ki...').

Context Material:
{context[:2000]}

Generate a valid JSON object matching this schema:
{{
  "lesson_title": "{topic}",
  "total_duration_minutes": {profile.available_time_minutes},
  "target_level": "{profile.level}",
  "language": "{profile.language}",
  "summary": "Brief 2-sentence pedagogical roadmap",
  "beats": [
    {{
      "beat_id": 1,
      "timestamp_sec": 0.0,
      "spoken_text": "Engaging conversational spoken explanation by the teacher",
      "avatar_emotion": "welcoming",
      "avatar_gesture": "pointing_board",
      "board_action": {{
        "type": "latex" | "mermaid" | "code" | "diagram" | "bullet_points" | "3d_simulation",
        "title": "Title for this board card",
        "content": "Raw KaTeX equation, Mermaid graph, code snippet, or 3D simulation model name (e.g. physics_circuit, atomic_orbital, neural_network, math_surface)"
      }},
      "is_checkpoint": false,
      "question": null
    }}
  ]
}}
Ensure at least one beat in the middle has "is_checkpoint": true with a thought-provoking "question".
Return ONLY valid JSON.
"""
        response = self.model.generate_content(prompt)
        text_content = response.text.strip()
        # Strip markdown json code fences if present
        if text_content.startswith("```json"):
            text_content = text_content[7:]
        if text_content.endswith("```"):
            text_content = text_content[:-3]

        parsed = json.loads(text_content.strip())
        beats = [LessonBeat(**b) for b in parsed["beats"]]

        return LessonPlanResponse(
            lesson_id=f"lsn_{uuid.uuid4().hex[:8]}",
            lesson_title=parsed.get("lesson_title", topic),
            total_duration_minutes=profile.available_time_minutes,
            target_level=profile.level,
            language=profile.language,
            summary=parsed.get("summary", "Personalized interactive lesson with live blackboard visuals."),
            beats=beats
        )

    def _generate_structured_lesson(
        self,
        topic: str,
        profile: LearnerProfile,
        target_beats: int
    ) -> LessonPlanResponse:
        """
        High-fidelity deterministic lesson builder ensuring zero failure during live hackathon demos.
        """
        is_hinglish = any(k in profile.language.lower() for k in ["hinglish", "hindi"])
        is_advanced = profile.level.lower() == "advanced"
        is_beginner = profile.level.lower() == "beginner"

        beats: List[LessonBeat] = []

        # Determine best 3D simulation based on topic
        topic_lower = topic.lower()
        if any(k in topic_lower for k in ["circuit", "ohm", "current", "voltage", "resistance", "electricity", "pipe", "fluid"]):
            sim_model = "physics_circuit"
        elif any(k in topic_lower for k in ["atom", "orbital", "electron", "quantum", "physics", "chemistry", "nucleus"]):
            sim_model = "atomic_orbital"
        elif any(k in topic_lower for k in ["ai", "neural", "machine learning", "deep learning", "network", "brain"]):
            sim_model = "neural_network"
        else:
            sim_model = "math_surface"

        # Beat 1: Warm Intro & Core Definition
        if is_hinglish:
            b1_speech = f"Namaste! Aaj hum '{topic}' ko ekdum clear aur simple tareeqe se samjhenge. Koi ratta marne ki zaroorat nahi hai!"
        else:
            b1_speech = f"Welcome! Today we will demystify '{topic}' step-by-step with practical intuition and zero unnecessary jargon."

        beats.append(LessonBeat(
            beat_id=1,
            timestamp_sec=0.0,
            spoken_text=b1_speech,
            avatar_emotion="welcoming",
            avatar_gesture="pointing_board",
            board_action=BlackboardAction(
                type="latex" if is_advanced else "bullet_points",
                title=f"Core Foundation: {topic}",
                content=r"V = I \times R \quad \Longleftrightarrow \quad I = \frac{V}{R}" if "ohm" in topic_lower else (r"\mathcal{F}(x) = \int_{0}^{\infty} K(x, t) \cdot \phi(t) \, dt" if is_advanced else f"• Topic: {topic}\n• Key Objective: Build intuitive 3D mental model\n• Target Level: {profile.level}")
            ),
            is_checkpoint=False
        ))

        # Beat 2: Interactive 3D Simulation & Visual Demonstration
        if is_hinglish:
            b2_speech = f"Ab dekhiye board par iska live 3D simulation! Aap is 3D model ko mouse se rotate karke dekh sakte hain ki particles aur system dynamics real-time mein kaise move karte hain."
        else:
            b2_speech = f"Now, observe the live interactive 3D simulation on our blackboard. You can orbit, rotate, and zoom into this 3D model to see the real-time dynamics in action."

        beats.append(LessonBeat(
            beat_id=2,
            timestamp_sec=20.0,
            spoken_text=b2_speech,
            avatar_emotion="explaining",
            avatar_gesture="sketching",
            board_action=BlackboardAction(
                type="3d_simulation",
                title=f"Interactive 3D Simulation: {topic}",
                content=sim_model
            ),
            is_checkpoint=False
        ))

        # Beat 3: Socratic Checkpoint
        if is_hinglish:
            b3_speech = f"Chaliye dekhte hain ki concept kitna samajh aaya! Ek simple sawal: agar hum input parameters ko modify karein, toh overall output par kya direct asar padega?"
        else:
            b3_speech = f"Now, let's pause for a quick conceptual checkpoint. What fundamentally happens to the system output if the driving constraint is doubled?"

        beats.append(LessonBeat(
            beat_id=3,
            timestamp_sec=45.0,
            spoken_text=b3_speech,
            avatar_emotion="questioning",
            avatar_gesture="hand_open",
            board_action=BlackboardAction(
                type="bullet_points",
                title="Socratic Checkpoint",
                content=f"• Question on: {topic}\n• What happens when the primary parameter changes?\n• Speak or select your answer below."
            ),
            is_checkpoint=True,
            question=InteractiveQuestion(
                question_id="q_core_01",
                question_type="conceptual_mcq",
                prompt=f"In the context of {topic}, what is the primary factor that governs stability and behavior?",
                options=[
                    "A) The inverse balance of system constraints",
                    "B) Pure random fluctuation without governing laws",
                    "C) Total independence from all initial parameters",
                    "D) Static equilibrium with zero energy transfer"
                ],
                expected_concept=f"Governing relationship and constraint balance in {topic}",
                hints=["Think about how the input and output variables are linked in the diagram."]
            )
        ))

        # Beat 4: Practical Application / Code / Derivation (if > 3 beats)
        if target_beats >= 4:
            if is_hinglish:
                b4_speech = f"Bohot badhiya! Ab dekhte hain iska real-world application ya mathematical implementation kaise code mein translate hota hai."
            else:
                b4_speech = f"Excellent! Let us now see how this translates into actual executable code and problem solving."

            beats.append(LessonBeat(
                beat_id=4,
                timestamp_sec=75.0,
                spoken_text=b4_speech,
                avatar_emotion="explaining",
                avatar_gesture="pointing_board",
                board_action=BlackboardAction(
                    type="code",
                    title="Implementation / Execution Demonstration",
                    language="python",
                    content=f"def solve_{topic.lower().replace(' ', '_')[:12]}(input_val):\n    # Apply governing law\n    efficiency_factor = 0.85\n    result = input_val * efficiency_factor\n    return result\n\n# Example Test\nprint('Output:', solve_{topic.lower().replace(' ', '_')[:12]}(100))",
                    execution_output="Output: 85.0"
                ),
                is_checkpoint=False
            ))

        # Beat 5: Lesson Synthesis & Summary
        if is_hinglish:
            b5_speech = f"Awesome work! Humne {topic} ke foundational principles, visual diagram aur practical example cover kar liye hain. Ready for the final quiz?"
        else:
            b5_speech = f"Fantastic work! We have systematically mastered the core definitions, visual dynamics, and practical implementations of {topic}."

        beats.append(LessonBeat(
            beat_id=len(beats) + 1,
            timestamp_sec=100.0,
            spoken_text=b5_speech,
            avatar_emotion="celebrating",
            avatar_gesture="nodding",
            board_action=BlackboardAction(
                type="bullet_points",
                title="Lesson Mastery Recap",
                content=f"✓ Mastered: Core intuition & definitions\n✓ Visualized: Workflow diagram\n✓ Verified: Socratic reasoning\n✓ Applied: Real-world implementation"
            ),
            is_checkpoint=False
        ))

        return LessonPlanResponse(
            lesson_id=f"lsn_{uuid.uuid4().hex[:8]}",
            lesson_title=f"Mastering {topic}",
            total_duration_minutes=profile.available_time_minutes,
            target_level=profile.level,
            language=profile.language,
            summary=f"A high-impact {profile.available_time_minutes}-minute interactive video session on {topic} for {profile.level} learners in {profile.language}.",
            beats=beats
        )

# Global singleton
pedagogical_agent = PedagogicalAgent()
