import React from 'react';
import { 
  Sun, BookOpen, BarChart2, Compass, HelpCircle, 
  HeartHandshake, User as UserIcon 
} from 'lucide-react';
import { AppAccount } from '../types';
import { getLanguagePackByName } from '../data/foreignPhrases';

export type NavTab = 'today' | 'diary' | 'progress' | 'challenges';

interface NavbarProps {
  currentTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onOpenAbout: () => void;
  onOpenPhrases: () => void;
  onOpenAuth: () => void;
  currentAccount: AppAccount | null;
  hasActiveChallenge: boolean;
  entriesCount: number;
  chosenLanguage?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onChangeTab,
  onOpenAbout,
  onOpenPhrases,
  onOpenAuth,
  currentAccount,
  hasActiveChallenge,
  entriesCount,
  chosenLanguage = 'Spanish',
}) => {
  const currentPack = getLanguagePackByName(chosenLanguage);

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#F4F8FA]/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 max-w-lg mx-auto w-full flex items-center justify-between">
        <div 
          onClick={() => onChangeTab('today')}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-base text-slate-900 leading-none">
            Tongue-Tied
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenPhrases}
            className="px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-100 transition cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            title={`Foreign Phrase Helper (${currentPack.name})`}
          >
            <span>{currentPack.flag}</span>
            <span>Phrases</span>
          </button>

          <button
            type="button"
            onClick={onOpenAuth}
            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition cursor-pointer flex items-center gap-1.5 text-xs font-medium shadow-2xs"
            title={currentAccount ? (currentAccount.email || 'Your Account') : 'Sign In / Account'}
          >
            <UserIcon className="w-3.5 h-3.5 text-sky-600" />
            <span className="max-w-[85px] truncate font-medium">
              {currentAccount ? currentAccount.displayName : 'Account'}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenAbout}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Bottom Navigation Bar */}
      <nav 
        aria-label="Bottom Navigation" 
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 safe-area-pb"
      >
        <div className="max-w-lg mx-auto px-2 py-1.5 flex items-center justify-around">
          
          {/* Today Tab */}
          <button
            type="button"
            onClick={() => onChangeTab('today')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition cursor-pointer min-w-[64px] ${
              currentTab === 'today'
                ? 'text-sky-600 font-semibold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <Sun className={`w-5 h-5 ${currentTab === 'today' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              {hasActiveChallenge && currentTab !== 'today' && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-sky-500 ring-2 ring-white" />
              )}
            </div>
            <span className="text-[11px] mt-1">Today</span>
          </button>

          {/* Diary Tab */}
          <button
            type="button"
            onClick={() => onChangeTab('diary')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition cursor-pointer min-w-[64px] ${
              currentTab === 'diary'
                ? 'text-sky-600 font-semibold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <BookOpen className={`w-5 h-5 ${currentTab === 'diary' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              {entriesCount > 0 && (
                <span className="absolute -top-1 -right-2 text-[9px] font-bold text-sky-800 bg-sky-100 rounded-full px-1">
                  {entriesCount}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-1">Diary</span>
          </button>

          {/* Progress Tab */}
          <button
            type="button"
            onClick={() => onChangeTab('progress')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition cursor-pointer min-w-[64px] ${
              currentTab === 'progress'
                ? 'text-sky-600 font-semibold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BarChart2 className={`w-5 h-5 ${currentTab === 'progress' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[11px] mt-1">Progress</span>
          </button>

          {/* Library / Challenges Tab */}
          <button
            type="button"
            onClick={() => onChangeTab('challenges')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition cursor-pointer min-w-[64px] ${
              currentTab === 'challenges'
                ? 'text-sky-600 font-semibold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Compass className={`w-5 h-5 ${currentTab === 'challenges' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[11px] mt-1">Explore</span>
          </button>

        </div>
      </nav>
    </>
  );
};
