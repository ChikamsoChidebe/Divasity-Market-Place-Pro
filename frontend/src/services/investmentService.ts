import { apiService } from './api';
import { Investment, InvestmentForm, InvestmentStats, ApiResponse } from '../types';
import { ToastService } from './toastService';

export class InvestmentService {
  // Create new investment
  static async createInvestment(investmentData: InvestmentForm): Promise<ApiResponse<Investment>> {
    try {
      const response = await apiService.post('/investments', investmentData);
      if (!response.error) {
        ToastService.success('Investment created successfully!');
      } else {
        ToastService.error(response.errorMessage || response.message || 'Failed to create investment');
      }
      return response;
    } catch (error: any) {
      ToastService.error('Failed to create investment. Please try again.');
      throw error;
    }
  }

  // Get user's investments
  static async getMyInvestments(): Promise<ApiResponse<Investment[]>> {
    return apiService.get('/investments/my-investments');
  }

  // Get investment statistics
  static async getInvestmentStats(): Promise<ApiResponse<InvestmentStats>> {
    return apiService.get('/investments/stats');
  }

  // Update investment outcome (admin only)
  static async updateInvestmentOutcome(
    investmentId: string, 
    data: { returnAmount: string; successRate: number }
  ): Promise<ApiResponse<Investment>> {
    return apiService.put(`/investments/?{investmentId}/outcome`, {
      investmentId,
      ...data
    });
  }

  // Get detailed investment analytics
  static async getInvestmentAnalytics(): Promise<ApiResponse<{
    totalInvestments: number;
    totalInvestedAmount: number;
    totalReturnAmount: number;
    averageSuccessRate: number;
    portfolioValue: number;
    monthlyReturns: Array<{
      month: string;
      invested: number;
      returns: number;
      netGain: number;
    }>;
    categoryDistribution: Array<{
      category: string;
      amount: number;
      percentage: number;
      roi: number;
    }>;
    riskProfile: 'LOW' | 'MEDIUM' | 'HIGH';
    topPerformingInvestments: Investment[];
    recentInvestments: Investment[];
  }>> {
    const [investmentsResponse, statsResponse] = await Promise.all([
      this.getMyInvestments(),
      this.getInvestmentStats()
    ]);

    if (investmentsResponse.error || !investmentsResponse.data) {
      return investmentsResponse as any;
    }

    if (statsResponse.error || !statsResponse.data) {
      return statsResponse as any;
    }

    const investments = investmentsResponse.data;
    const stats = statsResponse.data;

    // Calculate portfolio value
    const portfolioValue = investments.reduce((sum, inv) => 
      sum + parseFloat(inv.returnAmount || inv.amount), 0
    );

    // Calculate monthly returns (mock data for now)
    const monthlyReturns = this.generateMonthlyReturns(investments);

    // Calculate category distribution
    const categoryMap = new Map<string, { amount: number; returns: number }>();
    investments.forEach(investment => {
      if (investment.project) {
        const category = investment.project.category;
        const amount = parseFloat(investment.amount);
        const returns = parseFloat(investment.returnAmount || investment.amount);
        
        if (categoryMap.has(category)) {
          const existing = categoryMap.get(category)!;
          categoryMap.set(category, {
            amount: existing.amount + amount,
            returns: existing.returns + returns
          });
        } else {
          categoryMap.set(category, { amount, returns });
        }
      }
    });

    const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    const categoryDistribution = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: totalInvested > 0 ? (data.amount / totalInvested) * 100 : 0,
      roi: data.amount > 0 ? ((data.returns - data.amount) / data.amount) * 100 : 0
    }));

    // Determine risk profile
    const avgSuccessRate = stats.averageSuccessRate;
    let riskProfile: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
    if (avgSuccessRate >= 80) riskProfile = 'LOW';
    else if (avgSuccessRate <= 60) riskProfile = 'HIGH';

    // Get top performing investments
    const topPerformingInvestments = investments
      .filter(inv => inv.returnAmount)
      .sort((a, b) => {
        const roiA = ((parseFloat(a.returnAmount!) - parseFloat(a.amount)) / parseFloat(a.amount)) * 100;
        const roiB = ((parseFloat(b.returnAmount!) - parseFloat(b.amount)) / parseFloat(b.amount)) * 100;
        return roiB - roiA;
      })
      .slice(0, 5);

    // Get recent investments
    const recentInvestments = investments
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 5);

    return {
      error: false,
      message: 'Investment analytics retrieved successfully',
      data: {
        totalInvestments: stats.totalInvestments,
        totalInvestedAmount: stats.totalInvestedAmount,
        totalReturnAmount: stats.totalReturnAmount,
        averageSuccessRate: stats.averageSuccessRate,
        portfolioValue,
        monthlyReturns,
        categoryDistribution,
        riskProfile,
        topPerformingInvestments,
        recentInvestments
      }
    };
  }

  // Generate monthly returns data
  private static generateMonthlyReturns(investments: Investment[]): Array<{
    month: string;
    invested: number;
    returns: number;
    netGain: number;
  }> {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const currentDate = new Date();
    const monthlyData: Array<{
      month: string;
      invested: number;
      returns: number;
      netGain: number;
    }> = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = months[date.getMonth()];
      
      // Filter investments for this month
      const monthInvestments = investments.filter(inv => {
        const invDate = new Date(inv.createdAt || '');
        return invDate.getMonth() === date.getMonth() && 
               invDate.getFullYear() === date.getFullYear();
      });

      const invested = monthInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
      const returns = monthInvestments.reduce((sum, inv) => sum + parseFloat(inv.returnAmount || inv.amount), 0);
      const netGain = returns - invested;

      monthlyData.push({
        month: monthName,
        invested,
        returns,
        netGain
      });
    }

    return monthlyData;
  }

  // Calculate ROI for an investment
  static calculateROI(investment: Investment): number {
    const invested = parseFloat(investment.amount);
    const returned = parseFloat(investment.returnAmount || investment.amount);
    return invested > 0 ? ((returned - invested) / invested) * 100 : 0;
  }

  // Get investment recommendations
  static async getInvestmentRecommendations(): Promise<ApiResponse<{
    recommended: any[];
    trending: any[];
    lowRisk: any[];
    highReturn: any[];
  }>> {
    // This would typically call a recommendation API
    // For now, we'll return mock data structure
    return {
      error: false,
      message: 'Investment recommendations retrieved successfully',
      data: {
        recommended: [],
        trending: [],
        lowRisk: [],
        highReturn: []
      }
    };
  }

  // Get investment performance over time
  static async getInvestmentPerformance(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<ApiResponse<{
    performance: Array<{
      date: string;
      value: number;
      returns: number;
    }>;
    totalReturn: number;
    annualizedReturn: number;
    volatility: number;
  }>> {
    const investmentsResponse = await this.getMyInvestments();
    
    if (investmentsResponse.error || !investmentsResponse.data) {
      return investmentsResponse as any;
    }

    const investments = investmentsResponse.data;
    const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    const totalReturned = investments.reduce((sum, inv) => sum + parseFloat(inv.returnAmount || inv.amount), 0);
    const totalReturn = totalReturned - totalInvested;
    const annualizedReturn = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    // Generate performance data (mock for now)
    const performance = this.generatePerformanceData(period, totalInvested, totalReturned);

    return {
      error: false,
      message: 'Investment performance retrieved successfully',
      data: {
        performance,
        totalReturn,
        annualizedReturn,
        volatility: 15.5 // Mock volatility
      }
    };
  }

  // Generate performance data
  private static generatePerformanceData(
    period: string, 
    totalInvested: number, 
    totalReturned: number
  ): Array<{ date: string; value: number; returns: number }> {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const data: Array<{ date: string; value: number; returns: number }> = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate gradual growth
      const progress = (days - i) / days;
      const value = totalInvested + (totalReturned - totalInvested) * progress;
      const returns = value - totalInvested;
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value * 100) / 100,
        returns: Math.round(returns * 100) / 100
      });
    }
    
    return data;
  }
}

export default InvestmentService;
