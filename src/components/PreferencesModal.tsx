import React, { useState, useEffect } from 'react';
import { X, Check, Globe, Sparkles, Sliders, MessageSquare, Compass, ShieldAlert } from 'lucide-react';
import { UserPreferences, ProficiencyLevel, DifficultyPreference } from '../types';
import { LANGUAGE_PACKS } from '../data/foreignPhrases';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSave: (prefs: UserPreferences) => void;
}

const PROFICIENCY_OPTIONS: ProficiencyLevel[] = [
  'Absolute Beginner',
  'Advanced Beginner',
  'Intermediate',
  'Advanced',
];

const DIFFICULTY_OPTIONS: { id: DifficultyPreference; label: string; desc: string }[] = [
  { id: 'Gentle', label: 'Gentle (Low Stakes)', desc: 'Micro-greetings, pointing, single words, zero pressure' },
  { id: 'Brave', label: 'Brave (Comfort Stretch)', desc: 'Asking recommendations, learner confession, short requests' },
  { id: 'Bold', label: 'Bold (Social Leap)', desc: 'Spontaneous compliments, cultural exchange, longer dialogue' },
  { id: 'Adaptive', label: 'Adaptive (Gradual)', desc: 'Mix challenges starting easy and adapting to your comfort' },
];

const TOPIC_PRESETS = [
  'Coffee & Cafés',
  'Food & Markets',
  'Everyday Errands',
  'Transit & Exploring',
  'Books & Study',
  'Arts & Culture',
  'Small Talk & Weather',
  'Tech & Work',
];

const SETTING_PRESETS = [
  'Relaxed neighborhood bakery or quiet coffee shop',
  'Bustling farmers market or grocery store',
  'Public park or walking trail',
  'Library or quiet study space',
  'Subway or bus station',
  'Artisan shop or bookstore',
];

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSave,
}) => {
  const [language, setLanguage] = useState(preferences.language);
  const [proficiency, setProficiency] = useState<ProficiencyLevel>(preferences.proficiency);
  const [topics, setTopics] = useState<string[]>(preferences.topics || []);
  const [difficultyPreference, setDifficultyPreference] = useState<DifficultyPreference>(preferences.difficultyPreference);
  const [socialSettings, setSocialSettings] = useState(preferences.socialSettings || '');
  const [communityContext, setCommunityContext] = useState(preferences.communityContext || '');
  const [customTopicInput, setCustomTopicInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLanguage(preferences.language);
      setProficiency(preferences.proficiency);
      setTopics(preferences.topics || []);
      setDifficultyPreference(preferences.difficultyPreference);
      setSocialSettings(preferences.socialSettings || '');
      setCommunityContext(preferences.communityContext || '');
    }
  }, [isOpen, preferences]);

  if (!isOpen) return null;

  const toggleTopic = (topic: string) => {
    if (topics.includes(topic)) {
      setTopics(topics.filter(t => t !== topic));
    } else {
      setTopics([...topics, topic]);
    }
  };

  const handleAddCustomTopic = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customTopicInput.trim();
    if (trimmed && !topics.includes(trimmed)) {
      setTopics([...topics, trimmed]);
      setCustomTopicInput('');
    }
  };

  const handleSave = () => {
    const updated: UserPreferences = {
      language,
      proficiency,
      topics,
      difficultyPreference,
      socialSettings: socialSettings.trim() || 'Relaxed neighborhood café or quiet shop',
      communityContext: communityContext.trim() || 'Keep interactions polite, low-stakes, and friendly. Respect personal space.',
    };
    onSave(updated);
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
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-600" />
            <div>
              <h2 className="text-base font-serif font-bold text-slate-900">
                Practice Preferences
              </h2>
              <p className="text-[11px] text-slate-500">
                Tailor challenges to your comfort, language, and context
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

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          
          {/* 1. Language Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              Target Practice Language
            </label>
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGE_PACKS.map((pack) => {
                const isSelected = language.toLowerCase() === pack.name.toLowerCase();
                return (
                  <button
                    key={pack.code}
                    type="button"
                    onClick={() => setLanguage(pack.name)}
                    className={`flex items-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition cursor-pointer ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="text-sm">{pack.flag}</span>
                    <span className="truncate">{pack.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Proficiency Level */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Approximate Proficiency Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PROFICIENCY_OPTIONS.map((level) => {
                const isSelected = proficiency === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setProficiency(level)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{level}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Preferred Challenge Difficulty */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Comfort & Difficulty Level
            </label>
            <div className="space-y-1.5">
              {DIFFICULTY_OPTIONS.map((diff) => {
                const isSelected = difficultyPreference === diff.id;
                return (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setDifficultyPreference(diff.id)}
                    className={`w-full p-2.5 rounded-xl text-left border transition cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-sky-50 border-sky-300 text-sky-950'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                      isSelected ? 'border-sky-600 bg-sky-600' : 'border-slate-300'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="text-xs font-semibold block">{diff.label}</span>
                      <span className="text-[11px] text-slate-500">{diff.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Topics or Interests */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Topics & Interests
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {TOPIC_PRESETS.map((t) => {
                const isSelected = topics.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTopic(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {t}
                  </button>
                );
              })}
            </div>
            {/* Custom topic input */}
            <form onSubmit={handleAddCustomTopic} className="flex gap-1.5">
              <input
                type="text"
                value={customTopicInput}
                onChange={(e) => setCustomTopicInput(e.target.value)}
                placeholder="Add other topic (e.g. Vintage clothes)..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>

          {/* 5. Optional Social Setting & Community Context */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-sky-600" />
                Optional Social Setting
              </label>
              <p className="text-[11px] text-slate-500 mb-1.5">
                Where do you plan to practice today?
              </p>
              <input
                type="text"
                value={socialSettings}
                onChange={(e) => setSocialSettings(e.target.value)}
                placeholder="e.g. Quiet neighborhood bakery or public library"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-400 mb-1.5"
              />
              <div className="flex flex-wrap gap-1">
                {SETTING_PRESETS.slice(0, 3).map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSocialSettings(p)}
                    className="text-[10px] text-slate-500 hover:text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md cursor-pointer truncate max-w-full"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                Community Context & Cultural Norms
              </label>
              <p className="text-[11px] text-slate-500 mb-1.5">
                Social norms vary everywhere. Add any specific context for your area (general, respectful, and fully editable).
              </p>
              <textarea
                value={communityContext}
                onChange={(e) => setCommunityContext(e.target.value)}
                rows={2}
                placeholder="e.g., In this neighborhood, people appreciate a soft greeting before asking for directions. Respect personal space."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-400 resize-none"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            Save Preferences
          </button>
        </div>

      </div>
    </div>
  );
};
