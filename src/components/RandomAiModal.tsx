import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, RefreshCw, Check, ArrowRight, 
  AlertCircle, Volume2, Clock, Globe, Shield 
} from 'lucide-react';
import { Challenge, ChallengeSetting, UserPreferences, UsefulPhrase } from '../types';
import { speakPhrase, LANGUAGE_PACKS } from '../data/foreignPhrases';

interface RandomAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUseChallenge: (challenge: Challenge) => void;
}

export const RandomAiModal: React.FC<RandomAiModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUseChallenge,
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [generatedChallenge, setGeneratedChallenge] = useState<Challenge | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Trigger generation automatically when modal opens
  useEffect(() => {
    if (isOpen) {
      handleGenerate();
    } else {
      setStatus('idle');
      setGeneratedChallenge(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    setStatus('loading');
    setErrorMessage(null);
    setGeneratedChallenge(null);

    try {
      const res = await fetch('/api/gemini/generate-challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefs: preferences }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.challenge) {
        throw new Error(data.error || 'The AI service could not generate a challenge at this time.');
      }

      const parsed = data.challenge;
      const langPack = LANGUAGE_PACKS.find(p => p.name.toLowerCase() === preferences.language.toLowerCase());
      const langCode = langPack?.langCode || 'es-ES';

      let examplePhraseObj: UsefulPhrase | undefined;
      if (parsed.examplePhrase && parsed.examplePhrase.phrase) {
        examplePhraseObj = {
          id: `phr-ai-${Date.now()}`,
          phrase: parsed.examplePhrase.phrase,
          pronunciation: parsed.examplePhrase.pronunciation,
          meaning: parsed.examplePhrase.meaning,
          language: preferences.language,
          langCode,
          isCustom: false,
          isPublic: false,
        };
      }

      const validSettings: ChallengeSetting[] = ['public place', 'school', 'online'];
      const parsedSetting = validSettings.includes(parsed.setting) ? parsed.setting : 'public place';

      const challenge: Challenge = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: parsed.title || 'Micro Interaction',
        instructions: parsed.instructions || '',
        difficulty: (['Gentle', 'Brave', 'Bold'].includes(parsed.difficulty) ? parsed.difficulty : 'Gentle') as any,
        setting: parsedSetting,
        estimatedTime: parsed.estimatedTime || '3–5 mins',
        whyThisMatters: parsed.whyThisMatters || '',
        practicalTip: parsed.practicalTip || 'Smile, breathe, and keep your body language open and relaxed.',
        safetyNote: parsed.safetyNote || 'Never ask for personal info; you can always skip without penalty.',
        language: preferences.language,
        topic: parsed.topic || preferences.topics?.[0] || 'Everyday Life',
        examplePhrase: examplePhraseObj,
        helperPhrases: examplePhraseObj ? [examplePhraseObj] : [],
        isAiGenerated: true,
        isCustom: false,
        isPublic: false,
      };

      setGeneratedChallenge(challenge);
      setStatus('success');
    } catch (err: any) {
      console.error('Failed to generate challenge with AI:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while communicating with the AI service.');
      setStatus('error');
    }
  };

  const handlePlayAudio = (phraseText: string, langCode?: string) => {
    speakPhrase(phraseText, langCode || 'es-ES');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 text-slate-800 relative flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-sky-50/50">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl text-white flex items-center justify-center shadow-xs"
              style={{ backgroundColor: 'var(--color-theme-primary)' }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-slate-900">
                Random AI Challenge
              </h2>
              <p className="text-[11px] text-slate-500">
                Practicing {preferences.language} • {preferences.proficiency}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          
          {/* LOADING STATE */}
          {status === 'loading' && (
            <div className="py-16 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-sky-100 border-t-sky-600 animate-spin" />
                <Sparkles className="w-6 h-6 text-sky-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  Generating your challenge...
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Crafting a low-pressure interaction in {preferences.language} based on your preferences.
                </p>
              </div>
            </div>
          )}

          {/* ERROR STATE */}
          {status === 'error' && (
            <div className="py-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200 shadow-2xs">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-serif font-bold text-base text-slate-900">
                  AI Generation Failed
                </h3>
                <p className="text-xs text-red-600 bg-red-50/80 p-3 rounded-xl border border-red-200 text-left leading-relaxed font-mono">
                  {errorMessage || 'Unknown error occurred while contacting AI service.'}
                </p>
                <p className="text-[11px] text-slate-500 pt-1">
                  Ensure your server has a valid API key configured in Settings &gt; Secrets, then try again.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-5 py-2.5 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  style={{ backgroundColor: 'var(--color-theme-primary)' }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry AI Generation</span>
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS STATE */}
          {status === 'success' && generatedChallenge && (
            <div className="space-y-5 animate-fade-in">
              {/* Badge info */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  {generatedChallenge.difficulty}
                </span>
                {generatedChallenge.setting && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                    {generatedChallenge.setting}
                  </span>
                )}
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {generatedChallenge.estimatedTime}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                  {generatedChallenge.language}
                </span>
              </div>

              {/* Title & Action Instructions */}
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 leading-snug">
                  {generatedChallenge.title}
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {generatedChallenge.instructions}
                </p>
                {generatedChallenge.whyThisMatters && (
                  <p className="text-xs text-slate-500 italic">
                    Why this helps: {generatedChallenge.whyThisMatters}
                  </p>
                )}
              </div>

              {/* Example Phrase Card if available */}
              {generatedChallenge.examplePhrase && (
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 text-xs flex items-center justify-between">
                  <div className="pr-3 truncate">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block mb-0.5">
                      Suggested Phrase
                    </span>
                    <p className="font-semibold text-sky-950 text-sm truncate">
                      {generatedChallenge.examplePhrase.phrase}
                    </p>
                    {generatedChallenge.examplePhrase.pronunciation && (
                      <p className="text-[11px] text-sky-700 font-mono mt-0.5 truncate">
                        {generatedChallenge.examplePhrase.pronunciation}
                      </p>
                    )}
                    {generatedChallenge.examplePhrase.meaning && (
                      <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                        "{generatedChallenge.examplePhrase.meaning}"
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(
                      generatedChallenge.examplePhrase!.phrase,
                      generatedChallenge.examplePhrase!.langCode
                    )}
                    className="p-2.5 rounded-xl bg-white hover:bg-sky-100 text-sky-700 border border-sky-200 transition cursor-pointer shadow-2xs flex-shrink-0"
                    title="Play pronunciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Tips & Safety */}
              <div className="space-y-2 pt-1 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-start gap-1.5">
                  <span className="font-semibold text-slate-800 flex-shrink-0">Tip:</span>
                  <span>{generatedChallenge.practicalTip}</span>
                </div>
                <div className="flex items-start gap-1.5 text-slate-500">
                  <Shield className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>{generatedChallenge.safetyNote}</span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        {status === 'success' && generatedChallenge && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Regenerate</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                Leave
              </button>
              <button
                type="button"
                onClick={() => {
                  onUseChallenge(generatedChallenge);
                  onClose();
                }}
                className="px-5 py-2.5 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                style={{ backgroundColor: 'var(--color-theme-primary)' }}
              >
                <Check className="w-4 h-4" />
                <span>Use Challenge</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
