'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Volume2, ArrowRight, RotateCcw, Trophy, CheckCircle, AlertCircle } from 'lucide-react';
import { VocabularyWord } from '@/types';
import { recordWordReview, awardGameXP } from '@/lib/storage';
import confetti from 'canvas-confetti';

interface SpeedSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  words: VocabularyWord[];
  onFinishGame: () => void;
}

export const SpeedSprintModal: React.FC<SpeedSprintModalProps> = ({
  isOpen,
  onClose,
  words,
  onFinishGame,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [combo, setCombo] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [reviewedWordsCount, setReviewedWordsCount] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Playable words pool (shuffled)
  const [gameWords, setGameWords] = useState<VocabularyWord[]>([]);

  useEffect(() => {
    if (isOpen) {
      const shuffled = [...words].sort(() => 0.5 - Math.random());
      setGameWords(shuffled.length > 0 ? shuffled : words);
      setCurrentIndex(0);
      setUserInput('');
      setTimeLeft(60);
      setCombo(1);
      setMaxCombo(1);
      setScore(0);
      setIsGameOver(false);
      setFeedbackState('idle');
      setReviewedWordsCount(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, words]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || isGameOver) return;
    if (timeLeft <= 0) {
      handleGameOver();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft, isGameOver]);

  const currentWord = gameWords[currentIndex];

  const handleGameOver = () => {
    setIsGameOver(true);
    const xpEarned = Math.round(score * 1.5 + combo * 10);
    awardGameXP(xpEarned, 'speed_sprint');
    onFinishGame();
    if (score > 100) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const playPronunciation = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCheckAnswer = (val?: string) => {
    const answer = (val !== undefined ? val : userInput).trim().toLowerCase();
    if (!currentWord || !answer) return;

    const expected = currentWord.word_en.trim().toLowerCase();

    if (answer === expected) {
      // Correct!
      setFeedbackState('correct');
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      const points = 10 * (newCombo >= 4 ? 4 : newCombo >= 2 ? 2 : 1);
      setScore((s) => s + points);
      setReviewedWordsCount((c) => c + 1);

      // SM-2: perfect recall (quality 5)
      recordWordReview(currentWord.id, 5);
      playPronunciation(currentWord.word_en);

      setTimeout(() => {
        setUserInput('');
        setFeedbackState('idle');
        if (currentIndex + 1 < gameWords.length) {
          setCurrentIndex((idx) => idx + 1);
        } else {
          // loop words
          setCurrentIndex(0);
        }
      }, 350);
    } else {
      // Wrong
      setFeedbackState('wrong');
      setCombo(1);
      // SM-2: wrong answer (quality 1)
      recordWordReview(currentWord.id, 1);

      setTimeout(() => {
        setFeedbackState('idle');
      }, 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCheckAnswer();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0f172a] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl shadow-cyan-500/20 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Zap className="w-5 h-5 fill-cyan-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide text-white flex items-center gap-2">
                TARJIMA-SPRINT
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300">
                  Speed Match & Spelling
                </span>
              </h2>
              <p className="text-xs text-slate-400">10 soniya / so&apos;z • Harflar xatosini bartaraf etish</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Combo Badge */}
            {combo > 1 && (
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-xs animate-bounce shadow-lg shadow-orange-500/30">
                x{combo >= 8 ? 8 : combo >= 4 ? 4 : 2} COMBO! 🔥
              </div>
            )}

            {/* Timer */}
            <div className={`px-3 py-1.5 rounded-xl border font-mono font-bold text-sm ${
              timeLeft <= 10
                ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse'
                : 'bg-slate-900 border-slate-700 text-cyan-400'
            }`}>
              ⏱ {timeLeft}s
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Game State or Game Over */}
        {!isGameOver ? (
          <div className="py-6 flex flex-col items-center">
            {/* Top Score & Progress indicator */}
            <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-4 px-1">
              <span>Takrorlangan so&apos;zlar: <strong className="text-white">{reviewedWordsCount}</strong></span>
              <span>Ball: <strong className="text-cyan-400 text-sm font-mono">{score}</strong></span>
            </div>

            {/* Uzbek Word Card */}
            {currentWord && (
              <div className="w-full max-w-lg rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 text-center relative shadow-inner mb-6">
                <span className="text-[11px] uppercase tracking-widest text-cyan-400 font-semibold mb-1 block">
                  {currentWord.part_of_speech} • {currentWord.academic_level} • {currentWord.topic_tag}
                </span>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                  &ldquo;{currentWord.translation_uz}&rdquo;
                </h3>

                <p className="text-xs text-slate-400 max-w-md mx-auto line-clamp-2 italic">
                  IELTS misoli: &ldquo;{currentWord.example_sentence}&rdquo;
                </p>

                {currentWord.phonetic && (
                  <button
                    onClick={() => playPronunciation(currentWord.word_en)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{currentWord.phonetic} (Tinglash)</span>
                  </button>
                )}
              </div>
            )}

            {/* Input area */}
            <div className="w-full max-w-lg space-y-4">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  autoFocus
                  spellCheck={false}
                  placeholder="Inglizchasini to'liq yozing..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`w-full px-5 py-4 text-center text-lg sm:text-xl font-bold tracking-wide rounded-2xl bg-slate-900 border-2 transition-all outline-none ${
                    feedbackState === 'correct'
                      ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
                      : feedbackState === 'wrong'
                      ? 'border-red-500 bg-red-950/20 text-red-300 animate-shake'
                      : 'border-cyan-500/40 focus:border-cyan-400 text-white'
                  }`}
                />

                {feedbackState === 'correct' && (
                  <div className="absolute right-4 top-4 text-emerald-400 animate-in zoom-in">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                )}
                {feedbackState === 'wrong' && (
                  <div className="absolute right-4 top-4 text-red-400 animate-in zoom-in">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                )}
              </div>

              {/* Letter Tiles (Quick Helper) */}
              {currentWord && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-2">
                  {currentWord.word_en
                    .toLowerCase()
                    .split('')
                    .sort(() => 0.4 - Math.random())
                    .map((char, idx) => (
                      <button
                        key={`${char}-${idx}`}
                        type="button"
                        onClick={() => {
                          const nextVal = userInput + char;
                          setUserInput(nextVal);
                          if (nextVal.length === currentWord.word_en.length) {
                            handleCheckAnswer(nextVal);
                          }
                        }}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 border border-slate-700 text-sm font-bold text-slate-200 transition-all active:scale-90"
                      >
                        {char}
                      </button>
                    ))}
                  <button
                    type="button"
                    onClick={() => setUserInput('')}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-400 transition-colors"
                  >
                    Tozalash
                  </button>
                </div>
              )}

              {/* Submit button */}
              <button
                type="button"
                onClick={() => handleCheckAnswer()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-98 transition-all"
              >
                <span>Tekshirish (Enter)</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        ) : (
          /* Game Over Screen */
          <div className="py-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-white mb-1">Sprint Yakunlandi!</h3>
            <p className="text-xs text-slate-400 mb-6">
              IELTS Spelling va Leksika mashg&apos;uloti muvaffaqiyatli topshirildi
            </p>

            <div className="grid grid-cols-3 gap-3 w-full max-w-md mb-8">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Ball</span>
                <p className="text-xl font-black text-cyan-400">{score}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Max Combo</span>
                <p className="text-xl font-black text-amber-400">x{maxCombo}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">XP Mukofoti</span>
                <p className="text-xl font-black text-emerald-400">+{Math.round(score * 1.5 + combo * 10)} XP</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsGameOver(false);
                  setTimeLeft(60);
                  setScore(0);
                  setCombo(1);
                  setCurrentIndex(0);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Yana o&apos;ynash</span>
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black tracking-wide transition-all shadow-md shadow-cyan-500/20"
              >
                Tugatish va Arena ga qaytish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
