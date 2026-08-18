export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

export enum KYCStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum MemberRole {
  ADMIN = 'ADMIN',
  TREASURER = 'TREASURER',
  MEMBER = 'MEMBER',
}

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  country: string;
  profileImageUrl: string | null;
  kycStatus: KYCStatus;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  memberships?: TontineMember[];
  contributions?: Contribution[];
  payments?: Payment[];
}

export interface CreateUserInput {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  city?: string;
  country: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  city?: string;
  profileImageUrl?: string;
}

export interface UserProfile extends User {
  totalTontines: number;
  activeTontines: number;
  totalContributions: number;
  totalReceived: number;
  reputationScore: number;
}
