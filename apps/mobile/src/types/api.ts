export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface CreateTontineRequest {
  name: string;
  description: string;
  type: "ROTATIVE" | "SAVINGS" | "GOAL" | "HYBRID";
  contributionAmount: number;
  currency: string;
  frequency: string;
  maxMembers: number;
  startDate: string;
  rules: Record<string, string | number | boolean>;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}
