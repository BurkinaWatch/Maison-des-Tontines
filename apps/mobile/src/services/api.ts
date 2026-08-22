import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION || "v1";

function getDefaultApiUrl(): string {
  if (typeof window !== "undefined" && window.location.hostname) {
    return window.location.origin;
  }

  return "https://api.maisondestontines.com";
}

function buildApiUrl(baseUrl: string, endpoint: string): string {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${normalizedBaseUrl}/api/${API_VERSION}${normalizedEndpoint}`;
}

function isWeb(): boolean {
  return Platform.OS === "web";
}

function getWebStorage(): Storage | null {
  if (!isWeb() || typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

async function getStoredValue(key: string): Promise<string | null> {
  if (isWeb()) {
    return getWebStorage()?.getItem(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

async function setStoredValue(key: string, value: string): Promise<void> {
  if (isWeb()) {
    const storage = getWebStorage();

    if (!storage) {
      throw new Error("Web storage is unavailable");
    }

    storage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function deleteStoredValue(key: string): Promise<void> {
  if (isWeb()) {
    getWebStorage()?.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export const api = {
  baseUrl:
    process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.apiUrl ||
    getDefaultApiUrl(),

  async getToken(): Promise<string | null> {
    try {
      return await getStoredValue(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    await setStoredValue(TOKEN_KEY, token);
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await getStoredValue(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      setStoredValue(TOKEN_KEY, accessToken),
      setStoredValue(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },

  async removeToken(): Promise<void> {
    await Promise.all([
      deleteStoredValue(TOKEN_KEY),
      deleteStoredValue(REFRESH_TOKEN_KEY),
    ]);
  },

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getToken();
    const url = buildApiUrl(this.baseUrl, endpoint);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message || "An error occurred");
    }

    return response.json();
  },

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  },

  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  },
};
