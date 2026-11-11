'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Swords,
  Shield,
  Sparkles,
  Loader2,
  CheckCircle2,
  Trophy,
  RotateCcw,
} from 'lucide-react';
import { VocabularyWord } from '@/types';
import { awardGameXP, updateSkillScore } from '@/lib/storage';
import confetti from 'canvas-confetti';

const BOSS_TASKS = [
  {
    id: 'boss-1',
    bossName: 'Task 2 Examiner: Climate & Urban Policy',
    prompt:
      'Many cities face severe air pollution due to private vehicles. What effective policies can governments introduce to mitigate this issue?',
  },
  {
    id: 'boss-2',
    bossName: 'Task 2 Examiner: AI & Higher Education',
    prompt:
      'Artificial intelligence tools have become ubiquitous among university students. Do the benefits of this trend outweigh its potential drawbacks?',
  },
];

interface AiBossFightModalProps {
  isOpen: boolean;
  onClose: () => void;
  words: VocabularyWord[];
  onFinishGame: () => void;
}

export const AiBossFightModal: React.FC<AiBossFightModalProps> = ({
  isOpen,
  onClose,
  words,
  onFinishGame,
}) => {
  const [taskIdx, setTaskIdx] = useState(0);
  const [bossHp, setBossHp] = useState(100);
  const [timeLeft, setTimeLeft] = useState(900);
  const [essay, setEssay] = useState('');
  const [isAttacking, setIsAttacking] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const task = BOSS_TASKS[taskIdx % BOSS_TASKS.length];

  const requiredWords = useMemo(() => {
    const picks = words.slice(0, 4).map((w) => w.word_en);
    return picks.length >= 3 ? picks : ['mitigate', 'ubiquitous', 'sustainable'];
  }, [words]);

  useEffect(() => {
    if (isOpen) {
      setBossHp(100);
      setTimeLeft(900);
      setEssay('');
      setIsAttacking(false);
      setResult(null);
    }
  }, [isOpen, taskIdx]);

  useEffect(() => {
    if (!isOpen || bossHp <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [isOpen, bossHp]);

  if (!isOpen) return null;

  const usedWords = requiredWords.filter((w) =>
    essay.toLowerCase().includes(w.toLowerCase())
  );
  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleStrikeBoss = async () => {
    if (wordCount < 15 || isAttacking) return;
    setIsAttacking(true);
    try {
      const res = await fetch('/api/evaluate-paraphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: 'ai_boss_fight',
          original_sentence: task.prompt,
          user_paraphrase: essay,
          target_word: requiredWords.join(', '),
          user_ielts_target: 8.0,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const band = data.evaluated_band || 6.5;
        const damage = band >= 7.0 ? 100 : Math.min(90, Math.round(band * 11 + usedWords.length * 8));
        const nextHp = Math.max(0, bossHp - damage);
        setBossHp(nextHp);

        const xpEarned = Math.max(40, (data.xp_awarded || 45) + usedWords.length * 15);
        const skillPct = Math.min(100, Math.round((band / 9) * 100));
        updateSkillScore('writing', skillPct);
        awardGameXP(xpEarned, 'ai_boss_fight', skillPct);
        onFinishGame();
        setResult({ ...data, xp_awarded: xpEarned, damage });

        if (nextHp === 0) {
          confetti({ particleCount: 110, spread: 80, origin: { y: 0.55 } });
        }
      }
    } finally {
      setIsAttacking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-3xl rounded-3xl bg-[#0d1222] border-2 border-purple-500/40 shadow-2xl shadow-purple-500/15 p-6 sm:p-8 text-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">AI BOSS JANGI (WRITING TASK 2)</h2>
              <p className="text-xs text-slate-400">{task.bossName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-purple-300">
              ⏱ {formatTime(timeLeft)}
            </span>
            <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Boss Health Bar */}
        <div className="my-4 p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-purple-300 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-purple-400" />
              IELTS Examiner Boss HP
            </span>
            <span className={bossHp === 0 ? 'text-emerald-400' : 'text-red-400'}>{bossHp} / 100 HP</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-500 via-purple-500 to-amber-400 transition-all duration-500"
              style={{ width: `${bossHp}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Task 2 Topshiriq</span>
            <p className="text-sm font-semibold text-white leading-relaxed">{task.prompt}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 mr-1">Majburiy so&apos;zlar (+15 XP):</span>
              {requiredWords.map((w) => {
                const used = essay.toLowerCase().includes(w.toLowerCase());
                return (
                  <span
                    key={w}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${
                      used
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    {used && <CheckCircle2 className="w-3 h-3" />}
                    {w}
                  </span>
                );
              })}
            </div>
            <span className="text-[11px] font-mono text-slate-400">{wordCount} so&apos;z</span>
          </div>

          <textarea
            rows={5}
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Kamida 15-40 so'zli akademik argument / body paragraph yozing..."
            className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 focus:border-purple-400 outline-none text-sm text-white"
          />

          <button
            type="button"
            disabled={wordCount < 15 || isAttacking}
            onClick={handleStrikeBoss}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            {isAttacking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Examiner baholamoqda...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Bossga Zarba Berish (Baholash)</span>
              </>
            )}
          </button>

          {result && (
            <div className="p-5 rounded-2xl bg-slate-900/95 border border-purple-500/40 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-black text-white">
                    {bossHp === 0 ? 'BOSS MAG\'LUB BO\'LDI!' : `${result.damage} HP zarba berildi!`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-bold">
                    Band {result.evaluated_band}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold">
                    +{result.xp_awarded} XP
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{result.feedback_uz}</p>

              {result.c1_upgrade && (
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs">
                  <span className="font-bold text-purple-300 block mb-1">✨ Band 8.0+ Namuna:</span>
                  <p className="text-slate-200 italic">&ldquo;{result.c1_upgrade}&rdquo;</p>
                </div>
              )}

              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => setTaskIdx((i) => i + 1)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Yangi Boss
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black"
                >
                  Yakunlash
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
