from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class WordBase(BaseModel):
    word_en: str
    translation_uz: str
    phonetic: Optional[str] = None
    part_of_speech: Optional[str] = "noun"
    academic_level: Optional[str] = "C1"
    collocations: List[str] = []
    example_sentence: Optional[str] = None
    example_translation_uz: Optional[str] = None
    topic_tag: Optional[str] = "General"

class WordCreate(WordBase):
    pass

class WordResponse(WordBase):
    id: int
    mastery_score: int
    repetition_interval: int
    ease_factor: float
    review_count: int
    next_review_date: datetime
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ReviewRequest(BaseModel):
    word_id: int
    quality: int = Field(..., ge=0, le=5, description="SM-2 recall quality: 0 to 5")

class ParaphraseRequest(BaseModel):
    game_id: Optional[str] = "academic_paraphrase"
    original_sentence: str
    user_paraphrase: str
    target_word: Optional[str] = None
    user_ielts_target: Optional[float] = 7.5

class UpgradeItem(BaseModel):
    original: str
    upgraded: str

class CriteriaScores(BaseModel):
    task_achievement: float
    lexical_resource: float
    grammatical_range: float

class ParaphraseResponse(BaseModel):
    is_success: bool
    evaluated_band: float
    criteria_scores: CriteriaScores
    feedback_uz: str
    c1_upgrade: Optional[str] = None
    upgrades: List[UpgradeItem] = []
    xp_awarded: int
    next_recommended_game: str = "sentence_builder"

class GameScoreSubmit(BaseModel):
    game_type: str
    score: int
    xp_earned: int
    mistakes: List[Dict[str, Any]] = []
    email: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: int
    full_name: str
    email: str
    avatar_url: Optional[str] = None
    auth_provider: str = "local"
    current_level: str
    target_ielts_band: float
    xp_points: int
    level: int
    streak_days: int
    last_study_date: datetime
    stats: Dict[str, Any]

    class Config:
        from_attributes = True


class GoogleSyncRequest(BaseModel):
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    google_id: Optional[str] = None


class UserRegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str = Field(..., min_length=4)
    current_level: str = "B1"
    target_ielts_band: float = 7.5


class UserLoginRequest(BaseModel):
    email: str
    password: str


class ProfileUpdateRequest(BaseModel):
    email: str
    full_name: Optional[str] = None
    current_level: Optional[str] = None
    target_ielts_band: Optional[float] = None
