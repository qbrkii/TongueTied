import React, { useState } from 'react';
import { X, Volume2, Copy, Check, Languages, Sparkles } from 'lucide-react';
import { LANGUAGE_PACKS, speakPhrase } from '../data/foreignPhrases';

interface ForeignPhraseHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  chosenLanguage?: string;
  onSelectLanguage?: (languageName: string) => void;
}

export const ForeignPhraseHelperModal: React.FC<ForeignPhraseHelperModalProps> = ({
  isOpen,
  onClose,
  chosenLanguage = 'Spanish',
  onSelectLanguage,
}) => {
  const [selectedLangCode, setSelectedLangCode] = useState<string>(() => {
    const pack = LANGUAGE_PACKS.find(p => p.name.toLowerCase() === chosenLanguage.toLowerCase());
    return pack ? pack.code : 'es';
  });
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [playingPhrase, setPlayingPhrase] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      const pack = LANGUAGE_PACKS.find(p => p.name.toLowerCase() === chosenLanguage.toLowerCase());
      if (pack) {
        setSelectedLangCode(pack.code);
      }
    }
  }, [isOpen, chosenLanguage]);

  if (!isOpen) return null;

  const currentPack = LANGUAGE_PACKS.find(p => p.code === selectedLangCode) || LANGUAGE_PACKS[0];
  const isCurrentActive = chosenLanguage.toLowerCase() === currentPack.name.toLowerCase();

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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl border border-slate-200 text-slate-800 relative flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-sky-50/50">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-sky-600" />
            <div>
              <h2 className="text-base font-serif font-bold text-slate-900">
                Phrases & Language
              </h2>
              <p className="text-[11px] text-slate-500">
                Select your practice language and listen to helper phrases
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
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 overflow-x-auto scrollbar-none flex gap-1.5">
          {LANGUAGE_PACKS.map((pack) => {
            const isTabActive = pack.code === selectedLangCode;
            const isTarget = pack.name.toLowerCase() === chosenLanguage.toLowerCase();
            return (
              <button
                key={pack.code}
                type="button"
                onClick={() => setSelectedLangCode(pack.code)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap cursor-pointer ${
                  isTabActive
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{pack.flag}</span>
                <span>{pack.name}</span>
                {isTarget && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isTabActive ? 'bg-white' : 'bg-sky-500'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Target language banner with activate button */}
        <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{currentPack.flag}</span>
            <div>
              <span className="font-bold text-slate-800">{currentPack.name}</span>
              <span className="text-[11px] text-slate-500 ml-1">({currentPack.nativeName})</span>
            </div>
          </div>

          {isCurrentActive ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <Check className="w-3.5 h-3.5" />
              <span>Active Target</span>
            </span>
          ) : (
            onSelectLanguage && (
              <button
                type="button"
                onClick={() => onSelectLanguage(currentPack.name)}
                className="px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-semibold transition cursor-pointer shadow-2xs"
              >
                Set as my target language
              </button>
            )
          )}
        </div>

        {/* Cultural Proverb / Wisdom */}
        {currentPack.proverb && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs">
            <div className="flex items-center gap-1 text-amber-900 font-semibold text-[10px] uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Cultural Wisdom</span>
            </div>
            <div className="italic text-slate-800 font-serif">
              «{currentPack.proverb.quote}»
            </div>
            <div className="text-slate-600 text-[11px] mt-0.5">
              {currentPack.proverb.meaning}
            </div>
          </div>
        )}

        {/* Phrase List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1">
            Essential {currentPack.name} phrases:
          </div>
          {currentPack.phrases.map((phrase, idx) => (
            <div
              key={idx}
              className="bg-slate-50/70 rounded-xl p-3 border border-slate-100 flex items-center justify-between gap-2 hover:bg-slate-50 transition"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900 font-serif">
                  {phrase.phrase}
                </div>
                {phrase.pronunciation && (
                  <div className="text-[11px] font-mono text-sky-800">
                    {phrase.pronunciation}
                  </div>
                )}
                <div className="text-xs text-slate-500">
                  {phrase.meaning}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handlePlayAudio(phrase.phrase, currentPack.langCode)}
                  className={`p-2 rounded-lg border transition cursor-pointer ${
                    playingPhrase === phrase.phrase 
                      ? 'bg-sky-500 text-white border-sky-500' 
                      : 'bg-white hover:bg-sky-50 text-sky-700 border-slate-200'
                  }`}
                  title="Listen to pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(phrase.phrase)}
                  className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition cursor-pointer"
                  title="Copy phrase"
                >
                  {copiedText === phrase.phrase ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-white text-center">
          <p className="text-[11px] text-slate-500">
            Audio uses your browser's speech synthesizer · Click copy to use in your reflection
          </p>
        </div>

      </div>
    </div>
  );
};
