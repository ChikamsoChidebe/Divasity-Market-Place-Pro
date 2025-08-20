import type { Project } from '../types';

// Interface for raw API response project structure
export interface RawApiProject {
  id?: string;
  _id?: string;
  userId?: string;
  name?: string;
  title?: string;
  description?: string;
  category?: string;
  status?: string;
  totalMoneyInvested?: string | number;
  expectedRaiseAmount?: string | number;
  goalAmount?: number;
  currentAmount?: number;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
  investorCount?: number;
  backers?: number;
  [key: string]: any;
}

// Normalize project data from API response
export function normalizeProject(rawProject: RawApiProject): Project {
  // Handle status normalization - backend returns lowercase, we need uppercase
  let status = 'OPEN';
  if (rawProject?.status) {
    status = rawProject.status.toUpperCase();
  }
  
  return {
    id: rawProject?.id || rawProject?._id || '',
    userId: rawProject?.userId || rawProject?.creatorId || '',
    name: rawProject?.name || rawProject?.title || 'Untitled Project',
    description: rawProject?.description || 'No description available',
    category: rawProject?.category || 'Uncategorized',
    status: status as Project['status'],
    totalMoneyInvested: String(rawProject?.totalMoneyInvested || rawProject?.currentAmount || '0'),
    expectedRaiseAmount: String(rawProject?.expectedRaiseAmount || rawProject?.goalAmount || '0'),
    startDate: rawProject?.startDate || rawProject?.createdAt || '',
    endDate: rawProject?.endDate || '',
    createdAt: rawProject?.createdAt || '',
    updatedAt: rawProject?.updatedAt || ''
  };
}

// Normalize array of projects
export function normalizeProjects(rawProjects: RawApiProject[]): Project[] {
  if (!Array.isArray(rawProjects)) {
    return [];
  }
  return rawProjects.map(normalizeProject);
}

// Safe number parsing for monetary values
export function parseMonetaryValue(value: string | number | undefined): number {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^0-9.-]+/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

// Calculate funding percentage
export function calculateFundingPercentage(
  raised: string | number,
  target: string | number
): number {
  const raisedAmount = parseMonetaryValue(raised);
  const targetAmount = parseMonetaryValue(target);
  
  if (targetAmount === 0) return 0;
  return Math.min(Math.round((raisedAmount / targetAmount) * 100), 100);
}

// Get status color classes for UI
export function getStatusColorClasses(status: string): string {
  const normalizedStatus = status.toUpperCase();
  const statusColors: Record<string, string> = {
    'OPEN': 'bg-orange-100 text-orange-800',
    'ACTIVE': 'bg-orange-100 text-orange-800',
    'CLOSED': 'bg-purple-100 text-purple-800',
    'FUNDED': 'bg-purple-100 text-purple-800',
    'COMPLETED': 'bg-purple-100 text-purple-800',
    'CANCELLED': 'bg-red-100 text-red-800',
    'DRAFT': 'bg-gray-100 text-gray-800'
  };
  
  return statusColors[normalizedStatus] || 'bg-gray-100 text-gray-800';
}

// Format currency display
export function formatCurrency(amount: string | number): string {
  const numericAmount = parseMonetaryValue(amount);
  return `₦${numericAmount.toLocaleString()}`;
}

// Format large numbers with K, M suffixes
export function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Validate project data
export function validateProject(project: Partial<Project>): string[] {
  const errors: string[] = [];
  
  if (!project.name || project.name.trim().length === 0) {
    errors.push('Project name is required');
  }
  
  if (!project.description || project.description.trim().length === 0) {
    errors.push('Project description is required');
  }
  
  if (!project.category || project.category.trim().length === 0) {
    errors.push('Project category is required');
  }
  
  const targetAmount = parseMonetaryValue(project.expectedRaiseAmount);
  if (targetAmount <= 0) {
    errors.push('Target funding amount must be greater than 0');
  }
  
  return errors;
}

// Get project progress status
export function getProjectProgress(project: Project): {
  percentage: number;
  status: 'low' | 'medium' | 'high' | 'complete';
  message: string;
} {
  const percentage = calculateFundingPercentage(
    project.totalMoneyInvested,
    project.expectedRaiseAmount
  );
  
  let status: 'low' | 'medium' | 'high' | 'complete';
  let message: string;
  
  if (percentage >= 100) {
    status = 'complete';
    message = 'Funding goal reached!';
  } else if (percentage >= 75) {
    status = 'high';
    message = 'Almost there!';
  } else if (percentage >= 25) {
    status = 'medium';
    message = 'Good progress';
  } else {
    status = 'low';
    message = 'Just getting started';
  }
  
  return { percentage, status, message };
}
