import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://test.divasity.com/foldername/api';

interface ApiResponse<T = any> {
  error: boolean;
  message: string;
  data?: T;
  errorMessage?: string;
  token?: string;
}

class ApiService {
  private api: any;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config: any) => {
        const token = sessionStorage.getItem('divasity_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        if (error.response?.status === 401) {
          sessionStorage.removeItem('divasity_token');
          sessionStorage.removeItem('divasity_user');
          toast.error('Session expired. Please login again.');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // User Authentication APIs
  async register(userData: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    address: string;
    userName: string;
    telephone: string;
    role?: string;
  }): Promise<ApiResponse> {
    return this.post('/users/register', {
      ...userData,
      email: userData.email.replace('mailto:', '')
    });
  }

  async verifyOTP(email: string, otp: string): Promise<ApiResponse> {
    return this.post('/users/verifyotp', {
      email: email.replace('mailto:', ''),
      otp
    });
  }

  async resendOTP(email: string): Promise<ApiResponse> {
    return this.post('/users/resendOtp', {
      email: email.replace('mailto:', '')
    });
  }

  async login(email: string, password: string): Promise<ApiResponse> {
    return this.post('/users/login', {
      email: email.replace('mailto:', ''),
      password
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.post('/users/forgot-password', {
      email: email.replace('mailto:', '')
    });
  }

  async resetPassword(otp: string, newPassword: string): Promise<ApiResponse> {
    return this.post('/users/verify-otp', {
      otp,
      new_password: newPassword
    });
  }

  // User Management APIs
  async getAllUsers(): Promise<ApiResponse> {
    return this.get('/users/getuser');
  }

  async getUserById(id: string): Promise<ApiResponse> {
    return this.get(`/users/getuser/${id}`);
  }

  async updateUser(id: string, data: { userName?: string; telephone?: string }): Promise<ApiResponse> {
    return this.patch(`/users/update/${id}`, data);
  }

  async topUpBalance(transactionId: string): Promise<ApiResponse> {
    return this.post('/users/topup', { transactionId });
  }

  // Project APIs
  async getAllProjects(): Promise<ApiResponse> {
    try {
      const response = await this.api.get('/projects');
      console.log('Raw projects response:', response);
      
      // According to API docs, /projects returns array directly
      if (Array.isArray(response.data)) {
        return {
          error: false,
          message: 'Projects retrieved successfully',
          data: response.data
        };
      }
      
      // If it's wrapped in another structure
      return response.data;
    } catch (error: any) {
      console.error('getAllProjects API error:', error);
      throw this.handleError(error);
    }
  }

  async getProjectById(id: string): Promise<ApiResponse> {
    return this.get(`/projects/${id}`);
  }

  async createProject(projectData: {
    name: string;
    category: string;
    expectedRaiseAmount: string;
    description: string;
    startDate: string;
    endDate: string;
  }): Promise<ApiResponse> {
    return this.post('/projects', projectData);
  }

  async updateProject(id: string, projectData: {
    name?: string;
    category?: string;
    expectedRaiseAmount?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse> {
    return this.put(`/projects/${id}`, projectData);
  }

  async deleteProject(id: string): Promise<ApiResponse> {
    return this.delete(`/projects/${id}`);
  }

  // Investment APIs
  async createInvestment(projectId: string, amount: string): Promise<ApiResponse> {
    return this.post('/investments', { projectId, amount });
  }

  async getMyInvestments(): Promise<ApiResponse> {
    return this.get('/investments/my-investments');
  }

  async getInvestmentStats(): Promise<ApiResponse> {
    return this.get('/investments/stats');
  }

  async updateInvestmentOutcome(investmentId: string, data: {
    returnAmount: string;
    successRate: number;
  }): Promise<ApiResponse> {
    return this.put(`/investments/${investmentId}/outcome`, {
      investmentId,
      ...data
    });
  }

  // News APIs
  async createNews(newsData: {
    Newstitle: string;
    Newscontent: string;
    Newsimage: string;
    links: string;
    categories: string[];
  }): Promise<ApiResponse> {
    return this.post('/news/createNews', newsData);
  }

  async getAllNews(): Promise<ApiResponse> {
    try {
      const response = await this.api.get('/news/getnews');
      console.log('Raw news response:', response);
      
      // Handle the response based on API documentation format
      if (response.data && response.data.data) {
        return {
          error: false,
          message: 'News retrieved successfully',
          data: response.data.data
        };
      }
      
      return response.data;
    } catch (error: any) {
      console.error('getAllNews API error:', error);
      throw this.handleError(error);
    }
  }

  // Generic HTTP methods
  async get<T>(endpoint: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get(endpoint, { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post(endpoint, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put(endpoint, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.patch(endpoint, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete(endpoint);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse {
    console.error('API Error Details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    if (error.response?.data) {
      return error.response.data;
    }
    
    return {
      error: true,
      message: error.response?.status === 404 ? 'API endpoint not found' : 'Network error occurred',
      errorMessage: error.message || 'Unknown error',
    };
  }
}

export const apiService = new ApiService();
