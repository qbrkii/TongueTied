import { UsefulPhrase } from '../types';

export interface LanguagePack {
  code: string;
  langCode: string;
  name: string;
  flag: string;
  nativeName: string;
  proverb: {
    quote: string;
    meaning: string;
  };
  phrases: UsefulPhrase[];
}

export const LANGUAGE_PACKS: LanguagePack[] = [
  {
    code: 'es',
    langCode: 'es-ES',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    proverb: {
      quote: 'Poco a poco se anda lejos',
      meaning: 'Little by little, one walks far',
    },
    phrases: [
      { phrase: 'Hola, buenos días', pronunciation: 'OH-lah BWEH-nohs DEE-ahs', meaning: 'Hello, good morning', language: 'Spanish', langCode: 'es-ES' },
      { phrase: 'Por favor', pronunciation: 'por fah-VOR', meaning: 'Please', language: 'Spanish', langCode: 'es-ES' },
      { phrase: 'Muchas gracias', pronunciation: 'MOO-chahs GRAH-see-ahs', meaning: 'Thank you very much', language: 'Spanish', langCode: 'es-ES' },
      { phrase: '¿Cuánto cuesta esto?', pronunciation: 'KWAHN-toh KWEHS-tah EHS-toh?', meaning: 'How much does this cost?', language: 'Spanish', langCode: 'es-ES' },
      { phrase: 'Estoy aprendiendo su idioma', pronunciation: 'ehs-TOY ah-pren-dee-EN-doh soo ee-dee-OH-mah', meaning: 'I am learning your language', language: 'Spanish', langCode: 'es-ES' },
      { phrase: '¿Me puede recomendar algo rico?', pronunciation: 'meh PWEH-deh reh-koh-men-DAR AHL-goh REE-koh?', meaning: 'Can you recommend something tasty?', language: 'Spanish', langCode: 'es-ES' },
      { phrase: 'Disculpe, ¿me puede ayudar?', pronunciation: 'dees-KOOL-peh, meh PWEH-deh ah-yoo-DAR?', meaning: 'Excuse me, could you help me?', language: 'Spanish', langCode: 'es-ES' }
    ]
  },
  {
    code: 'fr',
    langCode: 'fr-FR',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    proverb: {
      quote: 'Petit à petit, l’oiseau fait son nid',
      meaning: 'Step by step, the bird builds its nest',
    },
    phrases: [
      { phrase: 'Bonjour', pronunciation: 'bohn-ZHOOR', meaning: 'Hello / Good day', language: 'French', langCode: 'fr-FR' },
      { phrase: 'S’il vous plaît', pronunciation: 'seel voo PLEH', meaning: 'Please', language: 'French', langCode: 'fr-FR' },
      { phrase: 'Merci beaucoup', pronunciation: 'mehr-SEE boh-KOO', meaning: 'Thank you very much', language: 'French', langCode: 'fr-FR' },
      { phrase: 'C’est délicieux !', pronunciation: 'seh deh-lee-SYUH', meaning: 'This is delicious!', language: 'French', langCode: 'fr-FR' },
      { phrase: 'Pardon, je m’entraîne à parler français', pronunciation: 'par-DOHN, zhuh mahn-TREN ah par-LEH frahn-SEH', meaning: 'Pardon, I am practicing speaking French', language: 'French', langCode: 'fr-FR' },
      { phrase: 'Quel est votre plat préféré ?', pronunciation: 'kel eh voht-ruh plah pray-fay-RAY?', meaning: 'What is your favorite dish?', language: 'French', langCode: 'fr-FR' }
    ]
  },
  {
    code: 'ja',
    langCode: 'ja-JP',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    proverb: {
      quote: '一期一会 (Ichigo ichie)',
      meaning: 'Treasure every encounter, for it is once in a lifetime',
    },
    phrases: [
      { phrase: 'Konnichiwa (こんにちは)', pronunciation: 'kohn-nee-chee-wah', meaning: 'Hello / Good afternoon', language: 'Japanese', langCode: 'ja-JP' },
      { phrase: 'Arigatou gozaimasu (ありがとうございます)', pronunciation: 'ah-ree-GAH-toh goh-ZYE-mahs', meaning: 'Thank you very much', language: 'Japanese', langCode: 'ja-JP' },
      { phrase: 'Sumimasen (すみません)', pronunciation: 'soo-mee-mah-SEN', meaning: 'Excuse me / Sorry', language: 'Japanese', langCode: 'ja-JP' },
      { phrase: 'Kore o kudasai (これをください)', pronunciation: 'KOH-reh oh koo-dah-SYE', meaning: 'This one, please', language: 'Japanese', langCode: 'ja-JP' },
      { phrase: 'Oishii desu! (おいしいです！)', pronunciation: 'oy-SHEE dess', meaning: 'It is delicious!', language: 'Japanese', langCode: 'ja-JP' },
      { phrase: 'Osusume wa nan desu ka? (おすすめは何ですか？)', pronunciation: 'oh-soo-soo-meh wah nahn dess kah?', meaning: 'What do you recommend?', language: 'Japanese', langCode: 'ja-JP' }
    ]
  },
  {
    code: 'zh',
    langCode: 'zh-CN',
    name: 'Mandarin',
    nativeName: '中文',
    flag: '🇨🇳',
    proverb: {
      quote: '千里之行，始于足下',
      meaning: 'A journey of a thousand miles begins with a single step',
    },
    phrases: [
      { phrase: 'Nǐ hǎo (你好)', pronunciation: 'nee how', meaning: 'Hello', language: 'Mandarin', langCode: 'zh-CN' },
      { phrase: 'Xièxiè nǐ (谢谢你)', pronunciation: 'shyeh-shyeh nee', meaning: 'Thank you', language: 'Mandarin', langCode: 'zh-CN' },
      { phrase: 'Bù hǎoyìsi (不好意思)', pronunciation: 'boo how-yee-suh', meaning: 'Excuse me / Pardon me', language: 'Mandarin', langCode: 'zh-CN' },
      { phrase: 'Zhège duōshǎo qián? (这个多少钱？)', pronunciation: 'juh-guh dwoh-shaow chyen?', meaning: 'How much is this?', language: 'Mandarin', langCode: 'zh-CN' },
      { phrase: 'Hěn hào chī! (很好吃！)', pronunciation: 'hun how chir', meaning: 'Very delicious!', language: 'Mandarin', langCode: 'zh-CN' },
      { phrase: 'Wǒ zài xuéxí zhōngwén (我在学习中文)', pronunciation: 'woh dzy shweh-shee jong-wen', meaning: 'I am learning Chinese', language: 'Mandarin', langCode: 'zh-CN' }
    ]
  },
  {
    code: 'ar',
    langCode: 'ar-SA',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    proverb: {
      quote: 'من جدَّ وجد',
      meaning: 'Whoever strives with patience and courage will succeed',
    },
    phrases: [
      { phrase: 'Marhaban (مرحبا)', pronunciation: 'MAR-hah-bahn', meaning: 'Hello', language: 'Arabic', langCode: 'ar-SA' },
      { phrase: 'Shukran jazilan (شكراً جزيلاً)', pronunciation: 'SHOOK-ran jah-ZEE-lan', meaning: 'Thank you very much', language: 'Arabic', langCode: 'ar-SA' },
      { phrase: 'Min fadlak (من فضلك)', pronunciation: 'min FAD-lak', meaning: 'Please (to male) / Min fadlik (to female)', language: 'Arabic', langCode: 'ar-SA' },
      { phrase: 'Afwan (عفواً)', pronunciation: 'AF-wan', meaning: 'You’re welcome / Pardon', language: 'Arabic', langCode: 'ar-SA' },
      { phrase: 'Lazeez jiddan! (لذيذ جداً)', pronunciation: 'lah-ZEEZ jeed-dan', meaning: 'Very delicious!', language: 'Arabic', langCode: 'ar-SA' }
    ]
  },
  {
    code: 'it',
    langCode: 'it-IT',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    proverb: {
      quote: 'Chi va piano va sano e va lontano',
      meaning: 'Who goes calmly goes safely and goes far',
    },
    phrases: [
      { phrase: 'Buongiorno', pronunciation: 'bwon-JOHR-noh', meaning: 'Good morning / Hello', language: 'Italian', langCode: 'it-IT' },
      { phrase: 'Per favore', pronunciation: 'pehr fah-VOH-reh', meaning: 'Please', language: 'Italian', langCode: 'it-IT' },
      { phrase: 'Grazie mille', pronunciation: 'GRAHT-syeh MEEL-leh', meaning: 'Thank you very much', language: 'Italian', langCode: 'it-IT' },
      { phrase: 'Quanto costa?', pronunciation: 'KWAHN-toh KOH-stah?', meaning: 'How much does it cost?', language: 'Italian', langCode: 'it-IT' },
      { phrase: 'È buonissimo!', pronunciation: 'eh bwon-EES-see-moh', meaning: 'It is super delicious!', language: 'Italian', langCode: 'it-IT' },
      { phrase: 'Cosa mi consiglia?', pronunciation: 'KOH-zah mee kohn-SEEL-yah?', meaning: 'What do you recommend to me?', language: 'Italian', langCode: 'it-IT' }
    ]
  },
  {
    code: 'de',
    langCode: 'de-DE',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    proverb: {
      quote: 'Übung macht den Meister',
      meaning: 'Practice makes the master',
    },
    phrases: [
      { phrase: 'Guten Tag', pronunciation: 'GOO-ten TAHK', meaning: 'Good day / Hello', language: 'German', langCode: 'de-DE' },
      { phrase: 'Bitte', pronunciation: 'BIT-tuh', meaning: 'Please / You’re welcome', language: 'German', langCode: 'de-DE' },
      { phrase: 'Vielen Dank', pronunciation: 'FEE-len DAHNK', meaning: 'Many thanks', language: 'German', langCode: 'de-DE' },
      { phrase: 'Entschuldigung', pronunciation: 'ent-SHOOL-dee-goong', meaning: 'Excuse me', language: 'German', langCode: 'de-DE' },
      { phrase: 'Das schmeckt wunderbar!', pronunciation: 'dahs shmekt VOON-der-bar', meaning: 'That tastes wonderful!', language: 'German', langCode: 'de-DE' }
    ]
  },
  {
    code: 'vi',
    langCode: 'vi-VN',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    proverb: {
      quote: 'Có công mài sắt, có ngày nên kim',
      meaning: 'With perseverance, iron becomes a needle',
    },
    phrases: [
      { phrase: 'Xin chào', pronunciation: 'sin chow', meaning: 'Hello', language: 'Vietnamese', langCode: 'vi-VN' },
      { phrase: 'Cảm ơn rất nhiều', pronunciation: 'gahm uhn ruht nyew', meaning: 'Thank you very much', language: 'Vietnamese', langCode: 'vi-VN' },
      { phrase: 'Làm ơn', pronunciation: 'lahm uhn', meaning: 'Please', language: 'Vietnamese', langCode: 'vi-VN' },
      { phrase: 'Ngon quá!', pronunciation: 'ngawn kwah', meaning: 'So delicious!', language: 'Vietnamese', langCode: 'vi-VN' }
    ]
  },
  {
    code: 'ko',
    langCode: 'ko-KR',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    proverb: {
      quote: '시작이 반이다 (Sijak-i ban-ida)',
      meaning: 'Starting is already half the battle',
    },
    phrases: [
      { phrase: 'Annyeonghaseyo (안녕하세요)', pronunciation: 'ahn-nyong-hah-seh-yoh', meaning: 'Hello', language: 'Korean', langCode: 'ko-KR' },
      { phrase: 'Gamsahamnida (감사합니다)', pronunciation: 'gahm-sah-hahm-nee-dah', meaning: 'Thank you', language: 'Korean', langCode: 'ko-KR' },
      { phrase: 'Igeo juseyo (이거 주세요)', pronunciation: 'ee-gaw joo-seh-yoh', meaning: 'Please give me this one', language: 'Korean', langCode: 'ko-KR' },
      { phrase: 'Mashisseoyo! (맛있어요!)', pronunciation: 'mah-shee-saw-yoh', meaning: 'It’s delicious!', language: 'Korean', langCode: 'ko-KR' },
      { phrase: 'Chucheonhae juseyo (추천해 주세요)', pronunciation: 'choo-chun-heh joo-seh-yoh', meaning: 'Please recommend something', language: 'Korean', langCode: 'ko-KR' }
    ]
  }
];

export function getLanguagePackByName(nameOrCode?: string): LanguagePack {
  if (!nameOrCode) return LANGUAGE_PACKS[0];
  const query = nameOrCode.trim().toLowerCase();
  const match = LANGUAGE_PACKS.find(
    p => p.name.toLowerCase() === query || 
         p.code.toLowerCase() === query ||
         p.nativeName.toLowerCase() === query
  );
  return match || LANGUAGE_PACKS[0];
}

export function speakPhrase(text: string, langCode: string): void {
  if (!('speechSynthesis' in window)) {
    return;
  }
  try {
    window.speechSynthesis.cancel();
    // Clean out parenthetical translations before speaking so text-to-speech speaks the authentic phrase
    const cleanText = text.replace(/\(.*?\)/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText || text);
    utterance.lang = langCode;
    utterance.rate = 0.82; // gentle, deliberate pace for learning
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

