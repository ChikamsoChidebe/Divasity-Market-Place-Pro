import { db } from '../utils/database.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get user notifications
export const getUserNotifications = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { page = 1, limit = 20, unreadOnly = false } = req.query;

  let query = { userId };
  if (unreadOnly === 'true') {
    query.isRead = false;
  }

  const notifications = db.findMany('notifications', query)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedNotifications = notifications.slice(startIndex, endIndex);

  res.status(200).json({
    error: false,
    message: 'Notifications retrieved successfully',
    data: {
      notifications: paginatedNotifications,
      total: notifications.length,
      unreadCount: notifications.filter(n => !n.isRead).length,
      page: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

// Mark notification as read
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const notification = db.findById('notifications', id);
  
  if (!notification) {
    return res.status(404).json({
      error: true,
      message: 'Notification not found'
    });
  }

  if (notification.userId !== userId) {
    return res.status(403).json({
      error: true,
      message: 'Access denied'
    });
  }

  const updatedNotification = db.update('notifications', id, { isRead: true });

  res.status(200).json({
    error: false,
    message: 'Notification marked as read',
    data: updatedNotification
  });
});

// Mark all notifications as read
export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const notifications = db.findMany('notifications', { userId, isRead: false });
  
  notifications.forEach(notification => {
    db.update('notifications', notification.id, { isRead: true });
  });

  res.status(200).json({
    error: false,
    message: 'All notifications marked as read',
    data: { updatedCount: notifications.length }
  });
});

// Create notification (internal function)
export const createNotification = (userId, type, title, message, metadata = {}) => {
  return db.create('notifications', {
    userId,
    type,
    title,
    message,
    metadata,
    isRead: false
  });
};

// Notification types and creators
export const NotificationTypes = {
  INVESTMENT_RECEIVED: 'investment_received',
  PROJECT_FUNDED: 'project_funded',
  PROJECT_STATUS_CHANGED: 'project_status_changed',
  WALLET_CREDITED: 'wallet_credited',
  WALLET_DEBITED: 'wallet_debited',
  NEW_PROJECT_AVAILABLE: 'new_project_available',
  INVESTMENT_RETURN: 'investment_return'
};

// Helper functions to create specific notifications
export const notifyInvestmentReceived = (projectOwnerId, investorName, amount, projectName) => {
  return createNotification(
    projectOwnerId,
    NotificationTypes.INVESTMENT_RECEIVED,
    'New Investment Received!',
    `${investorName} invested ₦${amount.toLocaleString()} in your project "${projectName}"`,
    { amount, projectName, investorName }
  );
};

export const notifyProjectFunded = (projectOwnerId, projectName, totalAmount) => {
  return createNotification(
    projectOwnerId,
    NotificationTypes.PROJECT_FUNDED,
    'Project Fully Funded!',
    `Congratulations! Your project "${projectName}" has reached its funding goal of ₦${totalAmount.toLocaleString()}`,
    { projectName, totalAmount }
  );
};

export const notifyWalletTransaction = (userId, type, amount, description) => {
  const isCredit = type === 'credit';
  return createNotification(
    userId,
    isCredit ? NotificationTypes.WALLET_CREDITED : NotificationTypes.WALLET_DEBITED,
    isCredit ? 'Wallet Credited' : 'Wallet Debited',
    `Your wallet has been ${isCredit ? 'credited' : 'debited'} with ₦${amount.toLocaleString()}. ${description}`,
    { amount, type, description }
  );
};