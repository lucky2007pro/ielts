'use client';

import React from 'react';
import { UserProfile } from '@/types';
import { Flame, Trophy, Sparkles, Target, BookOpen, Gamepad2, Brain, BarChart3, Plus } from 'lucide-react';

interface NavbarProps {
  user: UserProfile;
  activeTab: 'arena' | 'vocabulary' | 'coach' | 'analytics';
  setActiveTab: (tab: 'arena' | 'vocabulary' | 'coach' | 'analytics') => void;
  onOpenAddWord: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAddWord,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0b0f19]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-cyan-500/20">
              L
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                LexiAI IELTS
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/50 text-cyan-300 font-medium">
                Band 7.5+ AI Arena
              </span>
            </div>
          </div>

          {/* Gamified Stats Header */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Level & User info */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
                Lv.{user.level}
              </div>
              <div className="hidden md:block text-left text-xs">
                <p className="font-semibold text-slate-200">{user.name}</p>
                <p className="text-[10px] text-cyan-400 flex items-center gap-1">
                  <Target className="w-3 h-3" /> Target: Band {user.target_ielts_band}
                </p>
              </div>
            </div>

            {/* XP Points */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/20 text-amber-400 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{user.xp_points.toLocaleString()} XP</span>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
              <span>{user.streak_days} DAYS STREAK</span>
            </div>

            {/* Add Word Quick Action */}
            <button
              onClick={onOpenAddWord}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">So&apos;z qo&apos;shish</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-slate-850 pt-2 pb-2 overflow-x-auto text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('arena')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'arena'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            Game Center & Arena
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-cyan-900/60 text-cyan-300">
              10 Games
            </span>
          </button>

          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'vocabulary'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            My Vocabulary Bank
          </button>

          <button
            onClick={() => setActiveTab('coach')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'coach'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Brain className="w-4 h-4" />
            AI IELTS Coach
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300">
              Live AI
            </span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'analytics'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics & Progress
          </button>
        </div>
      </div>
    </header>
  );
};
