import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  Target, 
  TrendingUp,
  Clock,
  DollarSign,
  Wallet,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { dashboardService } from '../../services/dashboardService';
import { WalletService } from '../../services/walletService';
import toast from 'react-hot-toast';

export default function InvestorProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [userBalance, setUserBalance] = useState(0);
  const [showInvestModal, setShowInvestModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadProjectDetails();
      loadUserBalance();
    }
  }, [id]);

  const loadProjectDetails = async () => {
    try {
      setIsLoading(true);
      const projects = await dashboardService.getAllProjects();
      const foundProject = projects.find((p: any) => p.id === id);
      setProject(foundProject);
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project details');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserBalance = () => {
    const storedUser = JSON.parse(sessionStorage.getItem('divasity_user') || '{}');
    setUserBalance(parseFloat(storedUser.balance) || 0);
  };

  const handleInvest = async () => {
    if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
      toast.error('Please enter a valid investment amount');
      return;
    }

    const amount = parseFloat(investmentAmount);
    if (amount > userBalance) {
      toast.error('Insufficient balance. Please fund your wallet first.');
      return;
    }

    if (amount < 1000) {
      toast.error('Minimum investment amount is ₦1,000');
      return;
    }

    try {
      // Simulate investment process
      toast.success(`Investment of ₦${amount.toLocaleString()} submitted successfully!`);
      
      // Update user balance
      const newBalance = userBalance - amount;
      const storedUser = JSON.parse(sessionStorage.getItem('divasity_user') || '{}');
      storedUser.balance = newBalance.toString();
      sessionStorage.setItem('divasity_user', JSON.stringify(storedUser));
      
      setUserBalance(newBalance);
      setShowInvestModal(false);
      setInvestmentAmount('');
      
      // Dispatch wallet update event
      window.dispatchEvent(new CustomEvent('walletUpdated'));
      
      // Navigate to investments page
      setTimeout(() => {
        navigate('/investor/investments');
      }, 2000);
    } catch (error) {
      console.error('Investment failed:', error);
      toast.error('Investment failed. Please try again.');
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-orange-500';
    if (percentage >= 75) return 'bg-orange-400';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
          <button
            onClick={() => navigate('/investor/projects')}
            className="btn-primary"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const progress = dashboardService.calculateProjectProgress(project);
  const daysLeft = dashboardService.calculateDaysRemaining(project.endDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/investor/projects')}
            className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Projects</span>
          </button>
          
          <div className="flex items-center space-x-2 bg-orange-50 px-4 py-2 rounded-lg">
            <Wallet className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-orange-700">Balance: ₦{userBalance.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Header */}
            <motion.div
              className="card p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Project Image */}
              <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg mb-6 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md">
                    <span className="text-4xl font-bold text-orange-600">
                      {project.name?.charAt(0)?.toUpperCase() || 'P'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                  {project.category}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  project.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{project.name}</h1>
              <p className="text-gray-600 text-lg leading-relaxed">{project.description}</p>
            </motion.div>

            {/* Project Stats */}
            <motion.div
              className="card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Statistics</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount Raised</p>
                    <p className="text-xl font-bold text-gray-900">
                      {dashboardService.formatCurrency(project.totalMoneyInvested || '0')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Funding Goal</p>
                    <p className="text-xl font-bold text-gray-900">
                      {dashboardService.formatCurrency(project.expectedRaiseAmount || '0')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Days Remaining</p>
                    <p className="text-xl font-bold text-gray-900">{daysLeft} days</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Investors</p>
                    <p className="text-xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Funding Progress</span>
                  <span>{dashboardService.formatPercentage(progress)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Investment Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              className="card p-6 sticky top-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Make an Investment</h3>
              
              {/* Investment Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Amount (₦)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter amount"
                      min="1000"
                      step="1000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum investment: ₦1,000</p>
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {[5000, 10000, 25000, 50000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setInvestmentAmount(amount.toString())}
                      className={`p-2 text-sm rounded-lg border transition-all ${
                        investmentAmount === amount.toString()
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      ₦{amount.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Balance Check */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Available Balance</span>
                    <span className="text-lg font-bold text-orange-600">₦{userBalance.toLocaleString()}</span>
                  </div>
                  {userBalance < 1000 && (
                    <div className="flex items-center space-x-2 mt-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">Insufficient balance. Please fund your wallet.</span>
                    </div>
                  )}
                </div>

                {/* Investment Button */}
                <button
                  onClick={handleInvest}
                  disabled={!investmentAmount || parseFloat(investmentAmount) <= 0 || parseFloat(investmentAmount) > userBalance}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <DollarSign className="w-5 h-5" />
                  <span>Invest Now</span>
                </button>

                {userBalance < 1000 && (
                  <button
                    onClick={() => navigate('/investor/wallet')}
                    className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Wallet className="w-5 h-5" />
                    <span>Fund Wallet</span>
                  </button>
                )}
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Secure Investment</span>
                </div>
                <p className="text-xs text-gray-600">
                  Your investment is protected by our secure platform and regulatory compliance.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}