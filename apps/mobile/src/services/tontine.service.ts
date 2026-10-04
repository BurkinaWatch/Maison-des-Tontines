import { api } from "./api";
import {
  Tontine,
  TontineRules,
  TontineStatus,
  TontineType,
  CreateTontineRequest,
  Cycle,
  TontineMember,
  MembershipInvitation,
} from "../types/tontine";
import { Currency } from "../types/contribution";

type ApiTontine = Record<string, any>;

function numberValue(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function dateValue(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return typeof value === "string" ? value : "";
}

function parseRuleValue(value: unknown, type?: unknown): unknown {
  if (typeof value !== "string") return value;
  if (type === "BOOLEAN" || value === "true" || value === "false") {
    return value.toLowerCase() === "true";
  }
  if (type === "NUMBER") return numberValue(value);
  return value;
}

function normalizeRules(rawRules: unknown): TontineRules & Record<string, unknown> {
  const entries = Array.isArray(rawRules)
    ? rawRules.map((rule: any) => [
        String(rule.key),
        parseRuleValue(rule.value, rule.type),
      ])
    : Object.entries(
        rawRules && typeof rawRules === "object"
          ? (rawRules as Record<string, unknown>)
          : {}
      );
  const values = Object.fromEntries(entries) as Record<string, unknown>;
  const booleanRule = (key: string, fallback: boolean) =>
    typeof values[key] === "boolean" ? values[key] as boolean : fallback;
  const numericRule = (key: string, fallback: number) =>
    numberValue(values[key], fallback);

  return {
    ...values,
    allowLatePayment: booleanRule("allowLatePayment", true),
    latePenaltyPercent: numericRule("latePenaltyPercent", 5),
    requireVoteForAbsent: booleanRule("requireVoteForAbsent", true),
    maxMissedContributions: numericRule("maxMissedContributions", 2),
    payoutDelayDays: numericRule("payoutDelayDays", 1),
    allowEarlyPayout: booleanRule("allowEarlyPayout", true),
    earlyPayoutPenalty: numericRule("earlyPayoutPenalty", 10),
  };
}

function toMobileTontine(raw: ApiTontine): Tontine {
  if (!raw || typeof raw !== "object" || typeof raw.id !== "string" || typeof raw.name !== "string") {
    throw new Error("The service returned an invalid tontine");
  }

  const amount = numberValue(raw.amount ?? raw.contributionAmount, Number.NaN);
  if (!Number.isFinite(amount)) {
    throw new Error("The service returned a tontine without a valid contribution amount");
  }

  const typeMap: Record<string, TontineType> = {
    ROTATIVE: "rotating",
    ROTATING: "rotating",
    SAVINGS: "savings",
    GOAL: "investment",
    INVESTMENT: "investment",
    HYBRID: "social",
    SOCIAL: "social",
  };
  const type = typeMap[String(raw.type ?? "").toUpperCase()];
  if (!type) throw new Error("The service returned an unsupported tontine type");

  const statusMap: Record<string, TontineStatus> = {
    DRAFT: "draft",
    ACTIVE: "active",
    COMPLETED: "completed",
    SUSPENDED: "suspended",
  };
  const status = statusMap[String(raw.status ?? "").toUpperCase()];
  if (!status) throw new Error("The service returned an unsupported tontine status");

  const frequencyMap: Record<string, Tontine["frequency"]> = {
    WEEKLY: "weekly",
    BIWEEKLY: "biweekly",
    MONTHLY: "monthly",
    QUARTERLY: "quarterly",
  };
  const frequency = frequencyMap[String(raw.frequency ?? "").toUpperCase()];
  if (!frequency) throw new Error("The service returned an unsupported tontine frequency");

  const rules = normalizeRules(raw.rules);
  const members: TontineMember[] = Array.isArray(raw.members)
    ? raw.members.map((member: any, index: number) => ({
        ...member,
        id: String(member.id ?? ""),
        userId: String(member.userId ?? member.user?.id ?? ""),
        tontineId: String(member.tontineId ?? raw.id),
        name: String(member.name ?? member.user?.name ?? `Member ${index + 1}`),
        phoneNumber: String(member.phoneNumber ?? member.user?.phone ?? ""),
        position: numberValue(member.position ?? member.payoutOrder, index + 1),
        payoutOrder: numberValue(member.payoutOrder, index + 1),
        joinedAt: dateValue(member.joinedAt ?? member.createdAt),
        role: member.role ? String(member.role).toUpperCase() as TontineMember["role"] : undefined,
        status: member.status ? String(member.status).toUpperCase() as TontineMember["status"] : undefined,
      }))
    : [];
  const currentCycle =
    raw.currentCycle && typeof raw.currentCycle === "object"
      ? raw.currentCycle.sequence ?? raw.currentCycle.cycleNumber
      : raw.currentCycle;

  return {
    id: raw.id,
    name: raw.name,
    description: typeof raw.description === "string" ? raw.description : "",
    type,
    status,
    amount,
    currency: String(raw.currency ?? "XOF") as Currency,
    frequency,
    totalMembers: numberValue(
      raw.totalMembers ?? raw.maxMembers ?? raw.memberCount ?? raw._count?.members ?? members.length
    ),
    currentCycle: numberValue(currentCycle),
    totalCycles: numberValue(raw.totalCycles ?? rules.totalCycles),
    startDate: dateValue(raw.startDate),
    endDate: raw.endDate ? dateValue(raw.endDate) : undefined,
    createdAt: dateValue(raw.createdAt),
    createdBy: String(raw.createdBy ?? raw.createdById ?? ""),
    members,
    rules,
  };
}

export const tontineService = {
  async getTontines(): Promise<Tontine[]> {
    const response = await api.get<{ tontines: ApiTontine[] }>("/tontines");
    return Array.isArray(response.tontines)
      ? response.tontines.map(toMobileTontine)
      : [];
  },

  async getTontine(id: string): Promise<Tontine> {
    const response = await api.get<{ tontine: ApiTontine }>(`/tontines/${id}`);
    return toMobileTontine(response.tontine);
  },

  async createTontine(data: CreateTontineRequest): Promise<Tontine> {
    const response = await api.post<{ tontine: ApiTontine }>("/tontines", data);
    return toMobileTontine(response.tontine);
  },

  async updateTontine(id: string, data: Partial<Tontine>): Promise<Tontine> {
    const response = await api.request<{ tontine: Tontine }>(`/tontines/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response.tontine;
  },

  async deleteTontine(id: string): Promise<void> {
    await api.delete(`/tontines/${id}`);
  },

  async getCycles(tontineId: string): Promise<Cycle[]> {
    const response = await api.get<{ cycles: Cycle[] }>(
      `/tontines/${tontineId}/cycles`
    );
    return (response.cycles ?? []).map((cycle: any) => ({
      ...cycle,
      cycleNumber: cycle.cycleNumber ?? cycle.sequence,
      startDate: cycle.startDate,
      endDate: cycle.endDate ?? cycle.startDate,
      dueDate: cycle.dueDate ?? cycle.endDate ?? cycle.startDate,
      status: String(cycle.status).toLowerCase() === "open" ? "current" : String(cycle.status).toLowerCase() as Cycle["status"],
      potAmount: Number(cycle.potAmount ?? cycle.tontine?.contributionAmount ?? 0),
      payoutRecipientId: cycle.beneficiaryMemberId,
    }));
  },

  async getMembers(tontineId: string): Promise<TontineMember[]> {
    const response = await api.get<{ members: TontineMember[] }>(
      `/tontines/${tontineId}/members`
    );
    return response.members ?? [];
  },

  async addMember(tontineId: string, member: Omit<TontineMember, "id" | "tontineId">): Promise<TontineMember> {
    const response = await api.post<{ data: TontineMember }>(
      `/tontines/${tontineId}/members`,
      member
    );
    return response.data;
  },

  async removeMember(tontineId: string, memberId: string): Promise<void> {
    await api.delete(`/tontines/${tontineId}/members/${memberId}`);
  },

  async inviteMember(tontineId: string, target: { phone?: string; email?: string }): Promise<TontineMember> {
    const response = await api.post<{ membership: TontineMember }>(
      `/memberships/${tontineId}/members/invite`, target
    );
    return response.membership;
  },

  async updateMemberRole(tontineId: string, memberId: string, role: string): Promise<TontineMember> {
    const response = await api.request<{ membership: TontineMember }>(
      `/memberships/${tontineId}/members/${memberId}`,
      { method: "PATCH", body: JSON.stringify({ role }) }
    );
    return response.membership;
  },

  async getMyInvitations(): Promise<MembershipInvitation[]> {
    const response = await api.get<{ invitations: MembershipInvitation[] }>("/memberships/invitations");
    return response.invitations ?? [];
  },

  async respondToInvitation(membershipId: string, decision: "ACCEPT" | "DECLINE"): Promise<TontineMember> {
    const response = await api.request<{ membership: TontineMember }>(
      `/memberships/invitations/${membershipId}`,
      { method: "PATCH", body: JSON.stringify({ decision }) }
    );
    return response.membership;
  },
};
