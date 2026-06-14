import { Router } from 'express';
import { body } from 'express-validator';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
} from '../controllers/productController.js';
import { protectAdmin } from '../middleware/auth.js';
import { cacheCatalog } from '../middleware/cache.js';
import { handleValidation } from '../middleware/validate.js';
import asyncHandler from '../middleware/asyncHandler.js';
import upload from '../middleware/upload.js';
import { CATEGORIES, AGE_GROUPS } from '../config/constants.js';

const router = Router();

const createRules = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category').isIn(CATEGORIES).withMessage('Invalid category'),
  body('ageGroup').isIn(AGE_GROUPS).withMessage('Invalid age group'),
  body('imgIds').isArray({ min: 1 }).withMessage('Upload at least one image'),
  body('sizes').optional().isArray()
];

const updateRules = [
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category').optional().isIn(CATEGORIES).withMessage('Invalid category'),
  body('ageGroup').optional().isIn(AGE_GROUPS).withMessage('Invalid age group'),
  body('imgIds').optional().isArray({ min: 1 }).withMessage('At least one image is required'),
  body('sizes').optional().isArray()
];

router.get('/', cacheCatalog, asyncHandler(getProducts));
router.get('/:id', asyncHandler(getProductById));
router.post('/', protectAdmin, createRules, handleValidation, asyncHandler(createProduct));
router.put('/:id', protectAdmin, updateRules, handleValidation, asyncHandler(updateProduct));
router.delete('/:id', protectAdmin, asyncHandler(deleteProduct));
router.post(
  '/upload',
  protectAdmin,
  upload.single('image'),
  asyncHandler(uploadProductImage)
);

export default router;
