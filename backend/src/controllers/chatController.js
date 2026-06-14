import { GoogleGenAI } from '@google/genai';
import { isPlaceholder } from '../utils/isPlaceholder.js';
import { buildChatSystemPrompt } from '../utils/chatContext.js';
import { getFallbackReply } from '../utils/chatFallback.js';
import logger from '../utils/logger.js';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

const hasGeminiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && !isPlaceholder(key));
};

export const getChatStatus = (_req, res) => {
  res.json({
    enabled: true,
    ai: hasGeminiKey()
  });
};

const tryGeminiReply = async (message, history) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  const systemPrompt = await buildChatSystemPrompt();
  const turns = history.slice(-8).map((entry) => ({
    role: entry.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: entry.content }]
  }));

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [...turns, { role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.7,
      maxOutputTokens: 512
    }
  });

  return response.text?.trim();
};

export const chat = async (req, res) => {
  const { message, history = [] } = req.body;

  if (hasGeminiKey()) {
    try {
      const reply = await tryGeminiReply(message, history);
      if (reply) {
        return res.json({ reply, mode: 'ai' });
      }
    } catch (err) {
      logger.warn(`Gemini unavailable, using catalog assistant: ${err.message}`);
    }
  }

  try {
    const reply = await getFallbackReply(message);
    res.json({ reply, mode: 'catalog' });
  } catch (err) {
    logger.error(`Chat fallback error: ${err.message}`);
    res.status(500).json({
      message: 'Could not process your message. Please use WhatsApp instead.'
    });
  }
};
