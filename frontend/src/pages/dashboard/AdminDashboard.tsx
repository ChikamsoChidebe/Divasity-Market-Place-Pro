import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  Shield,
  Settings,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  UserCheck,
  Flag
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { 
    systemStats, 
    pendingApprovals, 
    recentActivity,
    fetchSystemStats,
    fetchPendingApprovals,
    fetchRecentActivity 
  } = useAdminStore();
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchSystemStats();
    fetchPendingApprovals();
    fetchRecentActivity();
  }, []);

  const stats = [
    {
      title: 'Total Users',
      value: systemStats.totalUsers?.toLocaleString() || '0',
      change: '+12.5%',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Platform Revenue',
      value: `??{systemStats.totalRevenue?.toLocaleString() || '0'}`,
      change: '+18.2%',
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Active Projects',
      value: systemStats.activeProjects?.toString() || '0',
      change: '+8.7%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Pending Reviews',
      value: systemStats.pendingReviews?.toString() || '0',
      change: '-5.1%',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const systemHealth = [
    { name: 'API Response Time', value: '120ms', status: 'good', color: 'text-orange-600' },
    { name: 'Database Performance', value: '98.5%', status: 'good', color: 'text-orange-600' },
    { name: 'Server Uptime', value: '99.9%', status: 'excellent', color: 'text-orange-600' },
    { name: 'Error Rate', value: '0.02%', status: 'good', color: 'text-orange-600' }
  ];

  const handleApproval = async (id: string, action: 'approve' | 'reject') => {
    // Implementation would go here
    console.log(`?{action} item ?{id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            System Dashboard 🛡️
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor platform health and manage system operations.
          </p>
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
          </select>
          
          <motion.button
            className="btn-primary flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Settings className="w-4 h-4" />
            <span>System Settings</span>
          </motion.button>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-orange-600 mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg ?{stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ?{stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Approvals */}
          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {pendingApprovals.length} pending
              </span>
            </div>

            <div className="space-y-4">
              {pendingApprovals.slice(0, 5).map((item, index) => (
                <motion.div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ?{
                        item.type === 'project' ? 'bg-purple-100' : 
                        item.type === 'user' ? 'bg-orange-100' : 'bg-purple-100'
                      }`}>
                        {item.type === 'project' ? (
                          <TrendingUp className="w-4 h-4 text-purple-600" />
                        ) : item.type === 'user' ? (
                          <UserCheck className="w-4 h-4 text-orange-600" />
                        ) : (
                          <Flag className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleApproval(item.id, 'approve')}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleApproval(item.id, 'reject')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Submitted by {item.submittedBy}</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.timeAgo}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <button className="w-full mt-4 text-center text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All Pending Items
            </button>
          </motion.div>

          {/* Platform Analytics */}
          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Platform Analytics</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="h-64 bg-gradient-to-br from-purple-50 to-purple-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-12 h-12 text-purple-500 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">Real-time Analytics</p>
                <p className="text-sm text-gray-400">User activity and platform metrics</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* System Health */}
          <motion.div
            className="card p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">System Health</h3>
              <Shield className="w-4 h-4 text-orange-500" />
            </div>
            
            <div className="space-y-4">
              {systemHealth.map((metric, index) => (
                <motion.div
                  key={metric.name}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{metric.name}</p>
                    <p className="text-xs text-gray-600 capitalize">{metric.status}</p>
                  </div>
                  <p className={`text-sm font-bold ?{metric.color}`}>{metric.value}</p>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">All systems operational</span>
              </div>
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
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity, index) => (
                <motion.div
                  key={activity.id}
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                >
                  <div className={`p-1 rounded-full ?{
                    activity.type === 'user' ? 'bg-purple-100' :
                    activity.type === 'project' ? 'bg-orange-100' :
                    activity.type === 'transaction' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    {activity.type === 'user' ? (
                      <Users className="w-3 h-3 text-purple-600" />
                    ) : activity.type === 'project' ? (
                      <TrendingUp className="w-3 h-3 text-orange-600" />
                    ) : activity.type === 'transaction' ? (
                      <DollarSign className="w-3 h-3 text-purple-600" />
                    ) : (
                      <Activity className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.timeAgo}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 mt-4">
              View Activity Log
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
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3">
                <Users className="w-4 h-4 text-primary-600" />
                <span className="text-sm">Manage Users</span>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3">
                <TrendingUp className="w-4 h-4 text-primary-600" />
                <span className="text-sm">Review Projects</span>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3">
                <BarChart3 className="w-4 h-4 text-primary-600" />
                <span className="text-sm">View Reports</span>
              </button>
              
              <button 
                onClick={() => window.location.href = '/admin/news/create'}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
              >
                <TrendingUp className="w-4 h-4 text-primary-600" />
                <span className="text-sm">Create News</span>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3">
                <Settings className="w-4 h-4 text-primary-600" />
                <span className="text-sm">System Settings</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
