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
  otp: string;
}

export interface RegisterRequest {
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  otp: string;
}

export interface CreateTontineRequest {
  name: string;
  description: string;
  type: string;
  amount: number;
  currency: string;
  frequency: string;
  totalMembers: number;
  totalCycles: number;
  startDate: string;
  rules: {
    allowLatePayment: boolean;
    latePenaltyPercent: number;
    requireVoteForAbsent: boolean;
    maxMissedContributions: number;
    payoutDelayDays: number;
    allowEarlyPayout: boolean;
    earlyPayoutPenalty: number;
  };
  members: {
    phoneNumber: string;
    name: string;
    position: number;
  }[];
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}
