import React from 'react';
import {
  X,
  Trash2,
  Edit3,
  Bookmark,
  RefreshCw,
  Volume2,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';
import { Challenge, Difficulty } from '../types';
import { speakPhrase } from '../data/foreignPhrases';

interface SequenceReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sequence: Challenge[];
  status?: 'idle' | 'loading' | 'error';
  errorMessage?: string | null;
  regeneratingIndex?: number | null;
  stepError?: string | null;
  savedIds?: Set<string>;
  onRetrySequence?: () => void;
  onStartSequence: () => void;
  onEditChallenge: (challenge: Challenge) => void;
  onRegenerateStep: (index: number) => void;
  onRemoveStep: (index: number) => void;
  onSaveToLibrary: (challenge: Challenge) => void;
  onToggleCompleteStep?: (index: number) => void;
}

export const SequenceReviewModal: React.FC<SequenceReviewModalProps> = ({
  isOpen,
  onClose,
  sequence,
  status = 'idle',
  errorMessage,
  regeneratingIndex = null,
  stepError = null,
  savedIds,
  onRetrySequence,
  onStartSequence,
  onEditChallenge,
  onRegenerateStep,
  onRemoveStep,
  onSaveToLibrary,
  onToggleCompleteStep,
}) => {
  if (!isOpen) return null;

  const difficultyColors: Record<Difficulty, string> = {
    Gentle: 'text-teal-700 bg-teal-50 border-teal-200',
    Brave: 'text-sky-700 bg-sky-50 border-sky-200',
    Bold: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  };

  const handlePlayAudio = (phraseText: string, langCode?: string) => {
    speakPhrase(phraseText, langCode || 'es-ES');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-xl border border-slate-200 text-slate-800 relative flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-indigo-50/50">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <div>
              <h2 className="text-base font-serif font-bold text-slate-900">
                {status === 'loading'
                  ? 'Building Arranged AI Sequence...'
                  : `Arranged AI Sequence (${sequence.length} Steps)`}
              </h2>
              <p className="text-[11px] text-slate-500">
                Ordered progression from easier comfort stretches to bolder interactions
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
          {status === 'loading' && (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-base text-slate-900">
                  Crafting your step-by-step ladder...
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Sequencing challenges from Gentle to Bold based on your preferences.
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="py-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="font-serif font-bold text-base text-slate-900">
                  Sequence Generation Failed
                </h3>
                <p className="text-xs text-red-600 bg-red-50/80 p-3 rounded-xl border border-red-200 text-left font-mono leading-relaxed">
                  {errorMessage || 'Could not reach the AI service right now.'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition cursor-pointer"
                >
                  Close
                </button>
                {onRetrySequence && (
                  <button
                    type="button"
                    onClick={onRetrySequence}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry AI Sequence</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {status !== 'loading' && status !== 'error' && (
            <>
              {stepError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                  <span>{stepError}</span>
                </div>
              )}

              {sequence.map((ch, idx) => {
                const stepNum = idx + 1;
                const phrase = ch.examplePhrase || ch.helperPhrases?.[0];
                const isRegen = regeneratingIndex === idx;
                const isSaved = Boolean(savedIds?.has(ch.id) || ch.saved);

                return (
                  <div
                    key={ch.id || idx}
                    className={`p-4 rounded-2xl border transition relative ${
                      ch.completed
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center">
                          {stepNum}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${difficultyColors[ch.difficulty]}`}
                        >
                          {ch.difficulty}
                        </span>
                        {ch.setting && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                            {ch.setting}
                          </span>
                        )}
                        {ch.language && (
                          <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                            {ch.language}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={isRegen}
                          onClick={() => onRegenerateStep(idx)}
                          title="Regenerate this step with AI"
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
                        >
                          {isRegen ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditChallenge(ch)}
                          title="Edit this challenge"
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSaveToLibrary(ch)}
                          title={isSaved ? 'Saved to library' : 'Save to challenge library'}
                          className={`p-1 rounded-lg transition cursor-pointer ${
                            isSaved
                              ? 'text-emerald-600 bg-emerald-50'
                              : 'text-slate-400 hover:text-sky-600 hover:bg-slate-100'
                          }`}
                        >
                          {isSaved ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {sequence.length > 2 && (
                          <button
                            type="button"
                            onClick={() => onRemoveStep(idx)}
                            title="Remove from sequence"
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className="text-sm font-serif font-bold text-slate-900 mb-1">
                      {ch.title}
                    </h3>

                    <p className="text-xs text-slate-700 leading-relaxed mb-2">
                      {ch.instructions}
                    </p>

                    {ch.whyThisMatters && (
                      <div className="bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-100 text-[11px] text-slate-600 mb-2">
                        <span className="font-semibold text-slate-700">Why this helps: </span>
                        <span className="italic">{ch.whyThisMatters}</span>
                      </div>
                    )}

                    {phrase && phrase.phrase && (
                      <div className="flex items-center justify-between bg-sky-50/60 rounded-xl px-3 py-1.5 border border-sky-100/80 text-xs">
                        <div className="truncate mr-2">
                          <span className="font-semibold text-sky-950">{phrase.phrase}</span>
                          {phrase.meaning && (
                            <span className="text-[11px] text-slate-500 ml-1.5">
                              ({phrase.meaning})
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePlayAudio(phrase.phrase, phrase.langCode)}
                          className="p-1 text-sky-600 hover:text-sky-800 hover:bg-sky-100 rounded-md transition cursor-pointer flex-shrink-0"
                          title="Listen"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {onToggleCompleteStep && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => onToggleCompleteStep(idx)}
                          className={`inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer transition ${
                            ch.completed ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${
                              ch.completed ? 'text-emerald-600' : 'text-slate-300'
                            }`}
                          />
                          <span>{ch.completed ? 'Completed' : 'Mark as completed'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer actions */}
        {status !== 'loading' && status !== 'error' && sequence.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onStartSequence();
                onClose();
              }}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <span>Set as Active Sequence</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
