import express, { type Request, type Response } from 'express';
import { createServer as createViteServer } from 'vite';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: '10mb' }));

// Shared server-side Google GenAI client with telemetry User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    timestamp: Date.now(),
  });
});

// 1. Generate Single Random Micro-Challenge via Gemini 3.8 Flash
app.post('/api/gemini/generate-challenge', async (req: Request, res: Response) => {
  const { prefs } = req.body || {};
  if (!prefs) {
    return res.status(400).json({ success: false, error: 'Missing preferences object.' });
  }

  if (!apiKey) {
    return res.status(503).json({ success: false, error: 'GEMINI_API_KEY is not configured on server.' });
  }

  const prompt = `You are the empathetic mentor in "Tongue Tied", a gentle micro-social challenge app for language learners.
Generate ONE realistic, polite, low-stakes micro-challenge for practicing ${prefs.language || 'Spanish'}.
Proficiency Level: ${prefs.proficiency || 'Absolute Beginner'}.
Difficulty: ${prefs.difficultyPreference === 'Adaptive' ? 'Gentle' : (prefs.difficultyPreference || 'Gentle')}.
Topics/Interests: ${(prefs.topics && prefs.topics.join(', ')) || 'Cafés, groceries, everyday life'}.
Social Setting Preference: ${prefs.socialSettings || 'Local neighborhood shop, school, or online language space'}.
Community Guidance: ${prefs.communityContext || 'Polite, respect personal space'}.

Strict Safety & Format Rules:
- Never require asking for personal info (such as a phone number, home address, email, or private contact details).
- Never pressure anyone or continue if someone seems busy or uninterested; skipping without penalty is always encouraged.
- Keep "instructions" to EXACTLY ONE clear, natural sentence.
- Include an optional "whyThisMatters" ("why this helps") line in 1 short sentence.
- Mark "difficulty" strictly as "Gentle", "Brave", or "Bold".
- Mark "setting" strictly as "public place", "school", or "online".
- Include an optional example phrase in ${prefs.language || 'Spanish'} with pronunciation and English meaning.

Return ONLY a valid JSON object matching this schema:
{
  "title": "Short title (under 6 words)",
  "instructions": "One single clear sentence describing what to try.",
  "difficulty": "Gentle" | "Brave" | "Bold",
  "setting": "public place" | "school" | "online",
  "estimatedTime": "e.g. 2-5 mins",
  "whyThisMatters": "Optional 1-sentence 'why this helps' note.",
  "practicalTip": "Actionable, encouraging tip",
  "safetyNote": "Never ask for personal info; you can always skip without penalty.",
  "topic": "Topic category",
  "examplePhrase": {
    "phrase": "Phrase in target language",
    "pronunciation": "Phonetic pronunciation guide",
    "meaning": "English translation"
  }
}`;

  try {
    let responseText = '';
    const modelsToTry = ['gemini-3.5-flash-lite', 'gemini-3.8-flash'];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const apiPromise = ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Model ${modelName} timed out`)), 10000)
        );

        const response = await Promise.race([apiPromise, timeoutPromise]);
        if (response && response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed:`, err?.message || err);
      }
    }

    if (!responseText) {
      throw lastError || new Error('All AI generation models failed or timed out.');
    }

    const parsed = JSON.parse(responseText.trim());

    return res.json({
      success: true,
      challenge: parsed,
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Server error generating challenge with Gemini:', error?.message || error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate challenge with Gemini. Please try again.',
    });
  }
});

function getFallbackChallenge(prefs: any) {
  const lang = prefs.language || 'Spanish';
  const diff = prefs.difficultyPreference === 'Adaptive' ? 'Gentle' : (prefs.difficultyPreference || 'Gentle');
  
  if (diff === 'Brave') {
    return {
      title: 'The Learner’s Confession',
      instructions: `During a simple purchase or interaction, politely say in ${lang}: "I am learning your language, thank you for your patience!"`,
      difficulty: 'Brave',
      estimatedTime: '3–5 mins',
      whyThisMatters: 'Vulnerability disarms awkwardness and invites tremendous warmth and encouragement from locals.',
      practicalTip: 'Deliver it with a lighthearted smile; people almost always appreciate the effort.',
      safetyNote: 'Respect the person\'s boundaries and personal space.',
      topic: (prefs.topics && prefs.topics[0]) || 'Everyday Errands',
      examplePhrase: {
        phrase: 'Estoy aprendiendo su idioma, gracias por su paciencia',
        pronunciation: 'ehs-TOY ah-pren-dee-EN-doh soo ee-dee-OH-mah...',
        meaning: 'I am learning your language, thank you for your patience',
      },
    };
  }

  if (diff === 'Bold') {
    return {
      title: 'Neighborhood Curiosity',
      instructions: `Ask a local shopkeeper or vendor: "What is your favorite local dish or spot nearby?" exclusively in ${lang}.`,
      difficulty: 'Bold',
      estimatedTime: '6–8 mins',
      whyThisMatters: 'Transitions beyond transactional requests into meaningful cultural community dialogue.',
      practicalTip: 'Maintain warm, open posture and listen attentively.',
      safetyNote: 'Only continue if the person is free and happy to chat.',
      topic: (prefs.topics && prefs.topics[0]) || 'Food & Markets',
      examplePhrase: {
        phrase: '¿Cuál es un rincón favorito del barrio?',
        pronunciation: 'kwahl ehs oon reen-KOHN fah-voh-REE-toh...',
        meaning: 'What is a favorite spot of yours around here?',
      },
    };
  }

  return {
    title: 'The Silent Affirmation & Greeting',
    instructions: `Enter a local shop or café, catch the clerk's eye, offer a warm smile, and say a polite greeting in ${lang}.`,
    difficulty: 'Gentle',
    estimatedTime: '2 mins',
    whyThisMatters: 'Breaks the initial physical friction of speaking without the pressure of a full conversation.',
    practicalTip: 'Take a slow breath before entering. A sincere smile transcends grammar.',
    safetyNote: 'If the person is on a phone call or busy with a line, choose another relaxed moment.',
    topic: (prefs.topics && prefs.topics[0]) || 'Coffee & Cafés',
    examplePhrase: {
      phrase: '¡Hola! Buenos días',
      pronunciation: 'OH-lah BWEH-nohs DEE-ahs',
      meaning: 'Hello! Good morning',
    },
  };
}

function getFallbackSequence(prefs: any, count: number) {
  const list = [];
  const difficulties = ['Gentle', 'Brave', 'Bold'];
  for (let i = 0; i < count; i++) {
    const ratio = i / Math.max(1, count - 1);
    const diff = ratio < 0.4 ? 'Gentle' : ratio < 0.8 ? 'Brave' : 'Bold';
    const base = getFallbackChallenge({ ...prefs, difficultyPreference: diff });
    list.push({ ...base, difficulty: diff });
  }
  return list;
}

// 2. Generate Arranged Sequence of Challenges via Gemini 3.8 Flash
app.post('/api/gemini/generate-sequence', async (req: Request, res: Response) => {
  const { prefs, count = 3 } = req.body || {};
  if (!prefs) {
    return res.status(400).json({ success: false, error: 'Missing preferences object.' });
  }

  if (!apiKey) {
    return res.status(503).json({ success: false, error: 'GEMINI_API_KEY is not configured on server.' });
  }

  const safeCount = Math.max(2, Math.min(Number(count) || 3, 7));

  const prompt = `You are the empathetic mentor in "Tongue Tied", an app helping language learners overcome social fear through gentle, progressive micro-interactions.
Generate an arranged sequence of EXACTLY ${safeCount} challenges for practicing ${prefs.language || 'Spanish'}.
The sequence MUST progress smoothly in difficulty from easiest (Step 1) to more challenging (Step ${safeCount}):
- Step 1 to initial steps: Gentle (tiny, low-risk: holding a door, brief greeting, complimenting an object)
- Middle steps: Brave (short exchange: asking directions, asking someone to repeat, small talk, trying a phrase with a mistake)
- Final steps: Bold (real conversation: asking favorite dish/place, joining a group, sharing a short story)

Proficiency Level: ${prefs.proficiency || 'Absolute Beginner'}.
Topics: ${(prefs.topics && prefs.topics.join(', ')) || 'Cafés, food, transit'}.
Social Setting Preference: ${prefs.socialSettings || 'Neighborhood shops, school, or online'}.

Strict Safety & Format Rules:
- Never require asking for personal info (phone number, home address, email, or private details).
- Always allow skipping without penalty and respect boundaries immediately.
- Keep each challenge's "instructions" to EXACTLY ONE clear sentence.
- Include a concise optional "whyThisMatters" ("why this helps") single line.
- Mark each with a "difficulty" ("Gentle" | "Brave" | "Bold") and a "setting" ("public place" | "school" | "online").

Return ONLY a valid JSON array of ${safeCount} objects:
[
  {
    "title": "Short title",
    "instructions": "One single clear sentence describing what to try.",
    "difficulty": "Gentle" | "Brave" | "Bold",
    "setting": "public place" | "school" | "online",
    "estimatedTime": "e.g. 3 mins",
    "whyThisMatters": "Optional 1-sentence why-this-helps line",
    "practicalTip": "Warm encouragement tip",
    "safetyNote": "No personal info needed; skip anytime without penalty.",
    "topic": "Topic",
    "examplePhrase": {
      "phrase": "Phrase in ${prefs.language || 'Spanish'}",
      "pronunciation": "Phonetics",
      "meaning": "English meaning"
    }
  }
]`;

  try {
    let responseText = '';
    const modelsToTry = ['gemini-3.5-flash-lite', 'gemini-3.8-flash'];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const apiPromise = ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Model ${modelName} timed out`)), 12000)
        );

        const response = await Promise.race([apiPromise, timeoutPromise]);
        if (response && response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} for sequence failed:`, err?.message || err);
      }
    }

    if (!responseText) {
      throw lastError || new Error('All AI generation models failed or timed out.');
    }

    const parsed = JSON.parse(responseText.trim());

    return res.json({
      success: true,
      sequence: Array.isArray(parsed) ? parsed : [parsed],
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Server error generating sequence with Gemini:', error?.message || error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate sequence with Gemini. Please try again.',
    });
  }
});

// 3. General Generate Content Endpoint
app.post('/api/gemini/generate', async (req: Request, res: Response) => {
  const { prompt, model = 'gemini-3.8-flash', systemInstruction } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Missing prompt parameter.' });
  }

  if (!apiKey) {
    return res.status(503).json({ success: false, error: 'GEMINI_API_KEY is not configured on server.' });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    return res.json({
      success: true,
      text: response.text || '',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Generation failed',
    });
  }
});

// 4. Server-Sent Events (SSE) Streaming Endpoint
app.post('/api/gemini/stream', async (req: Request, res: Response) => {
  const { prompt, model = 'gemini-3.8-flash', systemInstruction } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt parameter.' });
  }

  if (!apiKey) {
    return res.status(503).json({ error: 'GEMINI_API_KEY is not configured on server.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const stream = await ai.models.generateContentStream({
      model,
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    for await (const chunk of stream) {
      const text = chunk.text || '';
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('SSE Stream error:', error);
    res.write(`data: ${JSON.stringify({ error: error?.message || 'Streaming failed' })}\n\n`);
    res.end();
  }
});

// 5. WebSocket Live API / Real-time Bidirectional Relay
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws: WebSocket) => {
  ws.send(JSON.stringify({ type: 'connected', message: 'Tongue-Tied Live Server Relay Connected' }));

  ws.on('message', async (data: Buffer | string) => {
    try {
      const parsed = JSON.parse(data.toString());

      if (parsed.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
        return;
      }

      if (parsed.type === 'live_prompt' || parsed.type === 'generate') {
        const userPrompt = parsed.prompt || '';
        const stream = await ai.models.generateContentStream({
          model: 'gemini-3.8-flash',
          contents: userPrompt,
        });

        for await (const chunk of stream) {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'chunk', text: chunk.text || '' }));
          }
        }

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'done' }));
        }
      }
    } catch (err: any) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'error', error: err?.message || 'Live session error' }));
      }
    }
  });

  ws.on('error', (err) => {
    console.warn('WebSocket client error:', err);
  });
});

server.on('upgrade', (request, socket, head) => {
  const pathname = request.url?.split('?')[0];
  if (pathname === '/api/gemini/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

// Vite Development Middleware vs Production Static Serving
async function initServer() {
  if (!isProd) {
    const vitePromise = createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server },
      },
      appType: 'spa',
    });

    vitePromise.catch((err) => {
      console.error('Failed to initialize Vite dev middleware:', err);
    });

    app.use(async (req, res, next) => {
      try {
        const vite = await vitePromise;
        vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Tongue-Tied full-stack server running at http://0.0.0.0:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error('Failed to start full-stack server:', err);
  process.exit(1);
});
