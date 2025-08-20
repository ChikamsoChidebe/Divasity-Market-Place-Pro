import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { InputValidator } from '../utils/validator.js';
import { ServerSanitizer } from '../utils/sanitizer.js';

// Rate limiting middleware
export const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: true,
      message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Specific rate limits for different endpoints
export const authRateLimit = createRateLimit(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
export const apiRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes
export const strictRateLimit = createRateLimit(60 * 1000, 10); // 10 requests per minute

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:3000"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      for (const [key, value] of Object.entries(req.body)) {
        if (typeof value === 'string') {
          req.body[key] = ServerSanitizer.sanitizeUserInput(value);
        }
      }
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string') {
          req.query[key] = ServerSanitizer.sanitizeUserInput(value);
        }
      }
    }

    next();
  } catch (error) {
    res.status(400).json({
      error: true,
      message: 'Invalid input data',
    });
  }
};

// Input validation middleware factory
export const validateInput = (validationFn) => {
  return (req, res, next) => {
    try {
      const errors = validationFn(req.body);
      if (errors.length > 0) {
        return res.status(400).json({
          error: true,
          message: 'Validation failed',
          errors,
        });
      }
      next();
    } catch (error) {
      res.status(400).json({
        error: true,
        message: 'Validation error',
      });
    }
  };
};

// Specific validation middlewares
export const validateUserRegistration = validateInput(InputValidator.validateUserRegistration);
export const validateInvestment = validateInput(InputValidator.validateInvestment);
export const validateProject = validateInput(InputValidator.validateProject);

// CORS configuration
export const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'https://localhost:3000',
      'http://127.0.0.1:3000',
      'https://127.0.0.1:3000'
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Request logging middleware (with sanitization)
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: ServerSanitizer.sanitizeForLog(req.url),
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: ServerSanitizer.sanitizeForLog(req.ip),
      userAgent: ServerSanitizer.sanitizeForLog(req.get('User-Agent') || 'unknown')
    };
    
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  // Log error (sanitized)
  console.error('Error:', ServerSanitizer.sanitizeForLog(err.message));
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: true,
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
};