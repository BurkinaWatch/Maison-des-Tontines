export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  MEMBER_ADD = 'MEMBER_ADD',
  MEMBER_REMOVE = 'MEMBER_REMOVE',
  PAYMENT_CONFIRM = 'PAYMENT_CONFIRM',
  PAYOUT_PROCESS = 'PAYOUT_PROCESS',
  RULE_CHANGE = 'RULE_CHANGE',
  DISPUTE_RAISE = 'DISPUTE_RAISE',
}

export enum AuditResource {
  USER = 'USER',
  TONTINE = 'TONTINE',
  CYCLE = 'CYCLE',
  CONTRIBUTION = 'CONTRIBUTION',
  PAYMENT = 'PAYMENT',
  VOTE = 'VOTE',
  DISPUTE = 'DISPUTE',
  SETTLEMENT = 'SETTLEMENT',
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId: string;
  actorId: string;
  actorEmail: string;
  actorName: string;
  ipAddress: string | null;
  userAgent: string | null;
  changes: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  actor?: User;
}

export interface AuditLogFilter {
  actorId?: string;
  resource?: AuditResource;
  resourceId?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}
