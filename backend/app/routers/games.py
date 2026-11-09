import json
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, GameLog, VocabularyWord
from app.schemas.schemas import GameScoreSubmit, UserProfileResponse

router = APIRouter(tags=["Games & User Profile"])

@router.get("/user/profile", response_model=UserProfileResponse)
def get_user_profile(db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        user = User(
            full_name="Alijon T.",
            email="alijon@lexiai.uz",
            current_level="B2",
            target_ielts_band=7.5,
            xp_points=12450,
            level=14,
            streak_days=14,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    total_words = db.query(VocabularyWord).count()
    mastered_words = db.query(VocabularyWord).filter(VocabularyWord.status == "mastered").count()

    stats = {
        "words_learned": total_words if total_words > 0 else 124,
        "words_mastered": mastered_words if mastered_words > 0 else 48,
        "grammar_score": 65,
        "writing_score": 55,
        "speaking_score": 60,
        "games_played": db.query(GameLog).count() + 42,
    }

    return UserProfileResponse(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        current_level=user.current_level,
        target_ielts_band=user.target_ielts_band,
        xp_points=user.xp_points,
        level=user.level,
        streak_days=user.streak_days,
        last_study_date=user.last_study_date,
        stats=stats,
    )

@router.post("/games/submit-score")
def submit_game_score(data: GameScoreSubmit, db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        user = User(full_name="Alijon T.", email="alijon@lexiai.uz")
        db.add(user)
        db.commit()
        db.refresh(user)

    # Award XP
    user.xp_points += data.xp_earned
    user.level = (user.xp_points // 800) + 1
    user.last_study_date = datetime.utcnow()

    # Log game
    log = GameLog(
        user_id=user.id,
        game_type=data.game_type,
        score=data.score,
        xp_earned=data.xp_earned,
        mistakes_json=json.dumps(data.mistakes),
    )
    db.add(log)
    db.commit()

    return {
        "status": "success",
        "xp_awarded": data.xp_earned,
        "current_xp": user.xp_points,
        "current_level": user.level,
    }
