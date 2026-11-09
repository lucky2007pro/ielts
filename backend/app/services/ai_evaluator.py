import json
import logging
from app.config import settings

logger = logging.getLogger(__name__)

async def evaluate_academic_paraphrase(
    original_sentence: str,
    user_paraphrase: str,
    target_word: str | None = None,
    user_ielts_target: float = 7.5,
) -> dict:
    """
    Evaluates paraphrase with Gemini AI (if key provided) or local heuristic engine.
    """
    api_key = settings.GEMINI_API_KEY

    if api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")

            prompt = f"""
Siz qat'iy va professional IELTS imtihonchisisiz. Quyidagi topshiriqni baholang va FAQAT quyidagi JSON formatida javob qaytaring (hech qanday markdown belgilarisiz):

Asl oddiy gap: "{original_sentence}"
Foydalanuvchi yozgan akademik parafraz: "{user_paraphrase}"
Foydalanishi kerak bo'lgan asosiy so'z: "{target_word or 'academic vocabulary'}"
Foydalanuvchining maqsadli IELTS balli: {user_ielts_target}

Kutilayotgan JSON formati:
{{
  "is_success": true,
  "evaluated_band": 8.0,
  "criteria_scores": {{
    "task_achievement": 8.5,
    "lexical_resource": 8.0,
    "grammatical_range": 8.0
  }},
  "feedback_uz": "O'zbek tilidagi qisqa professional tahlil",
  "c1_upgrade": "Mukammal C1-C2 darajadagi namunaviy IELTS varianti",
  "upgrades": [
    {{ "original": "oddiy so'z", "upgraded": "akademik muqobili" }}
  ],
  "xp_awarded": 45,
  "next_recommended_game": "sentence_builder"
}}
"""
            response = model.generate_content(prompt)
            clean_text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_text)
        except Exception as e:
            logger.warning(f"Gemini API call failed, using local engine: {e}")

    # Local Intelligent Fallback
    lower = user_paraphrase.lower()
    has_target = (target_word.lower() in lower) if target_word else True
    word_count = len(user_paraphrase.strip().split())

    academic_keywords = [
        "mitigate", "ubiquitous", "detrimental", "substantial", "facilitate",
        "proliferate", "scrutinize", "consequently", "furthermore", "imperative",
        "paramount", "exacerbate", "exponential", "manifest", "predominantly"
    ]
    matches = sum(1 for kw in academic_keywords if kw in lower)

    band = 6.0
    if word_count >= 7:
        band += 0.5
    if matches >= 1:
        band += 0.5
    if matches >= 2:
        band += 0.5
    if has_target:
        band += 0.5
    if any(p in user_paraphrase for p in [",", "which", "that", "although"]):
        band += 0.5
    band = min(8.5, max(5.5, band))

    return {
        "is_success": band >= 6.5,
        "evaluated_band": round(band, 1),
        "criteria_scores": {
            "task_achievement": round(band + 0.2, 1),
            "lexical_resource": round(band, 1),
            "grammatical_range": round(band - 0.1, 1),
        },
        "feedback_uz": (
            f"Ajoyib natija! '{target_word}' so'zi o'z o'rnida qo'llangan va jumlaga akademik ohang bergan."
            if has_target
            else f"Yaxshi, ammo '{target_word}' so'zi kiritilmadi. C1 konstruksiyalariga e'tibor qarating."
        ),
        "c1_upgrade": "Implementing targeted strategies substantially mitigates the negative repercussions in the long term.",
        "upgrades": [
            {"original": "make a lot of", "upgraded": "generate substantial amounts of"},
            {"original": "very bad", "upgraded": "severely detrimental"},
        ],
        "xp_awarded": int(band * 6),
        "next_recommended_game": "sentence_builder",
    }

async def enrich_word_with_ai(word_input: str) -> dict:
    """
    Enriches vocabulary word with IELTS C1 collocations and examples.
    """
    api_key = settings.GEMINI_API_KEY

    if api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")

            prompt = f"""
Siz IELTS bo'yicha akademik leksika mutaxassisiz. Quyidagi so'zni tahlil qiling va FAQAT JSON formatida qaytaring:
So'z: "{word_input}"

Format:
{{
  "word_en": "Inglizcha shakli",
  "translation_uz": "O'zbekcha tarjimasi",
  "phonetic": "/talaffuz/",
  "part_of_speech": "noun | verb | adjective | adverb",
  "academic_level": "B2 | C1 | C2",
  "collocations": ["birikma 1", "birikma 2", "birikma 3"],
  "example_sentence": "IELTS Band 7.5+ namunaviy gap.",
  "example_translation_uz": "Misol gap tarjimasi."
}}
"""
            response = model.generate_content(prompt)
            clean_text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_text)
        except Exception as e:
            logger.warning(f"Gemini enrichment failed: {e}")

    # Fallback
    w = word_input.strip()
    return {
        "word_en": w.capitalize(),
        "translation_uz": f"{w} (tarjima)",
        "phonetic": f"/{w.lower()}/",
        "part_of_speech": "adjective",
        "academic_level": "C1",
        "collocations": [f"crucial {w.lower()}", f"demonstrate {w.lower()}"],
        "example_sentence": f"Understanding the concept of {w} is essential for IELTS Academic candidates.",
        "example_translation_uz": f"{w} tushunchasini bilish IELTS kandidatlari uchun muhim.",
    }
