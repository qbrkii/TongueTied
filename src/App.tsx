/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Challenge, DiaryEntry, AppAccount, UserPreferences, 
  ThemePreferences 
} from './types';
import { 
  isOnboarded, setOnboarded, getAllChallenges, getCustomChallenges, 
  saveCustomChallenges, updateCustomChallenge, getTodayDateString, 
  getActiveChallengeState, saveActiveChallengeState, getSkippedIds, 
  addSkippedId, getDailyChallengeForDate, getDiaryEntries, 
  saveOrUpdateEntry, deleteDiaryEntry, ActiveChallengeState,
  subscribeToUserDiary, subscribeToUserCustomChallenges,
  syncLocalEntriesToFirestore, getCurrentAccount, saveCurrentAccount,
  getUserPreferences, saveUserPreferences, getThemePreferences, 
  saveThemePreferences, getActiveSequence, saveActiveSequence,
  updateUserProfile
} from './utils/storage';
import { applyThemeToDocument, getThemeConfig, DEFAULT_THEME_PREFERENCES } from './utils/theme';
import { generateArrangedSequence } from './utils/aiGenerator';
import { INITIAL_CHALLENGES } from './data/initialChallenges';
import { auth, onAuthStateChanged, doc, db, setDoc, deleteDoc } from './lib/firebase';
import { TodayView } from './components/TodayView';
import { DiaryView } from './components/DiaryView';
import { ProgressView } from './components/ProgressView';
import { ChallengesLibraryView } from './components/ChallengesLibraryView';
import { NavigationHubModal } from './components/NavigationHubModal';
import { RandomAiModal } from './components/RandomAiModal';
import { CustomChallengeModal } from './components/CustomChallengeModal';
import { ForeignPhraseHelperModal } from './components/ForeignPhraseHelperModal';
import { PreferencesModal } from './components/PreferencesModal';
import { ProfileAppearanceModal } from './components/ProfileAppearanceModal';
import { ChallengeCreationHubModal } from './components/ChallengeCreationHubModal';
import { SequenceReviewModal } from './components/SequenceReviewModal';
import { LogEntryModal } from './components/LogEntryModal';
import { EntryDetailModal } from './components/EntryDetailModal';
import { OnboardingModal } from './components/OnboardingModal';

export type ActiveScreen = 'today' | 'diary' | 'progress' | 'library';

export default function App() {
  // Navigation: Main screen is 'today'. Other full screens: 'diary', 'progress', 'library'.
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('today');
  const [todayDateStr, setTodayDateStr] = useState<string>(getTodayDateString());

  // Preferences & Appearance
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => getUserPreferences());
  const [themePreferences, setThemePreferences] = useState<ThemePreferences>(() => getThemePreferences());

  // Account
  const [currentAccount, setCurrentAccount] = useState<AppAccount | null>(() => getCurrentAccount());

  // Modals & Navigation Hub
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showCreationHub, setShowCreationHub] = useState<boolean>(false);
  const [showRandomAiModal, setShowRandomAiModal] = useState<boolean>(false);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [showPhrasesModal, setShowPhrasesModal] = useState<boolean>(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState<boolean>(false);
  const [showProfileAppearanceModal, setShowProfileAppearanceModal] = useState<boolean>(false);
  const [showSequenceReviewModal, setShowSequenceReviewModal] = useState<boolean>(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);

  // Challenges, entries, sequences
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [activeChallengeState, setActiveState] = useState<ActiveChallengeState | null>(null);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [activeSequence, setActiveSequence] = useState<Challenge[] | null>(() => getActiveSequence());
  const [activeSequenceIndex, setActiveSequenceIndex] = useState<number>(0);

  // Active modal selections
  const [editingCustomChallenge, setEditingCustomChallenge] = useState<Challenge | null>(null);
  const [logModalChallenge, setLogModalChallenge] = useState<Challenge | null>(null);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [readingEntry, setReadingEntry] = useState<DiaryEntry | null>(null);

  // Refresh entries for the current active account
  const refreshAccountData = useCallback((accountUid?: string) => {
    const entries = getDiaryEntries(accountUid);
    setDiaryEntries(entries);
  }, []);

  // Sync theme changes immediately to document
  useEffect(() => {
    applyThemeToDocument(themePreferences);
  }, [themePreferences]);

  // Initial load
  useEffect(() => {
    const today = getTodayDateString();
    setTodayDateStr(today);

    // Apply saved theme on boot
    applyThemeToDocument(themePreferences);

    // Onboarding check
    const onboarded = isOnboarded();
    if (!onboarded) {
      setShowOnboardingModal(true);
    }

    // Challenges & Account
    const allCh = getAllChallenges();
    setChallenges(allCh);

    const initialAcc = getCurrentAccount();
    if (initialAcc) {
      refreshAccountData(initialAcc.uid);
    } else {
      const defaultAcc: AppAccount = {
        uid: 'usr_default',
        email: 'explorer@tonguetied.app',
        displayName: 'My Profile',
        createdAt: Date.now(),
      };
      saveCurrentAccount(defaultAcc);
      setCurrentAccount(defaultAcc);
      refreshAccountData(defaultAcc.uid);
    }

    // Skipped & Active
    const skipped = getSkippedIds(today);
    setSkippedIds(skipped);

    const savedActive = getActiveChallengeState();
    if (savedActive && savedActive.date === today) {
      setActiveState(savedActive);
    } else {
      const picked = getDailyChallengeForDate(today, allCh, skipped);
      const newState: ActiveChallengeState = {
        date: today,
        challengeId: picked.id,
        isAccepted: false,
      };
      setActiveState(newState);
      saveActiveChallengeState(newState);
    }

    // Saved sequence restore
    const seq = getActiveSequence();
    if (seq && seq.length > 0) {
      setActiveSequence(seq);
      const firstIncomplete = seq.findIndex(s => !s.completed);
      setActiveSequenceIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
    }
  }, [refreshAccountData]);

  // Firebase Auth sync listener
  useEffect(() => {
    let unsubDiary: (() => void) | null = null;
    let unsubCustom: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const cloudAcc: AppAccount = {
          uid: user.uid,
          email: user.email || 'cloud-user@tonguetied.app',
          displayName: user.displayName || user.email?.split('@')[0] || 'Explorer',
          createdAt: Date.now(),
        };
        saveCurrentAccount(cloudAcc);
        setCurrentAccount(cloudAcc);

        await syncLocalEntriesToFirestore(user.uid);

        if (unsubDiary) unsubDiary();
        if (unsubCustom) unsubCustom();

        unsubDiary = subscribeToUserDiary(user.uid, (entries) => {
          setDiaryEntries(entries);
        });

        unsubCustom = subscribeToUserCustomChallenges(user.uid, (customList) => {
          setChallenges([...INITIAL_CHALLENGES, ...customList]);
        });
      }
    });

    return () => {
      unsubAuth();
      if (unsubDiary) unsubDiary();
      if (unsubCustom) unsubCustom();
    };
  }, []);

  // Today's active challenge object
  const currentDailyChallenge = useMemo<Challenge>(() => {
    if (activeSequence && activeSequence.length > 0) {
      const currentStep = activeSequence[activeSequenceIndex];
      if (currentStep) return currentStep;
    }

    if (challenges.length === 0) {
      return {
        id: 'fallback',
        title: 'The Silent Order',
        difficulty: 'Gentle',
        estimatedTime: '5 mins',
        instructions: 'Order a coffee or snack using only gestures — no words allowed.',
        whyThisMatters: 'Feel what newcomers experience when navigating everyday errands.',
        practicalTip: 'Smile warmly and point to the menu items.',
        safetyNote: 'Be polite and choose a relaxed shop.',
      };
    }

    if (activeChallengeState && activeChallengeState.date === todayDateStr) {
      const match = challenges.find(c => c.id === activeChallengeState.challengeId);
      if (match) return match;
    }

    return getDailyChallengeForDate(todayDateStr, challenges, skippedIds);
  }, [challenges, activeChallengeState, todayDateStr, skippedIds, activeSequence, activeSequenceIndex]);

  // Today's entry if logged
  const todayEntry = useMemo<DiaryEntry | null>(() => {
    return diaryEntries.find(e => e.date === todayDateStr && e.challengeId === currentDailyChallenge.id) || 
           diaryEntries.find(e => e.date === todayDateStr) || 
           null;
  }, [diaryEntries, todayDateStr, currentDailyChallenge.id]);

  // Preferences & Appearance Save
  const handleSavePreferences = (newPrefs: UserPreferences) => {
    setUserPreferences(newPrefs);
    saveUserPreferences(newPrefs);
  };

  const handleSaveTheme = (newTheme: ThemePreferences) => {
    setThemePreferences(newTheme);
    saveThemePreferences(newTheme);
    applyThemeToDocument(newTheme);
  };

  const handleResetDefaultAppearance = () => {
    setThemePreferences(DEFAULT_THEME_PREFERENCES);
    saveThemePreferences(DEFAULT_THEME_PREFERENCES);
    applyThemeToDocument(DEFAULT_THEME_PREFERENCES);
  };

  // Profile name update
  const handleUpdateProfileName = (newName: string) => {
    const updated = updateUserProfile(newName);
    setCurrentAccount(updated);
  };

  // Streak calculation
  const currentStreak = useMemo(() => {
    if (diaryEntries.length === 0) return 0;
    const dates = new Set(diaryEntries.map(e => e.date).filter(Boolean));
    const now = new Date();
    let streak = 0;
    let checkDate = new Date(now);

    const formatLocalDate = (d: Date): string => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    let dateStr = formatLocalDate(checkDate);
    if (!dates.has(dateStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
      dateStr = formatLocalDate(checkDate);
      if (!dates.has(dateStr)) {
        return 0;
      }
    }

    while (dates.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
      dateStr = formatLocalDate(checkDate);
    }
    return streak;
  }, [diaryEntries]);

  // 1. Accept Challenge: starts it and shows next step
  const handleAcceptChallenge = () => {
    const updated: ActiveChallengeState = {
      date: todayDateStr,
      challengeId: currentDailyChallenge.id,
      isAccepted: true,
      acceptedAt: Date.now(),
    };
    setActiveState(updated);
    saveActiveChallengeState(updated);
  };

  // 2. Skip Challenge: loads another challenge without immediately repeating the skipped one, no penalty
  const handleSkipChallenge = () => {
    if (activeSequence && activeSequence.length > 0) {
      // Advance to next step in sequence, or complete
      if (activeSequenceIndex < activeSequence.length - 1) {
        setActiveSequenceIndex(activeSequenceIndex + 1);
      } else {
        // Exit sequence and pick new daily challenge
        setActiveSequence(null);
        saveActiveSequence(null);
      }
      return;
    }

    // Add current challenge ID to skipped list
    addSkippedId(todayDateStr, currentDailyChallenge.id);
    const updatedSkipped = [...skippedIds, currentDailyChallenge.id];
    setSkippedIds(updatedSkipped);

    // Pick next unskipped challenge
    const nextPicked = getDailyChallengeForDate(todayDateStr, challenges, updatedSkipped);
    const updatedState: ActiveChallengeState = {
      date: todayDateStr,
      challengeId: nextPicked.id,
      isAccepted: false,
    };
    setActiveState(updatedState);
    saveActiveChallengeState(updatedState);
  };

  // Use challenge from Random AI
  const handleUseRandomAiChallenge = (challenge: Challenge) => {
    // Add to library
    const updatedAll = [challenge, ...challenges];
    setChallenges(updatedAll);

    // Set as active on main screen
    const newState: ActiveChallengeState = {
      date: todayDateStr,
      challengeId: challenge.id,
      isAccepted: false,
    };
    setActiveState(newState);
    saveActiveChallengeState(newState);

    // Clear active sequence to focus on this single challenge
    setActiveSequence(null);
    saveActiveSequence(null);

    setCurrentScreen('today');
  };

  // Build AI-Arranged Sequence
  const handleGenerateArrangedSequence = async (count: number) => {
    setShowCreationHub(false);
    const seq = await generateArrangedSequence(userPreferences, count);
    setActiveSequence(seq);
    saveActiveSequence(seq);
    setActiveSequenceIndex(0);
    setShowSequenceReviewModal(true);
  };

  const handleStartActiveSequence = () => {
    if (activeSequence && activeSequence.length > 0) {
      const firstStep = activeSequence[0];
      const newState: ActiveChallengeState = {
        date: todayDateStr,
        challengeId: firstStep.id,
        isAccepted: false,
      };
      setActiveState(newState);
      saveActiveChallengeState(newState);
      setCurrentScreen('today');
    }
  };

  // Custom Challenge saving (create or edit)
  const handleSaveCustomChallenge = (challenge: Challenge) => {
    const customList = getCustomChallenges();
    const existingIndex = customList.findIndex(c => c.id === challenge.id);

    if (existingIndex >= 0) {
      updateCustomChallenge(challenge);
    } else {
      const updatedCustom = [challenge, ...customList];
      saveCustomChallenges(updatedCustom);
    }

    const allCh = getAllChallenges();
    setChallenges(allCh);

    // Set as active challenge
    const updatedState: ActiveChallengeState = {
      date: todayDateStr,
      challengeId: challenge.id,
      isAccepted: false,
    };
    setActiveState(updatedState);
    saveActiveChallengeState(updatedState);

    // Cloud sync
    if (currentAccount?.uid) {
      const chRef = doc(db, 'users', currentAccount.uid, 'customChallenges', challenge.id);
      setDoc(chRef, { ...challenge, userId: currentAccount.uid }, { merge: true }).catch(err => {
        console.warn('Error saving custom challenge to cloud:', err);
      });
    }

    setCurrentScreen('today');
  };

  const handleDeleteCustomChallenge = (id: string) => {
    const customList = getCustomChallenges().filter(c => c.id !== id);
    saveCustomChallenges(customList);
    const updatedAll = getAllChallenges();
    setChallenges(updatedAll);

    if (currentAccount?.uid) {
      const chRef = doc(db, 'users', currentAccount.uid, 'customChallenges', id);
      deleteDoc(chRef).catch(err => {
        console.warn('Error deleting custom challenge in cloud:', err);
      });
    }

    if (currentDailyChallenge.id === id) {
      const nextPicked = getDailyChallengeForDate(todayDateStr, updatedAll, skippedIds);
      const newState: ActiveChallengeState = {
        date: todayDateStr,
        challengeId: nextPicked.id,
        isAccepted: false,
      };
      setActiveState(newState);
      saveActiveChallengeState(newState);
    }
  };

  // Diary logging
  const handleSaveEntry = (entry: DiaryEntry): { success: boolean; error?: string } => {
    const activeUid = currentAccount?.uid;
    const res = saveOrUpdateEntry(entry, activeUid);
    if (res.success) {
      const updatedList = getDiaryEntries(activeUid);
      setDiaryEntries(updatedList);

      if (entry.date === todayDateStr) {
        const updatedActive: ActiveChallengeState = {
          date: todayDateStr,
          challengeId: entry.challengeId,
          isAccepted: true,
        };
        setActiveState(updatedActive);
        saveActiveChallengeState(updatedActive);
      }
    }
    return res;
  };

  const handleDeleteEntry = (id: string) => {
    const activeUid = currentAccount?.uid;
    deleteDiaryEntry(id, activeUid);
    setDiaryEntries(getDiaryEntries(activeUid));
    if (readingEntry?.id === id) {
      setReadingEntry(null);
    }
  };

  const handleToggleFavorite = (id: string) => {
    const entry = diaryEntries.find(e => e.id === id);
    if (!entry) return;
    const updated = { ...entry, isFavorite: !entry.isFavorite };
    handleSaveEntry(updated);
    if (readingEntry?.id === id) {
      setReadingEntry(updated);
    }
  };

  const themeConfig = getThemeConfig(themePreferences.colorTheme);
  const isCompact = themePreferences.displayFormat === 'compact';

  return (
    <div 
      data-theme={themePreferences.colorTheme}
      data-format={themePreferences.displayFormat}
      className="min-h-screen text-slate-800 flex flex-col font-sans transition-colors duration-300"
      style={{ backgroundColor: themeConfig.bgHex }}
    >
      
      {/* SCREEN 1: CLEAN MAIN SCREEN — Shows one challenge at a time with only Accept & Skip buttons */}
      {currentScreen === 'today' && (
        <TodayView
          challenge={currentDailyChallenge}
          isAccepted={Boolean(activeChallengeState?.isAccepted)}
          todayEntry={todayEntry}
          themePreferences={themePreferences}
          onAccept={handleAcceptChallenge}
          onSkip={handleSkipChallenge}
          onLogExperience={() => {
            setEditingEntry(null);
            setLogModalChallenge(currentDailyChallenge);
          }}
          onViewEntry={(entry) => setReadingEntry(entry)}
          onOpenMenu={() => setShowMenu(true)}
        />
      )}

      {/* SCREEN 2: SEPARATE DIARY SCREEN */}
      {currentScreen === 'diary' && (
        <div className={`max-w-lg mx-auto w-full transition-all duration-300 ${isCompact ? 'px-3 py-3' : 'px-5 py-6'}`}>
          <DiaryView
            entries={diaryEntries}
            onSelectEntry={(entry) => setReadingEntry(entry)}
            onNewEntry={() => {
              setEditingEntry(null);
              setLogModalChallenge(currentDailyChallenge);
            }}
            onToggleFavorite={handleToggleFavorite}
            onBackToToday={() => setCurrentScreen('today')}
          />
        </div>
      )}

      {/* SCREEN 3: SEPARATE PROGRESS & STREAK SCREEN */}
      {currentScreen === 'progress' && (
        <div className={`max-w-lg mx-auto w-full transition-all duration-300 ${isCompact ? 'px-3 py-3' : 'px-5 py-6'}`}>
          <ProgressView
            entries={diaryEntries}
            chosenLanguage={userPreferences.language}
            onChangeChosenLanguage={(lang) => {
              handleSavePreferences({ ...userPreferences, language: lang });
            }}
            onGoToToday={() => setCurrentScreen('today')}
          />
        </div>
      )}

      {/* SCREEN 4: SEPARATE CHALLENGES LIBRARY SCREEN */}
      {currentScreen === 'library' && (
        <div className={`max-w-lg mx-auto w-full transition-all duration-300 ${isCompact ? 'px-3 py-3' : 'px-5 py-6'}`}>
          <ChallengesLibraryView
            challenges={challenges}
            onSelectChallenge={(challenge) => {
              const updatedState: ActiveChallengeState = {
                date: todayDateStr,
                challengeId: challenge.id,
                isAccepted: false,
              };
              setActiveState(updatedState);
              saveActiveChallengeState(updatedState);
              setCurrentScreen('today');
            }}
            onOpenCreateCustom={() => {
              setEditingCustomChallenge(null);
              setShowCustomModal(true);
            }}
            onEditCustom={(challenge) => {
              setEditingCustomChallenge(challenge);
              setShowCustomModal(true);
            }}
            onDeleteCustom={handleDeleteCustomChallenge}
            onGenerateRandomAi={() => setShowRandomAiModal(true)}
            onOpenSequenceBuilder={() => setShowCreationHub(true)}
            activeChallengeId={currentDailyChallenge.id}
            onBackToToday={() => setCurrentScreen('today')}
          />
        </div>
      )}

      {/* NAVIGATION HUB / MENU MODAL */}
      <NavigationHubModal
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        preferences={userPreferences}
        themePreferences={themePreferences}
        currentAccount={currentAccount}
        diaryCount={diaryEntries.length}
        libraryCount={challenges.length}
        onOpenCreateCustom={() => {
          setEditingCustomChallenge(null);
          setShowCustomModal(true);
        }}
        onOpenRandomAi={() => setShowRandomAiModal(true)}
        onOpenSequenceBuilder={() => setShowCreationHub(true)}
        onOpenPhrases={() => setShowPhrasesModal(true)}
        onOpenPreferences={() => setShowPreferencesModal(true)}
        onOpenProfileAppearance={() => setShowProfileAppearanceModal(true)}
        onNavigateToDiary={() => setCurrentScreen('diary')}
        onNavigateToProgress={() => setCurrentScreen('progress')}
        onNavigateToLibrary={() => setCurrentScreen('library')}
      />

      {/* CREATE A CHALLENGE HUB (Custom, Random AI, Arranged Sequence) */}
      <ChallengeCreationHubModal
        isOpen={showCreationHub}
        onClose={() => setShowCreationHub(false)}
        preferences={userPreferences}
        onSelectCustom={() => {
          setEditingCustomChallenge(null);
          setShowCustomModal(true);
        }}
        onSelectRandomAi={() => setShowRandomAiModal(true)}
        onSelectArrangedSequence={handleGenerateArrangedSequence}
        onOpenPreferences={() => setShowPreferencesModal(true)}
      />

      {/* DEDICATED RANDOM AI MODAL (Live generation, loading state, retry on failure, real Gemini output) */}
      <RandomAiModal
        isOpen={showRandomAiModal}
        onClose={() => setShowRandomAiModal(false)}
        preferences={userPreferences}
        onUseChallenge={handleUseRandomAiChallenge}
      />

      {/* AI-ARRANGED SEQUENCE REVIEW */}
      {activeSequence && (
        <SequenceReviewModal
          isOpen={showSequenceReviewModal}
          onClose={() => setShowSequenceReviewModal(false)}
          sequence={activeSequence}
          onStartSequence={handleStartActiveSequence}
          onEditChallenge={(ch) => {
            setEditingCustomChallenge(ch);
            setShowCustomModal(true);
          }}
          onRegenerateStep={(idx) => {
            const updated = [...activeSequence];
            // regenerate step
            setActiveSequence(updated);
            saveActiveSequence(updated);
          }}
          onRemoveStep={(idx) => {
            if (activeSequence.length > 2) {
              const updated = activeSequence.filter((_, i) => i !== idx);
              setActiveSequence(updated);
              saveActiveSequence(updated);
            }
          }}
          onSaveToLibrary={(ch) => {
            handleSaveCustomChallenge({ ...ch, isCustom: true });
          }}
          onToggleCompleteStep={(idx) => {
            const updated = [...activeSequence];
            updated[idx] = { ...updated[idx], completed: !updated[idx].completed };
            setActiveSequence(updated);
            saveActiveSequence(updated);
          }}
        />
      )}

      {/* CUSTOM CHALLENGE MODAL (Write, edit, save, delete custom challenges) */}
      <CustomChallengeModal
        isOpen={showCustomModal}
        onClose={() => {
          setShowCustomModal(false);
          setEditingCustomChallenge(null);
        }}
        onSave={handleSaveCustomChallenge}
        editingChallenge={editingCustomChallenge}
        defaultLanguage={userPreferences.language}
      />

      {/* PHRASES & AUDIO HELPER (Save public/private phrases, play pronunciation) */}
      <ForeignPhraseHelperModal
        isOpen={showPhrasesModal}
        onClose={() => setShowPhrasesModal(false)}
        chosenLanguage={userPreferences.language}
        onSelectLanguage={(lang) => handleSavePreferences({ ...userPreferences, language: lang })}
      />

      {/* LANGUAGE & PREFERENCES MODAL */}
      <PreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        preferences={userPreferences}
        onSave={handleSavePreferences}
      />

      {/* PROFILE & APPEARANCE MODAL */}
      <ProfileAppearanceModal
        isOpen={showProfileAppearanceModal}
        onClose={() => setShowProfileAppearanceModal(false)}
        currentAccount={currentAccount}
        themePreferences={themePreferences}
        onUpdateProfileName={handleUpdateProfileName}
        onSaveTheme={handleSaveTheme}
        onResetToDefaultAppearance={handleResetDefaultAppearance}
        practiceLanguage={userPreferences.language}
        completedCount={diaryEntries.length}
        currentStreak={currentStreak}
      />

      {/* LOG DIARY ENTRY MODAL */}
      {logModalChallenge && (
        <LogEntryModal
          isOpen={Boolean(logModalChallenge)}
          onClose={() => {
            setLogModalChallenge(null);
            setEditingEntry(null);
          }}
          activeChallenge={logModalChallenge}
          allChallenges={challenges}
          existingEntry={editingEntry}
          chosenLanguage={userPreferences.language}
          onSave={handleSaveEntry}
        />
      )}

      {/* READ PAST ENTRY MODAL */}
      {readingEntry && (
        <EntryDetailModal
          entry={readingEntry}
          isOpen={Boolean(readingEntry)}
          onClose={() => setReadingEntry(null)}
          onEdit={(entry) => {
            setEditingEntry(entry);
            const foundCh = challenges.find(c => c.id === entry.challengeId) || currentDailyChallenge;
            setLogModalChallenge(foundCh);
          }}
          onDelete={handleDeleteEntry}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* FIRST-TIME ONBOARDING MODAL */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        chosenLanguage={userPreferences.language}
        onSelectLanguage={(lang) => handleSavePreferences({ ...userPreferences, language: lang })}
        onComplete={() => {
          setOnboarded(true);
          setShowOnboardingModal(false);
        }}
      />

    </div>
  );
}
