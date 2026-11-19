import { Challenge, ChallengeSetting, Difficulty, UserPreferences } from '../types';
import { LANGUAGE_PACKS } from '../data/foreignPhrases';

const VALID_SETTINGS: ChallengeSetting[] = ['public place', 'school', 'online'];
const VALID_DIFFICULTIES: Difficulty[] = ['Gentle', 'Brave', 'Bold'];

function mapParsedChallenge(
  parsed: any,
  prefs: UserPreferences,
  idPrefix: string,
  extra?: Partial<Challenge>
): Challenge {
  const langPack = LANGUAGE_PACKS.find(
    (p) => p.name.toLowerCase() === prefs.language.toLowerCase()
  );
  const langCode = langPack?.langCode || 'es-ES';

  const challenge: Challenge = {
    id: `${idPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: parsed.title || 'Micro Interaction',
    instructions: parsed.instructions || '',
    difficulty: VALID_DIFFICULTIES.includes(parsed.difficulty) ? parsed.difficulty : 'Gentle',
    setting: VALID_SETTINGS.includes(parsed.setting) ? parsed.setting : 'public place',
    estimatedTime: parsed.estimatedTime || '5 mins',
    whyThisMatters: parsed.whyThisMatters || '',
    practicalTip:
      parsed.practicalTip || 'Breathe, smile, and keep your body language open and relaxed.',
    safetyNote:
      parsed.safetyNote || 'Never ask for personal info; you can always skip without penalty.',
    language: prefs.language,
    topic: parsed.topic || prefs.topics?.[0] || 'Everyday',
    isAiGenerated: true,
    isCustom: false,
    isPublic: false,
    ...extra,
  };

  if (parsed.examplePhrase && parsed.examplePhrase.phrase) {
    challenge.examplePhrase = {
      id: `phr-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      phrase: parsed.examplePhrase.phrase,
      pronunciation: parsed.examplePhrase.pronunciation,
      meaning: parsed.examplePhrase.meaning,
      language: prefs.language,
      langCode,
      isCustom: false,
      isPublic: true,
    };
    challenge.helperPhrases = [challenge.examplePhrase];
  }

  return challenge;
}

/**
 * Generate a single random AI Challenge based on preferences via Server-Side Gemini API.
 * Throws genuinely on server/API failure rather than returning fake presets.
 */
export async function generateRandomChallenge(
  prefs: UserPreferences,
  targetDifficulty?: Difficulty
): Promise<Challenge> {
  const effectivePrefs: UserPreferences = targetDifficulty
    ? { ...prefs, difficultyPreference: targetDifficulty }
    : prefs;

  const res = await fetch('/api/gemini/generate-challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefs: effectivePrefs }),
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    throw new Error(`AI service returned status ${res.status}. Please try again.`);
  }

  if (!res.ok || !data?.success || !data?.challenge) {
    throw new Error(
      data?.error || 'The AI service could not generate a challenge right now. Please try again.'
    );
  }

  return mapParsedChallenge(data.challenge, effectivePrefs, 'gemini');
}

/**
 * Generate an Arranged Sequence of challenges progressing from easier to more challenging via Server API.
 * Throws genuinely on server/API failure rather than returning fake presets.
 */
export async function generateArrangedSequence(
  prefs: UserPreferences,
  count: number = 3
): Promise<Challenge[]> {
  const safeCount = Math.max(2, Math.min(count, 7));

  const res = await fetch('/api/gemini/generate-sequence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefs, count: safeCount }),
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    throw new Error(`AI service returned status ${res.status}. Please try again.`);
  }

  if (!res.ok || !data?.success || !Array.isArray(data?.sequence) || data.sequence.length === 0) {
    throw new Error(
      data?.error || 'The AI service could not generate a sequence right now. Please try again.'
    );
  }

  return data.sequence.map((item: any, idx: number) =>
    mapParsedChallenge(item, prefs, `seq-${idx}`, {
      sequenceOrder: idx + 1,
      sequenceTotal: data.sequence.length,
      isSequenceStep: true,
      completed: false,
    })
  );
}
