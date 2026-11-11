'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, AppTab } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { VocabularyModal } from '@/components/VocabularyModal';
import { SpeedSprintModal } from '@/components/games/SpeedSprintModal';
import { SentenceBuilderModal } from '@/components/games/SentenceBuilderModal';
import { ParaphraseDuelModal } from '@/components/games/ParaphraseDuelModal';
import { CollocationMatcherModal } from '@/components/games/CollocationMatcherModal';
import { SmartClozeModal } from '@/components/games/SmartClozeModal';
import { ErrorHunterModal } from '@/components/games/ErrorHunterModal';
import { ListeningSpellerModal } from '@/components/games/ListeningSpellerModal';
import { SpeakingRapidFireModal } from '@/components/games/SpeakingRapidFireModal';
import { ThematicCrosswordModal } from '@/components/games/ThematicCrosswordModal';
import { AiBossFightModal } from '@/components/games/AiBossFightModal';
import {
  getUserProfile,
  getVocabularyList,
  DEFAULT_USER,
  setActiveUserScope,
  syncSessionUserToProfile,
} from '@/lib/storage';
import { UserProfile, VocabularyWord, GameId } from '@/types';
import { GAME_MODES } from '@/data/gameModes';
import {
  Zap,
  Layers,
  FileText,
  Crosshair,
  Award,
  Link2,
  Headphones,
  Mic,
  Grid,
  Swords,
  Search,
  Plus,
  Volume2,
  Brain,
  Sparkles,
  CheckCircle2,
  Flame,
  Target,
  Loader2,
  Trophy,
  ArrowRight,
  ShieldCheck,
  LogIn,
  Clock,
  Crown,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  Crosshair: <Crosshair className="w-5 h-5" />,
  Award: <Award className="w-5 h-5" />,
  Link2: <Link2 className="w-5 h-5" />,
  Headphones: <Headphones className="w-5 h-5" />,
  Mic: <Mic className="w-5 h-5" />,
  Grid: <Grid className="w-5 h-5" />,
  Swords: <Swords className="w-5 h-5" />,
};

interface LeaderboardEntry {
  id?: string | number;
  name: string;
  email?: string;
  level: number;
  target_ielts_band: number;
  xp_points: number;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [isAddWordOpen, setIsAddWordOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeGameModal, setActiveGameModal] = useState<GameId | null>(null);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'new' | 'learning' | 'reviewing' | 'mastered'>('all');
  const [selectedGameFilter, setSelectedGameFilter] = useState<'all' | 'leksika' | 'grammatika' | 'writing' | 'audio' | 'boss'>('all');

  // Coach AI state
  const [coachInput, setCoachInput] = useState(
    'Implementing new technology in schools is very helpful because it lets students learn faster. However, some teachers are not sure about it.'
  );
  const [isCoachAnalyzing, setIsCoachAnalyzing] = useState(false);
  const [coachFeedback, setCoachFeedback] = useState<any | null>(null);

  const fetchLeaderboard = () => {
    fetch('/api/leaderboard')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.entries)) {
          setLeaderboard(data.entries);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    setMounted(true);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const errParam = params.get('auth_error');
      if (errParam) {
        setAuthError(errParam);
        setIsAuthModalOpen(true);
        window.history.replaceState({}, '', '/');
      } else if (params.get('auth_success')) {
        window.history.replaceState({}, '', '/');
      }
    }

    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        setGoogleEnabled(Boolean(data.googleEnabled));
        if (data.user) {
          const synced = syncSessionUserToProfile(data.user);
          setUser(synced);
          setIsAuthenticated(true);
          setVocabulary(getVocabularyList());
        } else {
          setActiveUserScope(null);
          setUser(getUserProfile());
          setIsAuthenticated(false);
          setVocabulary(getVocabularyList());
        }
      })
      .catch(() => {
        setUser(getUserProfile());
        setVocabulary(getVocabularyList());
      });

    fetchLeaderboard();
  }, []);

  const refreshState = () => {
    setUser(getUserProfile());
    setVocabulary(getVocabularyList());
    fetchLeaderboard();
  };

  const handleAuthSuccess = (sessionUser: any) => {
    const synced = syncSessionUserToProfile(sessionUser);
    setUser(synced);
    setIsAuthenticated(true);
    setAuthError(null);
    setVocabulary(getVocabularyList());
    fetchLeaderboard();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' });
    setActiveUserScope(null);
    setIsAuthenticated(false);
    setUser(getUserProfile());
    setVocabulary(getVocabularyList());
  };

  const handlePlayGame = (gameId: GameId) => {
    setActiveGameModal(gameId);
  };

  const playWordAudio = (word: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word);
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    }
  };

  const handleQuickSearch = (val: string) => {
    setSearchQuery(val);
    if (val.trim() && activeTab !== 'vocabulary') {
      setActiveTab('vocabulary');
    }
  };

  const handleCoachAnalyze = async () => {
    if (!coachInput.trim()) return;
    setIsCoachAnalyzing(true);
    try {
      const res = await fetch('/api/evaluate-paraphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_sentence: 'Discuss the impact of technology on education.',
          user_paraphrase: coachInput,
          target_word: 'technology',
          user_ielts_target: user.target_ielts_band,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCoachFeedback(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCoachAnalyzing(false);
    }
  };

  const filteredVocabulary = vocabulary.filter((w) => {
    const matchesSearch =
      w.word_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.translation_uz.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatusFilter === 'all' || w.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredGames = GAME_MODES.filter((g) => {
    if (selectedGameFilter === 'all') return true;
    if (selectedGameFilter === 'leksika') return g.category.includes('Leksika') || g.category.includes('Akademik Lug');
    if (selectedGameFilter === 'grammatika') return g.category.includes('Grammatika') || g.category.includes('Proofreading');
    if (selectedGameFilter === 'writing') return g.category.includes('Writing') || g.id === 'academic_paraphrase';
    if (selectedGameFilter === 'audio') return g.category.includes('Listening') || g.category.includes('Speaking');
    if (selectedGameFilter === 'boss') return g.id === 'ai_boss_fight';
    return true;
  });

  const vocabPct =
    vocabulary.length > 0
      ? Math.round(vocabulary.reduce((sum, w) => sum + (w.mastery_score || 0), 0) / vocabulary.length)
      : 0;
  const dailyGoalPct = Math.min(100, user.stats.games_played * 20 + user.stats.words_mastered * 10);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] dark:bg-none dark:bg-[#080B11] flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl glass-surface flex items-center justify-center text-teal-600 dark:text-cyan-400 animate-pulse">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tracking-wider">
            LexiAI yuklanmoqda...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] dark:bg-none dark:bg-[#080B11] text-slate-900 dark:text-slate-100 transition-colors duration-300 ease-in-out relative overflow-x-clip">
      {/* Subtle Ambient Refraction Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-cyan-400/15 dark:bg-cyan-500/10 blur-[110px]" />
        <div className="absolute top-1/3 -left-32 w-[380px] h-[380px] rounded-full bg-teal-400/15 dark:bg-violet-600/10 blur-[120px]" />
      </div>

      {/* Top Navigation Bar */}
      <Navbar
        user={user}
        isAuthenticated={isAuthenticated}
        onOpenAddWord={() => setIsAddWordOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onToggleMobileMenu={() => setMobileMenuOpen(true)}
        quickSearch={searchQuery}
        onQuickSearchChange={handleQuickSearch}
      />

      {/* Body Layout: Sidebar Rail + Main Content */}
      <div className="flex flex-1 relative z-10">
        <Sidebar
          user={user}
          isAuthenticated={isAuthenticated}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
          dailyProgressPct={dailyGoalPct}
        />

        <main className="flex-1 min-w-0 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {/* ================= TAB 0: DASHBOARD (OVERVIEW) ================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Hero Welcome Card */}
              <section className="glass-surface rounded-3xl p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
                <div className="space-y-3 relative z-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold tabular-nums">
                      Target: IELTS Band {user.target_ielts_band}
                    </span>
                    <span className="px-3 py-1 rounded-full glass-pill text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                      Daraja: {user.current_level}
                    </span>
                    {isAuthenticated && (
                      <span className="px-3 py-1 rounded-full bg-teal-500/10 dark:bg-cyan-500/15 border border-teal-500/25 dark:border-cyan-500/30 text-teal-700 dark:text-cyan-300 text-[11px] font-semibold inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {user.auth_provider === 'google' ? 'Google bilan ulangan' : 'Akkount faol'}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Xush kelibsiz, {user.name}
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                    Shaxsiy lug&apos;at bazangizda{' '}
                    <strong className="font-mono tabular-nums text-slate-900 dark:text-white">
                      {vocabulary.length} ta
                    </strong>{' '}
                    akademik so&apos;z mavjud. Bugungi maqsadingiz: 10 ta so&apos;zni takrorlash va Parafraz Duelida Band 7.5+ olish.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
                  {!isAuthenticated && (
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-5 py-3 rounded-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Google bilan kirish</span>
                    </button>
                  )}

                  <button
                    onClick={() => handlePlayGame('speed_sprint')}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 text-white dark:text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-teal-600/20 dark:shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Mashqni Boshlash</span>
                  </button>
                </div>
              </section>

              {/* Circular Skill Rings Row */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Vocabulary', sub: `${vocabulary.length} ta aktiv so'z`, pct: vocabPct, color: '#06b6d4', textClass: 'text-teal-700 dark:text-cyan-400' },
                  { label: 'Grammar', sub: 'Range & Accuracy', pct: user.stats.grammar_score, color: '#8b5cf6', textClass: 'text-violet-700 dark:text-violet-400' },
                  { label: 'Writing', sub: 'Task 1 & Task 2', pct: user.stats.writing_score, color: '#f59e0b', textClass: 'text-amber-700 dark:text-amber-400' },
                  { label: 'Speaking', sub: 'Fluency & Lexis', pct: user.stats.speaking_score, color: '#10b981', textClass: 'text-emerald-700 dark:text-emerald-400' },
                ].map((skill) => {
                  const clampedPct = Math.max(0, Math.min(100, skill.pct || 0));
                  const offset = +(125.6 * (1 - clampedPct / 100)).toFixed(1);
                  return (
                    <div
                      key={skill.label}
                      className="glass-surface rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                        <svg className="w-14 h-14 transform -rotate-90">
                          <circle
                            cx="28"
                            cy="28"
                            r="20"
                            className="stroke-slate-200 dark:stroke-slate-800/90"
                            strokeWidth="4.5"
                            fill="transparent"
                          />
                          <circle
                            cx="28"
                            cy="28"
                            r="20"
                            stroke={skill.color}
                            strokeWidth="4.5"
                            strokeDasharray="125.6"
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            fill="transparent"
                            className="transition-all duration-500"
                          />
                        </svg>
                        <span className={`absolute text-xs font-mono font-bold tabular-nums ${skill.textClass}`}>
                          {clampedPct}%
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                          {skill.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{skill.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* Split Row: My Vocabulary Bank + Quick Play Arena */}
              <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left 2 cols: My Vocabulary Preview Table */}
                <div className="xl:col-span-2 glass-surface rounded-3xl p-6 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                        My Vocabulary Bank
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        SM-2 algoritmi navbatidagi asosiy akademik so&apos;zlar
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => setActiveTab('vocabulary')}
                        className="text-xs text-teal-600 dark:text-cyan-400 hover:underline font-semibold"
                      >
                        Barchasi →
                      </button>
                      <button
                        onClick={() => setIsAddWordOpen(true)}
                        className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Word
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-black/[0.06] dark:border-white/[0.08] text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          <th className="py-2.5 px-3 font-semibold">English Word</th>
                          <th className="py-2.5 px-3 font-semibold">Uzbek Translation</th>
                          <th className="py-2.5 px-3 font-semibold">Mastery Status</th>
                          <th className="py-2.5 px-3 text-right font-semibold">Audio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06] text-xs">
                        {vocabulary.slice(0, 5).map((word) => (
                          <tr
                            key={word.id}
                            className="hover:bg-slate-100/70 dark:hover:bg-white/[0.03] transition-colors"
                          >
                            <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                              {word.word_en}
                              <span className="ml-2 text-[10px] font-mono font-semibold text-slate-400">
                                {word.academic_level}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                              {word.translation_uz}
                            </td>
                            <td className="py-3.5 px-3">
                              <span
                                className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold capitalize ${
                                  word.status === 'mastered'
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25'
                                    : word.status === 'reviewing'
                                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25'
                                    : word.status === 'learning'
                                    ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25'
                                    : 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/25'
                                }`}
                              >
                                {word.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <button
                                onClick={() => playWordAudio(word.word_en)}
                                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-cyan-400 hover:bg-slate-200/70 dark:hover:bg-white/10 transition-colors"
                                aria-label="Talaffuzni tinglash"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right col: Quick Play Arena Cards */}
                <div className="glass-surface rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                      Tezkor O&apos;yinlar
                    </h2>
                    <button
                      onClick={() => setActiveTab('arena')}
                      className="text-xs text-teal-600 dark:text-cyan-400 hover:underline font-semibold"
                    >
                      10 ta rejim →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {[
                      { id: 'speed_sprint' as GameId, title: 'Tarjima-Sprint', sub: '60s Imlo & Combo', badge: 'A1–B2' },
                      { id: 'sentence_builder' as GameId, title: 'Grammatika Konstruktori', sub: 'Inversion & Conditionals', badge: 'A2–C1' },
                      { id: 'academic_paraphrase' as GameId, title: 'Akademik Parafraz Duellari', sub: 'AI Band 5 → 8 Baholash', badge: 'Band 8' },
                      { id: 'collocation_matcher' as GameId, title: 'Kollokatsiya Matcher', sub: 'Mitigate → Risk', badge: 'B1–C1' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        onClick={() => handlePlayGame(g.id)}
                        className="w-full p-3.5 rounded-2xl glass-pill hover:border-teal-500/40 dark:hover:border-cyan-400/40 text-left flex items-center justify-between transition-all hover:scale-[1.01] active:scale-[0.99] group"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-cyan-300 transition-colors">
                            {g.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{g.sub}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-mono font-bold">
                            {g.badge}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ================= TAB 1: GAME CENTER & ARENA ================= */}
          {activeTab === 'arena' && (
            <div className="space-y-6">
              {/* Hero Banner with Floating 3D Glass Asset */}
              <section className="glass-surface rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative overflow-hidden">
                <div className="space-y-3 max-w-2xl relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-cyan-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Game Center &amp; Arena • 10 ta Interaktiv O&apos;yin</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                    Shaxsiy Lug&apos;atingiz Asosidagi Arena
                  </h1>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    Oddiy imlodan tortib IELTS Band {user.target_ielts_band}+ akademik insho va tezkor nutq darajasigacha olib chiquvchi adaptiv gamifikatsiya tizimi.
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handlePlayGame('speed_sprint')}
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-cyan-400 dark:to-teal-400 text-white dark:text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-teal-600/20 dark:shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Tezkor Sprintni Boshlash</span>
                    </button>
                    <button
                      onClick={() => handlePlayGame('ai_boss_fight')}
                      className="px-5 py-3 rounded-full glass-pill text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <Crown className="w-4 h-4 text-violet-500" />
                      <span>AI Boss Fight</span>
                    </button>
                  </div>
                </div>

                {/* Right-Aligned Floating 3D Glass Typography/Badge Asset */}
                <div className="hidden md:flex items-center justify-center shrink-0 pr-2">
                  <div className="relative w-56 h-40 animate-float-slow">
                    <div className="absolute inset-2 rounded-3xl bg-gradient-to-br from-cyan-400/30 via-teal-400/20 to-violet-500/30 blur-xl" />
                    <div className="relative w-full h-full rounded-3xl glass-surface p-5 flex flex-col justify-between transform rotate-2 border border-white/70 dark:border-white/15">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-teal-700 dark:text-cyan-300">
                          SM-2 + AI ENGINE
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                      </div>
                      <div>
                        <p className="text-3xl font-black tracking-tighter bg-gradient-to-br from-slate-900 via-teal-700 to-cyan-600 dark:from-white dark:via-cyan-200 dark:to-teal-400 bg-clip-text text-transparent">
                          BAND {user.target_ielts_band}+
                        </p>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 font-mono tabular-nums">
                          10 MODES • {vocabulary.length} WORDS
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Category Filter Tabs (Scrollable Pill Chips) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: `Barchasi (${GAME_MODES.length})` },
                  { id: 'leksika', label: 'Leksika & Imlo' },
                  { id: 'grammatika', label: 'Grammatika' },
                  { id: 'writing', label: 'Writing & Duellar' },
                  { id: 'audio', label: 'Audio & Speaking' },
                  { id: 'boss', label: 'AI Boss Fight' },
                ].map((cat) => {
                  const active = selectedGameFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedGameFilter(cat.id as any)}
                      className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                        active
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md shadow-slate-900/15 dark:shadow-white/10 scale-[1.02]'
                          : 'glass-pill text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* 10 Games Grid */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGames.map((game) => {
                  const isBoss = game.id === 'ai_boss_fight';
                  const isDuel = game.id === 'academic_paraphrase';
                  return (
                    <article
                      key={game.id}
                      className={`glass-surface rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                        isBoss
                          ? 'ring-1 ring-violet-500/40 dark:ring-violet-400/40'
                          : isDuel
                          ? 'ring-1 ring-teal-500/35 dark:ring-cyan-400/35'
                          : ''
                      }`}
                    >
                      {/* Card Header */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center border backdrop-blur-md ${
                                isBoss
                                  ? 'bg-violet-500/15 border-violet-500/30 text-violet-600 dark:text-violet-300'
                                  : isDuel
                                  ? 'bg-teal-500/15 dark:bg-cyan-500/15 border-teal-500/30 dark:border-cyan-500/30 text-teal-700 dark:text-cyan-300'
                                  : 'bg-slate-200/70 dark:bg-white/[0.06] border-black/[0.06] dark:border-white/[0.1] text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              {ICON_MAP[game.icon] || <Zap className="w-5 h-5" />}
                            </div>
                            <div>
                              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                                {game.category}
                              </span>
                              <span className="inline-block mt-0.5 text-[11px] font-mono font-bold text-teal-700 dark:text-cyan-300">
                                {game.level_badge}
                              </span>
                            </div>
                          </div>

                          {game.xp_reward && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-[11px] font-mono font-bold tabular-nums shrink-0">
                              {game.xp_reward}
                            </span>
                          )}
                        </div>

                        {/* Card Body */}
                        <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white mb-2">
                          {game.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">
                          {game.description_uz}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] space-y-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] text-[11px] font-medium text-slate-600 dark:text-slate-300 max-w-full">
                          <Target className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400 shrink-0" />
                          <span className="truncate">{game.ielts_benefit}</span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{game.duration_seconds}s</span>
                          </span>

                          <button
                            onClick={() => handlePlayGame(game.id)}
                            className={`px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm ${
                              isBoss
                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-500/25'
                                : isDuel
                                ? 'bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-cyan-400 dark:to-teal-400 text-white dark:text-slate-950 shadow-cyan-500/20'
                                : 'bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/15 text-white border border-transparent dark:border-white/10'
                            }`}
                          >
                            <span>O&apos;ynash</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            </div>
          )}

          {/* ================= TAB 2: MY VOCABULARY BANK ================= */}
          {activeTab === 'vocabulary' && (
            <div className="space-y-6">
              <section className="glass-surface rounded-3xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      Shaxsiy Lug&apos;at Banki &amp; SM-2
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Foydalanuvchi kiritgan so&apos;zlar SM-2 algoritmi orqali o&apos;yinlarga navbatma-navbat uzatiladi
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddWordOpen(true)}
                    className="self-start sm:self-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 text-white dark:text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Yangi so&apos;z qo&apos;shish</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl glass-pill text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-teal-700 dark:text-cyan-400 block mb-1">
                    Xotira Zanjiri: So&apos;z Qanday Qilib &ldquo;Mastered&rdquo; Bo&apos;ladi?
                  </span>
                  <p className="leading-relaxed">
                    Kiritilgan so&apos;z dastlab <strong>Tarjima-Sprint</strong>da to&apos;g&apos;ri yoziladi, keyin <strong>Kollokatsiya Matcher</strong>da birikmalar bilan mustahkamlanadi. Yakunida <strong>Akademik Parafraz</strong>da xatosiz ishlatilgandagina <em>&ldquo;Mastered&rdquo;</em> deb belgilanadi.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {(['all', 'new', 'learning', 'reviewing', 'mastered'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedStatusFilter(st)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                        selectedStatusFilter === st
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold shadow-sm'
                          : 'glass-pill text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {st === 'all' ? `Barchasi (${vocabulary.length})` : st}
                    </button>
                  ))}
                </div>
              </section>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Lug'atdan qidirish (inglizcha yoki o'zbekcha)..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl glass-surface text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-teal-500/40 dark:focus:ring-cyan-400/40"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredVocabulary.map((word) => (
                  <div
                    key={word.id}
                    className="glass-surface rounded-3xl p-5 space-y-3 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {word.word_en}
                          </h4>
                          <button
                            onClick={() => playWordAudio(word.word_en)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            aria-label="Talaffuz"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <span className="text-[11px] text-slate-400 font-mono">{word.phonetic}</span>
                        </div>
                        <p className="text-sm font-semibold text-teal-700 dark:text-cyan-300">
                          {word.translation_uz}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider tabular-nums ${
                          word.status === 'mastered'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : word.status === 'reviewing'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                            : word.status === 'learning'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                            : 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/30'
                        }`}
                      >
                        {word.status} ({word.mastery_score}%)
                      </span>
                    </div>

                    {word.collocations && word.collocations.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {word.collocations.map((col, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2.5 py-0.5 rounded-full glass-pill text-slate-700 dark:text-slate-300"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] text-xs text-slate-600 dark:text-slate-400 italic">
                      &ldquo;{word.example_sentence}&rdquo;
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-mono tabular-nums">
                      <span>Mavzu: {word.topic_tag} • {word.academic_level}</span>
                      <span>Interval: {word.repetition_interval} kun</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: AI IELTS COACH ================= */}
          {activeTab === 'coach' && (
            <div className="space-y-6">
              <section className="glass-surface rounded-3xl p-6 space-y-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-300">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      AI IELTS Coach &amp; Writing Evaluator
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      Matningizni rasmiy IELTS mezonlari bo&apos;yicha real-vaqtda tahlil qiling
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl glass-pill space-y-1">
                  <span className="text-[10px] font-bold text-teal-700 dark:text-cyan-400 uppercase tracking-wider">
                    Writing Task 2 Mashqi:
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    &ldquo;Discuss the impact of technology on modern education. Provide reasons and examples.&rdquo;
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
                    Javobingiz yoki parafrazingiz:
                  </label>
                  <textarea
                    rows={4}
                    value={coachInput}
                    onChange={(e) => setCoachInput(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] focus:border-teal-500 dark:focus:border-cyan-400 text-sm text-slate-900 dark:text-white outline-none transition-colors"
                  />

                  <button
                    onClick={handleCoachAnalyze}
                    disabled={isCoachAnalyzing || coachInput.trim().length < 5}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {isCoachAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>AI tahlil qilmoqda...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>AI Examiner Bahosini Olish</span>
                      </>
                    )}
                  </button>
                </div>
              </section>

              {coachFeedback && (
                <section className="glass-surface rounded-3xl p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      AI Examiner Natijasi
                    </h3>
                    <span className="px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-sm tabular-nums">
                      Band {coachFeedback.evaluated_band}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl glass-pill text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      <span className="font-bold text-teal-700 dark:text-cyan-400 block mb-1">
                        Ekspert Izohi:
                      </span>
                      {coachFeedback.feedback_uz}
                    </div>

                    {coachFeedback.criteria_scores && (
                      <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                        <div className="p-3 rounded-2xl glass-pill">
                          <span className="text-[10px] text-slate-500 block mb-1">Task Achiev</span>
                          <strong className="text-base font-mono tabular-nums text-teal-700 dark:text-cyan-300">
                            {coachFeedback.criteria_scores.task_achievement}
                          </strong>
                        </div>
                        <div className="p-3 rounded-2xl glass-pill">
                          <span className="text-[10px] text-slate-500 block mb-1">Lexical Res</span>
                          <strong className="text-base font-mono tabular-nums text-amber-600 dark:text-amber-300">
                            {coachFeedback.criteria_scores.lexical_resource}
                          </strong>
                        </div>
                        <div className="p-3 rounded-2xl glass-pill">
                          <span className="text-[10px] text-slate-500 block mb-1">Grammar</span>
                          <strong className="text-base font-mono tabular-nums text-violet-700 dark:text-violet-300">
                            {coachFeedback.criteria_scores.grammatical_range}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {coachFeedback.c1_upgrade && (
                    <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/25 text-xs space-y-1">
                      <span className="font-bold text-violet-700 dark:text-violet-300 block">
                        ✨ C1 Akademik Muqobili (Upgrade):
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 italic">
                        &ldquo;{coachFeedback.c1_upgrade}&rdquo;
                      </p>
                    </div>
                  )}
                </section>
              )}
            </div>
          )}

          {/* ================= TAB 4: LEADERBOARD & ANALYTICS ================= */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <section className="glass-surface rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
                      {user.streak_days} Kunlik Uzluksiz Streak
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md">
                    Har kuni kamida 1 ta mini-o&apos;yin o&apos;ynang va yangi so&apos;zlarni mustahkamlab, reytingda ko&apos;tariling.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((day) => (
                    <div
                      key={day}
                      className={`w-8 h-10 rounded-xl flex flex-col items-center justify-center text-[10px] font-mono font-bold border transition-colors ${
                        day <= user.streak_days
                          ? 'bg-orange-500/15 border-orange-500/40 text-orange-600 dark:text-orange-400'
                          : 'glass-pill text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      <span>D{day}</span>
                      <span>{day <= user.streak_days ? '✓' : '·'}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="glass-surface rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Haftalik Arena Liderbordi
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {(() => {
                    const selfEmail = user.email?.toLowerCase();
                    const others = leaderboard.filter(
                      (item) => (item.email || '').toLowerCase() !== selfEmail
                    );
                    const combined = [
                      ...others.map((item) => ({
                        name: item.name,
                        level: item.level,
                        band: item.target_ielts_band,
                        xp: item.xp_points,
                        isSelf: false,
                      })),
                      {
                        name: user.name,
                        level: user.level,
                        band: user.target_ielts_band,
                        xp: user.xp_points,
                        isSelf: true,
                      },
                    ].sort((a, b) => b.xp - a.xp);

                    return combined.map((entry, idx) => (
                      <div
                        key={entry.name + idx}
                        className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                          entry.isSelf
                            ? 'bg-teal-500/10 dark:bg-cyan-500/10 border-teal-500/35 dark:border-cyan-400/35'
                            : 'glass-pill'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <span className="w-8 h-8 rounded-xl bg-slate-200/80 dark:bg-white/10 flex items-center justify-center text-xs font-mono font-black text-amber-600 dark:text-amber-400 tabular-nums">
                            #{idx + 1}
                          </span>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              {entry.name}{' '}
                              {entry.isSelf && (
                                <span className="text-teal-700 dark:text-cyan-400 font-semibold">(Siz)</span>
                              )}
                            </p>
                            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                              Level {entry.level} • Target Band {entry.band}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-mono font-black tabular-nums text-amber-600 dark:text-amber-400">
                          {entry.xp} XP
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        isAuthenticated={isAuthenticated}
        googleEnabled={googleEnabled}
        authError={authError}
        onAuthSuccess={handleAuthSuccess}
        onLogout={handleLogout}
      />

      <VocabularyModal
        isOpen={isAddWordOpen}
        onClose={() => setIsAddWordOpen(false)}
        onWordAdded={(newWord) => {
          setVocabulary((prev) => [newWord, ...prev]);
          refreshState();
        }}
      />

      <SpeedSprintModal
        isOpen={activeGameModal === 'speed_sprint'}
        onClose={() => setActiveGameModal(null)}
        words={vocabulary}
        onFinishGame={refreshState}
      />

      <SentenceBuilderModal
        isOpen={activeGameModal === 'sentence_builder'}
        onClose={() => setActiveGameModal(null)}
        onFinishGame={refreshState}
      />

      <ParaphraseDuelModal
        isOpen={activeGameModal === 'academic_paraphrase'}
        onClose={() => setActiveGameModal(null)}
        onFinishGame={refreshState}
      />

      <CollocationMatcherModal
        isOpen={activeGameModal === 'collocation_matcher'}
        onClose={() => setActiveGameModal(null)}
        onFinishGame={refreshState}
      />

      <SmartClozeModal
        isOpen={activeGameModal === 'smart_cloze'}
        onClose={() => setActiveGameModal(null)}
        onFinishGame={refreshState}
      />

      <ErrorHunterModal
        isOpen={activeGameModal === 'error_hunter'}
        onClose={() => setActiveGameModal(null)}
        onFinishGame={refreshState}
      />

      <ListeningSpellerModal
        isOpen={activeGameModal === 'listening_speller'}
        onClose={() => setActiveGameModal(null)}
        words={vocabulary}
        onFinishGame={refreshState}
      />

      <SpeakingRapidFireModal
        isOpen={activeGameModal === 'speaking_rapid_fire'}
        onClose={() => setActiveGameModal(null)}
        words={vocabulary}
        onFinishGame={refreshState}
      />

      <ThematicCrosswordModal
        isOpen={activeGameModal === 'thematic_crossword'}
        onClose={() => setActiveGameModal(null)}
        onFinishGame={refreshState}
      />

      <AiBossFightModal
        isOpen={activeGameModal === 'ai_boss_fight'}
        onClose={() => setActiveGameModal(null)}
        words={vocabulary}
        onFinishGame={refreshState}
      />
    </div>
  );
}
