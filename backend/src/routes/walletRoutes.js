import express from 'express';
import {
  getWalletBalance,
  verifyPayment,
  getWalletTransactions,
  getWalletStats,
  withdrawFunds
} from '../controllers/walletController.js';
import { authenticateToken } from '../middleware/auth.js';
import { handleValidationErrors, sanitizeInput } from '../middleware/validation.js';

const router = express.Router();

// Apply sanitization to all routes
router.use(sanitizeInput);

// All wallet routes require authentication
router.use(authenticateToken);

// Get wallet balance and recent transactions
router.get('/balance', getWalletBalance);

// Verify Flutterwave payment and credit wallet
router.post('/verify-payment', verifyPayment);

// Withdraw funds from wallet
router.post('/withdraw', withdrawFunds);

// Get wallet transactions with pagination
router.get('/transactions', getWalletTransactions);

// Get wallet statistics
router.get('/stats', getWalletStats);

export default router;