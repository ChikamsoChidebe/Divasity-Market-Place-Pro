import bcrypt from 'bcryptjs';
import { db } from '../utils/database.js';
import { emailService } from '../utils/emailService.js';
import { OTPGenerator } from '../utils/otpGenerator.js';
import { generateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Register new user
export const registerUser = asyncHandler(async (req, res) => {
  const { email, firstName, lastName, password, address, userName, telephone, role } = req.body;

  // Check if user already exists
  const existingUser = db.findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({
      error: true,
      message: 'User already exists',
      errorMessage: 'Email address is already registered',
    });
  }

  // Check if username is taken
  const existingUsername = db.findUserByUsername(userName);
  if (existingUsername) {
    return res.status(400).json({
      error: true,
      message: 'Username already exists',
      errorMessage: 'Please choose a different username',
    });
  }

  // Hash password
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const userData = {
    email,
    firstName,
    lastName,
    password: hashedPassword,
    address,
    userName,
    telephone,
    role: role === 'investor' ? 'investor' : role === 'admin' ? 'admin' : 'user',
    IsVerified: true,
  };

  const user = db.create('users', userData);

  logger.info(`User registered: ${email}`, { userId: user.id });

  res.status(200).json({
    error: false,
    message: 'Registration successful',
  });
});

// Verify OTP
export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({
      error: true,
      message: 'User not found',
      errorMessage: 'No user found with this email address',
    });
  }

  if (user.IsVerified) {
    return res.status(400).json({
      error: true,
      message: 'User already verified',
      errorMessage: 'This account has already been verified',
    });
  }

  const isValidOTP = db.verifyOTP(email, otp);
  if (!isValidOTP) {
    return res.status(400).json({
      error: true,
      message: 'Invalid or expired OTP',
      errorMessage: 'Please check your OTP or request a new one',
    });
  }

  // Update user verification status
  const updatedUser = db.update('users', user.id, { IsVerified: true });

  // Send welcome email
  await emailService.sendWelcomeEmail(email, user.firstName);

  logger.info(`User verified: ${email}`, { userId: user.id });

  // Remove password from response
  const { password, ...userResponse } = updatedUser;

  res.status(200).json({
    error: false,
    message: 'OTP verified successfully, user account activated',
    data: userResponse,
  });
});

// Resend OTP
export const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({
      error: true,
      message: 'User not found',
      errorMessage: 'No user found with this email address',
    });
  }

  if (user.IsVerified) {
    return res.status(400).json({
      error: true,
      message: 'User already verified',
      errorMessage: 'This account has already been verified',
    });
  }

  // Generate and send new OTP
  const otp = OTPGenerator.generate(6);
  db.storeOTP(email, otp);

  console.log(`🔐 RESEND OTP for ${email}: ${otp}`);
  await emailService.sendOTPEmail(email, otp, 'verification');

  logger.info(`OTP resent to: ${email}`, { userId: user.id });

  res.status(200).json({
    error: false,
    message: 'New OTP sent to email',
  });
});

// Login user
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(400).json({
      error: true,
      message: 'Invalid credentials',
      errorMessage: 'Email or password is incorrect',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({
      error: true,
      message: 'Invalid credentials',
      errorMessage: 'Email or password is incorrect',
    });
  }

  // OTP verification disabled
  // if (!user.IsVerified) {
  //   return res.status(403).json({
  //     error: true,
  //     message: 'Account not verified',
  //     errorMessage: 'Please verify your email address before logging in',
  //   });
  // }

  // Generate JWT token
  const token = generateToken(user.id);

  // Remove password from response
  const { password: userPassword, ...userResponse } = user;

  logger.info(`User logged in: ${email}`, { userId: user.id });

  res.status(200).json({
    error: false,
    message: 'User login successful',
    data: userResponse,
    token,
  });
});

// Forgot password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(400).json({
      error: true,
      message: 'Email does not exist',
      errorMessage: 'No user found with this email address',
    });
  }

  // Generate and send OTP for password reset
  const otp = OTPGenerator.generate(6);
  db.storeOTP(email, otp);

  console.log(`🔐 PASSWORD RESET OTP for ${email}: ${otp}`);
  await emailService.sendOTPEmail(email, otp, 'reset');

  logger.info(`Password reset OTP sent to: ${email}`, { userId: user.id });

  res.status(200).json({
    error: false,
    message: `OTP has been sent to ${email}`,
  });
});

// Verify OTP and reset password
export const verifyOTPAndResetPassword = asyncHandler(async (req, res) => {
  const { otp, new_password } = req.body;

  // Find user by OTP (we need to modify this approach)
  let userEmail = null;
  for (const [email, otpData] of db.data.otps.entries()) {
    if (otpData.otp === otp && new Date() <= otpData.expiresAt) {
      userEmail = email;
      break;
    }
  }

  if (!userEmail) {
    return res.status(400).json({
      error: true,
      message: 'Invalid or expired OTP',
      errorMessage: 'Please request a new password reset',
    });
  }

  const user = db.findUserByEmail(userEmail);
  if (!user) {
    return res.status(404).json({
      error: true,
      message: 'User not found',
      errorMessage: 'No user found with this email address',
    });
  }

  // Verify OTP
  const isValidOTP = db.verifyOTP(userEmail, otp);
  if (!isValidOTP) {
    return res.status(400).json({
      error: true,
      message: 'Invalid or expired OTP',
      errorMessage: 'Please request a new password reset',
    });
  }

  // Hash new password
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  const hashedPassword = await bcrypt.hash(new_password, saltRounds);

  // Update user password
  db.update('users', user.id, { password: hashedPassword });

  logger.info(`Password reset successful for: ${userEmail}`, { userId: user.id });

  res.status(200).json({
    error: false,
    message: 'Password has been successfully updated',
  });
});

// Get all users (admin only)
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = db.findMany('users');
  
  // Remove passwords from response
  const usersResponse = users.map(({ password, ...user }) => user);

  res.status(200).json({
    error: false,
    message: 'Users retrieved successfully',
    data: usersResponse,
  });
});

// Get user by ID
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = db.findById('users', id);
  if (!user) {
    return res.status(404).json({
      error: true,
      message: 'User not found',
      errorMessage: 'No user found with this ID',
    });
  }

  // Remove password from response
  const { password, ...userResponse } = user;

  res.status(200).json({
    error: false,
    message: 'User retrieved successfully',
    data: userResponse,
  });
});

// Update user profile
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userName, telephone } = req.body;

  const user = db.findById('users', id);
  if (!user) {
    return res.status(404).json({
      error: true,
      message: 'User not found',
      errorMessage: 'No user found with this ID',
    });
  }

  // Check if username is already taken by another user
  if (userName && userName !== user.userName) {
    const existingUser = db.findUserByUsername(userName);
    if (existingUser && existingUser.id !== id) {
      return res.status(400).json({
        error: true,
        message: 'Username already exists',
        errorMessage: 'Please choose a different username',
      });
    }
  }

  // Update user
  const updateData = {};
  if (userName) updateData.userName = userName;
  if (telephone) updateData.telephone = telephone;

  const updatedUser = db.update('users', id, updateData);

  // Remove password from response
  const { password, ...userResponse } = updatedUser;

  logger.info(`User profile updated: ${user.email}`, { userId: id });

  res.status(200).json({
    error: false,
    message: 'User updated successfully',
    data: userResponse,
  });
});