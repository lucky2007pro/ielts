from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models.models import VocabularyWord, User
from app.routers import vocabulary, ai_coach, games, auth

# Create DB tables
Base.metadata.create_all(bind=engine)


def _ensure_user_columns():
    with engine.begin() as conn:
        for col, col_type in [
            ("avatar_url", "VARCHAR"),
            ("auth_provider", "VARCHAR DEFAULT 'local'"),
            ("google_id", "VARCHAR"),
            ("password_hash", "VARCHAR"),
        ]:
            try:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {col_type}"))
            except Exception:
                pass


_ensure_user_columns()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-seed initial IELTS words on startup if empty
    db = SessionLocal()
    try:
        if db.query(VocabularyWord).count() == 0:
            from app.routers.vocabulary import seed_initial_words
            seed_initial_words(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="LexiAI IELTS: 10 ta interaktiv o'yinlar, SM-2 takrorlash algoritmi va AI IELTS Agent API servisi",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(vocabulary.router, prefix=settings.API_V1_STR)
app.include_router(ai_coach.router, prefix=settings.API_V1_STR)
app.include_router(games.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
    }

@app.get("/health")
def health():
    return {"status": "ok"}
