import { Challenge, DiaryEntry, MoodType, AppAccount } from '../types';
import { INITIAL_CHALLENGES } from '../data/initialChallenges';
import { db, doc, setDoc, deleteDoc, collection, query, orderBy, onSnapshot, getDocs } from '../lib/firebase';

const STORAGE_KEYS = {
  ONBOARDED: 'tt_onboarded_v1',
  CUSTOM_CHALLENGES: 'tt_custom_challenges_v1',
  ACTIVE_CHALLENGE: 'tt_active_challenge_v1',
  SKIPPED_CHALLENGES: 'tt_skipped_challenges_v1',
  DIARY_ENTRIES: 'tt_diary_entries_v1',
  FAVORITES: 'tt_favorites_v1',
  CURRENT_ACCOUNT: 'tt_current_account_v1',
  LOCAL_ACCOUNTS: 'tt_local_accounts_v1',
  CHOSEN_LANGUAGE: 'tt_chosen_language_v1',
};

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

export function getTodayDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getChosenLanguage(): string {
  return localStorage.getItem(STORAGE_KEYS.CHOSEN_LANGUAGE) || 'Spanish';
}

export function saveChosenLanguage(lang: string): void {
  localStorage.setItem(STORAGE_KEYS.CHOSEN_LANGUAGE, lang);
}

export function isOnboarded(): boolean {
  return localStorage.getItem(STORAGE_KEYS.ONBOARDED) === 'true';
}

export function setOnboarded(val: boolean): void {
  localStorage.setItem(STORAGE_KEYS.ONBOARDED, val ? 'true' : 'false');
}

export function getCustomChallenges(): Challenge[] {
  return getJson<Challenge[]>(STORAGE_KEYS.CUSTOM_CHALLENGES, []);
}

export function saveCustomChallenges(challenges: Challenge[]): boolean {
  return setJson(STORAGE_KEYS.CUSTOM_CHALLENGES, challenges);
}

export function getAllChallenges(): Challenge[] {
  const custom = getCustomChallenges();
  return [...INITIAL_CHALLENGES, ...custom];
}

export interface ActiveChallengeState {
  date: string;
  challengeId: string;
  isAccepted: boolean;
  acceptedAt?: number;
}

export function getActiveChallengeState(): ActiveChallengeState | null {
  return getJson<ActiveChallengeState | null>(STORAGE_KEYS.ACTIVE_CHALLENGE, null);
}

export function saveActiveChallengeState(state: ActiveChallengeState | null): boolean {
  return setJson(STORAGE_KEYS.ACTIVE_CHALLENGE, state);
}

export function getSkippedIds(dateStr: string): string[] {
  const map = getJson<Record<string, string[]>>(STORAGE_KEYS.SKIPPED_CHALLENGES, {});
  return map[dateStr] || [];
}

export function addSkippedId(dateStr: string, challengeId: string): void {
  const map = getJson<Record<string, string[]>>(STORAGE_KEYS.SKIPPED_CHALLENGES, {});
  const list = map[dateStr] || [];
  if (!list.includes(challengeId)) {
    list.push(challengeId);
    map[dateStr] = list;
    setJson(STORAGE_KEYS.SKIPPED_CHALLENGES, map);
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

  // Filter out skipped
  const candidates = challenges.filter(c => !skippedIds.includes(c.id));
  const pool = candidates.length > 0 ? candidates : challenges;

  // Simple string hash from date string
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
    // Also track in known accounts list
    const accounts = getKnownAccounts();
    const idx = accounts.findIndex(a => a.uid === account.uid);
    if (idx >= 0) {
      accounts[idx] = account;
    } else {
      accounts.push(account);
    }
    setJson(STORAGE_KEYS.LOCAL_ACCOUNTS, accounts);
  } else {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ACCOUNT);
    } catch {}
  }
}

export function getKnownAccounts(): AppAccount[] {
  return getJson<AppAccount[]>(STORAGE_KEYS.LOCAL_ACCOUNTS, []);
}

// Diary Entries with optional userId isolation
export function getDiaryEntries(userId?: string): DiaryEntry[] {
  const userKey = userId ? `${STORAGE_KEYS.DIARY_ENTRIES}_${userId}` : STORAGE_KEYS.DIARY_ENTRIES;
  let list = getJson<DiaryEntry[]>(userKey, []);
  
  // If user-specific key is empty but global exists, migrate/fallback
  if (userId && list.length === 0) {
    const globalList = getJson<DiaryEntry[]>(STORAGE_KEYS.DIARY_ENTRIES, []);
    const matching = globalList.filter(e => !e.userId || e.userId === userId);
    if (matching.length > 0) {
      list = matching;
      setJson(userKey, list);
    }
  }

  return list.sort((a, b) => b.timestamp - a.timestamp);
}

export function saveDiaryEntries(entries: DiaryEntry[], userId?: string): boolean {
  const userKey = userId ? `${STORAGE_KEYS.DIARY_ENTRIES}_${userId}` : STORAGE_KEYS.DIARY_ENTRIES;
  setJson(STORAGE_KEYS.DIARY_ENTRIES, entries); // Keep global synced as well
  return setJson(userKey, entries);
}

export function saveOrUpdateEntry(entry: DiaryEntry, userId?: string): { success: boolean; error?: string } {
  try {
    const activeUid = userId || entry.userId;
    const list = getDiaryEntries(activeUid);
    const existingIndex = list.findIndex(e => e.id === entry.id);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...entry, userId: activeUid };
    } else {
      list.unshift({ ...entry, userId: activeUid });
    }
    const ok = saveDiaryEntries(list, activeUid);
    
    // Cloud sync to Firestore if user has a valid cloud account
    if (activeUid) {
      const entryRef = doc(db, 'users', activeUid, 'entries', entry.id);
      const firestoreData = Object.fromEntries(
        Object.entries({ ...entry, userId: activeUid }).filter(([_, v]) => v !== undefined)
      );
      setDoc(entryRef, firestoreData, { merge: true }).catch(err => {
        console.warn('Firestore entry sync error:', err);
      });
    }

    if (!ok) {
      return { success: false, error: 'Storage quota reached. Consider exporting older entries.' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Storage error' };
  }
}

export function deleteDiaryEntry(id: string, userId?: string): boolean {
  const list = getDiaryEntries(userId).filter(e => e.id !== id);
  const ok = saveDiaryEntries(list, userId);
  if (userId) {
    const entryRef = doc(db, 'users', userId, 'entries', id);
    deleteDoc(entryRef).catch(err => {
      console.warn('Firestore delete error:', err);
    });
  }
  return ok;
}

// Subscribe to real-time entries from Firestore for a given user
export function subscribeToUserDiary(userId: string, onUpdate: (entries: DiaryEntry[]) => void): () => void {
  try {
    const entriesRef = collection(db, 'users', userId, 'entries');
    const q = query(entriesRef, orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cloudEntries: DiaryEntry[] = [];
      snapshot.forEach((docSnap) => {
        cloudEntries.push(docSnap.data() as DiaryEntry);
      });
      // Save locally to cache and notify
      saveDiaryEntries(cloudEntries);
      onUpdate(cloudEntries);
    }, (error) => {
      console.warn('Firestore entries subscription:', error);
    });
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe to user diary:', err);
    return () => {};
  }
}

// Subscribe to custom challenges from Firestore
export function subscribeToUserCustomChallenges(userId: string, onUpdate: (challenges: Challenge[]) => void): () => void {
  try {
    const collRef = collection(db, 'users', userId, 'customChallenges');
    const unsubscribe = onSnapshot(collRef, (snapshot) => {
      const list: Challenge[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Challenge);
      });
      saveCustomChallenges(list);
      onUpdate(list);
    }, (error) => {
      console.warn('Firestore custom challenges subscription:', error);
    });
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe to custom challenges:', err);
    return () => {};
  }
}

// Sync any existing local data up to Firestore on login
export async function syncLocalEntriesToFirestore(userId: string): Promise<void> {
  try {
    const local = getDiaryEntries();
    for (const entry of local) {
      const entryRef = doc(db, 'users', userId, 'entries', entry.id);
      const cleanData = Object.fromEntries(
        Object.entries(entry).filter(([_, v]) => v !== undefined)
      );
      await setDoc(entryRef, { ...cleanData, userId }, { merge: true });
    }

    const localCustom = getCustomChallenges();
    for (const ch of localCustom) {
      const chRef = doc(db, 'users', userId, 'customChallenges', ch.id);
      const cleanData = Object.fromEntries(
        Object.entries(ch).filter(([_, v]) => v !== undefined)
      );
      await setDoc(chRef, { ...cleanData, userId }, { merge: true });
    }
  } catch (err) {
    console.warn('Error during cloud sync:', err);
  }
}

// Client-side image compression
export async function compressImageFile(file: File, maxDim = 900, quality = 0.72): Promise<string> {
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
        // Export to JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
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
      // Seek slightly forward to get a clear frame
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

  const header = `==============================================\n` +
                 `TONGUE-TIED — MY EMPATHY CHALLENGE DIARY\n` +
                 `Personal reflections on the language barrier\n` +
                 `Exported: ${new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}\n` +
                 `Total Reflections: ${entries.length}\n` +
                 `==============================================\n\n`;

  const body = entries.map((e, index) => {
    const dateFormatted = new Date(e.timestamp).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `ENTRY #${entries.length - index}\n` +
           `Date: ${dateFormatted}\n` +
           `Challenge: ${e.challengeTitle} (${e.challengeDifficulty})\n` +
           (e.languageAttempted ? `Language Attempted: ${e.languageAttempted}\n` : '') +
           (e.wordsSpoken ? `Words/Phrases Spoken: "${e.wordsSpoken}"\n` : '') +
           `Mood Before: ${e.beforeMood}  -->  Mood After: ${e.afterMood}\n` +
           (e.surprise ? `What Surprised Me: ${e.surprise}\n` : '') +
           (e.locationName ? `Location: ${e.locationName}\n` : '') +
           `\nReflection:\n${e.description}\n` +
           `----------------------------------------------\n`;
  }).join('\n');

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
  const found = all.find(m => m.id === mood || m.label.toLowerCase() === mood.toLowerCase());
  return found ? found.emoji : '💬';
}

export function getMoodLabel(mood: string): string {
  const all = [...MOODS_BEFORE, ...MOODS_AFTER];
  const found = all.find(m => m.id === mood || m.label.toLowerCase() === mood.toLowerCase());
  return found ? found.label : mood;
}
