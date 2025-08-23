import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Plus, Eye, EyeOff, TrendingUp, ArrowUpRight, Minus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api';
import FundWallet from './FundWallet';


interface ThemedWalletBalanceProps {
  theme?: 'blue' | 'orange' | 'purple' | 'gray';
  showFundButton?: boolean;
  className?: string;
}

const ThemedWalletBalance: React.FC<ThemedWalletBalanceProps> = ({ 
  theme = 'blue',
  showFundButton = true, 
  className = '' 
}) => {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState(0);
  const [showBalance, setShowBalance] = useState(true);
  const [showFundModal, setShowFundModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  const themeConfig = {
    blue: {
      gradient: 'from-blue-600 to-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700',
      text: 'text-blue-600'
    },
    orange: {
      gradient: 'from-orange-600 to-orange-700',
      button: 'bg-orange-600 hover:bg-orange-700',
      text: 'text-orange-600'
    },
    purple: {
      gradient: 'from-purple-600 to-purple-700',
      button: 'bg-purple-600 hover:bg-purple-700',
      text: 'text-purple-600'
    },
    gray: {
      gradient: 'from-gray-800 to-gray-900',
      button: 'bg-gray-800 hover:bg-gray-900',
      text: 'text-gray-800'
    }
  };

  const currentTheme = themeConfig[theme];

  useEffect(() => {
    fetchWalletData();
  }, [user?.id]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      // Get balance from user data or fetch user profile
      if (user?.balance) {
        setBalance(parseFloat(user.balance) || 0);
      } else if (user?.id) {
        const response = await apiService.getUserById(user.id);
        if (!response.error && response.data?.balance) {
          setBalance(parseFloat(response.data.balance) || 0);
        }
      }
      
      // Mock recent transactions for now
      setTransactions([]);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      // Fallback to stored balance
      const storedUser = JSON.parse(sessionStorage.getItem('divasity_user') || '{}');
      setBalance(parseFloat(storedUser.balance) || 0);
    } finally {
      setLoading(false);
    }
  };

  const handleFundSuccess = (amount: number) => {
    setBalance(prev => prev + amount);
    setShowFundModal(false);
    fetchWalletData();
    // Dispatch wallet update event for other components
    window.dispatchEvent(new CustomEvent('walletUpdated'));
  };



  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${currentTheme.gradient} rounded-2xl p-6 text-white`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Wallet Balance</h3>
              <p className="text-white/80 text-sm">Available funds</p>
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
              {showBalance ? `₦${balance.toLocaleString()}` : '₦••••••'}
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
            <button className={`${currentTheme.text} hover:opacity-80 text-sm font-medium`}>
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


    </div>
  );
};

export default ThemedWalletBalance;
