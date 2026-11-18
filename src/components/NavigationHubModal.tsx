import React from 'react';
import { 
  X, PlusCircle, Sparkles, TrendingUp, Volume2, 
  Globe, Sliders, User, Palette, BookOpen, 
  BarChart2, Compass, ChevronRight, HeartHandshake, ShieldCheck
} from 'lucide-react';
import { UserPreferences, ThemePreferences, AppAccount } from '../types';
import { getThemeConfig } from '../utils/theme';

interface NavigationHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  themePreferences: ThemePreferences;
  currentAccount: AppAccount | null;
  diaryCount: number;
  libraryCount: number;
  onOpenCreateCustom: () => void;
  onOpenRandomAi: () => void;
  onOpenSequenceBuilder: () => void;
  onOpenPhrases: () => void;
  onOpenPreferences: () => void;
  onOpenProfileAppearance: () => void;
  onNavigateToDiary: () => void;
  onNavigateToProgress: () => void;
  onNavigateToLibrary: () => void;
}

export const NavigationHubModal: React.FC<NavigationHubModalProps> = ({
  isOpen,
  onClose,
  preferences,
  themePreferences,
  currentAccount,
  diaryCount,
  libraryCount,
  onOpenCreateCustom,
  onOpenRandomAi,
  onOpenSequenceBuilder,
  onOpenPhrases,
  onOpenPreferences,
  onOpenProfileAppearance,
  onNavigateToDiary,
  onNavigateToProgress,
  onNavigateToLibrary,
}) => {
  if (!isOpen) return null;

  const themeConfig = getThemeConfig(themePreferences.colorTheme);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 text-slate-800 relative flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: themeConfig.hex }}
            >
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-slate-900 leading-tight">
                Tongue-Tied Menu
              </h2>
              <p className="text-[11px] text-slate-500">
                Navigation Hub & Practice Tools
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Destinations */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          
          {/* SECTION 1: CREATE A CHALLENGE */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Create a Challenge
              </span>
              <span className="text-[11px] text-sky-600 font-medium">
                {preferences.language} • {preferences.proficiency}
              </span>
            </div>

            <div className="space-y-2">
              {/* Option A: Custom Challenge */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCreateCustom();
                }}
                className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 transition text-left cursor-pointer flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-200 transition">
                    <PlusCircle className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Custom Challenge
                    </span>
                    <span className="text-[11px] text-slate-500 block leading-tight">
                      Write, edit, and save your own real-world speaking tasks
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Option B: Random AI Challenge */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRandomAi();
                }}
                className="w-full p-3.5 rounded-2xl border border-sky-200 bg-sky-50/40 hover:bg-sky-50 hover:border-sky-300 transition text-left cursor-pointer flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-sky-950 block">
                      One Random AI Challenge
                    </span>
                    <span className="text-[11px] text-sky-800/80 block leading-tight">
                      Instant tailored micro-prompt based on your level & setting
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-sky-500 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Option C: AI-Arranged Sequence */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSequenceBuilder();
                }}
                className="w-full p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 hover:border-indigo-300 transition text-left cursor-pointer flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-indigo-950 block">
                      AI-Arranged Sequence
                    </span>
                    <span className="text-[11px] text-indigo-800/80 block leading-tight">
                      Step-by-step ladder progressing from easy to bold challenges
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* SECTION 2: PHRASES & LANGUAGE */}
          <div>
            <div className="mb-2 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Language & Helper Tools
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Phrases */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPhrases();
                }}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-left cursor-pointer group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-2">
                  <Volume2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 block">
                  Phrases & Audio
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                  Play native audio & save public/private phrases
                </span>
              </button>

              {/* Language & Preferences */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPreferences();
                }}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-left cursor-pointer group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                  <Sliders className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 block">
                  Language & Prefs
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                  Language, proficiency, topics & comfort level
                </span>
              </button>
            </div>
          </div>

          {/* SECTION 3: PROFILE & APPEARANCE */}
          <div>
            <div className="mb-2 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Account & Appearance
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenProfileAppearance();
              }}
              className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-left cursor-pointer flex items-center justify-between group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-xs"
                  style={{ backgroundColor: themeConfig.hex }}
                >
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Profile & Appearance
                  </span>
                  <span className="text-[11px] text-slate-500 block leading-tight">
                    {currentAccount?.displayName || 'Explorer'} • {themeConfig.name} • {themePreferences.displayFormat === 'comfortable' ? 'Comfortable' : 'Compact'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* SECTION 4: DIARY, PROGRESS, AND LIBRARY */}
          <div>
            <div className="mb-2 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Your Journal & Library
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToDiary();
                }}
                className="p-3 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-center cursor-pointer group shadow-2xs"
              >
                <BookOpen className="w-4 h-4 text-slate-700 mx-auto mb-1.5" />
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  Diary
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {diaryCount} notes
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToProgress();
                }}
                className="p-3 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-center cursor-pointer group shadow-2xs"
              >
                <BarChart2 className="w-4 h-4 text-slate-700 mx-auto mb-1.5" />
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  Progress
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Streaks & stats
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToLibrary();
                }}
                className="p-3 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-center cursor-pointer group shadow-2xs"
              >
                <Compass className="w-4 h-4 text-slate-700 mx-auto mb-1.5" />
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  Library
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {libraryCount} items
                </span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Tongue-Tied • Solo Empathy Practice</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-700 hover:text-slate-900 font-semibold cursor-pointer"
          >
            Close Menu
          </button>
        </div>

      </div>
    </div>
  );
};
