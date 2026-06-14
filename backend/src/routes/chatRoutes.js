import { Router } from 'express';
import { body } from 'express-validator';
import { chat, getChatStatus } from '../controllers/chatController.js';
import { handleValidation } from '../middleware/validate.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = Router();

router.get('/status', asyncHandler(getChatStatus));

router.post(
  '/',
  [
    body('message').trim().isLength({ min: 1, max: 500 }).withMessage('Message must be 1–500 characters'),
    body('history').optional().isArray({ max: 10 }),
    body('history.*.role').optional().isIn(['user', 'assistant']),
    body('history.*.content').optional().trim().isLength({ min: 1, max: 1000 })
  ],
  handleValidation,
  asyncHandler(chat)
);

export default router;
