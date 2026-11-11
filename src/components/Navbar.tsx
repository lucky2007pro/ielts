'use client';

import React from 'react';
import { UserProfile } from '@/types';
import { Flame, Sparkles, Target, Plus, Menu, LogIn, Search } from 'lucide-react';

interface NavbarProps {
  user: UserProfile;
  isAuthenticated: boolean;
  onOpenAddWord: () => void;
  onOpenAuth: () => void;
  onToggleMobileMenu: () => void;
  quickSearch: string;
  onQuickSearchChange: (val: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  isAuthenticated,
  onOpenAddWord,
  onOpenAuth,
  onToggleMobileMenu,
  quickSearch,
  onQuickSearchChange,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full h-16 border-b border-slate-800/80 bg-[#0b0f19]/85 backdrop-blur-xl">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Left: Mobile Drawer Button + Search */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Menyu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative hidden sm:block w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => onQuickSearchChange(e.target.value)}
              placeholder="So'z yoki o'yin qidirish..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cyan-500/60 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Right: Stats + Actions + Account */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Level */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-indigo-300">
            <span className="w-5 h-5 rounded-md bg-indigo-600 text-white text-[10px] flex items-center justify-center">
              {user.level}
            </span>
            <span>Level</span>
          </div>

          {/* Target Band */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/20 text-cyan-300 text-xs font-bold">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Band {user.target_ielts_band}</span>
          </div>

          {/* XP */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/25 text-amber-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{user.xp_points} XP</span>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/15 to-red-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span>{user.streak_days}d</span>
          </div>

          {/* Add Word */}
          <button
            onClick={onOpenAddWord}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-cyan-500/15 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">So&apos;z qo&apos;shish</span>
          </button>

          {/* Account / Google Login Trigger */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-all"
            title={isAuthenticated ? `${user.name} (${user.email})` : 'Kirish / Google Login'}
          >
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-7 h-7 rounded-lg object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-[11px] font-black text-slate-950">
                {isAuthenticated ? user.name.slice(0, 2).toUpperCase() : <LogIn className="w-3.5 h-3.5" />}
              </div>
            )}
            <span className="hidden sm:inline text-xs font-semibold text-slate-200 max-w-[100px] truncate">
              {isAuthenticated ? user.name : 'Kirish'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
