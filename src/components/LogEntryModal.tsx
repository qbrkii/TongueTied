import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Camera, Heart, Sparkles, Check, 
  Trash2, AlertCircle, Video
} from 'lucide-react';
import { Challenge, DiaryEntry, MoodType } from '../types';
import { 
  MOODS_BEFORE, MOODS_AFTER, compressImageFile, 
  compressVideoPoster, getTodayDateString 
} from '../utils/storage';
import { getLanguagePackByName } from '../data/foreignPhrases';

interface LogEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeChallenge: Challenge;
  allChallenges: Challenge[];
  existingEntry?: DiaryEntry | null;
  chosenLanguage?: string;
  onSave: (entry: DiaryEntry) => { success: boolean; error?: string };
}

export const LogEntryModal: React.FC<LogEntryModalProps> = ({
  isOpen,
  onClose,
  activeChallenge,
  allChallenges,
  existingEntry,
  chosenLanguage = 'Spanish',
  onSave,
}) => {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(
    existingEntry ? existingEntry.challengeId : activeChallenge.id
  );
  const [description, setDescription] = useState<string>(existingEntry?.description || '');
  const [beforeMood, setBeforeMood] = useState<MoodType>(
    (existingEntry?.beforeMood as MoodType) || 'nervous'
  );
  const [afterMood, setAfterMood] = useState<MoodType>(
    (existingEntry?.afterMood as MoodType) || 'relieved'
  );
  const [surprise, setSurprise] = useState<string>(existingEntry?.surprise || '');
  const [isFavorite, setIsFavorite] = useState<boolean>(existingEntry?.isFavorite || false);
  const [locationName, setLocationName] = useState<string>(existingEntry?.locationName || '');
  const [languageAttempted, setLanguageAttempted] = useState<string>(existingEntry?.languageAttempted || 'Spanish');
  const [wordsSpoken, setWordsSpoken] = useState<string>(existingEntry?.wordsSpoken || '');

  // Media
  const [mediaDataUrl, setMediaDataUrl] = useState<string | undefined>(existingEntry?.photoUrl);
  const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>(existingEntry?.mediaType || 'image');
  const [isProcessingMedia, setIsProcessingMedia] = useState<boolean>(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (existingEntry) {
        setSelectedChallengeId(existingEntry.challengeId);
        setDescription(existingEntry.description);
        setBeforeMood((existingEntry.beforeMood as MoodType) || 'nervous');
        setAfterMood((existingEntry.afterMood as MoodType) || 'relieved');
        setSurprise(existingEntry.surprise || '');
        setIsFavorite(existingEntry.isFavorite || false);
        setMediaDataUrl(existingEntry.photoUrl);
        setMediaType(existingEntry.mediaType || 'image');
        setLocationName(existingEntry.locationName || '');
        setLanguageAttempted(existingEntry.languageAttempted || 'Spanish');
        setWordsSpoken(existingEntry.wordsSpoken || '');
      } else {
        setSelectedChallengeId(activeChallenge.id);
        setDescription('');
        setBeforeMood('nervous');
        setAfterMood('relieved');
        setSurprise('');
        setIsFavorite(false);
        setMediaDataUrl(undefined);
        setMediaType('image');
        setLocationName('');
        const initialLang = activeChallenge.recommendedLanguages?.[0] || 
          (activeChallenge.approachType === 'non-verbal' ? 'Non-verbal / Gestures' : chosenLanguage);
        setLanguageAttempted(initialLang);
        setWordsSpoken('');
      }
      setMediaError(null);
      setSaveError(null);
    }
  }, [isOpen, existingEntry, activeChallenge, chosenLanguage]);

  if (!isOpen) return null;

  const currentChallenge = allChallenges.find(c => c.id === selectedChallengeId) || activeChallenge;
  const packForChips = getLanguagePackByName(languageAttempted || chosenLanguage);

  const handleInsertPhrase = (phraseText: string) => {
    if (!wordsSpoken) {
      setWordsSpoken(phraseText);
    } else {
      setWordsSpoken(`${wordsSpoken}, ${phraseText}`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaError(null);
    setIsProcessingMedia(true);

    try {
      if (file.type.startsWith('video/')) {
        const posterUrl = await compressVideoPoster(file);
        setMediaDataUrl(posterUrl);
        setMediaType('video');
      } else if (file.type.startsWith('image/')) {
        const compressedUrl = await compressImageFile(file, 900, 0.72);
        setMediaDataUrl(compressedUrl);
        setMediaType('image');
      } else {
        setMediaError('Please upload an image or video file.');
      }
    } catch (err: any) {
      console.error('Media processing error:', err);
      setMediaError(err?.message || 'Failed to process media.');
    } finally {
      setIsProcessingMedia(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveMedia = () => {
    setMediaDataUrl(undefined);
    setMediaType('image');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setSaveError('Please share a short reflection on how it went.');
      return;
    }

    const entryToSave: DiaryEntry = {
      id: existingEntry ? existingEntry.id : `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      challengeId: currentChallenge.id,
      challengeTitle: currentChallenge.title,
      challengeDifficulty: currentChallenge.difficulty,
      date: existingEntry ? existingEntry.date : getTodayDateString(),
      timestamp: existingEntry ? existingEntry.timestamp : Date.now(),
      description: description.trim(),
      beforeMood,
      afterMood,
      surprise: surprise.trim() || undefined,
      photoUrl: mediaDataUrl,
      mediaType: mediaDataUrl ? mediaType : undefined,
      isFavorite,
      locationName: locationName.trim() || undefined,
      languageAttempted: languageAttempted.trim() || undefined,
      wordsSpoken: wordsSpoken.trim() || undefined,
    };

    const res = onSave(entryToSave);
    if (!res.success) {
      setSaveError(res.error || 'Failed to save entry.');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-xl border border-slate-200 text-slate-800 relative flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-sky-50/50">
          <div>
            <h2 className="text-base font-serif font-bold text-slate-900">
              {existingEntry ? 'Edit Reflection' : 'Log Experience'}
            </h2>
            <p className="text-xs text-slate-500">
              Personal diary reflection
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          
          {saveError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Associated Challenge */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Challenge
            </label>
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              {allChallenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.difficulty})
                </option>
              ))}
            </select>
          </div>

          {/* Language & Words attempted */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-sky-50/40 p-3.5 rounded-2xl border border-sky-100">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-sky-800 mb-1">
                Language or Mode
              </label>
              <input
                type="text"
                value={languageAttempted}
                onChange={(e) => setLanguageAttempted(e.target.value)}
                placeholder="e.g. Spanish, French, Gestures"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-sky-800 mb-1">
                Words spoken (Optional)
              </label>
              <input
                type="text"
                value={wordsSpoken}
                onChange={(e) => setWordsSpoken(e.target.value)}
                placeholder='e.g. "Hola, una empanada por favor"'
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              {/* Quick suggestion chips */}
              {packForChips.phrases.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                  <span className="text-[10px] text-slate-400 font-medium">Quick add:</span>
                  {packForChips.phrases.slice(0, 3).map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleInsertPhrase(p.phrase.replace(/\(.*?\)/g, '').trim())}
                      className="px-2 py-0.5 rounded-md bg-white hover:bg-sky-50 text-[10px] text-sky-700 border border-slate-200 hover:border-sky-300 transition cursor-pointer"
                      title={p.meaning}
                    >
                      + {p.phrase.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Emotional Shift Section */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Emotional Shift
            </h3>

            {/* Before Mood */}
            <div>
              <span className="block text-[11px] font-medium text-slate-500 mb-1.5">
                Before: How did you feel approaching this?
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {MOODS_BEFORE.map((m) => {
                  const isSel = beforeMood === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setBeforeMood(m.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs transition cursor-pointer ${
                        isSel
                          ? 'bg-sky-50 border-sky-400 text-sky-900 font-semibold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xl mb-0.5">{m.emoji}</span>
                      <span className="text-[11px] leading-tight text-center">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* After Mood */}
            <div>
              <span className="block text-[11px] font-medium text-slate-500 mb-1.5">
                After: How did you feel when done?
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {MOODS_AFTER.map((m) => {
                  const isSel = afterMood === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setAfterMood(m.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs transition cursor-pointer ${
                        isSel
                          ? 'bg-sky-50 border-sky-400 text-sky-900 font-semibold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xl mb-0.5">{m.emoji}</span>
                      <span className="text-[11px] leading-tight text-center">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Written Description */}
          <div>
            <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              What happened? <span className="text-sky-600">*</span>
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="How did the interaction go? What did you try saying or gesturing, and how did they respond?"
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none leading-relaxed"
            />
          </div>

          {/* Surprise line */}
          <div>
            <label htmlFor="surprise" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              What surprised you? (Optional)
            </label>
            <input
              id="surprise"
              type="text"
              value={surprise}
              onChange={(e) => setSurprise(e.target.value)}
              placeholder="e.g. They smiled warmly and patiently tried to guess"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          {/* Location / Context tag */}
          <div>
            <label htmlFor="location" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Location or venue (Optional)
            </label>
            <input
              id="location"
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Corner Bakery, Downtown Transit station"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          {/* Photo / Video Upload */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Photo or Video Proof (Optional)
              </label>
              <span className="text-[11px] text-slate-400">Compressed locally</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {mediaDataUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
                <img
                  src={mediaDataUrl}
                  alt="Challenge evidence"
                  className="w-full h-44 object-cover"
                />
                {mediaType === 'video' && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-white text-[10px] flex items-center gap-1 font-medium">
                    <Video className="w-3 h-3" />
                    <span>Video thumbnail</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    type="button"
                    onClick={handleRemoveMedia}
                    className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition cursor-pointer"
                    title="Remove media"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-sky-300 rounded-xl p-4 text-center cursor-pointer transition bg-white hover:bg-sky-50/30 flex flex-col items-center justify-center gap-1"
              >
                {isProcessingMedia ? (
                  <div className="py-3 flex flex-col items-center text-sky-800 text-xs">
                    <Sparkles className="w-5 h-5 animate-spin mb-1" />
                    <span>Processing media...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center mb-1">
                      <Camera className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-medium text-slate-700">
                      Tap to attach a photo or video
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Receipt, sketch, coffee cup, or selfie
                    </p>
                  </>
                )}
              </div>
            )}

            {mediaError && (
              <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {mediaError}
              </p>
            )}
          </div>

          {/* Favorite Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2.5">
              <Heart className={`w-5 h-5 ${isFavorite ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
              <div>
                <span className="text-xs font-medium text-slate-800 block">Mark as favorite</span>
                <span className="text-[11px] text-slate-500 block">Pin to highlights in your diary</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                isFavorite ? 'bg-rose-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  isFavorite ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-[2] h-12 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm shadow-xs flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save to Diary</span>
          </button>
        </div>
      </div>
    </div>
  );
};
