import { UserProfile, VocabularyWord } from '@/types';
import { INITIAL_VOCABULARY } from '@/data/seedVocabulary';
import { updateWordAfterReview } from './sm2';

const STORAGE_KEYS = {
  PROFILE: 'lexiai_user_profile',
  VOCABULARY: 'lexiai_user_vocabulary',
  GAME_HISTORY: 'lexiai_game_history',
};

export const DEFAULT_USER: UserProfile = {
  id: 'u-1',
  name: 'Alijon T.',
  email: 'alijon@example.com',
  current_level: 'B2',
  target_ielts_band: 7.5,
  xp_points: 12450,
  level: 14,
  streak_days: 14,
  last_study_date: '2026-11-10T00:00:00.000Z',
  stats: {
    words_learned: 124,
    words_mastered: 48,
    grammar_score: 65,
    writing_score: 55,
    speaking_score: 60,
    games_played: 42,
  },
};

export function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    return JSON.parse(saved);
  } catch {
    return DEFAULT_USER;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function getVocabularyList(): VocabularyWord[] {
  if (typeof window === 'undefined') return INITIAL_VOCABULARY;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.VOCABULARY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(INITIAL_VOCABULARY));
      return INITIAL_VOCABULARY;
    }
    return JSON.parse(saved);
  } catch {
    return INITIAL_VOCABULARY;
  }
}

export function saveVocabularyList(words: VocabularyWord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(words));
}

export function addVocabularyWord(word: Partial<VocabularyWord> & { word_en: string; translation_uz: string }): VocabularyWord {
  const words = getVocabularyList();
  const newWord: VocabularyWord = {
    id: `w-${Date.now()}`,
    word_en: word.word_en.trim(),
    translation_uz: word.translation_uz.trim(),
    phonetic: word.phonetic || `/${word.word_en.toLowerCase()}/`,
    part_of_speech: word.part_of_speech || 'noun',
    academic_level: word.academic_level || 'C1',
    collocations: word.collocations || [],
    example_sentence: word.example_sentence || `The term ${word.word_en} plays a crucial role in academic research.`,
    example_translation_uz: word.example_translation_uz || '',
    topic_tag: word.topic_tag || 'General',
    mastery_score: 10,
    repetition_interval: 1,
    ease_factor: 2.5,
    review_count: 0,
    next_review_date: new Date().toISOString(),
    status: 'new',
    created_at: new Date().toISOString(),
  };

  const updated = [newWord, ...words];
  saveVocabularyList(updated);

  // Update profile words learned
  const profile = getUserProfile();
  profile.stats.words_learned = updated.length;
  saveUserProfile(profile);

  return newWord;
}

export function recordWordReview(wordId: string, quality: number): void {
  const words = getVocabularyList();
  const index = words.findIndex((w) => w.id === wordId);
  if (index === -1) return;

  const updatedWord = updateWordAfterReview(words[index], quality);
  words[index] = updatedWord;
  saveVocabularyList(words);

  // Recount mastered words
  const masteredCount = words.filter((w) => w.status === 'mastered').length;
  const profile = getUserProfile();
  profile.stats.words_mastered = masteredCount;
  saveUserProfile(profile);
}

export function awardGameXP(xp: number, gameId: string): UserProfile {
  const profile = getUserProfile();
  profile.xp_points += xp;
  profile.level = Math.floor(profile.xp_points / 800) + 1;
  profile.stats.games_played += 1;

  // Streak check
  const lastDate = new Date(profile.last_study_date);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
  if (diffDays === 1) {
    profile.streak_days += 1;
  } else if (diffDays > 1) {
    profile.streak_days = 1;
  }
  profile.last_study_date = now.toISOString();

  saveUserProfile(profile);
  return profile;
}
