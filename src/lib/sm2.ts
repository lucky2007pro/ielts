import { VocabularyWord, WordStatus } from '@/types';

/**
 * SuperMemo SM-2 Spaced Repetition Algorithm
 * @param quality: 0 - 5 (0: complete blackout, 3: correct with hesitation, 5: perfect instant recall)
 * @param repetitions: previous repetition count
 * @param easeFactor: previous ease factor (starts at 2.5)
 * @param interval: previous interval in days
 */
export function calculateSM2(
  quality: number,
  repetitions: number,
  easeFactor: number,
  interval: number
) {
  let nextRepetitions = repetitions;
  let nextEaseFactor = easeFactor;
  let nextInterval = interval;

  if (quality >= 3) {
    if (repetitions === 0) {
      nextInterval = 1;
    } else if (repetitions === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(interval * easeFactor);
    }
    nextRepetitions += 1;
  } else {
    nextRepetitions = 0;
    nextInterval = 1;
  }

  // Update ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  nextEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (nextEaseFactor < 1.3) {
    nextEaseFactor = 1.3;
  }

  return {
    repetitions: nextRepetitions,
    easeFactor: Number(nextEaseFactor.toFixed(2)),
    interval: nextInterval,
  };
}

/**
 * Updates a word after a game trial or review
 */
export function updateWordAfterReview(
  word: VocabularyWord,
  quality: number // 0 to 5
): VocabularyWord {
  const { repetitions, easeFactor, interval } = calculateSM2(
    quality,
    word.review_count,
    word.ease_factor || 2.5,
    word.repetition_interval || 1
  );

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  // Calculate mastery score (0 to 100)
  let masteryScore = word.mastery_score;
  if (quality >= 3) {
    masteryScore = Math.min(100, masteryScore + quality * 4);
  } else {
    masteryScore = Math.max(0, masteryScore - 15);
  }

  // Determine status
  let status: WordStatus = word.status;
  if (masteryScore >= 85 && repetitions >= 4) {
    status = 'mastered';
  } else if (repetitions >= 2) {
    status = 'reviewing';
  } else {
    status = 'learning';
  }

  return {
    ...word,
    review_count: repetitions,
    ease_factor: easeFactor,
    repetition_interval: interval,
    next_review_date: nextReviewDate.toISOString(),
    last_reviewed_at: new Date().toISOString(),
    mastery_score: masteryScore,
    status,
  };
}
