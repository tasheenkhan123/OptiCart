import { Request, Response } from 'express';
import { geminiService, ChatHistoryMessage } from '../services/ai/geminiService.js';
import { ShoppingIntent } from '../types/intent.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ENV } from '../config/env.js';

interface ChatRequestBody {
  message?: string;
  conversationHistory?: ChatHistoryMessage[];
  budget?: string;
  previousIntent?: ShoppingIntent;
}

export async function handleChatMessage(req: Request, res: Response): Promise<void> {
  try {
    const { message, conversationHistory = [], budget, previousIntent } = req.body as ChatRequestBody;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      sendError(res, 'A valid message string is required.', 400);
      return;
    }

    // Check if GEMINI_API_KEY is configured
    if (!ENV.hasGeminiKey) {
      sendError(
        res,
        'GEMINI_API_KEY is not configured on the server. Please add GEMINI_API_KEY to server/.env to enable AI shopping conversations.',
        503
      );
      return;
    }

    const result = await geminiService.generateChatResponse({
      message: message.trim(),
      conversationHistory,
      budget: budget ? String(budget).trim() : undefined,
      previousIntent,
    });

    sendSuccess(res, result, 'Gemini AI response and shopping intent generated successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to process chat message with Gemini AI';
    console.error('Chat Controller Error:', errorMessage);
    sendError(res, errorMessage, 500);
  }
}
