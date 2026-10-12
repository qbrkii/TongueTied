import React, { useState } from 'react';
import { 
  Download, Copy, Search, Heart, Filter, 
  ArrowRight, Video, Plus, PenLine, Check 
} from 'lucide-react';
import { DiaryEntry } from '../types';
import { 
  getMoodEmoji, getMoodLabel, downloadDiaryAsFile, 
  formatDiaryToText 
} from '../utils/storage';

interface DiaryViewProps {
  entries: DiaryEntry[];
  onSelectEntry: (entry: DiaryEntry) => void;
  onNewEntry: () => void;
  onToggleFavorite: (id: string) => void;
}

export const DiaryView: React.FC<DiaryViewProps> = ({
  entries,
  onSelectEntry,
  onNewEntry,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  // Filter entries
  const filteredEntries = entries.filter((item) => {
    if (filterFavorites && !item.isFavorite) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.challengeTitle.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchSurprise = (item.surprise || '').toLowerCase().includes(q);
      return matchTitle || matchDesc || matchSurprise;
    }
    return true;
  });

  const handleCopyAll = async () => {
    if (entries.length === 0) return;
    const text = formatDiaryToText(entries);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleExportFile = () => {
    if (entries.length === 0) return;
    downloadDiaryAsFile(entries);
  };

  return (
    <div className="space-y-4 pb-24">
      
      {/* Header & Actions */}
      <div className="pt-1 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
            Diary
          </h1>
          <p className="text-xs text-slate-500">
            {entries.length === 0 ? 'No entries yet' : `${entries.length} reflections`}
          </p>
        </div>

        {entries.length > 0 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyAll}
              title="Copy all to clipboard"
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-slate-300 transition text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span className="hidden sm:inline font-medium">{copiedAll ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={handleExportFile}
              title="Download diary as text file"
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-slate-300 transition text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline font-medium">Export</span>
            </button>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      {entries.length > 0 && (
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reflections..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition cursor-pointer ${
              filterFavorites 
                ? 'bg-rose-50 border-rose-200 text-rose-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${filterFavorites ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>Favorites</span>
          </button>
        </div>
      )}

      {/* Diary Timeline Content */}
      {entries.length === 0 ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 text-center space-y-3.5 shadow-xs mt-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center">
            <PenLine className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-slate-900">
              Your diary is waiting
            </h3>
            <p className="text-slate-500 text-xs mt-1 max-w-xs mx-auto">
              Reflections on everyday empathy and human interaction will appear here once you complete a challenge.
            </p>
          </div>
          <button
            type="button"
            onClick={onNewEntry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write a note</span>
          </button>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 text-xs">
          No reflections matched your search.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((item) => {
            const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });

            return (
              <article
                key={item.id}
                onClick={() => onSelectEntry(item)}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition cursor-pointer space-y-2.5 relative group"
              >
                {/* Top line: Date, Challenge title, and Favorite */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-500 text-[11px]">
                      {dateStr}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="font-semibold text-slate-800 line-clamp-1">
                      {item.challengeTitle}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    className="p-1 rounded-lg text-slate-300 hover:text-rose-500 transition cursor-pointer"
                    aria-label={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart
                      className={`w-4 h-4 transition ${
                        item.isFavorite
                          ? 'fill-rose-500 text-rose-500'
                          : 'hover:scale-110'
                      }`}
                    />
                  </button>
                </div>

                {/* Mood shift pills */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 w-fit">
                  <span>{getMoodEmoji(item.beforeMood)} {getMoodLabel(item.beforeMood)}</span>
                  <span className="text-slate-400">→</span>
                  <span>{getMoodEmoji(item.afterMood)} {getMoodLabel(item.afterMood)}</span>
                </div>

                {/* Excerpt */}
                <p className="text-slate-700 text-xs leading-relaxed line-clamp-2">
                  {item.description}
                </p>

                {/* Footer extras: language / media badge */}
                {(item.languageAttempted || item.photoUrl) && (
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                    {item.languageAttempted && (
                      <span>🗣️ {item.languageAttempted}</span>
                    )}
                    {item.photoUrl && (
                      <span className="text-slate-400">📷 photo</span>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

    </div>
  );
};
