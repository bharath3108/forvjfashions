import { Router } from 'express';
import { body } from 'express-validator';
import {
  adminLogin,
  createAdmin,
  userRegister,
  userLogin,
  verifyEmail,
  resendVerification,
  getUserProfile
} from '../controllers/authController.js';
import { protectAdmin, protectUser } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = Router();

router.post(
  '/admin/login',
  [
    body('username').trim().notEmpty(),
    body('password').notEmpty()
  ],
  handleValidation,
  asyncHandler(adminLogin)
);

router.post(
  '/admin/register',
  protectAdmin,
  [
    body('username').trim().isLength({ min: 3 }),
    body('password').isLength({ min: 6 })
  ],
  handleValidation,
  asyncHandler(createAdmin)
);

router.post(
  '/user/register',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 })
  ],
  handleValidation,
  asyncHandler(userRegister)
);

router.post(
  '/user/login',
  [
    body('email').isEmail(),
    body('password').notEmpty()
  ],
  handleValidation,
  asyncHandler(userLogin)
);

router.post(
  '/user/resend-verification',
  [body('email').isEmail()],
  handleValidation,
  asyncHandler(resendVerification)
);

router.get('/user/verify', asyncHandler(verifyEmail));
router.get('/user/me', protectUser, asyncHandler(getUserProfile));

export default router;
