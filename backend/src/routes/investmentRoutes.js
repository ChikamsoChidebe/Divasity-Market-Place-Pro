import express from 'express';
import {
  createInvestment,
  getUserInvestments,
  getUserInvestmentStats,
  updateInvestmentOutcome,
  getAllInvestments,
  getInvestmentById,
  getInvestmentAnalytics,
} from '../controllers/investmentController.js';
import {
  authenticateToken,
  requireAdmin,
} from '../middleware/auth.js';
import {
  investmentRules,
  investmentOutcomeRules,
  uuidParamRule,
  paginationRules,
} from '../utils/validators.js';
import { handleValidationErrors, sanitizeInput } from '../middleware/validation.js';

const router = express.Router();

// Apply sanitization to all routes
router.use(sanitizeInput);

// All investment routes require authentication
router.use(authenticateToken);

// User investment routes
router.post('/',
  investmentRules,
  handleValidationErrors,
  createInvestment
);

router.get('/my-investments',
  paginationRules,
  handleValidationErrors,
  getUserInvestments
);

router.get('/stats',
  getUserInvestmentStats
);

router.get('/:id',
  uuidParamRule,
  handleValidationErrors,
  getInvestmentById
);

// Admin only routes
router.get('/',
  paginationRules,
  handleValidationErrors,
  requireAdmin,
  getAllInvestments
);

router.put('/:investmentId/outcome',
  investmentOutcomeRules,
  handleValidationErrors,
  requireAdmin,
  updateInvestmentOutcome
);

router.get('/analytics/overview',
  requireAdmin,
  getInvestmentAnalytics
);

export default router;