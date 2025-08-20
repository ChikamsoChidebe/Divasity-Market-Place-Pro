import nodemailer from 'nodemailer';
import { logger } from './logger.js';
import { ServerSanitizer } from './sanitizer.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Skip email setup if credentials are missing
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        logger.warn('Email credentials not configured, email service disabled');
        return;
      }
      
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          logger.error('Email service configuration error:', error);
        } else {
          logger.info('Email service is ready to send messages');
        }
      });
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
    }
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not initialized');
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@divasity.com',
        to,
        subject,
        html,
        text: text || this.stripHtml(html),
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${ServerSanitizer.sanitizeEmail(to)}`, { messageId: result.messageId });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error(`Failed to send email to ${ServerSanitizer.sanitizeEmail(to)}:`, ServerSanitizer.sanitizeForLog(error.message));
      return { success: false, error: error.message };
    }
  }

  async sendOTPEmail(email, otp, type = 'verification') {
    try {
      // If email service is not configured, log the OTP for development
      if (!this.transporter) {
        logger.warn(`Email service not configured. OTP for ${ServerSanitizer.sanitizeEmail(email)}: ${ServerSanitizer.sanitizeForLog(otp)}`);
        console.log(`\n🔐 OTP for ${ServerSanitizer.sanitizeEmail(email)}: ${ServerSanitizer.sanitizeForLog(otp)}\n`);
        return { success: true, messageId: 'dev-mode' };
      }
      
      const subject = type === 'verification' 
        ? 'Verify Your Divasity Account' 
        : 'Reset Your Divasity Password';
      
      const html = this.getOTPEmailTemplate(otp, type);
      return this.sendEmail(email, subject, html);
    } catch (error) {
      logger.error('Failed to send OTP email:', error);
      // Fallback: log OTP to console for development
      console.log(`\n🔐 OTP for ${ServerSanitizer.sanitizeEmail(email)}: ${ServerSanitizer.sanitizeForLog(otp)}\n`);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(email, firstName) {
    const subject = 'Welcome to Divasity Platform!';
    const html = this.getWelcomeEmailTemplate(firstName);
    return this.sendEmail(email, subject, html);
  }

  async sendInvestmentConfirmationEmail(email, investmentDetails) {
    const subject = 'Investment Confirmation - Divasity Platform';
    const html = this.getInvestmentConfirmationTemplate(investmentDetails);
    return this.sendEmail(email, subject, html);
  }

  async sendProjectUpdateEmail(email, projectDetails) {
    const subject = `Project Update: ${projectDetails.name}`;
    const html = this.getProjectUpdateTemplate(projectDetails);
    return this.sendEmail(email, subject, html);
  }

  getOTPEmailTemplate(otp, type) {
    const action = type === 'verification' ? 'verify your account' : 'reset your password';
    const title = type === 'verification' ? 'Account Verification' : 'Password Reset';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-code { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-number { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Divasity Platform</h1>
            <h2>${title}</h2>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You requested to ${action}. Please use the following OTP code:</p>
            
            <div class="otp-code">
              <div class="otp-number">${otp}</div>
              <p><strong>This code expires in 10 minutes</strong></p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> Never share this code with anyone. Divasity staff will never ask for your OTP code.
            </div>
            
            <p>If you didn't request this ${action}, please ignore this email or contact our support team.</p>
            
            <p>Best regards,<br>The Divasity Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Divasity Platform. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getWelcomeEmailTemplate(firstName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Divasity</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Divasity!</h1>
            <p>Your investment journey starts here</p>
          </div>
          <div class="content">
            <p>Dear ${ServerSanitizer.sanitizeHtml(firstName)},</p>
            <p>Welcome to the Divasity Platform! We're excited to have you join our community of innovative investors and creators.</p>
            
            <div class="feature">
              <h3>🚀 Discover Projects</h3>
              <p>Explore cutting-edge projects across various industries and find investment opportunities that align with your interests.</p>
            </div>
            
            <div class="feature">
              <h3>💰 Smart Investing</h3>
              <p>Make informed investment decisions with our comprehensive project analytics and risk assessment tools.</p>
            </div>
            
            <div class="feature">
              <h3>📊 Track Performance</h3>
              <p>Monitor your portfolio performance and track returns on your investments in real-time.</p>
            </div>
            
            <p>Ready to start your investment journey?</p>
            <a href="${process.env.FRONTEND_URL}/dashboard" class="cta-button">Go to Dashboard</a>
            
            <p>If you have any questions, our support team is here to help!</p>
            
            <p>Best regards,<br>The Divasity Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Divasity Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getInvestmentConfirmationTemplate(details) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Investment Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .investment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Investment Confirmed!</h1>
            <p>Your investment has been successfully processed</p>
          </div>
          <div class="content">
            <p>Congratulations! Your investment has been confirmed.</p>
            
            <div class="investment-details">
              <h3>Investment Details</h3>
              <div class="detail-row">
                <span><strong>Project:</strong></span>
                <span>${ServerSanitizer.sanitizeHtml(details.projectName)}</span>
              </div>
              <div class="detail-row">
                <span><strong>Investment Amount:</strong></span>
                <span>$${parseFloat(details.amount).toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span><strong>Expected Return:</strong></span>
                <span>$${parseFloat(details.returnAmount).toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span><strong>Success Rate:</strong></span>
                <span>${details.successRate}%</span>
              </div>
              <div class="detail-row">
                <span><strong>Investment Date:</strong></span>
                <span>${new Date().toLocaleDateString()}</span>
              </div>
            </div>
            
            <p>You can track your investment performance in your dashboard.</p>
            
            <p>Thank you for investing with Divasity!</p>
            
            <p>Best regards,<br>The Divasity Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Divasity Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getProjectUpdateTemplate(project) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .project-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📈 Project Update</h1>
            <p>Important update about your investment</p>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We have an important update regarding the project you invested in:</p>
            
            <div class="project-info">
              <h3>${ServerSanitizer.sanitizeHtml(project.name)}</h3>
              <p><strong>Category:</strong> ${ServerSanitizer.sanitizeHtml(project.category)}</p>
              <p><strong>Status:</strong> ${ServerSanitizer.sanitizeHtml(project.status)}</p>
              <p><strong>Total Funding:</strong> $${parseFloat(project.totalMoneyInvested).toLocaleString()}</p>
              <p><strong>Target Amount:</strong> $${parseFloat(project.expectedRaiseAmount).toLocaleString()}</p>
            </div>
            
            <p>Please check your dashboard for more detailed information about this project.</p>
            
            <p>Thank you for your continued trust in Divasity!</p>
            
            <p>Best regards,<br>The Divasity Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Divasity Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}

export const emailService = new EmailService();
export default emailService;