import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import VocabularyWord, User
from app.schemas.schemas import WordCreate, WordResponse, ReviewRequest
from app.services.sm2 import update_word_sm2
from app.services.ai_evaluator import enrich_word_with_ai

router = APIRouter(prefix="/vocabulary", tags=["Vocabulary Bank"])

INITIAL_WORDS = [
    {
        "word_en": "Mitigate",
        "translation_uz": "Yumshatish, kamaytirish",
        "phonetic": "/ˈmɪt.ɪ.ɡeɪt/",
        "part_of_speech": "verb",
        "academic_level": "C1",
        "collocations": ["mitigate risk", "mitigate effects", "mitigate the impact"],
        "example_sentence": "Governments must introduce strict policies to mitigate the adverse effects of global warming.",
        "example_translation_uz": "Hukumatlar global isishning salbiy ta'sirlarini kamaytirish uchun qat'iy siyosat joriy etishlari lozim.",
        "topic_tag": "Environment",
        "mastery_score": 75,
        "status": "reviewing",
    },
    {
        "word_en": "Ubiquitous",
        "translation_uz": "Hamma joyda uchraydigan, universal",
        "phonetic": "/juːˈbɪk.wɪ.təs/",
        "part_of_speech": "adjective",
        "academic_level": "C1",
        "collocations": ["ubiquitous presence", "become ubiquitous", "ubiquitous technology"],
        "example_sentence": "Smartphones have become ubiquitous in contemporary society, altering how people communicate.",
        "example_translation_uz": "Smartfonlar zamonaviy jamiyatda har joyda uchraydigan bo'lib qoldi.",
        "topic_tag": "Technology",
        "mastery_score": 95,
        "status": "mastered",
    },
    {
        "word_en": "Eloquent",
        "translation_uz": "Notiq, fikrini chiroyli ifodalovchi",
        "phonetic": "/ˈel.ə.kwənt/",
        "part_of_speech": "adjective",
        "academic_level": "C1",
        "collocations": ["eloquent speech", "eloquent speaker"],
        "example_sentence": "She gave an eloquent presentation outlining the moral imperatives of preserving biodiversity.",
        "example_translation_uz": "U biologik xilma-xillikni saqlash bo'yicha notiqona taqdimot qildi.",
        "topic_tag": "Education",
        "mastery_score": 20,
        "status": "new",
    },
    {
        "word_en": "Detrimental",
        "translation_uz": "Zararli, halokatli",
        "phonetic": "/ˌdet.rɪˈmen.təl/",
        "part_of_speech": "adjective",
        "academic_level": "C1",
        "collocations": ["detrimental effect", "detrimental impact"],
        "example_sentence": "Excessive use of social media can have a detrimental effect on adolescents.",
        "example_translation_uz": "Ijtimoiy tarmoqlardan me'yordan ortiq foydalanish yoshlarga zararli ta'sir qiladi.",
        "topic_tag": "Society",
        "mastery_score": 60,
        "status": "learning",
    },
]

@router.get("", response_model=List[WordResponse])
def get_words(
    status: Optional[str] = None,
    topic: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(VocabularyWord)
    if status and status != "all":
        query = query.filter(VocabularyWord.status == status)
    if topic:
        query = query.filter(VocabularyWord.topic_tag == topic)
    if q:
        query = query.filter(
            (VocabularyWord.word_en.ilike(f"%{q}%"))
            | (VocabularyWord.translation_uz.ilike(f"%{q}%"))
        )
    return query.order_by(VocabularyWord.id.desc()).all()

@router.post("", response_model=WordResponse)
def add_word(word_in: WordCreate, db: Session = Depends(get_db)):
    db_word = VocabularyWord(
        word_en=word_in.word_en.strip(),
        translation_uz=word_in.translation_uz.strip(),
        phonetic=word_in.phonetic,
        part_of_speech=word_in.part_of_speech,
        academic_level=word_in.academic_level,
        collocations_json=json.dumps(word_in.collocations),
        example_sentence=word_in.example_sentence,
        example_translation_uz=word_in.example_translation_uz,
        topic_tag=word_in.topic_tag or "General",
        mastery_score=10,
        repetition_interval=1,
        ease_factor=2.5,
        review_count=0,
        status="new",
    )
    db.add(db_word)
    db.commit()
    db.refresh(db_word)
    return db_word

@router.post("/enrich")
async def enrich_word(payload: dict):
    word = payload.get("word")
    if not word:
        raise HTTPException(status_code=400, detail="Word must be provided")
    enriched = await enrich_word_with_ai(word)
    return enriched

@router.post("/review")
def review_word(req: ReviewRequest, db: Session = Depends(get_db)):
    word = db.query(VocabularyWord).filter(VocabularyWord.id == req.word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")

    updated = update_word_sm2(word, req.quality)
    db.commit()
    db.refresh(updated)
    return {"message": "SM-2 updated", "word": updated}

@router.post("/seed")
def seed_initial_words(db: Session = Depends(get_db)):
    count = db.query(VocabularyWord).count()
    if count == 0:
        for w in INITIAL_WORDS:
            obj = VocabularyWord(
                word_en=w["word_en"],
                translation_uz=w["translation_uz"],
                phonetic=w.get("phonetic"),
                part_of_speech=w.get("part_of_speech", "noun"),
                academic_level=w.get("academic_level", "C1"),
                collocations_json=json.dumps(w.get("collocations", [])),
                example_sentence=w.get("example_sentence"),
                example_translation_uz=w.get("example_translation_uz"),
                topic_tag=w.get("topic_tag", "General"),
                mastery_score=w.get("mastery_score", 10),
                status=w.get("status", "new"),
            )
            db.add(obj)
        db.commit()
        return {"message": f"{len(INITIAL_WORDS)} initial IELTS words seeded successfully"}
    return {"message": f"Vocabulary already contains {count} words"}
