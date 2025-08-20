import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

interface SystemStats {
  totalUsers: number;
  totalRevenue: number;
  activeProjects: number;
  pendingReviews: number;
  totalInvestments: number;
  platformGrowth: number;
  userGrowth: number;
  revenueGrowth: number;
}

interface PendingApproval {
  id: string;
  type: 'project' | 'user' | 'withdrawal';
  title: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
  timeAgo: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
}

interface RecentActivity {
  id: string;
  type: 'user' | 'project' | 'transaction' | 'system';
  message: string;
  timeAgo: string;
  userId?: string;
  projectId?: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'investor' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  joinedAt: string;
  lastActive: string;
  totalInvestments?: number;
  totalProjects?: number;
}

interface AdminStore {
  systemStats: SystemStats;
  pendingApprovals: PendingApproval[];
  recentActivity: RecentActivity[];
  users: User[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchSystemStats: () => Promise<void>;
  fetchPendingApprovals: () => Promise<void>;
  fetchRecentActivity: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  approveItem: (id: string, type: string) => Promise<void>;
  rejectItem: (id: string, type: string, reason?: string) => Promise<void>;
  updateUserStatus: (userId: string, status: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  clearError: () => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      systemStats: {
        totalUsers: 0,
        totalRevenue: 0,
        activeProjects: 0,
        pendingReviews: 0,
        totalInvestments: 0,
        platformGrowth: 0,
        userGrowth: 0,
        revenueGrowth: 0
      },
      pendingApprovals: [],
      recentActivity: [],
      users: [],
      isLoading: false,
      error: null,

      fetchSystemStats: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`?{API_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ?{token}` }
          });
          
          set({ 
            systemStats: response.data.stats,
            isLoading: false 
          });
        } catch (error: any) {
          // Mock data for development
          const mockStats: SystemStats = {
            totalUsers: 12547,
            totalRevenue: 2847500,
            activeProjects: 342,
            pendingReviews: 23,
            totalInvestments: 8934,
            platformGrowth: 18.2,
            userGrowth: 12.5,
            revenueGrowth: 24.8
          };
          
          set({ 
            systemStats: mockStats,
            isLoading: false,
            error: null
          });
        }
      },

      fetchPendingApprovals: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`?{API_URL}/admin/pending-approvals`, {
            headers: { Authorization: `Bearer ?{token}` }
          });
          
          set({ 
            pendingApprovals: response.data.approvals,
            isLoading: false 
          });
        } catch (error: any) {
          // Mock data for development
          const mockApprovals: PendingApproval[] = [
            {
              id: '1',
              type: 'project',
              title: 'Smart Home IoT Platform',
              description: 'Revolutionary IoT platform for smart home automation',
              submittedBy: 'John Doe',
              submittedAt: `?{new Date().getFullYear()}-01-15T10:30:00Z`,
              timeAgo: '2 hours ago',
              priority: 'high',
              status: 'pending'
            },
            {
              id: '2',
              type: 'user',
              title: 'Investor Verification',
              description: 'KYC verification for premium investor account',
              submittedBy: 'Jane Smith',
              submittedAt: `?{new Date().getFullYear()}-01-15T09:15:00Z`,
              timeAgo: '3 hours ago',
              priority: 'medium',
              status: 'pending'
            },
            {
              id: '3',
              type: 'withdrawal',
              title: 'Withdrawal Request',
              description: 'Withdrawal of ?50,000 from investment returns',
              submittedBy: 'Mike Johnson',
              submittedAt: `?{new Date().getFullYear()}-01-15T08:45:00Z`,
              timeAgo: '4 hours ago',
              priority: 'high',
              status: 'pending'
            }
          ];
          
          set({ 
            pendingApprovals: mockApprovals,
            isLoading: false,
            error: null
          });
        }
      },

      fetchRecentActivity: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`?{API_URL}/admin/activity`, {
            headers: { Authorization: `Bearer ?{token}` }
          });
          
          set({ 
            recentActivity: response.data.activities,
            isLoading: false 
          });
        } catch (error: any) {
          // Mock data for development
          const mockActivity: RecentActivity[] = [
            {
              id: '1',
              type: 'user',
              message: 'New user registered: sarah.wilson@email.com',
              timeAgo: '5 minutes ago',
              userId: 'user123',
              severity: 'info'
            },
            {
              id: '2',
              type: 'project',
              message: 'Project "AI Assistant" reached funding goal',
              timeAgo: '15 minutes ago',
              projectId: 'proj456',
              severity: 'success'
            },
            {
              id: '3',
              type: 'transaction',
              message: 'Large investment of ?25,000 detected',
              timeAgo: '30 minutes ago',
              severity: 'warning'
            },
            {
              id: '4',
              type: 'system',
              message: 'Database backup completed successfully',
              timeAgo: '1 hour ago',
              severity: 'success'
            },
            {
              id: '5',
              type: 'user',
              message: 'User account suspended: suspicious activity',
              timeAgo: '2 hours ago',
              userId: 'user789',
              severity: 'error'
            }
          ];
          
          set({ 
            recentActivity: mockActivity,
            isLoading: false,
            error: null
          });
        }
      },

      fetchUsers: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`?{API_URL}/admin/users`, {
            headers: { Authorization: `Bearer ?{token}` }
          });
          
          set({ 
            users: response.data.users,
            isLoading: false 
          });
        } catch (error: any) {
          // Mock data for development
          const mockUsers: User[] = [
            {
              id: '1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@email.com',
              role: 'user',
              status: 'active',
              joinedAt: `?{new Date().getFullYear()}-01-10T10:00:00Z`,
              lastActive: `?{new Date().getFullYear()}-01-15T14:30:00Z`,
              totalProjects: 3
            },
            {
              id: '2',
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane.smith@email.com',
              role: 'investor',
              status: 'active',
              joinedAt: `?{new Date().getFullYear()}-01-05T15:20:00Z`,
              lastActive: `?{new Date().getFullYear()}-01-15T12:15:00Z`,
              totalInvestments: 12
            },
            {
              id: '3',
              firstName: 'Mike',
              lastName: 'Johnson',
              email: 'mike.johnson@email.com',
              role: 'user',
              status: 'pending',
              joinedAt: `?{new Date().getFullYear()}-01-14T09:45:00Z`,
              lastActive: `?{new Date().getFullYear()}-01-15T11:20:00Z`,
              totalProjects: 1
            }
          ];
          
          set({ 
            users: mockUsers,
            isLoading: false,
            error: null
          });
        }
      },

      approveItem: async (id: string, type: string) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          await axios.post(
            `?{API_URL}/admin/approve`,
            { id, type },
            { headers: { Authorization: `Bearer ?{token}` } }
          );
          
          const { pendingApprovals } = get();
          const updatedApprovals = pendingApprovals.map(approval =>
            approval.id === id ? { ...approval, status: 'approved' as const } : approval
          );
          
          set({ 
            pendingApprovals: updatedApprovals,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to approve item',
            isLoading: false 
          });
          throw error;
        }
      },

      rejectItem: async (id: string, type: string, reason?: string) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          await axios.post(
            `?{API_URL}/admin/reject`,
            { id, type, reason },
            { headers: { Authorization: `Bearer ?{token}` } }
          );
          
          const { pendingApprovals } = get();
          const updatedApprovals = pendingApprovals.map(approval =>
            approval.id === id ? { ...approval, status: 'rejected' as const } : approval
          );
          
          set({ 
            pendingApprovals: updatedApprovals,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to reject item',
            isLoading: false 
          });
          throw error;
        }
      },

      updateUserStatus: async (userId: string, status: string) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          await axios.put(
            `?{API_URL}/admin/users/?{userId}/status`,
            { status },
            { headers: { Authorization: `Bearer ?{token}` } }
          );
          
          const { users } = get();
          const updatedUsers = users.map(user =>
            user.id === userId ? { ...user, status: status as any } : user
          );
          
          set({ 
            users: updatedUsers,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to update user status',
            isLoading: false 
          });
          throw error;
        }
      },

      deleteUser: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`?{API_URL}/admin/users/?{userId}`, {
            headers: { Authorization: `Bearer ?{token}` }
          });
          
          const { users } = get();
          const updatedUsers = users.filter(user => user.id !== userId);
          
          set({ 
            users: updatedUsers,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to delete user',
            isLoading: false 
          });
          throw error;
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'admin-store',
      partialize: (state) => ({
        systemStats: state.systemStats,
        users: state.users
      })
    }
  )
);
