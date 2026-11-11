'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Sparkles,
} from 'lucide-react';
import { awardGameXP, updateSkillScore } from '@/lib/storage';
import confetti from 'canvas-confetti';

interface ClozeQuestion {
  id: string;
  topic: string;
  rootWord: string;
  partOfSpeech: string;
  beforeBlank: string;
  afterBlank: string;
  answer: string;
  options: string[];
  explanation_uz: string;
}

const CLOZE_QUESTIONS: ClozeQuestion[] = [
  {
    id: 'sc-1',
    topic: 'Environment',
    rootWord: 'SUSTAIN',
    partOfSpeech: 'adjective',
    beforeBlank: 'Governments must invest in ',
    afterBlank: ' energy sources to curb carbon emissions.',
    answer: 'sustainable',
    options: ['sustainable', 'sustainability', 'sustained', 'sustaining'],
    explanation_uz:
      'Ot ("energy sources") oldidan sifat (adjective) kerak: "sustainable" — barqaror, ekologik jihatdan davomiy.',
  },
  {
    id: 'sc-2',
    topic: 'Technology',
    rootWord: 'UBIQUITY',
    partOfSpeech: 'adjective',
    beforeBlank: 'Smartphones have become ',
    afterBlank: ' in modern classrooms around the world.',
    answer: 'ubiquitous',
    options: ['ubiquitous', 'ubiquitously', 'ubiquity', 'ubiquitated'],
    explanation_uz:
      '"become" bog\'lovchi fe\'lidan (linking verb) keyin sifat qo\'llanadi: "ubiquitous" — hamma joyda uchraydigan.',
  },
  {
    id: 'sc-3',
    topic: 'Economics',
    rootWord: 'MITIGATE',
    partOfSpeech: 'noun',
    beforeBlank: 'Early financial intervention plays a key role in the ',
    afterBlank: ' of systemic economic risks.',
    answer: 'mitigation',
    options: ['mitigation', 'mitigating', 'mitigated', 'mitigative'],
    explanation_uz:
      '"the ... of" konstruksiyasi ichida harakat nomi/ot (noun) talab etiladi: "mitigation" — yumshatish, kamaytirish.',
  },
  {
    id: 'sc-4',
    topic: 'Education',
    rootWord: 'CRITICAL',
    partOfSpeech: 'adverb',
    beforeBlank: 'Students should evaluate online sources ',
    afterBlank: ' before citing them in academic essays.',
    answer: 'critically',
    options: ['critically', 'critical', 'criticism', 'criticize'],
    explanation_uz:
      'Fe\'lni ("evaluate") tasvirlash uchun ravish (adverb) kerak: "critically" — tanqidiy tarzda.',
  },
  {
    id: 'sc-5',
    topic: 'Urbanization',
    rootWord: 'PROLIFERATE',
    partOfSpeech: 'noun',
    beforeBlank: 'The rapid ',
    afterBlank: ' of high-rise apartments has altered city skylines.',
    answer: 'proliferation',
    options: ['proliferation', 'proliferating', 'prolific', 'proliferate'],
    explanation_uz:
      '"The rapid ... of" birikmasida sifatdan keyin ot (noun) keladi: "proliferation" — tez ko\'payish, tarqalish.',
  },
  {
    id: 'sc-6',
    topic: 'Public Health',
    rootWord: 'PREVENT',
    partOfSpeech: 'adjective',
    beforeBlank: 'Investing in ',
    afterBlank: ' healthcare reduces long-term hospital expenditure.',
    answer: 'preventative',
    options: ['preventative', 'prevention', 'preventing', 'preventably'],
    explanation_uz:
      '"healthcare" otini aniqlash uchun sifat kerak: "preventative" (yoki preventive) — oldini oluvchi.',
  },
];

interface SmartClozeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinishGame: () => void;
}

export const SmartClozeModal: React.FC<SmartClozeModalProps> = ({
  isOpen,
  onClose,
  onFinishGame,
}) => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIndex(0);
      setSelected(null);
      setIsCorrect(null);
      setScore(0);
      setCorrectCount(0);
      setIsFinished(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = CLOZE_QUESTIONS[index];

  const handleSelectOption = (opt: string) => {
    if (selected !== null) return;
    setSelected(opt);
    const right = opt.toLowerCase() === q.answer.toLowerCase();
    setIsCorrect(right);
    if (right) {
      setScore((prev) => prev + 25);
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (index + 1 < CLOZE_QUESTIONS.length) {
      setIndex((prev) => prev + 1);
      setSelected(null);
      setIsCorrect(null);
    } else {
      const accuracy = Math.round((correctCount / CLOZE_QUESTIONS.length) * 100);
      const xpEarned = Math.max(15, Math.round(score * 0.6));
      updateSkillScore('grammar', accuracy);
      awardGameXP(xpEarned, 'smart_cloze', accuracy);
      onFinishGame();
      setIsFinished(true);
      if (accuracy >= 60) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-3xl bg-[#0d1323] border border-cyan-500/30 shadow-2xl p-6 sm:p-8 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">SMART CLOZE</h2>
              <p className="text-xs text-slate-400">Reading &amp; Word Formation • Savol {index + 1}/{CLOZE_QUESTIONS.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
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
              <span className="px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold">
                Mavzu: {q.topic}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold">
                O&apos;zak so&apos;z: {q.rootWord} ({q.partOfSpeech})
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-base sm:text-lg leading-relaxed text-slate-100">
              {q.beforeBlank}
              <span
                className={`inline-block min-w-[120px] px-3 py-0.5 mx-1 rounded-lg border-b-2 text-center font-bold ${
                  selected === null
                    ? 'bg-slate-800 border-cyan-500/60 text-cyan-300'
                    : isCorrect
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-red-500/20 border-red-400 text-red-300'
                }`}
              >
                {selected ?? '________'}
              </span>
              {q.afterBlank}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map((opt) => {
                const isRightOption = opt === q.answer;
                const isPicked = selected === opt;
                let style = 'bg-slate-900 border-slate-700 hover:border-cyan-400 text-slate-200';
                if (selected !== null) {
                  if (isRightOption) {
                    style = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                  } else if (isPicked) {
                    style = 'bg-red-500/20 border-red-500 text-red-300';
                  } else {
                    style = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60';
                  }
                }
                return (
                  <button
                    key={opt}
                    disabled={selected !== null}
                    onClick={() => handleSelectOption(opt)}
                    className={`p-3.5 rounded-2xl border text-sm font-semibold text-left transition-all flex items-center justify-between ${style}`}
                  >
                    <span>{opt}</span>
                    {selected !== null && isRightOption && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {selected !== null && isPicked && !isRightOption && <AlertCircle className="w-4 h-4 text-red-400" />}
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-start gap-2 text-xs text-slate-300">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p>{q.explanation_uz}</p>
                </div>
                <button
                  onClick={handleNext}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>{index + 1 < CLOZE_QUESTIONS.length ? 'Keyingi savol' : 'Natijani ko\'rish'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mx-auto">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">Ajoyib mashq!</h3>
              <p className="text-xs text-slate-400 mt-1">
                {CLOZE_QUESTIONS.length} ta savoldan {correctCount} tasini to&apos;g&apos;ri topdingiz
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Aniqlik</span>
                <span className="text-xl font-black text-cyan-400">
                  {Math.round((correctCount / CLOZE_QUESTIONS.length) * 100)}%
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Yutilgan XP</span>
                <span className="text-xl font-black text-amber-400">
                  +{Math.max(15, Math.round(score * 0.6))} XP
                </span>
              </div>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setIndex(0);
                  setSelected(null);
                  setIsCorrect(null);
                  setScore(0);
                  setCorrectCount(0);
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
