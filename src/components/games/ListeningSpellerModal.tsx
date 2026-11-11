'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Headphones,
  Volume2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Eye,
} from 'lucide-react';
import { VocabularyWord } from '@/types';
import { awardGameXP, recordWordReview, updateSkillScore } from '@/lib/storage';
import confetti from 'canvas-confetti';

interface DictationItem {
  id?: string;
  word: string;
  meaning_uz: string;
  phonetic?: string;
}

const IELTS_TRICKY_WORDS: DictationItem[] = [
  { word: 'accommodation', meaning_uz: 'turar joy (IELTS Listening klassik tuzog\'i)' },
  { word: 'questionnaire', meaning_uz: 'so\'rovnoma' },
  { word: 'environment', meaning_uz: 'atrof-muhit' },
  { word: 'millennium', meaning_uz: 'ming yillik' },
  { word: 'parliament', meaning_uz: 'parlament' },
];

interface ListeningSpellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  words: VocabularyWord[];
  onFinishGame: () => void;
}

export const ListeningSpellerModal: React.FC<ListeningSpellerModalProps> = ({
  isOpen,
  onClose,
  words,
  onFinishGame,
}) => {
  const [accent, setAccent] = useState<'en-GB' | 'en-US' | 'en-AU'>('en-GB');
  const [rate, setRate] = useState<0.75 | 1.0>(1.0);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const deck = useMemo<DictationItem[]>(() => {
    const fromVocab: DictationItem[] = words
      .filter((w) => !w.word_en.includes(' '))
      .slice(0, 4)
      .map((w) => ({
        id: w.id,
        word: w.word_en.toLowerCase(),
        meaning_uz: w.translation_uz,
        phonetic: w.phonetic,
      }));
    return [...fromVocab, ...IELTS_TRICKY_WORDS].slice(0, 6);
  }, [words]);

  const speakWord = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = accent;
      u.rate = rate;
      window.speechSynthesis.speak(u);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIndex(0);
      setInput('');
      setChecked(null);
      setShowHint(false);
      setScore(0);
      setCorrectCount(0);
      setIsFinished(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !isFinished && deck[index]) {
      const t = setTimeout(() => speakWord(deck[index].word), 250);
      return () => clearTimeout(t);
    }
  }, [isOpen, index, isFinished, accent, rate]);

  if (!isOpen) return null;

  const current = deck[index];

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (checked !== null || !input.trim() || !current) return;

    const right = input.trim().toLowerCase() === current.word.toLowerCase();
    setChecked(right);
    if (current.id) {
      recordWordReview(current.id, right ? 5 : 2);
    }
    if (right) {
      setScore((prev) => prev + (showHint ? 15 : 25));
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (index + 1 < deck.length) {
      setIndex((prev) => prev + 1);
      setInput('');
      setChecked(null);
      setShowHint(false);
    } else {
      const accuracy = Math.round((correctCount / deck.length) * 100);
      const xpEarned = Math.max(15, Math.round(score * 0.6));
      updateSkillScore('speaking', accuracy);
      awardGameXP(xpEarned, 'listening_speller', accuracy);
      onFinishGame();
      setIsFinished(true);
      if (accuracy >= 60) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-3xl bg-[#0d1323] border border-cyan-500/30 shadow-2xl p-6 sm:p-8 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">TINGLA VA YOZ (LISTENING)</h2>
              <p className="text-xs text-slate-400">IELTS Dictation &amp; Spelling • {index + 1}/{deck.length}</p>
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

        {!isFinished && current ? (
          <div className="py-6 space-y-5">
            {/* Accent & Speed Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {(['en-GB', 'en-US', 'en-AU'] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAccent(a)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                      accent === a
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {a === 'en-GB' ? '🇬🇧 UK' : a === 'en-US' ? '🇺🇸 US' : '🇦🇺 AU'}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                {([0.75, 1.0] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRate(r)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border ${
                      rate === r
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {r}x
                  </button>
                ))}
              </div>
            </div>

            {/* Play Audio Button */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <button
                type="button"
                onClick={() => speakWord(current.word)}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/30 active:scale-95 transition-all"
              >
                <Volume2 className="w-7 h-7" />
              </button>
              <p className="text-xs text-slate-400">Eshitish uchun bosing va so&apos;zni imlo xatosiz yozing</p>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowHint((prev) => !prev)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showHint ? current.meaning_uz : "O'zbekcha ma'nosini ko'rish"}</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCheck} className="space-y-3">
              <input
                type="text"
                autoFocus
                spellCheck={false}
                disabled={checked !== null}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Eshitgan so'zingizni yozing..."
                className={`w-full px-4 py-3.5 rounded-2xl bg-slate-900 border-2 text-center text-lg font-bold outline-none ${
                  checked === true
                    ? 'border-emerald-500 text-emerald-300'
                    : checked === false
                    ? 'border-red-500 text-red-300'
                    : 'border-slate-700 focus:border-cyan-400 text-white'
                }`}
              />

              {checked === null ? (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider"
                >
                  Tekshirish
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    {checked ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> To&apos;g&apos;ri yozdingiz!
                      </span>
                    ) : (
                      <span className="text-red-400 font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> To&apos;g&apos;ri imlo: <strong className="text-white underline">{current.word}</strong>
                      </span>
                    )}
                    <span className="text-slate-400">{current.meaning_uz}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <span>{index + 1 < deck.length ? 'Keyingi so\'z' : 'Natijani ko\'rish'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="py-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">Listening Sessiya Tugadi!</h3>
              <p className="text-xs text-slate-400 mt-1">
                {deck.length} ta so&apos;zdan {correctCount} tasini xatosiz yozdingiz
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Aniqlik</span>
                <span className="text-xl font-black text-cyan-400">
                  {Math.round((correctCount / deck.length) * 100)}%
                </span>
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
                  setInput('');
                  setChecked(null);
                  setShowHint(false);
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
