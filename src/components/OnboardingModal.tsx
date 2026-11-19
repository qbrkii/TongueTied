import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  HeartHandshake,
  Globe,
  Palette,
  Sliders,
  Layout,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import {
  ColorTheme,
  DifficultyPreference,
  DisplayFormat,
  ProficiencyLevel,
  ThemePreferences,
  UserPreferences,
} from '../types';
import { LANGUAGE_PACKS } from '../data/foreignPhrases';
import { COLOR_THEME_LIST, getThemeConfig } from '../utils/theme';

interface OnboardingModalProps {
  isOpen: boolean;
  initialAccountName: string;
  initialPreferences: UserPreferences;
  initialThemePreferences: ThemePreferences;
  onCommitLanguage: (language: string) => void;
  onCommitTheme: (theme: ThemePreferences) => void;
  onCommitProfileAndPreferences: (displayName: string, prefs: UserPreferences) => void;
  onComplete: () => void;
}

const PROFICIENCY_OPTIONS: { id: ProficiencyLevel; desc: string }[] = [
  { id: 'Absolute Beginner', desc: 'Just a few words or gestures' },
  { id: 'Advanced Beginner', desc: 'Short polite phrases' },
  { id: 'Intermediate', desc: 'Brief everyday exchanges' },
  { id: 'Advanced', desc: 'Conversational, building ease' },
];

const DIFFICULTY_OPTIONS: { id: DifficultyPreference; label: string; desc: string }[] = [
  { id: 'Gentle', label: 'Gentle', desc: 'Tiny low-risk moments (hold a door, brief greeting)' },
  { id: 'Brave', label: 'Brave', desc: 'Short exchanges (ask directions, small talk)' },
  { id: 'Bold', label: 'Bold', desc: 'Real conversations (share a story, join a group)' },
  { id: 'Adaptive', label: 'Adaptive', desc: 'Start gentle and grow gradually' },
];

const TOPIC_OPTIONS = [
  'Coffee & Cafés',
  'Food & Markets',
  'Everyday Errands',
  'Transit & Exploring',
  'School & Campus',
  'Arts & Culture',
  'Small Talk & Weather',
  'Online Communities',
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  initialAccountName,
  initialPreferences,
  initialThemePreferences,
  onCommitLanguage,
  onCommitTheme,
  onCommitProfileAndPreferences,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Slide 1: Mandatory Language selection (pre-fills guest selection if available, still requires active commit)
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    initialPreferences.language || ''
  );

  // Slide 2: Appearance selection (updates live preview & commits)
  const [draftTheme, setDraftTheme] = useState<ThemePreferences>(initialThemePreferences);

  // Slide 3: Profile & Practice Preferences
  const [draftName, setDraftName] = useState<string>(initialAccountName || 'Explorer');
  const [draftProficiency, setDraftProficiency] = useState<ProficiencyLevel>(
    initialPreferences.proficiency
  );
  const [draftDifficulty, setDraftDifficulty] = useState<DifficultyPreference>(
    initialPreferences.difficultyPreference
  );
  const [draftTopics, setDraftTopics] = useState<string[]>(initialPreferences.topics || []);
  const [draftSocialSetting, setDraftSocialSetting] = useState<string>(
    initialPreferences.socialSettings || ''
  );

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedLanguage(initialPreferences.language || '');
      setDraftTheme(initialThemePreferences);
      setDraftName(initialAccountName || 'Explorer');
      setDraftProficiency(initialPreferences.proficiency);
      setDraftDifficulty(initialPreferences.difficultyPreference);
      setDraftTopics(initialPreferences.topics || []);
      setDraftSocialSetting(initialPreferences.socialSettings || '');
    }
  }, [isOpen, initialAccountName, initialPreferences, initialThemePreferences]);

  if (!isOpen) return null;

  const activeTheme = getThemeConfig(draftTheme.colorTheme);
  const isCompact = draftTheme.displayFormat === 'compact';

  const handleToggleTopic = (topic: string) => {
    setDraftTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  // Slide 1 commit (mandatory)
  const handleContinueFromLanguage = () => {
    if (!selectedLanguage) return;
    onCommitLanguage(selectedLanguage);
    setStep(2);
  };

  // Slide 2 commit or skip
  const handleSelectColor = (colorTheme: ColorTheme) => {
    const next: ThemePreferences = { ...draftTheme, colorTheme };
    setDraftTheme(next);
    onCommitTheme(next);
  };

  const handleSelectFormat = (displayFormat: DisplayFormat) => {
    const next: ThemePreferences = { ...draftTheme, displayFormat };
    setDraftTheme(next);
    onCommitTheme(next);
  };

  const handleContinueFromAppearance = () => {
    onCommitTheme(draftTheme);
    setStep(3);
  };

  const handleSkipAppearance = () => {
    setStep(3);
  };

  // Slide 3 commit or skip
  const handleFinishWithSettings = () => {
    onCommitProfileAndPreferences(draftName.trim() || 'Explorer', {
      ...initialPreferences,
      language: selectedLanguage || initialPreferences.language,
      proficiency: draftProficiency,
      difficultyPreference: draftDifficulty,
      topics: draftTopics.length > 0 ? draftTopics : initialPreferences.topics,
      socialSettings:
        draftSocialSetting.trim() ||
        initialPreferences.socialSettings ||
        'Neighborhood café, school, or online',
    });
    onComplete();
  };

  const handleSkipSettings = () => {
    onCommitLanguage(selectedLanguage || initialPreferences.language);
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto transition-colors duration-300 animate-fade-in"
      style={{ backgroundColor: activeTheme.bgHex }}
    >
      <div
        className={`min-h-screen max-w-xl mx-auto flex flex-col justify-between text-slate-800 ${
          isCompact ? 'px-4 py-5' : 'px-6 py-8 sm:py-12'
        }`}
      >
        {/* Top Progress Header */}
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
                style={{ backgroundColor: activeTheme.hex }}
              >
                <HeartHandshake className="w-4 h-4" />
              </div>
              <span className="font-serif font-bold text-base text-slate-900">
                Set Up Your Profile
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500">
                Step {step} of 3
              </span>
              {(step === 2 || step === 3) && (
                <button
                  type="button"
                  onClick={step === 2 ? handleSkipAppearance : handleSkipSettings}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline underline-offset-2 cursor-pointer"
                >
                  Skip
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: idx <= step ? activeTheme.hex : '#e2e8f0',
                }}
              />
            ))}
          </div>
        </header>

        {/* FULL-PAGE PROFILE SETTING SLIDES */}
        <main className="flex-1 flex flex-col justify-center py-6 sm:py-8">
          {/* SLIDE 1: MANDATORY LANGUAGE COMMIT */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <div
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                  style={{ color: activeTheme.hex }}
                >
                  <Globe className="w-4 h-4" />
                  <span>Required · Profile Language</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight">
                  Save your practice language{initialAccountName ? `, ${initialAccountName}` : ''}.
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Confirm or pick the language you want synced to your account for comfort phrases and personalized challenges.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {LANGUAGE_PACKS.map((pack) => {
                  const isSelected =
                    selectedLanguage.toLowerCase() === pack.name.toLowerCase();
                  return (
                    <button
                      key={pack.code}
                      type="button"
                      onClick={() => setSelectedLanguage(pack.name)}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-center gap-3 relative ${
                        isSelected
                          ? 'bg-white shadow-sm ring-2'
                          : 'bg-white/90 border-slate-200 hover:border-slate-300 hover:bg-white'
                      }`}
                      style={
                        isSelected
                          ? {
                              borderColor: activeTheme.hex,
                              boxShadow: `0 0 0 2px ${activeTheme.hex}30`,
                            }
                          : undefined
                      }
                    >
                      <span className="text-2xl shrink-0">{pack.flag}</span>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-bold text-slate-900 block truncate">
                          {pack.name}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {pack.nativeName}
                        </span>
                      </div>
                      {isSelected && (
                        <div
                          className="w-5 h-5 rounded-full text-white flex items-center justify-center shrink-0"
                          style={{ backgroundColor: activeTheme.hex }}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {!selectedLanguage && (
                <p className="text-xs text-slate-500 italic">
                  Tap any language above to commit it to your profile.
                </p>
              )}
            </div>
          )}

          {/* SLIDE 2: APPEARANCE (FULL PAGE, LIVE COMMIT, SKIPPABLE) */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <div
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                  style={{ color: activeTheme.hex }}
                >
                  <Palette className="w-4 h-4" />
                  <span>Optional · Appearance & Layout</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight">
                  Make the app feel calm to you.
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Watch the colors and spacing change live as you choose. Commit your look or skip for now.
                </p>
              </div>

              {/* Color Themes */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  Color Theme
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {COLOR_THEME_LIST.map((theme) => {
                    const isSelected = draftTheme.colorTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => handleSelectColor(theme.id)}
                        className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'bg-white shadow-sm ring-2'
                            : 'bg-white/90 border-slate-200 hover:bg-white'
                        }`}
                        style={
                          isSelected
                            ? {
                                borderColor: theme.hex,
                                boxShadow: `0 0 0 2px ${theme.hex}30`,
                              }
                            : undefined
                        }
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: theme.hex }}
                        >
                          {isSelected && <Check className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-slate-900 block truncate">
                            {theme.name}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {theme.subtitle}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Display Format */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5" />
                  <span>Display Format</span>
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {(['comfortable', 'compact'] as const).map((fmt) => {
                    const isSelected = draftTheme.displayFormat === fmt;
                    return (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => handleSelectFormat(fmt)}
                        className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                          isSelected
                            ? 'bg-white shadow-sm ring-2'
                            : 'bg-white/90 border-slate-200 hover:bg-white'
                        }`}
                        style={
                          isSelected
                            ? {
                                borderColor: activeTheme.hex,
                                boxShadow: `0 0 0 2px ${activeTheme.hex}30`,
                              }
                            : undefined
                        }
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-slate-900 capitalize">
                            {fmt}
                          </span>
                          {isSelected && (
                            <div
                              className="w-4 h-4 rounded-full text-white flex items-center justify-center"
                              style={{ backgroundColor: activeTheme.hex }}
                            >
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {fmt === 'comfortable'
                            ? 'Spacious whitespace and gentle pacing'
                            : 'Tighter margins and denser layout'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: PROFILE & PRACTICE PREFERENCES (FULL PAGE, SKIPPABLE) */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-1.5">
                <div
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                  style={{ color: activeTheme.hex }}
                >
                  <Sliders className="w-4 h-4" />
                  <span>Optional · Profile & Comfort Settings</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight">
                  Tune challenges to your pace.
                </h1>
                <p className="text-sm text-slate-600">
                  Save your display name and comfort preferences to your account—or skip right ahead.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-5">
                {/* Display Name */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 mb-1.5">
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Your Display Name</span>
                  </label>
                  <input
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder="e.g., Alex"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>

                {/* Proficiency */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                    Comfort with {selectedLanguage || initialPreferences.language}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PROFICIENCY_OPTIONS.map((opt) => {
                      const isSelected = draftProficiency === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDraftProficiency(opt.id)}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className="text-xs font-bold block">{opt.id}</span>
                          <span
                            className={`text-[10px] block mt-0.5 ${
                              isSelected ? 'text-slate-300' : 'text-slate-500'
                            }`}
                          >
                            {opt.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Challenge Difficulty */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                    Starting Challenge Level
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {DIFFICULTY_OPTIONS.map((opt) => {
                      const isSelected = draftDifficulty === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDraftDifficulty(opt.id)}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                            isSelected
                              ? 'bg-white ring-2'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                          style={
                            isSelected
                              ? {
                                  borderColor: activeTheme.hex,
                                  boxShadow: `0 0 0 2px ${activeTheme.hex}25`,
                                }
                              : undefined
                          }
                        >
                          <span className="text-xs font-bold text-slate-900 block">
                            {opt.label}
                          </span>
                          <span className="text-[10px] text-slate-500 block leading-snug mt-0.5">
                            {opt.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Topics */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Spaces & Interests</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {TOPIC_OPTIONS.map((t) => {
                      const isSelected = draftTopics.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleToggleTopic(t)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                            isSelected
                              ? 'text-white border-transparent'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                          style={
                            isSelected ? { backgroundColor: activeTheme.hex } : undefined
                          }
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Social Setting */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Where do you feel most comfortable trying?
                  </label>
                  <input
                    type="text"
                    value={draftSocialSetting}
                    onChange={(e) => setDraftSocialSetting(e.target.value)}
                    placeholder="e.g., Quiet neighborhood bakery, school hallway, online chat"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Navigation / Commit Buttons */}
        <footer className="pt-4 border-t border-slate-200/70 space-y-2.5">
          {step === 1 && (
            <button
              type="button"
              disabled={!selectedLanguage}
              onClick={handleContinueFromLanguage}
              className="w-full h-12 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
              style={{ backgroundColor: activeTheme.hex }}
            >
              <span>
                {selectedLanguage
                  ? `Commit ${selectedLanguage} & Continue`
                  : 'Choose a Language Above'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 2 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 h-12 rounded-2xl bg-white border border-slate-200 text-slate-700 font-medium text-sm flex items-center gap-1.5 hover:bg-slate-50 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleContinueFromAppearance}
                className="flex-1 h-12 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                style={{ backgroundColor: activeTheme.hex }}
              >
                <span>Commit Appearance & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 h-12 rounded-2xl bg-white border border-slate-200 text-slate-700 font-medium text-sm flex items-center gap-1.5 hover:bg-slate-50 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleFinishWithSettings}
                  className="flex-1 h-12 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                  style={{ backgroundColor: activeTheme.hex }}
                >
                  <Check className="w-4 h-4" />
                  <span>Save Profile & Continue</span>
                </button>
              </div>
              <button
                type="button"
                onClick={handleSkipSettings}
                className="text-xs text-slate-500 hover:text-slate-800 py-1.5 text-center cursor-pointer"
              >
                Skip these preferences and continue
              </button>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};
