import { api } from "./api";
import { Tontine, CreateTontineRequest, Cycle, TontineMember } from "../types/tontine";

export const tontineService = {
  async getTontines(): Promise<Tontine[]> {
    const response = await api.get<{ data: Tontine[] }>("/tontines");
    return response.data;
  },

  async getTontine(id: string): Promise<Tontine> {
    const response = await api.get<{ data: Tontine }>(`/tontines/${id}`);
    return response.data;
  },

  async createTontine(data: CreateTontineRequest): Promise<Tontine> {
    const response = await api.post<{ data: Tontine }>("/tontines", data);
    return response.data;
  },

  async updateTontine(id: string, data: Partial<Tontine>): Promise<Tontine> {
    const response = await api.put<{ data: Tontine }>(`/tontines/${id}`, data);
    return response.data;
  },

  async deleteTontine(id: string): Promise<void> {
    await api.delete(`/tontines/${id}`);
  },

  async getCycles(tontineId: string): Promise<Cycle[]> {
    const response = await api.get<{ data: Cycle[] }>(
      `/tontines/${tontineId}/cycles`
    );
    return response.data;
  },

  async getMembers(tontineId: string): Promise<TontineMember[]> {
    const response = await api.get<{ data: TontineMember[] }>(
      `/tontines/${tontineId}/members`
    );
    return response.data;
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
