export type WordStatus = 'new' | 'learning' | 'reviewing' | 'mastered';

export interface VocabularyWord {
  id: string;
  word_en: string;
  translation_uz: string;
  phonetic?: string;
  part_of_speech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase' | 'idiom';
  academic_level: 'B1' | 'B2' | 'C1' | 'C2';
  collocations: string[];
  example_sentence: string;
  example_translation_uz?: string;
  topic_tag: 'Environment' | 'Technology' | 'Education' | 'Society' | 'Health' | 'General';
  mastery_score: number; // 0 - 100
  repetition_interval: number; // in days
  ease_factor: number; // SM-2 default 2.5
  review_count: number;
  next_review_date: string; // ISO date string
  last_reviewed_at?: string;
  created_at: string;
  status: WordStatus;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  current_level: 'A2' | 'B1' | 'B2' | 'C1';
  target_ielts_band: number; // e.g. 7.5
  xp_points: number;
  level: number;
  streak_days: number;
  last_study_date: string;
  stats: {
    words_learned: number;
    words_mastered: number;
    grammar_score: number; // percentage
    writing_score: number;
    speaking_score: number;
    games_played: number;
  };
}

export type GameId = 
  | 'speed_sprint'
  | 'sentence_builder'
  | 'smart_cloze'
  | 'error_hunter'
  | 'academic_paraphrase'
  | 'collocation_matcher'
  | 'listening_speller'
  | 'speaking_rapid_fire'
  | 'thematic_crossword'
  | 'ai_boss_fight';

export interface GameModeInfo {
  id: GameId;
  title: string;
  title_uz: string;
  category: string;
  level_badge: string;
  duration_seconds: number;
  description_uz: string;
  ielts_benefit: string;
  icon: string;
  active_players_count?: string;
  is_ready: boolean;
}

export interface ParaphraseEvaluation {
  is_success: boolean;
  evaluated_band: number;
  criteria_scores: {
    task_achievement: number;
    lexical_resource: number;
    grammatical_range: number;
    coherence: number;
  };
  feedback_uz: string;
  c1_upgrade: string;
  upgrades: Array<{
    basic: string;
    academic: string;
    band_boost: string;
  }>;
  xp_awarded: number;
}
