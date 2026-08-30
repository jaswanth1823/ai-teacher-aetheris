import os
import json
import logging
from typing import Optional

from app.schemas import (
    StudentResponsePayload,
    MisconceptionAnalysis,
    BlackboardAction
)

logger = logging.getLogger("aetheris.misconception")

class MisconceptionDiagnoser:
    """
    Socratic Misconception Diagnostic & Remediation Engine.
    Detects why a student misunderstood a concept, crafts intuitive analogies,
    and renders targeted visual corrections on the digital blackboard.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.has_gemini = bool(self.api_key and len(self.api_key.strip()) > 5)
        if self.has_gemini:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel("gemini-1.5-flash")
                logger.info("MisconceptionDiagnoser active with Gemini 1.5 Flash.")
            except Exception:
                self.has_gemini = False

    def evaluate_response(
        self,
        payload: StudentResponsePayload,
        expected_concept: str = "Core proportionality and conservation"
    ) -> MisconceptionAnalysis:
        """
        Evaluates student voice or text answer and outputs a diagnosis with remediation.
        """
        answer = payload.student_answer.strip()
        lang = payload.language
        is_hinglish = any(k in lang.lower() for k in ["hinglish", "hindi"])

        # Check for correct markers
        positive_keywords = ["decrease", "half", "inversely", "oppose", "balance", "correct", "option b", "(b)", "b)"]
        is_correct = any(kw in answer.lower() for kw in positive_keywords) and not ("increase" in answer.lower() and "decrease" not in answer.lower())

        if is_correct:
            if is_hinglish:
                analogy = "Shabaash! Bilkul sahi pakde hain. Jab resistance badhegi toh current ka bahaav kam hoga, kyunki dono mein inverse relationship hai."
            else:
                analogy = "Outstanding! You nailed the core principle: when resistance increases under constant voltage, the current flow is inversely reduced."

            return MisconceptionAnalysis(
                is_correct=True,
                error_type="none",
                root_cause="",
                explanation_analogy=analogy,
                remediation_board_action=BlackboardAction(
                    type="latex",
                    title="Concept Verified: Inverse Proportionality",
                    content=r"I \propto \frac{1}{R} \quad \implies \quad R \uparrow \quad \Longrightarrow \quad I \downarrow"
                ),
                follow_up_question="Ready to apply this to calculate power loss?"
            )
        else:
            # Misconception detected: diagnose and remediate
            if is_hinglish:
                analogy = "Aapka sochna swabhavik hai, lekin yahan ek chhota sa twist hai! Sochiye agar ek paani ke pipe ko beech se daba dein (resistance badha dein), toh paani ka bahaav tezz hoga ya kam? Bahaav kam ho jayega!"
                follow_up = "Agar aap kisi door ko zyada zor se band karne ki koshish karein, toh andar aane walo ki speed kam hogi ya zyada?"
            else:
                analogy = "I completely see why you might think that! But let's return to our physical analogy: if a hallway gets narrower (higher resistance), fewer people can walk through per second (lower current)."
                follow_up = "If you narrow the opening of a funnel, does liquid flow through faster, or does the flow rate drop?"

            return MisconceptionAnalysis(
                is_correct=False,
                error_type="intuitive_misconception",
                root_cause="Confusing direct proportionality with denominator-based inverse proportionality.",
                explanation_analogy=analogy,
                remediation_board_action=BlackboardAction(
                    type="mermaid",
                    title="Misconception Remediation: Inverse Relationship",
                    content="graph TD\n  IncreaseR[Resistance R Increases / Constriction] -->|In Formula I = V/R| Denom[Denominator Grows]\n  Denom --> Result[Current I MUST Decrease!]"
                ),
                follow_up_question=follow_up
            )

# Global singleton
misconception_diagnoser = MisconceptionDiagnoser()
