'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Crosshair,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Sparkles,
} from 'lucide-react';
import { awardGameXP, updateSkillScore } from '@/lib/storage';
import confetti from 'canvas-confetti';

interface ErrorChallenge {
  id: string;
  category: string;
  tokens: string[];
  errorIndex: number;
  corrections: string[];
  correctFix: string;
  explanation_uz: string;
}

const ERROR_CHALLENGES: ErrorChallenge[] = [
  {
    id: 'eh-1',
    category: 'Uncountable Nouns',
    tokens: ['The', 'report', 'provides', 'useful', 'informations', 'about', 'urban', 'pollution.'],
    errorIndex: 4,
    corrections: ['information', 'an information', 'informed'],
    correctFix: 'information',
    explanation_uz:
      '"Information" sanalmaydigan ot (uncountable noun), shuning uchun "-s" qo\'shimchasi olmaydi.',
  },
  {
    id: 'eh-2',
    category: 'Subject-Verb Agreement',
    tokens: ['The', 'number', 'of', 'online', 'courses', 'have', 'increased', 'dramatically.'],
    errorIndex: 5,
    corrections: ['has', 'are', 'were'],
    correctFix: 'has',
    explanation_uz:
      '"The number of + plural noun" iborasi birlikdagi fe\'l ("has") talab qiladi ("A number of" esa ko\'plikda keladi).',
  },
  {
    id: 'eh-3',
    category: 'Preposition Trap',
    tokens: ['In', 'my', 'essay,', 'I', 'will', 'discuss', 'about', 'climate', 'change.'],
    errorIndex: 6,
    corrections: ['(o\'chirish)', 'on', 'for'],
    correctFix: "(o'chirish)",
    explanation_uz:
      '"Discuss" fe\'li to\'g\'ridan-to\'g\'ri to\'ldiruvchi oladi; undan keyin "about" predlogi ishlatilmaydi ("discuss climate change").',
  },
  {
    id: 'eh-4',
    category: 'Academic Collocation',
    tokens: ['Governments', 'should', 'do', 'strict', 'measures', 'to', 'curb', 'inflation.'],
    errorIndex: 2,
    corrections: ['take', 'make', 'create'],
    correctFix: 'take',
    explanation_uz:
      'IELTS akademik uslubida "measures" so\'zi bilan "do" emas, "take measures" (choralar ko\'rish) kollokatsiyasi ishlatiladi.',
  },
  {
    id: 'eh-5',
    category: 'Passive & Meaning',
    tokens: ['Rising', 'fuel', 'prices', 'are', 'effecting', 'low-income', 'families', 'severely.'],
    errorIndex: 4,
    corrections: ['affecting', 'effected', 'effective'],
    correctFix: 'affecting',
    explanation_uz:
      '"Effect" odatda ot (natija/ta\'sir), fe\'l sifatida esa "affect" (ta\'sir ko\'rsatmoq) ishlatiladi.',
  },
];

interface ErrorHunterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinishGame: () => void;
}

export const ErrorHunterModal: React.FC<ErrorHunterModalProps> = ({
  isOpen,
  onClose,
  onFinishGame,
}) => {
  const [index, setIndex] = useState(0);
  const [clickedTokenIndex, setClickedTokenIndex] = useState<number | null>(null);
  const [tokenConfirmed, setTokenConfirmed] = useState(false);
  const [pickedFix, setPickedFix] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIndex(0);
      setClickedTokenIndex(null);
      setTokenConfirmed(false);
      setPickedFix(null);
      setScore(0);
      setSolvedCount(0);
      setWrongAttempts(0);
      setIsFinished(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const current = ERROR_CHALLENGES[index];

  const handleTokenClick = (idx: number) => {
    if (tokenConfirmed) return;
    setClickedTokenIndex(idx);
    if (idx === current.errorIndex) {
      setTokenConfirmed(true);
      setScore((prev) => prev + 15);
    } else {
      setWrongAttempts((prev) => prev + 1);
    }
  };

  const handlePickFix = (fix: string) => {
    if (pickedFix !== null) return;
    setPickedFix(fix);
    if (fix === current.correctFix) {
      setScore((prev) => prev + 20);
      setSolvedCount((prev) => prev + 1);
    } else {
      setWrongAttempts((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (index + 1 < ERROR_CHALLENGES.length) {
      setIndex((prev) => prev + 1);
      setClickedTokenIndex(null);
      setTokenConfirmed(false);
      setPickedFix(null);
    } else {
      const accuracy = Math.max(20, Math.round((solvedCount / ERROR_CHALLENGES.length) * 100 - wrongAttempts * 5));
      const xpEarned = Math.max(15, Math.round(score * 0.6));
      updateSkillScore('grammar', accuracy);
      awardGameXP(xpEarned, 'error_hunter', accuracy);
      onFinishGame();
      setIsFinished(true);
      if (solvedCount >= 3) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-3xl bg-[#0d1323] border border-red-500/30 shadow-2xl p-6 sm:p-8 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">XATO OVCHISI (ERROR HUNTER)</h2>
              <p className="text-xs text-slate-400">Gapdagi 1 ta xato so&apos;zni toping • {index + 1}/{ERROR_CHALLENGES.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-red-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
              Ball: {score}
            </span>
            <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isFinished ? (
          <div className="py-6 space-y-6">
            <div className="flex items-center justify-between text-xs">
              <span className="px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 font-bold">
                Kategoriya: {current.category}
              </span>
              <span className="text-slate-400">
                {!tokenConfirmed
                  ? '1-qadam: Xato so\'z ustiga bosing'
                  : '2-qadam: To\'g\'ri variantni tanlang'}
              </span>
            </div>

            {/* Interactive Tokenized Sentence */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap gap-2 items-center">
              {current.tokens.map((token, idx) => {
                const isError = idx === current.errorIndex;
                const isSelectedWrong = clickedTokenIndex === idx && !isError;
                const isSelectedRight = tokenConfirmed && isError;
                return (
                  <button
                    key={`${token}-${idx}`}
                    type="button"
                    onClick={() => handleTokenClick(idx)}
                    className={`px-3 py-1.5 rounded-xl text-base font-semibold border transition-all ${
                      isSelectedRight
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 line-through decoration-red-400'
                        : isSelectedWrong
                        ? 'bg-red-500/20 border-red-500 text-red-300'
                        : 'bg-slate-800/80 border-slate-700 hover:border-cyan-400 hover:text-cyan-300 text-white'
                    }`}
                  >
                    {token}
                  </button>
                );
              })}
            </div>

            {clickedTokenIndex !== null && !tokenConfirmed && (
              <p className="text-xs text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Bu so&apos;z to&apos;g&apos;ri. Boshqa so&apos;zni tekshirib ko&apos;ring!
              </p>
            )}

            {tokenConfirmed && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Xato topildi (&ldquo;{current.tokens[current.errorIndex]}&rdquo;)! Endi to&apos;g&apos;ri shaklini tanlang:
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {current.corrections.map((fix) => {
                    const isRight = fix === current.correctFix;
                    const isPicked = pickedFix === fix;
                    let cls = 'bg-slate-900 border-slate-700 hover:border-cyan-400 text-white';
                    if (pickedFix !== null) {
                      if (isRight) cls = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';
                      else if (isPicked) cls = 'bg-red-500/20 border-red-500 text-red-300';
                      else cls = 'bg-slate-900/40 border-slate-800 text-slate-500';
                    }
                    return (
                      <button
                        key={fix}
                        disabled={pickedFix !== null}
                        onClick={() => handlePickFix(fix)}
                        className={`py-3 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${cls}`}
                      >
                        {fix}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {pickedFix !== null && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-start gap-2 text-xs text-slate-300">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p>{current.explanation_uz}</p>
                </div>
                <button
                  onClick={handleNext}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>{index + 1 < ERROR_CHALLENGES.length ? 'Keyingi gap' : 'Natijani ko\'rish'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">Tekshiruv Yakunlandi!</h3>
              <p className="text-xs text-slate-400 mt-1">
                {ERROR_CHALLENGES.length} ta gapdan {solvedCount} tasini xatosiz tuzatdingiz
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Jami Ball</span>
                <span className="text-xl font-black text-cyan-400">{score}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Yutilgan XP</span>
                <span className="text-xl font-black text-amber-400">+{Math.max(15, Math.round(score * 0.6))} XP</span>
              </div>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setIndex(0);
                  setClickedTokenIndex(null);
                  setTokenConfirmed(false);
                  setPickedFix(null);
                  setScore(0);
                  setSolvedCount(0);
                  setWrongAttempts(0);
                  setIsFinished(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Qayta o&apos;ynash
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs"
              >
                Arenaga qaytish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
