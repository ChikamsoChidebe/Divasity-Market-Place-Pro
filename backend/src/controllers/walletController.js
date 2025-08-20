import { db } from '../utils/database.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import axios from 'axios';

// Get wallet balance
export const getWalletBalance = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({
      error: true,
      message: 'Authentication required',
      errorMessage: 'User not authenticated'
    });
  }

  // Get or create wallet for user
  let wallet = db.findOne('wallets', { userId });
  
  if (!wallet) {
    wallet = db.create('wallets', {
      userId,
      balance: 0,
      currency: 'NGN'
    });
  }

  // Get recent transactions
  const transactions = db.findMany('wallet_transactions', { userId })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  res.status(200).json({
    error: false,
    message: 'Wallet data retrieved successfully',
    data: {
      balance: wallet.balance,
      currency: wallet.currency,
      recentTransactions: transactions
    }
  });
});

// Verify Flutterwave payment
export const verifyPayment = asyncHandler(async (req, res) => {
  const { transaction_id, tx_ref, amount, currency } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      error: true,
      message: 'Authentication required',
      errorMessage: 'User not authenticated'
    });
  }

  try {
    // Verify payment with Flutterwave
    const flutterwaveResponse = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
        }
      }
    );

    const paymentData = flutterwaveResponse.data.data;

    // Check if payment was successful
    if (paymentData.status !== 'successful') {
      return res.status(400).json({
        error: true,
        message: 'Payment verification failed',
        errorMessage: 'Payment was not successful'
      });
    }

    // Check if transaction has already been processed
    const existingTransaction = db.findOne('wallet_transactions', { 
      reference: tx_ref 
    });

    if (existingTransaction) {
      return res.status(400).json({
        error: true,
        message: 'Transaction already processed',
        errorMessage: 'This transaction has already been credited'
      });
    }

    // Get or create wallet
    let wallet = db.findOne('wallets', { userId });
    
    if (!wallet) {
      wallet = db.create('wallets', {
        userId,
        balance: 0,
        currency: 'NGN'
      });
    }

    // Update wallet balance
    const newBalance = wallet.balance + parseFloat(amount);
    db.update('wallets', wallet.id, { balance: newBalance });

    // Create transaction record
    const transaction = db.create('wallet_transactions', {
      userId,
      type: 'credit',
      amount: parseFloat(amount),
      currency,
      reference: tx_ref,
      description: 'Wallet funding via Flutterwave',
      status: 'completed',
      metadata: {
        transaction_id,
        payment_method: 'flutterwave',
        customer_email: paymentData.customer.email
      }
    });

    logger.info(`Wallet funded successfully`, {
      userId,
      amount,
      transaction_id,
      new_balance: newBalance
    });

    res.status(200).json({
      error: false,
      message: 'Payment verified and wallet credited successfully',
      data: {
        transaction,
        new_balance: newBalance
      }
    });

  } catch (error) {
    logger.error('Payment verification error:', { 
      message: error.message, 
      status: error.response?.status,
      data: error.response?.data 
    });
    
    res.status(500).json({
      error: true,
      message: 'Payment verification failed',
      errorMessage: 'Unable to verify payment with Flutterwave'
    });
  }
});

// Get wallet transactions
export const getWalletTransactions = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { page = 1, limit = 20, type } = req.query;

  if (!userId) {
    return res.status(401).json({
      error: true,
      message: 'Authentication required',
      errorMessage: 'User not authenticated'
    });
  }

  let query = { userId };
  if (type) {
    query.type = type;
  }

  const transactions = db.findMany('wallet_transactions', query)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  res.status(200).json({
    error: false,
    message: 'Transactions retrieved successfully',
    data: {
      transactions: paginatedTransactions,
      total: transactions.length,
      page: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

// Withdraw funds from wallet
export const withdrawFunds = asyncHandler(async (req, res) => {
  const { amount, method = 'bank_transfer' } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      error: true,
      message: 'Authentication required',
      errorMessage: 'User not authenticated'
    });
  }

  if (!amount || amount < 500) {
    return res.status(400).json({
      error: true,
      message: 'Invalid withdrawal amount',
      errorMessage: 'Minimum withdrawal amount is ₦500'
    });
  }

  // Get wallet
  const wallet = db.findOne('wallets', { userId });
  
  if (!wallet) {
    return res.status(404).json({
      error: true,
      message: 'Wallet not found',
      errorMessage: 'User wallet does not exist'
    });
  }

  if (wallet.balance < amount) {
    return res.status(400).json({
      error: true,
      message: 'Insufficient balance',
      errorMessage: 'Wallet balance is insufficient for this withdrawal'
    });
  }

  // Update wallet balance
  const newBalance = wallet.balance - parseFloat(amount);
  db.update('wallets', wallet.id, { balance: newBalance });

  // Create transaction record
  const transaction = db.create('wallet_transactions', {
    userId,
    type: 'debit',
    amount: parseFloat(amount),
    currency: 'NGN',
    reference: `withdraw_${Date.now()}_${userId}`,
    description: 'Wallet withdrawal',
    status: 'pending',
    metadata: {
      method,
      withdrawal_type: 'bank_transfer'
    }
  });

  logger.info(`Withdrawal initiated`, {
    userId,
    amount,
    transaction_id: transaction.id,
    new_balance: newBalance
  });

  res.status(200).json({
    error: false,
    message: 'Withdrawal initiated successfully',
    data: {
      transaction,
      new_balance: newBalance
    }
  });
});

// Get wallet statistics
export const getWalletStats = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      error: true,
      message: 'Authentication required',
      errorMessage: 'User not authenticated'
    });
  }

  const wallet = db.findOne('wallets', { userId });
  const transactions = db.findMany('wallet_transactions', { userId });

  const stats = {
    current_balance: wallet?.balance || 0,
    total_funded: transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0),
    total_spent: transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0),
    transaction_count: transactions.length,
    this_month_funding: transactions
      .filter(t => {
        const transactionDate = new Date(t.createdAt);
        const now = new Date();
        return t.type === 'credit' && 
               transactionDate.getMonth() === now.getMonth() &&
               transactionDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + t.amount, 0)
  };

  res.status(200).json({
    error: false,
    message: 'Wallet statistics retrieved successfully',
    data: stats
  });
});