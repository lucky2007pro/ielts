'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Gamepad2,
  Zap,
  Award,
  Volume2,
  Layers,
} from 'lucide-react';
import { DailyActivityLog, VocabularyWord } from '@/types';
import { getLocalDateKey } from '@/lib/storage';
import { GAME_MODES } from '@/data/gameModes';

const MONTH_NAMES_UZ = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr',
];

const WEEKDAYS_UZ = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];

interface DailyCalendarAnalyticsProps {
  vocabulary: VocabularyWord[];
  activityLogs: Record<string, DailyActivityLog>;
  onPlayAudio: (word: string) => void;
}

export const DailyCalendarAnalytics: React.FC<DailyCalendarAnalyticsProps> = ({
  vocabulary,
  activityLogs,
  onPlayAudio,
}) => {
  const todayKey = getLocalDateKey(new Date());
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0 - 11
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  // Group vocabulary by creation date YYYY-MM-DD
  const wordsByDate = useMemo(() => {
    const map: Record<string, VocabularyWord[]> = {};
    for (const word of vocabulary) {
      const key = getLocalDateKey(word.created_at);
      if (!key) continue;
      if (!map[key]) map[key] = [];
      map[key].push(word);
    }
    return map;
  }, [vocabulary]);

  // Build calendar cells for viewYear / viewMonth (Monday-first)
  const calendarCells = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // JS getDay(): 0=Sun..6=Sat -> Monday=0..Sunday=6
    const startOffset = (firstOfMonth.getDay() + 6) % 7;
    const cells: Array<{ dateKey: string; dayNumber: number } | null> = [];

    for (let i = 0; i < startOffset; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(viewMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      cells.push({
        dateKey: `${viewYear}-${mStr}-${dStr}`,
        dayNumber: d,
      });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToday = () => {
    const t = new Date();
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
    setSelectedDateKey(getLocalDateKey(t));
  };

  // Selected day metrics
  const selectedWords = wordsByDate[selectedDateKey] || [];
  const selectedLog = activityLogs[selectedDateKey];
  const gameEntries = selectedLog?.game_entries || [];
  const gamesCount = Math.max(selectedLog?.games_played || 0, gameEntries.length);
  const xpEarned = selectedLog?.xp_earned || 0;
  const avgScore =
    gameEntries.length > 0
      ? Math.round(gameEntries.reduce((s, g) => s + (g.score || 0), 0) / gameEntries.length)
      : 0;

  // Section breakdown for selected day's added words
  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = {
      speaking: 0,
      reading: 0,
      writing: 0,
      listening: 0,
      general: 0,
    };
    for (const w of selectedWords) {
      const sec = w.skill_section || 'general';
      counts[sec] = (counts[sec] || 0) + 1;
    }
    return counts;
  }, [selectedWords]);

  const gameTitleMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const g of GAME_MODES) m[g.id] = g.title;
    return m;
  }, []);

  return (
    <section className="glass-surface rounded-3xl p-6 space-y-6">
      {/* Header + Month Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/15 dark:bg-cyan-500/15 border border-teal-500/30 dark:border-cyan-400/30 flex items-center justify-center text-teal-600 dark:text-cyan-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              Kunlik Kalendar &amp; Natijalar Tahlili
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Istalgan kunni bosing va o&apos;sha kunda qo&apos;shilgan so&apos;zlar hamda o&apos;yin natijalarini ko&apos;ring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-full glass-pill hover:border-teal-500/40 text-slate-700 dark:text-slate-200 transition-colors"
            aria-label="Oldingi oy"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3.5 py-1.5 rounded-full glass-pill text-xs font-bold text-slate-900 dark:text-white min-w-[130px] text-center">
            {MONTH_NAMES_UZ[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-full glass-pill hover:border-teal-500/40 text-slate-700 dark:text-slate-200 transition-colors"
            aria-label="Keyingi oy"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleJumpToday}
            className="px-3 py-1.5 rounded-full bg-teal-500/15 dark:bg-cyan-500/20 text-teal-700 dark:text-cyan-300 border border-teal-500/30 text-xs font-bold hover:scale-[1.02] transition-all"
          >
            Bugun
          </button>
        </div>
      </div>

      {/* Main Split: Calendar Grid (Left) + Day Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Grid */}
        <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-100/70 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08]">
          <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
            {WEEKDAYS_UZ.map((wd) => (
              <div
                key={wd}
                className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 py-1"
              >
                {wd}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="h-14 sm:h-16 rounded-xl" />;
              }

              const dayWords = wordsByDate[cell.dateKey]?.length || 0;
              const dayLog = activityLogs[cell.dateKey];
              const dayGames = dayLog?.games_played || 0;
              const dayXp = dayLog?.xp_earned || 0;
              const hasActivity = dayWords > 0 || dayGames > 0 || dayXp > 0;
              const isSelected = selectedDateKey === cell.dateKey;
              const isToday = todayKey === cell.dateKey;

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  onClick={() => setSelectedDateKey(cell.dateKey)}
                  className={`h-14 sm:h-16 p-1.5 rounded-xl border flex flex-col justify-between items-start text-left transition-all ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-md scale-[1.03]'
                      : hasActivity
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 hover:border-teal-500/60 text-slate-900 dark:text-white'
                      : 'bg-white/70 dark:bg-white/[0.03] border-black/[0.05] dark:border-white/[0.06] hover:border-slate-400/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-full flex items-center justify-between">
                    <span className="text-xs font-mono font-bold tabular-nums">
                      {cell.dayNumber}
                    </span>
                    {isToday && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-cyan-400 dark:bg-teal-600' : 'bg-cyan-500'
                        }`}
                      />
                    )}
                  </div>

                  {hasActivity && (
                    <div className="w-full flex items-center gap-1 overflow-hidden">
                      {dayWords > 0 && (
                        <span
                          className={`text-[9px] px-1 rounded font-mono font-bold truncate ${
                            isSelected
                              ? 'bg-white/20 dark:bg-slate-900/15 text-white dark:text-slate-900'
                              : 'bg-teal-500/20 text-teal-700 dark:text-cyan-300'
                          }`}
                        >
                          +{dayWords}s
                        </span>
                      )}
                      {dayXp > 0 && (
                        <span
                          className={`text-[9px] font-mono font-bold truncate ${
                            isSelected ? 'text-amber-300 dark:text-amber-700' : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {dayXp}xp
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Breakdown Panel */}
        <div className="lg:col-span-5 p-5 rounded-2xl glass-pill space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal-700 dark:text-cyan-400">
                Tanlangan kun tahlili
              </span>
              <h4 className="text-base font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                {selectedDateKey}
              </h4>
            </div>
            {selectedDateKey === todayKey && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                Bugun
              </span>
            )}
          </div>

          {/* 4 Daily KPI Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-white/80 dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.07]">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-teal-500" /> Qo&apos;shilgan so&apos;z
              </span>
              <p className="text-lg font-mono font-black tabular-nums text-slate-900 dark:text-white mt-0.5">
                {selectedWords.length} ta
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/80 dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.07]">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Gamepad2 className="w-3 h-3 text-violet-500" /> O&apos;yinlar
              </span>
              <p className="text-lg font-mono font-black tabular-nums text-slate-900 dark:text-white mt-0.5">
                {gamesCount} ta
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/80 dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.07]">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" /> Yig&apos;ilgan XP
              </span>
              <p className="text-lg font-mono font-black tabular-nums text-amber-600 dark:text-amber-400 mt-0.5">
                +{xpEarned} XP
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/80 dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.07]">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Award className="w-3 h-3 text-emerald-500" /> O&apos;rtacha ball
              </span>
              <p className="text-lg font-mono font-black tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                {avgScore}%
              </p>
            </div>
          </div>

          {/* Words Section Breakdown */}
          {selectedWords.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-teal-500" /> Bo&apos;limlar bo&apos;yicha:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(sectionCounts)
                  .filter(([, cnt]) => cnt > 0)
                  .map(([sec, cnt]) => (
                    <span
                      key={sec}
                      className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-500/10 dark:bg-cyan-500/15 border border-teal-500/25 text-teal-700 dark:text-cyan-300 font-bold uppercase"
                    >
                      {sec}: {cnt}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* List of Words Added on Selected Date */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
              Shu kunda kiritilgan so&apos;zlar ({selectedWords.length}):
            </span>
            {selectedWords.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                Bu kunda yangi so&apos;z qo&apos;shilmagan.
              </p>
            ) : (
              selectedWords.map((w) => (
                <div
                  key={w.id}
                  className="p-2.5 rounded-xl bg-white/80 dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.07] flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {w.word_en}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300 uppercase font-bold">
                        {w.skill_section || 'general'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {w.translation_uz}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onPlayAudio(w.word_en)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 dark:hover:text-cyan-400 shrink-0"
                    aria-label="Talaffuz"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Games Played on Selected Date */}
          {gameEntries.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t border-black/[0.06] dark:border-white/[0.08]">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                O&apos;yin natijalari ({gameEntries.length}):
              </span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {gameEntries.map((ge, i) => (
                  <div
                    key={`${ge.game_id}-${i}`}
                    className="px-3 py-2 rounded-xl bg-white/70 dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between text-[11px]"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {gameTitleMap[ge.game_id] || ge.game_id}
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                      {ge.score}% • +{ge.xp_earned} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
