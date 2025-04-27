import asyncHandler from 'express-async-handler';
import { aiService } from '../services/geminiService.js';

export const generateChatResponse = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Please provide a message');
  }

  try {
    const response = await aiService.generateResponse(message);
    res.json({ response });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to generate response');
  }
}); 