import { AppTab } from '@/components/Sidebar';
import { GameId } from '@/types';

export const TAB_ROUTES: Record<AppTab, string> = {
  dashboard: '/dashboard',
  arena: '/arena',
  vocabulary: '/vocabulary',
  coach: '/coach',
  analytics: '/analytics',
};

const GAME_ID_TO_SLUG: Record<GameId, string> = {
  speed_sprint: 'speed-sprint',
  sentence_builder: 'sentence-builder',
  smart_cloze: 'smart-cloze',
  error_hunter: 'error-hunter',
  academic_paraphrase: 'academic-paraphrase',
  collocation_matcher: 'collocation-matcher',
  listening_speller: 'listening-speller',
  speaking_rapid_fire: 'speaking-rapid-fire',
  thematic_crossword: 'thematic-crossword',
  ai_boss_fight: 'ai-boss-fight',
};

const SLUG_TO_GAME_ID: Record<string, GameId> = Object.entries(GAME_ID_TO_SLUG).reduce(
  (acc, [id, slug]) => {
    acc[slug] = id as GameId;
    acc[id] = id as GameId; // Also accept underscore fallback
    return acc;
  },
  {} as Record<string, GameId>
);

export function getGameHref(gameId: GameId): string {
  return `/arena/${GAME_ID_TO_SLUG[gameId] || gameId}`;
}

export function resolvePathToState(pathname: string): {
  tab: AppTab;
  gameId: GameId | null;
} {
  const clean = (pathname || '/').replace(/\/+$/, '') || '/';

  if (clean === '/' || clean === '/dashboard') {
    return { tab: 'dashboard', gameId: null };
  }
  if (clean === '/arena') {
    return { tab: 'arena', gameId: null };
  }
  if (clean.startsWith('/arena/')) {
    const slug = clean.slice('/arena/'.length).split('/')[0];
    const matched = SLUG_TO_GAME_ID[slug] || null;
    return { tab: 'arena', gameId: matched };
  }
  if (clean === '/vocabulary') {
    return { tab: 'vocabulary', gameId: null };
  }
  if (clean === '/coach') {
    return { tab: 'coach', gameId: null };
  }
  if (clean === '/analytics' || clean === '/calendar') {
    return { tab: 'analytics', gameId: null };
  }

  return { tab: 'dashboard', gameId: null };
}
