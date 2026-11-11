from datetime import datetime
import json
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, default="Mehmon")
    email = Column(String, unique=True, index=True, default="guest@lexiai.uz")
    avatar_url = Column(String, nullable=True)
    auth_provider = Column(String, default="local")
    google_id = Column(String, nullable=True, index=True)
    password_hash = Column(String, nullable=True)
    current_level = Column(String, default="B1")
    target_ielts_band = Column(Float, default=7.5)
    xp_points = Column(Integer, default=0)
    level = Column(Integer, default=1)
    streak_days = Column(Integer, default=0)
    last_study_date = Column(DateTime, default=datetime.utcnow)

    vocabulary = relationship("VocabularyWord", back_populates="user")
    game_logs = relationship("GameLog", back_populates="user")
    ai_submissions = relationship("AiSubmission", back_populates="user")

class VocabularyWord(Base):
    __tablename__ = "vocabulary_words"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    word_en = Column(String, index=True, nullable=False)
    translation_uz = Column(String, nullable=False)
    phonetic = Column(String, nullable=True)
    part_of_speech = Column(String, default="noun")
    academic_level = Column(String, default="C1")
    collocations_json = Column(Text, default="[]")
    example_sentence = Column(Text, nullable=True)
    example_translation_uz = Column(Text, nullable=True)
    topic_tag = Column(String, default="General")
    mastery_score = Column(Integer, default=10)
    repetition_interval = Column(Integer, default=1)
    ease_factor = Column(Float, default=2.5)
    review_count = Column(Integer, default=0)
    next_review_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="new")  # new, learning, reviewing, mastered
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="vocabulary")

    @property
    def collocations(self):
        try:
            return json.loads(self.collocations_json)
        except Exception:
            return []

    @collocations.setter
    def collocations(self, val):
        self.collocations_json = json.dumps(val)

class GameLog(Base):
    __tablename__ = "game_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    game_type = Column(String, nullable=False)  # speed_sprint, sentence_builder, etc.
    score = Column(Integer, default=0)
    xp_earned = Column(Integer, default=0)
    mistakes_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="game_logs")

class AiSubmission(Base):
    __tablename__ = "ai_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    task_type = Column(String, default="paraphrase")  # paraphrase, essay, speaking
    user_input = Column(Text, nullable=False)
    estimated_band = Column(Float, default=7.0)
    feedback_uz = Column(Text, nullable=True)
    details_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="ai_submissions")
