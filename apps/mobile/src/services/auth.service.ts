import { api } from "./api";
import { LoginRequest, RegisterRequest, User } from "../../types/user";

export const authService = {
  async login(credentials: LoginRequest): Promise<{ user: User; token: string }> {
    const response = await api.post<{ user: User; token: string }>(
      "/auth/login",
      credentials
    );
    await api.setToken(response.token);
    return response;
  },

  async register(data: RegisterRequest): Promise<{ user: User; token: string }> {
    const response = await api.post<{ user: User; token: string }>(
      "/auth/register",
      data
    );
    await api.setToken(response.token);
    return response;
  },

  async requestOTP(phoneNumber: string): Promise<void> {
    await api.post("/auth/otp/request", { phoneNumber });
  },

  async verifyOTP(phoneNumber: string, otp: string): Promise<{ token: string }> {
    const response = await api.post<{ token: string }>("/auth/otp/verify", {
      phoneNumber,
      otp,
    });
    return response;
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
