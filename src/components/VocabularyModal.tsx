'use client';

import React, { useState } from 'react';
import { X, Sparkles, Loader2, CheckCircle2, BookOpen } from 'lucide-react';
import { VocabularyWord } from '@/types';
import { addVocabularyWord } from '@/lib/storage';

interface VocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWordAdded: (word: VocabularyWord) => void;
}

export const VocabularyModal: React.FC<VocabularyModalProps> = ({
  isOpen,
  onClose,
  onWordAdded,
}) => {
  const [wordEn, setWordEn] = useState('');
  const [translationUz, setTranslationUz] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState<'noun' | 'verb' | 'adjective' | 'adverb'>('adjective');
  const [academicLevel, setAcademicLevel] = useState<'B1' | 'B2' | 'C1' | 'C2'>('C1');
  const [topicTag, setTopicTag] = useState<'Environment' | 'Technology' | 'Education' | 'Society' | 'Health' | 'General'>('Education');
  const [collocations, setCollocations] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [exampleUz, setExampleUz] = useState('');
  const [isEnriching, setIsEnriching] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleAIEnrich = async () => {
    if (!wordEn.trim()) return;
    setIsEnriching(true);
    try {
      const res = await fetch('/api/enrich-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: wordEn }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.translation_uz) setTranslationUz(data.translation_uz);
        if (data.phonetic) setPhonetic(data.phonetic);
        if (data.part_of_speech) setPartOfSpeech(data.part_of_speech);
        if (data.academic_level) setAcademicLevel(data.academic_level);
        if (data.collocations) setCollocations(data.collocations.join(', '));
        if (data.example_sentence) setExampleSentence(data.example_sentence);
        if (data.example_translation_uz) setExampleUz(data.example_translation_uz);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordEn.trim() || !translationUz.trim()) return;

    const collocationsArray = collocations
      ? collocations.split(',').map((c) => c.trim()).filter(Boolean)
      : [];

    const newWord = addVocabularyWord({
      word_en: wordEn,
      translation_uz: translationUz,
      phonetic,
      part_of_speech: partOfSpeech,
      academic_level: academicLevel,
      topic_tag: topicTag,
      collocations: collocationsArray,
      example_sentence: exampleSentence || `The academic term ${wordEn} is crucial for Band 7.5+ performance.`,
      example_translation_uz: exampleUz,
    });

    onWordAdded(newWord);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
      setWordEn('');
      setTranslationUz('');
      setPhonetic('');
      setCollocations('');
      setExampleSentence('');
      setExampleUz('');
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-3xl bg-white/95 dark:bg-[#0D1321]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.1] p-6 sm:p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_24px_60px_rgba(0,0,0,0.18)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_24px_60px_rgba(0,0,0,0.6)] transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          aria-label="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/15 dark:bg-cyan-500/20 border border-teal-500/30 dark:border-cyan-500/35 flex items-center justify-center text-teal-600 dark:text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              Yangi So&apos;z Qo&apos;shish
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AI avtomatik ravishda IELTS kollokatsiyalari va misol gaplar bilan boyitadi
            </p>
          </div>
        </div>

        {successMsg ? (
          <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              Lug&apos;atga muvaffaqiyatli qo&apos;shildi!
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Spaced Repetition (SM-2) navbatiga kiritildi
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Inglizcha so&apos;z *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Mitigate"
                    value={wordEn}
                    onChange={(e) => setWordEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-24 rounded-xl bg-slate-100/80 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] focus:border-teal-500 dark:focus:border-cyan-400 text-sm text-slate-900 dark:text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAIEnrich}
                    disabled={isEnriching || !wordEn.trim()}
                    className="absolute right-1.5 top-1.5 px-2.5 py-1.5 rounded-lg bg-teal-500/15 dark:bg-cyan-500/20 hover:bg-teal-500/25 border border-teal-500/30 dark:border-cyan-500/40 text-teal-700 dark:text-cyan-300 text-[11px] font-bold flex items-center gap-1 transition-all disabled:opacity-40"
                    title="AI orqali avtomatik to'ldirish"
                  >
                    {isEnriching ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>AI Enrich</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  O&apos;zbekcha tarjimasi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Yumshatish, kamaytirish"
                  value={translationUz}
                  onChange={(e) => setTranslationUz(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] focus:border-teal-500 dark:focus:border-cyan-400 text-sm text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  So&apos;z turkumi
                </label>
                <select
                  value={partOfSpeech}
                  onChange={(e) => setPartOfSpeech(e.target.value as any)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-black/[0.08] dark:border-white/[0.1] text-xs text-slate-900 dark:text-white outline-none"
                >
                  <option value="verb">Fe&apos;l (verb)</option>
                  <option value="noun">Ot (noun)</option>
                  <option value="adjective">Sifat (adj)</option>
                  <option value="adverb">Ravish (adv)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  IELTS Darajasi
                </label>
                <select
                  value={academicLevel}
                  onChange={(e) => setAcademicLevel(e.target.value as any)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-black/[0.08] dark:border-white/[0.1] text-xs text-slate-900 dark:text-white outline-none"
                >
                  <option value="B1">B1 (Intermediate)</option>
                  <option value="B2">B2 (Upper)</option>
                  <option value="C1">C1 (Band 7.0-8.0)</option>
                  <option value="C2">C2 (Mastery 8.5+)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Mavzu (Topic)
                </label>
                <select
                  value={topicTag}
                  onChange={(e) => setTopicTag(e.target.value as any)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-black/[0.08] dark:border-white/[0.1] text-xs text-slate-900 dark:text-white outline-none"
                >
                  <option value="Environment">Environment</option>
                  <option value="Technology">Technology</option>
                  <option value="Education">Education</option>
                  <option value="Society">Society</option>
                  <option value="Health">Health</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kollokatsiyalar (vergul bilan)
              </label>
              <input
                type="text"
                placeholder="mitigate risk, mitigate the impact, mitigate effects"
                value={collocations}
                onChange={(e) => setCollocations(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100/80 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                IELTS Misol Gap
              </label>
              <textarea
                rows={2}
                placeholder="Governments must introduce strict policies to mitigate the adverse effects..."
                value={exampleSentence}
                onChange={(e) => setExampleSentence(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100/80 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-cyan-400 dark:to-teal-400 text-white dark:text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Lug&apos;atga saqlash
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
