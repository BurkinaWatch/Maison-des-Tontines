import { api } from "./api";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

export interface Notification {
  id: string;
  type: "contribution" | "payout" | "dispute" | "vote" | "system";
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

function parseNotificationData(value: string | null | undefined): Record<string, unknown> | undefined {
  if (!value) return undefined;
  try {
    const parsed: unknown = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null ? parsed as Record<string, unknown> : undefined;
  } catch {
    return undefined;
  }
}

export const notificationService = {
  async registerDeviceToken(): Promise<void> {
    if (Platform.OS === "web") return;
    const permissions = await Notifications.getPermissionsAsync();
    const granted = permissions.granted || (await Notifications.requestPermissionsAsync()).granted;
    if (!granted) return;
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data;
    await api.post("/notifications/device-token", { token, platform: Platform.OS });
  },

  async getNotifications(): Promise<Notification[]> {
    const response = await api.get<{
      notifications: Array<{
        id: string; type: Notification["type"]; title: string; body: string;
        data: string; status: string; readAt?: string | null; createdAt: string;
      }>;
    }>("/notifications");
    return (response.notifications ?? []).map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      message: item.body,
      data: parseNotificationData(item.data),
      read: item.status === "READ" || Boolean(item.readAt),
      createdAt: item.createdAt,
    }));
  },

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await api.get<{ count: number }>("/notifications/unread-count");
    return response;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await api.post(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.post("/notifications/read-all");
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/notifications/${notificationId}`);
  },
};
