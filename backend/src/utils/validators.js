import { body, param, query } from 'express-validator';

// User validation rules
export const userRegistrationRules = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('userName')
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters long and contain only letters, numbers, and underscores'),
  body('telephone')
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .isLength({ min: 10, max: 20 })
    .withMessage('Please provide a valid phone number'),
  body('address')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters'),
  body('role')
    .optional()
    .isIn(['user', 'investor', 'admin'])
    .withMessage('Role must be either user, investor, or admin'),
];

export const userLoginRules = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const otpVerificationRules = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number'),
];

export const passwordResetRules = [
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number'),
  body('new_password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
];

export const userUpdateRules = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID format'),
  body('userName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters long and contain only letters, numbers, and underscores'),
  body('telephone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .isLength({ min: 10, max: 20 })
    .withMessage('Please provide a valid phone number'),
];

// Project validation rules
export const projectCreationRules = [
  body('name')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Project name must be between 5 and 100 characters'),
  body('category')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Category must be between 3 and 50 characters'),
  body('expectedRaiseAmount')
    .isNumeric()
    .custom(value => {
      const amount = parseFloat(value);
      if (amount < 1000 || amount > 10000000) {
        throw new Error('Expected raise amount must be between $1,000 and $10,000,000');
      }
      return true;
    }),
  body('description')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters'),
  body('startDate')
    .isISO8601()
    .custom(value => {
      const startDate = new Date(value);
      const now = new Date();
      if (startDate < now) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  body('endDate')
    .isISO8601()
    .custom((value, { req }) => {
      const endDate = new Date(value);
      const startDate = new Date(req.body.startDate);
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
      const maxDuration = 365 * 24 * 60 * 60 * 1000; // 1 year
      if (endDate - startDate > maxDuration) {
        throw new Error('Project duration cannot exceed 1 year');
      }
      return true;
    }),
];

export const projectUpdateRules = [
  param('id')
    .isUUID()
    .withMessage('Invalid project ID format'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Project name must be between 5 and 100 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Category must be between 3 and 50 characters'),
  body('expectedRaiseAmount')
    .optional()
    .isNumeric()
    .custom(value => {
      const amount = parseFloat(value);
      if (amount < 1000 || amount > 10000000) {
        throw new Error('Expected raise amount must be between $1,000 and $10,000,000');
      }
      return true;
    }),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters'),
];

// Investment validation rules
export const investmentRules = [
  body('projectId')
    .isUUID()
    .withMessage('Invalid project ID format'),
  body('amount')
    .isNumeric()
    .custom(value => {
      const amount = parseFloat(value);
      const minAmount = parseInt(process.env.MIN_INVESTMENT_AMOUNT) || 100;
      const maxAmount = parseInt(process.env.MAX_INVESTMENT_AMOUNT) || 1000000;
      if (amount < minAmount || amount > maxAmount) {
        throw new Error(`Investment amount must be between $${minAmount} and $${maxAmount.toLocaleString()}`);
      }
      return true;
    }),
];

export const investmentOutcomeRules = [
  param('investmentId')
    .isUUID()
    .withMessage('Invalid investment ID format'),
  body('returnAmount')
    .isNumeric()
    .custom(value => {
      const amount = parseFloat(value);
      if (amount < 0) {
        throw new Error('Return amount cannot be negative');
      }
      return true;
    }),
  body('successRate')
    .isInt({ min: 0, max: 100 })
    .withMessage('Success rate must be between 0 and 100'),
];

// News validation rules
export const newsCreationRules = [
  body('Newstitle')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('News title must be between 10 and 200 characters'),
  body('Newscontent')
    .trim()
    .isLength({ min: 100, max: 5000 })
    .withMessage('News content must be between 100 and 5000 characters'),
  body('Newsimage')
    .optional()
    .isURL()
    .withMessage('News image must be a valid URL'),
  body('links')
    .optional()
    .isURL()
    .withMessage('Links must be valid URLs'),
  body('categories')
    .isArray({ min: 1 })
    .withMessage('At least one category is required')
    .custom(categories => {
      const validCategories = ['Investment', 'News', 'Technology', 'Finance', 'Market', 'Analysis'];
      const invalidCategories = categories.filter(cat => !validCategories.includes(cat));
      if (invalidCategories.length > 0) {
        throw new Error(`Invalid categories: ${invalidCategories.join(', ')}`);
      }
      return true;
    }),
];

// Common validation rules
export const uuidParamRule = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format'),
];

export const paginationRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

// Email validation rule
export const emailRule = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
];