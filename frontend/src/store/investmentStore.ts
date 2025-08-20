import { create } from 'zustand';
import { apiService } from '../services/api';

interface Investment {
  id: string;
  projectId: string;
  projectName: string;
  amount: number;
  returnAmount: number;
  successRate: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface InvestmentStats {
  totalInvestments: number;
  totalInvestedAmount: number;
  totalReturnAmount: number;
  averageSuccessRate: number;
}

interface Portfolio {
  totalInvested: number;
  currentValue: number;
  totalROI: number;
}

interface InvestmentStore {
  investments: Investment[];
  portfolio: Portfolio;
  stats: InvestmentStats;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchInvestments: () => Promise<void>;
  fetchPortfolio: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createInvestment: (projectId: string, amount: number) => Promise<boolean>;
  clearError: () => void;
  clearAll: () => void;
}

export const useInvestmentStore = create<InvestmentStore>((set, get) => ({
  investments: [],
  portfolio: {
    totalInvested: 0,
    currentValue: 0,
    totalROI: 0
  },
  stats: {
    totalInvestments: 0,
    totalInvestedAmount: 0,
    totalReturnAmount: 0,
    averageSuccessRate: 0
  },
  isLoading: false,
  error: null,

  fetchInvestments: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiService.get('/investments/my-investments');
      
      if (response.error) {
        set({ error: response.errorMessage || 'Failed to fetch investments' });
        return;
      }
      
      set({ investments: response.data || [] });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch investments' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPortfolio: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiService.get('/investments/stats');
      
      if (response.error) {
        set({ error: response.errorMessage || 'Failed to fetch portfolio' });
        return;
      }
      
      const stats = response.data || {
        totalInvestments: 0,
        totalInvestedAmount: 0,
        totalReturnAmount: 0,
        averageSuccessRate: 0
      };
      
      // Calculate portfolio values
      const portfolio = {
        totalInvested: stats.totalInvestedAmount,
        currentValue: stats.totalReturnAmount,
        totalROI: stats.totalInvestedAmount > 0 
          ? ((stats.totalReturnAmount - stats.totalInvestedAmount) / stats.totalInvestedAmount * 100)
          : 0
      };
      
      set({ portfolio });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch portfolio' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiService.get('/investments/stats');
      
      if (response.error) {
        // For new users with no investments, set zero stats
        set({ 
          stats: {
            totalInvestments: 0,
            totalInvestedAmount: 0,
            totalReturnAmount: 0,
            averageSuccessRate: 0
          },
          error: null 
        });
        return;
      }
      
      set({ stats: response.data || {
        totalInvestments: 0,
        totalInvestedAmount: 0,
        totalReturnAmount: 0,
        averageSuccessRate: 0
      }});
    } catch (error: any) {
      // For new users with no investments, set zero stats
      set({ 
        stats: {
          totalInvestments: 0,
          totalInvestedAmount: 0,
          totalReturnAmount: 0,
          averageSuccessRate: 0
        },
        error: null 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createInvestment: async (projectId: string, amount: number) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiService.post('/investments', {
        projectId,
        amount
      });
      
      if (response.error) {
        set({ error: response.errorMessage || 'Failed to create investment' });
        return false;
      }
      
      // Refresh investments after creating new one
      await get().fetchInvestments();
      await get().fetchPortfolio();
      await get().fetchStats();
      
      return true;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create investment' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
  
  // Clear all data (for logout or reset)
  clearAll: () => set({
    investments: [],
    portfolio: {
      totalInvested: 0,
      currentValue: 0,
      totalROI: 0
    },
    stats: {
      totalInvestments: 0,
      totalInvestedAmount: 0,
      totalReturnAmount: 0,
      averageSuccessRate: 0
    },
    error: null
  })
}));
