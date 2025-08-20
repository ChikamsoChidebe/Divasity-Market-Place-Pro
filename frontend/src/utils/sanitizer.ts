// Input sanitization utilities
export class InputSanitizer {
  // Sanitize for logging to prevent log injection
  static sanitizeForLog(input: any): string {
    if (typeof input !== 'string') {
      input = String(input);
    }
    
    return input
      .replace(/[\r\n]/g, '') // Remove newlines
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
      .substring(0, 200); // Limit length
  }

  // Sanitize HTML to prevent XSS
  static sanitizeHtml(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Validate and sanitize user ID
  static sanitizeUserId(id: any): string {
    if (!id) return 'unknown';
    return String(id).replace(/[^a-zA-Z0-9-]/g, '').substring(0, 50);
  }

  // Sanitize project name for logging
  static sanitizeProjectName(name: any): string {
    if (!name) return 'unnamed';
    return this.sanitizeForLog(name);
  }
}
