import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Settings, 
  BarChart3,
  AlertTriangle,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Activity,
  Database,
  FileText,
  Home,
  UserCheck,
  TrendingUp,
  Flag
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';
import { toast } from 'react-hot-toast';
import divasityLogo from '../../assets/divasityIcon.png';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { systemStats, fetchSystemStats } = useAdminStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(5);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Project Reviews', href: '/admin/projects', icon: TrendingUp },
    { name: 'System Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Security Center', href: '/admin/security', icon: Shield },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  const bottomNavigation = [
    { name: 'Home', href: '/admin/dashboard', icon: Home },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Reviews', href: '/admin/projects', icon: Flag },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white/80 backdrop-blur-xl border-r border-purple-200">
          {/* Logo */}
          <div className="flex h-16 flex-shrink-0 items-center px-6 border-b border-purple-200">
            <div className="flex items-center space-x-3">
              <img 
                src={divasityLogo} 
                alt="Divasity" 
                className="w-8 h-8 rounded-lg object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Divasity</h1>
                <p className="text-xs text-purple-600 font-medium">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <nav className="flex-1 space-y-1 px-3">
              {navigation.map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-all ?{
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </motion.button>
              ))}
            </nav>

            {/* System Status */}
            <div className="mx-3 mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">System Status</span>
                <Activity className="w-4 h-4 text-orange-600" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Uptime</span>
                  <span className="font-medium text-orange-600">99.9%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-medium">{systemStats.totalUsers?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Pending Reviews</span>
                  <span className="font-medium text-orange-600">{systemStats.pendingReviews || '0'}</span>
                </div>
              </div>
            </div>

            {/* User Profile */}
            <div className="mx-3 mt-6 p-4 border-t border-purple-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">System Administrator</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate('/admin/profile')}
                  className="flex-1 text-xs bg-gray-100 text-gray-700 py-1.5 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                >
                  <Settings className="w-3 h-3" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 text-xs bg-red-100 text-red-700 py-1.5 rounded-md hover:bg-red-200 transition-colors flex items-center justify-center space-x-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-gray-600 opacity-75" onClick={() => setIsSidebarOpen(false)} />
            </motion.div>

            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white lg:hidden"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="flex h-16 items-center justify-between px-6 border-b border-purple-200">
                <div className="flex items-center space-x-3">
                  <img 
                    src={divasityLogo} 
                    alt="Divasity" 
                    className="w-8 h-8 rounded-lg object-contain"
                  />
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">Divasity</h1>
                    <p className="text-xs text-purple-600 font-medium">Admin</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1 px-3 pt-5">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.href);
                      setIsSidebarOpen(false);
                    }}
                    className={`group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium ?{
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </button>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-purple-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* System Info */}
              <div className="flex-1 max-w-lg mx-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-orange-50 px-3 py-1.5 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-orange-700">System Online</span>
                  </div>
                  
                  <div className="hidden sm:flex items-center space-x-2 bg-purple-50 px-3 py-1.5 rounded-lg">
                    <Database className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">DB: 98.5%</span>
                  </div>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center space-x-4">
                {/* Alerts */}
                <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <AlertTriangle className="w-5 h-5" />
                  {systemStats.pendingReviews > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                      {systemStats.pendingReviews}
                    </span>
                  )}
                </button>

                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Bell className="w-5 h-5" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button>

                {/* System Stats */}
                <div className="hidden sm:flex items-center space-x-2 bg-purple-50 px-3 py-1.5 rounded-lg">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">
                    {systemStats.totalUsers?.toLocaleString() || '0'} Users
                  </span>
                </div>

                {/* Profile Menu */}
                <div className="relative">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      Admin
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-purple-200 z-30">
          <div className="grid grid-cols-4 gap-1 p-2">
            {bottomNavigation.map((item) => (
              <motion.button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ?{
                  isActive(item.href)
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
