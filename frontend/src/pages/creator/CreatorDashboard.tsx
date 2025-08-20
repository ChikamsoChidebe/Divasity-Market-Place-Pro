import { useState, useEffect } from 'react';
import type { Project } from '../../types';
import { motion } from 'framer-motion';
import { 
  normalizeProjects, 
  parseMonetaryValue, 
  calculateFundingPercentage,
  getStatusColorClasses,
  formatCurrency,
  type RawApiProject 
} from '../../utils/projectUtils';
import { 
  Plus, 
  DollarSign, 
  Users, 
  BarChart3,
  Target,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api';
import { InputSanitizer } from '../../utils/sanitizer';

const CreatorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalFunding: 0,
    totalInvestors: 0,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching projects for user ID:', user?.id);
      console.log('Full user object:', user);
      
      // Fetch all projects and filter by user
      const projectsResponse = await apiService.get('/projects');
      console.log('All projects API response:', projectsResponse);
      
      // Handle different response structures
      let rawProjects: RawApiProject[] = [];
      if (projectsResponse?.error) {
        console.error('API Error:', InputSanitizer.sanitizeForLog(projectsResponse.errorMessage));
        rawProjects = [];
      } else if (Array.isArray(projectsResponse)) {
        rawProjects = projectsResponse;
      } else if (projectsResponse?.data && Array.isArray(projectsResponse.data)) {
        rawProjects = projectsResponse.data;
      } else if (projectsResponse && typeof projectsResponse === 'object') {
        rawProjects = [projectsResponse];
      } else {
        console.warn('Unexpected API response structure received');
        rawProjects = [];
      }
      
      console.log('Raw projects from API count:', rawProjects.length);
      
      // Normalize project data
      const normalizedProjects = normalizeProjects(rawProjects);
      console.log('Normalized projects count:', normalizedProjects.length);
      
      // Filter projects by current user
      const userProjects = normalizedProjects.filter(project => project.userId === user?.id);
      
      console.log('User projects from backend count:', userProjects.length);
      console.log('Total user projects found:', userProjects.length);
      
      // Calculate real stats with safe property access
      const totalProjects = userProjects.length;
      
      const activeProjects = userProjects.filter(p => {
        if (!p || !p.status) {
          console.log('Project missing status for project ID:', InputSanitizer.sanitizeUserId(p?.id));
          return false;
        }
        const normalizedStatus = p.status.toUpperCase();
        const isActive = normalizedStatus === 'OPEN' || normalizedStatus === 'ACTIVE';
        console.log(`Project ${InputSanitizer.sanitizeProjectName(p.name)} status: ${InputSanitizer.sanitizeForLog(p.status)}, isActive: ${isActive}`);
        return isActive;
      }).length;
      
      const totalFunding = userProjects.reduce((sum, p) => {
        const funding = parseMonetaryValue(p.totalMoneyInvested);
        console.log(`Project ${InputSanitizer.sanitizeProjectName(p.name)} funding calculated`);
        return sum + funding;
      }, 0);
      
      // Calculate success rate instead of investors (removed as requested)
      // const totalInvestors = userProjects.reduce((sum, p) => {
      //   // Try to get investor count from various possible properties
      //   const investorCount = (p as any).investorCount || (p as any).backers || (p as any).investors || 0;
      //   return sum + investorCount;
      // }, 0);
      
      setStats({
        totalProjects,
        activeProjects,
        totalFunding,
        totalInvestors: 0 // Removed as requested, keeping for interface compatibility
      });
      
      setProjects(userProjects.slice(0, 3)); // Show only first 3 projects
      
      console.log('Final dashboard stats calculated for user:', InputSanitizer.sanitizeUserId(user?.id));
    } catch (error) {
      console.error('Error fetching dashboard data:', InputSanitizer.sanitizeForLog((error as any)?.message || 'Unknown error'));
      
      // Set default stats on error
      setStats({
        totalProjects: 0,
        activeProjects: 0,
        totalFunding: 0,
        totalInvestors: 0 // Keeping for interface compatibility
      });
      setProjects([]);
      
      // Show user-friendly error message
      console.warn('Using fallback data due to API error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    } else {
      // If no user, stop loading
      setLoading(false);
    }
  }, [user?.id]);

  // Add window focus listener to refresh data when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id) {
        fetchDashboardData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.id]);

  const recentActivities: any[] = [];

  const quickActions = [
    {
      title: 'Create New Project',
      description: 'Start a new crowdfunding campaign',
      icon: Plus,
      color: 'from-purple-500 to-purple-600',
      action: () => navigate('/creator/projects/create')
    },
    {
      title: 'View Analytics',
      description: 'Check your project performance',
      icon: BarChart3,
      color: 'from-orange-500 to-orange-600',
      action: () => navigate('/creator/analytics')
    },
    {
      title: 'Manage Wallet',
      description: 'Handle your funds and withdrawals',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      action: () => navigate('/creator/wallet')
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <motion.h1 
            className="text-3xl font-bold text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Welcome back, {user?.firstName} {user?.lastName}! 👋
          </motion.h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your projects today.</p>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Projects</p>
              {loading ? (
                <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
              )}
              <div className="flex items-center mt-2">
                {stats.totalProjects > 0 ? (
                  <>
                    <ArrowUpRight className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600 ml-1">+12% from last month</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-400 ml-1">No data yet</span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Projects</p>
              {loading ? (
                <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900">{stats.activeProjects}</p>
              )}
              <div className="flex items-center mt-2">
                {stats.activeProjects > 0 ? (
                  <>
                    <ArrowUpRight className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600 ml-1">+8% from last month</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-400 ml-1">No data yet</span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Funding</p>
              {loading ? (
                <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900">₦{stats.totalFunding.toLocaleString()}</p>
              )}
              <div className="flex items-center mt-2">
                {stats.totalFunding > 0 ? (
                  <>
                    <ArrowUpRight className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600 ml-1">+24% from last month</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-400 ml-1">No funding yet</span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              {loading ? (
                <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalProjects > 0 
                    ? Math.round((stats.activeProjects / stats.totalProjects) * 100)
                    : 0}%
                </p>
              )}
              <div className="flex items-center mt-2">
                {stats.totalProjects > 0 ? (
                  <>
                    <ArrowUpRight className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600 ml-1">Project success rate</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-400 ml-1">No data yet</span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Active Projects</h2>
              <button
                onClick={() => navigate('/creator/my-projects')}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading projects...</p>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No projects found</p>
                  <button
                    onClick={() => navigate('/creator/projects/create')}
                    className="mt-2 text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Create your first project
                  </button>
                </div>
              ) : (
                projects.map((project, index) => {
                  const fundingPercentage = calculateFundingPercentage(
                    project.totalMoneyInvested,
                    project.expectedRaiseAmount
                  );
                  
                  const investedAmount = parseMonetaryValue(project.totalMoneyInvested);
                  const targetAmount = parseMonetaryValue(project.expectedRaiseAmount);
                  const statusColor = getStatusColorClasses(project.status);
                  
                  return (
                    <motion.div
                      key={project.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      onClick={() => navigate(`/creator/projects/${project.id}`)}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{project.name}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColor}`}>
                            {project.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatCurrency(investedAmount)} raised
                          </span>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                            {project.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-lg font-bold text-gray-900">
                          {fundingPercentage}%
                        </p>
                        <p className="text-xs text-gray-500">funded</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatCurrency(targetAmount)} goal
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.title}
                  onClick={action.action}
                  className="w-full p-4 rounded-lg border border-gray-200 hover:border-gray-300 text-left transition-all group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400">Activity will appear here as you create projects and receive investments</p>
                </div>
              ) : (
                recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    className="flex items-start space-x-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.color}`}>
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Wallet Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available Balance</span>
                <span className="text-lg font-bold text-gray-900">₦0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="text-lg font-medium text-green-600">₦0</span>
              </div>
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <button
                  onClick={() => navigate('/creator/wallet')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-all"
                >
                  Fund Wallet
                </button>
                <button
                  onClick={() => navigate('/creator/wallet')}
                  className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  View Transactions
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
