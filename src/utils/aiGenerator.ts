import { Challenge, ChallengeSetting, Difficulty, UserPreferences, UsefulPhrase } from '../types';
import { LANGUAGE_PACKS } from '../data/foreignPhrases';

// High-quality contextual templates and phrase mappings
const CONTEXT_CHALLENGE_BANK: Record<string, Array<{
  title: string;
  instructions: string;
  difficulty: Difficulty;
  estimatedTime: string;
  whyThisMatters: string;
  practicalTip: string;
  safetyNote: string;
  suggestedProps?: string;
  topic: string;
  phraseTemplate: (lang: string) => { phrase: string; pronunciation: string; meaning: string };
}>> = {
  Gentle: [
    {
      title: 'The Silent Affirmation & Greeting',
      instructions: 'Enter a local café or grocery shop, catch the cashier or clerk’s eye, offer a warm smile, and say a single polite greeting in your target language.',
      difficulty: 'Gentle',
      estimatedTime: '2 mins',
      whyThisMatters: 'Breaks the initial physical friction of speaking without the pressure of a full conversation.',
      practicalTip: 'Take a slow breath before entering. A sincere smile transcends grammar.',
      safetyNote: 'If the person is on a phone call or busy with a line, choose another relaxed moment.',
      topic: 'Coffee & Cafés',
      phraseTemplate: (lang) => getGreetingPhrase(lang),
    },
    {
      title: 'Point & Thank',
      instructions: 'At a bakery, deli counter, or market stall, point to an item in the glass display you would like, and say "Please" and "Thank you" clearly in the target language.',
      difficulty: 'Gentle',
      estimatedTime: '3–5 mins',
      whyThisMatters: 'Combines natural physical gesturing with essential courtesy words to build low-stress muscle memory.',
      practicalTip: 'Keep your shoulders relaxed and nod gently when they hand you the item.',
      safetyNote: 'Have your payment ready beforehand so you feel unhurried.',
      topic: 'Food & Markets',
      phraseTemplate: (lang) => getPleaseThankPhrase(lang),
    },
    {
      title: 'The Polite Step-Aside',
      instructions: 'When passing someone in a tight aisle or boarding public transit, gently say "Excuse me" in your target language as you make room.',
      difficulty: 'Gentle',
      estimatedTime: '1 min',
      whyThisMatters: 'Instant, realistic reflex practice for everyday courteous public navigation.',
      practicalTip: 'Speak softly but audibly with an open posture.',
      safetyNote: 'Never block pathways or force eye contact if someone is in a rush.',
      topic: 'Everyday Errands',
      phraseTemplate: (lang) => getExcuseMePhrase(lang),
    },
    {
      title: 'Price Tag Double-Check',
      instructions: 'In a small bookshop or bodega, gently ask the staff for the price of a small item using only the target language words for "How much?".',
      difficulty: 'Gentle',
      estimatedTime: '3 mins',
      whyThisMatters: 'Trains your ear to listen for numbers and polite pricing exchanges in real life.',
      practicalTip: 'Listen for key syllables. You can also watch the register screen.',
      safetyNote: 'Keep interactions light; no need to buy if the price doesn’t suit you.',
      topic: 'Everyday Errands',
      phraseTemplate: (lang) => getPricePhrase(lang),
    },
  ],
  Brave: [
    {
      title: 'The Recommendation Inquiry',
      instructions: 'At a local food truck, café, or small eatery, politely ask the server what pastry or drink they personally recommend.',
      difficulty: 'Brave',
      estimatedTime: '5 mins',
      whyThisMatters: 'Opens a genuine two-way interaction where you listen to their authentic preference.',
      practicalTip: 'Show gratitude for whatever they suggest, even if you decide on something else.',
      safetyNote: 'Choose a time when there isn’t a huge line behind you.',
      topic: 'Food & Markets',
      phraseTemplate: (lang) => getRecommendPhrase(lang),
    },
    {
      title: 'The Learner’s Confession',
      instructions: 'During a simple purchase, politely say: "I am learning your language, thank you for your patience!"',
      difficulty: 'Brave',
      estimatedTime: '3–5 mins',
      whyThisMatters: 'Vulnerability disarms awkwardness and invites tremendous warmth and encouragement from locals.',
      practicalTip: 'Deliver it with a lighthearted smile; people almost always appreciate the effort.',
      safetyNote: 'If the person appears stressed or distracted, respect their space.',
      topic: 'Everyday Errands',
      phraseTemplate: (lang) => getLearningPhrase(lang),
    },
    {
      title: 'Directions to the Nearest Landmark',
      instructions: 'Ask someone standing near a transit stop or park entrance how to get to a nearby library, park, or station in the target language.',
      difficulty: 'Brave',
      estimatedTime: '5 mins',
      whyThisMatters: 'Practices listening comprehension with spatial directions and hand gestures.',
      practicalTip: 'Focus on direction words like "straight", "left", or "right".',
      safetyNote: 'Only approach people who seem approachable in well-lit, open public spaces.',
      topic: 'Transit & Exploring',
      phraseTemplate: (lang) => getDirectionsPhrase(lang),
    },
    {
      title: 'Compliment a Detail',
      instructions: 'Compliment an artisan, barista, or shopkeeper on their shop, window display, or coffee using a simple positive phrase.',
      difficulty: 'Brave',
      estimatedTime: '3 mins',
      whyThisMatters: 'Shifts your focus from performance anxiety to brightening someone else’s day.',
      practicalTip: 'Keep it concise: "This coffee is delicious!" or "Beautiful place!"',
      safetyNote: 'Compliment craftsmanship, flavor, or ambient details rather than personal appearance.',
      topic: 'Coffee & Cafés',
      phraseTemplate: (lang) => getComplimentPhrase(lang),
    },
  ],
  Bold: [
    {
      title: 'Neighborhood Curiosity',
      instructions: 'Ask a vendor or librarian: "How long has this place been here?" or "What is a popular spot nearby?" exclusively in your target language.',
      difficulty: 'Bold',
      estimatedTime: '7–10 mins',
      whyThisMatters: 'Transitions beyond transactional requests into meaningful cultural community dialogue.',
      practicalTip: 'Nod, maintain curious eye contact, and let them speak without rushing to understand every single word.',
      safetyNote: 'Only continue if they have free time and seem genuinely happy to chat.',
      topic: 'Arts & Culture',
      phraseTemplate: (lang) => getNeighborhoodPhrase(lang),
    },
    {
      title: 'Cultural Wisdom Exchange',
      instructions: 'Share a brief proverb or ask a native speaker: "What is your favorite local dish here?" and listen with mindful presence.',
      difficulty: 'Bold',
      estimatedTime: '8–12 mins',
      whyThisMatters: 'Fosters profound mutual human empathy across linguistic and cultural divides.',
      practicalTip: 'Treat the interaction as a shared human moment rather than a language test.',
      safetyNote: 'Never press for personal details or overstay a welcome.',
      topic: 'Food & Markets',
      phraseTemplate: (lang) => getProverbExchangePhrase(lang),
    },
  ],
};

// Language phrase helpers for all supported languages
function getGreetingPhrase(lang: string) {
  const l = lang.toLowerCase();
  if (l.includes('span')) return { phrase: '¡Hola! Buenos días', pronunciation: 'OH-lah BWEH-nohs DEE-ahs', meaning: 'Hello! Good morning' };
  if (l.includes('fren')) return { phrase: 'Bonjour, bonne journée', pronunciation: 'bohn-ZHOOR, buhn zhoor-NAY', meaning: 'Hello, good day' };
  if (l.includes('jap')) return { phrase: 'こんにちは (Konnichiwa)', pronunciation: 'kohn-NEE-chee-wah', meaning: 'Hello / Good day' };
  if (l.includes('chin') || l.includes('mand')) return { phrase: '你好，早上好 (Nǐ hǎo, zǎoshang hǎo)', pronunciation: 'nee how, dzow-shahng how', meaning: 'Hello, good morning' };
  if (l.includes('arab')) return { phrase: 'مرحباً، صباح الخير (Marhaban, Sabah al-khair)', pronunciation: 'mar-HA-ban, sah-BAH al-KHAYR', meaning: 'Hello, good morning' };
  if (l.includes('ital')) return { phrase: 'Buongiorno!', pronunciation: 'bwon-JOHR-noh', meaning: 'Good morning / Good day' };
  if (l.includes('germ')) return { phrase: 'Guten Tag!', pronunciation: 'GOO-ten tahk', meaning: 'Good day / Hello' };
  if (l.includes('viet')) return { phrase: 'Xin chào!', pronunciation: 'sin chow', meaning: 'Hello!' };
  if (l.includes('kore')) return { phrase: '안녕하세요 (Annyeonghaseyo)', pronunciation: 'ahn-nyung-ha-seh-yo', meaning: 'Hello / Good day' };
  return { phrase: 'Hello! Good day', pronunciation: 'he-LOH good DAY', meaning: 'Polite greeting' };
}

function getPleaseThankPhrase(lang: string) {
  const l = lang.toLowerCase();
  if (l.includes('span')) return { phrase: 'Por favor... ¡Muchas gracias!', pronunciation: 'por fah-VOR... MOO-chahs GRAH-see-ahs', meaning: 'Please... Thank you very much!' };
  if (l.includes('fren')) return { phrase: 'S’il vous plaît... Merci beaucoup !', pronunciation: 'seel voo pleh... mehr-SEE boh-koo', meaning: 'Please... Thank you very much!' };
  if (l.includes('jap')) return { phrase: 'これをお願いします。ありがとうございます (Kore o onegaishimasu. Arigatō gozaimasu)', pronunciation: 'koh-reh oh oh-neh-gah-ee-shee-mahs. ah-ree-gah-TOH goh-zah-ee-mahs', meaning: 'This one please. Thank you very much.' };
  if (l.includes('chin') || l.includes('mand')) return { phrase: '请给我这个，非常感谢 (Qǐng gěi wǒ zhège, fēicháng gǎnxiè)', pronunciation: 'ching gay woh juh-guh, fay-chahng gahn-shyeh', meaning: 'Please give me this, thank you very much' };
  if (l.includes('arab')) return { phrase: 'من فضلك... شكراً جزيلاً (Min fadlik... Shukran jazeelan)', pronunciation: 'min FAD-lik... SHOOK-ran jah-ZEE-lan', meaning: 'Please... Thank you so much!' };
  if (l.includes('ital')) return { phrase: 'Per favore... Grazie mille!', pronunciation: 'pair fah-VOH-ray... GRAHT-see-ay MEEL-lay', meaning: 'Please... Thanks a million!' };
  if (l.includes('germ')) return { phrase: 'Bitte sehr... Vielen Dank!', pronunciation: 'BIT-teh zair... FEE-len dank', meaning: 'Please... Many thanks!' };
  if (l.includes('viet')) return { phrase: 'Làm ơn... Cảm ơn rất nhiều!', pronunciation: 'lahm un... kahm un zut nyee-ew', meaning: 'Please... Thank you very much!' };
  if (l.includes('kore')) return { phrase: '이거 주세요. 감사합니다 (Igeo juseyo. Gamsahamnida)', pronunciation: 'ee-guh joo-seh-yo. gahm-sah-hahm-nee-dah', meaning: 'Please give me this. Thank you.' };
  return { phrase: 'Please... Thank you!', pronunciation: 'pleez... thank yoo', meaning: 'Polite courtesy' };
}

function getExcuseMePhrase(lang: string) {
  const l = lang.toLowerCase();
  if (l.includes('span')) return { phrase: 'Disculpe, con permiso', pronunciation: 'dees-KOOL-peh, kohn pair-MEE-soh', meaning: 'Excuse me, with your permission' };
  if (l.includes('fren')) return { phrase: 'Pardon, excusez-moi', pronunciation: 'par-DOHN, ex-kew-zay MWAH', meaning: 'Pardon, excuse me' };
  if (l.includes('jap')) return { phrase: 'すみません、失礼します (Sumimasen, shitsurei shimasu)', pronunciation: 'soo-mee-mah-sen, sheet-soo-ray shee-mahs', meaning: 'Excuse me, pardon me' };
  if (l.includes('chin') || l.includes('mand')) return { phrase: '不好意思，借过一下 (Bù hǎoyìsi, jièguò yíxià)', pronunciation: 'boo how-yee-sih, jee-ay-gwoh yee-shyah', meaning: 'Excuse me, coming through please' };
  if (l.includes('arab')) return { phrase: 'عفواً، عن إذنك (Afwan, an iznik)', pronunciation: 'AF-wan, an IZ-nik', meaning: 'Excuse me, with your permission' };
  if (l.includes('ital')) return { phrase: 'Permesso, scusi!', pronunciation: 'pair-MAYS-soh, SKOO-zee', meaning: 'Excuse me, pardon me!' };
  if (l.includes('germ')) return { phrase: 'Entschuldigung, darf ich vorbei?', pronunciation: 'ent-SHOOL-dee-goong, darf ikh for-BY', meaning: 'Excuse me, may I pass?' };
  if (l.includes('viet')) return { phrase: 'Xin lỗi, cho tôi qua nhờ', pronunciation: 'sin loy, chaw toy kwah nyuh', meaning: 'Excuse me, please let me through' };
  if (l.includes('kore')) return { phrase: '잠시만요, 죄송합니다 (Jamsimanyo, joesonghamnida)', pronunciation: 'jahm-see-mahn-yo, jway-sohng-hahm-nee-dah', meaning: 'Just a moment, excuse me' };
  return { phrase: 'Excuse me, pardon me', pronunciation: 'ek-SKYOOZ mee', meaning: 'Polite step aside' };
}

function getPricePhrase(lang: string) {
  const l = lang.toLowerCase();
  if (l.includes('span')) return { phrase: 'Disculpe, ¿cuánto cuesta esto?', pronunciation: 'dees-KOOL-peh, KWAHN-toh KWEHS-tah EHS-toh?', meaning: 'Excuse me, how much is this?' };
  if (l.includes('fren')) return { phrase: 'Pardon, c’est combien ?', pronunciation: 'par-DOHN, seh kohm-BYAN?', meaning: 'Pardon, how much is it?' };
  if (l.includes('jap')) return { phrase: 'これはいくらですか？ (Kore wa ikura desu ka?)', pronunciation: 'koh-reh wah ee-koo-rah des kah?', meaning: 'How much is this?' };
  if (l.includes('chin') || l.includes('mand')) return { phrase: '请问这个多少钱？ (Qǐngwèn zhège duōshǎo qián?)', pronunciation: 'ching-wen juh-guh dwoh-shaow chyen?', meaning: 'Excuse me, how much is this?' };
  if (l.includes('arab')) return { phrase: 'بكم هذا من فضلك؟ (Bikam hatha min fadlik?)', pronunciation: 'bee-kam HAH-thah min FAD-lik?', meaning: 'How much is this please?' };
  if (l.includes('ital')) return { phrase: 'Quanto viene questo?', pronunciation: 'KWAHN-toh VYEH-nay KWEHS-toh?', meaning: 'How much is this?' };
  if (l.includes('germ')) return { phrase: 'Wie viel kostet das bitte?', pronunciation: 'vee feel KOS-tet dahs BIT-teh?', meaning: 'How much does this cost please?' };
  if (l.includes('viet')) return { phrase: 'Cái này bao nhiêu tiền ạ?', pronunciation: 'kai nay bow nyew tyen ah?', meaning: 'How much is this please?' };
  if (l.includes('kore')) return { phrase: '이거 얼마예요? (Igeo eolmayeyo?)', pronunciation: 'ee-guh ull-mah-yeh-yo?', meaning: 'How much is this?' };
  return { phrase: 'How much is this, please?', pronunciation: 'how much is this', meaning: 'Price check' };
}

function getRecommendPhrase(lang: string) {
  const l = lang.toLowerCase();
  if (l.includes('span')) return { phrase: '¿Qué me recomienda probar hoy?', pronunciation: 'kay may reh-koh-MYEN-dah proh-BAR oy?', meaning: 'What do you recommend I try today?' };
  if (l.includes('fren')) return { phrase: 'Quel est votre plat ou café préféré ?', pronunciation: 'kel eh voht-ruh plah oo kah-FAY pray-fay-RAY?', meaning: 'What is your favorite dish or coffee?' };
  if (l.includes('jap')) return { phrase: 'おすすめは何ですか？ (Osusume wa nan desu ka?)', pronunciation: 'oh-soo-soo-meh wah nahn des kah?', meaning: 'What is your recommendation?' };
  if (l.includes('chin') || l.includes('mand')) return { phrase: '请问您推荐什么？ (Qǐngwèn nín tuījiàn shénme?)', pronunciation: 'ching-wen neen tway-jyen shuhn-muh?', meaning: 'Excuse me, what do you recommend?' };
  if (l.includes('arab')) return { phrase: 'بماذا تنصحني اليوم؟ (Bimatha tansahuni al-yawm?)', pronunciation: 'bee-MAH-thah tan-SAH-hoo-nee al-YOWM?', meaning: 'What do you recommend for me today?' };
  if (l.includes('ital')) return { phrase: 'Cosa mi consiglia di buono?', pronunciation: 'KOH-zah mee kohn-SEEL-yah dee BWOH-noh?', meaning: 'What good thing do you recommend?' };
  if (l.includes('germ')) return { phrase: 'Was können Sie mir empfehlen?', pronunciation: 'vahs KUR-nen zee meer em-PFAY-len?', meaning: 'What can you recommend to me?' };
  if (l.includes('viet')) return { phrase: 'Bạn gợi ý món gì ngon nhất?', pronunciation: 'bahn guh-ee ee mon zee ngon nyut?', meaning: 'What delicious dish do you recommend?' };
  if (l.includes('kore')) return { phrase: '어떤 것을 추천하시나요? (Eotteon geoseul chucheonhasinayo?)', pronunciation: 'uh-ddun guh-seul choo-chuhn-hah-see-nah-yo?', meaning: 'What do you recommend?' };
  return { phrase: 'What do you recommend?', pronunciation: 'what do you recommend', meaning: 'Asking recommendation' };
}

function getLearningPhrase(lang: string) {
  const l = lang.toLowerCase();
  if (l.includes('span')) return { phrase: 'Estoy aprendiendo su idioma poco a poco', pronunciation: 'ehs-TOY ah-pren-dee-EN-doh soo ee-dee-OH-mah POH-koh ah POH-koh', meaning: 'I am learning your language little by little' };
  if (l.includes('fren')) return { phrase: 'J’apprends le français, merci pour votre patience', pronunciation: 'zhah-PRAHN luh frahn-SEH, mehr-SEE poor voht-ruh pah-SYAHNS', meaning: 'I am learning French, thank you for your patience' };
  if (l.includes('jap')) return { phrase: '日本語を勉強中です (Nihongo o benkyōchū desu)', pronunciation: 'nee-hohn-goh oh ben-kyoh-choo des', meaning: 'I am currently studying Japanese' };
  if (l.includes('chin') || l.includes('mand')) return { phrase: '我正在学中文，谢谢您的耐心 (Wǒ zhèngzài xué zhōngwén, xièxiè nín de nàixīn)', pronunciation: 'woh juhng-dzeye shyoo-eh johng-wen, shyeh-shyeh neen duh neye-sheen', meaning: 'I am learning Chinese, thank you for your patience' };
  if (l.includes('arab')) return { phrase: 'أنا أتعلم لغتكم الجميلة (Ana ata\'allam lughatakum al-jameelah)', pronunciation: 'AH-nah ah-tah-AL-lam loo-gah-TAH-koom al-jah-MEE-lah', meaning: 'I am learning your beautiful language' };
  if (l.includes('ital')) return { phrase: 'Sto imparando l’italiano, grazie della pazienza!', pronunciation: 'stoh eem-pah-RAHN-doh lee-tahl-YAH-noh, GRAHT-see-ay DEL-lah pah-TSYEN-tsah', meaning: 'I am learning Italian, thanks for the patience!' };
  if (l.includes('germ')) return { phrase: 'Ich lerne Deutsch, vielen Dank für Ihre Geduld', pronunciation: 'ikh LAIR-neh doytsh, FEE-len dank fur EE-reh geh-DOOLD', meaning: 'I am learning German, thank you for your patience' };
  if (l.includes('viet')) return { phrase: 'Tôi đang tập nói tiếng Việt', pronunciation: 'toy dahng tup noy tyeng vyet', meaning: 'I am practicing speaking Vietnamese' };
  if (l.includes('kore')) return { phrase: '한국어를 배우고 있어요 (Hangugeo-reul baeugo isseoyo)', pronunciation: 'hahn-goo-guh-reul beh-oo-goh ee-ssuh-yo', meaning: 'I am learning Korean' };
  return { phrase: 'I am learning your language', pronunciation: 'i am learning your language', meaning: 'Learner disclosure' };
}

function getDirectionsPhrase(lang: string) {
  const l = lang.toLowerCase();
  if (l.includes('span')) return { phrase: 'Disculpe, ¿por dónde queda el parque o la estación?', pronunciation: 'dees-KOOL-peh, por DOHN-deh KAY-dah el PAR-kay oh lah ehs-tah-SYOHN?', meaning: 'Excuse me, where is the park or station?' };
  if (l.includes('fren')) return { phrase: 'Pardon, où se trouve la gare ou le parc ?', pronunciation: 'par-DOHN, oo suh TROOV lah gahr oo luh park?', meaning: 'Pardon, where is the station or park?' };
  if (l.includes('jap')) return { phrase: '駅はどちらですか？ (Eki wa dochira desu ka?)', pronunciation: 'eh-kee wah doh-chee-rah des kah?', meaning: 'Which way is the station?' };
  if (l.includes('chin') || l.includes('mand')) return { phrase: '请问地铁站在哪里？ (Qǐngwèn dìtiězhàn zài nǎlǐ?)', pronunciation: 'ching-wen dee-tyeh-zhahn dzeye nah-lee?', meaning: 'Excuse me, where is the subway station?' };
  if (l.includes('arab')) return { phrase: 'أين أقرب محطة من فضلك؟ (Ayna aqrab mahatta min fadlik?)', pronunciation: 'AY-nah AK-rab mah-HAT-tah min FAD-lik?', meaning: 'Where is the nearest station please?' };
  if (l.includes('ital')) return { phrase: 'Scusi, da che parte è la stazione?', pronunciation: 'SKOO-zee, dah kay PAR-tay eh lah stah-TSYOHN-ay?', meaning: 'Excuse me, which way is the station?' };
  if (l.includes('germ')) return { phrase: 'Entschuldigung, wo ist der Bahnhof bitte?', pronunciation: 'ent-SHOOL-dee-goong, voh ist dair BAHN-hohf BIT-teh?', meaning: 'Excuse me, where is the train station please?' };
  if (l.includes('viet')) return { phrase: 'Cho hỏi nhà ga ở đâu ạ?', pronunciation: 'chaw hoy nyah gah uh dow ah?', meaning: 'Excuse me, where is the station?' };
  if (l.includes('kore')) return { phrase: '지하철역이 어디예요? (Jihacheol-yeogi eodiyeyo?)', pronunciation: 'jee-hah-chuhl-yuhg-ee uh-dee-yeh-yo?', meaning: 'Where is the subway station?' };
  return { phrase: 'Where is the station or park?', pronunciation: 'where is the station', meaning: 'Asking directions' };
}

function getComplimentPhrase(lang: string) {
  const l = lang.toLowerCase();
  if (l.includes('span')) return { phrase: '¡Está riquísimo! Qué lindo lugar tienen aquí.', pronunciation: 'ehs-TAH ree-KEE-see-moh! kay LEEN-doh loo-GAR TYEH-nen ah-KEE', meaning: 'It is delicious! What a lovely place you have here.' };
  if (l.includes('fren')) return { phrase: 'C’est délicieux ! Vous avez un très bel endroit.', pronunciation: 'seh day-lee-SYUH! vooz ah-vay uhn tray bel ahn-DRWAH', meaning: 'It is delicious! You have a very lovely place.' };
  if (l.includes('jap')) return { phrase: 'とても美味しいです！素敵なお店ですね (Totemo oishii desu! Suteki na omise desu ne)', pronunciation: 'toh-teh-moh oy-shee des! soo-teh-kee nah oh-mee-seh des neh', meaning: 'Very delicious! What a wonderful shop.' };
  if (l.includes('chin') || l.includes('mand')) return { phrase: '很好吃！你们的店真棒 (Hěn hǎochī! Nǐmen de diàn zhēn bàng)', pronunciation: 'hen how-chur! nee-men duh dyen juhn bahng', meaning: 'Very delicious! Your shop is wonderful.' };
  if (l.includes('arab')) return { phrase: 'هذا لذيذ جداً! مكانكم جميل (Hatha latheeth jiddan! Makanukum jameel)', pronunciation: 'HAH-thah lah-THEETH jid-dan! mah-KAH-noo-koom jah-MEEL', meaning: 'This is very tasty! Your place is beautiful.' };
  if (l.includes('ital')) return { phrase: 'È buonissimo! Avete un locale stupendo.', pronunciation: 'eh bwoh-NEES-see-moh! ah-VAY-tay oon loh-KAH-lay stoo-PEN-doh', meaning: 'It is delicious! You have a wonderful place.' };
  if (l.includes('germ')) return { phrase: 'Das schmeckt wunderbar! Sie haben einen tollen Laden.', pronunciation: 'dahs shmekt VOON-der-bahr! zee HAH-ben EYE-nen TOH-len LAH-den', meaning: 'That tastes wonderful! You have a great shop.' };
  if (l.includes('viet')) return { phrase: 'Ngon quá! Quán này rất đẹp.', pronunciation: 'ngon kwah! kwahn nye zut dep', meaning: 'So delicious! This shop is very beautiful.' };
  if (l.includes('kore')) return { phrase: '정말 맛있어요! 가게가 정말 멋져요 (Jeongmal masisseoyo! Gagega jeongmal meotjyeoyo)', pronunciation: 'juhng-mahl mah-see-ssuh-yo! gah-geh-gah juhng-mahl muht-jyu-yo', meaning: 'Really delicious! Your shop is really nice.' };
  return { phrase: 'This is delicious, lovely place!', pronunciation: 'this is delicious', meaning: 'Genuine compliment' };
}

function getNeighborhoodPhrase(lang: string) {
  const l = lang.toLowerCase();
  if (l.includes('span')) return { phrase: '¿Cuál es un rincón favorito del barrio?', pronunciation: 'kwahl ehs oon reen-KOHN fah-voh-REE-toh del BAR-ryoh?', meaning: 'What is a favorite neighborhood corner of yours?' };
  if (l.includes('fren')) return { phrase: 'Quel est votre coin préféré dans le quartier ?', pronunciation: 'kel eh voht-ruh kwan pray-fay-RAY dahn luh kar-TYAY?', meaning: 'What is your favorite corner in the neighborhood?' };
  if (l.includes('jap')) return { phrase: 'この辺りで一番好きな場所はどこですか？ (Kono atari de ichiban suki na basho wa doko desu ka?)', pronunciation: 'koh-noh ah-tah-ree deh ee-chee-bahn soo-kee nah bah-shoh wah doh-koh des kah?', meaning: 'Where is your favorite spot around here?' };
  return { phrase: 'What is a favorite spot around here?', pronunciation: 'what is a favorite spot', meaning: 'Neighborhood inquiry' };
}

function getProverbExchangePhrase(lang: string) {
  const pack = LANGUAGE_PACKS.find(p => p.name.toLowerCase() === lang.toLowerCase());
  if (pack && pack.proverb) {
    return {
      phrase: pack.proverb.quote,
      pronunciation: 'Authentic local proverb',
      meaning: pack.proverb.meaning,
    };
  }
  return { phrase: 'Poco a poco se anda lejos', pronunciation: 'POH-koh ah POH-koh say AHN-dah LAY-hohs', meaning: 'Little by little, one goes far' };
}

/**
 * Fallback Generator: builds fully customized, nuanced challenges locally
 */
export function generateLocalChallenge(
  prefs: UserPreferences,
  targetDifficulty?: Difficulty,
  orderIndex: number = 0,
  totalSteps: number = 1
): Challenge {
  const diff: Difficulty = targetDifficulty || (prefs.difficultyPreference === 'Adaptive' ? 'Gentle' : (prefs.difficultyPreference as Difficulty));
  const pool = CONTEXT_CHALLENGE_BANK[diff] || CONTEXT_CHALLENGE_BANK.Gentle;
  
  // Pick matching or pseudo-random item from pool
  const baseItem = pool[(orderIndex + Math.floor(Math.random() * pool.length)) % pool.length];
  const phraseData = baseItem.phraseTemplate(prefs.language);

  const langPack = LANGUAGE_PACKS.find(p => p.name.toLowerCase() === prefs.language.toLowerCase());
  const langCode = langPack?.langCode || 'es-ES';

  const contextNote = prefs.socialSettings ? ` In your setting (${prefs.socialSettings}): ` : '';
  const communityAddon = prefs.communityContext ? ` Remember: ${prefs.communityContext}` : '';

  const phrase: UsefulPhrase = {
    id: `phr-gen-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    phrase: phraseData.phrase,
    pronunciation: phraseData.pronunciation,
    meaning: phraseData.meaning,
    language: prefs.language,
    langCode,
    isCustom: false,
    isPublic: true,
  };

  const id = `ai-gen-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  return {
    id,
    title: baseItem.title,
    instructions: `${baseItem.instructions}${contextNote}`,
    difficulty: diff,
    setting: 'public place',
    estimatedTime: baseItem.estimatedTime,
    whyThisMatters: `${baseItem.whyThisMatters}${communityAddon}`,
    practicalTip: baseItem.practicalTip,
    safetyNote: `${baseItem.safetyNote} Never ask for personal info; you can always skip without penalty.`,
    language: prefs.language,
    topic: prefs.topics?.[0] || baseItem.topic,
    examplePhrase: phrase,
    helperPhrases: [phrase],
    isAiGenerated: true,
    isCustom: false,
    isPublic: false,
    sequenceOrder: totalSteps > 1 ? orderIndex + 1 : undefined,
    sequenceTotal: totalSteps > 1 ? totalSteps : undefined,
    isSequenceStep: totalSteps > 1,
    completed: false,
  };
}

/**
 * Generate a single random AI Challenge based on preferences via Server-Side Gemini API
 */
export async function generateRandomChallenge(prefs: UserPreferences): Promise<Challenge> {
  try {
    const res = await fetch('/api/gemini/generate-challenge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prefs }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.challenge) {
        const parsed = data.challenge;
        const langPack = LANGUAGE_PACKS.find(p => p.name.toLowerCase() === prefs.language.toLowerCase());
        const langCode = langPack?.langCode || 'es-ES';

        const validSettings: ChallengeSetting[] = ['public place', 'school', 'online'];
        const challenge: Challenge = {
          id: `gemini-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: parsed.title,
          instructions: parsed.instructions,
          difficulty: (['Gentle', 'Brave', 'Bold'].includes(parsed.difficulty) ? parsed.difficulty : 'Gentle') as Difficulty,
          setting: validSettings.includes(parsed.setting) ? parsed.setting : 'public place',
          estimatedTime: parsed.estimatedTime || '5 mins',
          whyThisMatters: parsed.whyThisMatters || '',
          practicalTip: parsed.practicalTip || 'Breathe, smile, and keep your body language open and relaxed.',
          safetyNote: parsed.safetyNote || 'Never ask for personal info; you can always skip without penalty.',
          language: prefs.language,
          topic: parsed.topic || prefs.topics[0] || 'Everyday',
          isAiGenerated: true,
          isCustom: false,
          isPublic: false,
        };

        if (parsed.examplePhrase && parsed.examplePhrase.phrase) {
          challenge.examplePhrase = {
            id: `phr-${Date.now()}`,
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
    }
  } catch (err) {
    console.warn('Server Gemini call unavailable, using curated contextual intelligence engine:', err);
  }

  // Graceful local engine fallback
  return generateLocalChallenge(prefs);
}

/**
 * Generate an Arranged Sequence of challenges progressing from easier to more challenging via Server API
 * e.g. Count = 3 -> [Gentle, Brave, Bold]
 * e.g. Count = 5 -> [Gentle, Gentle, Brave, Brave, Bold]
 */
export async function generateArrangedSequence(
  prefs: UserPreferences,
  count: number = 3
): Promise<Challenge[]> {
  const safeCount = Math.max(2, Math.min(count, 10));

  try {
    const res = await fetch('/api/gemini/generate-sequence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prefs, count: safeCount }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.sequence) && data.sequence.length > 0) {
        const langPack = LANGUAGE_PACKS.find(p => p.name.toLowerCase() === prefs.language.toLowerCase());
        const langCode = langPack?.langCode || 'es-ES';

        const validSettings: ChallengeSetting[] = ['public place', 'school', 'online'];
        return data.sequence.map((item: any, idx: number) => {
          const ch: Challenge = {
            id: `seq-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
            title: item.title,
            instructions: item.instructions,
            difficulty: (['Gentle', 'Brave', 'Bold'].includes(item.difficulty) ? item.difficulty : 'Gentle') as Difficulty,
            setting: validSettings.includes(item.setting) ? item.setting : 'public place',
            estimatedTime: item.estimatedTime || '5 mins',
            whyThisMatters: item.whyThisMatters || '',
            practicalTip: item.practicalTip,
            safetyNote: item.safetyNote || 'Never ask for personal info; skip anytime without penalty.',
            language: prefs.language,
            topic: item.topic || prefs.topics[0] || 'Everyday',
            isAiGenerated: true,
            isCustom: false,
            isPublic: false,
            sequenceOrder: idx + 1,
            sequenceTotal: data.sequence.length,
            isSequenceStep: true,
            completed: false,
          };

          if (item.examplePhrase && item.examplePhrase.phrase) {
            ch.examplePhrase = {
              id: `phr-${Date.now()}-${idx}`,
              phrase: item.examplePhrase.phrase,
              pronunciation: item.examplePhrase.pronunciation,
              meaning: item.examplePhrase.meaning,
              language: prefs.language,
              langCode,
              isCustom: false,
              isPublic: true,
            };
            ch.helperPhrases = [ch.examplePhrase];
          }

          return ch;
        });
      }
    }
  } catch (err) {
    console.warn('Server sequence generation unavailable, using local ladder:', err);
  }

  // Curated ladder fallback
  const sequence: Challenge[] = [];
  const difficulties: Difficulty[] = [];
  for (let i = 0; i < safeCount; i++) {
    const ratio = i / (safeCount - 1);
    if (ratio < 0.4) {
      difficulties.push('Gentle');
    } else if (ratio < 0.8) {
      difficulties.push('Brave');
    } else {
      difficulties.push('Bold');
    }
  }

  for (let i = 0; i < safeCount; i++) {
    const diff = difficulties[i];
    const item = generateLocalChallenge(prefs, diff, i, safeCount);
    sequence.push(item);
  }

  return sequence;
}

/**
 * Server-Sent Events (SSE) streaming helper for real-time Gemini generation
 */
export async function streamGeminiPrompt(
  prompt: string,
  onChunk: (text: string) => void,
  onDone?: () => void,
  onError?: (err: Error) => void
): Promise<void> {
  try {
    const response = await fetch('/api/gemini/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Streaming failed with status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') {
            if (onDone) onDone();
            return;
          }
          try {
            const parsed = JSON.parse(raw);
            if (parsed.text) {
              onChunk(parsed.text);
            }
            if (parsed.error) {
              throw new Error(parsed.error);
            }
          } catch (e) {
            // Ignore parse errors on partial frames
          }
        }
      }
    }

    if (onDone) onDone();
  } catch (err: any) {
    if (onError) onError(err);
    else console.error('Streaming error:', err);
  }
}

/**
 * Live API / WebSocket client connection helper
 */
export function createLiveSession(
  onMessage: (msg: any) => void,
  onError?: (err: Event) => void
): { send: (data: any) => void; close: () => void } {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/api/gemini/live`;
  const ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data);
      onMessage(parsed);
    } catch {
      onMessage(event.data);
    }
  };

  if (onError) {
    ws.onerror = onError;
  }

  return {
    send: (data: any) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(typeof data === 'string' ? data : JSON.stringify(data));
      }
    },
    close: () => {
      ws.close();
    },
  };
}
