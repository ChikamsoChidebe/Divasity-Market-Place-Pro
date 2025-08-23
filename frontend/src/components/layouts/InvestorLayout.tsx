import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Search, 
  Briefcase, 
  DollarSign,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Wallet,
  BarChart3,
  Target,
  Home,
  PieChart
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useWalletStore } from '../../store/walletStore';
import { toast } from 'react-hot-toast';
import divasityLogo from '../../assets/divasityIcon.png';

export default function InvestorLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { balance, fetchWalletData } = useWalletStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    fetchWalletData();
    if (user?.id) {
      fetchUserBalance();
    }
  }, [user?.id]);

  // Listen for wallet updates
  useEffect(() => {
    const handleWalletUpdate = () => {
      fetchUserBalance();
    };

    // Listen for custom wallet update events
    window.addEventListener('walletUpdated', handleWalletUpdate);
    
    // Also check sessionStorage for balance updates
    const checkStorageBalance = () => {
      const storedUser = JSON.parse(sessionStorage.getItem('divasity_user') || '{}');
      if (storedUser.balance && parseFloat(storedUser.balance) !== userBalance) {
        setUserBalance(parseFloat(storedUser.balance));
      }
    };

    const interval = setInterval(checkStorageBalance, 1000);

    return () => {
      window.removeEventListener('walletUpdated', handleWalletUpdate);
      clearInterval(interval);
    };
  }, [userBalance]);

  const fetchUserBalance = async () => {
    try {
      // First try to get from sessionStorage
      const storedUser = JSON.parse(sessionStorage.getItem('divasity_user') || '{}');
      if (storedUser.balance) {
        setUserBalance(parseFloat(storedUser.balance));
      }

      // Then try to fetch from API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('divasity_token')}`
        }
      });
      const data = await response.json();
      if (!data.error && data.data?.balance) {
        const newBalance = parseFloat(data.data.balance);
        setUserBalance(newBalance);
        
        // Update sessionStorage
        const currentUser = JSON.parse(sessionStorage.getItem('divasity_user') || '{}');
        currentUser.balance = newBalance.toString();
        sessionStorage.setItem('divasity_user', JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error('Failed to fetch user balance:', error);
      // Fallback to sessionStorage
      const storedUser = JSON.parse(sessionStorage.getItem('divasity_user') || '{}');
      if (storedUser.balance) {
        setUserBalance(parseFloat(storedUser.balance));
      }
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/investor/dashboard', icon: LayoutDashboard },
    { name: 'Explore Projects', href: '/investor/projects', icon: Search },
    { name: 'My Portfolio', href: '/investor/portfolio', icon: Briefcase },
    { name: 'Wallet', href: '/investor/wallet', icon: Wallet },
    { name: 'Investments', href: '/investor/investments', icon: TrendingUp },
    { name: 'Notifications', href: '/investor/notifications', icon: Bell },
  ];

  const bottomNavigation = [
    { name: 'Home', href: '/investor/dashboard', icon: Home },
    { name: 'Explore', href: '/investor/projects', icon: Search },
    { name: 'Portfolio', href: '/investor/portfolio', icon: PieChart },
    { name: 'Wallet', href: '/investor/wallet', icon: Wallet },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white/80 backdrop-blur-xl border-r border-orange-200">
          {/* Logo */}
          <div className="flex h-16 flex-shrink-0 items-center px-6 border-b border-orange-200">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <img 
                src={divasityLogo} 
                alt="Divasity" 
                className="w-8 h-8 rounded-lg object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Divasity</h1>
                <p className="text-xs text-orange-600 font-medium">Investor Platform</p>
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
                  className={`group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </motion.button>
              ))}
            </nav>

            {/* Wallet Summary */}
            <div className="mx-3 mt-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Available Balance</span>
                <Wallet className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-xl font-bold text-gray-900">₦{userBalance.toLocaleString()}</p>
              <button 
                onClick={() => navigate('/investor/wallet')}
                className="w-full mt-2 text-xs bg-orange-600 text-white py-1.5 rounded-md hover:bg-orange-700 transition-colors"
              >
                Add Funds
              </button>
            </div>

            {/* User Profile */}
            <div className="mx-3 mt-6 p-4 border-t border-orange-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">@{user?.userName || user?.email?.split('@')[0]}</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate('/investor/profile')}
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
              <div className="flex h-16 items-center justify-between px-6 border-b border-orange-200">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
                  <img 
                    src={divasityLogo} 
                    alt="Divasity" 
                    className="w-8 h-8 rounded-lg object-contain"
                  />
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">Divasity</h1>
                    <p className="text-xs text-orange-600 font-medium">Investor</p>
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
                    className={`group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                        : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
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
        <header className="bg-white/80 backdrop-blur-xl border-b border-orange-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Search Bar */}
              <div className="flex-1 max-w-lg mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects, investments..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50"
                  />
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button 
                  onClick={() => navigate('/investor/notifications')}
                  className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <Bell className="w-5 h-5" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button>

                {/* Balance Display */}
                <div className="hidden sm:flex items-center space-x-2 bg-orange-50 px-3 py-1.5 rounded-lg">
                  <Wallet className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">₦{userBalance.toLocaleString()}</span>
                </div>

                {/* Profile Menu */}
                <div className="relative">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user?.firstName}
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
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-orange-200 z-30">
          <div className="grid grid-cols-4 gap-1 p-2">
            {bottomNavigation.map((item) => (
              <motion.button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${
                  isActive(item.href)
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
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
