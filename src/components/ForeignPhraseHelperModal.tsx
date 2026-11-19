import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  Copy,
  Check,
  Languages,
  Sparkles,
  Plus,
  Lock,
  Globe2,
  Trash2,
} from 'lucide-react';
import { UsefulPhrase } from '../types';
import { LANGUAGE_PACKS, speakPhrase } from '../data/foreignPhrases';

interface ForeignPhraseHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  chosenLanguage?: string;
  customPhrases: UsefulPhrase[];
  onAddPhrase: (phrase: UsefulPhrase) => void;
  onDeletePhrase: (id: string) => void;
  onSelectLanguage?: (languageName: string) => void;
}

export const ForeignPhraseHelperModal: React.FC<ForeignPhraseHelperModalProps> = ({
  isOpen,
  onClose,
  chosenLanguage = 'Spanish',
  customPhrases,
  onAddPhrase,
  onDeletePhrase,
  onSelectLanguage,
}) => {
  const [selectedLangCode, setSelectedLangCode] = useState<string>(() => {
    const pack = LANGUAGE_PACKS.find(
      (p) => p.name.toLowerCase() === chosenLanguage.toLowerCase()
    );
    return pack ? pack.code : 'es';
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'curated' | 'custom' | 'private'>('all');

  const [newPhraseText, setNewPhraseText] = useState('');
  const [newPronunciation, setNewPronunciation] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newIsPublic, setNewIsPublic] = useState(false);
  const [newLanguage, setNewLanguage] = useState(chosenLanguage);

  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [playingPhrase, setPlayingPhrase] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const pack = LANGUAGE_PACKS.find(
        (p) => p.name.toLowerCase() === chosenLanguage.toLowerCase()
      );
      if (pack) {
        setSelectedLangCode(pack.code);
        setNewLanguage(pack.name);
      }
    }
  }, [isOpen, chosenLanguage]);

  if (!isOpen) return null;

  const currentPack =
    LANGUAGE_PACKS.find((p) => p.code === selectedLangCode) || LANGUAGE_PACKS[0];

  const handlePlayAudio = (phraseText: string, langCode: string) => {
    setPlayingPhrase(phraseText);
    speakPhrase(phraseText, langCode);
    setTimeout(() => setPlayingPhrase(null), 1500);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1500);
  };

  const handleCreatePhrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhraseText.trim()) return;

    const pack = LANGUAGE_PACKS.find(
      (p) => p.name.toLowerCase() === newLanguage.toLowerCase()
    );
    const langCode = pack?.langCode || currentPack.langCode;

    const phrase: UsefulPhrase = {
      id: `custom-phrase-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      phrase: newPhraseText.trim(),
      pronunciation: newPronunciation.trim() || undefined,
      meaning: newMeaning.trim() || newPhraseText.trim(),
      language: newLanguage,
      langCode,
      isCustom: true,
      isPublic: newIsPublic,
      createdAt: Date.now(),
    };

    onAddPhrase(phrase);
    setNewPhraseText('');
    setNewPronunciation('');
    setNewMeaning('');
    setShowAddForm(false);
  };

  const curated = currentPack.phrases.map((p) => ({
    ...p,
    id: `curated-${p.phrase}`,
    isCustom: false,
    isPublic: true,
  }));

  const userCustomInLang = customPhrases.filter(
    (p) => p.language.toLowerCase() === currentPack.name.toLowerCase()
  );

  let combinedList: UsefulPhrase[] = [];
  if (filterMode === 'all') {
    combinedList = [...userCustomInLang, ...curated];
  } else if (filterMode === 'curated') {
    combinedList = curated;
  } else if (filterMode === 'custom') {
    combinedList = userCustomInLang;
  } else if (filterMode === 'private') {
    combinedList = userCustomInLang.filter((p) => !p.isPublic);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-xl border border-slate-200 text-slate-800 relative flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4" style={{ color: 'var(--color-theme-primary)' }} />
            <div>
              <h2 className="text-base font-serif font-bold text-slate-900">
                Phrases & Language Helper
              </h2>
              <p className="text-[11px] text-slate-500">
                Comfort kit: listen and save your own public or private phrases
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Language Tabs Row */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 bg-slate-50/60 overflow-x-auto scrollbar-none flex items-center gap-1.5">
          {LANGUAGE_PACKS.map((pack) => {
            const isSelected = selectedLangCode === pack.code;
            return (
              <button
                key={pack.code}
                type="button"
                onClick={() => {
                  setSelectedLangCode(pack.code);
                  setNewLanguage(pack.name);
                  if (onSelectLanguage) onSelectLanguage(pack.name);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
                style={isSelected ? { backgroundColor: 'var(--color-theme-primary)' } : undefined}
              >
                <span>{pack.flag}</span>
                <span>{pack.name}</span>
              </button>
            );
          })}
        </div>

        {/* Action bar & Filters */}
        <div className="px-5 py-2.5 flex items-center justify-between border-b border-slate-100 bg-white gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            {(['all', 'curated', 'custom', 'private'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilterMode(mode)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer capitalize ${
                  filterMode === mode
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {mode === 'custom' ? 'My Custom' : mode}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1 px-3 py-1 text-white rounded-lg text-xs font-medium transition cursor-pointer shadow-2xs"
            style={{ backgroundColor: 'var(--color-theme-primary)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Phrase</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
          {showAddForm && (
            <form
              onSubmit={handleCreatePhrase}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 animate-fade-in mb-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-theme-primary)' }} />
                  <span>Save New Comfort Phrase ({currentPack.name})</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div>
                <input
                  type="text"
                  required
                  value={newPhraseText}
                  onChange={(e) => setNewPhraseText(e.target.value)}
                  placeholder={`Phrase in ${currentPack.name}...`}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newPronunciation}
                  onChange={(e) => setNewPronunciation(e.target.value)}
                  placeholder="Pronunciation guide..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
                <input
                  type="text"
                  value={newMeaning}
                  onChange={(e) => setNewMeaning(e.target.value)}
                  placeholder="English meaning..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  {newIsPublic ? (
                    <Globe2 className="w-3.5 h-3.5 text-sky-600" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>{newIsPublic ? 'Public Phrase' : 'Private to you'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNewIsPublic(!newIsPublic)}
                  className={`text-[11px] px-2 py-0.5 rounded border transition cursor-pointer ${
                    newIsPublic
                      ? 'bg-sky-100 text-sky-800 border-sky-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {newIsPublic ? 'Make Private' : 'Make Public'}
                </button>
              </div>

              <button
                type="submit"
                className="w-full h-8 text-white rounded-xl text-xs font-medium transition cursor-pointer"
                style={{ backgroundColor: 'var(--color-theme-primary)' }}
              >
                Save Phrase
              </button>
            </form>
          )}

          {filterMode === 'all' && currentPack.proverb && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/70 text-xs">
              <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block mb-1">
                {currentPack.flag} Cultural Wisdom
              </span>
              <p className="font-serif italic font-bold text-slate-800 text-sm mb-0.5">
                "{currentPack.proverb.quote}"
              </p>
              <p className="text-slate-600 text-[11px]">{currentPack.proverb.meaning}</p>
            </div>
          )}

          {combinedList.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No phrases found under this filter. Tap "Add Phrase" to save your own!
            </div>
          ) : (
            combinedList.map((item, idx) => {
              const isPlaying = playingPhrase === item.phrase;
              const isCopied = copiedText === item.phrase;

              return (
                <div
                  key={item.id || idx}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition shadow-2xs relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {currentPack.flag} {item.language || currentPack.name}
                        </span>
                        {item.isCustom && (
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                              item.isPublic
                                ? 'bg-sky-50 text-sky-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.isPublic ? (
                              <Globe2 className="w-2.5 h-2.5" />
                            ) : (
                              <Lock className="w-2.5 h-2.5" />
                            )}
                            <span>{item.isPublic ? 'Public' : 'Private'}</span>
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-slate-900 leading-snug">
                        {item.phrase}
                      </p>

                      {item.pronunciation && (
                        <p className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--color-theme-primary)' }}>
                          {item.pronunciation}
                        </p>
                      )}

                      <p className="text-xs text-slate-600 mt-1">{item.meaning}</p>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handlePlayAudio(item.phrase, item.langCode || currentPack.langCode)
                        }
                        className={`p-2 rounded-xl transition cursor-pointer ${
                          isPlaying
                            ? 'text-white'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                        style={
                          isPlaying
                            ? { backgroundColor: 'var(--color-theme-primary)' }
                            : undefined
                        }
                        title="Listen with native pronunciation"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(item.phrase)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition cursor-pointer"
                        title="Copy phrase"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {item.isCustom && item.id && (
                        <button
                          type="button"
                          onClick={() => onDeletePhrase(item.id!)}
                          className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                          title="Delete phrase"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>{combinedList.length} phrases shown</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
