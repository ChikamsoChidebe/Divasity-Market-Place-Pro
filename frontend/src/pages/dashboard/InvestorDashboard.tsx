import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Wallet, 
  PieChart, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Filter,
  Search,
  Calendar,
  Bell,
  Briefcase,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { dashboardService } from '../../services/dashboardService';
import type { DashboardStats } from '../../services/dashboardService';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function InvestorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Portfolio Value',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        backgroundColor: 'rgba(251, 146, 60, 0.8)',
        borderColor: 'rgba(251, 146, 60, 1)',
        borderWidth: 1,
      },
      {
        label: 'Returns',
        data: [2000, 3000, 2500, 4000, 3500, 5000],
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '₦' + value.toLocaleString();
          }
        }
      }
    },
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [dashData, profile] = await Promise.all([
        dashboardService.getInvestorDashboard(),
        user?.id ? dashboardService.getUserProfile(user.id) : null
      ]);
      setDashboardData(dashData);
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load investor dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const portfolioStats = [
    {
      title: 'Total Invested',
      value: dashboardService.formatCurrency(dashboardData?.totalInvestedAmount || 0),
      change: (dashboardData?.totalInvestedAmount || 0) > 0 ? '+15.2%' : 'No data yet',
      icon: Wallet,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: (dashboardData?.totalInvestedAmount || 0) > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Expected Returns',
      value: dashboardService.formatCurrency(dashboardData?.totalReturnAmount || 0),
      change: (dashboardData?.totalReturnAmount || 0) > 0 ? '+8.7%' : 'No data yet',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: (dashboardData?.totalReturnAmount || 0) > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Success Rate',
      value: dashboardService.formatPercentage(dashboardData?.averageSuccessRate || 0),
      change: (dashboardData?.averageSuccessRate || 0) > 0 ? '+2.1%' : 'No data yet',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: (dashboardData?.averageSuccessRate || 0) > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Total Investments',
      value: (dashboardData?.totalInvestments || 0).toString(),
      change: (dashboardData?.totalInvestments || 0) > 0 ? '+3' : 'Start investing',
      icon: Briefcase,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: (dashboardData?.totalInvestments || 0) > 0 ? 'up' : 'neutral'
    }
  ];



  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Investment Portfolio
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Track your investments and discover new opportunities.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field text-sm w-full sm:w-auto"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {portfolioStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            className="card p-4 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center mt-1">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-orange-600" />
                  ) : stat.trend === 'down' ? (
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                  <span className={`text-sm ml-1 ${
                    stat.trend === 'up' ? 'text-orange-600' : 
                    stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Portfolio Performance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Chart */}
          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Portfolio Performance</h2>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="h-64">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Explore Projects */}
          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Active Projects</h2>
              <button 
                onClick={() => navigate('/creator/my-projects')}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading projects...</p>
                </div>
              ) : dashboardData?.recentProjects.length ? (
                dashboardData.recentProjects.slice(0, 3).map((project, index) => {
                  const progress = dashboardService.calculateProjectProgress(project);
                  const daysLeft = dashboardService.calculateDaysRemaining(project.endDate);
                  
                  return (
                    <motion.div
                      key={project.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{project.name}</h3>
                          <p className="text-sm text-gray-600">{project.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-600">{dashboardService.formatCurrency(project.totalMoneyInvested || 0)}</p>
                          <p className="text-sm text-gray-600">raised</p>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-600">Goal: </span>
                          <span className="font-medium">{dashboardService.formatCurrency(project.expectedRaiseAmount || 0)}</span>
                        </div>
                        <div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            project.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">{daysLeft} days left</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No projects found</p>
                  <p className="text-sm text-gray-400 mb-4">Check back later for new investment opportunities</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Wallet Summary */}
          <motion.div
            className="card p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Investment Wallet</h3>
              <Wallet className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="text-center mb-4">
              <p className="text-2xl font-bold text-gray-900">₦{parseFloat(userProfile?.balance || '0').toLocaleString()}</p>
              <p className="text-sm text-gray-600">Available for Investment</p>
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/investor/wallet')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm"
              >
                Fund Wallet
              </button>
              <button 
                onClick={() => navigate('/investor/wallet')}
                className="btn-secondary w-full text-sm"
              >
                View Transactions
              </button>
            </div>
          </motion.div>

          {/* Asset Allocation */}
          <motion.div
            className="card p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Asset Allocation</h3>
              <PieChart className="w-4 h-4 text-gray-400" />
            </div>
            
            {dashboardData?.recentInvestments.length ? (
              <div className="space-y-3">
                <div className="text-center py-4">
                  <PieChart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Asset allocation visualization</p>
                  <p className="text-xs text-gray-400">{dashboardData.recentInvestments.length} investments</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <PieChart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No asset allocation data yet</p>
                <p className="text-xs text-gray-400">Start investing to see your portfolio breakdown</p>
              </div>
            )}
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            className="card p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
              <Bell className="w-4 h-4 text-gray-400" />
            </div>
            
            {dashboardData?.recentInvestments.length ? (
              <div className="space-y-3">
                {dashboardData.recentInvestments.slice(0, 3).map((investment, index) => (
                  <motion.div
                    key={investment.id}
                    className="flex items-center justify-between py-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.0 + index * 0.1 }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Investment</p>
                      <p className="text-xs text-gray-600">Project ID: {investment.projectId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">
                        -{dashboardService.formatCurrency(investment.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Success Rate: {investment.successRate}%
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No recent activity</p>
                <p className="text-xs text-gray-400">Your investment activity will appear here</p>
              </div>
            )}
            
            <button 
              onClick={() => navigate('/investor/wallet')}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 mt-4"
            >
              View All Transactions
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
