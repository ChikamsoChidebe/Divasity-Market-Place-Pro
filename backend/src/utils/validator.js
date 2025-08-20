// Input validation utilities
export class InputValidator {
  // Validate email format
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof email === 'string' && emailRegex.test(email) && email.length <= 254;
  }

  // Validate phone number
  static isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,2}[\s]?[\d]{3,14}$/;
    return typeof phone === 'string' && phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // Validate numeric amount
  static isValidAmount(amount) {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num <= 1000000000; // Max 1 billion
  }

  // Validate string length
  static isValidLength(str, min = 1, max = 255) {
    return typeof str === 'string' && str.trim().length >= min && str.trim().length <= max;
  }

  // Validate required fields
  static validateRequired(obj, requiredFields) {
    const missing = [];
    for (const field of requiredFields) {
      if (!obj[field] || (typeof obj[field] === 'string' && !obj[field].trim())) {
        missing.push(field);
      }
    }
    return missing;
  }

  // Validate user registration data
  static validateUserRegistration(data) {
    const errors = [];
    const required = ['email', 'firstName', 'lastName', 'userName', 'password'];
    
    const missing = this.validateRequired(data, required);
    if (missing.length > 0) {
      errors.push(`Missing required fields: ${missing.join(', ')}`);
    }

    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    if (data.password && data.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (data.firstName && !this.isValidLength(data.firstName, 1, 50)) {
      errors.push('First name must be 1-50 characters');
    }

    if (data.lastName && !this.isValidLength(data.lastName, 1, 50)) {
      errors.push('Last name must be 1-50 characters');
    }

    if (data.userName && !this.isValidLength(data.userName, 3, 30)) {
      errors.push('Username must be 3-30 characters');
    }

    if (data.telephone && !this.isValidPhone(data.telephone)) {
      errors.push('Invalid phone number format');
    }

    return errors;
  }

  // Validate investment data
  static validateInvestment(data) {
    const errors = [];
    const required = ['projectId', 'amount'];
    
    const missing = this.validateRequired(data, required);
    if (missing.length > 0) {
      errors.push(`Missing required fields: ${missing.join(', ')}`);
    }

    if (data.amount && !this.isValidAmount(data.amount)) {
      errors.push('Invalid investment amount');
    }

    return errors;
  }

  // Validate project data
  static validateProject(data) {
    const errors = [];
    const required = ['name', 'description', 'expectedRaiseAmount', 'category'];
    
    const missing = this.validateRequired(data, required);
    if (missing.length > 0) {
      errors.push(`Missing required fields: ${missing.join(', ')}`);
    }

    if (data.name && !this.isValidLength(data.name, 3, 100)) {
      errors.push('Project name must be 3-100 characters');
    }

    if (data.description && !this.isValidLength(data.description, 10, 1000)) {
      errors.push('Project description must be 10-1000 characters');
    }

    if (data.expectedRaiseAmount && !this.isValidAmount(data.expectedRaiseAmount)) {
      errors.push('Invalid expected raise amount');
    }

    return errors;
  }

  // Sanitize numeric input
  static sanitizeNumeric(input, defaultValue = 0) {
    const num = parseFloat(input);
    return isNaN(num) ? defaultValue : Math.max(0, num);
  }

  // Sanitize string input
  static sanitizeString(input, maxLength = 255) {
    if (typeof input !== 'string') return '';
    return input.trim().substring(0, maxLength);
  }
}