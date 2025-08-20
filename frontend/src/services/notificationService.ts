import { apiService } from './api';

export interface Notification {
  id: string;
  UserId: string;
  NewsId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  User?: {
    id: string;
    username: string;
    email: string;
  };
}

export class NotificationService {
  // Get notifications for current user
  static async getUserNotifications(userId: string) {
    try {
      const response = await apiService.get(`/users/notifications/user/${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string, isRead: boolean = true) {
    try {
      const response = await apiService.patch(`/users/notifications/read/${notificationId}`, {
        isRead
      });
      return response;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Get all notifications (admin only)
  static async getAllNotifications() {
    try {
      const response = await apiService.get('/users/notifications');
      return response;
    } catch (error) {
      console.error('Error fetching all notifications:', error);
      throw error;
    }
  }
}

export default NotificationService;