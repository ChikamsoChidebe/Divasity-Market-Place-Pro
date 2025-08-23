import { apiService } from './api';
import { ToastService } from './toastService';

interface ApiResponse<T = any> {
  error: boolean;
  message: string;
  data?: T;
  errorMessage?: string;
}

interface TopUpResponse {
  transactionId: string;
  amount: string;
  newBalance: string;
}

export class WalletService {
  // Top up wallet with Flutterwave transaction
  static async topUpWallet(transactionId: string): Promise<ApiResponse<TopUpResponse>> {
    try {
      // Remove dots from transaction ID to ensure compatibility
      const cleanTransactionId = transactionId.replace(/\./g, '');
      const response = await apiService.post('/users/topup', { transactionId: cleanTransactionId });
      
      if (!response.error) {
        // Update stored user data with new balance
        const currentUser = JSON.parse(sessionStorage.getItem('divasity_user') || '{}');
        if (currentUser && response.data) {
          currentUser.balance = response.data.newBalance;
          sessionStorage.setItem('divasity_user', JSON.stringify(currentUser));
        }
      }
      
      return response;
    } catch (error: any) {
      console.error('Wallet top-up API error:', error);
      // Return a mock successful response if API fails but payment went through
      return {
        error: true,
        message: 'API verification failed but payment was processed',
        errorMessage: error.message
      };
    }
  }

  // Get current user balance
  static getCurrentBalance(): string {
    const currentUser = JSON.parse(sessionStorage.getItem('divasity_user') || '{}');
    return currentUser.balance || '0.00';
  }

  // Format currency
  static formatCurrency(amount: string | number): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(numAmount);
  }

  // Validate transaction ID
  static validateTransactionId(transactionId: string): { isValid: boolean; error?: string } {
    if (!transactionId || transactionId.trim().length === 0) {
      return { isValid: false, error: 'Transaction ID is required' };
    }
    
    // Remove dots and validate
    const cleanId = transactionId.replace(/\./g, '');
    if (cleanId.length < 5) {
      return { isValid: false, error: 'Invalid transaction ID format' };
    }
    
    return { isValid: true };
  }

  // Validate transaction amount
  static validateAmount(amount: string): { isValid: boolean; error?: string } {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount)) {
      return { isValid: false, error: 'Please enter a valid amount' };
    }
    
    if (numAmount <= 0) {
      return { isValid: false, error: 'Amount must be greater than 0' };
    }
    
    if (numAmount > 10000) {
      return { isValid: false, error: 'Maximum amount is ₦10,000' };
    }
    
    return { isValid: true };
  }

  // Check if user has sufficient balance
  static hasSufficientBalance(requiredAmount: string): boolean {
    const currentBalance = parseFloat(this.getCurrentBalance());
    const required = parseFloat(requiredAmount);
    return currentBalance >= required;
  }
}

export default WalletService;
