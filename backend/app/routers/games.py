import json
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, GameLog, VocabularyWord
from app.schemas.schemas import GameScoreSubmit, UserProfileResponse
from app.routers.auth import build_profile_response

router = APIRouter(tags=["Games & User Profile"])

@router.get("/user/profile", response_model=UserProfileResponse)
def get_user_profile(email: Optional[str] = None, db: Session = Depends(get_db)):
    user = (
        db.query(User).filter(User.email == email.strip().lower()).first()
        if email
        else db.query(User).first()
    )
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

    return build_profile_response(user, db)

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
