'use client';

import React, { useState, useEffect } from 'react';
import { X, Link2, CheckCircle2, RotateCcw, Trophy, Zap } from 'lucide-react';
import { awardGameXP } from '@/lib/storage';
import confetti from 'canvas-confetti';

interface CollocationMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinishGame: () => void;
}

interface CollocationPair {
  id: string;
  left: string;
  leftType: 'VERB' | 'ADJECTIVE';
  right: string;
  rightType: 'NOUN';
}

const COLLOCATION_DATA: CollocationPair[] = [
  { id: '1', left: 'Mitigate', leftType: 'VERB', right: 'Risk', rightType: 'NOUN' },
  { id: '2', left: 'Pose', leftType: 'VERB', right: 'Threat', rightType: 'NOUN' },
  { id: '3', left: 'Profound', leftType: 'ADJECTIVE', right: 'Impact', rightType: 'NOUN' },
  { id: '4', left: 'Conduct', leftType: 'VERB', right: 'Research', rightType: 'NOUN' },
  { id: '5', left: 'Substantial', leftType: 'ADJECTIVE', right: 'Evidence', rightType: 'NOUN' },
  { id: '6', left: 'Facilitate', leftType: 'VERB', right: 'Growth', rightType: 'NOUN' },
];

export const CollocationMatcherModal: React.FC<CollocationMatcherModalProps> = ({
  isOpen,
  onClose,
  onFinishGame,
}) => {
  const [leftItems, setLeftItems] = useState<{ id: string; text: string; type: string }[]>([]);
  const [rightItems, setRightItems] = useState<{ id: string; text: string; type: string }[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongMatch, setWrongMatch] = useState<{ leftId: string; rightId: string } | null>(null);
  const [combo, setCombo] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const lefts = COLLOCATION_DATA.map((p) => ({ id: p.id, text: p.left, type: p.leftType })).sort(
        () => 0.5 - Math.random()
      );
      const rights = COLLOCATION_DATA.map((p) => ({ id: p.id, text: p.right, type: p.rightType })).sort(
        () => 0.5 - Math.random()
      );
      setLeftItems(lefts);
      setRightItems(rights);
      setMatchedIds([]);
      setSelectedLeft(null);
      setWrongMatch(null);
      setCombo(1);
      setScore(0);
      setTimeLeft(45);
      setIsGameOver(false);
    }
  }, [isOpen]);

  // Timer
  useEffect(() => {
    if (!isOpen || isGameOver) return;
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft, isGameOver]);

  const handleFinish = () => {
    setIsGameOver(true);
    awardGameXP(Math.round(score * 1.2), 'collocation_matcher');
    onFinishGame();
    if (score >= 150) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleLeftClick = (id: string) => {
    if (matchedIds.includes(id)) return;
    setSelectedLeft(id);
    setWrongMatch(null);
  };

  const handleRightClick = (id: string) => {
    if (!selectedLeft || matchedIds.includes(id)) return;

    if (selectedLeft === id) {
      // Correct Match!
      const newMatched = [...matchedIds, id];
      setMatchedIds(newMatched);
      setSelectedLeft(null);
      setWrongMatch(null);
      setScore((s) => s + 30 * combo);
      setCombo((c) => c + 1);

      if (newMatched.length === COLLOCATION_DATA.length) {
        setTimeout(handleFinish, 500);
      }
    } else {
      // Wrong Match
      setWrongMatch({ leftId: selectedLeft, rightId: id });
      setCombo(1);
      setTimeout(() => {
        setWrongMatch(null);
        setSelectedLeft(null);
      }, 600);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0f172a] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl shadow-cyan-500/20">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                IELTS KOLLOKATSIYA MATCHER
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300">
                  Collocation Linker
                </span>
              </h2>
              <p className="text-xs text-slate-400">Tabiiy so&apos;z birikmalarini (Verb + Noun, Adj + Noun) bog&apos;lash</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 font-mono font-bold text-xs">
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

        {!isGameOver ? (
          <div className="py-6 space-y-6">
            {/* Top Bar Stats */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                {combo > 1 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 font-bold">
                    🔥 {combo}x Combo!
                  </span>
                )}
                <span>Topildi: <strong className="text-white">{matchedIds.length} / {COLLOCATION_DATA.length}</strong></span>
              </div>
              <span>Ball: <strong className="text-cyan-400 font-mono text-sm">{score}</strong></span>
            </div>

            {/* Matcher Columns (Matching PDF Page 5 screenshot) */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column (Verbs / Adjectives) */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block text-center">
                  FE&apos;LLAR & SIFATLAR
                </span>
                {leftItems.map((item) => {
                  const isMatched = matchedIds.includes(item.id);
                  const isSelected = selectedLeft === item.id;
                  const isWrong = wrongMatch?.leftId === item.id;

                  return (
                    <button
                      key={item.id}
                      disabled={isMatched}
                      onClick={() => handleLeftClick(item.id)}
                      className={`w-full p-3.5 rounded-2xl border text-sm font-bold flex items-center justify-between transition-all active:scale-98 ${
                        isMatched
                          ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400 opacity-60 cursor-default'
                          : isWrong
                          ? 'border-red-500 bg-red-950/40 text-red-300 animate-shake'
                          : isSelected
                          ? 'border-cyan-400 bg-cyan-950/50 text-white shadow-lg shadow-cyan-500/20'
                          : 'border-slate-800 bg-slate-900 hover:border-slate-700 text-slate-200'
                      }`}
                    >
                      <span>{item.text}</span>
                      <span className="text-[10px] font-normal text-slate-500">
                        {item.type}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Column (Nouns) */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block text-center">
                  OTLAR (NOUNS)
                </span>
                {rightItems.map((item) => {
                  const isMatched = matchedIds.includes(item.id);
                  const isWrong = wrongMatch?.rightId === item.id;

                  return (
                    <button
                      key={item.id}
                      disabled={isMatched || !selectedLeft}
                      onClick={() => handleRightClick(item.id)}
                      className={`w-full p-3.5 rounded-2xl border text-sm font-bold flex items-center justify-between transition-all active:scale-98 ${
                        isMatched
                          ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400 opacity-60 cursor-default'
                          : isWrong
                          ? 'border-red-500 bg-red-950/40 text-red-300 animate-shake'
                          : selectedLeft
                          ? 'border-slate-700 bg-slate-900 hover:border-cyan-500/60 text-slate-200'
                          : 'border-slate-800 bg-slate-900/60 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span>{item.text}</span>
                      <span className="text-[10px] font-normal text-slate-500">
                        {item.type}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Game Over */
          <div className="py-10 text-center flex flex-col items-center">
            <Trophy className="w-14 h-14 text-cyan-400 mb-3 animate-bounce" />
            <h3 className="text-2xl font-black text-white mb-1">Ajoyib natija!</h3>
            <p className="text-xs text-slate-400 mb-6">
              Siz kollokatsiyalarni tez va tabiiy bog&apos;lash ko&apos;nikmangizni mustahkamlandingiz.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsGameOver(false);
                  setMatchedIds([]);
                  setSelectedLeft(null);
                  setScore(0);
                  setTimeLeft(45);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Qayta o&apos;ynash</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                Arena ga qaytish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
