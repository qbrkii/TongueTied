import React from 'react';
import { X, Clock, CheckCircle2, Volume2, PenLine, RefreshCw, Compass } from 'lucide-react';
import { Challenge } from '../types';

interface ChallengeDetailModalProps {
  challenge: Challenge | null;
  isOpen: boolean;
  onClose: () => void;
  isAccepted: boolean;
  isCompletedToday: boolean;
  isCurrentDaily?: boolean;
  onAccept: () => void;
  onLogExperience: () => void;
  onSwapChallenge?: () => void;
  onSetAsDaily?: () => void;
  onOpenPhrases?: () => void;
}

export const ChallengeDetailModal: React.FC<ChallengeDetailModalProps> = ({
  challenge,
  isOpen,
  onClose,
  isAccepted,
  isCompletedToday,
  isCurrentDaily,
  onAccept,
  onLogExperience,
  onSwapChallenge,
  onSetAsDaily,
  onOpenPhrases,
}) => {
  if (!isOpen || !challenge) return null;

  const difficultyColors = {
    Gentle: 'text-teal-700 bg-teal-50 border-teal-200',
    Brave: 'text-sky-700 bg-sky-50 border-sky-200',
    Bold: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  };

  const isSpoken = challenge.approachType === 'spoken-foreign' || challenge.approachType === 'hybrid';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl border border-slate-200 text-slate-800 relative flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-sky-50/50">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${difficultyColors[challenge.difficulty]}`}>
              {challenge.difficulty}
            </span>
            <span className="text-slate-300 text-xs">·</span>
            <span className="flex items-center gap-1 text-xs text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {challenge.estimatedTime}
            </span>
            <span className="text-slate-300 text-xs">·</span>
            <span className="text-xs text-slate-600">
              {isSpoken ? '🗣️ Foreign' : '✋ Gestures'}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 text-sm">
          {/* Title */}
          <h2 className="text-xl font-serif font-bold text-slate-900 leading-snug">
            {challenge.title}
          </h2>

          {/* Instructions */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 block mb-1">
              Instructions
            </span>
            <p className="text-slate-800 text-sm leading-relaxed">
              {challenge.instructions}
            </p>
          </div>

          {/* Why it matters */}
          <div className="bg-sky-50/60 rounded-2xl p-3.5 border border-sky-100 text-xs text-slate-700">
            <span className="font-semibold text-sky-900 block mb-0.5">Why this matters:</span>
            <p className="italic">{challenge.whyThisMatters}</p>
          </div>

          {/* Tip & Safety Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="font-semibold text-slate-800 block mb-0.5">Tip:</span>
              <p className="text-slate-600">{challenge.practicalTip}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="font-semibold text-slate-800 block mb-0.5">Safety:</span>
              <p className="text-slate-600">{challenge.safetyNote}</p>
            </div>
          </div>

          {/* Phrase Guide Link */}
          {onOpenPhrases && isSpoken && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPhrases();
              }}
              className="w-full py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer border border-sky-100"
            >
              <Volume2 className="w-3.5 h-3.5 text-sky-600" />
              <span>Listen to phrases in audio guide</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-white space-y-2">
          {isCompletedToday ? (
            <div className="w-full flex items-center justify-between text-xs">
              <span className="text-emerald-800 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Logged for today
              </span>
              <div className="flex gap-2">
                {onSwapChallenge && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSwapChallenge();
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-500" />
                    <span>Change challenge</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogExperience();
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium cursor-pointer"
                >
                  Log another
                </button>
              </div>
            </div>
          ) : isAccepted ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogExperience();
                }}
                className="w-full h-11 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as done & log diary</span>
              </button>
              {onSwapChallenge && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwapChallenge();
                  }}
                  className="w-full py-2 text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
                  <span>Change challenge</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-full flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onAccept();
                    onClose();
                  }}
                  className="flex-1 h-11 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                >
                  Accept challenge
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogExperience();
                  }}
                  className="px-3 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                >
                  <PenLine className="w-3.5 h-3.5 text-slate-500" />
                  <span>Log now</span>
                </button>
              </div>

              {isCurrentDaily && onSwapChallenge && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwapChallenge();
                  }}
                  className="w-full py-2 text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 transition cursor-pointer bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
                  <span>Change challenge</span>
                </button>
              )}

              {!isCurrentDaily && onSetAsDaily && (
                <button
                  type="button"
                  onClick={() => {
                    onSetAsDaily();
                    onClose();
                  }}
                  className="w-full py-2 text-xs font-medium text-sky-700 hover:text-sky-800 flex items-center justify-center gap-1.5 transition cursor-pointer bg-sky-50 hover:bg-sky-100 rounded-xl border border-sky-200"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Make today's challenge</span>
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
