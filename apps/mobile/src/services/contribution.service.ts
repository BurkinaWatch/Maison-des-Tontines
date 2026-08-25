import { api } from "./api";
import { Contribution, Payout, ContributionStatus } from "../types/contribution";

export const contributionService = {
  async getContributions(tontineId?: string): Promise<Contribution[]> {
    const response = await api.get<{ contributions: Contribution[] }>("/contributions/me/contributions");
    return response.contributions ?? [];
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
