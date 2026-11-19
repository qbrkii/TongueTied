import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, HeartHandshake, Globe, ShieldCheck } from 'lucide-react';
import { ThemePreferences } from '../types';
import { LANGUAGE_PACKS } from '../data/foreignPhrases';
import { getThemeConfig } from '../utils/theme';

interface GuestIntroModalProps {
  isOpen: boolean;
  themePreferences: ThemePreferences;
  initialLanguage?: string;
  onSelectLanguage: (language: string) => void;
  onComplete: () => void;
}

export const GuestIntroModal: React.FC<GuestIntroModalProps> = ({
  isOpen,
  themePreferences,
  initialLanguage = 'Spanish',
  onSelectLanguage,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLanguage || 'Spanish');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedLanguage(initialLanguage || 'Spanish');
    }
  }, [isOpen, initialLanguage]);

  if (!isOpen) return null;

  const theme = getThemeConfig(themePreferences.colorTheme);
  const accentHex = themePreferences.colorTheme === 'sky' ? '#2b9cf0' : theme.hex;
  const softTintBg = themePreferences.colorTheme === 'sky' ? '#f3f9ff' : `${theme.hex}0e`;
  const softTintBorder = themePreferences.colorTheme === 'sky' ? '#e0effe' : `${theme.hex}28`;
  const iconBg = themePreferences.colorTheme === 'sky' ? '#e8f3ff' : `${theme.hex}18`;
  const headingLabelColor = themePreferences.colorTheme === 'sky' ? '#1e4b85' : theme.hex;

  const handleBeginWithLanguage = () => {
    const chosen = selectedLanguage || 'Spanish';
    onSelectLanguage(chosen);
    onComplete();
  };

  const stepLabel = step === 1 ? 'SAFETY & CONCERN' : step === 2 ? 'CONCEPT' : 'YOUR LANGUAGE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-7 text-slate-800 space-y-5 my-auto">
        {/* Top label + progress indicator */}
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: headingLabelColor }}
          >
            {stepLabel}
          </span>

          <div className="flex items-center gap-1.5" aria-label={`Step ${step} of 3`}>
            {[1, 2, 3].map((idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  idx === step ? 'w-6' : 'w-1.5 bg-slate-200'
                }`}
                style={idx === step ? { backgroundColor: accentHex } : undefined}
              />
            ))}
          </div>
        </div>

        {/* SLIDE 1: SAFETY & CONCERN (FIRST, BEFORE THE CHALLENGE) */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: iconBg, color: accentHex }}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-serif font-bold text-slate-900 leading-tight">
                Safety & Comfort First
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Before any challenge, your safety, privacy, and peace of mind come first.
              </p>
            </div>

            <div
              className="rounded-2xl border p-4 space-y-3 text-xs text-slate-700 leading-relaxed"
              style={{ backgroundColor: softTintBg, borderColor: softTintBorder }}
            >
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accentHex }} />
                <p>
                  <strong className="text-slate-900">Skip anytime without penalty:</strong> If a
                  moment feels uncomfortable or raises any concern, skip immediately.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accentHex }} />
                <p>
                  <strong className="text-slate-900">Protect personal privacy:</strong> Never ask
                  for or share personal details like phone numbers or addresses.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accentHex }} />
                <p>
                  <strong className="text-slate-900">Be polite & safe:</strong> Choose calm public
                  spaces, respect personal space, and step away gently if someone is busy.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accentHex }} />
                <p>
                  <strong className="text-slate-900">No pranks or pressure:</strong> Every
                  challenge is a genuine practice of empathy and mutual respect.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full h-11 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer active:scale-[0.99]"
              style={{ backgroundColor: accentHex }}
            >
              <span>I Understand · Next: Concept</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SLIDE 2: CONCEPT */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: iconBg, color: accentHex }}
            >
              <HeartHandshake className="w-5 h-5" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-serif font-bold text-slate-900 leading-tight">
                Tongue-Tied
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                One small daily challenge to experience life across the language barrier.
              </p>
            </div>

            <div
              className="rounded-2xl border p-4 space-y-2.5 text-xs text-slate-700 leading-relaxed"
              style={{ backgroundColor: softTintBg, borderColor: softTintBorder }}
            >
              <div className="flex items-start gap-2.5">
                <span className="font-bold shrink-0" style={{ color: accentHex }}>
                  1.
                </span>
                <p>
                  <strong className="text-slate-900">Micro-challenge:</strong> Try foreign words or
                  communicate with gestures alone.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold shrink-0" style={{ color: accentHex }}>
                  2.
                </span>
                <p>
                  <strong className="text-slate-900">Solo experience:</strong> A quiet, real-world
                  interaction in your community.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold shrink-0" style={{ color: accentHex }}>
                  3.
                </span>
                <p>
                  <strong className="text-slate-900">Personal diary:</strong> Log your emotional
                  shift before and after.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full h-11 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer active:scale-[0.99]"
                style={{ backgroundColor: accentHex }}
              >
                <span>Next: Choose Language</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-800 py-1 transition cursor-pointer"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* SLIDE 3: YOUR LANGUAGE */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: iconBg, color: accentHex }}
            >
              <Globe className="w-5 h-5" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-serif font-bold text-slate-900 leading-tight">
                Choose Target Language
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Challenges and daily phrases will be personalized for this language.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-0.5">
              {LANGUAGE_PACKS.map((pack) => {
                const isSelected = selectedLanguage.toLowerCase() === pack.name.toLowerCase();
                return (
                  <button
                    key={pack.code}
                    type="button"
                    onClick={() => setSelectedLanguage(pack.name)}
                    className={`rounded-2xl border p-3 flex flex-col items-center text-center gap-1 transition cursor-pointer ${
                      isSelected
                        ? 'shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                    style={
                      isSelected
                        ? {
                            borderColor: accentHex,
                            backgroundColor: softTintBg,
                            boxShadow: `0 0 0 1px ${accentHex}`,
                          }
                        : undefined
                    }
                  >
                    <span className="text-xl leading-none">{pack.flag}</span>
                    <span className="text-xs font-bold text-slate-900 mt-0.5 leading-tight">
                      {pack.name}
                    </span>
                    <span className="text-[11px] text-slate-400 leading-tight">
                      {pack.nativeName}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleBeginWithLanguage}
                className="w-full h-11 rounded-2xl text-white font-semibold text-sm flex items-center justify-center shadow-xs transition cursor-pointer active:scale-[0.99]"
                style={{ backgroundColor: theme.hex }}
              >
                <span>Let’s Begin with {selectedLanguage || 'Spanish'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-800 py-1 transition cursor-pointer"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
