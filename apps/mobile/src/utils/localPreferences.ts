import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "profile_preferences";

export interface ProfilePreferences {
  pushNotifications: boolean;
  contributionReminders: boolean;
  payoutAlerts: boolean;
  language: string;
  currency: string;
}

export const defaultProfilePreferences: ProfilePreferences = {
  pushNotifications: true,
  contributionReminders: true,
  payoutAlerts: true,
  language: "en",
  currency: "XOF",
};

export async function loadProfilePreferences(): Promise<ProfilePreferences> {
  try {
    const raw =
      Platform.OS === "web"
        ? window.localStorage.getItem(KEY)
        : await SecureStore.getItemAsync(KEY);
    const stored = raw ? JSON.parse(raw) : {};
    return {
      ...defaultProfilePreferences,
      ...stored,
      language: stored.language === "English" ? "en" : stored.language === "Français" ? "fr" : (stored.language ?? defaultProfilePreferences.language),
    };
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