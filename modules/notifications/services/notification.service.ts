import { Notification, type INotificationDocument } from "../../parent/models/notification.model";

export class NotificationService {
  async getUserNotifications(userId: string) {
    return Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
  }

  async getUnreadCount(userId: string) {
    return Notification.countDocuments({ userId, isRead: false });
  }

  async markAsRead(notificationId: string, userId: string) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { isRead: true } },
      { new: true }
    );
  }

  async markAllAsRead(userId: string) {
    return Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );
  }
}

export const notificationService = new NotificationService();
export default notificationService;
