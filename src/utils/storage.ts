import {
  Challenge,
  DiaryEntry,
  MoodType,
  AppAccount,
  UserPreferences,
  ThemePreferences,
  UsefulPhrase,
} from '../types';
import { INITIAL_CHALLENGES } from '../data/initialChallenges';
import {
  auth,
  db,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  handleFirestoreError,
  OperationType,
  User,
} from '../lib/firebase';
import { DEFAULT_THEME_PREFERENCES } from './theme';

const STORAGE_KEYS = {
  ONBOARDED: 'tt_onboarded_v1',
  CUSTOM_CHALLENGES: 'tt_custom_challenges_v1',
  ACTIVE_CHALLENGE: 'tt_active_challenge_v1',
  SKIPPED_CHALLENGES: 'tt_skipped_challenges_v1',
  DIARY_ENTRIES: 'tt_diary_entries_v1',
  CURRENT_ACCOUNT: 'tt_current_account_v1',
  CHOSEN_LANGUAGE: 'tt_chosen_language_v1',
  USER_PREFERENCES: 'tt_user_preferences_v2',
  THEME_PREFERENCES: 'tt_theme_preferences_v2',
  CUSTOM_PHRASES: 'tt_custom_phrases_v2',
  ACTIVE_SEQUENCE: 'tt_active_sequence_v2',
  GUEST_INTRO_DONE: 'tt_guest_intro_v2',
};

function scopedKey(baseKey: string, userId?: string): string {
  return userId ? `${baseKey}_${userId}` : baseKey;
}

// Safe JSON parse
function getJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
}

// Safe JSON set with quota catch
function setJson<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn(`localStorage write failed for ${key}:`, e);
    return false;
  }
}

// Recursively remove undefined fields so Firestore setDoc never rejects them
function stripUndefinedDeep<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => stripUndefinedDeep(item)) as unknown as T;
  }
  if (obj !== null && typeof obj === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) {
        out[k] = stripUndefinedDeep(v);
      }
    }
    return out as T;
  }
  return obj;
}

function truncateStr(val: string | undefined, maxLen: number): string | undefined {
  if (val === undefined) return undefined;
  return val.length > maxLen ? val.slice(0, maxLen) : val;
}

function isAuthedCloudUser(userId?: string): userId is string {
  return Boolean(userId && auth.currentUser && auth.currentUser.uid === userId);
}

export function getTodayDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getChosenLanguage(userId?: string): string {
  return localStorage.getItem(scopedKey(STORAGE_KEYS.CHOSEN_LANGUAGE, userId)) || 'Spanish';
}

export function saveChosenLanguage(lang: string, userId?: string): void {
  localStorage.setItem(scopedKey(STORAGE_KEYS.CHOSEN_LANGUAGE, userId), lang);
}

export function isGuestIntroDone(): boolean {
  return localStorage.getItem(STORAGE_KEYS.GUEST_INTRO_DONE) === 'true';
}

export function setGuestIntroDone(val: boolean): void {
  localStorage.setItem(STORAGE_KEYS.GUEST_INTRO_DONE, val ? 'true' : 'false');
}

export function isOnboarded(userId?: string): boolean {
  return localStorage.getItem(scopedKey(STORAGE_KEYS.ONBOARDED, userId)) === 'true';
}

export function setOnboarded(val: boolean, userId?: string): void {
  localStorage.setItem(scopedKey(STORAGE_KEYS.ONBOARDED, userId), val ? 'true' : 'false');
}

export function getCustomChallenges(userId?: string): Challenge[] {
  return getJson<Challenge[]>(scopedKey(STORAGE_KEYS.CUSTOM_CHALLENGES, userId), []);
}

export function saveCustomChallenges(challenges: Challenge[], userId?: string): boolean {
  return setJson(scopedKey(STORAGE_KEYS.CUSTOM_CHALLENGES, userId), challenges);
}

export function getAllChallenges(userId?: string): Challenge[] {
  const custom = getCustomChallenges(userId);
  return [...custom, ...INITIAL_CHALLENGES];
}

export interface ActiveChallengeState {
  date: string;
  challengeId: string;
  isAccepted: boolean;
  acceptedAt?: number;
}

export function getActiveChallengeState(userId?: string): ActiveChallengeState | null {
  return getJson<ActiveChallengeState | null>(
    scopedKey(STORAGE_KEYS.ACTIVE_CHALLENGE, userId),
    null
  );
}

export function saveActiveChallengeState(
  state: ActiveChallengeState | null,
  userId?: string
): boolean {
  return setJson(scopedKey(STORAGE_KEYS.ACTIVE_CHALLENGE, userId), state);
}

export function getSkippedIds(dateStr: string, userId?: string): string[] {
  const map = getJson<Record<string, string[]>>(
    scopedKey(STORAGE_KEYS.SKIPPED_CHALLENGES, userId),
    {}
  );
  return map[dateStr] || [];
}

export function addSkippedId(dateStr: string, challengeId: string, userId?: string): void {
  const key = scopedKey(STORAGE_KEYS.SKIPPED_CHALLENGES, userId);
  const map = getJson<Record<string, string[]>>(key, {});
  const list = map[dateStr] || [];
  if (!list.includes(challengeId)) {
    list.push(challengeId);
    map[dateStr] = list;
    setJson(key, map);
  }
}

/**
 * Deterministically picks a challenge for the given date, skipping any rejected today.
 */
export function getDailyChallengeForDate(
  dateStr: string,
  challenges: Challenge[],
  skippedIds: string[]
): Challenge {
  if (challenges.length === 0) return INITIAL_CHALLENGES[0];

  const candidates = challenges.filter((c) => !skippedIds.includes(c.id));
  const pool = candidates.length > 0 ? candidates : challenges;

  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % pool.length;
  return pool[index];
}

// Account & Profile Management
export function getCurrentAccount(): AppAccount | null {
  return getJson<AppAccount | null>(STORAGE_KEYS.CURRENT_ACCOUNT, null);
}

export function saveCurrentAccount(account: AppAccount | null): void {
  if (account) {
    setJson(STORAGE_KEYS.CURRENT_ACCOUNT, account);
  } else {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ACCOUNT);
    } catch {}
  }
}

// Diary Entries with strict userId isolation
export function getDiaryEntries(userId?: string): DiaryEntry[] {
  const userKey = scopedKey(STORAGE_KEYS.DIARY_ENTRIES, userId);
  const list = getJson<DiaryEntry[]>(userKey, []);
  return list.sort((a, b) => b.timestamp - a.timestamp);
}

export function saveDiaryEntries(entries: DiaryEntry[], userId?: string): boolean {
  const userKey = scopedKey(STORAGE_KEYS.DIARY_ENTRIES, userId);
  return setJson(userKey, entries);
}

function sanitizeEntryForFirestore(entry: DiaryEntry, userId: string): Record<string, any> {
  const safeDifficulty = ['Gentle', 'Brave', 'Bold'].includes(entry.challengeDifficulty)
    ? entry.challengeDifficulty
    : 'Gentle';

  const payload = {
    id: truncateStr(entry.id, 128) || `entry-${Date.now()}`,
    userId,
    challengeId: truncateStr(entry.challengeId, 128) || 'unknown',
    challengeTitle: truncateStr(entry.challengeTitle, 200) || 'Challenge',
    challengeDifficulty: safeDifficulty,
    date: (entry.date || getTodayDateString()).slice(0, 10),
    timestamp: Number(entry.timestamp) || Date.now(),
    description: truncateStr(entry.description, 5000) || '',
    beforeMood: truncateStr(String(entry.beforeMood || 'nervous'), 40) || 'nervous',
    afterMood: truncateStr(String(entry.afterMood || 'relieved'), 40) || 'relieved',
    isFavorite: Boolean(entry.isFavorite),
    surprise: entry.surprise ? truncateStr(entry.surprise, 500) : undefined,
    photoUrl: entry.photoUrl && entry.photoUrl.length <= 750000 ? entry.photoUrl : undefined,
    videoPosterUrl:
      entry.videoPosterUrl && entry.videoPosterUrl.length <= 750000
        ? entry.videoPosterUrl
        : undefined,
    mediaType:
      entry.photoUrl && (entry.mediaType === 'image' || entry.mediaType === 'video')
        ? entry.mediaType
        : undefined,
    locationName: entry.locationName ? truncateStr(entry.locationName, 200) : undefined,
    languageAttempted: entry.languageAttempted
      ? truncateStr(entry.languageAttempted, 100)
      : undefined,
    wordsSpoken: entry.wordsSpoken ? truncateStr(entry.wordsSpoken, 500) : undefined,
  };

  return stripUndefinedDeep(payload);
}

export function saveOrUpdateEntry(
  entry: DiaryEntry,
  userId?: string
): { success: boolean; error?: string } {
  try {
    const activeUid = userId || entry.userId;
    if (entry.photoUrl && entry.photoUrl.length > 750000) {
      return {
        success: false,
        error: 'Attached photo is too large for cloud sync. Please try a smaller photo.',
      };
    }

    const list = getDiaryEntries(activeUid);
    const existingIndex = list.findIndex((e) => e.id === entry.id);
    const normalizedEntry: DiaryEntry = { ...entry, userId: activeUid };

    if (existingIndex >= 0) {
      list[existingIndex] = normalizedEntry;
    } else {
      list.unshift(normalizedEntry);
    }
    const ok = saveDiaryEntries(list, activeUid);

    if (isAuthedCloudUser(activeUid)) {
      const path = `users/${activeUid}/entries/${normalizedEntry.id}`;
      const entryRef = doc(db, 'users', activeUid, 'entries', normalizedEntry.id);
      const firestoreData = sanitizeEntryForFirestore(normalizedEntry, activeUid);
      setDoc(entryRef, firestoreData, { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, path);
      });
    }

    if (!ok) {
      return {
        success: false,
        error: 'Browser storage limit reached. Your cloud copy is saved, or export older entries.',
      };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Storage error' };
  }
}

export function deleteDiaryEntry(id: string, userId?: string): boolean {
  const list = getDiaryEntries(userId).filter((e) => e.id !== id);
  const ok = saveDiaryEntries(list, userId);
  if (isAuthedCloudUser(userId)) {
    const path = `users/${userId}/entries/${id}`;
    const entryRef = doc(db, 'users', userId, 'entries', id);
    deleteDoc(entryRef).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, path);
    });
  }
  return ok;
}

// -------------------------------------------------------------
// CUSTOM CHALLENGES CLOUD SYNC
// -------------------------------------------------------------
function sanitizeChallengeForFirestore(ch: Challenge, userId: string): Record<string, any> {
  const safeDifficulty = ['Gentle', 'Brave', 'Bold'].includes(ch.difficulty)
    ? ch.difficulty
    : 'Gentle';
  const safeSetting =
    ch.setting && ['public place', 'school', 'online'].includes(ch.setting)
      ? ch.setting
      : undefined;

  const payload = {
    id: truncateStr(ch.id, 128) || `custom-${Date.now()}`,
    userId,
    title: truncateStr(ch.title, 200) || 'Custom Challenge',
    instructions: truncateStr(ch.instructions, 1000) || '',
    difficulty: safeDifficulty,
    setting: safeSetting,
    estimatedTime: ch.estimatedTime ? truncateStr(ch.estimatedTime, 64) : undefined,
    whyThisMatters: ch.whyThisMatters ? truncateStr(ch.whyThisMatters, 500) : undefined,
    practicalTip: ch.practicalTip ? truncateStr(ch.practicalTip, 500) : undefined,
    safetyNote: ch.safetyNote ? truncateStr(ch.safetyNote, 500) : undefined,
    isCustom: ch.isCustom !== undefined ? Boolean(ch.isCustom) : true,
    isAiGenerated: ch.isAiGenerated !== undefined ? Boolean(ch.isAiGenerated) : undefined,
    category: ch.category ? truncateStr(ch.category, 64) : undefined,
    suggestedProps: ch.suggestedProps ? truncateStr(ch.suggestedProps, 200) : undefined,
    approachType: ch.approachType ? truncateStr(ch.approachType, 32) : undefined,
    recommendedLanguages: ch.recommendedLanguages?.slice(0, 15),
    helperPhrases: ch.helperPhrases?.slice(0, 10),
    language: ch.language ? truncateStr(ch.language, 64) : undefined,
    topic: ch.topic ? truncateStr(ch.topic, 100) : undefined,
    examplePhrase: ch.examplePhrase,
    isPublic: ch.isPublic !== undefined ? Boolean(ch.isPublic) : undefined,
    sequenceOrder: typeof ch.sequenceOrder === 'number' ? ch.sequenceOrder : undefined,
    sequenceTotal: typeof ch.sequenceTotal === 'number' ? ch.sequenceTotal : undefined,
    isSequenceStep: ch.isSequenceStep !== undefined ? Boolean(ch.isSequenceStep) : undefined,
    completed: ch.completed !== undefined ? Boolean(ch.completed) : undefined,
    saved: ch.saved !== undefined ? Boolean(ch.saved) : undefined,
  };

  return stripUndefinedDeep(payload);
}

export function saveCustomChallengeToCloud(userId: string, challenge: Challenge): void {
  if (!isAuthedCloudUser(userId)) return;
  const path = `users/${userId}/customChallenges/${challenge.id}`;
  const chRef = doc(db, 'users', userId, 'customChallenges', challenge.id);
  const data = sanitizeChallengeForFirestore(challenge, userId);
  setDoc(chRef, data, { merge: true }).catch((err) => {
    handleFirestoreError(err, OperationType.WRITE, path);
  });
}

export function deleteCustomChallengeFromCloud(userId: string, challengeId: string): void {
  if (!isAuthedCloudUser(userId)) return;
  const path = `users/${userId}/customChallenges/${challengeId}`;
  const chRef = doc(db, 'users', userId, 'customChallenges', challengeId);
  deleteDoc(chRef).catch((err) => {
    handleFirestoreError(err, OperationType.DELETE, path);
  });
}

// -------------------------------------------------------------
// CUSTOM PHRASES (COMFORT KIT)
// -------------------------------------------------------------
export function getCustomPhrases(userId?: string): UsefulPhrase[] {
  return getJson<UsefulPhrase[]>(scopedKey(STORAGE_KEYS.CUSTOM_PHRASES, userId), []);
}

export function saveCustomPhrases(phrases: UsefulPhrase[], userId?: string): void {
  setJson(scopedKey(STORAGE_KEYS.CUSTOM_PHRASES, userId), phrases);
}

function sanitizePhraseForFirestore(phrase: UsefulPhrase, userId: string): Record<string, any> {
  const id = truncateStr(phrase.id, 128) || `custom-phrase-${Date.now()}`;
  const payload = {
    id,
    userId,
    phrase: truncateStr(phrase.phrase, 300) || '',
    pronunciation: phrase.pronunciation ? truncateStr(phrase.pronunciation, 300) : undefined,
    meaning: truncateStr(phrase.meaning || phrase.phrase, 300) || '',
    language: truncateStr(phrase.language || 'Spanish', 64) || 'Spanish',
    langCode: truncateStr(phrase.langCode || 'es-ES', 20) || 'es-ES',
    isCustom: true,
    isPublic: Boolean(phrase.isPublic),
    topic: phrase.topic ? truncateStr(phrase.topic, 100) : undefined,
    createdAt: Number(phrase.createdAt) || Date.now(),
  };
  return stripUndefinedDeep(payload);
}

export function addCustomPhrase(phrase: UsefulPhrase, userId?: string): void {
  const list = getCustomPhrases(userId);
  const id = phrase.id || `custom-phrase-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const normalized: UsefulPhrase = { ...phrase, id };
  const existingIdx = list.findIndex((p) => p.id === id);
  if (existingIdx >= 0) {
    list[existingIdx] = normalized;
  } else {
    list.unshift(normalized);
  }
  saveCustomPhrases(list, userId);

  if (isAuthedCloudUser(userId)) {
    const path = `users/${userId}/customPhrases/${id}`;
    const phraseRef = doc(db, 'users', userId, 'customPhrases', id);
    setDoc(phraseRef, sanitizePhraseForFirestore(normalized, userId), { merge: true }).catch(
      (err) => {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    );
  }
}

export function deleteCustomPhrase(id: string, userId?: string): void {
  const list = getCustomPhrases(userId).filter((p) => p.id !== id);
  saveCustomPhrases(list, userId);

  if (isAuthedCloudUser(userId)) {
    const path = `users/${userId}/customPhrases/${id}`;
    const phraseRef = doc(db, 'users', userId, 'customPhrases', id);
    deleteDoc(phraseRef).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, path);
    });
  }
}

// -------------------------------------------------------------
// USER ROOT DOCUMENT & REALTIME SUBSCRIPTIONS
// -------------------------------------------------------------
export interface CloudUserProfileDoc {
  uid: string;
  email?: string;
  displayName?: string;
  createdAt?: string;
  updatedAt?: string;
  onboarded?: boolean;
  preferences?: UserPreferences;
  themePreferences?: ThemePreferences;
}

export async function ensureUserProfileDoc(user: User): Promise<CloudUserProfileDoc | null> {
  const path = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);
    const nowIso = new Date().toISOString();
    if (!snap.exists()) {
      const guestPrefs = getUserPreferences();
      const guestTheme = getThemePreferences();
      const initialDoc: CloudUserProfileDoc = stripUndefinedDeep({
        uid: user.uid,
        email: truncateStr(user.email || '', 256) || '',
        displayName:
          truncateStr(user.displayName || user.email?.split('@')[0] || 'Explorer', 100) ||
          'Explorer',
        createdAt: nowIso,
        updatedAt: nowIso,
        onboarded: isOnboarded(user.uid),
        preferences: guestPrefs,
        themePreferences: guestTheme,
      });
      await setDoc(userRef, initialDoc);
      return initialDoc;
    } else {
      const existingData = snap.data() as CloudUserProfileDoc;
      const updates: Record<string, any> = {
        uid: user.uid,
        updatedAt: nowIso,
      };
      if (user.email && user.email !== existingData.email) {
        updates.email = truncateStr(user.email, 256);
      }
      if (!existingData.displayName && user.displayName) {
        updates.displayName = truncateStr(user.displayName, 100);
      }
      await setDoc(userRef, stripUndefinedDeep(updates), { merge: true });
      return { ...existingData, ...updates } as CloudUserProfileDoc;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export function saveUserProfileFields(
  userId: string,
  fields: Partial<Pick<CloudUserProfileDoc, 'displayName' | 'onboarded' | 'preferences' | 'themePreferences'>>
): void {
  if (!isAuthedCloudUser(userId)) return;
  const path = `users/${userId}`;
  const userRef = doc(db, 'users', userId);
  const sanitized = stripUndefinedDeep({
    uid: userId,
    updatedAt: new Date().toISOString(),
    ...fields,
  });
  setDoc(userRef, sanitized, { merge: true }).catch((err) => {
    handleFirestoreError(err, OperationType.UPDATE, path);
  });
}

export function subscribeToUserProfile(
  userId: string,
  onUpdate: (profile: CloudUserProfileDoc) => void
): () => void {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    return onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          onUpdate(snap.data() as CloudUserProfileDoc);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export function subscribeToUserDiary(
  userId: string,
  onUpdate: (entries: DiaryEntry[]) => void
): () => void {
  const path = `users/${userId}/entries`;
  try {
    const entriesRef = collection(db, 'users', userId, 'entries');
    const q = query(entriesRef, where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const cloudEntries: DiaryEntry[] = [];
        snapshot.forEach((docSnap) => {
          cloudEntries.push(docSnap.data() as DiaryEntry);
        });
        cloudEntries.sort((a, b) => b.timestamp - a.timestamp);
        saveDiaryEntries(cloudEntries, userId);
        onUpdate(cloudEntries);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export function subscribeToUserCustomChallenges(
  userId: string,
  onUpdate: (challenges: Challenge[]) => void
): () => void {
  const path = `users/${userId}/customChallenges`;
  try {
    const collRef = collection(db, 'users', userId, 'customChallenges');
    const q = query(collRef, where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Challenge[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Challenge);
        });
        saveCustomChallenges(list, userId);
        onUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export function subscribeToUserCustomPhrases(
  userId: string,
  onUpdate: (phrases: UsefulPhrase[]) => void
): () => void {
  const path = `users/${userId}/customPhrases`;
  try {
    const collRef = collection(db, 'users', userId, 'customPhrases');
    const q = query(collRef, where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: UsefulPhrase[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as UsefulPhrase);
        });
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        saveCustomPhrases(list, userId);
        onUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

/**
 * Migrate any unauthenticated pre-login local items up to the user's Firestore account once,
 * then clear legacy global keys so future sign-ins stay cleanly isolated per user.
 */
export async function syncLocalEntriesToFirestore(userId: string): Promise<void> {
  if (!isAuthedCloudUser(userId)) return;

  try {
    const legacyEntries = getJson<DiaryEntry[]>(STORAGE_KEYS.DIARY_ENTRIES, []);
    for (const entry of legacyEntries) {
      if (!entry.userId || entry.userId === 'usr_default' || entry.userId === userId) {
        const path = `users/${userId}/entries/${entry.id}`;
        try {
          const entryRef = doc(db, 'users', userId, 'entries', entry.id);
          await setDoc(entryRef, sanitizeEntryForFirestore(entry, userId), { merge: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }
    }
    if (legacyEntries.length > 0) {
      localStorage.removeItem(STORAGE_KEYS.DIARY_ENTRIES);
    }

    const legacyCustom = getJson<Challenge[]>(STORAGE_KEYS.CUSTOM_CHALLENGES, []);
    for (const ch of legacyCustom) {
      const path = `users/${userId}/customChallenges/${ch.id}`;
      try {
        const chRef = doc(db, 'users', userId, 'customChallenges', ch.id);
        await setDoc(chRef, sanitizeChallengeForFirestore(ch, userId), { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
    if (legacyCustom.length > 0) {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_CHALLENGES);
    }

    const legacyPhrases = getJson<UsefulPhrase[]>(STORAGE_KEYS.CUSTOM_PHRASES, []);
    for (const phr of legacyPhrases) {
      const id = phr.id || `custom-phrase-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const path = `users/${userId}/customPhrases/${id}`;
      try {
        const phrRef = doc(db, 'users', userId, 'customPhrases', id);
        await setDoc(phrRef, sanitizePhraseForFirestore({ ...phr, id }, userId), { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
    if (legacyPhrases.length > 0) {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_PHRASES);
    }
  } catch (err) {
    console.warn('Error during cloud migration:', err);
  }
}

// Client-side image compression keeping output safely under Firestore 1MB doc limit
export async function compressImageFile(
  file: File,
  maxDim = 820,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        if (dataUrl.length > 680000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.45);
        }
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Video poster thumbnail compression
export async function compressVideoPoster(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const fileUrl = URL.createObjectURL(file);
    video.src = fileUrl;

    video.onloadeddata = () => {
      video.currentTime = Math.min(0.5, video.duration / 2);
    };

    video.onseeked = () => {
      const maxDim = 600;
      let width = video.videoWidth || 480;
      let height = video.videoHeight || 360;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
        URL.revokeObjectURL(fileUrl);
        resolve(dataUrl);
      } else {
        URL.revokeObjectURL(fileUrl);
        resolve('');
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(fileUrl);
      reject(new Error('Failed to load video frame'));
    };
  });
}

// Format entry into plain readable text
export function formatDiaryToText(entries: DiaryEntry[]): string {
  if (entries.length === 0) return 'Tongue-Tied Diary\nNo entries logged yet.';

  const header =
    `==============================================\n` +
    `TONGUE-TIED — MY EMPATHY CHALLENGE DIARY\n` +
    `Personal reflections on the language barrier\n` +
    `Exported: ${new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}\n` +
    `Total Reflections: ${entries.length}\n` +
    `==============================================\n\n`;

  const body = entries
    .map((e, index) => {
      const dateFormatted = new Date(e.timestamp).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      return (
        `ENTRY #${entries.length - index}\n` +
        `Date: ${dateFormatted}\n` +
        `Challenge: ${e.challengeTitle} (${e.challengeDifficulty})\n` +
        (e.languageAttempted ? `Language Attempted: ${e.languageAttempted}\n` : '') +
        (e.wordsSpoken ? `Words/Phrases Spoken: "${e.wordsSpoken}"\n` : '') +
        `Mood Before: ${e.beforeMood}  -->  Mood After: ${e.afterMood}\n` +
        (e.surprise ? `What Surprised Me: ${e.surprise}\n` : '') +
        (e.locationName ? `Location: ${e.locationName}\n` : '') +
        `\nReflection:\n${e.description}\n` +
        `----------------------------------------------\n`
      );
    })
    .join('\n');

  return header + body;
}

// Download text file
export function downloadDiaryAsFile(entries: DiaryEntry[]): void {
  const text = formatDiaryToText(entries);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tongue-tied-diary-${getTodayDateString()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Mood mappings and helper
export const MOODS_BEFORE = [
  { id: 'nervous' as MoodType, label: 'Nervous', emoji: '😰' },
  { id: 'awkward' as MoodType, label: 'Awkward', emoji: '😬' },
  { id: 'hesitant' as MoodType, label: 'Hesitant', emoji: '🤐' },
  { id: 'curious' as MoodType, label: 'Curious', emoji: '🤔' },
  { id: 'calm' as MoodType, label: 'Calm', emoji: '😌' },
];

export const MOODS_AFTER = [
  { id: 'relieved' as MoodType, label: 'Relieved', emoji: '😮‍💨' },
  { id: 'proud' as MoodType, label: 'Proud', emoji: '💪' },
  { id: 'humbled' as MoodType, label: 'Humbled', emoji: '🥺' },
  { id: 'connected' as MoodType, label: 'Connected', emoji: '💛' },
  { id: 'amazed' as MoodType, label: 'Amazed', emoji: '✨' },
];

export function getMoodEmoji(mood: string): string {
  const all = [...MOODS_BEFORE, ...MOODS_AFTER];
  const found = all.find(
    (m) => m.id === mood || m.label.toLowerCase() === mood.toLowerCase()
  );
  return found ? found.emoji : '💬';
}

export function getMoodLabel(mood: string): string {
  const all = [...MOODS_BEFORE, ...MOODS_AFTER];
  const found = all.find(
    (m) => m.id === mood || m.label.toLowerCase() === mood.toLowerCase()
  );
  return found ? found.label : mood;
}

// -------------------------------------------------------------
// USER PREFERENCES
// -------------------------------------------------------------
export const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'Spanish',
  proficiency: 'Absolute Beginner',
  topics: ['Coffee & Cafés', 'Food & Markets', 'Everyday Errands'],
  difficultyPreference: 'Gentle',
  socialSettings: 'Relaxed neighborhood bakery or quiet coffee shop',
  communityContext:
    'Keep interactions polite, low-stakes, and friendly. Respect personal space and gentle body language.',
};

export function getUserPreferences(userId?: string): UserPreferences {
  const stored = getJson<Partial<UserPreferences> | null>(
    scopedKey(STORAGE_KEYS.USER_PREFERENCES, userId),
    null
  );
  if (!stored) {
    const lang = getChosenLanguage(userId) || 'Spanish';
    return { ...DEFAULT_PREFERENCES, language: lang };
  }
  return {
    ...DEFAULT_PREFERENCES,
    ...stored,
    language: stored.language || getChosenLanguage(userId) || 'Spanish',
  };
}

export function saveUserPreferences(prefs: UserPreferences, userId?: string): void {
  setJson(scopedKey(STORAGE_KEYS.USER_PREFERENCES, userId), prefs);
  if (prefs.language) {
    saveChosenLanguage(prefs.language, userId);
  }
}

// -------------------------------------------------------------
// THEME & DISPLAY PREFERENCES
// -------------------------------------------------------------
export function getThemePreferences(userId?: string): ThemePreferences {
  return getJson<ThemePreferences>(
    scopedKey(STORAGE_KEYS.THEME_PREFERENCES, userId),
    DEFAULT_THEME_PREFERENCES
  );
}

export function saveThemePreferences(prefs: ThemePreferences, userId?: string): void {
  setJson(scopedKey(STORAGE_KEYS.THEME_PREFERENCES, userId), prefs);
}

// -------------------------------------------------------------
// ACTIVE ARRANGE SEQUENCE
// -------------------------------------------------------------
export function getActiveSequence(userId?: string): Challenge[] | null {
  return getJson<Challenge[] | null>(scopedKey(STORAGE_KEYS.ACTIVE_SEQUENCE, userId), null);
}

export function saveActiveSequence(sequence: Challenge[] | null, userId?: string): void {
  setJson(scopedKey(STORAGE_KEYS.ACTIVE_SEQUENCE, userId), sequence);
}

// -------------------------------------------------------------
// UPDATE CUSTOM CHALLENGE
// -------------------------------------------------------------
export function updateCustomChallenge(challenge: Challenge, userId?: string): void {
  const customList = getCustomChallenges(userId);
  const index = customList.findIndex((c) => c.id === challenge.id);
  if (index >= 0) {
    customList[index] = challenge;
  } else {
    customList.unshift(challenge);
  }
  saveCustomChallenges(customList, userId);
}

// -------------------------------------------------------------
// PROFILE UPDATE HELPER
// -------------------------------------------------------------
export function updateUserProfile(displayName: string): AppAccount | null {
  const current = getCurrentAccount();
  if (!current) return null;

  const updated: AppAccount = {
    ...current,
    displayName: displayName.trim() || current.displayName || 'Explorer',
  };

  saveCurrentAccount(updated);
  return updated;
}
