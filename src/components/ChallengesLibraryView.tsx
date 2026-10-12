import React, { useState } from 'react';
import { 
  Compass, Plus, Clock, Trash2, ChevronRight 
} from 'lucide-react';
import { Challenge, Difficulty } from '../types';

interface ChallengesLibraryViewProps {
  challenges: Challenge[];
  onSelectChallenge: (challenge: Challenge) => void;
  onOpenCreateCustom: () => void;
  onDeleteCustom: (id: string) => void;
  activeChallengeId: string;
}

export const ChallengesLibraryView: React.FC<ChallengesLibraryViewProps> = ({
  challenges,
  onSelectChallenge,
  onOpenCreateCustom,
  onDeleteCustom,
  activeChallengeId,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [approachFilter, setApproachFilter] = useState<'all' | 'spoken' | 'non-verbal'>('all');
  const [showOnlyCustom, setShowOnlyCustom] = useState(false);

  const difficultyColors = {
    Gentle: 'text-teal-700 bg-teal-50 border-teal-200',
    Brave: 'text-sky-700 bg-sky-50 border-sky-200',
    Bold: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  };

  const filtered = challenges.filter(c => {
    if (showOnlyCustom && !c.isCustom) return false;
    if (selectedDifficulty !== 'All' && c.difficulty !== selectedDifficulty) return false;
    if (approachFilter === 'spoken' && c.approachType !== 'spoken-foreign' && c.approachType !== 'hybrid') return false;
    if (approachFilter === 'non-verbal' && c.approachType !== 'non-verbal' && c.approachType !== 'hybrid') return false;
    return true;
  });

  return (
    <div className="space-y-4 pb-24">
      
      {/* Header */}
      <div className="pt-1 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
            Challenges
          </h1>
          <p className="text-xs text-slate-500">
            {challenges.length} available
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateCustom}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs shadow-xs transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'Gentle', 'Brave', 'Bold'].map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => {
                setSelectedDifficulty(diff);
                if (diff !== 'All') setShowOnlyCustom(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap cursor-pointer ${
                selectedDifficulty === diff && !showOnlyCustom
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {diff}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setShowOnlyCustom(!showOnlyCustom)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap cursor-pointer border ${
              showOnlyCustom
                ? 'bg-slate-900 text-white shadow-xs border-slate-900'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            My Custom
          </button>
        </div>

        {/* Approach filter */}
        <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-white/70 p-1 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setApproachFilter('all')}
            className={`flex-1 py-1 rounded-lg transition cursor-pointer ${
              approachFilter === 'all' ? 'bg-slate-100 font-semibold text-slate-900' : 'hover:text-slate-700'
            }`}
          >
            All Methods
          </button>
          <button
            type="button"
            onClick={() => setApproachFilter('spoken')}
            className={`flex-1 py-1 rounded-lg transition cursor-pointer ${
              approachFilter === 'spoken' ? 'bg-slate-100 font-semibold text-slate-900' : 'hover:text-slate-700'
            }`}
          >
            🗣️ Foreign Language
          </button>
          <button
            type="button"
            onClick={() => setApproachFilter('non-verbal')}
            className={`flex-1 py-1 rounded-lg transition cursor-pointer ${
              approachFilter === 'non-verbal' ? 'bg-slate-100 font-semibold text-slate-900' : 'hover:text-slate-700'
            }`}
          >
            ✋ Non-verbal
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {filtered.map((item) => {
          const isTodayActive = item.id === activeChallengeId;

          return (
            <div
              key={item.id}
              onClick={() => onSelectChallenge(item)}
              className={`bg-white rounded-2xl p-4 border transition cursor-pointer relative group flex items-start justify-between gap-3 ${
                isTodayActive 
                  ? 'border-sky-300 ring-1 ring-sky-300 shadow-2xs' 
                  : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${difficultyColors[item.difficulty]}`}>
                    {item.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.estimatedTime}
                  </span>
                  {item.isCustom && (
                    <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                      Custom
                    </span>
                  )}
                  {isTodayActive && (
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                      Today's
                    </span>
                  )}
                </div>

                <h3 className="font-serif font-bold text-slate-900 text-sm mb-1 leading-snug">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                  {item.instructions}
                </p>
              </div>

              <div className="flex items-center gap-1 self-center flex-shrink-0">
                {item.isCustom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this custom challenge?')) {
                        onDeleteCustom(item.id);
                      }
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete custom challenge"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="p-1.5 text-slate-400 group-hover:text-slate-700 transition">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
