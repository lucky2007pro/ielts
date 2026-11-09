from datetime import datetime, timedelta
from typing import Tuple

def calculate_sm2(
    quality: int,
    repetitions: int,
    ease_factor: float,
    interval: int,
) -> Tuple[int, float, int]:
    """
    SuperMemo SM-2 Spaced Repetition Algorithm
    quality: 0 (blackout) to 5 (perfect recall)
    returns: (next_repetitions, next_ease_factor, next_interval_in_days)
    """
    if quality >= 3:
        if repetitions == 0:
            next_interval = 1
        elif repetitions == 1:
            next_interval = 6
        else:
            next_interval = round(interval * ease_factor)
        next_repetitions = repetitions + 1
    else:
        next_repetitions = 0
        next_interval = 1

    # EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    next_ef = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if next_ef < 1.3:
        next_ef = 1.3

    return next_repetitions, round(next_ef, 2), next_interval

def update_word_sm2(word, quality: int):
    """
    Applies SM-2 to a VocabularyWord model instance.
    """
    reps, ef, interval = calculate_sm2(
        quality=quality,
        repetitions=word.review_count or 0,
        ease_factor=word.ease_factor or 2.5,
        interval=word.repetition_interval or 1,
    )

    word.review_count = reps
    word.ease_factor = ef
    word.repetition_interval = interval
    word.next_review_date = datetime.utcnow() + timedelta(days=interval)

    # Mastery score adjustments
    if quality >= 3:
        word.mastery_score = min(100, (word.mastery_score or 0) + quality * 4)
    else:
        word.mastery_score = max(0, (word.mastery_score or 0) - 15)

    # Word status
    if word.mastery_score >= 85 and reps >= 4:
        word.status = "mastered"
    elif reps >= 2:
        word.status = "reviewing"
    else:
        word.status = "learning"

    return word
