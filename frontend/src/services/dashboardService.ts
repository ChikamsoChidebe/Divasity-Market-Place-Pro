import { apiService } from './api';
import toast from 'react-hot-toast';

export interface DashboardStats {
  totalProjects: number;
  totalInvestments: number;
  totalInvestedAmount: number;
  totalReturnAmount: number;
  averageSuccessRate: number;
  balance: string;
  recentProjects: any[];
  recentInvestments: any[];
  news: any[];
}

class DashboardService {
  // Get comprehensive dashboard data for users (project creators)
  async getUserDashboard(userId?: string): Promise<DashboardStats> {
    try {
      console.log('Loading user dashboard data for user:', userId);
      
      const [allProjects, allNews] = await Promise.all([
        this.getAllProjects(),
        this.getAllNews()
      ]);

      console.log('Dashboard data loaded:', { projects: allProjects.length, news: allNews.length });

      // Filter projects by user if userId is provided
      const userProjects = userId ? allProjects.filter(project => project.userId === userId) : allProjects;
      console.log('User projects filtered:', userProjects.length);

      // Calculate total raised amount from user's projects
      const totalRaised = userProjects.reduce((sum, project) => {
        const raised = parseFloat(project.totalMoneyInvested || '0');
        return sum + raised;
      }, 0);

      return {
        totalProjects: userProjects.length,
        totalInvestments: 0,
        totalInvestedAmount: totalRaised,
        totalReturnAmount: 0,
        averageSuccessRate: 0,
        balance: '0.00',
        recentProjects: userProjects.slice(0, 5),
        recentInvestments: [],
        news: allNews.slice(0, 5)
      };
    } catch (error: any) {
      console.error('getUserDashboard error:', error);
      toast.error('Failed to load dashboard data');
      // Return empty data instead of throwing
      return {
        totalProjects: 0,
        totalInvestments: 0,
        totalInvestedAmount: 0,
        totalReturnAmount: 0,
        averageSuccessRate: 0,
        balance: '0.00',
        recentProjects: [],
        recentInvestments: [],
        news: []
      };
    }
  }

  // Get comprehensive dashboard data for investors
  async getInvestorDashboard(): Promise<DashboardStats> {
    try {
      console.log('Loading investor dashboard data...');
      
      const [investments, stats, projects, news] = await Promise.all([
        this.getMyInvestments(),
        this.getInvestmentStats(),
        this.getAllProjects(),
        this.getAllNews()
      ]);

      console.log('Investor dashboard data loaded:', { 
        investments: investments.length, 
        projects: projects.length, 
        news: news.length,
        stats 
      });

      return {
        totalProjects: projects.length,
        totalInvestments: stats.totalInvestments || 0,
        totalInvestedAmount: stats.totalInvestedAmount || 0,
        totalReturnAmount: stats.totalReturnAmount || 0,
        averageSuccessRate: stats.averageSuccessRate || 0,
        balance: '0.00', // Will be fetched from user profile
        recentProjects: projects.slice(0, 5),
        recentInvestments: investments.slice(0, 5),
        news: news.slice(0, 5)
      };
    } catch (error: any) {
      console.error('getInvestorDashboard error:', error);
      toast.error('Failed to load investor dashboard data');
      // Return empty data instead of throwing
      return {
        totalProjects: 0,
        totalInvestments: 0,
        totalInvestedAmount: 0,
        totalReturnAmount: 0,
        averageSuccessRate: 0,
        balance: '0.00',
        recentProjects: [],
        recentInvestments: [],
        news: []
      };
    }
  }

  // Get user profile with balance
  async getUserProfile(userId: string) {
    try {
      const response = await apiService.getUserById(userId);
      if (response.error) {
        throw new Error(response.message || 'Failed to fetch user profile');
      }
      return response.data;
    } catch (error: any) {
      toast.error('Failed to load user profile');
      throw error;
    }
  }

  // Update user profile (only username and telephone allowed)
  async updateUserProfile(userId: string, data: { userName?: string; telephone?: string }) {
    try {
      const response = await apiService.updateUser(userId, data);
      if (response.error) {
        throw new Error(response.message || response.errorMessage || 'Failed to update profile');
      }
      toast.success('Profile updated successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  }

  // Top up balance using Flutterwave transaction
  async topUpBalance(transactionId: string) {
    try {
      const response = await apiService.topUpBalance(transactionId);
      if (response.error) {
        throw new Error(response.message || response.errorMessage || 'Failed to top up balance');
      }
      toast.success('Balance updated successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to top up balance');
      throw error;
    }
  }

  // Create a new project (for users/creators)
  async createProject(projectData: {
    name: string;
    category: string;
    expectedRaiseAmount: string;
    description: string;
    startDate: string;
    endDate: string;
  }) {
    try {
      const response = await apiService.createProject(projectData);
      if (response.error) {
        throw new Error(response.message || response.errorMessage || 'Failed to create project');
      }
      toast.success('Project created successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project');
      throw error;
    }
  }

  // Update a project (for users/creators)
  async updateProject(projectId: string, projectData: {
    name?: string;
    category?: string;
    expectedRaiseAmount?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const response = await apiService.updateProject(projectId, projectData);
      if (response.error) {
        throw new Error(response.message || response.errorMessage || 'Failed to update project');
      }
      toast.success('Project updated successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update project');
      throw error;
    }
  }

  // Delete a project (for users/creators)
  async deleteProject(projectId: string) {
    try {
      const response = await apiService.deleteProject(projectId);
      if (response.error) {
        throw new Error(response.message || response.errorMessage || 'Failed to delete project');
      }
      toast.success('Project deleted successfully');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project');
      throw error;
    }
  }

  // Invest in a project (for investors)
  async investInProject(projectId: string, amount: string) {
    try {
      const response = await apiService.createInvestment(projectId, amount);
      if (response.error) {
        throw new Error(response.message || response.errorMessage || 'Failed to create investment');
      }
      toast.success('Investment created successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create investment');
      throw error;
    }
  }

  // Get all projects (public)
  async getAllProjects() {
    try {
      const response = await apiService.getAllProjects();
      console.log('Projects API Response:', response);
      
      if (response.error) {
        console.error('API Error:', response.message, response.errorMessage);
        throw new Error(response.message || 'Failed to fetch projects');
      }
      
      // Handle different response formats
      const projects = response.data || response || [];
      console.log('Processed projects:', projects);
      return Array.isArray(projects) ? projects : [];
    } catch (error: any) {
      console.error('getAllProjects error:', error);
      toast.error('Failed to load projects');
      return []; // Return empty array instead of throwing
    }
  }

  // Get project by ID (public)
  async getProjectById(projectId: string) {
    try {
      const response = await apiService.getProjectById(projectId);
      if (response.error) {
        throw new Error(response.message || 'Failed to fetch project');
      }
      return response.data;
    } catch (error: any) {
      toast.error('Failed to load project details');
      throw error;
    }
  }

  // Get all news (public)
  async getAllNews() {
    try {
      const response = await apiService.getAllNews();
      console.log('News API Response:', response);
      
      if (response.error) {
        console.error('News API Error:', response.message, response.errorMessage);
        throw new Error(response.message || 'Failed to fetch news');
      }
      
      const news = response.data || response || [];
      console.log('Processed news:', news);
      return Array.isArray(news) ? news : [];
    } catch (error: any) {
      console.error('getAllNews error:', error);
      toast.error('Failed to load news');
      return []; // Return empty array instead of throwing
    }
  }

  // Get user's investments
  async getMyInvestments() {
    try {
      const response = await apiService.getMyInvestments();
      console.log('My Investments API Response:', response);
      
      if (response.error) {
        console.error('Investments API Error:', response.message, response.errorMessage);
        return []; // Return empty array for error case
      }
      
      const investments = response.data || response || [];
      console.log('Processed investments:', investments);
      return Array.isArray(investments) ? investments : [];
    } catch (error: any) {
      console.error('getMyInvestments error:', error);
      return []; // Return empty array instead of throwing
    }
  }

  // Get investment statistics
  async getInvestmentStats() {
    try {
      const response = await apiService.getInvestmentStats();
      console.log('Investment Stats API Response:', response);
      
      if (response.error) {
        console.error('Investment Stats API Error:', response.message, response.errorMessage);
        return {
          totalInvestments: 0,
          totalInvestedAmount: 0,
          totalReturnAmount: 0,
          averageSuccessRate: 0
        };
      }
      
      const stats = response.data || response || {};
      console.log('Processed investment stats:', stats);
      return {
        totalInvestments: stats.totalInvestments || 0,
        totalInvestedAmount: stats.totalInvestedAmount || 0,
        totalReturnAmount: stats.totalReturnAmount || 0,
        averageSuccessRate: stats.averageSuccessRate || 0
      };
    } catch (error: any) {
      console.error('getInvestmentStats error:', error);
      return {
        totalInvestments: 0,
        totalInvestedAmount: 0,
        totalReturnAmount: 0,
        averageSuccessRate: 0
      };
    }
  }

  // Calculate project progress percentage
  calculateProjectProgress(project: any): number {
    if (!project.expectedRaiseAmount || !project.totalMoneyInvested) return 0;
    const expected = parseFloat(project.expectedRaiseAmount);
    const invested = parseFloat(project.totalMoneyInvested);
    return Math.min((invested / expected) * 100, 100);
  }

  // Calculate days remaining for a project
  calculateDaysRemaining(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  }

  // Format currency
  formatCurrency(amount: string | number): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₦${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2
    }).format(num)}`;
  }

  // Format percentage
  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }
}

export const dashboardService = new DashboardService();
