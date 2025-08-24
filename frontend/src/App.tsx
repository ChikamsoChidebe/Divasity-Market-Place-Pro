import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Public Pages
import LandingPage from './pages/LandingPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import NewsPage from './pages/NewsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import HelpPage from './pages/HelpPage';
import DBSPage from './pages/DBSPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyOTPPage from './pages/auth/VerifyOTPPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Dashboard Pages
import UserDashboard from './pages/dashboard/UserDashboard';
import InvestorDashboard from './pages/dashboard/InvestorDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

import CreatorSettings from './pages/creator/CreatorSettings';
import CreatorMessages from './pages/creator/CreatorMessages';
import MyProjects from './pages/creator/MyProjects';
import CreatorWallet from './pages/creator/CreatorWallet';
import InvestorPortfolio from './pages/investor/InvestorPortfolio';
import InvestorInvestments from './pages/investor/InvestorInvestments';
import InvestorProjectsView from './components/investor/InvestorProjectsView';
import InvestorProjectDetails from './pages/investor/InvestorProjectDetails';
import InvestorWallet from './pages/investor/InvestorWallet';
import AdminWallet from './pages/admin/AdminWallet';
import CreatorNotifications from './pages/creator/CreatorNotifications';
import InvestorNotifications from './pages/investor/InvestorNotifications';

// Other Pages
import CreateProjectPage from './pages/CreateProjectPage';
import ProfilePage from './pages/ProfilePage';
import WalletPage from './pages/WalletPage';

// Layouts
import CreatorLayout from './components/layouts/CreatorLayout';
import InvestorLayout from './components/layouts/InvestorLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AIWidget from './components/ai/AIWidget';


// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { user, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailsPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/dbs" element={<DBSPage />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
            {/* Creator Platform */}
            <Route path="/creator/*" element={<CreatorLayout />}>
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="my-projects" element={<MyProjects />} />
              <Route path="projects/create" element={<CreateProjectPage />} />
              <Route path="projects/:id" element={<ProjectDetailsPage />} />

              <Route path="wallet" element={<CreatorWallet />} />
              <Route path="messages" element={<CreatorMessages />} />
              <Route path="settings" element={<CreatorSettings />} />
              <Route path="notifications" element={<CreatorNotifications />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            
            {/* Investor Platform */}
            <Route path="/investor/*" element={<InvestorLayout />}>
              <Route path="dashboard" element={<InvestorDashboard />} />
              <Route path="projects" element={<InvestorProjectsView />} />
              <Route path="projects/:id" element={<InvestorProjectDetails />} />
              <Route path="portfolio" element={<InvestorPortfolio />} />

              <Route path="wallet" element={<InvestorWallet />} />
              <Route path="investments" element={<InvestorInvestments />} />
              <Route path="notifications" element={<InvestorNotifications />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            
            {/* Admin Platform */}
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<div className="p-8"><h1 className="text-2xl font-bold">User Management</h1><p className="text-gray-600 mt-2">User management interface coming soon...</p></div>} />
              <Route path="projects" element={<div className="p-8"><h1 className="text-2xl font-bold">Project Reviews</h1><p className="text-gray-600 mt-2">Project review interface coming soon...</p></div>} />

              <Route path="wallet" element={<AdminWallet />} />
              <Route path="security" element={<div className="p-8"><h1 className="text-2xl font-bold">Security Center</h1><p className="text-gray-600 mt-2">Security management coming soon...</p></div>} />
              <Route path="reports" element={<div className="p-8"><h1 className="text-2xl font-bold">Reports</h1><p className="text-gray-600 mt-2">Reporting dashboard coming soon...</p></div>} />
              <Route path="settings" element={<div className="p-8"><h1 className="text-2xl font-bold">System Settings</h1><p className="text-gray-600 mt-2">System configuration coming soon...</p></div>} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>
          
          {/* Redirect based on user role */}
          <Route path="/dashboard" element={
            user ? (
              user.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> :
              user.role === 'investor' ? <Navigate to="/investor/dashboard" replace /> :
              <Navigate to="/creator/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        {/* AI Widget - Available across the entire site */}
        <AIWidget />
      </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
