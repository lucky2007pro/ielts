'use client';

import React from 'react';
import {
  LayoutDashboard,
  Gamepad2,
  BookOpen,
  Brain,
  BarChart3,
  Settings,
  LogIn,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { UserProfile } from '@/types';

export type AppTab = 'dashboard' | 'arena' | 'vocabulary' | 'coach' | 'analytics';

interface SidebarProps {
  user: UserProfile;
  isAuthenticated: boolean;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenAuth: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  dailyProgressPct?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  isAuthenticated,
  activeTab,
  setActiveTab,
  onOpenAuth,
  mobileOpen,
  setMobileOpen,
  dailyProgressPct,
}) => {
  const computedGoalPct = Math.max(
    0,
    Math.min(
      100,
      dailyProgressPct ??
        user.stats.games_played * 20 + user.stats.words_mastered * 10
    )
  );

  const navItems: Array<{
    id: AppTab;
    label: string;
    badge?: string;
    isAi?: boolean;
    icon: React.ReactNode;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'arena',
      label: 'Game Arena',
      badge: '10',
      icon: <Gamepad2 className="w-4 h-4" />,
    },
    {
      id: 'vocabulary',
      label: 'My Vocabulary',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'coach',
      label: 'AI IELTS Coach',
      isAi: true,
      icon: <Brain className="w-4 h-4" />,
    },
    {
      id: 'analytics',
      label: 'Leaderboard & Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ];

  const handleNav = (id: AppTab) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 z-50 lg:z-30 h-screen lg:h-[calc(100vh-4rem)] w-64 shrink-0 bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-xl border-r border-black/[0.06] dark:border-white/[0.08] flex flex-col justify-between transition-all duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="overflow-y-auto">
          {/* Mobile Drawer Header */}
          <div className="lg:hidden h-16 px-5 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08]">
            <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
              LexiAI IELTS
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              aria-label="Yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-3.5 space-y-1">
            <p className="px-3 pt-1.5 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Platforma
            </p>
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200 ${
                    active
                      ? 'bg-slate-200/70 dark:bg-white/10 text-slate-900 dark:text-white font-semibold border border-black/[0.06] dark:border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_10px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_12px_rgba(0,0,0,0.2)]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/[0.04] font-medium border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={
                        active
                          ? 'text-teal-600 dark:text-cyan-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </span>

                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold tabular-nums bg-teal-500/15 dark:bg-cyan-500/20 text-teal-700 dark:text-cyan-300 border border-teal-500/20 dark:border-cyan-500/30">
                      {item.badge}
                    </span>
                  )}

                  {item.isAi && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/25">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Daily Goal Mini Glass Widget */}
          <div className="mx-3.5 mt-3 p-4 rounded-2xl glass-surface space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Kunlik Maqsad
              </span>
              <span className="text-[11px] font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {computedGoalPct}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800/90 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-500"
                style={{ width: `${computedGoalPct}%` }}
              />
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Band {user.target_ielts_band} ga chiqish uchun kuniga 15 daqiqa mashq qiling
            </p>
          </div>
        </div>

        {/* Bottom Account Card */}
        <div className="p-3.5 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2">
          <div
            onClick={onOpenAuth}
            role="button"
            tabIndex={0}
            className="p-2.5 rounded-2xl glass-pill hover:border-teal-500/40 dark:hover:border-cyan-400/40 cursor-pointer transition-all flex items-center gap-3"
          >
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-9 h-9 rounded-xl object-cover ring-1 ring-black/10 dark:ring-white/20 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1">
                {user.name}
                {isAuthenticated && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {isAuthenticated ? user.email : 'Mehmon rejimi (Saqlanmagan)'}
              </p>
            </div>

            <Settings className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {!isAuthenticated && (
            <button
              onClick={onOpenAuth}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Google bilan kirish</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
