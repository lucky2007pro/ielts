'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { UserProfile } from '@/types';
import {
  Flame,
  Zap,
  Target,
  Plus,
  Menu,
  LogIn,
  Search,
  Sun,
  Moon,
  Monitor,
  Sparkles,
} from 'lucide-react';
import { useTheme, ThemePreference } from '@/components/ThemeProvider';

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
  const { theme, setTheme } = useTheme();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const themeOptions: Array<{ id: ThemePreference; label: string; icon: React.ReactNode }> = [
    { id: 'light', label: 'Yorug\'', icon: <Sun className="w-3.5 h-3.5" /> },
    { id: 'dark', label: 'Qorong\'i', icon: <Moon className="w-3.5 h-3.5" /> },
    { id: 'system', label: 'Tizim', icon: <Monitor className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/75 dark:bg-[#0B0F17]/80 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.08] shadow-[inset_0_-1px_0_rgba(255,255,255,0.5),0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_-1px_0_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.3)] transition-colors duration-300 ease-in-out">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Mobile Drawer Button + Stylized Glass Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl glass-pill text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label="Menyu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-teal-500 to-indigo-600 p-[1px] shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-[11px] bg-white/90 dark:bg-slate-950/90 backdrop-blur-md flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-cyan-400" />
              </div>
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white block">
                LexiAI{' '}
                <span className="bg-gradient-to-r from-teal-600 to-cyan-500 dark:from-cyan-400 dark:to-teal-300 bg-clip-text text-transparent">
                  IELTS
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Band {user.target_ielts_band}+ Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Floating Minimalist Search Bar with ⌘K */}
        <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-2">
          <div className="relative w-full group">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-teal-600 dark:group-focus-within:text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              value={quickSearch}
              onChange={(e) => onQuickSearchChange(e.target.value)}
              placeholder="So'z yoki o'yin qidirish..."
              className="w-full pl-10 pr-14 py-2 rounded-full bg-slate-100/80 dark:bg-white/[0.05] hover:bg-slate-200/70 dark:hover:bg-white/[0.08] focus:bg-white dark:focus:bg-slate-900/90 border border-black/[0.06] dark:border-white/[0.08] focus:border-teal-500/50 dark:focus:border-cyan-400/50 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-white/90 dark:bg-white/10 border border-black/[0.08] dark:border-white/[0.1] text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 pointer-events-none">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Gamification Chips + Add Word + Theme Toggle + Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Level Chip */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full glass-pill text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-sm shadow-indigo-500/10">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-mono font-bold tabular-nums flex items-center justify-center shadow-sm shadow-indigo-500/40">
              {user.level}
            </span>
            <span>Level</span>
          </div>

          {/* Target Band Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold tabular-nums">
            <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Band {user.target_ielts_band}</span>
          </div>

          {/* XP Counter */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full glass-pill text-amber-700 dark:text-amber-300 text-xs font-bold font-mono tabular-nums">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{user.xp_points} XP</span>
          </div>

          {/* Streak Counter */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-700 dark:text-orange-300 text-xs font-bold font-mono tabular-nums">
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span>{user.streak_days}d</span>
          </div>

          {/* Add Word Tactile Pill */}
          <button
            onClick={onOpenAddWord}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 text-white dark:text-slate-950 font-bold text-xs shadow-md shadow-teal-600/20 dark:shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">So&apos;z qo&apos;shish</span>
          </button>

          {/* Theme Toggle Segmented Control */}
          <div
            role="group"
            aria-label="Mavzuni almashtirish"
            className="flex items-center p-0.5 rounded-full glass-pill"
          >
            {themeOptions.map((opt) => {
              const active = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id)}
                  title={opt.label}
                  aria-label={opt.label}
                  className={`p-1.5 rounded-full transition-all duration-200 ${
                    active
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm scale-105'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {opt.icon}
                </button>
              );
            })}
          </div>

          {/* User Profile Trigger */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full glass-pill hover:border-teal-500/40 dark:hover:border-cyan-400/40 transition-all"
            title={isAuthenticated ? `${user.name} (${user.email})` : 'Kirish / Google Login'}
          >
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/20"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-[11px] font-bold text-white">
                {isAuthenticated ? user.name.slice(0, 2).toUpperCase() : <LogIn className="w-3.5 h-3.5" />}
              </div>
            )}
            <span className="hidden xl:inline text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[96px] truncate">
              {isAuthenticated ? user.name : 'Kirish'}
            </span>
            <span className="text-xs leading-none hidden sm:inline" aria-hidden="true">
              🇺🇿
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
