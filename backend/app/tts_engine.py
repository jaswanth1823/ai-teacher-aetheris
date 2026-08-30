import os
import io
import base64
import asyncio
import logging
from typing import Dict, Optional

logger = logging.getLogger("aetheris.tts")

# Mapping popular languages to natural Edge-TTS neural voices
VOICE_MAP: Dict[str, str] = {
    "english": "en-US-ChristopherNeural",
    "english_female": "en-US-JennyNeural",
    "hindi": "hi-IN-MadhurNeural",
    "hindi_female": "hi-IN-SwaraNeural",
    "hinglish": "hi-IN-MadhurNeural",
    "tamil": "ta-IN-ValluvarNeural",
    "spanish": "es-ES-AlvaroNeural",
    "french": "fr-FR-HenriNeural",
    "german": "de-DE-ConradNeural"
}

class TTSEngine:
    """
    Multilingual Neural Text-to-Speech Engine using Edge-TTS.
    Supports real-time streaming and base64 audio synthesis for avatar lip-sync.
    """
    def __init__(self, audio_cache_dir: str = "./audio_cache"):
        self.cache_dir = audio_cache_dir
        os.makedirs(audio_cache_dir, exist_ok=True)

    def get_voice_for_language(self, language: str, gender: str = "male") -> str:
        lang_lower = language.lower()
        for key in VOICE_MAP:
            if key in lang_lower:
                if gender == "female" and f"{key}_female" in VOICE_MAP:
                    return VOICE_MAP[f"{key}_female"]
                return VOICE_MAP[key]
        return "en-US-ChristopherNeural"

    async def synthesize_speech(
        self,
        text: str,
        language: str = "English",
        voice: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Synthesizes speech to an MP3 buffer and returns base64 encoded audio string.
        """
        selected_voice = voice or self.get_voice_for_language(language)
        clean_text = text.replace("$", "").replace("\\", "").strip()

        try:
            import edge_tts
            communicate = edge_tts.Communicate(clean_text, selected_voice)
            audio_data = b""
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_data += chunk["data"]

            if audio_data:
                b64_audio = base64.b64encode(audio_data).decode("utf-8")
                # Estimate duration based on word count (~150 words per minute)
                word_count = len(clean_text.split())
                est_duration = max(1.5, round((word_count / 140) * 60, 2))

                return {
                    "audio_base64": b64_audio,
                    "format": "audio/mp3",
                    "duration_sec": est_duration,
                    "language": language,
                    "voice": selected_voice
                }
        except Exception as e:
            logger.warning(f"Edge-TTS synthesis error: {e}. Generating placeholder audio.")

        # Fallback silent audio byte buffer
        dummy_mp3 = b"RIFF....WAVEfmt ...."
        return {
            "audio_base64": base64.b64encode(dummy_mp3).decode("utf-8"),
            "format": "audio/mp3",
            "duration_sec": max(2.0, len(clean_text.split()) * 0.4),
            "language": language,
            "voice": selected_voice
        }

# Global singleton
tts_engine = TTSEngine()
