import { DailyActivityLog, UserProfile, VocabularyWord } from '@/types';
import { INITIAL_VOCABULARY } from '@/data/seedVocabulary';
import { updateWordAfterReview } from './sm2';

let activeScope = 'guest';

function getKeys() {
  return {
    PROFILE: `lexiai_user_profile_${activeScope}`,
    VOCABULARY: `lexiai_user_vocabulary_${activeScope}`,
    ACTIVITY: `lexiai_daily_activity_${activeScope}`,
  };
}

export function getLocalDateKey(input: Date | string = new Date()): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getDailyActivityLogs(): Record<string, DailyActivityLog> {
  if (typeof window === 'undefined') return {};
  const keys = getKeys();
  try {
    const saved = localStorage.getItem(keys.ACTIVITY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveDailyActivityLogs(logs: Record<string, DailyActivityLog>): void {
  if (typeof window === 'undefined') return;
  const keys = getKeys();
  localStorage.setItem(keys.ACTIVITY, JSON.stringify(logs));
}

export function setActiveUserScope(email?: string | null) {
  activeScope = email ? email.trim().toLowerCase() : 'guest';
}

export const DEFAULT_USER: UserProfile = {
  id: 'u-guest',
  name: 'Mehmon',
  email: 'guest@lexiai.uz',
  auth_provider: 'guest',
  current_level: 'B1',
  target_ielts_band: 7.5,
  xp_points: 0,
  level: 1,
  streak_days: 0,
  last_study_date: '2026-01-01T00:00:00.000Z',
  stats: {
    words_learned: INITIAL_VOCABULARY.length,
    words_mastered: 0,
    grammar_score: 0,
    writing_score: 0,
    speaking_score: 0,
    games_played: 0,
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
        xp_points: 0,
        level: 1,
        streak_days: 1,
        last_study_date: new Date().toISOString(),
        stats: {
          words_learned: INITIAL_VOCABULARY.length,
          words_mastered: INITIAL_VOCABULARY.filter((w) => w.status === 'mastered').length,
          grammar_score: 0,
          writing_score: 0,
          speaking_score: 0,
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

export function addVocabularyWord(
  word: Partial<VocabularyWord> & { word_en: string; translation_uz: string }
): VocabularyWord {
  const words = getVocabularyList();
  const nowIso = new Date().toISOString();
  const newWord: VocabularyWord = {
    id: `w-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    word_en: word.word_en.trim(),
    translation_uz: word.translation_uz.trim(),
    phonetic: word.phonetic || '',
    skill_section: word.skill_section || 'general',
    part_of_speech: word.part_of_speech || 'none',
    academic_level: word.academic_level || 'none',
    collocations: word.collocations || [],
    example_sentence: word.example_sentence?.trim() || '',
    example_translation_uz: word.example_translation_uz || '',
    topic_tag: word.topic_tag || 'None',
    mastery_score: 10,
    repetition_interval: 1,
    ease_factor: 2.5,
    review_count: 0,
    next_review_date: nowIso,
    status: 'new',
    created_at: nowIso,
  };

  const updated = [newWord, ...words];
  saveVocabularyList(updated);

  const profile = getUserProfile();
  profile.stats.words_learned = updated.length;
  saveUserProfile(profile);

  // Record in daily activity log
  const todayKey = getLocalDateKey(nowIso);
  if (todayKey) {
    const logs = getDailyActivityLogs();
    const existing = logs[todayKey] || {
      date: todayKey,
      words_added: 0,
      games_played: 0,
      xp_earned: 0,
      game_entries: [],
    };
    existing.words_added += 1;
    logs[todayKey] = existing;
    saveDailyActivityLogs(logs);
  }

  return newWord;
}

export function updateVocabularyWord(
  wordId: string,
  patch: Partial<VocabularyWord>
): VocabularyWord[] {
  const words = getVocabularyList();
  const updated = words.map((w) => (w.id === wordId ? { ...w, ...patch } : w));
  saveVocabularyList(updated);
  return updated;
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

export function updateSkillScore(
  skill: 'grammar' | 'writing' | 'speaking',
  earnedScore: number
): UserProfile {
  const profile = getUserProfile();
  const clamped = Math.max(0, Math.min(100, Math.round(earnedScore)));
  const field = `${skill}_score` as 'grammar_score' | 'writing_score' | 'speaking_score';
  const current = profile.stats[field] || 0;
  profile.stats[field] =
    current === 0 ? clamped : Math.min(100, Math.max(current, Math.round(current * 0.55 + clamped * 0.45)));
  saveUserProfile(profile);
  return profile;
}

export function awardGameXP(
  xp: number,
  gameId: string,
  score: number = xp,
  mistakes: Array<Record<string, unknown>> = []
): UserProfile {
  const profile = getUserProfile();
  profile.xp_points += xp;
  profile.level = Math.floor(profile.xp_points / 800) + 1;
  profile.stats.games_played += 1;

  const lastDate = new Date(profile.last_study_date);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
  if (profile.streak_days === 0) {
    profile.streak_days = 1;
  } else if (diffDays === 1) {
    profile.streak_days += 1;
  } else if (diffDays > 1) {
    profile.streak_days = 1;
  }
  profile.last_study_date = now.toISOString();

  saveUserProfile(profile);

  // Record game in daily activity log
  const todayKey = getLocalDateKey(now);
  if (todayKey) {
    const logs = getDailyActivityLogs();
    const existing = logs[todayKey] || {
      date: todayKey,
      words_added: 0,
      games_played: 0,
      xp_earned: 0,
      game_entries: [],
    };
    existing.games_played += 1;
    existing.xp_earned += xp;
    existing.game_entries = [
      {
        game_id: gameId,
        score,
        xp_earned: xp,
        timestamp: now.toISOString(),
      },
      ...existing.game_entries,
    ];
    logs[todayKey] = existing;
    saveDailyActivityLogs(logs);
  }

  if (typeof window !== 'undefined' && profile.auth_provider !== 'guest' && profile.email) {
    fetch('/api/games/submit-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        game_type: gameId,
        score,
        xp_earned: xp,
        mistakes,
        email: profile.email,
      }),
    }).catch(() => {});
  }

  return profile;
}
