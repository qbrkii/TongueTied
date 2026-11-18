export type Difficulty = 'Gentle' | 'Brave' | 'Bold';
export type ChallengeSetting = 'public place' | 'school' | 'online';
export type ChallengeApproach = 'spoken-foreign' | 'non-verbal' | 'hybrid';

export interface UsefulPhrase {
  id?: string;
  phrase: string;
  pronunciation?: string;
  meaning: string;
  language: string;
  langCode: string; // for speechSynthesis
  isCustom?: boolean;
  isPublic?: boolean; // public or private toggle
  topic?: string;
  createdAt?: number;
}

export interface Challenge {
  id: string;
  title: string;
  instructions: string;
  difficulty: Difficulty;
  setting?: ChallengeSetting;
  estimatedTime: string;
  whyThisMatters: string;
  practicalTip: string;
  safetyNote: string;
  isCustom?: boolean;
  isAiGenerated?: boolean;
  category?: string;
  suggestedProps?: string;
  approachType?: ChallengeApproach;
  recommendedLanguages?: string[];
  helperPhrases?: UsefulPhrase[];
  // User creation & AI generation fields
  language?: string;
  topic?: string;
  examplePhrase?: UsefulPhrase;
  isPublic?: boolean;
  // Arranged sequence fields
  sequenceOrder?: number;
  sequenceTotal?: number;
  isSequenceStep?: boolean;
  completed?: boolean;
  saved?: boolean;
}

export type ProficiencyLevel = 
  | 'Absolute Beginner' 
  | 'Advanced Beginner' 
  | 'Intermediate' 
  | 'Advanced';

export type DifficultyPreference = 'Gentle' | 'Brave' | 'Bold' | 'Adaptive';

export interface UserPreferences {
  language: string;
  proficiency: ProficiencyLevel;
  topics: string[];
  difficultyPreference: DifficultyPreference;
  socialSettings: string;
  communityContext: string;
}

export type ColorTheme = 'sky' | 'sage' | 'amber' | 'lavender' | 'rose';
export type DisplayFormat = 'comfortable' | 'compact';

export interface ThemePreferences {
  colorTheme: ColorTheme;
  displayFormat: DisplayFormat;
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


