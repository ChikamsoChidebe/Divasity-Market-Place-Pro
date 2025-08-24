import { useState } from 'react';
import { motion } from 'framer-motion';
import { Banknote, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

interface WithdrawWalletProps {
  currentBalance: number;
  onSuccess?: (amount: number) => void;
  onClose?: () => void;
}

const WithdrawWallet: React.FC<WithdrawWalletProps> = ({ 
  currentBalance, 
  onSuccess, 
  onClose 
}) => {
  const { user } = useAuthStore();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (withdrawAmount > currentBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (withdrawAmount < 500) {
      toast.error('Minimum withdrawal amount is ₦500');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.post('/wallet/withdraw', {
        amount: withdrawAmount,
        method: 'bank_transfer'
      });

      if (response.error) {
        toast.error(response.errorMessage || 'Withdrawal failed');
      } else {
        toast.success(`Withdrawal of ₦?{withdrawAmount.toLocaleString()} initiated successfully`);
        onSuccess?.(withdrawAmount);
        setAmount('');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('Withdrawal failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = [500, 1000, 5000, 10000, 25000, 50000].filter(amt => amt <= currentBalance);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
          <Wallet className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Withdraw Funds</h3>
          <p className="text-gray-600">Transfer money from your wallet</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Balance Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Available Balance</span>
            <span className="text-lg font-bold text-gray-900">₦{currentBalance.toLocaleString()}</span>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Withdrawal Amount (NGN)
          </label>
          <div className="relative">
            <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter amount"
              min="500"
              max={currentBalance}
              step="100"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Minimum withdrawal: ₦500</p>
        </div>

        {/* Quick Amount Buttons */}
        {quickAmounts.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quick Select
            </label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount.toString())}
                  className={`p-2 text-sm rounded-lg border transition-all ?{
                    amount === quickAmount.toString()
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  ₦{quickAmount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Withdrawal Info */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Withdrawal Information</span>
          </div>
          <div className="text-xs text-yellow-700 space-y-1">
            <p>• Withdrawals are processed within 1-3 business days</p>
            <p>• Bank transfer fees may apply</p>
            <p>• Ensure your bank details are up to date</p>
          </div>
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
            onClick={handleWithdraw}
            disabled={isLoading || !amount || parseFloat(amount) < 500 || parseFloat(amount) > currentBalance}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                <span>Withdraw Funds</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default WithdrawWallet;
