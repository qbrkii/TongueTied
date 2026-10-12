import React, { useState } from 'react';
import { 
  X, Heart, Share2, Edit3, Trash2, Calendar, MapPin, 
  ArrowRight, Video, Sparkles, AlertCircle 
} from 'lucide-react';
import { DiaryEntry } from '../types';
import { getMoodEmoji, getMoodLabel } from '../utils/storage';

interface EntryDetailModalProps {
  entry: DiaryEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (entry: DiaryEntry) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const EntryDetailModal: React.FC<EntryDetailModalProps> = ({
  entry,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);

  if (!isOpen || !entry) return null;

  const formattedDate = new Date(entry.timestamp).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleShare = async () => {
    const shareText = `Tongue-Tied Reflection:\n` +
      `Challenge: ${entry.challengeTitle}\n` +
      `Date: ${formattedDate}\n` +
      (entry.languageAttempted ? `Language: ${entry.languageAttempted}\n` : '') +
      (entry.wordsSpoken ? `Words: "${entry.wordsSpoken}"\n` : '') +
      `Feelings: ${getMoodEmoji(entry.beforeMood)} ${getMoodLabel(entry.beforeMood)} -> ${getMoodEmoji(entry.afterMood)} ${getMoodLabel(entry.afterMood)}\n\n` +
      `"${entry.description}"\n\n` +
      (entry.surprise ? `Surprise: ${entry.surprise}\n` : '') +
      `— Solo daily empathy challenge`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tongue-Tied: ${entry.challengeTitle}`,
          text: shareText,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopyNotice('Copied reflection to clipboard!');
      setTimeout(() => setCopyNotice(null), 3000);
    } catch {
      setCopyNotice('Failed to copy.');
      setTimeout(() => setCopyNotice(null), 3000);
    }
  };

  const handleDelete = () => {
    onDelete(entry.id);
    setShowConfirmDelete(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-xl border border-slate-200 text-slate-800 relative flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-sky-50/50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleFavorite(entry.id)}
              className={`p-2 rounded-full transition cursor-pointer ${
                entry.isFavorite ? 'text-rose-500 bg-rose-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title={entry.isFavorite ? 'Favorited' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${entry.isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
              title="Share or copy reflection"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(entry);
              }}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
              title="Edit entry"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="p-2 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer"
              title="Delete entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Share Copy Notification Banner */}
        {copyNotice && (
          <div className="bg-sky-600 text-white text-xs px-4 py-2 flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{copyNotice}</span>
          </div>
        )}

        {/* Delete Confirmation Banner */}
        {showConfirmDelete && (
          <div className="bg-red-50 border-b border-red-200 p-4 flex items-center justify-between gap-3 text-xs text-red-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>Delete this reflection from your diary?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-2.5 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          
          {/* Challenge Headline */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold tracking-wider uppercase text-sky-800">
                Challenge
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs font-medium text-slate-600">
                {entry.challengeDifficulty}
              </span>
              {entry.locationName && (
                <>
                  <span className="text-slate-400 text-xs">·</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {entry.locationName}
                  </span>
                </>
              )}
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 leading-snug">
              {entry.challengeTitle}
            </h2>

            {/* Foreign Language Badge & Spoken Words */}
            {(entry.languageAttempted || entry.wordsSpoken) && (
              <div className="mt-2.5 p-3 rounded-xl bg-sky-50/70 border border-sky-100 flex flex-col gap-1 text-xs">
                {entry.languageAttempted && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sky-900">🗣️ Language:</span>
                    <span className="font-medium text-slate-800">{entry.languageAttempted}</span>
                  </div>
                )}
                {entry.wordsSpoken && (
                  <div className="flex items-start gap-1.5">
                    <span className="font-semibold text-sky-900 flex-shrink-0">Words spoken:</span>
                    <span className="italic text-slate-800 font-mono">"{entry.wordsSpoken}"</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Emotional Shift Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-2xs flex items-center justify-around">
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-1">{getMoodEmoji(entry.beforeMood)}</span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Before</span>
              <span className="text-xs font-bold text-slate-800 capitalize">{getMoodLabel(entry.beforeMood)}</span>
            </div>

            <div className="flex flex-col items-center px-2">
              <ArrowRight className="w-4 h-4 text-sky-500" />
              <span className="text-[10px] text-slate-400 mt-0.5">Shift</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-2xl mb-1">{getMoodEmoji(entry.afterMood)}</span>
              <span className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider">After</span>
              <span className="text-xs font-bold text-slate-800 capitalize">{getMoodLabel(entry.afterMood)}</span>
            </div>
          </div>

          {/* Attached Photo / Video */}
          {entry.photoUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative shadow-2xs">
              <img
                src={entry.photoUrl}
                alt={entry.challengeTitle}
                className="w-full max-h-72 object-cover object-center"
              />
              {entry.mediaType === 'video' && (
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/70 text-white text-[11px] flex items-center gap-1.5 backdrop-blur-xs">
                  <Video className="w-3.5 h-3.5" />
                  <span>Video proof recorded</span>
                </div>
              )}
            </div>
          )}

          {/* Written Reflection */}
          <div className="bg-slate-50/70 rounded-2xl p-4.5 border border-slate-100 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Reflection
            </h3>
            <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-serif">
              {entry.description}
            </p>
          </div>

          {/* Surprise Line */}
          {entry.surprise && (
            <div className="bg-sky-50/60 rounded-2xl p-3.5 border border-sky-100">
              <span className="text-xs font-semibold text-sky-900 block mb-0.5">
                Surprise:
              </span>
              <p className="text-slate-800 text-xs italic font-medium leading-relaxed">
                "{entry.surprise}"
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-white flex items-center justify-between">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-semibold text-sky-800 hover:text-sky-900 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
