import json
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, GameLog
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
            full_name="Mehmon",
            email="guest@lexiai.uz",
            current_level="B1",
            target_ielts_band=7.5,
            xp_points=0,
            level=1,
            streak_days=0,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return build_profile_response(user, db)


@router.post("/games/submit-score")
def submit_game_score(data: GameScoreSubmit, db: Session = Depends(get_db)):
    user = (
        db.query(User).filter(User.email == data.email.strip().lower()).first()
        if data.email
        else db.query(User).first()
    )
    if not user:
        user = User(
            full_name="Mehmon",
            email=(data.email.strip().lower() if data.email else "guest@lexiai.uz"),
            current_level="B1",
            target_ielts_band=7.5,
            xp_points=0,
            level=1,
            streak_days=1,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Award XP and update streak
    now = datetime.utcnow()
    if user.last_study_date:
        diff_days = (now.date() - user.last_study_date.date()).days
        if user.streak_days == 0 or diff_days > 1:
            user.streak_days = 1
        elif diff_days == 1:
            user.streak_days += 1
    else:
        user.streak_days = 1

    user.xp_points += max(0, data.xp_earned)
    user.level = (user.xp_points // 800) + 1
    user.last_study_date = now

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


@router.get("/leaderboard")
def get_leaderboard(limit: int = 15, db: Session = Depends(get_db)):
    users = (
        db.query(User)
        .filter(User.email != "alijon@lexiai.uz", User.email != "guest@lexiai.uz")
        .order_by(User.xp_points.desc())
        .limit(max(1, min(limit, 50)))
        .all()
    )
    return {
        "entries": [
            {
                "id": u.id,
                "name": u.full_name,
                "email": u.email,
                "avatar_url": u.avatar_url,
                "xp_points": u.xp_points,
                "level": u.level,
                "streak_days": u.streak_days,
                "current_level": u.current_level,
                "target_ielts_band": u.target_ielts_band,
            }
            for u in users
        ]
    }
