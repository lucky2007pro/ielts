'use client';

import React, { useState } from 'react';
import { X, Award, Sparkles, Send, Loader2, ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react';
import { awardGameXP } from '@/lib/storage';
import confetti from 'canvas-confetti';

interface ParaphraseDuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinishGame: () => void;
}

const SAMPLE_CHALLENGES = [
  {
    original: "Cars make a lot of pollution in big cities.",
    target_word: "emit",
    hint_uz: "'Cars' o'rniga 'Motor vehicles / automobiles', 'make pollution' o'rniga 'emit substantial pollutants'...",
  },
  {
    original: "Many people think that learning online is very good for students.",
    target_word: "facilitate",
    hint_uz: "'facilitate learning', 'affords opportunities', 'highly advantageous'...",
  },
  {
    original: "The government should do something to reduce environmental risks.",
    target_word: "mitigate",
    hint_uz: "'mitigate adverse repercussions / hazards', 'implement decisive measures'...",
  },
];

export const ParaphraseDuelModal: React.FC<ParaphraseDuelModalProps> = ({
  isOpen,
  onClose,
  onFinishGame,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userParaphrase, setUserParaphrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  const currentChallenge = SAMPLE_CHALLENGES[currentIndex];

  if (!isOpen) return null;

  const handleEvaluate = async () => {
    if (!userParaphrase.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/evaluate-paraphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_sentence: currentChallenge.original,
          user_paraphrase: userParaphrase,
          target_word: currentChallenge.target_word,
          user_ielts_target: 7.5,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEvaluationResult(data);
        if (data.xp_awarded) {
          awardGameXP(data.xp_awarded, 'academic_paraphrase');
        }
        if (data.evaluated_band >= 7.0) {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextChallenge = () => {
    setEvaluationResult(null);
    setUserParaphrase('');
    if (currentIndex + 1 < SAMPLE_CHALLENGES.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#0f172a] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl shadow-cyan-500/20 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                AKADEMIK PARAFRAZ DUELLARI
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300">
                  Band 5 → Band 8 Duel
                </span>
              </h2>
              <p className="text-xs text-slate-400">AI Examiner jonli baholaydi va leksik tahlil beradi</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace */}
        <div className="py-6 space-y-6">
          {/* Target Word and Original sentence */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-cyan-400 uppercase tracking-wider text-[10px]">
                Original Simple Sentence (Band 5.0)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-900/60 border border-purple-700 text-purple-300 text-xs font-bold">
                Asosiy so&apos;z: &ldquo;{currentChallenge.target_word}&rdquo;
              </span>
            </div>

            <p className="text-lg font-semibold text-slate-200">
              &ldquo;{currentChallenge.original}&rdquo;
            </p>

            <p className="text-xs text-slate-500 italic pt-1">
              💡 Tavsiya: {currentChallenge.hint_uz}
            </p>
          </div>

          {/* User Paraphrase Input Area */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Sizning C1 Akademik Parafrazingiz:
            </label>
            <textarea
              rows={3}
              value={userParaphrase}
              onChange={(e) => setUserParaphrase(e.target.value)}
              placeholder="Masalan: Motor vehicles emit substantial pollutants, exacerbating air quality issues in metropolitan areas..."
              className="w-full p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 focus:border-cyan-400 text-sm text-white outline-none leading-relaxed"
            />
          </div>

          {/* Action Button */}
          {!evaluationResult && (
            <button
              onClick={handleEvaluate}
              disabled={isLoading || !userParaphrase.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-40 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>AI Agent Tahlil Qilmoqda...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>AI Examiner Ga Yuborish (Live Band Score)</span>
                </>
              )}
            </button>
          )}

          {/* Evaluation Results Card (Matching PDF Page 5 & 9) */}
          {evaluationResult && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-5 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
                {/* Band Score Circle */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full border-4 border-cyan-400 flex flex-col items-center justify-center bg-cyan-950/40 shadow-lg shadow-cyan-500/30">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Band</span>
                    <span className="text-2xl font-black text-white">
                      {evaluationResult.evaluated_band}
                    </span>
                    <span className="text-[9px] text-cyan-300 font-semibold">CEFR C1</span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      Baholash Natijasi
                    </h4>
                    <p className="text-xs text-slate-400">
                      XP mukofoti: <strong className="text-emerald-400">+{evaluationResult.xp_awarded} XP</strong>
                    </p>
                  </div>
                </div>

                {/* Sub-criteria breakdown */}
                {evaluationResult.criteria_scores && (
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Task Resp</span>
                      <strong className="text-cyan-300">
                        {evaluationResult.criteria_scores.task_achievement}
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Lexical Res</span>
                      <strong className="text-amber-300">
                        {evaluationResult.criteria_scores.lexical_resource}
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Grammar</span>
                      <strong className="text-purple-300">
                        {evaluationResult.criteria_scores.grammatical_range}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Uzbek Feedback */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs leading-relaxed space-y-1">
                <span className="font-semibold text-cyan-400 block">AI Ustoz Tushuntirishi (Uzbek):</span>
                <p className="text-slate-200">{evaluationResult.feedback_uz}</p>
              </div>

              {/* Upgrades */}
              {evaluationResult.upgrades && evaluationResult.upgrades.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-300 block mb-2">
                    Leksik Yangilanishlar (Vocabulary Upgrades):
                  </span>
                  <div className="space-y-1.5">
                    {evaluationResult.upgrades.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800/80"
                      >
                        <span className="text-slate-400 line-through">{item.original || item.basic}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-emerald-400 font-bold">{item.upgraded || item.academic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Challenge Action */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleNextChallenge}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20"
                >
                  <span>Keyingi Parafraz Challangega O&apos;tish</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
