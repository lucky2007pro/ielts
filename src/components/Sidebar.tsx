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
      badge: 'AI',
      icon: <Brain className="w-4 h-4" />,
    },
    {
      id: 'analytics',
      label: 'Leaderboard & Stats',
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
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 shrink-0 bg-[#0d1220] border-r border-slate-800/90 flex flex-col justify-between transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 via-cyan-500 to-blue-600 flex items-center justify-center font-black text-lg text-slate-950 shadow-lg shadow-cyan-500/20">
                L
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                  LexiAI <span className="text-cyan-400">IELTS</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Band 7.5+ Platform
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-3.5 space-y-1.5">
            <p className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Platforma
            </p>
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={active ? 'text-cyan-400' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    {item.label}
                  </span>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        item.badge === 'AI'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-cyan-500/20 text-cyan-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Daily Streak Mini Widget */}
          <div className="mx-3.5 mt-2 p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Kunlik Maqsad
              </span>
              <span className="text-[11px] text-emerald-400 font-bold">{computedGoalPct}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500"
                style={{ width: `${computedGoalPct}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Band {user.target_ielts_band} ga chiqish uchun kuniga 15 daqiqa mashq qiling
            </p>
          </div>
        </div>

        {/* Bottom Account Card */}
        <div className="p-3.5 border-t border-slate-800/80 space-y-2">
          <div
            onClick={onOpenAuth}
            role="button"
            tabIndex={0}
            className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all flex items-center gap-3"
          >
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-9 h-9 rounded-xl object-cover border border-cyan-500/40 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                {user.name}
                {isAuthenticated && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {isAuthenticated ? user.email : 'Mehmon rejimi (Saqlanmagan)'}
              </p>
            </div>

            <Settings className="w-4 h-4 text-slate-500 shrink-0" />
          </div>

          {!isAuthenticated && (
            <button
              onClick={onOpenAuth}
              className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
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
