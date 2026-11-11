import { UserProfile, VocabularyWord } from '@/types';
import { INITIAL_VOCABULARY } from '@/data/seedVocabulary';
import { updateWordAfterReview } from './sm2';

let activeScope = 'guest';

function getKeys() {
  return {
    PROFILE: `lexiai_user_profile_${activeScope}`,
    VOCABULARY: `lexiai_user_vocabulary_${activeScope}`,
  };
}

export function setActiveUserScope(email?: string | null) {
  activeScope = email ? email.trim().toLowerCase() : 'guest';
}

export const DEFAULT_USER: UserProfile = {
  id: 'u-1',
  name: 'Alijon T.',
  email: 'alijon@lexiai.uz',
  auth_provider: 'guest',
  current_level: 'B2',
  target_ielts_band: 7.5,
  xp_points: 12450,
  level: 14,
  streak_days: 14,
  last_study_date: '2026-11-10T00:00:00.000Z',
  stats: {
    words_learned: 8,
    words_mastered: 2,
    grammar_score: 65,
    writing_score: 55,
    speaking_score: 60,
    games_played: 42,
  },
};

export function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER;
  const keys = getKeys();
  try {
    const saved = localStorage.getItem(keys.PROFILE);
    if (!saved) {
      localStorage.setItem(keys.PROFILE, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    return JSON.parse(saved);
  } catch {
    return DEFAULT_USER;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  const keys = getKeys();
  localStorage.setItem(keys.PROFILE, JSON.stringify(profile));
}

export function syncSessionUserToProfile(sessionUser: {
  email: string;
  name: string;
  avatar_url?: string;
  auth_provider?: 'google' | 'local';
  current_level?: 'A2' | 'B1' | 'B2' | 'C1';
  target_ielts_band?: number;
}): UserProfile {
  setActiveUserScope(sessionUser.email);
  const existing = getUserProfile();
  const isFirstTimeForEmail = existing.email !== sessionUser.email;

  const updated: UserProfile = isFirstTimeForEmail
    ? {
        id: `u-${sessionUser.email}`,
        name: sessionUser.name,
        email: sessionUser.email,
        avatar_url: sessionUser.avatar_url,
        auth_provider: sessionUser.auth_provider || 'local',
        current_level: sessionUser.current_level || 'B1',
        target_ielts_band: sessionUser.target_ielts_band || 7.5,
        xp_points: 250,
        level: 1,
        streak_days: 1,
        last_study_date: new Date().toISOString(),
        stats: {
          words_learned: INITIAL_VOCABULARY.length,
          words_mastered: INITIAL_VOCABULARY.filter((w) => w.status === 'mastered').length,
          grammar_score: 55,
          writing_score: 50,
          speaking_score: 52,
          games_played: 0,
        },
      }
    : {
        ...existing,
        name: sessionUser.name || existing.name,
        avatar_url: sessionUser.avatar_url ?? existing.avatar_url,
        auth_provider: sessionUser.auth_provider || existing.auth_provider,
        current_level: sessionUser.current_level || existing.current_level,
        target_ielts_band: sessionUser.target_ielts_band || existing.target_ielts_band,
      };

  saveUserProfile(updated);
  return updated;
}

export function getVocabularyList(): VocabularyWord[] {
  if (typeof window === 'undefined') return INITIAL_VOCABULARY;
  const keys = getKeys();
  try {
    const saved = localStorage.getItem(keys.VOCABULARY);
    if (!saved) {
      localStorage.setItem(keys.VOCABULARY, JSON.stringify(INITIAL_VOCABULARY));
      return INITIAL_VOCABULARY;
    }
    return JSON.parse(saved);
  } catch {
    return INITIAL_VOCABULARY;
  }
}

export function saveVocabularyList(words: VocabularyWord[]): void {
  if (typeof window === 'undefined') return;
  const keys = getKeys();
  localStorage.setItem(keys.VOCABULARY, JSON.stringify(words));
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

  const masteredCount = words.filter((w) => w.status === 'mastered').length;
  const profile = getUserProfile();
  profile.stats.words_mastered = masteredCount;
  saveUserProfile(profile);
}

export function awardGameXP(xp: number, _gameId: string): UserProfile {
  const profile = getUserProfile();
  profile.xp_points += xp;
  profile.level = Math.floor(profile.xp_points / 800) + 1;
  profile.stats.games_played += 1;

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
