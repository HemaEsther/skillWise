import asyncHandler from 'express-async-handler';
import { geminiService } from '../services/geminiService.js';

export const generateResponse = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Please provide a message');
  }

  try {
    const response = await geminiService.generateResponse(message);
    res.json({ response });
  } catch (error) {
    console.error('Error:', error);
    res.status(500);
    throw new Error('Failed to generate response');
  }
}); 