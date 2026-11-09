from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import AiSubmission
from app.schemas.schemas import ParaphraseRequest, ParaphraseResponse
from app.services.ai_evaluator import evaluate_academic_paraphrase

router = APIRouter(tags=["AI IELTS Coach & Games"])

@router.post("/games/evaluate-paraphrase", response_model=ParaphraseResponse)
async def evaluate_paraphrase_endpoint(
    req: ParaphraseRequest,
    db: Session = Depends(get_db),
):
    if not req.user_paraphrase or len(req.user_paraphrase.strip()) < 5:
        raise HTTPException(status_code=400, detail="Iltimos, to'liq gap kiriting.")

    result = await evaluate_academic_paraphrase(
        original_sentence=req.original_sentence,
        user_paraphrase=req.user_paraphrase,
        target_word=req.target_word,
        user_ielts_target=req.user_ielts_target or 7.5,
    )

    # Save to history
    submission = AiSubmission(
        task_type="academic_paraphrase",
        user_input=req.user_paraphrase,
        estimated_band=result["evaluated_band"],
        feedback_uz=result["feedback_uz"],
    )
    db.add(submission)
    db.commit()

    return result

@router.post("/coach/analyze-writing")
async def analyze_writing_endpoint(
    payload: dict,
    db: Session = Depends(get_db),
):
    essay_text = payload.get("text", "")
    topic = payload.get("topic", "Discuss the impact of technology on education.")

    if not essay_text or len(essay_text.strip()) < 15:
        raise HTTPException(status_code=400, detail="Insho matni juda qisqa.")

    result = await evaluate_academic_paraphrase(
        original_sentence=topic,
        user_paraphrase=essay_text,
        target_word="technology",
        user_ielts_target=7.5,
    )
    return result
