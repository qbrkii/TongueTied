import React, { useState } from 'react';
import { X, Sparkles, PlusCircle, ArrowUpRight, TrendingUp, RefreshCw, Layers, Check } from 'lucide-react';
import { UserPreferences } from '../types';

interface ChallengeCreationHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSelectCustom: () => void;
  onSelectRandomAi: () => void;
  onSelectArrangedSequence: (count: number) => void;
  onOpenPreferences: () => void;
}

export const ChallengeCreationHubModal: React.FC<ChallengeCreationHubModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSelectCustom,
  onSelectRandomAi,
  onSelectArrangedSequence,
  onOpenPreferences,
}) => {
  const [sequenceCount, setSequenceCount] = useState<number>(3);
  const [showSequenceOptions, setShowSequenceOptions] = useState<boolean>(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl border border-slate-200 text-slate-800 relative flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-sky-50/50">
          <div>
            <h2 className="text-base font-serif font-bold text-slate-900">
              New Challenge Options
            </h2>
            <p className="text-[11px] text-slate-500">
              Practicing {preferences.language} • {preferences.proficiency}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Main Choices */}
        <div className="p-5 space-y-3">
          
          {/* Option 1: Create Your Own Challenge */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectCustom();
            }}
            className="w-full p-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 transition text-left cursor-pointer group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 transition">
              <PlusCircle className="w-5 h-5 text-slate-700" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-900">
                  1. Create Custom Challenge
                </span>
                <span className="text-[11px] text-slate-400 font-medium group-hover:translate-x-0.5 transition-transform">
                  Write →
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Write your own specific task, target phrase, and comfort level with quick optional fields.
              </p>
            </div>
          </button>

          {/* Option 2: Random AI Challenge */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectRandomAi();
            }}
            className="w-full p-4 rounded-2xl border border-sky-200 hover:border-sky-300 bg-sky-50/50 hover:bg-sky-50 transition text-left cursor-pointer group flex items-start gap-3.5 shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-sky-950">
                  2. Random AI Challenge
                </span>
                <span className="text-[11px] text-sky-600 font-medium group-hover:translate-x-0.5 transition-transform">
                  Generate →
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Instantly generates one realistic, low-stakes micro-interaction based on your preferences.
              </p>
            </div>
          </button>

          {/* Option 3: Arranged AI Sequence */}
          <div className="border border-indigo-200 rounded-2xl bg-indigo-50/30 p-4 transition">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-indigo-950">
                    3. Arranged AI Sequence
                  </span>
                  <span className="text-[11px] font-medium text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                    Progressive
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  A structured series of challenges designed to build confidence, progressing from easiest to more challenging.
                </p>

                {/* Sequence count selector */}
                <div className="mt-3 pt-3 border-t border-indigo-100 flex items-center justify-between gap-2">
                  <span className="text-xs text-indigo-900 font-medium">
                    Challenges in sequence:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[3, 5, 7].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSequenceCount(num)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                          sequenceCount === num
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white text-indigo-800 border border-indigo-200 hover:bg-indigo-50'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectArrangedSequence(sequenceCount);
                  }}
                  className="w-full mt-3 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Build {sequenceCount}-Step Arranged Sequence</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer info & preferences shortcut */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Current: {preferences.difficultyPreference} difficulty</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenPreferences();
            }}
            className="font-medium cursor-pointer hover:underline"
            style={{ color: 'var(--color-theme-primary)' }}
          >
            Edit Preferences
          </button>
        </div>

      </div>
    </div>
  );
};
