import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "profile_preferences";

export interface ProfilePreferences {
  pushNotifications: boolean;
  contributionReminders: boolean;
  payoutAlerts: boolean;
}

export const defaultProfilePreferences: ProfilePreferences = {
  pushNotifications: true,
  contributionReminders: true,
  payoutAlerts: true,
};

export async function loadProfilePreferences(): Promise<ProfilePreferences> {
  try {
    const raw =
      Platform.OS === "web"
        ? window.localStorage.getItem(KEY)
        : await SecureStore.getItemAsync(KEY);
    return { ...defaultProfilePreferences, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return defaultProfilePreferences;
  }
}

export async function saveProfilePreferences(value: ProfilePreferences): Promise<void> {
  const serialized = JSON.stringify(value);
  if (Platform.OS === "web") {
    window.localStorage.setItem(KEY, serialized);
  } else {
    await SecureStore.setItemAsync(KEY, serialized);
  }
}