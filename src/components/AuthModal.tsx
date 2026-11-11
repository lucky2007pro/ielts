'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  LogOut,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  isAuthenticated: boolean;
  googleEnabled: boolean;
  authError?: string | null;
  onAuthSuccess: (sessionUser: any) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  isAuthenticated,
  googleEnabled,
  authError,
  onAuthSuccess,
  onLogout,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState(user.name || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentLevel, setCurrentLevel] = useState<'A2' | 'B1' | 'B2' | 'C1'>(user.current_level || 'B1');
  const [targetBand, setTargetBand] = useState<number>(user.target_ielts_band || 7.5);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFullName(user.name || '');
      setCurrentLevel(user.current_level || 'B1');
      setTargetBand(user.target_ielts_band || 7.5);
      setErrorMsg(
        authError === 'google_not_configured'
          ? "Google OAuth hali sozlanmagan: serverga GOOGLE_CLIENT_ID va GOOGLE_CLIENT_SECRET ni kiriting."
          : authError
          ? `Google kirishda xatolik: ${authError}`
          : null
      );
      setSavedNotice(false);
    }
  }, [isOpen, user, authError]);

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleSubmitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode,
          full_name: fullName,
          email,
          password,
          current_level: currentLevel,
          target_ielts_band: targetBand,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Kirishda xatolik yuz berdi.');
        return;
      }
      onAuthSuccess(data.user);
      onClose();
    } catch {
      setErrorMsg("Tarmoq xatosi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          email: user.email,
          full_name: fullName,
          current_level: currentLevel,
          target_ielts_band: targetBand,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Yangilashda xatolik.');
        return;
      }
      onAuthSuccess(data.user);
      setSavedNotice(true);
      setTimeout(() => {
        setSavedNotice(false);
        onClose();
      }, 900);
    } catch {
      setErrorMsg("Server bilan bog'lanib bo'lmadi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl bg-white/95 dark:bg-[#0D1321]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.1] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_24px_60px_rgba(0,0,0,0.18)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_24px_60px_rgba(0,0,0,0.6)] p-6 sm:p-7 transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          aria-label="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {isAuthenticated ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3.5">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-teal-500/40 dark:ring-cyan-400/40"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-xl font-black text-white">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                  {user.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                <span className="inline-flex items-center gap-1 mt-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  {user.auth_provider === 'google' ? 'Google Account ulangan' : 'Shaxsiy Akkount'}
                </span>
              </div>
            </div>

            {savedNotice ? (
              <div className="py-8 text-center flex flex-col items-center gap-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">Profil sozlamalari saqlandi!</p>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ism va Familiya
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500 dark:focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Joriy Daraja
                    </label>
                    <select
                      value={currentLevel}
                      onChange={(e) => setCurrentLevel(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-black/[0.08] dark:border-white/[0.1] text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500 dark:focus:border-cyan-400"
                    >
                      <option value="A2">A2 Elementary</option>
                      <option value="B1">B1 Intermediate</option>
                      <option value="B2">B2 Upper-Int</option>
                      <option value="C1">C1 Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Maqsad (Band)
                    </label>
                    <select
                      value={targetBand}
                      onChange={(e) => setTargetBand(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-black/[0.08] dark:border-white/[0.1] text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500 dark:focus:border-cyan-400"
                    >
                      {[6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((b) => (
                        <option key={b} value={b}>
                          Band {b.toFixed(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl p-2.5">
                    {errorMsg}
                  </p>
                )}

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-600 dark:text-red-400 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Chiqish</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-cyan-400 dark:to-teal-400 text-white dark:text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Saqlash</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-teal-500 via-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                LexiAI IELTS Akkount
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Natijalaringiz, XP va SM-2 lug&apos;atingizni saqlash uchun tizimga kiring
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 rounded-2xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-sm flex items-center justify-center gap-3 shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Google orqali kirish</span>
            </button>

            {!googleEnabled && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                <span>
                  Google tugmasi ishlashi uchun Render / <code>.env</code> ga{' '}
                  <code>GOOGLE_CLIENT_ID</code> va <code>GOOGLE_CLIENT_SECRET</code> qo&apos;shing. Hozircha email bilan ham kirishingiz mumkin.
                </span>
              </div>
            )}

            <div className="relative flex items-center justify-center">
              <div className="border-t border-black/[0.08] dark:border-white/[0.08] w-full" />
              <span className="bg-white dark:bg-[#0D1321] px-3 text-[11px] uppercase text-slate-400 font-semibold">
                yoki
              </span>
              <div className="border-t border-black/[0.08] dark:border-white/[0.08] w-full" />
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-xs font-bold">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`py-2 rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Kirish
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`py-2 rounded-lg transition-all ${
                  mode === 'register'
                    ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Ro&apos;yxatdan o&apos;tish
              </button>
            </div>

            <form onSubmit={handleSubmitAuth} className="space-y-3">
              {mode === 'register' && (
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ismingiz"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500 dark:focus:border-cyan-400"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="Email manzilingiz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500 dark:focus:border-cyan-400"
                />
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={4}
                  placeholder="Parol (kamida 4 belgi)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500 dark:focus:border-cyan-400"
                />
              </div>

              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-2.5">
                  <select
                    value={currentLevel}
                    onChange={(e) => setCurrentLevel(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-black/[0.08] dark:border-white/[0.1] text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="A2">Daraja: A2</option>
                    <option value="B1">Daraja: B1</option>
                    <option value="B2">Daraja: B2</option>
                    <option value="C1">Daraja: C1</option>
                  </select>
                  <select
                    value={targetBand}
                    onChange={(e) => setTargetBand(Number(e.target.value))}
                    className="px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-black/[0.08] dark:border-white/[0.1] text-xs text-slate-900 dark:text-white outline-none"
                  >
                    {[6.5, 7.0, 7.5, 8.0, 8.5].map((b) => (
                      <option key={b} value={b}>
                        Maqsad: Band {b.toFixed(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {errorMsg && (
                <p className="text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl p-2.5">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-cyan-400 dark:to-teal-400 text-white dark:text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{mode === 'login' ? 'Tizimga Kirish' : "Akkount Yaratish"}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
