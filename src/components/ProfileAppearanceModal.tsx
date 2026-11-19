import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Palette,
  Layout,
  Check,
  RotateCcw,
  CheckCircle2,
  LogOut,
  LogIn,
  Mail,
  CloudCheck,
} from 'lucide-react';
import { AppAccount, ThemePreferences, ColorTheme, DisplayFormat } from '../types';
import { COLOR_THEME_LIST, getThemeConfig } from '../utils/theme';

interface ProfileAppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccount: AppAccount | null;
  themePreferences: ThemePreferences;
  onUpdateProfileName: (name: string) => void;
  onSaveTheme: (prefs: ThemePreferences) => void;
  onResetToDefaultAppearance: () => void;
  onSignOut: () => void;
  onOpenAuth?: () => void;
  practiceLanguage?: string;
  completedCount?: number;
  currentStreak?: number;
}

export const ProfileAppearanceModal: React.FC<ProfileAppearanceModalProps> = ({
  isOpen,
  onClose,
  currentAccount,
  themePreferences,
  onUpdateProfileName,
  onSaveTheme,
  onResetToDefaultAppearance,
  onSignOut,
  onOpenAuth,
  practiceLanguage = 'Spanish',
  completedCount = 0,
  currentStreak = 0,
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'profile'>('appearance');
  const [editingName, setEditingName] = useState(currentAccount?.displayName || 'Explorer');
  const [nameSavedNotice, setNameSavedNotice] = useState(false);

  useEffect(() => {
    if (currentAccount?.displayName) {
      setEditingName(currentAccount.displayName);
    }
  }, [currentAccount?.displayName]);

  if (!isOpen) return null;

  const currentThemeConfig = getThemeConfig(themePreferences.colorTheme);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingName.trim()) {
      onUpdateProfileName(editingName.trim());
      setNameSavedNotice(true);
      setTimeout(() => setNameSavedNotice(false), 2200);
    }
  };

  const handleSelectTheme = (themeId: ColorTheme) => {
    onSaveTheme({
      ...themePreferences,
      colorTheme: themeId,
    });
  };

  const handleSelectFormat = (format: DisplayFormat) => {
    onSaveTheme({
      ...themePreferences,
      displayFormat: format,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 text-slate-800 relative flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90">
          <div>
            <h2 className="text-base font-serif font-bold text-slate-900">
              Profile & Appearance
            </h2>
            <p className="text-[11px] text-slate-500">
              Customize colors, layout density, and your account
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'appearance'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Appearance & Themes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Account & Profile</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* TAB 1: APPEARANCE & THEMES */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Live Active Status Summary */}
              <div
                className="p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-2"
                style={{
                  backgroundColor: currentThemeConfig.bgHex,
                  borderColor: currentThemeConfig.hex + '40',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs font-serif font-bold text-sm"
                    style={{ backgroundColor: currentThemeConfig.hex }}
                  >
                    Tt
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Active: {currentThemeConfig.name}
                    </span>
                    <span className="text-[11px] text-slate-600 block">
                      {themePreferences.displayFormat === 'comfortable'
                        ? 'Comfortable (Spacious)'
                        : 'Compact (Dense)'}{' '}
                      • Applied across app
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onResetToDefaultAppearance}
                  className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer shadow-2xs shrink-0"
                  title="Reset to default theme & format"
                >
                  <RotateCcw className="w-3 h-3 text-slate-500" />
                  <span>Reset Default</span>
                </button>
              </div>

              {/* 1. App Color Theme Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-slate-500" />
                    <span>App Color Theme</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Changes background, buttons, badges & navigation
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {COLOR_THEME_LIST.map((theme) => {
                    const isSelected = themePreferences.colorTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => handleSelectTheme(theme.id)}
                        className={`p-3.5 rounded-2xl border transition text-left cursor-pointer flex items-center gap-3 relative ${
                          isSelected
                            ? 'bg-white shadow-sm ring-2'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                        style={{
                          borderColor: isSelected ? theme.hex : undefined,
                          boxShadow: isSelected ? `0 0 0 2px ${theme.hex}30` : undefined,
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-xs"
                          style={{ backgroundColor: theme.hex }}
                        >
                          {isSelected && <Check className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 block truncate">
                              {theme.name}
                            </span>
                            {isSelected && (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: theme.hex + '18',
                                  color: theme.hex,
                                }}
                              >
                                Active
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block leading-tight mt-0.5 truncate">
                            {theme.subtitle}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Display Format Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Layout className="w-3.5 h-3.5 text-slate-500" />
                    <span>Display Format</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Controls spacing & density
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectFormat('comfortable')}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer relative ${
                      themePreferences.displayFormat === 'comfortable'
                        ? 'bg-white shadow-sm ring-2'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                    style={{
                      borderColor:
                        themePreferences.displayFormat === 'comfortable'
                          ? currentThemeConfig.hex
                          : undefined,
                      boxShadow:
                        themePreferences.displayFormat === 'comfortable'
                          ? `0 0 0 2px ${currentThemeConfig.hex}30`
                          : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900">Comfortable</span>
                      {themePreferences.displayFormat === 'comfortable' && (
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: currentThemeConfig.hex }}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block leading-relaxed">
                      Generous breathing room, relaxed whitespace, larger readable typography
                    </span>
                    <div className="mt-3 flex gap-1 items-center">
                      <div className="w-6 h-2 rounded-full bg-slate-200" />
                      <div className="w-10 h-2 rounded-full bg-slate-200" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectFormat('compact')}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer relative ${
                      themePreferences.displayFormat === 'compact'
                        ? 'bg-white shadow-sm ring-2'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                    style={{
                      borderColor:
                        themePreferences.displayFormat === 'compact'
                          ? currentThemeConfig.hex
                          : undefined,
                      boxShadow:
                        themePreferences.displayFormat === 'compact'
                          ? `0 0 0 2px ${currentThemeConfig.hex}30`
                          : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900">Compact</span>
                      {themePreferences.displayFormat === 'compact' && (
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: currentThemeConfig.hex }}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block leading-relaxed">
                      High-density view, tighter margins, and streamlined controls
                    </span>
                    <div className="mt-3 flex gap-1 items-center">
                      <div className="w-4 h-1.5 rounded-full bg-slate-300" />
                      <div className="w-7 h-1.5 rounded-full bg-slate-300" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACCOUNT & PROFILE */}
          {activeTab === 'profile' && (
            currentAccount ? (
              <div className="space-y-5">
                {/* Profile Card */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0"
                      style={{ backgroundColor: currentThemeConfig.hex }}
                    >
                      {currentAccount.displayName
                        ? currentAccount.displayName.slice(0, 1).toUpperCase()
                        : 'E'}
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-slate-900 block truncate">
                        {currentAccount.displayName || 'Language Learner'}
                      </span>
                      {currentAccount.email && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{currentAccount.email}</span>
                        </span>
                      )}
                      <span className="text-[11px] text-emerald-700 flex items-center gap-1 mt-0.5 font-medium">
                        <CloudCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Cloud progress synced • {practiceLanguage}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-800 block">
                      {completedCount} Completed
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {currentStreak} day streak
                    </span>
                  </div>
                </div>

                {/* Edit Display Name */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Learner Profile
                    </span>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Your name is saved to your account along with your diary, challenges, phrases, and theme preferences.
                    </p>
                  </div>

                  <form onSubmit={handleSaveName} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder="e.g. Alex M."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                    </div>

                    {nameSavedNotice && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Name updated & synced to your account!</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full h-10 rounded-xl text-white font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                      style={{ backgroundColor: currentThemeConfig.hex }}
                    >
                      <span>Save Profile Name</span>
                    </button>
                  </form>
                </div>

                {/* Sign Out Action */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Switch or Sign Out
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Your reflections and progress stay safely stored in your account
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSignOut();
                    }}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-2xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/70 text-center space-y-4">
                <div
                  className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: currentThemeConfig.hex }}
                >
                  <UserIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    Save Your Progress
                  </h3>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                    Create a free account or sign in to save your diary reflections, track streaks, and personalize your cloud profile.
                  </p>
                </div>
                {onOpenAuth && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                    style={{ backgroundColor: currentThemeConfig.hex }}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In / Create Account</span>
                  </button>
                )}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onResetToDefaultAppearance}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            Reset to default
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
