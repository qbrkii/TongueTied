import React, { useState } from 'react';
import { 
  Compass, Plus, Clock, Trash2, ChevronRight, 
  Sparkles, TrendingUp, Edit3, Lock, Globe2, Bookmark
} from 'lucide-react';
import { Challenge, ChallengeSetting, Difficulty } from '../types';

interface ChallengesLibraryViewProps {
  challenges: Challenge[];
  onSelectChallenge: (challenge: Challenge) => void;
  onOpenCreateCustom: () => void;
  onDeleteCustom: (id: string) => void;
  onEditCustom?: (challenge: Challenge) => void;
  onOpenCreationHub?: () => void;
  onGenerateRandomAi?: () => void;
  onOpenSequenceBuilder?: () => void;
  activeChallengeId: string;
  onBackToToday?: () => void;
}

export const ChallengesLibraryView: React.FC<ChallengesLibraryViewProps> = ({
  challenges,
  onSelectChallenge,
  onOpenCreateCustom,
  onDeleteCustom,
  onEditCustom,
  onOpenCreationHub,
  onGenerateRandomAi,
  onOpenSequenceBuilder,
  activeChallengeId,
  onBackToToday,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedSetting, setSelectedSetting] = useState<'all' | ChallengeSetting>('all');
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
    if (selectedSetting !== 'all' && (c.setting || 'public place') !== selectedSetting) return false;
    if (approachFilter === 'spoken' && c.approachType !== 'spoken-foreign' && c.approachType !== 'hybrid' && !c.language) return false;
    if (approachFilter === 'non-verbal' && c.approachType !== 'non-verbal' && c.approachType !== 'hybrid') return false;
    return true;
  });

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      
      {/* Header */}
      <div className="pt-1 flex items-center justify-between">
        <div>
          {onBackToToday && (
            <button
              type="button"
              onClick={onBackToToday}
              className="text-xs hover:underline font-semibold mb-1 flex items-center gap-1 cursor-pointer"
              style={{ color: 'var(--color-theme-primary)' }}
            >
              <span>← Back to Today</span>
            </button>
          )}
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
            Challenge Library
          </h1>
          <p className="text-xs text-slate-500">
            {challenges.length} challenges saved & available
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenCreateCustom}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white font-medium text-xs shadow-xs transition cursor-pointer"
            style={{ backgroundColor: 'var(--color-theme-primary)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Custom</span>
          </button>
        </div>
      </div>

      {/* Prominent Actions Bar: Random AI & Sequence */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onGenerateRandomAi}
          className="p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 flex items-center gap-2.5 transition cursor-pointer text-left shadow-2xs"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold block leading-tight">Random AI Challenge</span>
            <span className="text-[10px] text-sky-700 block">Instant micro prompt</span>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenSequenceBuilder}
          className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 flex items-center gap-2.5 transition cursor-pointer text-left shadow-2xs"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold block leading-tight">Arranged Sequence</span>
            <span className="text-[10px] text-indigo-700 block">Step-by-step progress</span>
          </div>
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

        {/* Setting filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {([
            { id: 'all', label: 'All Settings' },
            { id: 'public place', label: 'Public Place' },
            { id: 'school', label: 'School' },
            { id: 'online', label: 'Online' },
          ] as const).map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setSelectedSetting(st.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition whitespace-nowrap cursor-pointer border ${
                selectedSetting === st.id
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st.label}
            </button>
          ))}
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
            🗣️ Spoken Practice
          </button>
          <button
            type="button"
            onClick={() => setApproachFilter('non-verbal')}
            className={`flex-1 py-1 rounded-lg transition cursor-pointer ${
              approachFilter === 'non-verbal' ? 'bg-slate-100 font-semibold text-slate-900' : 'hover:text-slate-700'
            }`}
          >
            ✋ Gestures & Micro
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
                  ? 'ring-1 shadow-2xs' 
                  : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
              }`}
              style={isTodayActive ? { borderColor: 'var(--color-theme-primary)' } : undefined}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${difficultyColors[item.difficulty]}`}>
                    {item.difficulty}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                    {item.setting || 'public place'}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.estimatedTime}
                  </span>
                  {item.language && (
                    <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                      {item.language}
                    </span>
                  )}
                  {item.isCustom && (
                    <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-1">
                      {item.isPublic ? <Globe2 className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                      <span>Custom</span>
                    </span>
                  )}
                  {item.isAiGenerated && (
                    <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                      AI Generated
                    </span>
                  )}
                  {isTodayActive && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.2 rounded border"
                      style={{
                        color: 'var(--color-theme-primary)',
                        borderColor: 'var(--color-theme-primary)',
                      }}
                    >
                      Active
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

              {/* Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0 self-center">
                {item.isCustom && onEditCustom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCustom(item);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    title="Edit custom challenge"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}

                {item.isCustom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCustom(item.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Delete custom challenge"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition" />
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <Compass className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">No challenges found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting your filters or create a custom one.</p>
          </div>
        )}
      </div>

    </div>
  );
};
