import React from 'react';
import { 
  CheckCircle2, Clock, ArrowRight, RefreshCw, 
  PenLine, Info, Volume2
} from 'lucide-react';
import { Challenge, DiaryEntry } from '../types';

interface TodayViewProps {
  todayDateStr: string;
  challenge: Challenge;
  isAccepted: boolean;
  todayEntry: DiaryEntry | null;
  onAccept: () => void;
  onSwapChallenge: () => void;
  onOpenDetail: () => void;
  onLogExperience: () => void;
  onViewEntry: (entry: DiaryEntry) => void;
  onOpenPhrases: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  todayDateStr: _todayDateStr,
  challenge,
  isAccepted,
  todayEntry,
  onAccept,
  onSwapChallenge,
  onOpenDetail,
  onLogExperience,
  onViewEntry,
  onOpenPhrases,
}) => {
  const formattedToday = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const difficultyColors = {
    Gentle: 'text-teal-700 bg-teal-50/80 border-teal-200',
    Brave: 'text-sky-700 bg-sky-50/80 border-sky-200',
    Bold: 'text-indigo-700 bg-indigo-50/80 border-indigo-200',
  };

  const isSpoken = challenge.approachType === 'spoken-foreign' || challenge.approachType === 'hybrid';

  return (
    <div className="space-y-4 pb-20">
      
      {/* Header - Minimalistic with phrases button on top */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
            Today’s Challenge
          </h1>
          <span className="text-xs text-slate-500">
            {formattedToday}
          </span>
        </div>

        {/* Phrases & Personalization hidden under this top button */}
        <button
          type="button"
          onClick={onOpenPhrases}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-100 text-xs font-medium transition cursor-pointer shadow-2xs"
          title="Open foreign phrases & target language"
        >
          <Volume2 className="w-3.5 h-3.5 text-sky-600" />
          <span>Phrases</span>
        </button>
      </div>

      {/* Main Challenge Card - Minimalistic and straight to the point */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/90 relative">
        
        {/* Metadata Row */}
        <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${difficultyColors[challenge.difficulty]}`}>
              {challenge.difficulty}
            </span>
            <span className="text-slate-300 text-xs">·</span>
            <span className="flex items-center gap-1 text-xs text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {challenge.estimatedTime}
            </span>
            <span className="text-slate-300 text-xs">·</span>
            <span className="text-xs text-slate-600 font-medium bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
              {isSpoken ? '🗣️ Spoken' : '✋ Gestures'}
            </span>
          </div>

          {/* Completed badge if logged today */}
          {todayEntry && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed today
            </span>
          )}
        </div>

        {/* Title */}
        <h2 
          onClick={onOpenDetail}
          className="text-xl sm:text-2xl font-serif font-bold text-slate-900 leading-snug mb-2.5 cursor-pointer hover:text-sky-700 transition"
        >
          {challenge.title}
        </h2>

        {/* Instructions */}
        <p className="text-slate-700 text-sm leading-relaxed mb-4">
          {challenge.instructions}
        </p>

        {/* Why note */}
        <div className="bg-amber-50/40 rounded-xl px-3.5 py-2.5 border border-amber-200/60 mb-5 text-xs text-slate-700 flex items-start gap-2">
          <span className="font-semibold text-amber-900 flex-shrink-0">Why:</span>
          <span className="italic text-slate-700">{challenge.whyThisMatters}</span>
        </div>

        {/* Actions - Exactly ONE "Change challenge" button per state */}
        <div className="space-y-2.5">
          {todayEntry ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onViewEntry(todayEntry)}
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>View reflection</span>
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onSwapChallenge}
                  className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Change challenge</span>
                </button>
                <button
                  type="button"
                  onClick={onLogExperience}
                  className="flex-1 h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-600 font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition cursor-pointer"
                >
                  <PenLine className="w-3.5 h-3.5 text-slate-400" />
                  <span>Log another note</span>
                </button>
              </div>
            </div>
          ) : isAccepted ? (
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={onLogExperience}
                className="w-full h-12 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer active:scale-[0.99]"
              >
                <PenLine className="w-4 h-4" />
                <span>Mark as done & log diary</span>
              </button>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onSwapChallenge}
                  className="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-slate-200 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
                  <span>Change challenge</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenDetail}
                  className="flex-1 h-11 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-slate-200 transition cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tips & safety</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onAccept}
                  className="flex-1 h-12 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer active:scale-[0.99]"
                >
                  <span>Accept challenge</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onSwapChallenge}
                  className="px-4 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-slate-200 transition cursor-pointer"
                  title="Switch to another challenge"
                >
                  <RefreshCw className="w-4 h-4 text-sky-600" />
                  <span>Change challenge</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs px-1 pt-0.5">
                <button
                  type="button"
                  onClick={onOpenDetail}
                  className="text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tips & safety guide</span>
                </button>
                <button
                  type="button"
                  onClick={onLogExperience}
                  className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <PenLine className="w-3.5 h-3.5 text-slate-400" />
                  <span>Log directly</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
