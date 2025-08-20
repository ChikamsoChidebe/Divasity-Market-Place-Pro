import express from 'express';
import {
  getAllProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectsByUserId,
  updateProjectStatus,
  getProjectStatistics,
} from '../controllers/projectController.js';
import {
  authenticateToken,
  requireAdmin,
  requireProjectOwner,
  optionalAuth,
} from '../middleware/auth.js';
import {
  projectCreationRules,
  projectUpdateRules,
  uuidParamRule,
  paginationRules,
} from '../utils/validators.js';
import { param } from 'express-validator';
import { handleValidationErrors, sanitizeInput } from '../middleware/validation.js';

const router = express.Router();

// Apply sanitization to all routes
router.use(sanitizeInput);

// Public routes (with optional authentication for enhanced data)
router.get('/',
  optionalAuth,
  getAllProjects
);

router.get('/statistics',
  optionalAuth,
  getProjectStatistics
);

router.get('/single/:id',
  uuidParamRule,
  handleValidationErrors,
  optionalAuth,
  getProjectById
);

// Protected routes
router.post('/',
  authenticateToken,
  createProject
);

router.put('/:id',
  projectUpdateRules,
  handleValidationErrors,
  authenticateToken,
  requireProjectOwner,
  updateProject
);

router.delete('/:id',
  uuidParamRule,
  handleValidationErrors,
  authenticateToken,
  requireProjectOwner,
  deleteProject
);

router.get('/:id',
  uuidParamRule,
  handleValidationErrors,
  optionalAuth,
  getProjectsByUserId
);

// Admin only routes
router.patch('/:id/status',
  uuidParamRule,
  handleValidationErrors,
  authenticateToken,
  requireAdmin,
  updateProjectStatus
);

export default router;