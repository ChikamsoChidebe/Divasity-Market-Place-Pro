import { apiService } from './api';
import { Project, ProjectForm, ApiResponse } from '../types';
import { ToastService } from './toastService';

export class ProjectService {
  // Get all projects
  static async getAllProjects(): Promise<ApiResponse<Project[]>> {
    return apiService.get('/projects');
  }

  // Get project by ID
  static async getProjectById(id: string): Promise<ApiResponse<Project>> {
    return apiService.get(`/projects/?{id}`);
  }

  // Create new project
  static async createProject(projectData: ProjectForm): Promise<ApiResponse<Project>> {
    try {
      const response = await apiService.post('/projects', projectData);
      if (!response.error) {
        ToastService.success('Project created successfully!');
      } else {
        ToastService.error(response.errorMessage || response.message || 'Failed to create project');
      }
      return response;
    } catch (error: any) {
      ToastService.error('Failed to create project. Please try again.');
      throw error;
    }
  }

  // Update project
  static async updateProject(id: string, projectData: Partial<ProjectForm>): Promise<ApiResponse<Project>> {
    try {
      const response = await apiService.put(`/projects/?{id}`, projectData);
      if (!response.error) {
        ToastService.success('Project updated successfully!');
      } else {
        ToastService.error(response.errorMessage || response.message || 'Failed to update project');
      }
      return response;
    } catch (error: any) {
      ToastService.error('Failed to update project. Please try again.');
      throw error;
    }
  }

  // Delete project
  static async deleteProject(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiService.delete(`/projects/?{id}`);
      if (!response.error) {
        ToastService.success('Project deleted successfully!');
      } else {
        ToastService.error(response.errorMessage || response.message || 'Failed to delete project');
      }
      return response;
    } catch (error: any) {
      ToastService.error('Failed to delete project. Please try again.');
      throw error;
    }
  }

  // Get projects by user (creator's projects)
  static async getUserProjects(): Promise<ApiResponse<Project[]>> {
    const allProjects = await this.getAllProjects();
    
    if (allProjects.error || !allProjects.data) {
      return allProjects;
    }

    // Filter projects by current user
    const currentUser = JSON.parse(localStorage.getItem('divasity_user') || '{}');
    const userProjects = allProjects.data.filter(project => project.userId === currentUser.id);
    
    return {
      error: false,
      message: 'User projects retrieved successfully',
      data: userProjects
    };
  }

  // Get project statistics
  static async getProjectStats(): Promise<ApiResponse<{
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalFunding: number;
    averageFunding: number;
    categoryDistribution: Array<{
      category: string;
      count: number;
      totalFunding: number;
    }>;
  }>> {
    const projectsResponse = await this.getAllProjects();
    
    if (projectsResponse.error || !projectsResponse.data) {
      return projectsResponse as any;
    }

    const projects = projectsResponse.data;
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'OPEN').length;
    const completedProjects = projects.filter(p => p.status === 'FUNDED').length;
    const totalFunding = projects.reduce((sum, p) => sum + parseFloat(p.totalMoneyInvested || '0'), 0);
    const averageFunding = totalProjects > 0 ? totalFunding / totalProjects : 0;

    // Category distribution
    const categoryMap = new Map<string, { count: number; totalFunding: number }>();
    projects.forEach(project => {
      const category = project.category;
      const funding = parseFloat(project.totalMoneyInvested || '0');
      
      if (categoryMap.has(category)) {
        const existing = categoryMap.get(category)!;
        categoryMap.set(category, {
          count: existing.count + 1,
          totalFunding: existing.totalFunding + funding
        });
      } else {
        categoryMap.set(category, { count: 1, totalFunding: funding });
      }
    });

    const categoryDistribution = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      totalFunding: data.totalFunding
    }));

    return {
      error: false,
      message: 'Project statistics retrieved successfully',
      data: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalFunding,
        averageFunding,
        categoryDistribution
      }
    };
  }

  // Search projects
  static async searchProjects(query: string): Promise<ApiResponse<Project[]>> {
    const allProjects = await this.getAllProjects();
    
    if (allProjects.error || !allProjects.data) {
      return allProjects;
    }

    const filteredProjects = allProjects.data.filter(project =>
      project.name.toLowerCase().includes(query.toLowerCase()) ||
      project.description.toLowerCase().includes(query.toLowerCase()) ||
      project.category.toLowerCase().includes(query.toLowerCase())
    );

    return {
      error: false,
      message: 'Search results retrieved successfully',
      data: filteredProjects
    };
  }

  // Get projects by category
  static async getProjectsByCategory(category: string): Promise<ApiResponse<Project[]>> {
    const allProjects = await this.getAllProjects();
    
    if (allProjects.error || !allProjects.data) {
      return allProjects;
    }

    const categoryProjects = allProjects.data.filter(project => 
      project.category.toLowerCase() === category.toLowerCase()
    );

    return {
      error: false,
      message: 'Category projects retrieved successfully',
      data: categoryProjects
    };
  }

  // Get trending projects (most invested in recently)
  static async getTrendingProjects(limit: number = 10): Promise<ApiResponse<Project[]>> {
    const allProjects = await this.getAllProjects();
    
    if (allProjects.error || !allProjects.data) {
      return allProjects;
    }

    // Sort by total money invested (descending) and take top projects
    const trendingProjects = allProjects.data
      .filter(project => project.status === 'OPEN')
      .sort((a, b) => parseFloat(b.totalMoneyInvested || '0') - parseFloat(a.totalMoneyInvested || '0'))
      .slice(0, limit);

    return {
      error: false,
      message: 'Trending projects retrieved successfully',
      data: trendingProjects
    };
  }

  // Calculate project funding progress
  static calculateFundingProgress(project: Project): number {
    const raised = parseFloat(project.totalMoneyInvested || '0');
    const target = parseFloat(project.expectedRaiseAmount || '1');
    return Math.min((raised / target) * 100, 100);
  }

  // Calculate days remaining for project
  static calculateDaysRemaining(project: Project): number {
    const endDate = new Date(project.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  }

  // Get project categories
  static async getProjectCategories(): Promise<ApiResponse<string[]>> {
    const allProjects = await this.getAllProjects();
    
    if (allProjects.error || !allProjects.data) {
      return allProjects as any;
    }

    const categories = [...new Set(allProjects.data.map(project => project.category))];

    return {
      error: false,
      message: 'Project categories retrieved successfully',
      data: categories
    };
  }
}

export default ProjectService;
