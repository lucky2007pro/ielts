'use client';

import React, { useState, useEffect } from 'react';
import { X, Layers, CheckCircle, RotateCcw, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { awardGameXP } from '@/lib/storage';
import confetti from 'canvas-confetti';

interface SentenceBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinishGame: () => void;
}

interface GrammarChallenge {
  id: string;
  type: 'Conditional 3' | 'Inversion' | 'Passive Academic' | 'Relative Clause';
  meaning_uz: string;
  target_sentence: string[];
  explanation: string;
}

const CHALLENGES: GrammarChallenge[] = [
  {
    id: 'g-1',
    type: 'Conditional 3',
    meaning_uz: "Agar ular erta investitsiya qilganlarida edi, yaxshiroq natijalarga erishgan bo'lar edilar.",
    target_sentence: ['If', 'they', 'had invested', 'earlier,', 'they', 'would have', 'achieved', 'better', 'results.'],
    explanation: "3-toifa shart mayli (Third Conditional) o'tmishdagi gipotetik holatlarni IELTS insholarida tahlil qilish uchun ishlatiladi.",
  },
  {
    id: 'g-2',
    type: 'Inversion',
    meaning_uz: "Men hech qachon bunday jiddiy ekologik oqibatlarni ko'rmaganman.",
    target_sentence: ['Seldom', 'have', 'I seen', 'such', 'severe', 'environmental', 'consequences.'],
    explanation: "Inversion (Inkor ravishlar oldinga chiqishi) IELTS Band 8.0+ uchun murakkab sintaksis belgisi hisoblanadi.",
  },
  {
    id: 'g-3',
    type: 'Passive Academic',
    meaning_uz: "Qayta tiklanadigan energiya manbalaridan foydalanish olimlar tomonidan keng targ'ib qilinmoqda.",
    target_sentence: ['The utilization', 'of renewable', 'energy sources', 'is being', 'widely advocated', 'by prominent', 'scientists.'],
    explanation: "Passive Voice inshoda xolis akademik ohang yaratish uchun zarur.",
  },
];

export const SentenceBuilderModal: React.FC<SentenceBuilderModalProps> = ({
  isOpen,
  onClose,
  onFinishGame,
}) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const [availableBlocks, setAvailableBlocks] = useState<string[]>([]);
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentChallenge = CHALLENGES[levelIndex];

  useEffect(() => {
    if (isOpen && currentChallenge) {
      // Scramble blocks
      const scrambled = [...currentChallenge.target_sentence].sort(() => 0.5 - Math.random());
      setAvailableBlocks(scrambled);
      setSelectedBlocks([]);
      setIsCorrect(null);
    }
  }, [isOpen, levelIndex, currentChallenge]);

  const handleSelectBlock = (word: string, index: number) => {
    setSelectedBlocks((prev) => [...prev, word]);
    setAvailableBlocks((prev) => prev.filter((_, i) => i !== index));
    setIsCorrect(null);
  };

  const handleRemoveBlock = (word: string, index: number) => {
    setAvailableBlocks((prev) => [...prev, word]);
    setSelectedBlocks((prev) => prev.filter((_, i) => i !== index));
    setIsCorrect(null);
  };

  const handleCheck = () => {
    if (!currentChallenge) return;
    const isMatched =
      selectedBlocks.join(' ') === currentChallenge.target_sentence.join(' ');

    if (isMatched) {
      setIsCorrect(true);
      setScore((s) => s + 50);
      awardGameXP(35, 'sentence_builder');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } else {
      setIsCorrect(false);
    }
  };

  const handleNext = () => {
    if (levelIndex + 1 < CHALLENGES.length) {
      setLevelIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      onFinishGame();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0f172a] border border-purple-500/40 p-6 sm:p-8 shadow-2xl shadow-purple-500/20">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                GRAMMATIKA KONSTRUKTORI
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 border border-purple-700 text-purple-300">
                  Sentence Builder & Syntax
                </span>
              </h2>
              <p className="text-xs text-slate-400">Inversion • Conditionals • Passive (Band 7.0+)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isCompleted ? (
          <div className="py-6 space-y-6">
            {/* Level indicator */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-purple-400">
                Bosqich {levelIndex + 1} / {CHALLENGES.length}: {currentChallenge.type}
              </span>
              <span>Ball: <strong className="text-white font-mono">{score}</strong></span>
            </div>

            {/* Meaning card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] font-semibold tracking-wider text-purple-400 uppercase">
                O&apos;zbekcha ma&apos;nosi
              </span>
              <p className="text-base sm:text-lg font-bold text-slate-100 mt-1">
                &ldquo;{currentChallenge.meaning_uz}&rdquo;
              </p>
            </div>

            {/* Drop / Selected Zone */}
            <div className="min-h-[90px] p-4 rounded-2xl bg-slate-950 border-2 border-dashed border-purple-500/30 flex flex-wrap items-center gap-2 transition-all">
              {selectedBlocks.length === 0 ? (
                <span className="text-xs text-slate-500 italic mx-auto">
                  Pastdagi so&apos;z bo&apos;laklarini bosib to&apos;g&apos;ri grammatik ketma-ketlikda tering...
                </span>
              ) : (
                selectedBlocks.map((block, i) => (
                  <button
                    key={`${block}-${i}`}
                    onClick={() => handleRemoveBlock(block, i)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95"
                  >
                    {block}
                  </button>
                ))
              )}
            </div>

            {/* Available Blocks Pool */}
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">Mavjud bloklar:</p>
              <div className="flex flex-wrap items-center gap-2 min-h-[50px]">
                {availableBlocks.map((block, i) => (
                  <button
                    key={`${block}-${i}`}
                    onClick={() => handleSelectBlock(block, i)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-all active:scale-95"
                  >
                    {block}
                  </button>
                ))}
              </div>
            </div>

            {/* Result Feedback */}
            {isCorrect === true && (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>To&apos;g&apos;ri tuzildi! (+50 Ball, +35 XP)</span>
                </div>
                <p className="text-slate-300">{currentChallenge.explanation}</p>
              </div>
            )}

            {isCorrect === false && (
              <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
                Gap sintaksisi noto&apos;g&apos;ri joylashtirildi. Bloklarni qayta tartiblang yoki tekshiring.
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedBlocks([]);
                  setAvailableBlocks([...currentChallenge.target_sentence].sort(() => 0.5 - Math.random()));
                  setIsCorrect(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Qayta boshlash</span>
              </button>

              {isCorrect === true ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20"
                >
                  <span>Keyingi gap</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={selectedBlocks.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-purple-500/20 disabled:opacity-40"
                >
                  <span>Sintaksisni Tekshirish</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Completion Screen */
          <div className="py-10 text-center flex flex-col items-center">
            <Trophy className="w-14 h-14 text-purple-400 mb-3 animate-bounce" />
            <h3 className="text-2xl font-black text-white mb-1">Barcha gaplar tuzildi!</h3>
            <p className="text-xs text-slate-400 mb-6">
              Siz Inversion va Murakkab shart mayli sintaksislarini muvaffaqiyatli o&apos;zlashtirdingiz.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
            >
              Arena ga qaytish
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
