import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Plus, 
  Minus, 
  ArrowUpRight, 
  ArrowDownLeft,
  CreditCard,
  Building2,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import WalletBalance from '../components/wallet/WalletBalance';
import FundWallet from '../components/wallet/FundWallet';

export default function WalletPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [showFundModal, setShowFundModal] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch wallet data when component mounts
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    // This will be implemented when backend provides wallet endpoints
    setBalance(0);
    setTransactions([]);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Wallet },
    { id: 'transactions', name: 'Transactions', icon: Clock },
    { id: 'methods', name: 'Payment Methods', icon: CreditCard }
  ];

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, fee: '2.9%' },
    { id: 'bank', name: 'Bank Transfer', icon: Building2, fee: 'Free' }
  ];

  const handleFundSuccess = (amount: number) => {
    setBalance(prev => prev + amount);
    setShowFundModal(false);
    fetchWalletData();
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="w-4 h-4 text-orange-600" />;
      case 'withdrawal': return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'investment': return <TrendingUp className="w-4 h-4 text-purple-600" />;
      case 'return': return <DollarSign className="w-4 h-4 text-purple-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-orange-600 bg-orange-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-600 mt-1">Manage your funds and transactions</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFundModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Fund Wallet</span>
          </button>
        </div>
      </div>

      {/* Wallet Balance Component */}
      <WalletBalance showFundButton={false} />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ?{
                activeTab === tab.id
                  ? 'border-gray-800 text-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => setShowFundModal(true)}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg transition-colors text-center hover:border-gray-400 hover:bg-gray-50"
                >
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Fund Wallet</p>
                  <p className="text-sm text-gray-600">Add money to your wallet via Flutterwave</p>
                </button>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                <button className="text-sm font-medium text-gray-800 hover:text-gray-900">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {transactions.length > 0 ? (
                  transactions.slice(0, 5).map((transaction, index) => (
                    <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ?{
                          transaction.type === 'deposit' || transaction.type === 'return' 
                            ? 'text-orange-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' || transaction.type === 'return' ? '+' : '-'}
                          ?{transaction.amount.toLocaleString()}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ?{getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No transactions yet</p>
                    <p className="text-sm text-gray-400">Your transaction history will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Methods */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Methods</h3>
              <div className="space-y-3">
                <div className="text-center py-6">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium mb-2">No payment methods</p>
                  <p className="text-sm text-gray-400 mb-4">Add a payment method to deposit or withdraw funds</p>
                  <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg transition-colors text-center hover:border-gray-400 hover:bg-gray-50">
                    <Plus className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm text-gray-600">Add Payment Method</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Security</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Two-Factor Auth</span>
                  <span className="text-sm text-orange-600 font-medium">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Transaction Alerts</span>
                  <span className="text-sm text-orange-600 font-medium">On</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Auto-Lock</span>
                  <span className="text-sm text-gray-600">15 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
}
