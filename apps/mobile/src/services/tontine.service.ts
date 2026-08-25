import { api } from "./api";
import { Tontine, CreateTontineRequest, Cycle, TontineMember, MembershipInvitation } from "../types/tontine";

export const tontineService = {
  async getTontines(): Promise<Tontine[]> {
    const response = await api.get<{ tontines: Tontine[] }>("/tontines");
    return response.tontines ?? [];
  },

  async getTontine(id: string): Promise<Tontine> {
    const response = await api.get<{ tontine: Tontine }>(`/tontines/${id}`);
    return response.tontine;
  },

  async createTontine(data: CreateTontineRequest): Promise<Tontine> {
    const response = await api.post<{ tontine: Tontine }>("/tontines", data);
    return response.tontine;
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
    return response.cycles ?? [];
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
