'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Mic,
  MicOff,
  Sparkles,
  Loader2,
  CheckCircle2,
  RotateCcw,
  Trophy,
  Clock,
} from 'lucide-react';
import { VocabularyWord } from '@/types';
import { awardGameXP, updateSkillScore } from '@/lib/storage';
import confetti from 'canvas-confetti';

const SPEAKING_PROMPTS = [
  {
    id: 'sp-1',
    topic: 'Technology & Education',
    question:
      'How has artificial intelligence changed the way university students learn and conduct research?',
    sampleHint:
      'Discuss personalization, rapid access to academic resources, and the risk of over-reliance.',
  },
  {
    id: 'sp-2',
    topic: 'Urbanization & Environment',
    question:
      'What measures should governments prioritize to reduce traffic congestion and pollution in big cities?',
    sampleHint:
      'Mention public transit investment, green infrastructure, and congestion charges.',
  },
  {
    id: 'sp-3',
    topic: 'Work & Lifestyle',
    question:
      'Do you think remote work improves work-life balance, or does it create new challenges for employees?',
    sampleHint:
      'Compare flexibility and saved commuting time with social isolation and burnout.',
  },
];

interface SpeakingRapidFireModalProps {
  isOpen: boolean;
  onClose: () => void;
  words: VocabularyWord[];
  onFinishGame: () => void;
}

export const SpeakingRapidFireModal: React.FC<SpeakingRapidFireModalProps> = ({
  isOpen,
  onClose,
  words,
  onFinishGame,
}) => {
  const [promptIndex, setPromptIndex] = useState(0);
  const [phase, setPhase] = useState<'prep' | 'speak' | 'result'>('prep');
  const [timer, setTimer] = useState(10);
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const recognitionRef = useRef<any>(null);

  const prompt = SPEAKING_PROMPTS[promptIndex % SPEAKING_PROMPTS.length];

  const targetWords = useMemo(() => {
    const pool = words.slice(0, 8);
    if (pool.length >= 3) return pool.slice(0, 3).map((w) => w.word_en);
    return ['mitigate', 'ubiquitous', 'sustainable'];
  }, [words]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setSpeechSupported(Boolean(SR));
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setPhase('prep');
      setTimer(10);
      setTranscript('');
      setIsRecording(false);
      setIsEvaluating(false);
      setEvaluation(null);
    }
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [isOpen, promptIndex]);

  useEffect(() => {
    if (!isOpen || phase === 'result') return;
    if (timer <= 0) {
      if (phase === 'prep') {
        setPhase('speak');
        setTimer(30);
      } else if (phase === 'speak') {
        stopRecording();
      }
      return;
    }
    const id = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [isOpen, phase, timer]);

  const startRecording = () => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    try {
      const recognition = new SR();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        let fullText = '';
        for (let i = 0; i < event.results.length; i++) {
          fullText += event.results[i][0].transcript + ' ';
        }
        setTranscript(fullText.trim());
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } catch {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
  };

  const usedTargets = targetWords.filter((tw) =>
    transcript.toLowerCase().includes(tw.toLowerCase())
  );

  const handleEvaluate = async () => {
    if (transcript.trim().length < 10) return;
    stopRecording();
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/evaluate-paraphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: 'speaking_rapid_fire',
          original_sentence: prompt.question,
          user_paraphrase: transcript,
          target_word: targetWords.join(', '),
          user_ielts_target: 7.5,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const bonusXp = usedTargets.length * 10;
        const totalXp = Math.max(20, (data.xp_awarded || 30) + bonusXp);
        const skillPct = Math.min(100, Math.round(((data.evaluated_band || 6.5) / 9) * 100));
        updateSkillScore('speaking', skillPct);
        awardGameXP(totalXp, 'speaking_rapid_fire', skillPct);
        onFinishGame();
        setEvaluation({ ...data, xp_awarded: totalXp });
        setPhase('result');
        if ((data.evaluated_band || 0) >= 7.0) {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-3xl bg-[#0d1323] border border-emerald-500/30 shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">TEZKOR NUTQ (SPEAKING)</h2>
              <p className="text-xs text-slate-400">IELTS Part 2/3 • {prompt.topic}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {phase !== 'result' && (
              <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {phase === 'prep' ? `Tayyorlanish: ${timer}s` : `Nutq: ${timer}s`}
              </span>
            )}
            <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {phase !== 'result' ? (
          <div className="py-5 space-y-5">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                IELTS Speaking Savoli
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">{prompt.question}</h3>
              <p className="text-xs text-slate-400">{prompt.sampleHint}</p>
            </div>

            {/* Target Vocabulary Pills */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400">
                Javobingizda quyidagi akademik so&apos;zlarni ishlating (+10 XP har biri uchun):
              </p>
              <div className="flex flex-wrap gap-2">
                {targetWords.map((word) => {
                  const used = transcript.toLowerCase().includes(word.toLowerCase());
                  return (
                    <span
                      key={word}
                      className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all ${
                        used
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-700 text-slate-300'
                      }`}
                    >
                      {used && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {word}
                    </span>
                  );
                })}
              </div>
            </div>

            {phase === 'prep' ? (
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-3">
                <p className="text-sm font-bold text-emerald-300">
                  Fikringizni jamlang... ({timer} soniya)
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPhase('speak');
                    setTimer(30);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider"
                >
                  Hozir boshlash
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {speechSupported
                      ? 'Mikrofon orqali gapiring yoki pastga yozing:'
                      : 'Brauzeringizda ovozli yozish cheklangan — javobingizni matn shaklida kiriting:'}
                  </span>
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                        isRecording
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      {isRecording ? 'To\'xtatish' : 'Mikrofonni yoqish'}
                    </button>
                  )}
                </div>

                <textarea
                  rows={4}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Masalan: In my view, artificial intelligence has become ubiquitous in higher education..."
                  className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 focus:border-emerald-400 outline-none text-sm text-white"
                />

                <button
                  type="button"
                  disabled={isEvaluating || transcript.trim().length < 10}
                  onClick={handleEvaluate}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AI Band baholamoqda...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>AI Speaking Bahosini Olish</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          evaluation && (
            <div className="py-6 space-y-5">
              <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Taxminiy Speaking Band</span>
                    <span className="text-2xl font-black text-emerald-400">Band {evaluation.evaluated_band}</span>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-sm">
                  +{evaluation.xp_awarded} XP
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-cyan-400 block mb-1">AI Ekspert Tahlili:</span>
                {evaluation.feedback_uz}
              </div>

              {evaluation.c1_upgrade && (
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs space-y-1">
                  <span className="font-bold text-purple-300 block">✨ Band 8.0+ Nutq Varianti:</span>
                  <p className="text-slate-200 italic">&ldquo;{evaluation.c1_upgrade}&rdquo;</p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setPromptIndex((prev) => prev + 1)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Keyingi savol
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs"
                >
                  Arenaga qaytish
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
