import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import userRoutes from './src/routes/userRoutes.js';
import projectRoutes from './src/routes/projectRoutes.js';
import investmentRoutes from './src/routes/investmentRoutes.js';
import newsRoutes from './src/routes/newsRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import walletRoutes from './src/routes/walletRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';

// Import middleware
import { errorHandler } from './src/middleware/errorHandler.js';
import { logger } from './src/utils/logger.js';
import { seedDatabase } from './src/utils/seedData.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: true,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://divasity.com', 'https://www.divasity.com']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5175', 'http://127.0.0.1:5173', 'http://127.0.0.1:5175'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/notifications', notificationRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Divasity Platform API',
    version: '1.0.0',
    status: 'active',
    baseUrl: process.env.NODE_ENV === 'production' ? 'https://api.divasity.com' : 'http://localhost:5000',
    authentication: {
      type: 'JWT Bearer Token',
      header: 'Authorization: Bearer <token>',
      endpoints: {
        login: 'POST /api/users/login',
        register: 'POST /api/users/register'
      }
    },
    endpoints: {
      users: {
        base: '/api/users',
        public: {
          'POST /register': 'Register new user',
          'POST /login': 'User login',
          'POST /verifyotp': 'Verify OTP',
          'POST /resendOtp': 'Resend OTP',
          'POST /forgot-password': 'Request password reset',
          'POST /verify-otp': 'Reset password with OTP'
        },
        protected: {
          'GET /getuser': 'Get all users (Admin)',
          'GET /getuser/:id': 'Get user by ID',
          'PATCH /update/:id': 'Update user profile'
        }
      },
      projects: {
        base: '/api/projects',
        public: {
          'GET /': 'Get all projects (with optional auth)',
          'GET /statistics': 'Get project statistics',
          'GET /single/:id': 'Get project by ID',
          'GET /:id': 'Get projects by user ID'
        },
        protected: {
          'POST /': 'Create new project',
          'PUT /:id': 'Update project (Owner/Admin)',
          'DELETE /:id': 'Delete project (Owner/Admin)'
        },
        admin: {
          'PATCH /:id/status': 'Update project status'
        }
      },
      investments: {
        base: '/api/investments',
        protected: {
          'POST /': 'Create investment',
          'GET /my-investments': 'Get user investments',
          'GET /stats': 'Get user investment stats',
          'GET /:id': 'Get investment by ID'
        },
        admin: {
          'GET /': 'Get all investments',
          'PUT /:investmentId/outcome': 'Update investment outcome',
          'GET /analytics/overview': 'Get investment analytics'
        }
      },
      news: {
        base: '/api/news',
        public: {
          'GET /getnews': 'Get all news',
          'GET /categories': 'Get news categories',
          'GET /category/:category': 'Get news by category',
          'GET /user/:userId': 'Get news by user',
          'GET /:id': 'Get news by ID'
        },
        admin: {
          'POST /createNews': 'Create news article',
          'PUT /:id': 'Update news article',
          'DELETE /:id': 'Delete news article',
          'GET /statistics/overview': 'Get news statistics'
        }
      },
      analytics: {
        base: '/api/analytics',
        protected: {
          'GET /dashboard': 'Get dashboard analytics (role-based)'
        },
        admin: {
          'GET /platform-overview': 'Get platform overview',
          'GET /investment-performance': 'Get investment performance',
          'GET /user-engagement': 'Get user engagement metrics'
        }
      },
      wallet: {
        base: '/api/wallet',
        protected: {
          'GET /balance': 'Get wallet balance',
          'POST /verify-payment': 'Verify Flutterwave payment',
          'POST /withdraw': 'Withdraw funds',
          'GET /transactions': 'Get wallet transactions',
          'GET /stats': 'Get wallet statistics'
        }
      }
    },
    dataModels: {
      User: {
        id: 'UUID',
        email: 'string',
        firstName: 'string',
        lastName: 'string',
        userName: 'string',
        telephone: 'string',
        address: 'string',
        role: 'user|investor|admin',
        IsVerified: 'boolean',
        createdAt: 'ISO date',
        updatedAt: 'ISO date'
      },
      Project: {
        id: 'UUID',
        userId: 'UUID',
        name: 'string',
        category: 'string',
        expectedRaiseAmount: 'string',
        totalMoneyInvested: 'string',
        description: 'string',
        status: 'OPEN|FUNDED|CANCELLED',
        startDate: 'ISO date',
        endDate: 'ISO date',
        createdAt: 'ISO date',
        updatedAt: 'ISO date'
      },
      Investment: {
        id: 'UUID',
        userId: 'UUID',
        projectId: 'UUID',
        amount: 'string',
        returnAmount: 'string',
        successRate: 'number',
        createdAt: 'ISO date',
        updatedAt: 'ISO date'
      },
      News: {
        id: 'UUID',
        UserId: 'UUID',
        Newstitle: 'string',
        Newscontent: 'string',
        Newsimage: 'string',
        links: 'string',
        categories: 'array',
        createdAt: 'ISO date',
        updatedAt: 'ISO date'
      },
      Wallet: {
        id: 'UUID',
        userId: 'UUID',
        balance: 'number',
        currency: 'string'
      },
      WalletTransaction: {
        id: 'UUID',
        userId: 'UUID',
        type: 'credit|debit',
        amount: 'number',
        currency: 'string',
        reference: 'string',
        description: 'string',
        status: 'pending|completed|failed',
        metadata: 'object',
        createdAt: 'ISO date'
      }
    },
    security: {
      rateLimiting: '100 requests per 15 minutes',
      cors: 'Configured for development and production',
      helmet: 'Security headers enabled',
      validation: 'Input sanitization and validation',
      authentication: 'JWT with role-based access control'
    },
    features: {
      userManagement: 'Registration, login, OTP verification, password reset',
      projectManagement: 'CRUD operations with status management',
      investmentTracking: 'Investment creation and analytics',
      newsSystem: 'News articles with categories',
      walletSystem: 'Flutterwave integration for payments and withdrawals',
      analytics: 'Comprehensive dashboard and admin analytics',
      fileUploads: 'Project image uploads',
      emailService: 'OTP and notification emails'
    },
    paymentIntegration: {
      provider: 'Flutterwave',
      publicKey: 'FLWPUBK_TEST-e098829b9eeeffd3e73ce0497c80d678-X',
      features: ['Card payments', 'Bank transfers', 'Mobile money'],
      minimumWithdrawal: '₦500'
    },
    responseFormat: {
      success: {
        error: false,
        message: 'Success message',
        data: 'Response data'
      },
      error: {
        error: true,
        message: 'Error message',
        errorMessage: 'Detailed error description'
      }
    },
    statusCodes: {
      200: 'Success',
      201: 'Created',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      422: 'Validation Error',
      429: 'Too Many Requests',
      500: 'Internal Server Error'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: true,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, async () => {
  logger.info(`🚀 Divasity Platform API running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  logger.info(`📚 API docs: http://localhost:${PORT}/api`);
  
  // Seed database with sample data in development
  if (process.env.NODE_ENV !== 'production') {
    await seedDatabase();
  }
});

export default app;