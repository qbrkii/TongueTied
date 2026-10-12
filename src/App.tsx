/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Challenge, DiaryEntry, AppAccount } from './types';
import { 
  isOnboarded, setOnboarded, getAllChallenges, getCustomChallenges, 
  saveCustomChallenges, getTodayDateString, getActiveChallengeState, 
  saveActiveChallengeState, getSkippedIds, addSkippedId, 
  getDailyChallengeForDate, getDiaryEntries, saveOrUpdateEntry, 
  deleteDiaryEntry, ActiveChallengeState,
  subscribeToUserDiary, subscribeToUserCustomChallenges,
  syncLocalEntriesToFirestore, getCurrentAccount, saveCurrentAccount,
  getChosenLanguage, saveChosenLanguage
} from './utils/storage';
import { INITIAL_CHALLENGES } from './data/initialChallenges';
import { auth, onAuthStateChanged, User, doc, db, setDoc, deleteDoc } from './lib/firebase';
import { Navbar, NavTab } from './components/Navbar';
import { TodayView } from './components/TodayView';
import { DiaryView } from './components/DiaryView';
import { ProgressView } from './components/ProgressView';
import { ChallengesLibraryView } from './components/ChallengesLibraryView';
import { OnboardingModal } from './components/OnboardingModal';
import { ChallengeDetailModal } from './components/ChallengeDetailModal';
import { LogEntryModal } from './components/LogEntryModal';
import { EntryDetailModal } from './components/EntryDetailModal';
import { CustomChallengeModal } from './components/CustomChallengeModal';
import { ForeignPhraseHelperModal } from './components/ForeignPhraseHelperModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<NavTab>('today');
  const [todayDateStr, setTodayDateStr] = useState<string>(getTodayDateString());

  // Account & User State
  const [currentAccount, setCurrentAccount] = useState<AppAccount | null>(() => getCurrentAccount());
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // App Data State
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(true);
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [showPhraseModal, setShowPhraseModal] = useState<boolean>(false);
  const [chosenLanguage, setChosenLanguage] = useState<string>(() => getChosenLanguage());
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [activeChallengeState, setActiveState] = useState<ActiveChallengeState | null>(null);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);

  const handleSelectLanguage = (lang: string) => {
    setChosenLanguage(lang);
    saveChosenLanguage(lang);
  };

  // Modals & active selections
  const [detailChallenge, setDetailChallenge] = useState<Challenge | null>(null);
  const [logModalChallenge, setLogModalChallenge] = useState<Challenge | null>(null);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [readingEntry, setReadingEntry] = useState<DiaryEntry | null>(null);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  // Refresh entries for the current active account
  const refreshAccountData = useCallback((accountUid?: string) => {
    const entries = getDiaryEntries(accountUid);
    setDiaryEntries(entries);
  }, []);

  // Initial load
  useEffect(() => {
    const today = getTodayDateString();
    setTodayDateStr(today);

    // Onboarding check
    const onboarded = isOnboarded();
    setHasOnboarded(onboarded);
    if (!onboarded) {
      setShowOnboardingModal(true);
    }

    // Challenges & Entries
    const allCh = getAllChallenges();
    setChallenges(allCh);

    const initialAcc = getCurrentAccount();
    if (initialAcc) {
      refreshAccountData(initialAcc.uid);
    } else {
      // Default to guest/first local profile if none set
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
  }, [refreshAccountData]);

  // Firebase Auth sync listener (if signed into Firebase via Google or cloud)
  useEffect(() => {
    let unsubDiary: (() => void) | null = null;
    let unsubCustom: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Map to AppAccount
        const cloudAcc: AppAccount = {
          uid: user.uid,
          email: user.email || 'cloud-user@tonguetied.app',
          displayName: user.displayName || user.email?.split('@')[0] || 'Explorer',
          createdAt: Date.now(),
        };
        saveCurrentAccount(cloudAcc);
        setCurrentAccount(cloudAcc);

        // Sync local caches to Firestore
        await syncLocalEntriesToFirestore(user.uid);

        // Subscribe to remote real-time updates
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
  }, [challenges, activeChallengeState, todayDateStr, skippedIds]);

  // Today's entry if logged
  const todayEntry = useMemo<DiaryEntry | null>(() => {
    return diaryEntries.find(e => e.date === todayDateStr) || null;
  }, [diaryEntries, todayDateStr]);

  // Account switching handler
  const handleSelectAccount = (acc: AppAccount) => {
    saveCurrentAccount(acc);
    setCurrentAccount(acc);
    refreshAccountData(acc.uid);
  };

  const handleSignOutAccount = () => {
    saveCurrentAccount(null);
    setCurrentAccount(null);
    // Switch to clean guest or default
    const guestAcc: AppAccount = {
      uid: 'guest_' + Math.random().toString(36).substring(2, 8),
      email: 'guest@tonguetied.app',
      displayName: 'Guest',
      isGuest: true,
      createdAt: Date.now(),
    };
    saveCurrentAccount(guestAcc);
    setCurrentAccount(guestAcc);
    refreshAccountData(guestAcc.uid);
  };

  // Handlers
  const handleCompleteOnboarding = () => {
    setOnboarded(true);
    setHasOnboarded(true);
    setShowOnboardingModal(false);
  };

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

  const handleSwapChallenge = () => {
    addSkippedId(todayDateStr, currentDailyChallenge.id);
    const updatedSkipped = [...skippedIds, currentDailyChallenge.id];
    setSkippedIds(updatedSkipped);

    const nextPicked = getDailyChallengeForDate(todayDateStr, challenges, updatedSkipped);
    const updatedState: ActiveChallengeState = {
      date: todayDateStr,
      challengeId: nextPicked.id,
      isAccepted: false,
    };
    setActiveState(updatedState);
    saveActiveChallengeState(updatedState);
  };

  const handleSelectChallengeFromLibrary = (challenge: Challenge) => {
    setDetailChallenge(challenge);
  };

  const handleSaveEntry = (entry: DiaryEntry): { success: boolean; error?: string } => {
    const activeUid = currentAccount?.uid;
    const res = saveOrUpdateEntry(entry, activeUid);
    if (res.success) {
      const updatedList = getDiaryEntries(activeUid);
      setDiaryEntries(updatedList);

      // If this matches today's challenge, mark as accepted
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

  const handleAddCustomChallenge = (newChallenge: Challenge) => {
    const customList = getCustomChallenges();
    const updatedCustom = [newChallenge, ...customList];
    saveCustomChallenges(updatedCustom);
    setChallenges(getAllChallenges());

    if (currentAccount?.uid) {
      const chRef = doc(db, 'users', currentAccount.uid, 'customChallenges', newChallenge.id);
      setDoc(chRef, { ...newChallenge, userId: currentAccount.uid }, { merge: true }).catch(err => {
        console.warn('Error saving custom challenge to cloud:', err);
      });
    }
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

  return (
    <div className="min-h-screen bg-[#F7F9FA] text-slate-800 flex flex-col font-sans selection:bg-sky-100">
      
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onChangeTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAbout={() => setShowOnboardingModal(true)}
        onOpenPhrases={() => setShowPhraseModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        currentAccount={currentAccount}
        hasActiveChallenge={Boolean(activeChallengeState?.isAccepted && !todayEntry)}
        entriesCount={diaryEntries.length}
        chosenLanguage={chosenLanguage}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 pt-4 pb-20">
        
        {currentTab === 'today' && (
          <TodayView
            todayDateStr={todayDateStr}
            challenge={currentDailyChallenge}
            isAccepted={Boolean(activeChallengeState?.isAccepted)}
            todayEntry={todayEntry}
            onAccept={handleAcceptChallenge}
            onSwapChallenge={handleSwapChallenge}
            onOpenDetail={() => setDetailChallenge(currentDailyChallenge)}
            onLogExperience={() => {
              setEditingEntry(null);
              setLogModalChallenge(currentDailyChallenge);
            }}
            onViewEntry={(entry) => setReadingEntry(entry)}
            onOpenPhrases={() => setShowPhraseModal(true)}
          />
        )}

        {currentTab === 'diary' && (
          <DiaryView
            entries={diaryEntries}
            onSelectEntry={(entry) => setReadingEntry(entry)}
            onNewEntry={() => {
              setEditingEntry(null);
              setLogModalChallenge(currentDailyChallenge);
            }}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressView 
            entries={diaryEntries} 
            chosenLanguage={chosenLanguage}
            onChangeChosenLanguage={handleSelectLanguage}
            onGoToToday={() => setCurrentTab('today')}
          />
        )}

        {currentTab === 'challenges' && (
          <ChallengesLibraryView
            challenges={challenges}
            onSelectChallenge={handleSelectChallengeFromLibrary}
            onOpenCreateCustom={() => setShowCustomModal(true)}
            onDeleteCustom={handleDeleteCustomChallenge}
            activeChallengeId={currentDailyChallenge.id}
          />
        )}

      </main>

      {/* Modals */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        chosenLanguage={chosenLanguage}
        onSelectLanguage={handleSelectLanguage}
        onComplete={handleCompleteOnboarding}
      />

      <ChallengeDetailModal
        challenge={detailChallenge}
        isOpen={Boolean(detailChallenge)}
        onClose={() => setDetailChallenge(null)}
        isCurrentDaily={Boolean(detailChallenge && detailChallenge.id === currentDailyChallenge.id)}
        isAccepted={Boolean(activeChallengeState?.isAccepted && activeChallengeState.challengeId === detailChallenge?.id)}
        isCompletedToday={Boolean(todayEntry && todayEntry.challengeId === detailChallenge?.id)}
        onAccept={() => {
          if (detailChallenge) {
            const updated: ActiveChallengeState = {
              date: todayDateStr,
              challengeId: detailChallenge.id,
              isAccepted: true,
              acceptedAt: Date.now(),
            };
            setActiveState(updated);
            saveActiveChallengeState(updated);
            setDetailChallenge(null);
          }
        }}
        onSwapChallenge={() => {
          handleSwapChallenge();
          setDetailChallenge(null);
        }}
        onSetAsDaily={() => {
          if (detailChallenge) {
            const updatedState: ActiveChallengeState = {
              date: todayDateStr,
              challengeId: detailChallenge.id,
              isAccepted: false,
            };
            setActiveState(updatedState);
            saveActiveChallengeState(updatedState);
            setDetailChallenge(null);
            setCurrentTab('today');
          }
        }}
        onLogExperience={() => {
          if (detailChallenge) {
            setLogModalChallenge(detailChallenge);
            setEditingEntry(null);
          }
        }}
        onOpenPhrases={() => {
          setShowPhraseModal(true);
        }}
      />

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
          chosenLanguage={chosenLanguage}
          onSave={handleSaveEntry}
        />
      )}

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

      <CustomChallengeModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onSave={handleAddCustomChallenge}
      />

      <ForeignPhraseHelperModal
        isOpen={showPhraseModal}
        onClose={() => setShowPhraseModal(false)}
        chosenLanguage={chosenLanguage}
        onSelectLanguage={handleSelectLanguage}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentAccount={currentAccount}
        onSelectAccount={handleSelectAccount}
        onSignOutAccount={handleSignOutAccount}
      />

    </div>
  );
}
