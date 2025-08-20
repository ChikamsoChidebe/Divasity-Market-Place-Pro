import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Eye,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

interface Investment {
  id: string;
  projectId: string;
  projectName: string;
  amount: number;
  returnAmount: number;
  successRate: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function InvestorInvestments() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [filteredInvestments, setFilteredInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchInvestments();
  }, []);

  useEffect(() => {
    filterAndSortInvestments();
  }, [investments, searchTerm, statusFilter, sortBy]);

  const fetchInvestments = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get('/investments/my-investments');
      
      if (!response.error) {
        setInvestments(response.data || []);
      } else {
        toast.error('Failed to load investments');
      }
    } catch (error) {
      toast.error('Failed to load investments');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortInvestments = () => {
    let filtered = investments.filter(investment => {
      const matchesSearch = investment.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || investment.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });

    // Sort investments
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest-amount':
          return b.amount - a.amount;
        case 'lowest-amount':
          return a.amount - b.amount;
        case 'highest-return':
          return b.returnAmount - a.returnAmount;
        case 'lowest-return':
          return a.returnAmount - b.returnAmount;
        default:
          return 0;
      }
    });

    setFilteredInvestments(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-orange-600 bg-orange-100';
      case 'completed': return 'text-purple-600 bg-purple-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const calculateROI = (invested: number, returned: number) => {
    if (invested === 0) return 0;
    return ((returned - invested) / invested * 100).toFixed(1);
  };

  const getTotalStats = () => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalReturns = investments.reduce((sum, inv) => sum + inv.returnAmount, 0);
    const avgSuccessRate = investments.length > 0 
      ? investments.reduce((sum, inv) => sum + inv.successRate, 0) / investments.length 
      : 0;

    return {
      totalInvested,
      totalReturns,
      totalROI: totalInvested > 0 ? ((totalReturns - totalInvested) / totalInvested * 100).toFixed(1) : '0',
      avgSuccessRate: avgSuccessRate.toFixed(1)
    };
  };

  const stats = getTotalStats();

  const summaryCards = [
    {
      title: 'Total Invested',
      value: `₦${stats.totalInvested.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Returns',
      value: `₦${stats.totalReturns.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Overall ROI',
      value: `${stats.totalROI}%`,
      icon: Target,
      color: parseFloat(stats.totalROI) >= 0 ? 'text-orange-600' : 'text-red-600',
      bgColor: parseFloat(stats.totalROI) >= 0 ? 'bg-orange-100' : 'bg-red-100'
    },
    {
      title: 'Avg Success Rate',
      value: `${stats.avgSuccessRate}%`,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

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
            <Activity className="w-6 h-6 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900">My Investments</h1>
          </div>
          <p className="text-gray-600 mt-1">Track and manage all your investments</p>
        </div>
        
        <button className="btn-secondary flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <motion.div
            key={card.title}
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <motion.div
        className="card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search investments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest-amount">Highest Amount</option>
            <option value="lowest-amount">Lowest Amount</option>
            <option value="highest-return">Highest Return</option>
            <option value="lowest-return">Lowest Return</option>
          </select>
        </div>
      </motion.div>

      {/* Investments List */}
      <motion.div
        className="card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Investment History ({filteredInvestments.length})
          </h2>
        </div>

        {filteredInvestments.length > 0 ? (
          <div className="space-y-4">
            {filteredInvestments.map((investment, index) => (
              <motion.div
                key={investment.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {investment.projectName}
                      </h3>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(investment.status)}`}>
                        {investment.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Invested</p>
                        <p className="font-semibold text-gray-900">₦{investment.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Returns</p>
                        <p className="font-semibold text-orange-600">₦{investment.returnAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">ROI</p>
                        <p className={`font-semibold ${
                          parseFloat(calculateROI(investment.amount, investment.returnAmount)) >= 0 
                            ? 'text-orange-600' 
                            : 'text-red-600'
                        }`}>
                          {parseFloat(calculateROI(investment.amount, investment.returnAmount)) >= 0 ? '+' : ''}
                          {calculateROI(investment.amount, investment.returnAmount)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Success Rate</p>
                        <p className="font-semibold text-gray-900">{investment.successRate}%</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Invested on {new Date(investment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Updated {new Date(investment.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button className="btn-secondary flex items-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {searchTerm || statusFilter !== 'all' ? 'No investments match your filters' : 'No investments yet'}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'Start investing in projects to see them here'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button 
                onClick={() => navigate('/investor/projects')}
                className="btn-primary bg-orange-600 hover:bg-orange-700"
              >
                Explore Projects
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
