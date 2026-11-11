'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Plus,
  Wand2,
} from 'lucide-react';
import { IeltsSkillSection, VocabularyWord } from '@/types';
import { addVocabularyWord, updateVocabularyWord } from '@/lib/storage';

const SECTION_OPTIONS: Array<{
  id: IeltsSkillSection;
  label: string;
  desc: string;
}> = [
  { id: 'speaking', label: 'Speaking', desc: 'Nutq & Part 1-3' },
  { id: 'reading', label: 'Reading', desc: 'Matn & Sinonimlar' },
  { id: 'writing', label: 'Writing', desc: 'Task 1 & Task 2' },
  { id: 'listening', label: 'Listening', desc: 'Audio & Dictation' },
  { id: 'general', label: 'General', desc: 'Umumiy lug\'at' },
];

interface VocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWordAdded: (word: VocabularyWord) => void;
  editingWord?: VocabularyWord | null;
  onWordUpdated?: () => void;
}

export const VocabularyModal: React.FC<VocabularyModalProps> = ({
  isOpen,
  onClose,
  onWordAdded,
  editingWord = null,
  onWordUpdated,
}) => {
  const [skillSection, setSkillSection] = useState<IeltsSkillSection>('speaking');
  const [wordEn, setWordEn] = useState('');
  const [translationUz, setTranslationUz] = useState('');
  const [phonetic, setPhonetic] = useState('');

  // Optional fields — default to 'none' / 'None'
  const [partOfSpeech, setPartOfSpeech] = useState<VocabularyWord['part_of_speech']>('none');
  const [academicLevel, setAcademicLevel] = useState<VocabularyWord['academic_level']>('none');
  const [topicTag, setTopicTag] = useState<VocabularyWord['topic_tag']>('None');
  const [collocations, setCollocations] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [exampleUz, setExampleUz] = useState('');

  const [autoAiFill, setAutoAiFill] = useState(true);
  const [showOptional, setShowOptional] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionCounts, setSessionCounts] = useState<Record<IeltsSkillSection, number>>({
    speaking: 0,
    reading: 0,
    writing: 0,
    listening: 0,
    general: 0,
  });
  const [lastSavedWord, setLastSavedWord] = useState<string | null>(null);

  const wordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (editingWord) {
      setSkillSection(editingWord.skill_section || 'general');
      setWordEn(editingWord.word_en);
      setTranslationUz(editingWord.translation_uz);
      setPhonetic(editingWord.phonetic || '');
      setPartOfSpeech(editingWord.part_of_speech || 'none');
      setAcademicLevel(editingWord.academic_level || 'none');
      setTopicTag(editingWord.topic_tag || 'None');
      setCollocations((editingWord.collocations || []).join(', '));
      setExampleSentence(editingWord.example_sentence || '');
      setExampleUz(editingWord.example_translation_uz || '');
      setShowOptional(true);
      setLastSavedWord(null);
    } else {
      setWordEn('');
      setTranslationUz('');
      setPhonetic('');
      setPartOfSpeech('none');
      setAcademicLevel('none');
      setTopicTag('None');
      setCollocations('');
      setExampleSentence('');
      setExampleUz('');
      setShowOptional(false);
      setLastSavedWord(null);
      setSessionCounts({
        speaking: 0,
        reading: 0,
        writing: 0,
        listening: 0,
        general: 0,
      });
      setTimeout(() => wordInputRef.current?.focus(), 120);
    }
  }, [isOpen, editingWord]);

  if (!isOpen) return null;

  const totalSessionAdded = Object.values(sessionCounts).reduce((a, b) => a + b, 0);

  const fetchEnrichment = async (rawWord: string) => {
    const res = await fetch('/api/enrich-word', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: rawWord }),
    });
    if (!res.ok) return null;
    return res.json();
  };

  const handleAIEnrich = async () => {
    if (!wordEn.trim() || isEnriching) return;
    setIsEnriching(true);
    try {
      const data = await fetchEnrichment(wordEn.trim());
      if (data) {
        if (data.translation_uz && !translationUz.trim()) setTranslationUz(data.translation_uz);
        if (data.phonetic) setPhonetic(data.phonetic);
        if (data.collocations && !collocations.trim()) setCollocations(data.collocations.join(', '));
        if (data.example_sentence && !exampleSentence.trim()) setExampleSentence(data.example_sentence);
        if (data.example_translation_uz) setExampleUz(data.example_translation_uz);
        setShowOptional(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleSave = async (closeAfter: boolean) => {
    if (!wordEn.trim() || isSaving) return;
    setIsSaving(true);

    try {
      let finalTranslation = translationUz.trim();
      let finalPhonetic = phonetic.trim();
      let finalCollocations = collocations
        ? collocations.split(',').map((c) => c.trim()).filter(Boolean)
        : [];
      let finalExample = exampleSentence.trim();
      let finalExampleUz = exampleUz.trim();

      // If AI Auto-fill is ON and optional fields or translation are empty, fetch AI data automatically
      const needsAi =
        autoAiFill &&
        (!finalTranslation || finalCollocations.length === 0 || !finalExample);

      if (needsAi) {
        try {
          const aiData = await fetchEnrichment(wordEn.trim());
          if (aiData) {
            if (!finalTranslation && aiData.translation_uz) finalTranslation = aiData.translation_uz;
            if (!finalPhonetic && aiData.phonetic) finalPhonetic = aiData.phonetic;
            if (finalCollocations.length === 0 && Array.isArray(aiData.collocations)) {
              finalCollocations = aiData.collocations;
            }
            if (!finalExample && aiData.example_sentence) finalExample = aiData.example_sentence;
            if (!finalExampleUz && aiData.example_translation_uz) finalExampleUz = aiData.example_translation_uz;
          }
        } catch {
          // Proceed gracefully even if AI call fails
        }
      }

      if (!finalTranslation) {
        finalTranslation = wordEn.trim();
      }

      if (editingWord) {
        updateVocabularyWord(editingWord.id, {
          word_en: wordEn.trim(),
          translation_uz: finalTranslation,
          phonetic: finalPhonetic,
          skill_section: skillSection,
          part_of_speech: partOfSpeech,
          academic_level: academicLevel,
          topic_tag: topicTag,
          collocations: finalCollocations,
          example_sentence: finalExample,
          example_translation_uz: finalExampleUz,
        });
        onWordUpdated?.();
        onClose();
        return;
      }

      const newWord = addVocabularyWord({
        word_en: wordEn.trim(),
        translation_uz: finalTranslation,
        phonetic: finalPhonetic,
        skill_section: skillSection,
        part_of_speech: partOfSpeech,
        academic_level: academicLevel,
        topic_tag: topicTag,
        collocations: finalCollocations,
        example_sentence: finalExample,
        example_translation_uz: finalExampleUz,
      });

      onWordAdded(newWord);
      setSessionCounts((prev) => ({
        ...prev,
        [skillSection]: (prev[skillSection] || 0) + 1,
      }));
      setLastSavedWord(newWord.word_en);

      if (closeAfter) {
        onClose();
      } else {
        // Keep current IELTS section active and reset inputs for next word
        setWordEn('');
        setTranslationUz('');
        setPhonetic('');
        setPartOfSpeech('none');
        setAcademicLevel('none');
        setTopicTag('None');
        setCollocations('');
        setExampleSentence('');
        setExampleUz('');
        setTimeout(() => wordInputRef.current?.focus(), 60);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-3xl bg-white/95 dark:bg-[#0D1321]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.1] p-6 sm:p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_24px_60px_rgba(0,0,0,0.18)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_24px_60px_rgba(0,0,0,0.6)] max-h-[92vh] overflow-y-auto transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          aria-label="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/15 dark:bg-cyan-500/20 border border-teal-500/30 dark:border-cyan-500/35 flex items-center justify-center text-teal-600 dark:text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              {editingWord ? "So'zni Tahrirlash" : "Yangi So'z Qo'shish"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Avval IELTS bo&apos;limini tanlang va so&apos;zlarni ketma-ket kiriting
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Step 1: Select IELTS Section BEFORE entering words */}
          <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-200">
                1. Bu so&apos;zlar qaysi bo&apos;lim uchun?
              </span>
              {!editingWord && totalSessionAdded > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[11px] tabular-nums">
                  Sessiyada: {totalSessionAdded} ta
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {SECTION_OPTIONS.map((sec) => {
                const active = skillSection === sec.id;
                const count = sessionCounts[sec.id] || 0;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      setSkillSection(sec.id);
                      setTimeout(() => wordInputRef.current?.focus(), 50);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      active
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm scale-[1.02]'
                        : 'bg-white/80 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-black/[0.06] dark:border-white/[0.08] hover:border-teal-500/40'
                    }`}
                  >
                    <span>{sec.label}</span>
                    {!editingWord && count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 rounded-full font-mono font-bold ${
                          active
                            ? 'bg-teal-400 text-slate-950'
                            : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Last Added Feedback Toast (stays in same modal for rapid batch input) */}
          {lastSavedWord && !editingWord && (
            <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                &ldquo;{lastSavedWord}&rdquo; ({skillSection.toUpperCase()}) saqlandi! Keyingi so&apos;zni kiriting.
              </span>
            </div>
          )}

          {/* Step 2: Essential Inputs (Word + Translation) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(false);
            }}
            className="space-y-3.5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Inglizcha so&apos;z *
                </label>
                <div className="relative">
                  <input
                    ref={wordInputRef}
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
                    title="AI bilan hozir to'ldirish"
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
                  O&apos;zbekcha tarjimasi {autoAiFill ? '(ixtiyoriy)' : '*'}
                </label>
                <input
                  type="text"
                  required={!autoAiFill}
                  placeholder={autoAiFill ? "Bo'sh qolsa AI o'zi tarjima qiladi" : "Masalan: Yumshatish"}
                  value={translationUz}
                  onChange={(e) => setTranslationUz(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] focus:border-teal-500 dark:focus:border-cyan-400 text-sm text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            {/* AI Auto-fill Toggle */}
            <label className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-teal-500/[0.07] dark:bg-cyan-500/[0.08] border border-teal-500/20 dark:border-cyan-400/20 cursor-pointer">
              <div className="flex items-center gap-2.5">
                <Wand2 className="w-4 h-4 text-teal-600 dark:text-cyan-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                    AI avtomatik to&apos;ldirib ketsin
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Saqlashda bo&apos;sh qolgan tarjima, kollokatsiya va misol gapni AI o&apos;zi yozadi
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoAiFill}
                onChange={(e) => setAutoAiFill(e.target.checked)}
                className="w-4 h-4 accent-teal-600 dark:accent-cyan-400 rounded cursor-pointer shrink-0"
              />
            </label>

            {/* Collapsible Optional Details (None by default) */}
            <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] overflow-hidden">
              <button
                type="button"
                onClick={() => setShowOptional((v) => !v)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <span>
                  Ixtiyoriy maydonlar (Turkumi: {partOfSpeech === 'none' ? 'None' : partOfSpeech}, Daraja: {academicLevel === 'none' ? 'None' : academicLevel}, Gap...)
                </span>
                {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showOptional && (
                <div className="p-3.5 space-y-3 border-t border-black/[0.05] dark:border-white/[0.06]">
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
                        <option value="none">None</option>
                        <option value="verb">Fe&apos;l (verb)</option>
                        <option value="noun">Ot (noun)</option>
                        <option value="adjective">Sifat (adj)</option>
                        <option value="adverb">Ravish (adv)</option>
                        <option value="phrase">Ibora (phrase)</option>
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
                        <option value="none">None</option>
                        <option value="B1">B1</option>
                        <option value="B2">B2</option>
                        <option value="C1">C1 (Band 7+)</option>
                        <option value="C2">C2 (Band 8.5+)</option>
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
                        <option value="None">None</option>
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
                      Kollokatsiyalar (ixtiyoriy, vergul bilan)
                    </label>
                    <input
                      type="text"
                      placeholder="Bo'sh qoldirish mumkin..."
                      value={collocations}
                      onChange={(e) => setCollocations(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-100/80 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      IELTS Misol Gap (ixtiyoriy)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Bo'sh qoldirish mumkin..."
                      value={exampleSentence}
                      onChange={(e) => setExampleSentence(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-100/80 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-full bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              >
                {totalSessionAdded > 0 ? 'Tugatish' : 'Bekor qilish'}
              </button>

              {!editingWord && (
                <button
                  type="submit"
                  disabled={isSaving || !wordEn.trim()}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-cyan-400 dark:to-teal-400 disabled:opacity-40 text-white dark:text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                  <span>Saqlash va yana qo&apos;shish</span>
                </button>
              )}

              <button
                type="button"
                disabled={isSaving || !wordEn.trim()}
                onClick={() => handleSave(true)}
                className="px-5 py-2.5 rounded-full bg-slate-900 dark:bg-white disabled:opacity-40 text-white dark:text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{editingWord ? 'O\'zgarishni saqlash' : 'Saqlab yopish'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
