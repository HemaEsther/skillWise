import asyncHandler from 'express-async-handler';
import { doubtSolverBot } from '../services/doubtSolverBot.js';

export const getAnswer = asyncHandler(async (req, res) => {
  const { query } = req.body;

  if (!query) {
    res.status(400);
    throw new Error('Please provide a question');
  }

  const response = await doubtSolverBot.processQuery(query);
  res.json(response);
});

export const saveChat = asyncHandler(async (req, res) => {
  const { userId, query, response } = req.body;

  // Save chat history for future reference and improvement
  // You can implement this based on your requirements

  res.json({ message: 'Chat saved successfully' });
}); 