import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/api';

interface Project {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  goalAmount: number;
  currentAmount: number;
  backers: number;
  daysLeft: number;
  status: 'draft' | 'active' | 'funded' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creatorName: string;
  images: string[];
  tags: string[];
  riskLevel: 'low' | 'medium' | 'high';
  expectedROI: number;
  milestones: Milestone[];
  updates: ProjectUpdate[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  amount: number;
}

interface ProjectUpdate {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  images?: string[];
}

interface ProjectStore {
  projects: Project[];
  userProjects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: (filters?: any) => Promise<void>;
  fetchUserProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (projectData: Partial<Project>) => Promise<void>;
  updateProject: (id: string, projectData: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  investInProject: (projectId: string, amount: number) => Promise<void>;
  addProjectUpdate: (projectId: string, update: Omit<ProjectUpdate, 'id' | 'createdAt'>) => Promise<void>;
  clearError: () => void;
  clearCurrentProject: () => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      userProjects: [],
      currentProject: null,
      isLoading: false,
      error: null,

      fetchProjects: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
          const queryParams = new URLSearchParams(filters).toString();
          const endpoint = queryParams ? `/projects?${queryParams}` : '/projects';
          const response = await apiService.get(endpoint);
          
          let projects = [];
          if (response?.error) {
            console.warn('Error fetching projects:', response.errorMessage);
            projects = [];
          } else if (Array.isArray(response)) {
            projects = response;
          } else if (response?.data && Array.isArray(response.data)) {
            projects = response.data;
          } else {
            projects = [];
          }
          
          set({ 
            projects,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            projects: [],
            isLoading: false,
            error: 'Failed to fetch projects'
          });
        }
      },

      fetchUserProjects: async () => {
        set({ isLoading: true, error: null });
        try {
          const user = JSON.parse(localStorage.getItem('divasity_user') || '{}');
          
          if (!user.id) {
            throw new Error('User not found');
          }
          
          const response = await apiService.get(`/projects/${user.id}`);
          
          let projects = [];
          if (response.error) {
            console.warn('Error fetching user projects:', response.errorMessage);
            projects = [];
          } else if (Array.isArray(response)) {
            projects = response;
          } else if (response.data && Array.isArray(response.data)) {
            projects = response.data;
          }
          
          set({ 
            userProjects: projects,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            userProjects: [],
            isLoading: false,
            error: null
          });
        }
      },

      fetchProject: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          // First try to get all projects and find the one we need
          const response = await apiService.get('/projects');
          
          let projects = [];
          if (response?.error) {
            console.warn('Error fetching projects:', response.errorMessage);
            projects = [];
          } else if (Array.isArray(response)) {
            projects = response;
          } else if (response?.data && Array.isArray(response.data)) {
            projects = response.data;
          }
          
          // Find the project by ID
          const project = projects.find(p => p.id === id || p._id === id);
          
          if (project) {
            // Try to get creator name from users API
            let creatorName = 'Project Creator';
            try {
              const userResponse = await apiService.getUserById(project.userId);
              if (userResponse && !userResponse.error) {
                const userData = userResponse.data || userResponse;
                creatorName = userData.firstName && userData.lastName 
                  ? `${userData.firstName} ${userData.lastName}`
                  : userData.firstName || userData.lastName || userData.userName || 'Project Creator';
              }
            } catch (error) {
              console.log('Could not fetch creator name');
            }
            
            // Normalize the project data to match the expected structure
            const normalizedProject = {
              id: project.id || project._id,
              name: project.name || project.title,
              title: project.name || project.title,
              description: project.description,
              shortDescription: project.description,
              category: project.category,
              totalMoneyInvested: project.totalMoneyInvested || '0',
              expectedRaiseAmount: project.expectedRaiseAmount || '0',
              goalAmount: parseFloat(project.expectedRaiseAmount || '0'),
              currentAmount: parseFloat(project.totalMoneyInvested || '0'),
              status: project.status,
              userId: project.userId,
              createdAt: project.createdAt,
              updatedAt: project.updatedAt,
              startDate: project.startDate,
              endDate: project.endDate,
              backers: 0,
              daysLeft: Math.max(0, Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
              creatorId: project.userId,
              creatorName: creatorName,
              images: [],
              tags: [],
              riskLevel: 'medium' as const,
              expectedROI: 0,
              milestones: [],
              updates: []
            };
            
            set({ 
              currentProject: normalizedProject,
              isLoading: false 
            });
          } else {
            set({ 
              currentProject: null,
              isLoading: false,
              error: 'Project not found'
            });
          }
        } catch (error: any) {
          set({ 
            currentProject: null,
            isLoading: false,
            error: 'Project not found'
          });
        }
      },

      createProject: async (projectData: any) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.post('/projects', projectData);
          
          if (response.error) {
            throw new Error(response.errorMessage || 'Failed to create project');
          }
          
          const { projects, userProjects } = get();
          const newProject = response.data;
          
          set({ 
            projects: [newProject, ...projects],
            userProjects: [newProject, ...userProjects],
            isLoading: false 
          });
          
          // Refresh user projects to ensure data consistency
          get().fetchUserProjects();
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to create project';
          
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          throw new Error(errorMessage);
        }
      },

      updateProject: async (id: string, projectData: Partial<Project>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.put(`/projects/${id}`, projectData);
          
          if (response?.error) {
            throw new Error(response.errorMessage || 'Failed to update project');
          }
          
          const { projects, userProjects } = get();
          const updatedProject = response?.data || response;
          
          const updatedProjects = projects.map(p => 
            p.id === id ? updatedProject : p
          );
          const updatedUserProjects = userProjects.map(p => 
            p.id === id ? updatedProject : p
          );
          
          set({ 
            projects: updatedProjects,
            userProjects: updatedUserProjects,
            currentProject: updatedProject,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to update project',
            isLoading: false 
          });
          throw error;
        }
      },

      deleteProject: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.delete(`/projects/${id}`);
          
          if (response?.error) {
            throw new Error(response.errorMessage || 'Failed to delete project');
          }
          
          const { projects, userProjects } = get();
          const updatedProjects = projects.filter(p => p.id !== id);
          const updatedUserProjects = userProjects.filter(p => p.id !== id);
          
          set({ 
            projects: updatedProjects,
            userProjects: updatedUserProjects,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to delete project',
            isLoading: false 
          });
          throw error;
        }
      },

      investInProject: async (projectId: string, amount: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.post(`/projects/${projectId}/invest`, { amount });
          
          if (response?.error) {
            throw new Error(response.errorMessage || 'Failed to invest in project');
          }
          
          const { projects } = get();
          const updatedProjects = projects.map(p => 
            p.id === projectId 
              ? { 
                  ...p, 
                  currentAmount: p.currentAmount + amount,
                  backers: p.backers + 1
                }
              : p
          );
          
          set({ 
            projects: updatedProjects,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to invest in project',
            isLoading: false 
          });
          throw error;
        }
      },

      addProjectUpdate: async (projectId: string, update: Omit<ProjectUpdate, 'id' | 'createdAt'>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.post(`/projects/${projectId}/updates`, update);
          
          if (response?.error) {
            throw new Error(response.errorMessage || 'Failed to add project update');
          }
          
          const { projects, userProjects, currentProject } = get();
          const newUpdate = response?.data?.update || response;
          
          const updateProjectUpdates = (project: Project) => 
            project.id === projectId 
              ? { ...project, updates: [newUpdate, ...project.updates] }
              : project;
          
          set({ 
            projects: projects.map(updateProjectUpdates),
            userProjects: userProjects.map(updateProjectUpdates),
            currentProject: currentProject?.id === projectId 
              ? { ...currentProject, updates: [newUpdate, ...currentProject.updates] }
              : currentProject,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to add project update',
            isLoading: false 
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
      clearCurrentProject: () => set({ currentProject: null })
    }),
    {
      name: 'project-store',
      partialize: (state) => ({
        projects: state.projects,
        userProjects: state.userProjects
      })
    }
  )
);
