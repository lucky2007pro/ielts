import hashlib
import hmac
import secrets
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User, VocabularyWord, GameLog
from app.schemas.schemas import (
    GoogleSyncRequest,
    UserRegisterRequest,
    UserLoginRequest,
    ProfileUpdateRequest,
    UserProfileResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication & Accounts"])


def _hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return f"{salt}${dk.hex()}"


def _verify_password(password: str, stored_hash: str) -> bool:
    if not stored_hash or "$" not in stored_hash:
        return False
    salt, expected_hex = stored_hash.split("$", 1)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return hmac.compare_digest(dk.hex(), expected_hex)


def build_profile_response(user: User, db: Session) -> UserProfileResponse:
    total_words = db.query(VocabularyWord).count()
    mastered_words = db.query(VocabularyWord).filter(VocabularyWord.status == "mastered").count()
    games_played = db.query(GameLog).filter(GameLog.user_id == user.id).count()

    return UserProfileResponse(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        avatar_url=user.avatar_url,
        auth_provider=user.auth_provider or "local",
        current_level=user.current_level,
        target_ielts_band=user.target_ielts_band,
        xp_points=user.xp_points,
        level=user.level,
        streak_days=user.streak_days,
        last_study_date=user.last_study_date or datetime.utcnow(),
        stats={
            "words_learned": total_words,
            "words_mastered": mastered_words,
            "grammar_score": 65,
            "writing_score": 55,
            "speaking_score": 60,
            "games_played": games_played,
        },
    )


@router.post("/google-sync", response_model=UserProfileResponse)
def google_sync(req: GoogleSyncRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()

    if not user:
        user = User(
            full_name=req.full_name.strip() or email.split("@")[0],
            email=email,
            avatar_url=req.avatar_url,
            auth_provider="google",
            google_id=req.google_id,
            current_level="B1",
            target_ielts_band=7.5,
            xp_points=100,
            level=1,
            streak_days=1,
            last_study_date=datetime.utcnow(),
        )
        db.add(user)
    else:
        user.full_name = req.full_name.strip() or user.full_name
        if req.avatar_url:
            user.avatar_url = req.avatar_url
        if req.google_id:
            user.google_id = req.google_id
        user.auth_provider = "google"
        user.last_study_date = datetime.utcnow()

    db.commit()
    db.refresh(user)
    return build_profile_response(user, db)


@router.post("/register", response_model=UserProfileResponse)
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu email allaqachon ro'yxatdan o'tgan.")

    user = User(
        full_name=req.full_name.strip(),
        email=email,
        password_hash=_hash_password(req.password),
        auth_provider="local",
        current_level=req.current_level,
        target_ielts_band=req.target_ielts_band,
        xp_points=100,
        level=1,
        streak_days=1,
        last_study_date=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return build_profile_response(user, db)


@router.post("/login", response_model=UserProfileResponse)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.password_hash or not _verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email yoki parol noto'g'ri.")

    user.last_study_date = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return build_profile_response(user, db)


@router.patch("/profile", response_model=UserProfileResponse)
def update_profile(req: ProfileUpdateRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi.")

    if req.full_name is not None and req.full_name.strip():
        user.full_name = req.full_name.strip()
    if req.current_level is not None:
        user.current_level = req.current_level
    if req.target_ielts_band is not None:
        user.target_ielts_band = req.target_ielts_band

    db.commit()
    db.refresh(user)
    return build_profile_response(user, db)
