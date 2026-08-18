export { MemberRole, TontineStatus, TontineType, ContributionFrequency, PaymentMethod } from './tontine';
export { UserStatus, KYCStatus } from './user';

export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  SUPPORT: 'SUPPORT',
} as const;

export type SystemRole = typeof SYSTEM_ROLES[keyof typeof SYSTEM_ROLES];

export const PERMISSIONS = {
  TONTINE_CREATE: 'tontine:create',
  TONTINE_READ: 'tontine:read',
  TONTINE_UPDATE: 'tontine:update',
  TONTINE_DELETE: 'tontine:delete',
  CYCLE_MANAGE: 'cycle:manage',
  CONTRIBUTION_MANAGE: 'contribution:manage',
  MEMBER_MANAGE: 'member:manage',
  PAYOUT_PROCESS: 'payout:process',
  VOTE_CREATE: 'vote:create',
  VOTE_PARTICIPATE: 'vote:participate',
  DISPUTE_RAISE: 'dispute:raise',
  DISPUTE_RESOLVE: 'dispute:resolve',
  AUDIT_VIEW: 'audit:view',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<MemberRole, Permission[]> = {
  [MemberRole.ADMIN]: [
    PERMISSIONS.TONTINE_UPDATE,
    PERMISSIONS.CYCLE_MANAGE,
    PERMISSIONS.CONTRIBUTION_MANAGE,
    PERMISSIONS.MEMBER_MANAGE,
    PERMISSIONS.PAYOUT_PROCESS,
    PERMISSIONS.VOTE_CREATE,
    PERMISSIONS.DISPUTE_RESOLVE,
  ],
  [MemberRole.TREASURER]: [
    PERMISSIONS.CONTRIBUTION_MANAGE,
    PERMISSIONS.PAYOUT_PROCESS,
    PERMISSIONS.VOTE_CREATE,
    PERMISSIONS.DISPUTE_RESOLVE,
  ],
  [MemberRole.MEMBER]: [
    PERMISSIONS.TONTINE_READ,
    PERMISSIONS.VOTE_PARTICIPATE,
    PERMISSIONS.DISPUTE_RAISE,
  ],
};
