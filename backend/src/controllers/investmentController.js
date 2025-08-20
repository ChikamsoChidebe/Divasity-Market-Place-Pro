import { db } from '../utils/database.js';
import { emailService } from '../utils/emailService.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Create new investment
export const createInvestment = asyncHandler(async (req, res) => {
  const { projectId, amount } = req.body;
  const userId = req.user.id;

  // Check if project exists and is open for investment
  const project = db.findById('projects', projectId);
  if (!project) {
    return res.status(404).json({
      error: true,
      message: 'Project not found',
      errorMessage: 'The specified project does not exist',
    });
  }

  if (project.status !== 'OPEN') {
    return res.status(400).json({
      error: true,
      message: 'Investment not allowed',
      errorMessage: 'This project is not open for investments',
    });
  }

  // Check if user is trying to invest in their own project
  if (project.userId === userId) {
    return res.status(400).json({
      error: true,
      message: 'Invalid investment',
      errorMessage: 'You cannot invest in your own project',
    });
  }

  // Check if project end date has passed
  if (new Date() > new Date(project.endDate)) {
    return res.status(400).json({
      error: true,
      message: 'Investment period ended',
      errorMessage: 'This project is no longer accepting investments',
    });
  }

  // Calculate current total investment
  const existingInvestments = db.findInvestmentsByProjectId(projectId);
  const currentTotal = existingInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
  const newTotal = currentTotal + parseFloat(amount);

  // Check if investment would exceed the target
  if (newTotal > parseFloat(project.expectedRaiseAmount)) {
    const remainingAmount = parseFloat(project.expectedRaiseAmount) - currentTotal;
    return res.status(400).json({
      error: true,
      message: 'Investment amount too high',
      errorMessage: `Only $${remainingAmount.toFixed(2)} remaining for this project`,
    });
  }

  // Calculate return amount and success rate
  const baseSuccessRate = parseInt(process.env.DEFAULT_SUCCESS_RATE) || 75;
  const successRate = Math.max(50, Math.min(95, baseSuccessRate + Math.random() * 20 - 10));
  const returnMultiplier = 1.2 + (Math.random() * 0.3); // 1.2x to 1.5x return
  const returnAmount = (parseFloat(amount) * returnMultiplier).toFixed(2);

  const investmentData = {
    userId,
    projectId,
    amount,
    returnAmount,
    successRate: Math.round(successRate),
  };

  const investment = db.create('investments', investmentData);

  // Update project total investment
  const updatedTotal = (currentTotal + parseFloat(amount)).toString();
  db.update('projects', projectId, { totalMoneyInvested: updatedTotal });

  // Check if project is fully funded
  if (newTotal >= parseFloat(project.expectedRaiseAmount)) {
    db.update('projects', projectId, { status: 'FUNDED' });
  }

  // Send investment confirmation email
  const user = db.findById('users', userId);
  if (user) {
    await emailService.sendInvestmentConfirmationEmail(user.email, {
      projectName: project.name,
      amount,
      returnAmount,
      successRate: Math.round(successRate),
    });
  }

  logger.info(`Investment created`, {
    investmentId: investment.id,
    userId,
    projectId,
    amount,
    returnAmount,
    successRate: Math.round(successRate),
  });

  res.status(201).json(investment);
});

// Get user's investments
export const getUserInvestments = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status, page = 1, limit = 20 } = req.query;

  let investments = db.findInvestmentsByUserId(userId);

  // Apply filters
  if (status) {
    investments = investments.filter(investment => {
      const project = db.findById('projects', investment.projectId);
      return project && project.status === status;
    });
  }

  // Sort by creation date (newest first)
  investments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedInvestments = investments.slice(startIndex, endIndex);

  // Enrich investments with project data
  const enrichedInvestments = paginatedInvestments.map(investment => {
    const project = db.findById('projects', investment.projectId);
    return {
      ...investment,
      project: project ? {
        id: project.id,
        name: project.name,
        category: project.category,
        status: project.status,
        expectedRaiseAmount: project.expectedRaiseAmount,
        totalMoneyInvested: project.totalMoneyInvested,
        startDate: project.startDate,
        endDate: project.endDate,
      } : null,
    };
  });

  res.status(200).json(enrichedInvestments);
});

// Get investment statistics for user
export const getUserInvestmentStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const stats = db.getUserInvestmentStats(userId);

  // Get recent investments
  const recentInvestments = db.findInvestmentsByUserId(userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(investment => {
      const project = db.findById('projects', investment.projectId);
      return {
        ...investment,
        project: project ? {
          id: project.id,
          name: project.name,
          category: project.category,
          status: project.status,
        } : null,
      };
    });

  const response = {
    ...stats,
    recentInvestments,
    roi: stats.totalInvestedAmount > 0 
      ? ((stats.totalReturnAmount - stats.totalInvestedAmount) / stats.totalInvestedAmount * 100).toFixed(2)
      : 0,
  };

  res.status(200).json(response);
});

// Update investment outcome (admin only)
export const updateInvestmentOutcome = asyncHandler(async (req, res) => {
  const { investmentId } = req.params;
  const { returnAmount, successRate } = req.body;

  const investment = db.findById('investments', investmentId);
  if (!investment) {
    return res.status(404).json({
      error: true,
      message: 'Investment not found',
      errorMessage: 'The specified investment does not exist',
    });
  }

  const updateData = {};
  if (returnAmount !== undefined) updateData.returnAmount = returnAmount;
  if (successRate !== undefined) updateData.successRate = successRate;

  const updatedInvestment = db.update('investments', investmentId, updateData);

  logger.info(`Investment outcome updated`, {
    investmentId,
    adminId: req.user.id,
    changes: updateData,
  });

  res.status(200).json(updatedInvestment);
});

// Get all investments (admin only)
export const getAllInvestments = asyncHandler(async (req, res) => {
  const { projectId, userId, page = 1, limit = 50 } = req.query;

  let investments = db.findMany('investments');

  // Apply filters
  if (projectId) {
    investments = investments.filter(inv => inv.projectId === projectId);
  }

  if (userId) {
    investments = investments.filter(inv => inv.userId === userId);
  }

  // Sort by creation date (newest first)
  investments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedInvestments = investments.slice(startIndex, endIndex);

  // Enrich investments with user and project data
  const enrichedInvestments = paginatedInvestments.map(investment => {
    const user = db.findById('users', investment.userId);
    const project = db.findById('projects', investment.projectId);
    
    return {
      ...investment,
      user: user ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email,
      } : null,
      project: project ? {
        id: project.id,
        name: project.name,
        category: project.category,
        status: project.status,
      } : null,
    };
  });

  res.status(200).json({
    error: false,
    message: 'Investments retrieved successfully',
    data: enrichedInvestments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: investments.length,
      pages: Math.ceil(investments.length / parseInt(limit)),
    },
  });
});

// Get investment by ID
export const getInvestmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const investment = db.findById('investments', id);
  if (!investment) {
    return res.status(404).json({
      error: true,
      message: 'Investment not found',
      errorMessage: 'The specified investment does not exist',
    });
  }

  // Check if user can access this investment
  const isOwner = investment.userId === req.user.id;
  const isAdmin = req.user.role === 'admin';
  
  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      error: true,
      message: 'Access denied',
      errorMessage: 'You can only view your own investments',
    });
  }

  // Enrich investment with user and project data
  const user = db.findById('users', investment.userId);
  const project = db.findById('projects', investment.projectId);

  const enrichedInvestment = {
    ...investment,
    user: user ? {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      email: user.email,
    } : null,
    project: project ? {
      id: project.id,
      name: project.name,
      category: project.category,
      status: project.status,
      expectedRaiseAmount: project.expectedRaiseAmount,
      totalMoneyInvested: project.totalMoneyInvested,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
    } : null,
  };

  res.status(200).json({
    error: false,
    message: 'Investment retrieved successfully',
    data: enrichedInvestment,
  });
});

// Get investment analytics (admin only)
export const getInvestmentAnalytics = asyncHandler(async (req, res) => {
  const investments = db.findMany('investments');
  const projects = db.findMany('projects');

  const analytics = {
    totalInvestments: investments.length,
    totalInvestedAmount: investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
    totalReturnAmount: investments.reduce((sum, inv) => sum + parseFloat(inv.returnAmount || 0), 0),
    averageInvestmentAmount: investments.length > 0 
      ? investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0) / investments.length 
      : 0,
    averageSuccessRate: investments.length > 0 
      ? investments.reduce((sum, inv) => sum + inv.successRate, 0) / investments.length 
      : 0,
    uniqueInvestors: new Set(investments.map(inv => inv.userId)).size,
    investmentsByCategory: {},
    monthlyInvestments: {},
  };

  // Calculate investments by category
  investments.forEach(investment => {
    const project = db.findById('projects', investment.projectId);
    if (project) {
      const category = project.category;
      analytics.investmentsByCategory[category] = 
        (analytics.investmentsByCategory[category] || 0) + parseFloat(investment.amount);
    }
  });

  // Calculate monthly investments
  investments.forEach(investment => {
    const month = new Date(investment.createdAt).toISOString().slice(0, 7); // YYYY-MM
    analytics.monthlyInvestments[month] = 
      (analytics.monthlyInvestments[month] || 0) + parseFloat(investment.amount);
  });

  res.status(200).json({
    error: false,
    message: 'Investment analytics retrieved successfully',
    data: analytics,
  });
});