import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthService } from '../services/authService';

interface User {
  id: string;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  telephone: string;
  role: 'user' | 'investor' | 'admin';
  IsVerified: boolean;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, token: string) => void;
  register: (userData: any) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  initializeAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),

      setToken: (token) => set({ token }),

      setLoading: (isLoading) => set({ isLoading }),

      login: (user, token) => {
        sessionStorage.setItem('divasity_token', token);
        sessionStorage.setItem('divasity_user', JSON.stringify(user));
        set({ 
          user, 
          token, 
          isAuthenticated: true,
          isLoading: false 
        });
      },

      logout: () => {
        sessionStorage.removeItem('divasity_token');
        sessionStorage.removeItem('divasity_user');
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          isLoading: false 
        });
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          sessionStorage.setItem('divasity_user', JSON.stringify(updatedUser));
          set({ user: updatedUser });
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          // Mock registration - replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      verifyOTP: async (email, otp) => {
        set({ isLoading: true, error: null });
        try {
          const { apiService } = await import('../services/api');
          const response = await apiService.post('/users/verify-email', { email, otp });
          
          if (response.error) {
            throw new Error(response.message || response.errorMessage || 'Verification failed');
          }
          
          set({ isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 
                              error.response?.data?.errorMessage || 
                              error.message || 
                              'Verification failed';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      resendOTP: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const { apiService } = await import('../services/api');
          const response = await apiService.post('/users/resend-otp', { email });
          
          if (response.error) {
            throw new Error(response.message || response.errorMessage || 'Failed to resend OTP');
          }
          
          set({ isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 
                              error.response?.data?.errorMessage || 
                              error.message || 
                              'Failed to resend OTP';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          // Mock forgot password - replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      resetPassword: async (token, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          // Mock reset password - replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          // Mock update profile - replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          const currentUser = get().user;
          if (currentUser) {
            const updatedUser = { ...currentUser, ...profileData };
            set({ user: updatedUser, isLoading: false });
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          // Mock change password - replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      initializeAuth: () => {
        const token = AuthService.getToken();
        const user = AuthService.getCurrentUser();
        
        if (token && user) {
          set({ 
            user, 
            token, 
            isAuthenticated: true,
            isLoading: false 
          });
        } else {
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false,
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'divasity-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
