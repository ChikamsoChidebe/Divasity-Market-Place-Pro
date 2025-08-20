import express from 'express';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';
import { handleValidationErrors, sanitizeInput } from '../middleware/validation.js';
import { uuidParamRule, paginationRules } from '../utils/validators.js';

const router = express.Router();

// Apply sanitization to all routes
router.use(sanitizeInput);

// All notification routes require authentication
router.use(authenticateToken);

// Get user notifications
router.get('/',
  paginationRules,
  handleValidationErrors,
  getUserNotifications
);

// Mark notification as read
router.patch('/:id/read',
  uuidParamRule,
  handleValidationErrors,
  markAsRead
);

// Mark all notifications as read
router.patch('/mark-all-read',
  markAllAsRead
);

export default router;