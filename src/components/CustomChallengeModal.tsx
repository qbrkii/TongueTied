import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Challenge, Difficulty } from '../types';

interface CustomChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (challenge: Challenge) => void;
}

export const CustomChallengeModal: React.FC<CustomChallengeModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Gentle');
  const [approachType, setApproachType] = useState<'spoken-foreign' | 'non-verbal' | 'hybrid'>('spoken-foreign');
  const [estimatedTime, setEstimatedTime] = useState('5–10 mins');
  const [whyThisMatters, setWhyThisMatters] = useState('');
  const [practicalTip, setPracticalTip] = useState('');
  const [safetyNote, setSafetyNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !instructions.trim()) {
      setError('Please provide a title and instructions.');
      return;
    }

    const newChallenge: Challenge = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      instructions: instructions.trim(),
      difficulty,
      approachType,
      estimatedTime: estimatedTime.trim() || '5–10 mins',
      whyThisMatters: whyThisMatters.trim() || 'Exploring how language shapes connection.',
      practicalTip: practicalTip.trim() || 'Smile, breathe, and use polite gestures.',
      safetyNote: safetyNote.trim() || 'Respect personal boundaries and stay safe.',
      isCustom: true,
      category: 'Custom',
    };

    onSave(newChallenge);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-xl border border-slate-200 text-slate-800 relative flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-sky-50/50">
          <div>
            <h2 className="text-base font-serif font-bold text-slate-900">
              Create Challenge
            </h2>
            <p className="text-[11px] text-slate-500">
              Add your custom task to the daily library
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          
          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
              {error}
            </p>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Title <span className="text-sky-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Order in Italian at the Pizzeria"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white"
            />
          </div>

          {/* Difficulty & Type Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="Gentle">Gentle</option>
                <option value="Brave">Brave</option>
                <option value="Bold">Bold</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Communication Mode
              </label>
              <select
                value={approachType}
                onChange={(e) => setApproachType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="spoken-foreign">Spoken Foreign Language</option>
                <option value="non-verbal">Gestures & Non-verbal</option>
                <option value="hybrid">Hybrid (Both)</option>
              </select>
            </div>
          </div>

          {/* Estimated Time */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Estimated Time
            </label>
            <input
              type="text"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="e.g. 5–10 mins"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white"
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Instructions <span className="text-sky-600">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="What specifically should the person do in the real world?"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white resize-none"
            />
          </div>

          {/* Why this matters */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Why this matters (1 sentence)
            </label>
            <input
              type="text"
              value={whyThisMatters}
              onChange={(e) => setWhyThisMatters(e.target.value)}
              placeholder="e.g. Helps understand what it feels like to struggle for words"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white"
            />
          </div>

          {/* Tip & Safety */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Practical Tip
              </label>
              <input
                type="text"
                value={practicalTip}
                onChange={(e) => setPracticalTip(e.target.value)}
                placeholder="e.g. Rehearse the words twice before entering"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Safety Note
              </label>
              <input
                type="text"
                value={safetyNote}
                onChange={(e) => setSafetyNote(e.target.value)}
                placeholder="e.g. Choose friendly public spots"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white"
              />
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-[2] h-11 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs shadow-xs flex items-center justify-center gap-1.5 transition active:scale-[0.99] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Save Challenge</span>
          </button>
        </div>

      </div>
    </div>
  );
};
