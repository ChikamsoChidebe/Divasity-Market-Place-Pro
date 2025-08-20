// Server-side input sanitization utilities
export class ServerSanitizer {
  // Sanitize for logging to prevent log injection
  static sanitizeForLog(input) {
    if (typeof input !== 'string') {
      input = String(input);
    }
    
    return input
      .replace(/[\r\n]/g, '') // Remove newlines
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
      .substring(0, 200); // Limit length
  }

  // Sanitize HTML to prevent XSS
  static sanitizeHtml(input) {
    if (typeof input !== 'string') {
      input = String(input);
    }
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Validate and sanitize email
  static sanitizeEmail(email) {
    if (!email || typeof email !== 'string') return '';
    return email.toLowerCase().trim().substring(0, 254);
  }

  // Sanitize user input for safe display
  static sanitizeUserInput(input) {
    if (!input || typeof input !== 'string') return '';
    return this.sanitizeHtml(input.trim());
  }

  // Validate numeric input
  static sanitizeNumeric(input) {
    const num = parseFloat(input);
    return isNaN(num) ? 0 : num;
  }
}