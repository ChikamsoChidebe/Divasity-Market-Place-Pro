import crypto from 'crypto';

export class OTPGenerator {
  static generate(length = 6) {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      otp += digits[crypto.randomInt(0, digits.length)];
    }
    
    return otp;
  }

  static generateAlphanumeric(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars[crypto.randomInt(0, chars.length)];
    }
    
    return result;
  }

  static isValid(otp, minLength = 4, maxLength = 8) {
    if (!otp || typeof otp !== 'string') return false;
    if (otp.length < minLength || otp.length > maxLength) return false;
    return /^\d+$/.test(otp);
  }
}

export default OTPGenerator;