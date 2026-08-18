import { api } from "./api";
import { Contribution, Payout, ContributionStatus } from "../../types/contribution";

export const contributionService = {
  async getContributions(tontineId?: string): Promise<Contribution[]> {
    const endpoint = tontineId
      ? `/contributions?tontineId=${tontineId}`
      : "/contributions";
    const response = await api.get<{ data: Contribution[] }>(endpoint);
    return response.data;
  },

  async getUpcoming(): Promise<Contribution[]> {
    const response = await api.get<{ data: Contribution[] }>(
      "/contributions/upcoming"
    );
    return response.data;
  },

  async getHistory(tontineId?: string): Promise<Contribution[]> {
    const endpoint = tontineId
      ? `/contributions/history?tontineId=${tontineId}`
      : "/contributions/history";
    const response = await api.get<{ data: Contribution[] }>(endpoint);
    return response.data;
  },

  async markAsPaid(contributionId: string): Promise<Contribution> {
    const response = await api.post<{ data: Contribution }>(
      `/contributions/${contributionId}/pay`,
      {}
    );
    return response.data;
  },

  async initiatePayment(contributionId: string, method: string): Promise<{ reference: string }> {
    const response = await api.post<{ reference: string }>(
      `/contributions/${contributionId}/initiate-payment`,
      { method }
    );
    return response;
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
