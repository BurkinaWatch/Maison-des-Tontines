import { api } from "./api";
import { Contribution, Payout, ContributionStatus, Currency, PaymentMethod } from "../types/contribution";

export const contributionService = {
  async getContributions(tontineId?: string): Promise<Contribution[]> {
    const response = await api.get<{ contributions: Array<{
      id: string; cycleId: string; memberId: string; amount: number; status: string;
      method?: string; providerRef?: string | null; confirmedAt?: string | null;
      declaredAt: string; cycle?: { id: string; name: string; tontine?: { id: string; name: string; currency?: string } };
    }> }>("/contributions/me/contributions");
    return (response.contributions ?? []).filter((item) => !tontineId || item.cycle?.tontine?.id === tontineId).map((item) => ({
      id: item.id,
      tontineId: item.cycle?.tontine?.id ?? "",
      tontineName: item.cycle?.tontine?.name ?? "Tontine",
      cycleId: item.cycleId,
      userId: item.memberId,
      amount: item.amount,
      currency: (item.cycle?.tontine?.currency ?? "XOF") as Currency,
      status: item.status.toLowerCase() as ContributionStatus,
      method: item.method?.toLowerCase().replace("mobile_money", "mobile_money") as PaymentMethod | undefined,
      reference: item.providerRef ?? undefined,
      paidAt: item.confirmedAt ?? undefined,
      dueDate: item.declaredAt,
      createdAt: item.declaredAt,
    }));
  },

  async getUpcoming(): Promise<Contribution[]> {
    const contributions = await this.getContributions();
    return contributions.filter((item) => item.status === "pending");
  },

  async getHistory(tontineId?: string): Promise<Contribution[]> {
    const contributions = await this.getContributions();
    return tontineId ? contributions.filter((item) => item.tontineId === tontineId) : contributions;
  },

  async markAsPaid(contributionId: string): Promise<Contribution> {
    const response = await api.post<{ data: Contribution }>(
      `/contributions/${contributionId}/pay`,
      {}
    );
    return response.data;
  },

  async initiatePayment(input: {
    tontineId: string;
    cycleId: string;
    phoneNumber: string;
    method: "MOBILE_MONEY" | "BANK_TRANSFER" | "CASH";
    amount?: number;
  }): Promise<{
    payment: {
      internalReference: string;
      providerRef: string;
      contributionId: string;
      status: string;
      amount: number;
      currency: string;
    };
  }> {
    return api.post("/payments/contributions", input);
  },

  async getPaymentStatus(reference: string): Promise<{
    status: string;
    internalReference?: string;
    contributionId?: string;
  }> {
    return api.get(`/payments/status/${encodeURIComponent(reference)}`);
  },

  async getPayouts(tontineId?: string): Promise<Payout[]> {
    const endpoint = tontineId
      ? `/payouts?tontineId=${tontineId}`
      : "/payouts";
    const response = await api.get<{ data: Payout[] }>(endpoint);
    return response.data;
  },

  async requestEarlyPayout(payoutId: string): Promise<Payout> {
    const response = await api.post<{ data: Payout }>(
      `/payouts/${payoutId}/early-request`,
      {}
    );
    return response.data;
  },
};
