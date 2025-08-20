import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target,
  Plus,
  Eye,
  Edit,
  BarChart3,
  Calendar,
  Bell,
  Settings
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { dashboardService } from '../../services/dashboardService';
import type { DashboardStats } from '../../services/dashboardService';

import toast from 'react-hot-toast';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [dashData, profile] = await Promise.all([
        dashboardService.getUserDashboard(user?.id),
        user?.id ? dashboardService.getUserProfile(user.id) : null
      ]);
      setDashboardData(dashData);
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Projects',
      value: dashboardData?.totalProjects.toString() || '0',
      change: '+12.5%',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Raised',
      value: dashboardService.formatCurrency(dashboardData?.totalInvestedAmount || 0),
      change: '+8.2%',
      icon: () => <span className="text-2xl font-bold">₦</span>,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Active Projects',
      value: dashboardData?.recentProjects.filter(p => p.status === 'OPEN').length.toString() || '0',
      change: '+2',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Balance',
      value: dashboardService.formatCurrency(userProfile?.balance || '0'),
      change: '+5.1%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const recentActivities = dashboardData?.recentProjects.length ? [
    {
      id: 1,
      type: 'project',
      message: `Project "${dashboardData.recentProjects[0]?.name || 'Your Project'}" is active`,
      time: '2 hours ago',
      icon: Target,
      color: 'text-purple-600'
    },
    {
      id: 2,
      type: 'funding',
      message: `Total funding: ${dashboardService.formatCurrency(dashboardData.recentProjects[0]?.totalMoneyInvested || 0)}`,
      time: '5 hours ago',
      icon: DollarSign,
      color: 'text-orange-600'
    },
    {
      id: 3,
      type: 'news',
      message: dashboardData.news[0]?.Newstitle || 'Check out the latest news',
      time: '1 day ago',
      icon: Bell,
      color: 'text-purple-600'
    }
  ] : [];

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">

      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs sm:text-sm font-semibold">
                {user?.firstName?.[0]}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Here's what's happening with your projects today.
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
          </select>
          
          <motion.button
            className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto py-3 sm:py-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm sm:text-base">New Project</span>
          </motion.button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat, index) => (
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
                <p className="text-sm text-orange-600 mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Projects Overview */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Active Projects */}
          <motion.div
            className="card p-4 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Active Projects</h2>
              <button 
                onClick={() => navigate('/projects')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium text-left sm:text-right"
              >
                View All
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading projects...</p>
                </div>
              ) : dashboardData?.recentProjects.length ? (
                dashboardData.recentProjects.slice(0, 3).map((project, index) => {
                  const progress = dashboardService.calculateProjectProgress(project);
                  const daysLeft = dashboardService.calculateDaysRemaining(project.endDate);
                  
                  return (
                    <motion.div
                      key={project.id}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-3">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{project.name}</h3>
                        <div className="flex items-center space-x-2 self-start sm:self-auto">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            project.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 text-xs sm:text-sm text-gray-600 mb-2">
                        <span>{dashboardService.formatCurrency(project.totalMoneyInvested || 0)} raised</span>
                        <span>Goal: {dashboardService.formatCurrency(project.expectedRaiseAmount || 0)}</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 mt-2 text-xs text-gray-500">
                        <span>{dashboardService.formatPercentage(progress)} funded</span>
                        <span>{daysLeft} days left</span>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No projects yet</p>
                  <p className="text-sm text-gray-400">Create your first project to get started</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Performance Chart */}
          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Funding Performance</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="h-64 bg-white rounded-lg p-4">
              {dashboardData?.recentProjects.length ? (
                <Bar
                  data={{
                    labels: dashboardData.recentProjects.slice(0, 5).map(p => p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name),
                    datasets: [
                      {
                        label: 'Raised Amount (₦)',
                        data: dashboardData.recentProjects.slice(0, 5).map(p => parseFloat(p.totalMoneyInvested || '0')),
                        backgroundColor: 'rgba(147, 51, 234, 0.8)',
                        borderColor: 'rgba(147, 51, 234, 1)',
                        borderWidth: 1,
                      },
                      {
                        label: 'Target Amount (₦)',
                        data: dashboardData.recentProjects.slice(0, 5).map(p => parseFloat(p.expectedRaiseAmount || '0')),
                        backgroundColor: 'rgba(249, 115, 22, 0.8)',
                        borderColor: 'rgba(249, 115, 22, 1)',
                        borderWidth: 1,
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return context.dataset.label + ': ₦' + context.parsed.y.toLocaleString();
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return '₦' + Number(value).toLocaleString();
                          }
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No funding data yet</p>
                    <p className="text-xs text-gray-400">Create projects to see performance</p>
                  </div>
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
              <h3 className="font-semibold text-gray-900">Wallet</h3>
              <Settings className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="text-center mb-4">
              <p className="text-2xl font-bold text-gray-900">{dashboardService.formatCurrency(userProfile?.balance || '0')}</p>
              <p className="text-sm text-gray-600">Available Balance</p>
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/wallet')}
                className="btn-secondary w-full text-sm"
              >
                View Transactions
              </button>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            className="card p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
              <Bell className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                >
                  <div className={`p-1 rounded-full bg-gray-100`}>
                    <activity.icon className={`w-3 h-3 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 mt-4">
              View All Activity
            </button>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="card p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/projects/create')}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
              >
                <Plus className="w-4 h-4 text-primary-600" />
                <span className="text-sm">Create New Project</span>
              </button>
              
              <button 
                onClick={() => navigate('/analytics')}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
              >
                <BarChart3 className="w-4 h-4 text-primary-600" />
                <span className="text-sm">View Analytics</span>
              </button>
              
              <button 
                onClick={() => navigate('/projects')}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
              >
                <Calendar className="w-4 h-4 text-primary-600" />
                <span className="text-sm">Manage Projects</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
