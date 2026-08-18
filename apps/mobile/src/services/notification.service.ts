import { api } from "./api";

export interface Notification {
  id: string;
  type: "contribution" | "payout" | "dispute" | "vote" | "system";
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get<{ data: Notification[] }>("/notifications");
    return response.data;
  },

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await api.get<{ count: number }>("/notifications/unread-count");
    return response;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await api.post(`/notifications/${notificationId}/read`, {});
  },

  async markAllAsRead(): Promise<void> {
    await api.post("/notifications/read-all", {});
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/notifications/${notificationId}`);
  },
};
