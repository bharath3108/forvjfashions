import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllComments,
  getProductComments,
  addComment,
  deleteComment
} from '../controllers/commentController.js';
import { protectAdmin, protectUser, requireVerifiedUser } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', protectAdmin, asyncHandler(getAllComments));
router.get('/product/:productId', asyncHandler(getProductComments));

router.post(
  '/product/:productId',
  protectUser,
  requireVerifiedUser,
  [body('text').trim().isLength({ min: 1, max: 500 })],
  handleValidation,
  asyncHandler(addComment)
);

router.delete('/:id', protectAdmin, asyncHandler(deleteComment));

export default router;
