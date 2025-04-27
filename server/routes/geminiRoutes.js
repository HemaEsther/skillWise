import express from 'express';
import { generateResponse } from '../controllers/geminiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', protect, generateResponse);

export default router; 