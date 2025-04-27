import express from 'express';
import { getAnswer, saveChat } from '../controllers/doubtSolverController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/ask', protect, getAnswer);
router.post('/save-chat', protect, saveChat);

export default router; 