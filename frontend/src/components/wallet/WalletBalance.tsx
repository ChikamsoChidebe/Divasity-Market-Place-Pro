import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Plus, Eye, EyeOff, TrendingUp, ArrowUpRight, Minus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { WalletService } from '../../services/walletService';
import FundWallet from './FundWallet';
import WithdrawWallet from './WithdrawWallet';

interface WalletBalanceProps {
  showFundButton?: boolean;
  className?: string;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ 
  showFundButton = true, 
  className = '' 
}) => {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState('0.00');
  const [showBalance, setShowBalance] = useState(true);
  const [showFundModal, setShowFundModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchWalletData();
  }, [user?.id]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      // Get balance from stored user data
      const currentBalance = WalletService.getCurrentBalance();
      setBalance(currentBalance);
      
      // For now, we'll use mock transactions since the API doesn't provide transaction history
      setTransactions([]);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFundSuccess = (amount: number) => {
    setShowFundModal(false);
    fetchWalletData(); // Refresh data
  };

  const handleWithdrawSuccess = (amount: number) => {
    setBalance(prev => prev - amount);
    setShowWithdrawModal(false);
    fetchWalletData(); // Refresh data
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Wallet Balance</h3>
              <p className="text-blue-100 text-sm">Available funds</p>
            </div>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="mb-6">
          {loading ? (
            <div className="h-10 w-32 bg-white/20 rounded animate-pulse"></div>
          ) : (
            <div className="text-3xl font-bold">
              {showBalance ? WalletService.formatCurrency(balance) : '?••••••'}
            </div>
          )}
        </div>

        {showFundButton && (
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFundModal(true)}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Fund Wallet</span>
            </button>
            <button 
              onClick={() => setShowWithdrawModal(true)}
              className="px-4 py-3 border border-white/30 hover:bg-white/10 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Minus className="w-4 h-4" />
              <span>Withdraw</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Recent Transactions</h4>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {transactions.slice(0, 3).map((transaction: any, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'credit' ? (
                      <ArrowUpRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-red-600 rotate-180" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                </div>
                <div className={`font-semibold ${
                  transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Fund Wallet Modal */}
      {showFundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <FundWallet
              onSuccess={handleFundSuccess}
              onClose={() => setShowFundModal(false)}
            />
          </div>
        </div>
      )}

      {/* Withdraw Wallet Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <WithdrawWallet
              currentBalance={balance}
              onSuccess={handleWithdrawSuccess}
              onClose={() => setShowWithdrawModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletBalance;
