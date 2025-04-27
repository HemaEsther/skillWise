import express from 'express';
import { generateChatResponse } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', protect, generateChatResponse);

export default router; 