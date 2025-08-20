import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowLeft, UserCheck, TrendingUp } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { LocalStorageService } from '../../utils/localStorage';
import toast from 'react-hot-toast';
import divasityLogo from '../../assets/divasityIcon.png';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setLoading } = useAuthStore();
  
  const [formData, setFormData] = useState(() => {
    // Try to restore form data from localStorage
    const savedData = LocalStorageService.getFormData();
    return savedData || {
      email: '',
      firstName: '',
      lastName: '',
      userName: '',
      telephone: '',
      address: '',
      password: '',
      confirmPassword: '',
      role: searchParams.get('role') || '',
    };
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value,
    };
    setFormData(newFormData);
    // Save to localStorage for persistence
    LocalStorageService.saveFormData(newFormData);
  };

  const handleRoleSelect = (role: 'user' | 'investor') => {
    const newFormData = { ...formData, role };
    setFormData(newFormData);
    LocalStorageService.saveFormData(newFormData);
    setStep(1); // Auto-advance to step 1 after role selection
  };

  const validateStep1 = () => {
    const { email, firstName, lastName, userName } = formData;
    return email && firstName && lastName && userName;
  };

  const validateStep2 = () => {
    const { telephone, password, confirmPassword } = formData;
    return telephone && password && confirmPassword && password === confirmPassword && password.length >= 6;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+?/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,2}[\s]?[\d]{3,14}?/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!validatePhone(formData.telephone)) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    // Check for duplicates in local backup
    if (LocalStorageService.emailExistsInBackup(formData.email)) {
      toast.error('Email already exists in local records');
      return;
    }

    if (LocalStorageService.usernameExistsInBackup(formData.userName)) {
      toast.error('Username already exists in local records');
      return;
    }

    setIsLoading(true);
    setLoading(true);

    try {
      // Try API call first
      const response = await apiService.register({
        email: formData.email.trim().toLowerCase(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        userName: formData.userName.trim(),
        telephone: formData.telephone.trim(),
        address: formData.address.trim(),
        password: formData.password,
        role: formData.role
      });
      
      if (response.error) {
        // If API fails, store locally as backup (without password for security)
        const backupData = {
          email: formData.email.trim().toLowerCase(),
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          userName: formData.userName.trim(),
          telephone: formData.telephone.trim(),
          address: formData.address.trim(),
          role: formData.role,
          hasPassword: true
        };
        LocalStorageService.backupUserData(backupData);
        toast.error(`${response.errorMessage || 'Registration failed'} - Data saved locally`);
        return;
      }
      
      // Clear form data on successful registration
      LocalStorageService.clearFormData();
      toast.success('Registration successful! Please check your email for verification code.');
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Full error object:', JSON.stringify(error.response, null, 2));
      
      // Backup data locally if API is unavailable
      const backupData = {
        email: formData.email.trim().toLowerCase(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        userName: formData.userName.trim(),
        telephone: formData.telephone.trim(),
        address: formData.address.trim(),
        role: formData.role,
        // Don't store password in backup for security
        hasPassword: true
      };
      
      LocalStorageService.backupUserData(backupData);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errorMessage || 
                          error.errorMessage || 
                          error.message || 
                          'Registration failed';
      toast.error(`${errorMessage} - Data saved locally for when service is available`);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      if (!validateEmail(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
      setStep(2);
    } else if (step === 1) {
      toast.error('Please fill in all required fields');
    }
  };

  // Auto-save form data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (formData.email || formData.firstName || formData.lastName) {
        LocalStorageService.saveFormData(formData);
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, [formData]);

  // Clear form data on successful navigation away
  useEffect(() => {
    return () => {
      // Only clear if we're navigating to login (successful registration)
      if (window.location.pathname === '/login') {
        LocalStorageService.clearFormData();
      }
    };
  }, []);

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-purple-400/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-orange-400/10 to-purple-400/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <motion.button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 mb-8 transition-colors"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </motion.button>

        <motion.div
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <motion.div
              className="flex items-center justify-center space-x-4 mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <img 
                src={divasityLogo} 
                alt="Divasity" 
                className="w-16 h-16 rounded-2xl object-contain shadow-lg"
              />
              <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-600 bg-clip-text text-transparent">Divasity</span>
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Join the Future</h1>
            <p className="text-gray-600 text-lg">Create your account and start building tomorrow</p>
          </div>

          {step > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>1</div>
                  <div className={`w-16 h-1 rounded-full ${
                    step >= 2 ? 'bg-purple-600' : 'bg-gray-200'
                  }`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>2</div>
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {step === 1 ? 'Basic Information' : 'Complete Your Profile'}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {step === 1 ? 'Tell us about yourself' : 'Add your contact information and password'}
                </p>
              </div>
            </div>
          )}

          {step === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">What's Your Journey?</h2>
                <p className="text-gray-600 text-lg">Choose your path to get started</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                <motion.button
                  type="button"
                  onClick={() => handleRoleSelect('user')}
                  className="group p-8 rounded-2xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30"
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow">
                    <UserCheck className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Project Creator</h3>
                  <p className="text-gray-600 text-base leading-relaxed">Launch innovative campaigns, showcase your ideas, and bring creative projects to life with community support</p>
                  <div className="mt-6 inline-flex items-center text-purple-600 font-semibold group-hover:text-purple-700">
                    Start Creating →
                  </div>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => handleRoleSelect('investor')}
                  className="group p-8 rounded-2xl border-2 border-gray-200 hover:border-orange-400 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30"
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow">
                    <TrendingUp className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Smart Investor</h3>
                  <p className="text-gray-600 text-base leading-relaxed">Discover promising projects, build a diverse portfolio, and support innovation while earning returns</p>
                  <div className="mt-6 inline-flex items-center text-orange-600 font-semibold group-hover:text-orange-700">
                    Start Investing →
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >

              <div className="mb-6">
                <div className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-50 to-purple-50 rounded-xl border border-purple-200">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    formData.role === 'user' ? 'bg-purple-600' : 'bg-orange-600'
                  }`}>
                    {formData.role === 'user' ? 
                      <UserCheck className="w-4 h-4 text-white" /> : 
                      <TrendingUp className="w-4 h-4 text-white" />
                    }
                  </div>
                  <span className="text-gray-700 font-semibold">
                    Selected: {formData.role === 'user' ? 'Project Creator' : 'Smart Investor'}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="userName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Username *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="userName"
                      name="userName"
                      value={formData.userName}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="Choose a unique username"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-between">
                <motion.button
                  type="button"
                  onClick={prevStep}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ← Back
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep1()}
                  className="bg-gradient-to-r from-purple-600 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  whileHover={{ scale: validateStep1() ? 1.05 : 1 }}
                  whileTap={{ scale: validateStep1() ? 0.95 : 1 }}
                >
                  Continue →
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="telephone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        id="telephone"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                        placeholder="Enter your address"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-12 py-4 border rounded-xl focus:ring-2 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm ${
                          formData.password && formData.password.length >= 6 ? 'border-orange-300 focus:ring-orange-500' : 
                          formData.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                        }`}
                        placeholder="Create a strong password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formData.password && formData.password.length < 6 && (
                      <p className="text-red-500 text-xs mt-1">Password must be at least 6 characters long</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-12 py-4 border rounded-xl focus:ring-2 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm ${
                          formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-orange-300 focus:ring-orange-500' : 
                          formData.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                        }`}
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-purple-50 p-4 rounded-xl">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                    I agree to the{' '}
                    <Link to="/terms" className="text-purple-600 hover:text-purple-700 font-semibold">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-purple-600 hover:text-purple-700 font-semibold">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <div className="flex justify-between pt-4">
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ← Back
                  </motion.button>

                  <motion.button
                    type="submit"
                    disabled={isLoading || !validateStep2()}
                    className="bg-gradient-to-r from-purple-600 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    whileHover={{ scale: isLoading || !validateStep2() ? 1 : 1.05 }}
                    whileTap={{ scale: isLoading || !validateStep2() ? 1 : 0.95 }}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-5 h-5" />
                        <span>Create Account</span>
                      </div>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
