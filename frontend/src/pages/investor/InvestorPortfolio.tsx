import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  Eye,
  BarChart3,
  Activity
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Investment {
  id: string;
  projectId: string;
  projectName: string;
  amount: number;
  returnAmount: number;
  successRate: number;
  status: string;
  createdAt: string;
}

interface InvestmentStats {
  totalInvestments: number;
  totalInvestedAmount: number;
  totalReturnAmount: number;
  averageSuccessRate: number;
}

export default function InvestorPortfolio() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState<InvestmentStats>({
    totalInvestments: 0,
    totalInvestedAmount: 0,
    totalReturnAmount: 0,
    averageSuccessRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Portfolio Value',
        data: [5000, 8000, 12000, 15000, 18000, 22000],
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Returns',
        data: [500, 1200, 2000, 3000, 3800, 5000],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.2)',
        tension: 0.4,
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

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user investments
      const investmentsResponse = await apiService.get('/investments/my-investments');
      if (!investmentsResponse.error) {
        setInvestments(investmentsResponse.data || []);
      }

      // Fetch investment stats
      const statsResponse = await apiService.get('/investments/stats');
      if (!statsResponse.error) {
        setStats(statsResponse.data || {
          totalInvestments: 0,
          totalInvestedAmount: 0,
          totalReturnAmount: 0,
          averageSuccessRate: 0
        });
      }
    } catch (error) {
      toast.error('Failed to load portfolio data');
    } finally {
      setIsLoading(false);
    }
  };

  const portfolioMetrics = [
    {
      title: 'Total Invested',
      value: `₦${stats.totalInvestedAmount?.toLocaleString() || '0'}`,
      change: stats.totalInvestedAmount > 0 ? '+12.5%' : 'No data yet',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: stats.totalInvestedAmount > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Total Returns',
      value: `₦${stats.totalReturnAmount?.toLocaleString() || '0'}`,
      change: stats.totalReturnAmount > 0 ? '+8.3%' : 'No returns yet',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: stats.totalReturnAmount > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Average Success Rate',
      value: `${stats.averageSuccessRate?.toFixed(1) || '0'}%`,
      change: stats.averageSuccessRate > 0 ? '+2.1%' : 'No data yet',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: stats.averageSuccessRate > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Active Investments',
      value: stats.totalInvestments?.toString() || '0',
      change: stats.totalInvestments > 0 ? `${stats.totalInvestments} projects` : 'Start investing',
      icon: PieChart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: stats.totalInvestments > 0 ? 'up' : 'neutral'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-orange-600 bg-orange-100';
      case 'completed': return 'text-purple-600 bg-purple-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const calculateROI = (invested: number, returned: number) => {
    if (invested === 0) return 0;
    return ((returned - invested) / invested * 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900">Portfolio Analytics</h1>
          </div>
          <p className="text-gray-600 mt-1">Track your investment performance and returns</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Portfolio Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {portfolioMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                <div className="flex items-center mt-1">
                  {metric.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-orange-600" />
                  ) : metric.trend === 'down' ? (
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                  <span className={`text-sm ml-1 ${
                    metric.trend === 'up' ? 'text-orange-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {metric.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Portfolio Performance Chart */}
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
          <Line data={chartData} options={chartOptions} />
        </div>
      </motion.div>

      {/* Investment Details */}
      <motion.div
        className="card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Investment Details</h2>
          <button 
            onClick={() => navigate('/investor/investments')}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            View All
          </button>
        </div>

        {investments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Project</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Invested</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Returns</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">ROI</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Success Rate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((investment, index) => (
                  <motion.tr
                    key={investment.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                  >
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{investment.projectName}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(investment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium">₦{investment.amount.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-orange-600">
                        ₦{investment.returnAmount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-medium ${
                        parseFloat(calculateROI(investment.amount, investment.returnAmount)) >= 0 
                          ? 'text-orange-600' 
                          : 'text-red-600'
                      }`}>
                        {calculateROI(investment.amount, investment.returnAmount)}%
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium">{investment.successRate}%</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(investment.status)}`}>
                        {investment.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No investments yet</p>
            <p className="text-sm text-gray-400 mb-4">Start investing to track your portfolio performance</p>
            <button 
              onClick={() => navigate('/investor/projects')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Explore Projects
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
