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

interface OtpRequestResponse {
  message: string;
  developmentOtp?: string;
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

export const authService = {
  async login(credentials: LoginRequest): Promise<{ user: User; token: string }> {
    const response = await api.post<ApiAuthResponse>(
      "/auth/otp/verify",
      {
        phone: credentials.phoneNumber,
        otp: credentials.otp,
      }
    );
    await api.setToken(response.accessToken);
    return { user: toMobileUser(response.user), token: response.accessToken };
  },

  async register(data: RegisterRequest): Promise<{ user: User; token: string }> {
    const response = await api.post<ApiAuthResponse>(
      "/auth/register",
      {
        phone: data.phoneNumber,
        name: `${data.firstName} ${data.lastName}`.trim(),
        otp: data.otp,
      }
    );
    await api.setToken(response.accessToken);
    return { user: toMobileUser(response.user), token: response.accessToken };
  },

  async requestOTP(phoneNumber: string): Promise<OtpRequestResponse> {
    return api.post<OtpRequestResponse>("/auth/otp/request", { phone: phoneNumber });
  },

  async verifyOTP(phoneNumber: string, otp: string): Promise<{ token: string }> {
    const response = await api.post<ApiAuthResponse>("/auth/otp/verify", {
      phone: phoneNumber,
      otp,
    });
    return { token: response.accessToken };
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
    await api.removeToken();
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ user: User }>("/auth/me");
    return response.user;
  },

  async refreshToken(): Promise<string> {
    const response = await api.post<{ token: string }>("/auth/refresh");
    await api.setToken(response.token);
    return response.token;
  },
};
