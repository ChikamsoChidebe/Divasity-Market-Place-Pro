import { db } from '../utils/database.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get all projects
export const getAllProjects = asyncHandler(async (req, res) => {
  const { category, status, userId, page = 1, limit = 20 } = req.query;
  
  let projects = db.findMany('projects');

  // Apply filters
  if (category) {
    projects = projects.filter(project => 
      project.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  if (status) {
    projects = projects.filter(project => project.status === status);
  }

  if (userId) {
    projects = projects.filter(project => project.userId === userId);
  }

  // Sort by creation date (newest first)
  projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedProjects = projects.slice(startIndex, endIndex);

  // Enrich projects with additional data
  const enrichedProjects = paginatedProjects.map(project => {
    const user = db.findById('users', project.userId);
    const investments = db.findInvestmentsByProjectId(project.id);
    
    const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    const goalAmount = parseFloat(project.expectedRaiseAmount) || 0;
    const fundingProgress = goalAmount > 0 ? (totalInvested / goalAmount) * 100 : 0;
    
    // Calculate days left from endDate
    const endDate = new Date(project.endDate);
    const today = new Date();
    const daysLeft = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));

    return {
      id: project.id,
      title: project.name,
      description: project.description,
      shortDescription: project.description?.substring(0, 150) + '...' || '',
      category: project.category,
      goalAmount: goalAmount,
      currentAmount: totalInvested,
      backers: investments.length,
      daysLeft: daysLeft,
      status: project.status.toLowerCase(),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      creatorId: project.userId,
      creatorName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
      images: [],
      tags: [project.category],
      riskLevel: 'medium',
      expectedROI: Math.floor(Math.random() * 20) + 5,
      milestones: [],
      updates: [],
      fundingProgress: Math.min(fundingProgress, 100),
      investorCount: investments.length,
      user: user ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
      } : null,
    };
  });

  res.status(200).json({
    error: false,
    message: 'Projects retrieved successfully',
    data: enrichedProjects
  });
});

// Create new project
export const createProject = asyncHandler(async (req, res) => {
  const { name, category, expectedRaiseAmount, description } = req.body;
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({
      error: true,
      message: 'Authentication required',
      errorMessage: 'User not authenticated'
    });
  }
  
  console.log('Creating project for user:', userId);

  const projectData = {
    userId,
    name: name || 'New Project',
    category: category || 'Technology',
    expectedRaiseAmount: expectedRaiseAmount || '5000',
    totalMoneyInvested: '0',
    description: description || 'Project description',
    status: 'OPEN',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const project = db.create('projects', projectData);

  logger.info(`Project created: ${projectData.name}`, { 
    projectId: project.id, 
    userId,
    category: projectData.category,
    expectedRaiseAmount: projectData.expectedRaiseAmount
  });

  res.status(201).json({
    error: false,
    message: 'Project created successfully',
    data: project
  });
});

// Get project by ID
export const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = db.findById('projects', id);
  if (!project) {
    return res.status(404).json({
      error: true,
      message: 'Project not found',
      errorMessage: 'The specified project does not exist',
    });
  }

  // Enrich project with additional data
  const user = db.findById('users', project.userId);
  const investments = db.findInvestmentsByProjectId(project.id);
  
  const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
  const fundingProgress = (totalInvested / parseFloat(project.expectedRaiseAmount)) * 100;

  // Calculate days left from endDate
  const endDate = new Date(project.endDate);
  const today = new Date();
  const daysLeft = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
  
  const enrichedProject = {
    id: project.id,
    title: project.name,
    description: project.description,
    shortDescription: project.description?.substring(0, 150) + '...' || '',
    category: project.category,
    goalAmount: parseFloat(project.expectedRaiseAmount) || 0,
    currentAmount: totalInvested,
    backers: investments.length,
    daysLeft: daysLeft,
    status: project.status.toLowerCase(),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    creatorId: project.userId,
    creatorName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
    images: [],
    tags: [project.category],
    riskLevel: 'medium',
    expectedROI: Math.floor(Math.random() * 20) + 5,
    milestones: [],
    updates: [],
    fundingProgress: Math.min(fundingProgress, 100),
    investorCount: investments.length,
    user: user ? {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      email: user.email,
    } : null,
    investments: investments.map(inv => {
      const investor = db.findById('users', inv.userId);
      return {
        ...inv,
        investor: investor ? {
          id: investor.id,
          firstName: investor.firstName,
          lastName: investor.lastName,
          userName: investor.userName,
        } : null,
      };
    }),
  };

  res.status(200).json({
    error: false,
    message: 'Project retrieved successfully',
    data: enrichedProject
  });
});

// Update project
export const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, category, expectedRaiseAmount, description, startDate, endDate } = req.body;

  const project = db.findById('projects', id);
  if (!project) {
    return res.status(404).json({
      error: true,
      message: 'Project not found',
      errorMessage: 'The specified project does not exist',
    });
  }

  // Check if project can be updated (only OPEN projects can be updated)
  if (project.status !== 'OPEN') {
    return res.status(400).json({
      error: true,
      message: 'Project cannot be updated',
      errorMessage: 'Only open projects can be updated',
    });
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (category) updateData.category = category;
  if (expectedRaiseAmount) updateData.expectedRaiseAmount = expectedRaiseAmount;
  if (description) updateData.description = description;
  if (startDate) updateData.startDate = startDate;
  if (endDate) updateData.endDate = endDate;

  const updatedProject = db.update('projects', id, updateData);

  logger.info(`Project updated: ${updatedProject.name}`, { 
    projectId: id, 
    userId: req.user.id,
    changes: Object.keys(updateData)
  });

  res.status(200).json({
    error: false,
    message: 'Project updated successfully',
    data: updatedProject
  });
});

// Delete project
export const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = db.findById('projects', id);
  if (!project) {
    return res.status(404).json({
      error: true,
      message: 'Project not found',
      errorMessage: 'The specified project does not exist',
    });
  }

  // Check if project has investments
  const investments = db.findInvestmentsByProjectId(id);
  if (investments.length > 0) {
    return res.status(400).json({
      error: true,
      message: 'Cannot delete project',
      errorMessage: 'Projects with investments cannot be deleted',
    });
  }

  const deleted = db.delete('projects', id);
  if (!deleted) {
    return res.status(500).json({
      error: true,
      message: 'Failed to delete project',
      errorMessage: 'An error occurred while deleting the project',
    });
  }

  logger.info(`Project deleted: ${project.name}`, { 
    projectId: id, 
    userId: req.user.id 
  });

  res.status(204).send();
});

// Get projects by user ID
export const getProjectsByUserId = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;
  const { status } = req.query;

  console.log('Getting projects for user ID:', userId);
  let projects = db.findProjectsByUserId(userId);
  console.log('Found projects:', projects.length);

  if (status) {
    projects = projects.filter(project => project.status === status);
  }

  // Sort by creation date (newest first)
  projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Enrich projects with investment data
  const enrichedProjects = projects.map(project => {
    const investments = db.findInvestmentsByProjectId(project.id);
    const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    const goalAmount = parseFloat(project.expectedRaiseAmount) || 0;
    const fundingProgress = goalAmount > 0 ? (totalInvested / goalAmount) * 100 : 0;
    
    // Calculate days left from endDate
    const endDate = new Date(project.endDate);
    const today = new Date();
    const daysLeft = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));

    return {
      id: project.id,
      name: project.name, // Keep original name field
      title: project.name,
      description: project.description,
      shortDescription: project.description?.substring(0, 150) + '...' || '',
      category: project.category,
      goalAmount: goalAmount,
      currentAmount: totalInvested,
      backers: investments.length,
      daysLeft: daysLeft,
      status: project.status, // Keep original status (uppercase)
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      userId: project.userId, // Keep original userId field
      creatorId: project.userId,
      creatorName: 'Creator',
      images: [],
      tags: [project.category],
      riskLevel: 'medium',
      expectedROI: Math.floor(Math.random() * 20) + 5,
      milestones: [],
      updates: [],
      fundingProgress: Math.min(fundingProgress, 100),
      investorCount: investments.length,
      totalMoneyInvested: totalInvested.toString(),
      expectedRaiseAmount: project.expectedRaiseAmount,
    };
  });
  
  console.log('Enriched projects for user:', enrichedProjects);

  res.status(200).json({
    error: false,
    message: 'Projects retrieved successfully',
    data: enrichedProjects,
  });
});

// Update project status (admin only)
export const updateProjectStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['OPEN', 'CLOSED', 'FUNDED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: true,
      message: 'Invalid status',
      errorMessage: `Status must be one of: ${validStatuses.join(', ')}`,
    });
  }

  const project = db.findById('projects', id);
  if (!project) {
    return res.status(404).json({
      error: true,
      message: 'Project not found',
      errorMessage: 'The specified project does not exist',
    });
  }

  const updatedProject = db.update('projects', id, { status });

  logger.info(`Project status updated: ${project.name}`, { 
    projectId: id, 
    oldStatus: project.status,
    newStatus: status,
    adminId: req.user.id 
  });

  res.status(200).json({
    error: false,
    message: 'Project status updated successfully',
    data: updatedProject,
  });
});

// Get project statistics
export const getProjectStatistics = asyncHandler(async (req, res) => {
  const projects = db.findMany('projects');
  const investments = db.findMany('investments');

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'OPEN').length,
    fundedProjects: projects.filter(p => p.status === 'FUNDED').length,
    cancelledProjects: projects.filter(p => p.status === 'CANCELLED').length,
    totalFunding: investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
    averageFundingPerProject: projects.length > 0 
      ? investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0) / projects.length 
      : 0,
    categoriesDistribution: {},
  };

  // Calculate category distribution
  projects.forEach(project => {
    stats.categoriesDistribution[project.category] = 
      (stats.categoriesDistribution[project.category] || 0) + 1;
  });

  res.status(200).json({
    error: false,
    message: 'Project statistics retrieved successfully',
    data: stats,
  });
});