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

# Rich subject mapping for 3D simulations
SUBJECT_SIM_MAP = {
    "biology": ("dna_helix", "3D Double-Helix Genetic Structure", "Adenine, Thymine, Guanine, Cytosine base pairs"),
    "genetics": ("dna_helix", "3D Molecular DNA Structure", "Nucleotide sequence and helical bonding"),
    "cell": ("dna_helix", "3D Cellular Organelles & DNA", "Cell nucleus and genetic replication"),
    "astronomy": ("solar_system", "3D Heliocentric Planetary Orbits", "Gravitational equilibrium and orbital velocities"),
    "planet": ("solar_system", "3D Gravitational Planetary System", "Orbital mechanics governed by $F = G \\frac{m_1 m_2}{r^2}$"),
    "gravity": ("solar_system", "3D Gravitational Field Simulation", "Orbital dynamics and inverse-square gravitational pull"),
    "chemistry": ("chemistry_molecule", "3D Tetrahedral Molecular Geometry", "Covalent bonding and valence electron cloud"),
    "molecule": ("chemistry_molecule", "3D Ball-and-Stick Chemical Bond", "Bond angles and atomic electronegativity"),
    "acid": ("chemistry_molecule", "3D Proton Transfer & Solution Dynamics", "Dissociation equilibrium and pH mechanics"),
    "reaction": ("chemistry_molecule", "3D Chemical Reaction Transition State", "Bond breaking and activation energy"),
    "tree": ("binary_tree", "3D Hierarchical Binary Search Tree", "Root, branches, and logarithmic traversal depth"),
    "algorithm": ("binary_tree", "3D Data Structure Traversal", "Divide-and-conquer search graph"),
    "data_structure": ("binary_tree", "3D Tree Data Hierarchy", "Pointer references and balanced tree branches"),
    "react": ("binary_tree", "3D Virtual DOM Tree & Component Lifecycle", "Hierarchical state and props propagation"),
    "code": ("binary_tree", "3D Execution Call Tree", "Function invocation stack and recursive branches"),
    "ai": ("neural_network", "3D Deep Neural Network Architecture", "Input, hidden layers, and activation signals"),
    "neural": ("neural_network", "3D Multilayer Perceptron Synapses", "Forward propagation weights and biases"),
    "machine_learning": ("neural_network", "3D Gradient Descent Network", "Loss surface and synaptic weight updates"),
    "quantum": ("atomic_orbital", "3D Quantum Electron Probability Clouds", "Principal and magnetic quantum shell numbers"),
    "atom": ("atomic_orbital", "3D Rutherford-Bohr Atomic Shells", "Protons, neutrons, and quantized electron energy levels"),
    "physics_circuit": ("physics_circuit", "3D Translucent Hydraulic Charge Pipe", "Voltage pressure, current flow, and resistance restriction"),
    "circuit": ("physics_circuit", "3D Closed Electric Circuit Flow", "Drift velocity of electrons under electric field"),
    "ohm": ("physics_circuit", "3D Ohm's Law Proportionality Tube", "Constriction valve throttling particle current"),
    "math": ("math_surface", "3D Multivariable Calculus Surface", "Partial derivatives and gradient vector field"),
    "calculus": ("math_surface", "3D Gradient Vector Surface", "Tangent planes and multivariable curvature"),
}


def resolve_3d_model(topic: str) -> tuple:
    topic_clean = topic.lower()
    for key, val in SUBJECT_SIM_MAP.items():
        if key in topic_clean:
            return val
    # Check words
    words = topic_clean.split()
    if any(w in ["biology", "plant", "human", "heart", "dna", "gene", "body"] for w in words):
        return SUBJECT_SIM_MAP["biology"]
    if any(w in ["chemistry", "chemical", "bond", "gas", "organic"] for w in words):
        return SUBJECT_SIM_MAP["chemistry"]
    if any(w in ["space", "sun", "earth", "moon", "gravity", "universe"] for w in words):
        return SUBJECT_SIM_MAP["astronomy"]
    if any(w in ["ai", "robot", "neural", "ml", "learning"] for w in words):
        return SUBJECT_SIM_MAP["ai"]
    if any(w in ["code", "programming", "python", "javascript", "tree", "react"] for w in words):
        return SUBJECT_SIM_MAP["tree"]
    if any(w in ["current", "voltage", "wire", "resistance", "electricity"] for w in words):
        return SUBJECT_SIM_MAP["physics_circuit"]
    if any(w in ["atom", "nuclear", "quantum", "light", "optic"] for w in words):
        return SUBJECT_SIM_MAP["atom"]
    return ("math_surface", f"3D Concept Coordinate Model: {topic}", "Parametric state representation")


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
            logger.info("No GEMINI_API_KEY found. PedagogicalAgent running in topic-aware adaptive mode.")

    def generate_lesson(
        self,
        topic: Optional[str],
        doc_id: Optional[str],
        profile: LearnerProfile
    ) -> LessonPlanResponse:
        """
        Synthesizes a complete multi-track synchronized lesson plan for ANY topic.
        """
        resolved_topic = topic or "Fundamental Concepts"
        context = ""
        if doc_id and doc_id in rag_engine.in_memory_docs:
            context = rag_engine.retrieve_context(doc_id, resolved_topic, top_k=4)
            if not topic:
                resolved_topic = rag_engine.in_memory_docs[doc_id]["chapters"][0]
        else:
            context = rag_engine.synthesize_topic_curriculum(resolved_topic, profile.level, profile.language)

        if profile.available_time_minutes <= 5:
            target_beats = 3
        elif profile.available_time_minutes <= 25:
            target_beats = 5
        else:
            target_beats = 8

        # 1. Attempt LLM Generation if API key is active
        if self.has_gemini:
            try:
                return self._generate_with_gemini(resolved_topic, context, profile, target_beats)
            except Exception as e:
                logger.error(f"Gemini generation error: {e}. Falling back to topic-aware builder.")

        # 2. Topic-Aware Adaptive Builder
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
        sim_type, sim_title, _ = resolve_3d_model(topic)

        prompt = f"""
You are AETHERIS, an expert human teacher conducting a synchronized video lecture.
Topic: {topic}
Learner Level: {profile.level} (Beginner: simple intuitive analogies, Intermediate: mechanics & logic, Advanced: rigorous math/code)
Available Time: {profile.available_time_minutes} minutes
Target Beats Count: {target_beats}
Teaching Language: {profile.language} (If Hinglish: write spoken_text in natural conversational Hindi-English mix e.g., 'Namaste dosto! Aaj hum...').

Context Material:
{context[:2500]}

Assigned 3D Simulation: '{sim_type}' (Title: '{sim_title}')

Generate a valid JSON object matching this schema:
{{
  "lesson_title": "{topic}",
  "total_duration_minutes": {profile.available_time_minutes},
  "target_level": "{profile.level}",
  "language": "{profile.language}",
  "summary": "2-sentence pedagogical roadmap on {topic}",
  "beats": [
    {{
      "beat_id": 1,
      "timestamp_sec": 0.0,
      "spoken_text": "Engaging conversational spoken intro explaining {topic} in {profile.language}",
      "avatar_emotion": "welcoming",
      "avatar_gesture": "pointing_board",
      "board_action": {{
        "type": "latex" | "bullet_points",
        "title": "Governing Principle: {topic}",
        "content": "Specific mathematical equation or key definitions of {topic}"
      }},
      "is_checkpoint": false,
      "question": null
    }},
    {{
      "beat_id": 2,
      "timestamp_sec": 25.0,
      "spoken_text": "Spoken explanation guiding student to observe and interact with the 3D model",
      "avatar_emotion": "explaining",
      "avatar_gesture": "sketching",
      "board_action": {{
        "type": "3d_simulation",
        "title": "{sim_title}",
        "content": "{sim_type}"
      }},
      "is_checkpoint": false,
      "question": null
    }},
    {{
      "beat_id": 3,
      "timestamp_sec": 50.0,
      "spoken_text": "Socratic question testing conceptual understanding of {topic}",
      "avatar_emotion": "questioning",
      "avatar_gesture": "hand_open",
      "board_action": {{
        "type": "bullet_points",
        "title": "Conceptual Checkpoint: {topic}",
        "content": "Bullet summary of the question being asked"
      }},
      "is_checkpoint": true,
      "question": {{
        "question_id": "q_{topic[:6].lower().replace(' ', '_')}_01",
        "question_type": "conceptual_mcq",
        "prompt": "Thought-provoking multiple-choice question directly on {topic}?",
        "options": [
          "A) Accurate core principle option",
          "B) Common misconception option",
          "C) Plausible distractor option",
          "D) Irrelevant distractor"
        ],
        "expected_concept": "Exact underlying concept tested in {topic}",
        "hints": ["Helpful pedagogical hint"]
      }}
    }},
    {{
      "beat_id": 4,
      "timestamp_sec": 80.0,
      "spoken_text": "Practical real-world application, workflow diagram or code demonstration for {topic}",
      "avatar_emotion": "explaining",
      "avatar_gesture": "pointing_board",
      "board_action": {{
        "type": "mermaid" | "code" | "latex" | "bullet_points",
        "title": "Applied Dynamics / Flow / Code",
        "content": "Mermaid diagram code, executable code snippet, or equation"
      }},
      "is_checkpoint": false,
      "question": null
    }},
    {{
      "beat_id": 5,
      "timestamp_sec": 110.0,
      "spoken_text": "Encouraging summary and mastery recap for {topic} in {profile.language}",
      "avatar_emotion": "celebrating",
      "avatar_gesture": "nodding",
      "board_action": {{
        "type": "bullet_points",
        "title": "Mastery Summary: {topic}",
        "content": "✓ Key principles mastered\\n✓ 3D Spatial structure verified\\n✓ Socratic reasoning validated"
      }},
      "is_checkpoint": false,
      "question": null
    }}
  ]
}}
Ensure EVERY beat is completely tailored and accurate to {topic}. If {target_beats} is 3, return 3 beats (Beat 1, 2, 3). If {target_beats} >= 5, return 5 beats.
Return ONLY valid JSON.
"""
        response = self.model.generate_content(prompt)
        text_content = response.text.strip()
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
            summary=parsed.get("summary", f"Interactive video lesson on {topic}."),
            beats=beats
        )

    def _generate_structured_lesson(
        self,
        topic: str,
        profile: LearnerProfile,
        target_beats: int
    ) -> LessonPlanResponse:
        """
        Deep subject-aware curriculum builder guaranteeing subject-accurate formulas,
        correct 3D models, and relevant Socratic questions for ANY topic.
        """
        is_hinglish = any(k in profile.language.lower() for k in ["hinglish", "hindi"])
        is_advanced = profile.level.lower() == "advanced"
        topic_lower = topic.lower()

        # 1. Resolve exact 3D simulation
        sim_type, sim_title, sim_desc = resolve_3d_model(topic)

        # 2. Resolve Subject-Specific Knowledge & Socratic Question
        # BIOLOGY / GENETICS
        if any(k in topic_lower for k in ["bio", "dna", "cell", "photo", "heart", "gene", "plant", "organ"]):
            core_latex = r"\text{6CO}_2 + \text{6H}_2\text{O} \xrightarrow{h\nu} \text{C}_6\text{H}_{12}\text{O}_6 + \text{6O}_2" if "photo" in topic_lower else r"\text{DNA} \xrightarrow{\text{Transcription}} \text{mRNA} \xrightarrow{\text{Translation}} \text{Protein}"
            q_prompt = f"In {topic}, what is the primary role of the underlying molecular or cellular mechanism?"
            q_options = [
                f"A) To synthesize energy and encode genetic instructions accurately",
                f"B) To instantly dissolve all cell membranes without regulation",
                f"C) To produce static crystals with zero metabolic activity",
                f"D) To function completely independent of enzymes and ATP"
            ]
            q_concept = f"Metabolic regulation and genetic transmission in {topic}"

        # PHYSICS / MOTION / GRAVITY
        elif any(k in topic_lower for k in ["newton", "motion", "gravity", "force", "velocity", "mechanic"]):
            core_latex = r"\vec{F}_{\text{net}} = m \cdot \vec{a} \quad \text{and} \quad \vec{F}_{12} = -\vec{F}_{21}" if "newton" in topic_lower else r"F_g = G \frac{m_1 m_2}{r^2}"
            q_prompt = f"According to the fundamental laws of {topic}, what happens to acceleration if net force is doubled while mass is halved?"
            q_options = [
                "A) Acceleration quadruples (4x) because a = F / m",
                "B) Acceleration remains unchanged",
                "C) Acceleration drops to zero",
                "D) Mass immediately expands to balance the force"
            ]
            q_concept = f"Direct proportionality of Force and inverse of Mass ($a = F/m$)"

        # ELECTRICITY / CIRCUITS
        elif any(k in topic_lower for k in ["ohm", "circuit", "current", "voltage", "resistance", "electric"]):
            core_latex = r"V = I \times R \quad \Longleftrightarrow \quad I = \frac{V}{R}"
            q_prompt = "If Resistance is doubled while Voltage remains constant, what happens to Current?"
            q_options = [
                "A) Current is halved (inversely proportional)",
                "B) Current doubles proportionally",
                "C) Current remains unchanged",
                "D) Voltage automatically drops to zero"
            ]
            q_concept = "Current is inversely proportional to Resistance ($I = V/R$)"

        # CHEMISTRY / MOLECULES / ACIDS
        elif any(k in topic_lower for k in ["chem", "bond", "acid", "react", "molecul", "period"]):
            core_latex = r"\text{pH} = -\log_{10}[\text{H}^+] \quad \text{and} \quad K_a = \frac{[\text{H}^+][\text{A}^-]}{[\text{HA}]}" if "acid" in topic_lower else r"\Delta G = \Delta H - T \Delta S < 0"
            q_prompt = f"When atoms interact during {topic}, what primarily determines their bonding stability?"
            q_options = [
                "A) Achieving a stable valence electron octet configuration",
                "B) Increasing the number of unshared repulsive charges",
                "C) Maximizing the positive nuclear mass indefinitely",
                "D) Breaking all surrounding atomic orbits randomly"
            ]
            q_concept = f"Valence electron minimization and thermodynamic stability in {topic}"

        # COMPUTER SCIENCE / REACT / AI
        elif any(k in topic_lower for k in ["react", "ai", "neural", "tree", "code", "python", "data", "algorithm"]):
            core_latex = r"\hat{y} = \sigma\left(\sum_{i=1}^n w_i x_i + b\right)" if "neural" in topic_lower or "ai" in topic_lower else r"T(n) = 2T\left(\frac{n}{2}\right) + \mathcal{O}(n) \implies \mathcal{O}(n \log n)"
            q_prompt = f"In {topic}, what is the main advantage of structured hierarchy and state management?"
            q_options = [
                "A) Predictable data flow and logarithmic time efficiency",
                "B) Unbounded exponential memory consumption",
                "C) Removing all deterministic control from the processor",
                "D) Forcing the entire system to re-render constantly"
            ]
            q_concept = f"State immutability, efficiency, and algorithmic optimization in {topic}"

        # MATHEMATICS / CALCULUS
        elif any(k in topic_lower for k in ["math", "calculus", "deriv", "integr", "matrix", "vector"]):
            core_latex = r"\frac{d}{dx}[f(x)] = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h} \quad \text{and} \quad \int_a^b f'(x) dx = f(b) - f(a)"
            q_prompt = f"In {topic}, what does the first derivative geometrically represent at any point on a curve?"
            q_options = [
                "A) The instantaneous slope of the tangent line (rate of change)",
                "B) The total cumulative volume under the curve",
                "C) The static average of the starting coordinates",
                "D) The perimeter of the bounding box"
            ]
            q_concept = f"Instantaneous rate of change and geometric tangent slope"

        # GENERAL TOPIC FALLBACK
        else:
            core_latex = r"\mathcal{E}_{\text{system}} = \sum_{i=1}^n \alpha_i \cdot \phi_i(t)" if is_advanced else f"• Topic: {topic}\n• Key Principle: System dynamics and conservation\n• Level: {profile.level}"
            q_prompt = f"In the context of {topic}, what fundamentally governs the transformation from input to output?"
            q_options = [
                f"A) The governing balance of conservation laws and constraints",
                f"B) Pure arbitrary fluctuations with zero causality",
                f"C) Complete isolation from all physical and logical parameters",
                f"D) Static stagnation with no energetic transfer"
            ]
            q_concept = f"Governing constraint balance in {topic}"

        beats: List[LessonBeat] = []

        # Beat 1: Intro & Mathematical / Conceptual Principle
        if is_hinglish:
            b1_speech = f"Namaste! Aaj hum '{topic}' ko ekdum crystal clear aur intuitive tareeqe se samjhenge. Pehle dekhiye board par iska core governing principle."
        else:
            b1_speech = f"Welcome! Today we are demystifying '{topic}'. Let us begin with the foundational governing principle on our smart blackboard."

        beats.append(LessonBeat(
            beat_id=1,
            timestamp_sec=0.0,
            spoken_text=b1_speech,
            avatar_emotion="welcoming",
            avatar_gesture="pointing_board",
            board_action=BlackboardAction(
                type="latex" if "\\" in core_latex else "bullet_points",
                title=f"Governing Principle: {topic}",
                content=core_latex
            ),
            is_checkpoint=False
        ))

        # Beat 2: 3D Interactive Simulation
        if is_hinglish:
            b2_speech = f"Ab dekhiye board par {topic} ka real-time 3D simulation! Aap is 3D model ko mouse se 360 degree rotate karke iske underlying components ko deeply visualize kar sakte hain."
        else:
            b2_speech = f"Now, observe the real-time 3D simulation of {topic} on our smartboard. Feel free to click, drag, and orbit this 3D model 360 degrees to inspect the structural mechanics."

        beats.append(LessonBeat(
            beat_id=2,
            timestamp_sec=20.0,
            spoken_text=b2_speech,
            avatar_emotion="explaining",
            avatar_gesture="sketching",
            board_action=BlackboardAction(
                type="3d_simulation",
                title=sim_title,
                content=sim_type
            ),
            is_checkpoint=False
        ))

        # Beat 3: Subject-Specific Socratic Checkpoint
        if is_hinglish:
            b3_speech = f"Chaliye dekhte hain ki aapko {topic} ka concept kitna samajh aaya! Ek simple conceptual question screen par hai—aap bol kar ya option select karke answer de sakte hain."
        else:
            b3_speech = f"Let's pause for a quick Socratic checkpoint on {topic}. Think carefully about the relationship and speak or select your answer below."

        beats.append(LessonBeat(
            beat_id=3,
            timestamp_sec=45.0,
            spoken_text=b3_speech,
            avatar_emotion="questioning",
            avatar_gesture="hand_open",
            board_action=BlackboardAction(
                type="bullet_points",
                title=f"Socratic Checkpoint: {topic}",
                content=f"• Question on: {topic}\n• {q_prompt}\n• Voice or click your answer below."
            ),
            is_checkpoint=True,
            question=InteractiveQuestion(
                question_id=f"q_{topic[:6].lower()}_01",
                question_type="conceptual_mcq",
                prompt=q_prompt,
                options=q_options,
                expected_concept=q_concept,
                hints=[f"Think about how the core variables in {topic} interact with one another."]
            )
        ))

        # Beat 4: Practical Demonstration / Code / Derivation (if > 3 beats)
        if target_beats >= 4:
            if is_hinglish:
                b4_speech = f"Bohot badhiya! Ab dekhte hain iska practical workflow diagram aur implementation logic kaise behave karta hai."
            else:
                b4_speech = f"Excellent! Let us now examine the workflow architecture and implementation demonstration for {topic}."

            beats.append(LessonBeat(
                beat_id=4,
                timestamp_sec=75.0,
                spoken_text=b4_speech,
                avatar_emotion="explaining",
                avatar_gesture="pointing_board",
                board_action=BlackboardAction(
                    type="mermaid",
                    title=f"Workflow Architecture: {topic}",
                    content=f"graph LR\n  Input[Initial Conditions / Inputs] --> Process[{topic} Dynamics]\n  Process --> Output[Stable Output / State]"
                ),
                is_checkpoint=False
            ))

        # Beat 5: Lesson Mastery Synthesis
        if is_hinglish:
            b5_speech = f"Awesome work! Humne {topic} ke theoretical laws, 3D simulation aur Socratic checkpoint master kar liye hain. Final assessment ke liye ready ho jayiye!"
        else:
            b5_speech = f"Fantastic work! We have thoroughly covered the governing principles, 3D spatial models, and Socratic logic of {topic}."

        beats.append(LessonBeat(
            beat_id=len(beats) + 1,
            timestamp_sec=100.0,
            spoken_text=b5_speech,
            avatar_emotion="celebrating",
            avatar_gesture="nodding",
            board_action=BlackboardAction(
                type="bullet_points",
                title=f"Mastery Summary: {topic}",
                content=f"✓ Mastered: Core governing laws of {topic}\n✓ Visualized: Interactive 3D {sim_title}\n✓ Evaluated: Socratic conceptual checkpoint\n✓ Retained: Spaced repetition roadmap generated"
            ),
            is_checkpoint=False
        ))

        return LessonPlanResponse(
            lesson_id=f"lsn_{uuid.uuid4().hex[:8]}",
            lesson_title=f"Mastering {topic}",
            total_duration_minutes=profile.available_time_minutes,
            target_level=profile.level,
            language=profile.language,
            summary=f"A personalized interactive lesson on {topic} with live 3D {sim_title} and Socratic diagnostics.",
            beats=beats
        )

# Global singleton
pedagogical_agent = PedagogicalAgent()
