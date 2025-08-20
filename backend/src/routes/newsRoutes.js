import express from 'express';
import {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
  getNewsByCategory,
  getNewsByUserId,
  getNewsCategories,
  getNewsStatistics,
} from '../controllers/newsController.js';
import {
  authenticateToken,
  requireAdmin,
  optionalAuth,
} from '../middleware/auth.js';
import {
  newsCreationRules,
  uuidParamRule,
  paginationRules,
} from '../utils/validators.js';
import { handleValidationErrors, sanitizeInput } from '../middleware/validation.js';

const router = express.Router();

// Apply sanitization to all routes
router.use(sanitizeInput);

// Public routes
router.get('/getnews',
  paginationRules,
  handleValidationErrors,
  optionalAuth,
  getAllNews
);

router.get('/categories',
  getNewsCategories
);

router.get('/category/:category',
  paginationRules,
  handleValidationErrors,
  optionalAuth,
  getNewsByCategory
);

router.get('/user/:userId',
  uuidParamRule,
  paginationRules,
  handleValidationErrors,
  optionalAuth,
  getNewsByUserId
);

router.get('/:id',
  uuidParamRule,
  handleValidationErrors,
  optionalAuth,
  getNewsById
);

// Protected routes (admin only for creation)
router.post('/createNews',
  newsCreationRules,
  handleValidationErrors,
  authenticateToken,
  requireAdmin,
  createNews
);

router.put('/:id',
  uuidParamRule,
  newsCreationRules,
  handleValidationErrors,
  authenticateToken,
  updateNews
);

router.delete('/:id',
  uuidParamRule,
  handleValidationErrors,
  authenticateToken,
  deleteNews
);

// Admin only routes
router.get('/statistics/overview',
  authenticateToken,
  requireAdmin,
  getNewsStatistics
);

export default router;