import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FolderPlus, 
  BarChart3, 
  Wallet, 
  Settings, 
  User, 
  Bell, 
  Search,
  Menu,
  X,
  Plus,
  Zap,
  LogOut,
  ChevronDown,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { dashboardService } from '../../services/dashboardService';
import toast from 'react-hot-toast';
import divasityLogo from '../../assets/divasityIcon.png';

const CreatorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [userBalance, setUserBalance] = useState(0);

  const navigation = [
    { name: 'Dashboard', href: '/creator/dashboard', icon: LayoutDashboard },
    { name: 'My Projects', href: '/creator/my-projects', icon: FolderPlus },
    { name: 'Wallet', href: '/creator/wallet', icon: Wallet },
    { name: 'Notifications', href: '/creator/notifications', icon: Bell },
    { name: 'Settings', href: '/creator/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchUserBalance();
    }
  }, [user?.id]);

  const fetchUserBalance = async () => {
    try {
      const profile = await dashboardService.getUserProfile(user?.id || '');
      const balance = parseFloat(profile.balance || '0');
      setUserBalance(balance);
    } catch (error) {
      console.error('Failed to fetch user balance:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-gray-600 opacity-75" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isSidebarOpen ? 0 : -320,
        }}
        className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl lg:hidden"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <img 
                src={divasityLogo} 
                alt="Divasity" 
                className="w-8 h-8 rounded-lg object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Divasity</h1>
                <p className="text-xs text-purple-600 font-medium">Creator Platform</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">@{user?.userName || user?.email?.split('@')[0]}</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-700">Wallet Balance</span>
                <span className="text-lg font-bold text-purple-900">₦{userBalance.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-6 py-6 space-y-2">
            {navigation.map((item) => (
              <motion.button
                key={item.name}
                onClick={() => {
                  navigate(item.href);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                  isActive(item.href)
                    ? 'bg-purple-100 text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </motion.button>
            ))}
          </nav>

          <div className="p-6 border-t border-gray-200">
            <motion.button
              onClick={() => navigate('/creator/projects/create')}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl flex items-center justify-center space-x-2 font-medium hover:from-purple-700 hover:to-purple-800 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              <span>Create Project</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
        <div className="w-80 bg-white shadow-xl h-full flex flex-col">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <img 
                src={divasityLogo} 
                alt="Divasity" 
                className="w-8 h-8 rounded-lg object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Divasity</h1>
                <p className="text-xs text-purple-600 font-medium">Creator Platform</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">@{user?.userName || user?.email?.split('@')[0]}</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-700">Wallet Balance</span>
                <span className="text-lg font-bold text-purple-900">₦{userBalance.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-6 py-6 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                  isActive(item.href)
                    ? 'bg-purple-100 text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/creator/projects/create')}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl flex items-center justify-center space-x-2 font-medium hover:from-purple-700 hover:to-purple-800 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Create Project</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 max-w-2xl mx-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects, analytics, or settings..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => navigate('/creator/notifications')}
                className="relative p-2 rounded-lg hover:bg-gray-100"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="w-6 h-6 text-gray-600" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </motion.button>

              <div className="relative">
                <motion.button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.firstName?.[0]}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </motion.button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                    >
                      <button
                        onClick={() => {
                          navigate('/creator/profile');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-100"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/creator/settings');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-100"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/help');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-100"
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span>Help</span>
                      </button>
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-100 text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 pb-20 lg:pb-4">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 safe-area-inset-bottom z-40">
        <div className="flex items-center justify-around">
          {navigation.slice(0, 4).map((item) => (
            <motion.button
              key={item.name}
              onClick={() => navigate(item.href)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg touch-manipulation min-h-[44px] min-w-[44px] ${
                isActive(item.href) ? 'text-purple-600' : 'text-gray-600'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium truncate">{item.name.split(' ')[0]}</span>
            </motion.button>
          ))}
          <motion.button
            onClick={() => navigate('/creator/projects/create')}
            className="flex flex-col items-center space-y-1 p-2 rounded-lg text-purple-600 touch-manipulation min-h-[44px] min-w-[44px]"
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium">Create</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CreatorLayout;