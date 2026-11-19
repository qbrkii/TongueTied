/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Challenge,
  DiaryEntry,
  AppAccount,
  UserPreferences,
  ThemePreferences,
  UsefulPhrase,
} from './types';
import {
  isGuestIntroDone,
  setGuestIntroDone,
  isOnboarded,
  setOnboarded,
  getCustomChallenges,
  saveCustomChallenges,
  updateCustomChallenge,
  saveCustomChallengeToCloud,
  deleteCustomChallengeFromCloud,
  getTodayDateString,
  getActiveChallengeState,
  saveActiveChallengeState,
  getSkippedIds,
  addSkippedId,
  getDailyChallengeForDate,
  getDiaryEntries,
  saveOrUpdateEntry,
  deleteDiaryEntry,
  ActiveChallengeState,
  subscribeToUserProfile,
  subscribeToUserDiary,
  subscribeToUserCustomChallenges,
  subscribeToUserCustomPhrases,
  ensureUserProfileDoc,
  saveUserProfileFields,
  syncLocalEntriesToFirestore,
  saveCurrentAccount,
  getUserPreferences,
  saveUserPreferences,
  getThemePreferences,
  saveThemePreferences,
  getActiveSequence,
  saveActiveSequence,
  getCustomPhrases,
  addCustomPhrase,
  deleteCustomPhrase,
  DEFAULT_PREFERENCES,
} from './utils/storage';
import {
  applyThemeToDocument,
  getThemeConfig,
  DEFAULT_THEME_PREFERENCES,
} from './utils/theme';
import { generateArrangedSequence, generateRandomChallenge } from './utils/aiGenerator';
import { INITIAL_CHALLENGES } from './data/initialChallenges';
import {
  auth,
  fbSignOut,
  onAuthStateChanged,
  updateProfile,
} from './lib/firebase';
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
import { ChallengeDetailModal } from './components/ChallengeDetailModal';
import { LogEntryModal } from './components/LogEntryModal';
import { EntryDetailModal } from './components/EntryDetailModal';
import { GuestIntroModal } from './components/GuestIntroModal';
import { OnboardingModal } from './components/OnboardingModal';
import { AuthModal } from './components/AuthModal';

export type ActiveScreen = 'today' | 'diary' | 'progress' | 'library';

export default function App() {
  // Navigation
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('today');
  const [todayDateStr, setTodayDateStr] = useState<string>(getTodayDateString());

  // Firebase Auth state (null = Guest Mode)
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [currentAccount, setCurrentAccount] = useState<AppAccount | null>(null);
  const uid = currentAccount?.uid;

  // Contextual Auth & Post-Signup Flow
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authPromptReason, setAuthPromptReason] = useState<'diary' | 'account'>('diary');
  const [pendingLogChallenge, setPendingLogChallenge] = useState<Challenge | null>(null);
  const pendingLogChallengeRef = useRef<Challenge | null>(null);
  const activeChallengeStateRef = useRef<ActiveChallengeState | null>(null);

  // Preferences & Appearance
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() =>
    getUserPreferences()
  );
  const [themePreferences, setThemePreferences] = useState<ThemePreferences>(() =>
    getThemePreferences()
  );

  // Modals & Intro Flows
  const [showGuestIntroModal, setShowGuestIntroModal] = useState<boolean>(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showCreationHub, setShowCreationHub] = useState<boolean>(false);
  const [showRandomAiModal, setShowRandomAiModal] = useState<boolean>(false);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [showPhrasesModal, setShowPhrasesModal] = useState<boolean>(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState<boolean>(false);
  const [showProfileAppearanceModal, setShowProfileAppearanceModal] = useState<boolean>(false);
  const [showSequenceReviewModal, setShowSequenceReviewModal] = useState<boolean>(false);

  // Challenges, phrases, entries, sequences
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [customPhrases, setCustomPhrases] = useState<UsefulPhrase[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [activeChallengeState, setActiveState] = useState<ActiveChallengeState | null>(null);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [activeSequence, setActiveSequence] = useState<Challenge[] | null>(null);
  const [activeSequenceIndex, setActiveSequenceIndex] = useState<number>(0);

  // Sequence AI state
  const [sequenceStatus, setSequenceStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [sequenceError, setSequenceError] = useState<string | null>(null);
  const [lastSequenceCount, setLastSequenceCount] = useState<number>(3);
  const [regeneratingStepIdx, setRegeneratingStepIdx] = useState<number | null>(null);
  const [sequenceStepError, setSequenceStepError] = useState<string | null>(null);
  const [savedSequenceStepIds, setSavedSequenceStepIds] = useState<Set<string>>(() => new Set());

  // Active modal selections
  const [editingCustomChallenge, setEditingCustomChallenge] = useState<Challenge | null>(null);
  const [previewingChallenge, setPreviewingChallenge] = useState<Challenge | null>(null);
  const [logModalChallenge, setLogModalChallenge] = useState<Challenge | null>(null);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [readingEntry, setReadingEntry] = useState<DiaryEntry | null>(null);

  useEffect(() => {
    pendingLogChallengeRef.current = pendingLogChallenge;
  }, [pendingLogChallenge]);

  useEffect(() => {
    activeChallengeStateRef.current = activeChallengeState;
  }, [activeChallengeState]);

  // Apply theme CSS vars whenever theme changes
  useEffect(() => {
    applyThemeToDocument(themePreferences);
  }, [themePreferences]);

  // Firebase Auth & Guest Mode / Per-User Firestore Synchronization
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    let unsubDiary: (() => void) | null = null;
    let unsubCustom: (() => void) | null = null;
    let unsubPhrases: (() => void) | null = null;
    let isCancelled = false;

    const cleanupSubs = () => {
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }
      if (unsubDiary) {
        unsubDiary();
        unsubDiary = null;
      }
      if (unsubCustom) {
        unsubCustom();
        unsubCustom = null;
      }
      if (unsubPhrases) {
        unsubPhrases();
        unsubPhrases = null;
      }
    };

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      cleanupSubs();
      const today = getTodayDateString();
      setTodayDateStr(today);

      // GUEST MODE: Concept -> Language -> Rules & Safety -> Challenge Page
      if (!user) {
        saveCurrentAccount(null);
        setCurrentAccount(null);
        setDiaryEntries([]);
        setShowOnboardingModal(false);

        const guestPrefs = getUserPreferences();
        const guestTheme = getThemePreferences();
        setUserPreferences(guestPrefs);
        setThemePreferences(guestTheme);

        const guestCustom = getCustomChallenges();
        const allGuestCh = [...guestCustom, ...INITIAL_CHALLENGES];
        setChallenges(allGuestCh);
        setCustomPhrases(getCustomPhrases());

        const guestSkipped = getSkippedIds(today);
        setSkippedIds(guestSkipped);

        const guestActive = getActiveChallengeState();
        if (guestActive && guestActive.date === today) {
          setActiveState(guestActive);
        } else {
          const picked = getDailyChallengeForDate(today, allGuestCh, guestSkipped);
          const initialState: ActiveChallengeState = {
            date: today,
            challengeId: picked.id,
            isAccepted: false,
          };
          setActiveState(initialState);
          saveActiveChallengeState(initialState);
        }

        const guestSeq = getActiveSequence();
        if (guestSeq && guestSeq.length > 0) {
          setActiveSequence(guestSeq);
          const firstIncomplete = guestSeq.findIndex((s) => !s.completed);
          setActiveSequenceIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
        } else {
          setActiveSequence(null);
          setActiveSequenceIndex(0);
        }

        setShowGuestIntroModal(!isGuestIntroDone());
        setAuthReady(true);
        return;
      }

      // AUTHENTICATED USER MODE
      setGuestIntroDone(true);
      setShowGuestIntroModal(false);
      setShowAuthModal(false);

      const userUid = user.uid;
      const fallbackName = user.displayName || user.email?.split('@')[0] || 'Explorer';
      const cloudAcc: AppAccount = {
        uid: userUid,
        email: user.email || '',
        displayName: fallbackName,
        createdAt: Date.now(),
      };
      saveCurrentAccount(cloudAcc);
      setCurrentAccount(cloudAcc);

      // Carry over active challenge accepted in Guest Mode if user has none saved yet
      const userSavedActive = getActiveChallengeState(userUid);
      const guestAcceptedSnapshot = activeChallengeStateRef.current;

      const localPrefs = getUserPreferences(userUid);
      const localTheme = getThemePreferences(userUid);
      setUserPreferences(localPrefs);
      setThemePreferences(localTheme);

      const localCustom = getCustomChallenges(userUid);
      const allLocalCh = [...localCustom, ...INITIAL_CHALLENGES];
      setChallenges(allLocalCh);
      setDiaryEntries(getDiaryEntries(userUid));
      setCustomPhrases(getCustomPhrases(userUid));

      const skipped = getSkippedIds(today, userUid);
      setSkippedIds(skipped);

      if (userSavedActive && userSavedActive.date === today) {
        setActiveState(userSavedActive);
      } else if (guestAcceptedSnapshot && guestAcceptedSnapshot.date === today) {
        setActiveState(guestAcceptedSnapshot);
        saveActiveChallengeState(guestAcceptedSnapshot, userUid);
      } else {
        const picked = getDailyChallengeForDate(today, allLocalCh, skipped);
        const newState: ActiveChallengeState = {
          date: today,
          challengeId: picked.id,
          isAccepted: false,
        };
        setActiveState(newState);
        saveActiveChallengeState(newState, userUid);
      }

      const savedSeq = getActiveSequence(userUid);
      if (savedSeq && savedSeq.length > 0) {
        setActiveSequence(savedSeq);
        const firstIncomplete = savedSeq.findIndex((s) => !s.completed);
        setActiveSequenceIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
      } else {
        setActiveSequence(null);
        setActiveSequenceIndex(0);
      }

      try {
        // Ensure parent user document exists first (required by Firestore security rules)
        const profileDoc = await ensureUserProfileDoc(user);
        if (isCancelled || auth.currentUser?.uid !== userUid) return;

        let needsProfileSetup = true;
        if (profileDoc) {
          if (profileDoc.displayName) {
            const updatedAcc = { ...cloudAcc, displayName: profileDoc.displayName };
            setCurrentAccount(updatedAcc);
            saveCurrentAccount(updatedAcc);
          }
          if (profileDoc.preferences) {
            const mergedPrefs = { ...DEFAULT_PREFERENCES, ...profileDoc.preferences };
            setUserPreferences(mergedPrefs);
            saveUserPreferences(mergedPrefs, userUid);
          }
          if (profileDoc.themePreferences) {
            const mergedTheme = { ...DEFAULT_THEME_PREFERENCES, ...profileDoc.themePreferences };
            setThemePreferences(mergedTheme);
            saveThemePreferences(mergedTheme, userUid);
          }

          needsProfileSetup = !Boolean(profileDoc.onboarded || isOnboarded(userUid));
        } else {
          needsProfileSetup = !isOnboarded(userUid);
        }

        if (needsProfileSetup) {
          // Run full-page post-signup Profile Setup Slides first;
          // pendingLogChallenge will open right after setup completes!
          setShowOnboardingModal(true);
        } else if (pendingLogChallengeRef.current) {
          // Returning account who signed in specifically to log a diary reflection
          const queued = pendingLogChallengeRef.current;
          setPendingLogChallenge(null);
          setEditingEntry(null);
          setLogModalChallenge(queued);
        }

        setAuthReady(true);

        // Migrate any guest challenges/phrases created before sign-up up to Firestore
        await syncLocalEntriesToFirestore(userUid);
        if (isCancelled || auth.currentUser?.uid !== userUid) return;

        unsubProfile = subscribeToUserProfile(userUid, (profile) => {
          if (profile.displayName) {
            setCurrentAccount((prev) => {
              const next = prev ? { ...prev, displayName: profile.displayName! } : null;
              if (next) saveCurrentAccount(next);
              return next;
            });
          }
          if (profile.preferences) {
            const merged = { ...DEFAULT_PREFERENCES, ...profile.preferences };
            setUserPreferences(merged);
            saveUserPreferences(merged, userUid);
          }
          if (profile.themePreferences) {
            const merged = { ...DEFAULT_THEME_PREFERENCES, ...profile.themePreferences };
            setThemePreferences(merged);
            saveThemePreferences(merged, userUid);
          }
          if (profile.onboarded) {
            setOnboarded(true, userUid);
          }
        });

        unsubDiary = subscribeToUserDiary(userUid, (entries) => {
          setDiaryEntries(entries);
        });

        unsubCustom = subscribeToUserCustomChallenges(userUid, (customList) => {
          setChallenges([...customList, ...INITIAL_CHALLENGES]);
        });

        unsubPhrases = subscribeToUserCustomPhrases(userUid, (phrases) => {
          setCustomPhrases(phrases);
        });
      } catch (err) {
        console.error('Error initializing cloud session:', err);
        setAuthReady(true);
      }
    });

    return () => {
      isCancelled = true;
      unsubAuth();
      cleanupSubs();
    };
  }, []);

  // Today's active challenge object
  const currentDailyChallenge = useMemo<Challenge>(() => {
    if (activeSequence && activeSequence.length > 0) {
      const currentStep = activeSequence[activeSequenceIndex];
      if (currentStep) return currentStep;
    }

    if (challenges.length === 0) {
      return INITIAL_CHALLENGES[0];
    }

    if (activeChallengeState && activeChallengeState.date === todayDateStr) {
      const match = challenges.find((c) => c.id === activeChallengeState.challengeId);
      if (match) return match;
    }

    return getDailyChallengeForDate(todayDateStr, challenges, skippedIds);
  }, [challenges, activeChallengeState, todayDateStr, skippedIds, activeSequence, activeSequenceIndex]);

  // Today's diary entry if logged
  const todayEntry = useMemo<DiaryEntry | null>(() => {
    if (!currentAccount) return null;
    return (
      diaryEntries.find(
        (e) => e.date === todayDateStr && e.challengeId === currentDailyChallenge.id
      ) ||
      diaryEntries.find((e) => e.date === todayDateStr) ||
      null
    );
  }, [currentAccount, diaryEntries, todayDateStr, currentDailyChallenge.id]);

  // Guarded Diary Log Trigger: Requires account signup/signin before logging to diary
  const requestDiaryLog = (challenge: Challenge) => {
    if (!currentAccount) {
      setPendingLogChallenge(challenge);
      setAuthPromptReason('diary');
      setShowAuthModal(true);
      return;
    }
    setEditingEntry(null);
    setLogModalChallenge(challenge);
  };

  // Preferences & Appearance Save (works locally in Guest Mode, syncs to Firestore when signed in)
  const handleSavePreferences = (newPrefs: UserPreferences) => {
    setUserPreferences(newPrefs);
    saveUserPreferences(newPrefs, uid);
    if (uid) {
      saveUserProfileFields(uid, { preferences: newPrefs });
    }
  };

  const handleSaveTheme = (newTheme: ThemePreferences) => {
    setThemePreferences(newTheme);
    saveThemePreferences(newTheme, uid);
    applyThemeToDocument(newTheme);
    if (uid) {
      saveUserProfileFields(uid, { themePreferences: newTheme });
    }
  };

  const handleResetDefaultAppearance = () => {
    handleSaveTheme(DEFAULT_THEME_PREFERENCES);
  };

  // Profile name update
  const handleUpdateProfileName = (newName: string) => {
    const clean = newName.trim() || 'Explorer';
    setCurrentAccount((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, displayName: clean };
      saveCurrentAccount(updated);
      return updated;
    });
    if (auth.currentUser) {
      updateProfile(auth.currentUser, { displayName: clean }).catch(() => {});
    }
    if (uid) {
      saveUserProfileFields(uid, { displayName: clean });
    }
  };

  // Sign out cleanly back into Guest Mode
  const handleSignOut = async () => {
    try {
      await fbSignOut(auth);
      setPendingLogChallenge(null);
      setShowMenu(false);
      setShowProfileAppearanceModal(false);
      setShowPreferencesModal(false);
      setShowPhrasesModal(false);
      setShowCustomModal(false);
      setShowRandomAiModal(false);
      setShowSequenceReviewModal(false);
      setShowCreationHub(false);
      setPreviewingChallenge(null);
      setLogModalChallenge(null);
      setReadingEntry(null);
      setCurrentScreen('today');
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  // Streak calculation
  const currentStreak = useMemo(() => {
    if (diaryEntries.length === 0) return 0;
    const dates = new Set(diaryEntries.map((e) => e.date).filter(Boolean));
    const now = new Date();
    let streak = 0;
    const checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);

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

  // 1. Accept Challenge
  const handleAcceptChallenge = () => {
    const updated: ActiveChallengeState = {
      date: todayDateStr,
      challengeId: currentDailyChallenge.id,
      isAccepted: true,
      acceptedAt: Date.now(),
    };
    setActiveState(updated);
    saveActiveChallengeState(updated, uid);
  };

  // 2. Skip Challenge (zero penalty)
  const handleSkipChallenge = () => {
    if (activeSequence && activeSequence.length > 0) {
      if (activeSequenceIndex < activeSequence.length - 1) {
        const nextIdx = activeSequenceIndex + 1;
        setActiveSequenceIndex(nextIdx);
        const nextStep = activeSequence[nextIdx];
        const updatedState: ActiveChallengeState = {
          date: todayDateStr,
          challengeId: nextStep.id,
          isAccepted: false,
        };
        setActiveState(updatedState);
        saveActiveChallengeState(updatedState, uid);
      } else {
        setActiveSequence(null);
        saveActiveSequence(null, uid);
        setActiveSequenceIndex(0);
        const nextPicked = getDailyChallengeForDate(todayDateStr, challenges, skippedIds);
        const updatedState: ActiveChallengeState = {
          date: todayDateStr,
          challengeId: nextPicked.id,
          isAccepted: false,
        };
        setActiveState(updatedState);
        saveActiveChallengeState(updatedState, uid);
      }
      return;
    }

    addSkippedId(todayDateStr, currentDailyChallenge.id, uid);
    const updatedSkipped = [...skippedIds, currentDailyChallenge.id];
    setSkippedIds(updatedSkipped);

    const nextPicked = getDailyChallengeForDate(todayDateStr, challenges, updatedSkipped);
    const updatedState: ActiveChallengeState = {
      date: todayDateStr,
      challengeId: nextPicked.id,
      isAccepted: false,
    };
    setActiveState(updatedState);
    saveActiveChallengeState(updatedState, uid);
  };

  // Use challenge from Random AI
  const handleUseRandomAiChallenge = (challenge: Challenge) => {
    const customList = getCustomChallenges(uid);
    const updatedCustom = [challenge, ...customList];
    saveCustomChallenges(updatedCustom, uid);
    setChallenges([...updatedCustom, ...INITIAL_CHALLENGES]);

    if (uid) {
      saveCustomChallengeToCloud(uid, challenge);
    }

    const newState: ActiveChallengeState = {
      date: todayDateStr,
      challengeId: challenge.id,
      isAccepted: false,
    };
    setActiveState(newState);
    saveActiveChallengeState(newState, uid);

    setActiveSequence(null);
    saveActiveSequence(null, uid);
    setCurrentScreen('today');
  };

  // Build AI-Arranged Sequence (honest loading & error reporting)
  const handleGenerateArrangedSequence = async (count: number) => {
    setShowCreationHub(false);
    setLastSequenceCount(count);
    setSequenceStatus('loading');
    setSequenceError(null);
    setSequenceStepError(null);
    setShowSequenceReviewModal(true);

    try {
      const seq = await generateArrangedSequence(userPreferences, count);
      setActiveSequence(seq);
      saveActiveSequence(seq, uid);
      setActiveSequenceIndex(0);
      setSequenceStatus('idle');
    } catch (err: any) {
      setSequenceError(err?.message || 'Unable to reach AI service.');
      setSequenceStatus('error');
    }
  };

  const handleRegenerateSequenceStep = async (idx: number) => {
    if (!activeSequence || !activeSequence[idx]) return;
    const targetStep = activeSequence[idx];
    setRegeneratingStepIdx(idx);
    setSequenceStepError(null);

    try {
      const replacement = await generateRandomChallenge(userPreferences, targetStep.difficulty);
      const updated = [...activeSequence];
      updated[idx] = {
        ...replacement,
        sequenceOrder: idx + 1,
        sequenceTotal: activeSequence.length,
        isSequenceStep: true,
        completed: false,
      };
      setActiveSequence(updated);
      saveActiveSequence(updated, uid);
    } catch (err: any) {
      setSequenceStepError(err?.message || 'Could not regenerate this step.');
    } finally {
      setRegeneratingStepIdx(null);
    }
  };

  const handleStartActiveSequence = () => {
    if (activeSequence && activeSequence.length > 0) {
      const firstIncomplete = activeSequence.findIndex((s) => !s.completed);
      const startIdx = firstIncomplete >= 0 ? firstIncomplete : 0;
      setActiveSequenceIndex(startIdx);
      const step = activeSequence[startIdx];
      const newState: ActiveChallengeState = {
        date: todayDateStr,
        challengeId: step.id,
        isAccepted: false,
      };
      setActiveState(newState);
      saveActiveChallengeState(newState, uid);
      setCurrentScreen('today');
    }
  };

  // Custom Challenge saving (create or edit)
  const handleSaveCustomChallenge = (challenge: Challenge, makeActive = true) => {
    const customList = getCustomChallenges(uid);
    const existingIndex = customList.findIndex((c) => c.id === challenge.id);

    if (existingIndex >= 0) {
      updateCustomChallenge(challenge, uid);
    } else {
      saveCustomChallenges([challenge, ...customList], uid);
    }

    const updatedCustom = getCustomChallenges(uid);
    setChallenges([...updatedCustom, ...INITIAL_CHALLENGES]);

    if (uid) {
      saveCustomChallengeToCloud(uid, challenge);
    }

    if (activeSequence) {
      const seqIdx = activeSequence.findIndex((s) => s.id === challenge.id);
      if (seqIdx >= 0) {
        const updatedSeq = [...activeSequence];
        updatedSeq[seqIdx] = { ...updatedSeq[seqIdx], ...challenge };
        setActiveSequence(updatedSeq);
        saveActiveSequence(updatedSeq, uid);
      }
    }

    if (makeActive) {
      const updatedState: ActiveChallengeState = {
        date: todayDateStr,
        challengeId: challenge.id,
        isAccepted: false,
      };
      setActiveState(updatedState);
      saveActiveChallengeState(updatedState, uid);
      setCurrentScreen('today');
    }
  };

  const handleDeleteCustomChallenge = (id: string) => {
    const customList = getCustomChallenges(uid).filter((c) => c.id !== id);
    saveCustomChallenges(customList, uid);
    const updatedAll = [...customList, ...INITIAL_CHALLENGES];
    setChallenges(updatedAll);

    if (uid) {
      deleteCustomChallengeFromCloud(uid, id);
    }

    if (currentDailyChallenge.id === id) {
      const nextPicked = getDailyChallengeForDate(todayDateStr, updatedAll, skippedIds);
      const newState: ActiveChallengeState = {
        date: todayDateStr,
        challengeId: nextPicked.id,
        isAccepted: false,
      };
      setActiveState(newState);
      saveActiveChallengeState(newState, uid);
    }
  };

  // Diary logging (only callable when authenticated)
  const handleSaveEntry = (entry: DiaryEntry): { success: boolean; error?: string } => {
    const res = saveOrUpdateEntry(entry, uid);
    if (res.success) {
      const updatedList = getDiaryEntries(uid);
      setDiaryEntries(updatedList);

      if (activeSequence && activeSequence.length > 0) {
        const seqMatchIdx = activeSequence.findIndex((s) => s.id === entry.challengeId);
        if (seqMatchIdx >= 0) {
          const updatedSeq = activeSequence.map((step, i) =>
            i === seqMatchIdx ? { ...step, completed: true } : step
          );
          setActiveSequence(updatedSeq);
          saveActiveSequence(updatedSeq, uid);
        }
      }

      if (entry.date === todayDateStr) {
        const updatedActive: ActiveChallengeState = {
          date: todayDateStr,
          challengeId: entry.challengeId,
          isAccepted: true,
        };
        setActiveState(updatedActive);
        saveActiveChallengeState(updatedActive, uid);
      }
    }
    return res;
  };

  const handleDeleteEntry = (id: string) => {
    deleteDiaryEntry(id, uid);
    setDiaryEntries(getDiaryEntries(uid));
    if (readingEntry?.id === id) {
      setReadingEntry(null);
    }
  };

  const handleToggleFavorite = (id: string) => {
    const entry = diaryEntries.find((e) => e.id === id);
    if (!entry) return;
    const updated = { ...entry, isFavorite: !entry.isFavorite };
    handleSaveEntry(updated);
    if (readingEntry?.id === id) {
      setReadingEntry(updated);
    }
  };

  const handleSetDailyChallenge = (challenge: Challenge) => {
    setActiveSequence(null);
    saveActiveSequence(null, uid);
    const updatedState: ActiveChallengeState = {
      date: todayDateStr,
      challengeId: challenge.id,
      isAccepted: false,
    };
    setActiveState(updatedState);
    saveActiveChallengeState(updatedState, uid);
    setCurrentScreen('today');
  };

  const themeConfig = getThemeConfig(themePreferences.colorTheme);
  const isCompact = themePreferences.displayFormat === 'compact';

  if (!authReady) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 text-slate-500 transition-colors duration-300"
        style={{ backgroundColor: themeConfig.bgHex }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-slate-200 animate-spin mb-3"
          style={{ borderTopColor: themeConfig.hex }}
        />
        <p className="text-xs font-medium">Loading your quiet practice space...</p>
      </div>
    );
  }

  return (
    <div
      data-theme={themePreferences.colorTheme}
      data-format={themePreferences.displayFormat}
      className="min-h-screen text-slate-800 flex flex-col font-sans transition-colors duration-300"
      style={{ backgroundColor: themeConfig.bgHex }}
    >
      {/* SCREEN 1: CHALLENGE PAGE */}
      {currentScreen === 'today' && !showOnboardingModal && (
        <TodayView
          challenge={currentDailyChallenge}
          isAccepted={Boolean(activeChallengeState?.isAccepted)}
          todayEntry={todayEntry}
          themePreferences={themePreferences}
          onAccept={handleAcceptChallenge}
          onSkip={handleSkipChallenge}
          onLogExperience={() => requestDiaryLog(currentDailyChallenge)}
          onViewEntry={(entry) => setReadingEntry(entry)}
          onOpenMenu={() => setShowMenu(true)}
          onOpenSafety={() => setShowGuestIntroModal(true)}
        />
      )}

      {/* SCREEN 2: SEPARATE DIARY SCREEN */}
      {currentScreen === 'diary' && (
        <div
          className={`max-w-lg mx-auto w-full transition-all duration-300 ${
            isCompact ? 'px-3 py-3' : 'px-5 py-6'
          }`}
        >
          <DiaryView
            entries={diaryEntries}
            isAuthenticated={Boolean(currentAccount)}
            onSelectEntry={(entry) => setReadingEntry(entry)}
            onNewEntry={() => requestDiaryLog(currentDailyChallenge)}
            onToggleFavorite={handleToggleFavorite}
            onBackToToday={() => setCurrentScreen('today')}
          />
        </div>
      )}

      {/* SCREEN 3: SEPARATE PROGRESS & STREAK SCREEN */}
      {currentScreen === 'progress' && (
        <div
          className={`max-w-lg mx-auto w-full transition-all duration-300 ${
            isCompact ? 'px-3 py-3' : 'px-5 py-6'
          }`}
        >
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
        <div
          className={`max-w-lg mx-auto w-full transition-all duration-300 ${
            isCompact ? 'px-3 py-3' : 'px-5 py-6'
          }`}
        >
          <ChallengesLibraryView
            challenges={challenges}
            onSelectChallenge={(challenge) => setPreviewingChallenge(challenge)}
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

      {/* CHALLENGE DETAIL MODAL (from Library) */}
      <ChallengeDetailModal
        challenge={previewingChallenge}
        isOpen={Boolean(previewingChallenge)}
        onClose={() => setPreviewingChallenge(null)}
        isAccepted={Boolean(
          previewingChallenge &&
            activeChallengeState?.challengeId === previewingChallenge.id &&
            activeChallengeState?.isAccepted
        )}
        isCompletedToday={Boolean(
          currentAccount &&
            previewingChallenge &&
            diaryEntries.some(
              (e) => e.date === todayDateStr && e.challengeId === previewingChallenge.id
            )
        )}
        isCurrentDaily={previewingChallenge?.id === currentDailyChallenge.id}
        onAccept={() => {
          if (!previewingChallenge) return;
          setActiveSequence(null);
          saveActiveSequence(null, uid);
          const updated: ActiveChallengeState = {
            date: todayDateStr,
            challengeId: previewingChallenge.id,
            isAccepted: true,
            acceptedAt: Date.now(),
          };
          setActiveState(updated);
          saveActiveChallengeState(updated, uid);
          setCurrentScreen('today');
        }}
        onLogExperience={() => {
          if (previewingChallenge) {
            requestDiaryLog(previewingChallenge);
          }
        }}
        onSetAsDaily={() => {
          if (previewingChallenge) {
            handleSetDailyChallenge(previewingChallenge);
          }
        }}
        onOpenPhrases={() => setShowPhrasesModal(true)}
      />

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
        onSignOut={handleSignOut}
        onOpenAuth={() => {
          setAuthPromptReason('account');
          setShowAuthModal(true);
        }}
      />

      {/* CREATE A CHALLENGE HUB */}
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

      {/* RANDOM AI MODAL */}
      <RandomAiModal
        isOpen={showRandomAiModal}
        onClose={() => setShowRandomAiModal(false)}
        preferences={userPreferences}
        onUseChallenge={handleUseRandomAiChallenge}
      />

      {/* AI-ARRANGED SEQUENCE REVIEW */}
      <SequenceReviewModal
        isOpen={showSequenceReviewModal}
        onClose={() => setShowSequenceReviewModal(false)}
        sequence={activeSequence || []}
        status={sequenceStatus}
        errorMessage={sequenceError}
        regeneratingIndex={regeneratingStepIdx}
        stepError={sequenceStepError}
        savedIds={savedSequenceStepIds}
        onRetrySequence={() => handleGenerateArrangedSequence(lastSequenceCount)}
        onStartSequence={handleStartActiveSequence}
        onEditChallenge={(ch) => {
          setEditingCustomChallenge(ch);
          setShowCustomModal(true);
        }}
        onRegenerateStep={handleRegenerateSequenceStep}
        onRemoveStep={(idx) => {
          if (activeSequence && activeSequence.length > 2) {
            const updated = activeSequence.filter((_, i) => i !== idx);
            setActiveSequence(updated);
            saveActiveSequence(updated, uid);
            if (activeSequenceIndex >= updated.length) {
              setActiveSequenceIndex(Math.max(0, updated.length - 1));
            }
          }
        }}
        onSaveToLibrary={(ch) => {
          handleSaveCustomChallenge({ ...ch, isCustom: true, saved: true }, false);
          setSavedSequenceStepIds((prev) => new Set(prev).add(ch.id));
        }}
        onToggleCompleteStep={(idx) => {
          if (!activeSequence) return;
          const updated = [...activeSequence];
          updated[idx] = { ...updated[idx], completed: !updated[idx].completed };
          setActiveSequence(updated);
          saveActiveSequence(updated, uid);
        }}
      />

      {/* CUSTOM CHALLENGE MODAL */}
      <CustomChallengeModal
        isOpen={showCustomModal}
        onClose={() => {
          setShowCustomModal(false);
          setEditingCustomChallenge(null);
        }}
        onSave={(ch) => handleSaveCustomChallenge(ch, !showSequenceReviewModal)}
        editingChallenge={editingCustomChallenge}
        defaultLanguage={userPreferences.language}
      />

      {/* PHRASES & AUDIO HELPER */}
      <ForeignPhraseHelperModal
        isOpen={showPhrasesModal}
        onClose={() => setShowPhrasesModal(false)}
        chosenLanguage={userPreferences.language}
        customPhrases={customPhrases}
        onAddPhrase={(phrase) => {
          addCustomPhrase(phrase, uid);
          setCustomPhrases(getCustomPhrases(uid));
        }}
        onDeletePhrase={(id) => {
          deleteCustomPhrase(id, uid);
          setCustomPhrases(getCustomPhrases(uid));
        }}
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
        onSignOut={handleSignOut}
        onOpenAuth={() => {
          setAuthPromptReason('account');
          setShowAuthModal(true);
        }}
        practiceLanguage={userPreferences.language}
        completedCount={diaryEntries.length}
        currentStreak={currentStreak}
      />

      {/* LOG DIARY ENTRY MODAL (Authenticated Only) */}
      {logModalChallenge && currentAccount && (
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
            const foundCh =
              challenges.find((c) => c.id === entry.challengeId) || currentDailyChallenge;
            setLogModalChallenge(foundCh);
          }}
          onDelete={handleDeleteEntry}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* STAGE 1 (FIRST-LOAD INTRO): SAFETY & CONCERN -> CONCEPT -> LANGUAGE -> CHALLENGE PAGE */}
      <GuestIntroModal
        isOpen={showGuestIntroModal}
        themePreferences={themePreferences}
        initialLanguage={userPreferences.language}
        onSelectLanguage={(lang) => handleSavePreferences({ ...userPreferences, language: lang })}
        onComplete={() => {
          setGuestIntroDone(true);
          setShowGuestIntroModal(false);
        }}
      />

      {/* STAGE 2 (TRIGGERED ON DIARY LOG OR ACCOUNT ACTION IN GUEST MODE): GOOGLE & EMAIL AUTH */}
      <AuthModal
        isOpen={showAuthModal}
        canDismiss={true}
        promptReason={authPromptReason}
        onClose={() => {
          setShowAuthModal(false);
          setPendingLogChallenge(null);
        }}
        themePreferences={themePreferences}
      />

      {/* STAGE 3 (RIGHT AFTER SIGNUP / FIRST LOGIN): FULL-PAGE PROFILE SETUP SLIDES */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        initialAccountName={currentAccount?.displayName || 'Explorer'}
        initialPreferences={userPreferences}
        initialThemePreferences={themePreferences}
        onCommitLanguage={(lang) =>
          handleSavePreferences({ ...userPreferences, language: lang })
        }
        onCommitTheme={handleSaveTheme}
        onCommitProfileAndPreferences={(displayName, prefs) => {
          handleUpdateProfileName(displayName);
          handleSavePreferences(prefs);
        }}
        onComplete={() => {
          if (uid) {
            setOnboarded(true, uid);
            saveUserProfileFields(uid, { onboarded: true });
          }
          setShowOnboardingModal(false);

          // Resume logging the challenge they clicked before signing up!
          if (pendingLogChallenge) {
            const queued = pendingLogChallenge;
            setPendingLogChallenge(null);
            setEditingEntry(null);
            setLogModalChallenge(queued);
          }
        }}
      />
    </div>
  );
}
