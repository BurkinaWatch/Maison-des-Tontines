import Constants from "expo-constants";
import { Platform } from "react-native";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION || "v1";
let nativeAccessToken: string | null = null;
let nativeRefreshToken: string | null = null;

function getDefaultApiUrl(): string {
  if (typeof window !== "undefined" && window.location.hostname) {
    const hostname = window.location.hostname;
    const isLocalPreview = hostname === "localhost" || hostname === "127.0.0.1";

    // The API development server defaults to port 4000. Replit's preview
    // only runs Expo, so non-local browser sessions must use the public API.
    if (isLocalPreview) {
      return `${window.location.protocol}//${hostname}:4000`;
    }
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

  // Keep the first native recovery build independent from SecureStore.
  // A native SecureStore failure can terminate the Android process before
  // React Native has a chance to show an error screen.
  return key === TOKEN_KEY ? nativeAccessToken : nativeRefreshToken;
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

  if (key === TOKEN_KEY) {
    nativeAccessToken = value;
  } else {
    nativeRefreshToken = value;
  }
}

async function deleteStoredValue(key: string): Promise<void> {
  if (isWeb()) {
    getWebStorage()?.removeItem(key);
    return;
  }

  if (key === TOKEN_KEY) {
    nativeAccessToken = null;
  } else {
    nativeRefreshToken = null;
  }
}

function getErrorMessage(body: unknown, status: number, statusText: string): string {
  if (typeof body === "object" && body !== null) {
    const message = (body as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }

    const error = (body as { error?: unknown }).error;
    if (typeof error === "string" && error.trim()) {
      return error;
    }
  }

  return `HTTP ${status}: ${statusText || "Request failed"}`;
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

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch {
      throw new Error("Unable to reach the service. Please check your connection and try again.");
    }

    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : null;

    if (!response.ok) {
      throw new Error(getErrorMessage(body, response.status, response.statusText));
    }

    if (!body) {
      throw new Error("The server returned an invalid response");
    }
    return body as T;
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
