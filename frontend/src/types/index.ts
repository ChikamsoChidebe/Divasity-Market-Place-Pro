// API Response Types
export interface ApiResponse<T = any> {
  error: boolean;
  message: string;
  data?: T;
  errorMessage?: string;
}

// User Types
export interface User {
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

export interface UserRegistration {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  address: string;
  userName: string;
  telephone: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

// Project Types
export interface Project {
  id: string;
  userId: string;
  name: string;
  category: string;
  expectedRaiseAmount: string;
  totalMoneyInvested: string;
  description: string;
  status: 'OPEN' | 'CLOSED' | 'FUNDED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  createdAt?: string;
  updatedAt?: string;
  user?: User;
  investments?: Investment[];
  fundingProgress?: number;
}

export interface ProjectForm {
  name: string;
  category: string;
  expectedRaiseAmount: string;
  description: string;
  startDate: string;
  endDate: string;
}

// Investment Types
export interface Investment {
  id: string;
  userId: string;
  projectId: string;
  amount: string;
  returnAmount: string;
  successRate: number;
  createdAt?: string;
  project?: Project;
  user?: User;
}

export interface InvestmentForm {
  projectId: string;
  amount: string;
}

export interface InvestmentStats {
  totalInvestments: number;
  totalInvestedAmount: number;
  totalReturnAmount: number;
  averageSuccessRate: number;
}

// News Types
export interface News {
  Newsid: string;
  UserId: string;
  Newstitle: string;
  Newscontent: string;
  Newsimage: string;
  links: string;
  categories: string[];
  createdAt?: string;
}

export interface NewsForm {
  Newstitle: string;
  Newscontent: string;
  Newsimage?: string;
  links?: string;
  categories: string[];
}

// Dashboard Stats
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalFunding: number;
  totalInvestors: number;
  recentProjects: Project[];
}

export interface InvestorDashboardStats {
  portfolioValue: number;
  activeInvestments: number;
  totalReturns: number;
  roi: number;
  recentInvestments: Investment[];
}
