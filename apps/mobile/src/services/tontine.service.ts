import { api } from "./api";
import { Tontine, CreateTontineRequest, Cycle, TontineMember } from "../types/tontine";

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
};
