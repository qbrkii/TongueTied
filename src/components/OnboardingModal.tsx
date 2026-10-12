import React, { useState } from 'react';
import { ArrowRight, Check, HeartHandshake, ShieldCheck, Globe } from 'lucide-react';
import { LANGUAGE_PACKS } from '../data/foreignPhrases';

interface OnboardingModalProps {
  isOpen: boolean;
  chosenLanguage: string;
  onSelectLanguage: (lang: string) => void;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ 
  isOpen, 
  chosenLanguage,
  onSelectLanguage,
  onComplete 
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-slate-200 text-slate-800 relative flex flex-col">
        
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-800">
            {step === 1 ? 'Concept' : step === 2 ? 'Your Language' : 'Safety'}
          </span>
          <div className="flex gap-1.5">
            <span className={`h-1.5 rounded-full transition-all ${step === 1 ? 'w-5 bg-sky-500' : 'w-2 bg-slate-200'}`} />
            <span className={`h-1.5 rounded-full transition-all ${step === 2 ? 'w-5 bg-sky-500' : 'w-2 bg-slate-200'}`} />
            <span className={`h-1.5 rounded-full transition-all ${step === 3 ? 'w-5 bg-sky-500' : 'w-2 bg-slate-200'}`} />
          </div>
        </div>

        {/* Step 1: Concept */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-xl font-serif font-bold text-slate-900">
                Tongue-Tied
              </h2>
              <p className="text-slate-600 text-sm mt-1 leading-snug">
                One small daily challenge to experience life across the language barrier.
              </p>
            </div>

            <div className="space-y-2.5 bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-xs text-slate-700">
              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-sky-700">1.</span>
                <span><strong>Micro-challenge:</strong> Try foreign words or communicate with gestures alone.</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-sky-700">2.</span>
                <span><strong>Solo experience:</strong> A quiet, real-world interaction in your community.</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-sky-700">3.</span>
                <span><strong>Personal diary:</strong> Log your emotional shift before and after.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full h-11 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <span>Next: Choose Language</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Choose Language */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-xl font-serif font-bold text-slate-900">
                Choose Target Language
              </h2>
              <p className="text-slate-600 text-sm mt-1 leading-snug">
                Challenges and daily phrases will be personalized for this language.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
              {LANGUAGE_PACKS.map((pack) => {
                const isSelected = pack.name.toLowerCase() === chosenLanguage.toLowerCase();
                return (
                  <button
                    key={pack.code}
                    type="button"
                    onClick={() => onSelectLanguage(pack.name)}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-sky-50 border-sky-500 text-sky-900 font-bold shadow-2xs ring-2 ring-sky-200'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl">{pack.flag}</span>
                    <span className="text-xs font-semibold">{pack.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{pack.nativeName}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full h-11 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                <span>Continue with {chosenLanguage}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-slate-700 text-center py-1 cursor-pointer"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Safety */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-xl font-serif font-bold text-slate-900">
                Respect & Safety
              </h2>
              <p className="text-slate-600 text-sm mt-1 leading-snug">
                Empathy starts with mutual respect.
              </p>
            </div>

            <div className="space-y-2.5 bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-xs text-slate-700">
              <div className="flex gap-2 items-start">
                <Check className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                <span><strong>Be polite:</strong> If someone seems busy, smile and politely step away.</span>
              </div>
              <div className="flex gap-2 items-start">
                <Check className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                <span><strong>Skip anytime:</strong> Skip any challenge that feels uncomfortable.</span>
              </div>
              <div className="flex gap-2 items-start">
                <Check className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                <span><strong>No pranks:</strong> A genuine practice of empathy and connection.</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={onComplete}
                className="w-full h-11 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm transition cursor-pointer shadow-xs"
              >
                Let’s Begin
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-slate-500 hover:text-slate-700 text-center py-1 cursor-pointer"
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
