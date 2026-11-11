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
  Play,
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

  useEffect(() => {
    setMounted(true);

    // Check URL auth feedback params
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

    // Load active session
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
    // Load leaderboard
    fetch('/api/leaderboard')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.entries)) {
          setLeaderboard(data.entries);
        }
      })
      .catch(() => {});
  }, []);

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
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black text-xl animate-pulse">
            L
          </div>
          <span className="text-xs text-slate-400 font-mono tracking-wider">LexiAI yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex">
      {/* Left Sidebar (Matching PDF Dashboard Layout) */}
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

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          user={user}
          isAuthenticated={isAuthenticated}
          onOpenAddWord={() => setIsAddWordOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          quickSearch={searchQuery}
          onQuickSearchChange={handleQuickSearch}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* ================= TAB 0: DASHBOARD (OVERVIEW) ================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Hero Welcome Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-[#11192c] via-[#131d35] to-cyan-950/50 border border-slate-800/90 flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
                <div className="space-y-2 relative z-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                      Target: IELTS Band {user.target_ielts_band}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-semibold">
                      Daraja: {user.current_level}
                    </span>
                    {isAuthenticated && (
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-[11px] font-semibold inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        {user.auth_provider === 'google' ? 'Google bilan ulangan' : 'Akkount faol'}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Xush kelibsiz, {user.name}! 👋
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                    Shaxsiy lug&apos;at bazangizda <strong>{vocabulary.length} ta</strong> akademik so&apos;z mavjud. Bugungi maqsadingiz: 10 ta so&apos;zni takrorlash va Parafraz Duelida Band 7.5+ olish.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 relative z-10">
                  {!isAuthenticated && (
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Google bilan kirish</span>
                    </button>
                  )}

                  <button
                    onClick={() => handlePlayGame('speed_sprint')}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                  >
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>Mashqni Boshlash</span>
                  </button>
                </div>
              </div>

              {/* Circular Skill Rings Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Vocabulary', sub: `${vocabulary.length} ta aktiv so'z`, pct: vocabPct, color: '#06b6d4', textClass: 'text-cyan-400' },
                  { label: 'Grammar', sub: 'Range & Accuracy', pct: user.stats.grammar_score, color: '#a855f7', textClass: 'text-purple-400' },
                  { label: 'Writing', sub: 'Task 1 & Task 2', pct: user.stats.writing_score, color: '#f59e0b', textClass: 'text-amber-400' },
                  { label: 'Speaking', sub: 'Fluency & Lexis', pct: user.stats.speaking_score, color: '#10b981', textClass: 'text-emerald-400' },
                ].map((skill) => {
                  const clampedPct = Math.max(0, Math.min(100, skill.pct || 0));
                  const offset = +(125.6 * (1 - clampedPct / 100)).toFixed(1);
                  return (
                    <div
                      key={skill.label}
                      className="p-4 rounded-2xl bg-[#111827] border border-slate-800/90 flex items-center gap-3.5 hover:border-slate-700 transition-all"
                    >
                      <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                        <svg className="w-14 h-14 transform -rotate-90">
                          <circle cx="28" cy="28" r="20" stroke="#1e293b" strokeWidth="4.5" fill="transparent" />
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
                        <span className={`absolute text-xs font-black ${skill.textClass}`}>{clampedPct}%</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{skill.label}</p>
                        <p className="text-[11px] text-slate-400">{skill.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Split Row: Featured Games + My Vocabulary Bank Table (Page 8 Layout) */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left 2 cols: My Vocabulary Preview Table */}
                <div className="xl:col-span-2 rounded-3xl bg-[#111827] border border-slate-800/90 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-extrabold text-white">My Vocabulary Bank</h2>
                      <p className="text-xs text-slate-400">SM-2 algoritmi navbatidagi asosiy akademik so&apos;zlar</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTab('vocabulary')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        Barchasi →
                      </button>
                      <button
                        onClick={() => setIsAddWordOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Word
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500">
                          <th className="py-2.5 px-3">English Word</th>
                          <th className="py-2.5 px-3">Uzbek Translation</th>
                          <th className="py-2.5 px-3">Mastery Status</th>
                          <th className="py-2.5 px-3 text-right">Audio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70 text-xs">
                        {vocabulary.slice(0, 5).map((word) => (
                          <tr key={word.id} className="hover:bg-slate-900/60 transition-colors">
                            <td className="py-3 px-3 font-bold text-white">
                              {word.word_en}
                              <span className="ml-1.5 text-[10px] font-normal text-slate-500">
                                {word.academic_level}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-300">{word.translation_uz}</td>
                            <td className="py-3 px-3">
                              <span
                                className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold capitalize ${
                                  word.status === 'mastered'
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : word.status === 'reviewing'
                                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                    : word.status === 'learning'
                                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                    : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                                }`}
                              >
                                {word.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => playWordAudio(word.word_en)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
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
                <div className="rounded-3xl bg-[#111827] border border-slate-800/90 p-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-extrabold text-white">Tezkor O&apos;yinlar</h2>
                    <button
                      onClick={() => setActiveTab('arena')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      10 ta rejim →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { id: 'speed_sprint' as GameId, title: 'Tarjima-Sprint', sub: '60s Imlo & Combo', badge: 'A1–B2', color: 'border-cyan-500/30 bg-cyan-950/20' },
                      { id: 'sentence_builder' as GameId, title: 'Grammatika Konstruktori', sub: 'Inversion & Conditionals', badge: 'A2–C1', color: 'border-purple-500/30 bg-purple-950/20' },
                      { id: 'academic_paraphrase' as GameId, title: 'Akademik Parafraz Duellari', sub: 'AI Band 5 → 8 Baholash', badge: 'Band 8', color: 'border-emerald-500/30 bg-emerald-950/20' },
                      { id: 'collocation_matcher' as GameId, title: 'Kollokatsiya Matcher', sub: 'Mitigate → Risk', badge: 'B1–C1', color: 'border-amber-500/30 bg-amber-950/20' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        onClick={() => handlePlayGame(g.id)}
                        className={`w-full p-3.5 rounded-2xl border ${g.color} hover:border-cyan-400/60 text-left flex items-center justify-between transition-all group`}
                      >
                        <div>
                          <p className="text-xs font-extrabold text-white group-hover:text-cyan-300">
                            {g.title}
                          </p>
                          <p className="text-[11px] text-slate-400">{g.sub}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-900 text-slate-300 font-bold">
                            {g.badge}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 1: GAME CENTER & ARENA ================= */}
          {activeTab === 'arena' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#111827] via-slate-900/90 to-cyan-950/40 border border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs uppercase tracking-wider border border-cyan-500/30">
                      Game Center & Arena
                    </span>
                    <span className="text-xs text-slate-400">10 Ta Interaktiv O&apos;yin</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    Shaxsiy Lug&apos;atingiz Asosidagi Arena
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                    Oddiy imlodan tortib IELTS Band 7.5+ insho va nutq darajasigacha olib chiquvchi 10 ta o&apos;yin rejimi.
                  </p>
                </div>

                <button
                  onClick={() => handlePlayGame('speed_sprint')}
                  className="self-start md:self-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Tezkor Sprint</span>
                </button>
              </div>

              {/* Skill Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: `Barchasi (${GAME_MODES.length})` },
                  { id: 'leksika', label: 'Leksika & Imlo' },
                  { id: 'grammatika', label: 'Grammatika' },
                  { id: 'writing', label: 'Writing & Duellar' },
                  { id: 'audio', label: 'Audio & Speaking' },
                  { id: 'boss', label: 'AI Boss Fight 👑' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedGameFilter(cat.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedGameFilter === cat.id
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* 10 Games Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredGames.map((game) => {
                  const isSpecial = game.id === 'ai_boss_fight';
                  const isDuel = game.id === 'academic_paraphrase';
                  return (
                    <div
                      key={game.id}
                      className={`group rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                        isSpecial
                          ? 'bg-gradient-to-b from-purple-950/40 to-slate-900 border-2 border-purple-500/50 shadow-xl shadow-purple-500/10'
                          : isDuel
                          ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                          : 'bg-[#111827] border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                isSpecial
                                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                  : isDuel
                                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700'
                              }`}
                            >
                              {ICON_MAP[game.icon] || <Zap className="w-5 h-5" />}
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">{game.category}</span>
                              <span className="text-[11px] font-bold text-cyan-400">{game.level_badge}</span>
                            </div>
                          </div>
                          {game.xp_reward && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold">
                              {game.xp_reward}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-extrabold text-white mb-1.5 group-hover:text-cyan-400 transition-colors">
                          {game.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                          {game.description_uz}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80">
                        <div className="text-[10px] text-slate-500 mb-3 flex items-center gap-1 line-clamp-1">
                          <Target className="w-3 h-3 text-cyan-500 shrink-0" />
                          <span>{game.ielts_benefit}</span>
                        </div>

                        <button
                          onClick={() => handlePlayGame(game.id)}
                          className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                            isSpecial
                              ? 'bg-purple-600 hover:bg-purple-500 text-white'
                              : isDuel
                              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>O&apos;ynash ({game.duration_seconds}s)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 2: MY VOCABULARY BANK ================= */}
          {activeTab === 'vocabulary' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      Shaxsiy Lug&apos;at Banki & Spaced Repetition (SM-2)
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Foydalanuvchi kiritgan so&apos;zlar SM-2 algoritmi orqali o&apos;yinlarga navbatma-navbat uzatiladi
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddWordOpen(true)}
                    className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Yangi so&apos;z qo&apos;shish</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                  <span className="font-bold text-cyan-400 block mb-1">
                    🔄 Xotira Zanjiri: So&apos;z Qanday Qilib &ldquo;Mastered&rdquo; Bo&apos;ladi?
                  </span>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Kiritilgan so&apos;z dastlab <strong>Tarjima-Sprint</strong>da to&apos;g&apos;ri yoziladi, keyin <strong>Kollokatsiya Matcher</strong>da birikmalar bilan mustahkamlanadi. Yakunida <strong>Akademik Parafraz</strong>da xatosiz ishlatilgandagina <em>&ldquo;Mastered&rdquo;</em> deb belgilanadi.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {(['all', 'new', 'learning', 'reviewing', 'mastered'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                        selectedStatusFilter === st
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st === 'all' ? `Barchasi (${vocabulary.length})` : st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Lug'atdan qidirish (inglizcha yoki o'zbekcha)..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#111827] border border-slate-800 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVocabulary.map((word) => (
                  <div
                    key={word.id}
                    className="p-5 rounded-2xl bg-[#111827] border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-black text-white">{word.word_en}</h4>
                          <button
                            onClick={() => playWordAudio(word.word_en)}
                            className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <span className="text-[10px] text-slate-500 font-mono">{word.phonetic}</span>
                        </div>
                        <p className="text-sm font-semibold text-cyan-300">{word.translation_uz}</p>
                      </div>

                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                          word.status === 'mastered'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                            : word.status === 'reviewing'
                            ? 'bg-amber-950 text-amber-400 border border-amber-700'
                            : word.status === 'learning'
                            ? 'bg-blue-950 text-blue-400 border border-blue-700'
                            : 'bg-purple-950 text-purple-400 border border-purple-700'
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
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 italic">
                      &ldquo;{word.example_sentence}&rdquo;
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Mavzu: {word.topic_tag} • Daraja: {word.academic_level}</span>
                      <span>Takrorlash oralig&apos;i: {word.repetition_interval} kun</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: AI IELTS COACH ================= */}
          {activeTab === 'coach' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      AI IELTS Coach & Writing Evaluator
                    </h2>
                    <p className="text-xs text-slate-400">
                      Matningizni rasmiy 4 ta IELTS mezoni bo&apos;yicha real-vaqtda tahlil qiling
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase">Writing Task 2 Mashqi:</span>
                  <p className="text-sm font-semibold text-slate-200">
                    &ldquo;Discuss the impact of technology on modern education. Provide reasons and examples.&rdquo;
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">Sizning javob matningiz:</label>
                  <textarea
                    rows={4}
                    value={coachInput}
                    onChange={(e) => setCoachInput(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-sm text-white outline-none leading-relaxed"
                  />
                </div>

                <button
                  onClick={handleCoachAnalyze}
                  disabled={isCoachAnalyzing}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/25 disabled:opacity-40 transition-all"
                >
                  {isCoachAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AI Tekshirmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Matnni Tahlil Qilish & Band Ball Olish</span>
                    </>
                  )}
                </button>
              </div>

              {coachFeedback && (
                <div className="p-6 rounded-3xl bg-[#111827] border border-purple-500/30 space-y-5 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full border-4 border-purple-400 flex flex-col items-center justify-center bg-purple-950/40">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Estimated</span>
                        <span className="text-2xl font-black text-white">{coachFeedback.evaluated_band}</span>
                        <span className="text-[9px] text-purple-300 font-bold">Overall Band</span>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          AI Agent Feedback & Scoring
                        </h4>
                        <p className="text-xs text-slate-400">{coachFeedback.feedback_uz}</p>
                      </div>
                    </div>

                    {coachFeedback.criteria_scores && (
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">Task Achiev</span>
                          <strong className="text-cyan-300">{coachFeedback.criteria_scores.task_achievement}</strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">Lexical Res</span>
                          <strong className="text-amber-300">{coachFeedback.criteria_scores.lexical_resource}</strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">Grammar</span>
                          <strong className="text-purple-300">{coachFeedback.criteria_scores.grammatical_range}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {coachFeedback.c1_upgrade && (
                    <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs space-y-1">
                      <span className="font-bold text-purple-300 block">✨ C1 Akademik Muqobili (Upgrade):</span>
                      <p className="text-slate-200 italic">&ldquo;{coachFeedback.c1_upgrade}&rdquo;</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 4: LEADERBOARD & ANALYTICS ================= */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
                    <h3 className="text-xl font-bold text-white">{user.streak_days} Kunlik Uzluksiz Streak!</h3>
                  </div>
                  <p className="text-xs text-slate-400 max-w-md">
                    Har kuni kamida 1 ta mini-o&apos;yin o&apos;ynang va yangi so&apos;zlarni mustahkamlab, reytingda ko&apos;tariling.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((day) => (
                    <div
                      key={day}
                      className={`w-8 h-10 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold border ${
                        day <= user.streak_days
                          ? 'bg-gradient-to-t from-orange-500/20 to-orange-500/40 border-orange-500/50 text-orange-400'
                          : 'bg-slate-900 border-slate-800 text-slate-600'
                      }`}
                    >
                      <span>D{day}</span>
                      <span>{day <= user.streak_days ? '✓' : '·'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-extrabold text-white">Haftalik Arena Liderbordi</h3>
                </div>

                <div className="space-y-2">
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
                        className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                          entry.isSelf
                            ? 'bg-cyan-950/30 border-cyan-500/40'
                            : 'bg-slate-900/70 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-black text-amber-400">
                            #{idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-white">
                              {entry.name} {entry.isSelf && <span className="text-cyan-400">(Siz)</span>}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Level {entry.level} • Target Band {entry.band}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-black text-amber-400">{entry.xp} XP</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
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
