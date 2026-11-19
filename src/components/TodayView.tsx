import React from 'react';
import { Menu, ArrowRight, RefreshCw, CheckCircle2, PenLine } from 'lucide-react';
import { Challenge, DiaryEntry, ThemePreferences } from '../types';
import { getThemeConfig } from '../utils/theme';

interface TodayViewProps {
  challenge: Challenge;
  isAccepted: boolean;
  todayEntry: DiaryEntry | null;
  themePreferences?: ThemePreferences;
  onAccept: () => void;
  onSkip: () => void;
  onLogExperience: () => void;
  onViewEntry: (entry: DiaryEntry) => void;
  onOpenMenu: () => void;
  onOpenSafety?: () => void;
  onResetToUnaccepted?: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  challenge,
  isAccepted,
  todayEntry,
  themePreferences,
  onAccept,
  onSkip,
  onLogExperience,
  onViewEntry,
  onOpenMenu,
  onOpenSafety,
}) => {
  const activeColor = themePreferences?.colorTheme || 'sky';
  const format = themePreferences?.displayFormat || 'comfortable';
  const theme = getThemeConfig(activeColor);
  const isCompact = format === 'compact';

  return (
    <div 
      className={`min-h-screen flex flex-col justify-between max-w-lg mx-auto text-slate-800 animate-fade-in transition-all duration-300 ${
        isCompact ? 'px-4 py-4 sm:py-6' : 'px-6 py-8 sm:py-14'
      }`}
    >
      
      {/* Top Header: Understated brand name and single Menu button */}
      <header className={`flex items-center justify-between ${isCompact ? 'pt-1 pb-3' : 'pt-2 pb-6'}`}>
        <h1 className="font-serif font-bold text-lg sm:text-xl text-slate-900 tracking-tight select-none">
          Tongue-Tied
        </h1>

        <button
          type="button"
          onClick={onOpenMenu}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer active:scale-95 shadow-2xs border border-slate-200"
          title="Open Menu"
        >
          <Menu className="w-4 h-4 text-slate-700" />
          <span>Menu</span>
        </button>
      </header>

      {/* Main Focus Area: Plenty of white space, readable text, minimal decoration */}
      <main className={`flex-1 flex flex-col justify-center ${isCompact ? 'py-4 sm:py-6' : 'py-8 sm:py-14'}`}>
        
        {/* STATE 1: Challenge completed today */}
        {todayEntry ? (
          <div className={`${isCompact ? 'space-y-4' : 'space-y-6'} text-center animate-fade-in`}>
            <div 
              className={`rounded-full flex items-center justify-center mx-auto border shadow-2xs ${
                isCompact ? 'w-10 h-10' : 'w-12 h-12'
              }`}
              style={{
                backgroundColor: theme.hex + '15',
                color: theme.hex,
                borderColor: theme.hex + '35',
              }}
            >
              <CheckCircle2 className={isCompact ? 'w-5 h-5' : 'w-6 h-6'} />
            </div>

            <div className="space-y-2">
              <span 
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: theme.hex }}
              >
                Completed Today
              </span>
              <h2 className={`${isCompact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-4xl'} font-serif font-bold text-slate-900 leading-snug`}>
                {challenge.title}
              </h2>
              <p className={`text-slate-600 leading-relaxed max-w-md mx-auto pt-1 ${isCompact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}>
                {challenge.instructions}
              </p>
            </div>

            {/* Actions for completed challenge */}
            <div className={`pt-4 max-w-sm mx-auto w-full ${isCompact ? 'space-y-2' : 'space-y-3'}`}>
              <button
                type="button"
                onClick={() => onViewEntry(todayEntry)}
                className={`w-full text-white font-medium text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-[0.99] ${
                  isCompact ? 'h-10 rounded-xl' : 'h-12 rounded-2xl'
                }`}
                style={{ backgroundColor: theme.hex }}
              >
                <span>View reflection</span>
              </button>
              <button
                type="button"
                onClick={onSkip}
                className={`w-full bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer border border-slate-200 ${
                  isCompact ? 'h-9 rounded-xl' : 'h-11 rounded-2xl'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Try another challenge</span>
              </button>
            </div>
          </div>

        ) : isAccepted ? (
          /* STATE 2: Accepted / In Progress — Show next step */
          <div className={`${isCompact ? 'space-y-4' : 'space-y-6'} animate-fade-in`}>
            <div className="space-y-2 sm:space-y-3">
              <span 
                className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border inline-block"
                style={{
                  backgroundColor: theme.hex + '15',
                  color: theme.hex,
                  borderColor: theme.hex + '30',
                }}
              >
                Challenge in Progress
              </span>
              <h2 className={`${isCompact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'} font-serif font-bold text-slate-900 leading-snug`}>
                {challenge.title}
              </h2>
              <p className={`text-slate-700 leading-relaxed pt-1 ${isCompact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}`}>
                {challenge.instructions}
              </p>
            </div>

            <div 
              className="p-4 rounded-2xl bg-white border text-xs text-slate-600 leading-relaxed shadow-2xs"
              style={{ borderColor: theme.hex + '25' }}
            >
              <p className="font-semibold text-slate-800 mb-0.5">Next step:</p>
              <p>Try this micro-interaction out in your day. When you finish, record a short reflection on how it felt.</p>
            </div>

            {/* In-Progress Actions: Mark Done or Skip/Change */}
            <div className={`pt-4 ${isCompact ? 'space-y-2' : 'space-y-3'}`}>
              <button
                type="button"
                onClick={onLogExperience}
                className={`w-full text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer active:scale-[0.99] ${
                  isCompact ? 'h-11 rounded-xl text-sm' : 'h-13 rounded-2xl text-sm sm:text-base'
                }`}
                style={{ backgroundColor: theme.hex }}
              >
                <PenLine className="w-4 h-4" />
                <span>Mark completed & reflect</span>
              </button>
              
              <button
                type="button"
                onClick={onSkip}
                className={`w-full bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer border border-slate-200 ${
                  isCompact ? 'h-9 rounded-xl' : 'h-11 rounded-2xl'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Skip to another challenge</span>
              </button>
            </div>
          </div>

        ) : (
          /* STATE 3: Clean Main Screen — Focused Title, 1-sentence Action, Level & Setting, Accept & Skip */
          <div className={`${isCompact ? 'space-y-5' : 'space-y-8'} animate-fade-in`}>
            <div className={isCompact ? 'space-y-2' : 'space-y-4'}>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                {challenge.difficulty} · {challenge.setting || 'public place'}
              </p>

              <h2 className={`${isCompact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-4xl'} font-serif font-bold text-slate-900 tracking-tight leading-snug`}>
                {challenge.title}
              </h2>

              <p className={`text-slate-700 font-normal leading-relaxed ${isCompact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}`}>
                {challenge.instructions}
              </p>

              {challenge.whyThisMatters && !isCompact && (
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed pt-1">
                  Why this helps: {challenge.whyThisMatters}
                </p>
              )}
            </div>

            {/* ONLY TWO MAIN BUTTONS: Accept challenge & Skip */}
            <div className={`pt-4 ${isCompact ? 'space-y-2.5' : 'space-y-3'}`}>
              <button
                type="button"
                onClick={onAccept}
                className={`w-full text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer active:scale-[0.99] ${
                  isCompact ? 'h-11 rounded-xl text-sm' : 'h-13 rounded-2xl text-base'
                }`}
                style={{ backgroundColor: theme.hex }}
              >
                <span>Accept challenge</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onSkip}
                className={`w-full bg-white hover:bg-slate-100 text-slate-700 font-medium text-sm flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.99] border border-slate-200 shadow-2xs ${
                  isCompact ? 'h-10 rounded-xl' : 'h-12 rounded-2xl'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Skip</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Subtle footer credit / spacing */}
      <footer className="pt-4 pb-2 text-center text-[11px] text-slate-400 select-none">
        <span>Low-pressure micro-empathy practice</span>
        {onOpenSafety && (
          <>
            <span className="mx-1.5">·</span>
            <button
              type="button"
              onClick={onOpenSafety}
              className="underline underline-offset-2 hover:text-slate-600 transition cursor-pointer"
            >
              Safety &amp; concern
            </button>
          </>
        )}
      </footer>

    </div>
  );
};
