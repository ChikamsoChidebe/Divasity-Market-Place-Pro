import express from 'express';
import { db } from '../utils/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sanitizeInput } from '../middleware/validation.js';

const router = express.Router();

// Apply sanitization to all routes
router.use(sanitizeInput);

// All analytics routes require authentication
router.use(authenticateToken);

// Dashboard analytics for users
router.get('/dashboard', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  if (userRole === 'admin') {
    // Admin dashboard analytics
    const projects = db.findMany('projects');
    const investments = db.findMany('investments');
    const users = db.findMany('users');
    const news = db.findMany('news');

    const analytics = {
      overview: {
        totalUsers: users.length,
        totalProjects: projects.length,
        totalInvestments: investments.length,
        totalNewsArticles: news.length,
        totalFunding: investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
      },
      projectStats: {
        openProjects: projects.filter(p => p.status === 'OPEN').length,
        fundedProjects: projects.filter(p => p.status === 'FUNDED').length,
        cancelledProjects: projects.filter(p => p.status === 'CANCELLED').length,
      },
      userStats: {
        verifiedUsers: users.filter(u => u.IsVerified).length,
        unverifiedUsers: users.filter(u => !u.IsVerified).length,
        adminUsers: users.filter(u => u.role === 'admin').length,
        regularUsers: users.filter(u => u.role === 'user').length,
      },
      recentActivity: {
        recentProjects: projects
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(project => ({
            id: project.id,
            name: project.name,
            category: project.category,
            status: project.status,
            createdAt: project.createdAt,
          })),
        recentInvestments: investments
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(investment => {
            const project = db.findById('projects', investment.projectId);
            const user = db.findById('users', investment.userId);
            return {
              id: investment.id,
              amount: investment.amount,
              projectName: project?.name || 'Unknown Project',
              investorName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
              createdAt: investment.createdAt,
            };
          }),
      },
    };

    res.json({
      error: false,
      message: 'Admin dashboard analytics retrieved successfully',
      data: analytics,
    });
  } else {
    // User dashboard analytics
    const userProjects = db.findProjectsByUserId(userId);
    const userInvestments = db.findInvestmentsByUserId(userId);

    const analytics = {
      projects: {
        total: userProjects.length,
        open: userProjects.filter(p => p.status === 'OPEN').length,
        funded: userProjects.filter(p => p.status === 'FUNDED').length,
        totalFundingReceived: userProjects.reduce((sum, project) => {
          const investments = db.findInvestmentsByProjectId(project.id);
          return sum + investments.reduce((pSum, inv) => pSum + parseFloat(inv.amount), 0);
        }, 0),
      },
      investments: {
        total: userInvestments.length,
        totalInvested: userInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
        expectedReturns: userInvestments.reduce((sum, inv) => sum + parseFloat(inv.returnAmount || 0), 0),
        averageSuccessRate: userInvestments.length > 0 
          ? userInvestments.reduce((sum, inv) => sum + inv.successRate, 0) / userInvestments.length 
          : 0,
      },
      recentActivity: {
        recentProjects: userProjects
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3),
        recentInvestments: userInvestments
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)
          .map(investment => {
            const project = db.findById('projects', investment.projectId);
            return {
              ...investment,
              project: project ? {
                id: project.id,
                name: project.name,
                category: project.category,
              } : null,
            };
          }),
      },
    };

    res.json({
      error: false,
      message: 'User dashboard analytics retrieved successfully',
      data: analytics,
    });
  }
}));

// Platform overview (admin only)
router.get('/platform-overview', requireAdmin, asyncHandler(async (req, res) => {
  const projects = db.findMany('projects');
  const investments = db.findMany('investments');
  const users = db.findMany('users');
  const news = db.findMany('news');

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const analytics = {
    totals: {
      users: users.length,
      projects: projects.length,
      investments: investments.length,
      newsArticles: news.length,
      totalFunding: investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
    },
    growth: {
      newUsersLast30Days: users.filter(u => new Date(u.createdAt) >= thirtyDaysAgo).length,
      newProjectsLast30Days: projects.filter(p => new Date(p.createdAt) >= thirtyDaysAgo).length,
      newInvestmentsLast30Days: investments.filter(i => new Date(i.createdAt) >= thirtyDaysAgo).length,
      fundingLast30Days: investments
        .filter(i => new Date(i.createdAt) >= thirtyDaysAgo)
        .reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
    },
    categories: {},
    monthlyTrends: {},
  };

  // Calculate category distribution
  projects.forEach(project => {
    analytics.categories[project.category] = 
      (analytics.categories[project.category] || 0) + 1;
  });

  // Calculate monthly trends for the last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
    
    analytics.monthlyTrends[monthKey] = {
      projects: projects.filter(p => p.createdAt.startsWith(monthKey)).length,
      investments: investments.filter(i => i.createdAt.startsWith(monthKey)).length,
      funding: investments
        .filter(i => i.createdAt.startsWith(monthKey))
        .reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
    };
  }

  res.json({
    error: false,
    message: 'Platform overview analytics retrieved successfully',
    data: analytics,
  });
}));

// Investment performance analytics (admin only)
router.get('/investment-performance', requireAdmin, asyncHandler(async (req, res) => {
  const investments = db.findMany('investments');
  const projects = db.findMany('projects');

  const analytics = {
    overview: {
      totalInvestments: investments.length,
      totalAmount: investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
      averageInvestment: investments.length > 0 
        ? investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0) / investments.length 
        : 0,
      averageSuccessRate: investments.length > 0 
        ? investments.reduce((sum, inv) => sum + inv.successRate, 0) / investments.length 
        : 0,
    },
    byCategory: {},
    topProjects: [],
    topInvestors: {},
  };

  // Calculate performance by category
  investments.forEach(investment => {
    const project = db.findById('projects', investment.projectId);
    if (project) {
      const category = project.category;
      if (!analytics.byCategory[category]) {
        analytics.byCategory[category] = {
          count: 0,
          totalAmount: 0,
          averageSuccessRate: 0,
        };
      }
      analytics.byCategory[category].count++;
      analytics.byCategory[category].totalAmount += parseFloat(investment.amount);
      analytics.byCategory[category].averageSuccessRate += investment.successRate;
    }
  });

  // Calculate average success rates
  Object.keys(analytics.byCategory).forEach(category => {
    analytics.byCategory[category].averageSuccessRate /= analytics.byCategory[category].count;
  });

  // Find top projects by funding
  const projectFunding = {};
  investments.forEach(investment => {
    projectFunding[investment.projectId] = 
      (projectFunding[investment.projectId] || 0) + parseFloat(investment.amount);
  });

  analytics.topProjects = Object.entries(projectFunding)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([projectId, funding]) => {
      const project = db.findById('projects', projectId);
      return {
        id: projectId,
        name: project?.name || 'Unknown Project',
        category: project?.category || 'Unknown',
        totalFunding: funding,
        investorCount: investments.filter(i => i.projectId === projectId).length,
      };
    });

  // Find top investors
  const investorTotals = {};
  investments.forEach(investment => {
    investorTotals[investment.userId] = 
      (investorTotals[investment.userId] || 0) + parseFloat(investment.amount);
  });

  analytics.topInvestors = Object.entries(investorTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([userId, totalInvested]) => {
      const user = db.findById('users', userId);
      return {
        id: userId,
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
        userName: user?.userName || 'unknown',
        totalInvested,
        investmentCount: investments.filter(i => i.userId === userId).length,
      };
    });

  res.json({
    error: false,
    message: 'Investment performance analytics retrieved successfully',
    data: analytics,
  });
}));

// User engagement analytics (admin only)
router.get('/user-engagement', requireAdmin, asyncHandler(async (req, res) => {
  const users = db.findMany('users');
  const projects = db.findMany('projects');
  const investments = db.findMany('investments');

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const analytics = {
    userStats: {
      total: users.length,
      verified: users.filter(u => u.IsVerified).length,
      active: users.filter(u => {
        const hasRecentProject = projects.some(p => 
          p.userId === u.id && new Date(p.createdAt) >= thirtyDaysAgo
        );
        const hasRecentInvestment = investments.some(i => 
          i.userId === u.id && new Date(i.createdAt) >= thirtyDaysAgo
        );
        return hasRecentProject || hasRecentInvestment;
      }).length,
    },
    engagement: {
      usersWithProjects: new Set(projects.map(p => p.userId)).size,
      usersWithInvestments: new Set(investments.map(i => i.userId)).size,
      averageProjectsPerUser: users.length > 0 ? projects.length / users.length : 0,
      averageInvestmentsPerUser: users.length > 0 ? investments.length / users.length : 0,
    },
    registrationTrends: {},
  };

  // Calculate registration trends for the last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
    
    analytics.registrationTrends[monthKey] = users.filter(u => 
      u.createdAt.startsWith(monthKey)
    ).length;
  }

  res.json({
    error: false,
    message: 'User engagement analytics retrieved successfully',
    data: analytics,
  });
}));

export default router;