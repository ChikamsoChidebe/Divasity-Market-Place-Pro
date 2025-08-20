import jwt from 'jsonwebtoken';
import { db } from '../utils/database.js';
import { logger } from '../utils/logger.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'Access token required',
        errorMessage: 'No token provided in Authorization header',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.findById('users', decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Invalid token',
        errorMessage: 'User not found',
      });
    }

    if (!user.IsVerified) {
      return res.status(403).json({
        error: true,
        message: 'Account not verified',
        errorMessage: 'Please verify your email address before accessing this resource',
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: true,
        message: 'Invalid token',
        errorMessage: 'Token is malformed or invalid',
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: true,
        message: 'Token expired',
        errorMessage: 'Please login again',
      });
    }

    return res.status(500).json({
      error: true,
      message: 'Authentication failed',
      errorMessage: 'Internal server error during authentication',
    });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        message: 'Authentication required',
        errorMessage: 'User not authenticated',
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      logger.warn(`Access denied for user ${req.user.id} with role ${userRole}. Required roles: ${allowedRoles.join(', ')}`);
      
      return res.status(403).json({
        error: true,
        message: 'Access denied',
        errorMessage: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);

export const requireUserOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: true,
      message: 'Authentication required',
      errorMessage: 'User not authenticated',
    });
  }

  const isAdmin = req.user.role === 'admin';
  const isOwner = req.user.id === req.params.id;

  if (!isAdmin && !isOwner) {
    return res.status(403).json({
      error: true,
      message: 'Access denied',
      errorMessage: 'You can only access your own resources or need admin privileges',
    });
  }

  next();
};

export const requireProjectOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        message: 'Authentication required',
        errorMessage: 'User not authenticated',
      });
    }

    const projectId = req.params.id;
    const project = db.findById('projects', projectId);

    if (!project) {
      return res.status(404).json({
        error: true,
        message: 'Project not found',
        errorMessage: 'The specified project does not exist',
      });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = req.user.id === project.userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        error: true,
        message: 'Access denied',
        errorMessage: 'You can only modify your own projects or need admin privileges',
      });
    }

    req.project = project;
    next();
  } catch (error) {
    logger.error('Project ownership check error:', error);
    return res.status(500).json({
      error: true,
      message: 'Authorization check failed',
      errorMessage: 'Internal server error during authorization',
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = db.findById('users', decoded.userId);
      
      if (user && user.IsVerified) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};

export const generateToken = (userId, expiresIn = process.env.JWT_EXPIRES_IN || '7d') => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};