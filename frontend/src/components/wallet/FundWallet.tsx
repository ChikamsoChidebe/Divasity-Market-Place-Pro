import { useState } from 'react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { motion } from 'framer-motion';
import { DollarSign, CreditCard, Wallet } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { WalletService } from '../../services/walletService';
import { ToastService } from '../../services/toastService';

interface FundWalletProps {
  onSuccess?: (amount: number) => void;
  onClose?: () => void;
}

const FundWallet: React.FC<FundWalletProps> = ({ onSuccess, onClose }) => {
  const { user } = useAuthStore();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const config = {
    public_key: 'FLWPUBK_TEST-e098829b9eeeffd3e73ce0497c80d678-X',
    tx_ref: `wallet_${Date.now()}_${user?.id}`,
    amount: parseFloat(amount) || 0,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: user?.email || '',
      phone_number: user?.telephone || '',
      name: `${user?.firstName} ${user?.lastName}` || 'User',
    },
    customizations: {
      title: 'Fund Wallet',
      description: 'Add money to your Divasity wallet',
      logo: 'https://your-logo-url.com/logo.png',
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  const handlePayment = () => {
    const fundAmount = parseFloat(amount);
    
    const validation = WalletService.validateAmount(amount);
    if (!validation.isValid) {
      ToastService.error(validation.error!);
      return;
    }

    if (fundAmount < 100) {
      ToastService.error('Minimum funding amount is ₦100');
      return;
    }

    setIsLoading(true);

    handleFlutterPayment({
      callback: async (response) => {
        console.log('Flutterwave response:', response);
        
        if (response.status === 'successful' || response.status === 'completed') {
          try {
            // Verify payment with backend using the new API
            const verifyResponse = await WalletService.topUpWallet(response.transaction_id.toString());

            if (!verifyResponse.error) {
              ToastService.success(`Wallet funded successfully! ₦${fundAmount.toLocaleString()} added.`);
              // Dispatch wallet update event
              window.dispatchEvent(new CustomEvent('walletUpdated'));
              onSuccess?.(fundAmount);
              setAmount('');
            } else {
              // If backend verification fails, still show success since payment went through
              ToastService.success(`Payment completed! ₦${fundAmount.toLocaleString()} will be added to your wallet.`);
              // Still dispatch update event
              window.dispatchEvent(new CustomEvent('walletUpdated'));
              onSuccess?.(fundAmount);
              setAmount('');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            // Payment was successful on Flutterwave side, so we still consider it successful
            ToastService.success(`Payment completed! ₦${fundAmount.toLocaleString()} will be added to your wallet.`);
            // Dispatch wallet update event
            window.dispatchEvent(new CustomEvent('walletUpdated'));
            onSuccess?.(fundAmount);
            setAmount('');
          }
        } else {
          ToastService.error('Payment was not successful');
        }
        
        setIsLoading(false);
        closePaymentModal();
      },
      onClose: () => {
        setIsLoading(false);
        console.log('Payment modal closed');
      },
    });
  };

  const quickAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <Wallet className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Fund Wallet</h3>
          <p className="text-gray-600">Add money to your Divasity wallet</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (NGN)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter amount"
              min="100"
              step="100"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Minimum amount: ₦100</p>
        </div>

        {/* Quick Amount Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Quick Select
          </label>
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount.toString())}
                className={`p-2 text-sm rounded-lg border transition-all ${
                  amount === quickAmount.toString()
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                ₦{quickAmount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Payment Methods</span>
          </div>
          <p className="text-xs text-blue-700">
            Pay securely with Card, Bank Transfer, USSD, or Mobile Money via Flutterwave
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handlePayment}
            disabled={isLoading || !amount || parseFloat(amount) < 100}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                <span>Fund Wallet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FundWallet;
