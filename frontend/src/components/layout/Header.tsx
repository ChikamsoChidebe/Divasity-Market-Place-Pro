import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Settings, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import divasityLogo from '../../assets/divasityIcon.png';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'News', href: '/news' },
    { name: 'Contact', href: '/contact' },
    { name: 'About', href: '/about' },
    { name: 'Projects', href: '/projects' },
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled || !isLandingPage 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={divasityLogo}
              alt="Divasity Logo"
              className="w-20 h-20 object-cover py-2"
            />
            <span
              className={`text-2xl md:text-2xl font-display font-bold transition-colors ${
                isScrolled || !isLandingPage
                  ? 'bg-gradient-to-r from-purple-500 to-orange-500 bg-clip-text text-transparent'
                  : 'text-white'
              }`}
            >
              Divasity
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`transition-colors duration-200 font-medium ${
                  isScrolled || !isLandingPage 
                    ? 'text-gray-700 hover:text-primary-600' 
                    : 'text-white hover:text-purple-200'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 transition-colors ${
                    isScrolled || !isLandingPage 
                      ? 'text-gray-600 hover:text-primary-600' 
                      : 'text-white hover:text-purple-200'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                </motion.button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.firstName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className={`font-medium transition-colors ${
                      isScrolled || !isLandingPage ? 'text-gray-700' : 'text-white'
                    }`}>
                      {user?.firstName || 'User'}
                    </span>
                  </motion.button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-large border border-gray-200"
                      >
                        <div className="py-2">
                          <Link
                            to={user?.role === 'investor' ? '/investor/dashboard' : '/creator/dashboard'}
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <User className="w-4 h-4 mr-3" />
                            Dashboard
                          </Link>
                          <Link
                            to={user?.role === 'investor' ? '/investor/profile' : '/creator/settings'}
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Settings className="w-4 h-4 mr-3" />
                            Settings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isScrolled || !isLandingPage 
                      ? 'text-gray-700 hover:bg-gray-100' 
                      : 'text-white hover:bg-white/20'
                  }`}>
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <button className="bg-gradient-to-r from-purple-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                    Get Started
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isScrolled || !isLandingPage 
                ? 'hover:bg-gray-100 text-gray-600' 
                : 'hover:bg-white/20 text-white'
            }`}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Side Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={() => setIsMenuOpen(false)}
              />
              
              {/* Side Menu */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed top-0 left-0 h-full w-80 bg-white shadow-large z-50 md:hidden"
              >
                <div className="p-6 h-full overflow-y-auto">
                  {/* Mobile Logo Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                      <img
                        src={divasityLogo}
                        alt="Divasity Logo"
                        className="w-12 h-12 object-contain"
                      />
                      <span className="text-2xl font-display font-bold text-gray-900">
                        Divasity
                      </span>
                    </div>
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>
                  
                  {/* User Info Section (if authenticated) */}
                  {isAuthenticated && user && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg font-medium">
                            {user.firstName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {user.role} Account
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Navigation Items */}
                  <nav className="space-y-1 mb-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
                      Navigation
                    </h3>
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-colors font-medium group"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-200">
                          {item.name}
                        </span>
                      </Link>
                    ))}
                  </nav>
                  
                  {/* Dashboard & Profile Section (if authenticated) */}
                  {isAuthenticated && (
                    <div className={`mb-6 ${isLandingPage ? 'pb-6 border-b border-gray-200' : ''}`}>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
                        Account
                      </h3>
                      <div className="space-y-1">
                        <Link
                          to={user?.role === 'investor' ? '/investor/dashboard' : '/creator/dashboard'}
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-colors font-medium group"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User className="w-5 h-5 mr-3 group-hover:text-primary-600" />
                          <span className="group-hover:translate-x-1 transition-transform duration-200">
                            Dashboard
                          </span>
                        </Link>
                        <Link
                          to={user?.role === 'investor' ? '/investor/profile' : '/creator/settings'}
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-colors font-medium group"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Settings className="w-5 h-5 mr-3 group-hover:text-primary-600" />
                          <span className="group-hover:translate-x-1 transition-transform duration-200">
                            Profile Settings
                          </span>
                        </Link>
                      </div>
                    </div>
                  )}
                  
                  {/* Auth Section */}
                  <div className="space-y-3">
                    {isAuthenticated ? (
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center justify-center w-full px-4 py-3 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors font-medium group"
                      >
                        <LogOut className="w-5 h-5 mr-2 group-hover:text-red-700" />
                        <span className="group-hover:font-semibold transition-all duration-200">
                          Logout
                        </span>
                      </button>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="block w-full text-center px-4 py-3 text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-lg transition-colors font-medium"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Login
                        </Link>
                        <Link
                          to="/register"
                          className="block w-full text-center px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Get Started
                        </Link>
                      </>
                    )}
                  </div>
                  
                  {/* Footer */}
                  <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500">
                      © {new Date().getFullYear()} Divasity Platform
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Empowering Innovation
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
