export const mockTontine = {
  id: "tontine_123",
  name: "Test Tontine",
  description: "A test tontine",
  type: "ROTATIVE",
  currency: "XOF",
  contributionAmount: 10000,
  frequency: "monthly",
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-12-31"),
  status: "ACTIVE",
  maxMembers: 10,
  createdById: "user_123",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockUser = {
  id: "user_123",
  phone: "+221771234567",
  email: "test@example.com",
  name: "Test User",
  role: "MEMBER",
  status: "ACTIVE",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockContribution = {
  id: "contrib_123",
  cycleId: "cycle_123",
  memberId: "member_123",
  amount: 10000,
  status: "PAID",
  method: "MANUAL",
  providerRef: null,
  declaredAt: new Date(),
  confirmedAt: new Date(),
  confirmedById: "user_123",
  lateFee: 0,
  penaltyApplied: false,
  notes: null,
};
