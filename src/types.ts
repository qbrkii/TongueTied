export type Difficulty = 'Gentle' | 'Brave' | 'Bold';
export type ChallengeApproach = 'spoken-foreign' | 'non-verbal' | 'hybrid';

export interface UsefulPhrase {
  phrase: string;
  pronunciation?: string;
  meaning: string;
  language: string;
  langCode: string; // for speechSynthesis
}

export interface Challenge {
  id: string;
  title: string;
  instructions: string;
  difficulty: Difficulty;
  estimatedTime: string;
  whyThisMatters: string;
  practicalTip: string;
  safetyNote: string;
  isCustom?: boolean;
  category?: string;
  suggestedProps?: string;
  approachType?: ChallengeApproach;
  recommendedLanguages?: string[];
  helperPhrases?: UsefulPhrase[];
}

export type MoodType = 
  | 'nervous'
  | 'awkward'
  | 'hesitant'
  | 'curious'
  | 'calm'
  | 'relieved'
  | 'proud'
  | 'humbled'
  | 'connected'
  | 'amazed';

export interface MoodOption {
  id: MoodType;
  label: string;
  emoji: string;
  phase: 'before' | 'after';
}

export interface DiaryEntry {
  id: string;
  userId?: string;
  challengeId: string;
  challengeTitle: string;
  challengeDifficulty: Difficulty;
  date: string; // YYYY-MM-DD
  timestamp: number;
  description: string;
  beforeMood: MoodType | string;
  afterMood: MoodType | string;
  surprise?: string;
  photoUrl?: string; // compressed base64 JPEG
  videoPosterUrl?: string;
  mediaType?: 'image' | 'video';
  isFavorite: boolean;
  locationName?: string;
  languageAttempted?: string;
  wordsSpoken?: string;
}

export interface UserStats {
  totalCompleted: number;
  currentStreak: number;
  activeDaysCount: number;
  favoriteCount: number;
}

export interface AppAccount {
  uid: string;
  email: string;
  displayName: string;
  isGuest?: boolean;
  avatarSeed?: string;
  createdAt: number;
}

