import { apiService } from './api';
import { ToastService } from './toastService';

interface User {
  id: string;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  telephone: string;
  role: 'user' | 'investor' | 'admin';
  IsVerified: boolean;
  balance: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserRegistration {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  address: string;
  userName: string;
  telephone: string;
}

interface UserLogin {
  email: string;
  password: string;
}

interface ApiResponse<T = any> {
  error: boolean;
  message: string;
  data?: T;
  errorMessage?: string;
}

export class AuthService {
  // Register new user
  static async register(userData: UserRegistration): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiService.post('/users/register', userData);
      if (!response.error) {
        ToastService.success(response.message || 'Registration successful! Please check your email for OTP.');
      } else {
        ToastService.error(response.errorMessage || response.message || 'Registration failed');
      }
      return response;
    } catch (error: any) {
      ToastService.error('Registration failed. Please try again.');
      throw error;
    }
  }

  // Verify OTP
  static async verifyOTP(email: string, otp: string): Promise<ApiResponse<User>> {
    try {
      const response = await apiService.post('/users/verifyotp', { email, otp });
      if (!response.error) {
        ToastService.success('Account verified successfully!');
      } else {
        ToastService.error(response.errorMessage || response.message || 'OTP verification failed');
      }
      return response;
    } catch (error: any) {
      ToastService.error('OTP verification failed. Please try again.');
      throw error;
    }
  }

  // Resend OTP
  static async resendOTP(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiService.post('/users/resendOtp', { email });
      if (!response.error) {
        ToastService.success('New OTP sent to your email!');
      } else {
        ToastService.error(response.errorMessage || response.message || 'Failed to resend OTP');
      }
      return response;
    } catch (error: any) {
      ToastService.error('Failed to resend OTP. Please try again.');
      throw error;
    }
  }

  // Login user
  static async login(credentials: UserLogin): Promise<ApiResponse<{ data: User; token: string }>> {
    try {
      const response = await apiService.post('/users/login', credentials);
      
      if (!response.error && response.data) {
        // Store token and user data
        sessionStorage.setItem('divasity_token', response.token);
        sessionStorage.setItem('divasity_user', JSON.stringify(response.data));
        ToastService.success('Login successful!');
      } else {
        ToastService.error(response.errorMessage || response.message || 'Login failed');
      }
      
      return response;
    } catch (error: any) {
      ToastService.error('Login failed. Please check your credentials.');
      throw error;
    }
  }

  // Forgot password
  static async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiService.post('/users/forgot-password', { email });
      if (!response.error) {
        ToastService.success('Password reset OTP sent to your email!');
      } else {
        ToastService.error(response.errorMessage || response.message || 'Failed to send reset OTP');
      }
      return response;
    } catch (error: any) {
      ToastService.error('Failed to send reset OTP. Please try again.');
      throw error;
    }
  }

  // Reset password with OTP
  static async resetPassword(otp: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiService.post('/users/verify-otp', { 
        otp, 
        new_password: newPassword 
      });
      if (!response.error) {
        ToastService.success('Password updated successfully!');
      } else {
        ToastService.error(response.errorMessage || response.message || 'Failed to update password');
      }
      return response;
    } catch (error: any) {
      ToastService.error('Failed to update password. Please try again.');
      throw error;
    }
  }

  // Get current user
  static getCurrentUser(): User | null {
    const userData = sessionStorage.getItem('divasity_user');
    return userData ? JSON.parse(userData) : null;
  }

  // Get current token
  static getToken(): string | null {
    return sessionStorage.getItem('divasity_token');
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // Logout user
  static logout(): void {
    sessionStorage.removeItem('divasity_token');
    sessionStorage.removeItem('divasity_user');
    window.location.href = '/';
  }

  // Update user profile
  static async updateProfile(userId: string, data: { userName?: string; telephone?: string }): Promise<ApiResponse<User>> {
    const response = await apiService.patch(`/users/update/${userId}`, data);
    
    if (!response.error && response.data) {
      // Update stored user data
      sessionStorage.setItem('divasity_user', JSON.stringify(response.data));
    }
    
    return response;
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<ApiResponse<User>> {
    return apiService.get(`/users/getuser/${userId}`);
  }

  // Get all users (admin only)
  static async getAllUsers(): Promise<ApiResponse<User[]>> {
    return apiService.get('/users/getuser');
  }

  // Top up wallet with Flutterwave transaction
  static async topUpWallet(transactionId: string): Promise<ApiResponse<{
    transactionId: string;
    amount: string;
    newBalance: string;
  }>> {
    try {
      const response = await apiService.post('/users/topup', { transactionId });
      if (!response.error) {
        ToastService.success('Wallet topped up successfully!');
        // Update stored user data with new balance
        const currentUser = this.getCurrentUser();
        if (currentUser && response.data) {
          currentUser.balance = response.data.newBalance;
          sessionStorage.setItem('divasity_user', JSON.stringify(currentUser));
        }
      } else {
        ToastService.error(response.errorMessage || response.message || 'Failed to top up wallet');
      }
      return response;
    } catch (error: any) {
      ToastService.error('Failed to top up wallet. Please try again.');
      throw error;
    }
  }
}

export default AuthService;
