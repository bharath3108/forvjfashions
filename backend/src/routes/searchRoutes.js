import { Router } from 'express';
import { searchProducts } from '../controllers/searchController.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(searchProducts));

export default router;
