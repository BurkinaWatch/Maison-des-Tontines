import { api } from "./api";
import type { LoginRequest, RegisterRequest } from "../types/api";
import type { User } from "../types/user";

interface ApiAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    phone: string;
    email: string | null;
    name: string;
    role: string;
  };
}

function toMobileUser(user: ApiAuthResponse["user"]): User {
  const [firstName = "", ...lastNameParts] = user.name.trim().split(/\s+/);

  return {
    id: user.id,
    phoneNumber: user.phone,
    firstName,
    lastName: lastNameParts.join(" "),
    email: user.email ?? undefined,
    role: user.role.toLowerCase() as User["role"],
    verified: true,
    createdAt: new Date().toISOString(),
  };
}

async function storeSession(response: ApiAuthResponse): Promise<{ user: User; token: string }> {
  await api.setTokens(response.accessToken, response.refreshToken);
  return { user: toMobileUser(response.user), token: response.accessToken };
}

export const authService = {
  async login(credentials: LoginRequest): Promise<{ user: User; token: string }> {
    const response = await api.post<ApiAuthResponse>("/auth/login", credentials);
    return storeSession(response);
  },

  async register(data: RegisterRequest): Promise<{ user: User; token: string }> {
    const response = await api.post<ApiAuthResponse>(
      "/auth/register",
      {
        phone: data.phoneNumber,
        email: data.email,
        name: `${data.firstName} ${data.lastName}`.trim(),
        password: data.password,
      }
    );
    return storeSession(response);
  },

  async logout(): Promise<void> {
    const refreshToken = await api.getRefreshToken();
    try {
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } finally {
      await api.removeToken();
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ user: ApiAuthResponse["user"] }>("/users/me");
    return toMobileUser(response.user);
  },

  async updateProfile(data: { name?: string; email?: string | null }): Promise<User> {
    const response = await api.request<{ user: ApiAuthResponse["user"] }>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return toMobileUser(response.user);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.request("/users/me/password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async refreshToken(): Promise<string> {
    const refreshToken = await api.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No active session");
    }

    const response = await api.post<{ accessToken: string; refreshToken: string }>(
      "/auth/refresh",
      { refreshToken }
    );
    await api.setTokens(response.accessToken, response.refreshToken);
    return response.accessToken;
  },
};
