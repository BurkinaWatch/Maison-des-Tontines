export enum VoteStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum VoteType {
  RECIPIENT = 'RECIPIENT',
  RULE_CHANGE = 'RULE_CHANGE',
  MEMBER_ADMISSION = 'MEMBER_ADMISSION',
  MEMBER_EXPULSION = 'MEMBER_EXPULSION',
}

export interface Vote {
  id: string;
  tontineId: string;
  cycleId: string | null;
  type: VoteType;
  status: VoteStatus;
  question: string;
  options: string[];
  startDate: Date;
  endDate: Date;
  result: string | null;
  createdAt: Date;
  updatedAt: Date;
  tontine?: Tontine;
  cycle?: Cycle;
  votes?: VoteRecord[];
}

export interface VoteRecord {
  id: string;
  voteId: string;
  userId: string;
  choice: string;
  votedAt: Date;
  user?: User;
}

export interface CreateVoteInput {
  tontineId: string;
  cycleId?: string;
  type: VoteType;
  question: string;
  options: string[];
  startDate: Date;
  endDate: Date;
}

export interface VoteResult {
  voteId: string;
  question: string;
  options: Record<string, number>;
  totalVotes: number;
  winner: string | null;
  participationRate: number;
}
