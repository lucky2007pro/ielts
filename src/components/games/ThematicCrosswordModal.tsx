'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Grid,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { awardGameXP, updateSkillScore } from '@/lib/storage';
import confetti from 'canvas-confetti';

interface CrosswordClue {
  id: string;
  number: number;
  direction: 'across' | 'down';
  answer: string;
  row: number;
  col: number;
  clue_uz: string;
}

const GRID_ROWS = 7;
const GRID_COLS = 8;

const CROSSWORD_CLUES: CrosswordClue[] = [
  {
    id: '1a',
    number: 1,
    direction: 'across',
    answer: 'MITIGATE',
    row: 0,
    col: 0,
    clue_uz: 'Xavf yoki zararni yumshatmoq, kamaytirmoq (IELTS C1 fe\'l)',
  },
  {
    id: '2d',
    number: 2,
    direction: 'down',
    answer: 'MANDATE',
    row: 0,
    col: 0,
    clue_uz: 'Rasmiy vakolat yoki majburiy davlat buyrug\'i',
  },
  {
    id: '3d',
    number: 3,
    direction: 'down',
    answer: 'GENUINE',
    row: 0,
    col: 4,
    clue_uz: 'Haqiqiy, soxta bo\'lmagan, chinakam ("real" sinonimi)',
  },
  {
    id: '4a',
    number: 4,
    direction: 'across',
    answer: 'AMPLIFY',
    row: 4,
    col: 0,
    clue_uz: 'Ta\'sir yoki ovozni kuchaytirmoq, kengaytirmoq',
  },
  {
    id: '5d',
    number: 5,
    direction: 'down',
    answer: 'ENHANCE',
    row: 0,
    col: 7,
    clue_uz: 'Sifatni oshirmoq, yaxshilamoq ("improve" C1 sinonimi)',
  },
  {
    id: '6a',
    number: 6,
    direction: 'across',
    answer: 'EASE',
    row: 6,
    col: 4,
    clue_uz: 'Yengillashtirmoq, bosimni pasaytirmoq (4 harf)',
  },
];

interface ThematicCrosswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinishGame: () => void;
}

export const ThematicCrosswordModal: React.FC<ThematicCrosswordModalProps> = ({
  isOpen,
  onClose,
  onFinishGame,
}) => {
  const [userGrid, setUserGrid] = useState<Record<string, string>>({});
  const [activeClueId, setActiveClueId] = useState<string>('1a');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [checkedStatus, setCheckedStatus] = useState<'idle' | 'checked'>('idle');
  const [isSolved, setIsSolved] = useState(false);

  const solutionMap = useMemo(() => {
    const map: Record<string, { char: string; number?: number; clues: string[] }> = {};
    for (const clue of CROSSWORD_CLUES) {
      for (let i = 0; i < clue.answer.length; i++) {
        const r = clue.direction === 'across' ? clue.row : clue.row + i;
        const c = clue.direction === 'across' ? clue.col + i : clue.col;
        const key = `${r}-${c}`;
        if (!map[key]) {
          map[key] = { char: clue.answer[i], clues: [clue.id] };
        } else {
          map[key].clues.push(clue.id);
        }
        if (i === 0) {
          map[key].number = clue.number;
        }
      }
    }
    return map;
  }, []);

  useEffect(() => {
    if (isOpen) {
      setUserGrid({});
      setActiveClueId('1a');
      setHintsUsed(0);
      setCheckedStatus('idle');
      setIsSolved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalCells = Object.keys(solutionMap).length;
  const correctCellsCount = Object.entries(solutionMap).filter(
    ([key, meta]) => (userGrid[key] || '').toUpperCase() === meta.char
  ).length;

  const handleCellChange = (r: number, c: number, val: string) => {
    const char = val.slice(-1).toUpperCase().replace(/[^A-Z]/g, '');
    setUserGrid((prev) => ({ ...prev, [`${r}-${c}`]: char }));
    setCheckedStatus('idle');
  };

  const handleUseHint = () => {
    const emptyOrWrong = Object.entries(solutionMap).find(
      ([key, meta]) => (userGrid[key] || '').toUpperCase() !== meta.char
    );
    if (!emptyOrWrong) return;
    const [key, meta] = emptyOrWrong;
    setUserGrid((prev) => ({ ...prev, [key]: meta.char }));
    setHintsUsed((prev) => prev + 1);
  };

  const handleCheck = () => {
    setCheckedStatus('checked');
    if (correctCellsCount === totalCells) {
      const accuracy = Math.max(40, 100 - hintsUsed * 8);
      const xpEarned = Math.max(25, 70 - hintsUsed * 5);
      updateSkillScore('writing', accuracy);
      awardGameXP(xpEarned, 'thematic_crossword', accuracy);
      onFinishGame();
      setIsSolved(true);
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-3xl rounded-3xl bg-[#0d1323] border border-cyan-500/30 shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">MAVZULI KROSSVORD</h2>
              <p className="text-xs text-slate-400">Academic Vocabulary Grid • {correctCellsCount}/{totalCells} harf to&apos;g&apos;ri</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSolved ? (
          <div className="py-5 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Crossword Grid */}
            <div className="flex flex-col items-center gap-4">
              <div
                className="grid gap-1.5 p-3 rounded-2xl bg-slate-950 border border-slate-800"
                style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: GRID_ROWS }).map((_, r) =>
                  Array.from({ length: GRID_COLS }).map((__, c) => {
                    const key = `${r}-${c}`;
                    const cell = solutionMap[key];
                    if (!cell) {
                      return <div key={key} className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-900/30" />;
                    }
                    const val = (userGrid[key] || '').toUpperCase();
                    const isHighlighted = cell.clues.includes(activeClueId);
                    const isRight = checkedStatus === 'checked' && val === cell.char;
                    const isWrong = checkedStatus === 'checked' && val !== '' && val !== cell.char;

                    return (
                      <div key={key} className="relative w-8 h-8 sm:w-9 sm:h-9">
                        {cell.number && (
                          <span className="absolute top-0.5 left-1 text-[9px] font-bold text-slate-400 pointer-events-none">
                            {cell.number}
                          </span>
                        )}
                        <input
                          type="text"
                          maxLength={1}
                          value={val}
                          onFocus={() => setActiveClueId(cell.clues[0])}
                          onChange={(e) => handleCellChange(r, c, e.target.value)}
                          className={`w-full h-full text-center font-black text-sm sm:text-base rounded-lg border outline-none uppercase transition-all ${
                            isRight
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                              : isWrong
                              ? 'bg-red-500/20 border-red-500 text-red-300'
                              : isHighlighted
                              ? 'bg-cyan-950/50 border-cyan-400 text-white'
                              : 'bg-slate-900 border-slate-700 text-white focus:border-cyan-400'
                          }`}
                        />
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full">
                <button
                  type="button"
                  onClick={handleUseHint}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Lightbulb className="w-4 h-4" />
                  1 Harf Ochish
                </button>
                <button
                  type="button"
                  onClick={handleCheck}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Tekshirish
                </button>
              </div>
            </div>

            {/* Clues List */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Izohlar va Sinonimlar
              </h3>
              {CROSSWORD_CLUES.map((clue) => {
                const active = activeClueId === clue.id;
                return (
                  <button
                    key={clue.id}
                    type="button"
                    onClick={() => setActiveClueId(clue.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      active
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-black text-cyan-400 mr-1.5">
                      {clue.number} {clue.direction === 'across' ? 'Gorizontal →' : 'Vertikal ↓'} ({clue.answer.length} harf):
                    </span>
                    <span>{clue.clue_uz}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 mx-auto">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">Krossvord To&apos;liq Yechilgan!</h3>
              <p className="text-xs text-slate-400 mt-1">
                6 ta akademik C1 so&apos;zni muvaffaqiyatli topdingiz
              </p>
            </div>
            <div className="inline-block px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-amber-400 font-black text-lg">
              +{Math.max(25, 70 - hintsUsed * 5)} XP
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setUserGrid({});
                  setHintsUsed(0);
                  setCheckedStatus('idle');
                  setIsSolved(false);
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
