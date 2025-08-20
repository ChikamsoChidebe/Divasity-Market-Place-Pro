import express from 'express';
import {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  forgotPassword,
  verifyOTPAndResetPassword,
  getAllUsers,
  getUserById,
  updateUserProfile,
} from '../controllers/userController.js';
import {
  authenticateToken,
  requireAdmin,
  requireUserOrAdmin,
} from '../middleware/auth.js';
import {
  userRegistrationRules,
  userLoginRules,
  otpVerificationRules,
  passwordResetRules,
  userUpdateRules,
  emailRule,
  uuidParamRule,
} from '../utils/validators.js';
import { handleValidationErrors, sanitizeInput } from '../middleware/validation.js';

const router = express.Router();

// Apply sanitization to all routes
router.use(sanitizeInput);

// Public routes
router.post('/register', 
  userRegistrationRules,
  handleValidationErrors,
  registerUser
);

router.post('/verifyotp',
  otpVerificationRules,
  handleValidationErrors,
  verifyOTP
);

router.post('/resendOtp',
  emailRule,
  handleValidationErrors,
  resendOTP
);

router.post('/login',
  userLoginRules,
  handleValidationErrors,
  loginUser
);

router.post('/forgot-password',
  emailRule,
  handleValidationErrors,
  forgotPassword
);

router.post('/verify-otp',
  passwordResetRules,
  handleValidationErrors,
  verifyOTPAndResetPassword
);

// Protected routes
router.get('/getuser',
  authenticateToken,
  requireAdmin,
  getAllUsers
);

router.get('/getuser/:id',
  uuidParamRule,
  handleValidationErrors,
  authenticateToken,
  getUserById
);

router.patch('/update/:id',
  userUpdateRules,
  handleValidationErrors,
  authenticateToken,
  requireUserOrAdmin,
  updateUserProfile
);

export default router;