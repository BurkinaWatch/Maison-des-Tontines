import { api } from "./api";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const DEVICE_TOKEN_KEY = "expo_push_device_token";

export interface Notification {
  id: string;
  type: string;
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
  async registerDeviceToken(): Promise<boolean> {
    if (Platform.OS === "web") return false;
    const permissions = await Notifications.getPermissionsAsync();
    const granted = permissions.granted || (await Notifications.requestPermissionsAsync()).granted;
    if (!granted) return false;
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data;
    await api.post("/notifications/device-token", { token, platform: Platform.OS });
    await SecureStore.setItemAsync(DEVICE_TOKEN_KEY, token);
    return true;
  },

  async setPushEnabled(enabled: boolean): Promise<boolean> {
    if (enabled) return this.registerDeviceToken();
    if (Platform.OS === "web") return true;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token =
      (await SecureStore.getItemAsync(DEVICE_TOKEN_KEY)) ??
      (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data;
    await api.post("/notifications/device-token/disable", { token });
    await SecureStore.setItemAsync(DEVICE_TOKEN_KEY, token);
    return true;
  },

  async getNotifications(): Promise<Notification[]> {
    const response = await api.get<{
      notifications: Array<{
        id: string; type: Notification["type"]; title: string; body: string;
        data: string; status: string; readAt?: string | null; createdAt: string;
      }>;
    }>("/notifications");
    const notifications = Array.isArray(response.notifications) ? response.notifications : [];
    return notifications.map((item) => ({
      id: item.id,
      type: item.type.toLowerCase(),
      title: item.title,
      message: item.body,
      data: parseNotificationData(item.data),
       read: String(item.status).toUpperCase() === "READ" || Boolean(item.readAt),
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
