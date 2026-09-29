import { Router } from 'express';
import { handleChatMessage } from '../controllers/chatController.js';

const router = Router();

// POST /api/chat
router.post('/', handleChatMessage);

export default router;
