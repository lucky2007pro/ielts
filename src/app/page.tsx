'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { VocabularyModal } from '@/components/VocabularyModal';
import { SpeedSprintModal } from '@/components/games/SpeedSprintModal';
import { SentenceBuilderModal } from '@/components/games/SentenceBuilderModal';
import { ParaphraseDuelModal } from '@/components/games/ParaphraseDuelModal';
import { CollocationMatcherModal } from '@/components/games/CollocationMatcherModal';
import { getUserProfile, getVocabularyList } from '@/lib/storage';
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
  Filter,
  Plus,
  Play,
  Volume2,
  Brain,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Clock,
  Flame,
  Target,
  Send,
  Loader2,
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

export default function Home() {
  const [user, setUser] = useState<UserProfile>(getUserProfile());
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [activeTab, setActiveTab] = useState<'arena' | 'vocabulary' | 'coach' | 'analytics'>('arena');

  // Modals state
  const [isAddWordOpen, setIsAddWordOpen] = useState(false);
  const [activeGameModal, setActiveGameModal] = useState<GameId | null>(null);

  // Vocabulary search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'new' | 'learning' | 'reviewing' | 'mastered'>('all');

  // Coach AI state
  const [coachInput, setCoachInput] = useState(
    'Implementing new technology in schools is very helpful because it lets students learn faster. However, some teachers are not sure about it.'
  );
  const [isCoachAnalyzing, setIsCoachAnalyzing] = useState(false);
  const [coachFeedback, setCoachFeedback] = useState<any | null>(null);

  useEffect(() => {
    setUser(getUserProfile());
    setVocabulary(getVocabularyList());
  }, []);

  const refreshState = () => {
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

  // Filtered vocabulary
  const filteredVocabulary = vocabulary.filter((w) => {
    const matchesSearch =
      w.word_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.translation_uz.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatusFilter === 'all' || w.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col">
      {/* Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddWord={() => setIsAddWordOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* ================= TAB 1: GAME CENTER & ARENA ================= */}
        {activeTab === 'arena' && (
          <div className="space-y-6">
            {/* Arena Header & Stats bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 relative overflow-hidden">
              <div className="space-y-1 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs uppercase tracking-wider border border-cyan-500/30">
                    O&apos;yinlar Markazi & Arena
                  </span>
                  <span className="text-xs text-slate-400">10 Ta Interaktiv O&apos;yin Rejimi</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Shaxsiy Lug&apos;atingiz Asosidagi Arena
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                  Har bir o&apos;yin siz kiritgan yoki muammoli so&apos;zlarni takrorlaydi. Oddiy imlodan boshlab IELTS Band 7.5+ insho va nutq darajasigacha ko&apos;taring.
                </p>
              </div>

              {/* Quick Sprint Button */}
              <button
                onClick={() => handlePlayGame('speed_sprint')}
                className="self-start md:self-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2.5 shadow-xl shadow-cyan-500/25 active:scale-95 transition-all"
              >
                <Zap className="w-5 h-5 fill-slate-950" />
                <span>Tezkor Sprintni Boshlash</span>
              </button>
            </div>

            {/* Games Grid (10 Games matching spec) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {GAME_MODES.map((game, idx) => {
                const isSpecial = game.id === 'ai_boss_fight';
                const isDuel = game.id === 'academic_paraphrase';

                return (
                  <div
                    key={game.id}
                    className={`group relative rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                      isSpecial
                        ? 'bg-gradient-to-b from-purple-950/40 to-slate-900 border-2 border-purple-500/50 shadow-xl shadow-purple-500/10'
                        : isDuel
                        ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Top row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isSpecial
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : isDuel
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {ICON_MAP[game.icon] || <Zap className="w-5 h-5" />}
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-medium block">
                              {game.category}
                            </span>
                            <span className="text-[11px] font-bold text-cyan-400">
                              {game.level_badge}
                            </span>
                          </div>
                        </div>

                        {game.active_players_count && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {game.active_players_count}
                          </span>
                        )}
                      </div>

                      {/* Title & Desc */}
                      <h3 className="text-base font-extrabold text-white mb-1.5 group-hover:text-cyan-400 transition-colors">
                        {game.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                        {game.description_uz}
                      </p>
                    </div>

                    {/* Bottom CTA & IELTS benefit */}
                    <div className="pt-3 border-t border-slate-800/80">
                      <div className="text-[10px] text-slate-500 mb-3 flex items-center gap-1 line-clamp-1">
                        <Target className="w-3 h-3 text-cyan-500 shrink-0" />
                        <span>{game.ielts_benefit}</span>
                      </div>

                      <button
                        onClick={() => handlePlayGame(game.id)}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                          isSpecial
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
                            : isDuel
                            ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/30'
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
            {/* Header & SM-2 status info */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
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
                  className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Yangi so&apos;z qo&apos;shish</span>
                </button>
              </div>

              {/* Memory Chain (Xotira Zanjiri as in PDF Page 8) */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-cyan-400 block mb-1">
                  🔄 Xotira Zanjiri: So&apos;z Qanday Qilib &ldquo;Mastered&rdquo; Bo&apos;ladi?
                </span>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Kiritilgan so&apos;z dastlab <strong>Tarjima-Sprint</strong> va <strong>Listening Speller</strong>da to&apos;g&apos;ri yoziladi. Keyin <strong>Kollokatsiya Matcher</strong> va <strong>Kontekst-Ovchisi</strong>da birikmalar bilan mustahkamlanadi. Yakunida <strong>Akademik Parafraz</strong> va <strong>AI Boss Fight</strong> inshosida xatosiz ishlatilgandagina xotirada <em>&ldquo;Mastered&rdquo;</em> deb belgilanadi!
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {(['all', 'new', 'learning', 'reviewing', 'mastered'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                      selectedStatusFilter === st
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st === 'all' ? `Barchasi (${vocabulary.length})` : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Lug'atdan qidirish (inglizcha yoki o'zbekcha)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
              />
            </div>

            {/* Vocabulary Table / Card List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVocabulary.map((word) => (
                <div
                  key={word.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-black text-white">{word.word_en}</h4>
                        <button
                          onClick={() => playWordAudio(word.word_en)}
                          className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                          title="Talaffuzni tinglash"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {word.phonetic}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-cyan-300">
                        {word.translation_uz}
                      </p>
                    </div>

                    {/* Status Badge */}
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

                  {/* Collocations */}
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

                  {/* IELTS Example */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 text-xs text-slate-400 italic">
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
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    AI IELTS Coach & Writing Evaluator
                  </h2>
                  <p className="text-xs text-slate-400">
                    Matningizni rasmiy 4 ta mezon (Task, Coherence, Lexical Resource, Grammar) bo&apos;yicha real-vaqtda tahlil qiling
                  </p>
                </div>
              </div>

              {/* Prompt Topic */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] font-bold text-cyan-400 uppercase">
                  Writing Task 2 Mashqi:
                </span>
                <p className="text-sm font-semibold text-slate-200">
                  &ldquo;Discuss the impact of technology on modern education. Provide reasons and examples.&rdquo;
                </p>
              </div>

              {/* Textarea */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Sizning javob matningiz:
                </label>
                <textarea
                  rows={4}
                  value={coachInput}
                  onChange={(e) => setCoachInput(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-sm text-white outline-none leading-relaxed"
                />
              </div>

              {/* Action Button */}
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

            {/* Coach Feedback display (Matching PDF Page 5 & 7 laptop screenshot) */}
            {coachFeedback && (
              <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/30 space-y-5 animate-in fade-in">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full border-4 border-purple-400 flex flex-col items-center justify-center bg-purple-950/40">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Estimated</span>
                      <span className="text-2xl font-black text-white">
                        {coachFeedback.evaluated_band}
                      </span>
                      <span className="text-[9px] text-purple-300 font-bold">Overall Band</span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        AI Agent Feedback & Scoring
                      </h4>
                      <p className="text-xs text-slate-400">
                        {coachFeedback.feedback_uz}
                      </p>
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

                {/* C1 Upgrade Recommendation */}
                {coachFeedback.c1_upgrade && (
                  <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs space-y-1">
                    <span className="font-bold text-purple-300 block">
                      ✨ C1 Akademik Muqobili (Upgrade):
                    </span>
                    <p className="text-slate-200 italic">&ldquo;{coachFeedback.c1_upgrade}&rdquo;</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: ANALYTICS ================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
                <span className="text-xs text-slate-400 font-medium">Vocabulary</span>
                <p className="text-2xl font-black text-cyan-400">74%</p>
                <span className="text-[10px] text-slate-500">1,240 so&apos;z o&apos;rganildi</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
                <span className="text-xs text-slate-400 font-medium">Grammar Range</span>
                <p className="text-2xl font-black text-purple-400">{user.stats.grammar_score}%</p>
                <span className="text-[10px] text-slate-500">Complex Sentences</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
                <span className="text-xs text-slate-400 font-medium">Writing Arena</span>
                <p className="text-2xl font-black text-amber-400">{user.stats.writing_score}%</p>
                <span className="text-[10px] text-slate-500">Task 1 & Task 2</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
                <span className="text-xs text-slate-400 font-medium">Speaking Fluency</span>
                <p className="text-2xl font-black text-emerald-400">{user.stats.speaking_score}%</p>
                <span className="text-[10px] text-slate-500">30s Rapid-Fire</span>
              </div>
            </div>

            {/* Streak & Consistency */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
                  <h3 className="text-xl font-bold text-white">14 Kunlik Uzluksiz Streak!</h3>
                </div>
                <p className="text-xs text-slate-400 max-w-md">
                  Har kuni kamida 1 ta mini-o&apos;yin o&apos;ynang va yangi 5 ta so&apos;zni mustahkamlab, streakni saqlab qoling.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((day) => (
                  <div
                    key={day}
                    className="w-8 h-10 rounded-xl bg-gradient-to-t from-orange-500/20 to-orange-500/40 border border-orange-500/50 flex flex-col items-center justify-center text-[10px] font-bold text-orange-400"
                  >
                    <span>D{day}</span>
                    <span>✓</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <VocabularyModal
        isOpen={isAddWordOpen}
        onClose={() => setIsAddWordOpen(false)}
        onWordAdded={(newWord) => {
          setVocabulary((prev) => [newWord, ...prev]);
          refreshState();
        }}
      />

      {/* Game Modals */}
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
    </div>
  );
}
