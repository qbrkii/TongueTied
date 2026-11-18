import React, { useState, useEffect } from 'react';
import { X, Lock, Globe2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Challenge, ChallengeSetting, Difficulty, UsefulPhrase } from '../types';
import { LANGUAGE_PACKS } from '../data/foreignPhrases';

interface CustomChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (challenge: Challenge) => void;
  editingChallenge?: Challenge | null;
  defaultLanguage?: string;
}

export const CustomChallengeModal: React.FC<CustomChallengeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingChallenge,
  defaultLanguage = 'Spanish',
}) => {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [language, setLanguage] = useState(defaultLanguage);
  const [difficulty, setDifficulty] = useState<Difficulty>('Gentle');
  const [setting, setSetting] = useState<ChallengeSetting>('public place');
  const [topic, setTopic] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Optional example phrase fields
  const [showPhraseFields, setShowPhraseFields] = useState(false);
  const [phraseText, setPhraseText] = useState('');
  const [phrasePronunciation, setPhrasePronunciation] = useState('');
  const [phraseMeaning, setPhraseMeaning] = useState('');

  // Optional extras (smart defaults)
  const [estimatedTime, setEstimatedTime] = useState('5 mins');
  const [whyThisMatters, setWhyThisMatters] = useState('');
  const [practicalTip, setPracticalTip] = useState('');
  const [safetyNote, setSafetyNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingChallenge) {
        setTitle(editingChallenge.title || '');
        setInstructions(editingChallenge.instructions || '');
        setLanguage(editingChallenge.language || defaultLanguage);
        setDifficulty(editingChallenge.difficulty || 'Gentle');
        setSetting(editingChallenge.setting || 'public place');
        setTopic(editingChallenge.topic || '');
        setIsPublic(Boolean(editingChallenge.isPublic));
        setEstimatedTime(editingChallenge.estimatedTime || '5 mins');
        setWhyThisMatters(editingChallenge.whyThisMatters || '');
        setPracticalTip(editingChallenge.practicalTip || '');
        setSafetyNote(editingChallenge.safetyNote || '');

        if (editingChallenge.examplePhrase || (editingChallenge.helperPhrases && editingChallenge.helperPhrases[0])) {
          const ep = editingChallenge.examplePhrase || editingChallenge.helperPhrases![0];
          setPhraseText(ep.phrase || '');
          setPhrasePronunciation(ep.pronunciation || '');
          setPhraseMeaning(ep.meaning || '');
          setShowPhraseFields(true);
        } else {
          setPhraseText('');
          setPhrasePronunciation('');
          setPhraseMeaning('');
          setShowPhraseFields(false);
        }
      } else {
        // Reset to clean defaults
        setTitle('');
        setInstructions('');
        setLanguage(defaultLanguage);
        setDifficulty('Gentle');
        setSetting('public place');
        setTopic('');
        setIsPublic(false);
        setPhraseText('');
        setPhrasePronunciation('');
        setPhraseMeaning('');
        setShowPhraseFields(false);
        setEstimatedTime('5 mins');
        setWhyThisMatters('');
        setPracticalTip('');
        setSafetyNote('');
      }
      setError(null);
    }
  }, [isOpen, editingChallenge, defaultLanguage]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !instructions.trim()) {
      setError('Please provide a title and what you will try to do.');
      return;
    }

    const langPack = LANGUAGE_PACKS.find(p => p.name.toLowerCase() === language.toLowerCase());
    const langCode = langPack?.langCode || 'es-ES';

    let examplePhraseObj: UsefulPhrase | undefined;
    if (phraseText.trim()) {
      examplePhraseObj = {
        id: `phr-${Date.now()}`,
        phrase: phraseText.trim(),
        pronunciation: phrasePronunciation.trim() || undefined,
        meaning: phraseMeaning.trim() || phraseText.trim(),
        language,
        langCode,
        isCustom: true,
        isPublic,
      };
    }

    const savedChallenge: Challenge = {
      id: editingChallenge?.id || `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      instructions: instructions.trim(),
      language,
      difficulty,
      setting,
      topic: topic.trim() || undefined,
      isPublic,
      isCustom: true,
      estimatedTime: estimatedTime.trim() || '5 mins',
      whyThisMatters: whyThisMatters.trim(),
      practicalTip: practicalTip.trim() || 'Smile warmly, breathe, and keep gestures polite and relaxed.',
      safetyNote: safetyNote.trim() || 'Never ask for personal info; skip anytime without penalty.',
      category: 'Custom',
      examplePhrase: examplePhraseObj,
      helperPhrases: examplePhraseObj ? [examplePhraseObj] : [],
    };

    onSave(savedChallenge);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-xl border border-slate-200 text-slate-800 relative flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-sky-50/50">
          <div>
            <h2 className="text-base font-serif font-bold text-slate-900">
              {editingChallenge ? 'Edit Challenge' : 'Create Custom Challenge'}
            </h2>
            <p className="text-[11px] text-slate-500">
              Design your own real-world speaking or empathy micro-challenge
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          
          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
              {error}
            </p>
          )}

          {/* 1. Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Challenge Title <span className="text-sky-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Order Pan Dulce with Warm Greeting"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white"
            />
          </div>

          {/* 2. What user will try to do */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              What You Will Try To Do <span className="text-sky-600">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g., Go to the neighborhood bakery counter, greet in Spanish, and ask for two pastries while pointing politely."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white resize-none"
            />
          </div>

          {/* 3. Language, Difficulty & Setting */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white cursor-pointer"
              >
                {LANGUAGE_PACKS.map(p => (
                  <option key={p.name} value={p.name}>
                    {p.flag} {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white cursor-pointer"
              >
                <option value="Gentle">Gentle</option>
                <option value="Brave">Brave</option>
                <option value="Bold">Bold</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Setting
              </label>
              <select
                value={setting}
                onChange={(e) => setSetting(e.target.value as ChallengeSetting)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white cursor-pointer"
              >
                <option value="public place">Public place</option>
                <option value="school">School</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>

          {/* 4. Optional Topic / Interest */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1 flex items-center justify-between">
              <span>Optional Topic or Interest</span>
              <span className="text-[10px] text-slate-400 font-normal lowercase">optional</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Coffee & Bakeries, Transit, Markets"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>

          {/* 5. Optional Example Phrase (Collapsible section to avoid clutter) */}
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/50">
            <button
              type="button"
              onClick={() => setShowPhraseFields(!showPhraseFields)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Example Practice Phrase</span>
                <span className="text-[10px] font-normal text-slate-400">(optional)</span>
              </span>
              {showPhraseFields ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showPhraseFields && (
              <div className="p-3.5 border-t border-slate-200 space-y-2.5 bg-white">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Phrase in {language}
                  </label>
                  <input
                    type="text"
                    value={phraseText}
                    onChange={(e) => setPhraseText(e.target.value)}
                    placeholder="e.g., Dos de estos, por favor"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Phonetic Guide
                    </label>
                    <input
                      type="text"
                      value={phrasePronunciation}
                      onChange={(e) => setPhrasePronunciation(e.target.value)}
                      placeholder="dohs day EHS-tohs..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Meaning
                    </label>
                    <input
                      type="text"
                      value={phraseMeaning}
                      onChange={(e) => setPhraseMeaning(e.target.value)}
                      placeholder="Two of these, please"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 6. Public vs Private Toggle */}
          <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                {isPublic ? (
                  <>
                    <Globe2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>Public Challenge & Phrase</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Private to Your Profile</span>
                  </>
                )}
              </span>
              <p className="text-[11px] text-slate-500">
                {isPublic
                  ? 'Can be shared or discovered by other learners'
                  : 'Only visible on your device or linked account'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              onClick={() => setIsPublic(!isPublic)}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                isPublic ? 'bg-sky-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-2xs" />
            </button>
          </div>

        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            {editingChallenge ? 'Save Changes' : 'Save Challenge'}
          </button>
        </div>

      </div>
    </div>
  );
};
