import { create } from "zustand/index.js";
import { tontineService } from "../services/tontine.service";
import { Tontine, TontineMember, Cycle, MembershipInvitation } from "../types/tontine";

interface TontineStore {
  tontines: Tontine[];
  selectedTontine: Tontine | null;
  members: TontineMember[];
  invitations: MembershipInvitation[];
  cycles: Cycle[];
  isLoading: boolean,
  fetchTontines: () => Promise<void>;
  fetchTontine: (id: string) => Promise<void>;
  selectTontine: (tontine: Tontine | null) => void;
  createTontine: (data: Parameters<typeof tontineService.createTontine>[0]) => Promise<Tontine>;
  updateTontine: (id: string, data: Partial<Tontine>) => Promise<Tontine>;
  deleteTontine: (id: string) => Promise<void>;
  fetchMembers: (tontineId: string) => Promise<void>;
  fetchCycles: (tontineId: string) => Promise<void>;
  inviteMember: (tontineId: string, target: { phone?: string; email?: string }) => Promise<void>;
  removeMember: (tontineId: string, memberId: string) => Promise<void>;
  updateMemberRole: (tontineId: string, memberId: string, role: string) => Promise<void>;
  fetchInvitations: () => Promise<void>;
  respondToInvitation: (membershipId: string, decision: "ACCEPT" | "DECLINE") => Promise<void>;
}

export const useTontineStore = create<TontineStore>((set, get) => ({
  tontines: [],
  selectedTontine: null,
  members: [],
  invitations: [],
  cycles: [],
  isLoading: false,

  fetchTontines: async () => {
    set({ isLoading: true });
    try {
      const tontines = await tontineService.getTontines();
      set({ tontines, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchTontine: async (id) => {
    set({ isLoading: true });
    try {
      const tontine = await tontineService.getTontine(id);
      set({ selectedTontine: tontine, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  selectTontine: (tontine) => set({ selectedTontine: tontine }),

  createTontine: async (data) => {
    set({ isLoading: true });
    try {
      const tontine = await tontineService.createTontine(data);
      set((state) => ({
        tontines: [...state.tontines, tontine],
        isLoading: false,
      }));
      return tontine;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateTontine: async (id, data) => {
    set({ isLoading: true });
    try {
      const tontine = await tontineService.updateTontine(id, data);
      set((state) => ({
        tontines: state.tontines.map((t) => (t.id === id ? tontine : t)),
        selectedTontine:
          state.selectedTontine?.id === id ? tontine : state.selectedTontine,
        isLoading: false,
      }));
      return tontine;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteTontine: async (id) => {
    set({ isLoading: true });
    try {
      await tontineService.deleteTontine(id);
      set((state) => ({
        tontines: state.tontines.filter((t) => t.id !== id),
        selectedTontine: state.selectedTontine?.id === id ? null : state.selectedTontine,
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchMembers: async (tontineId) => {
    try {
      const members = await tontineService.getMembers(tontineId);
      set({ members });
    } catch (error) {
      throw error;
    }
  },

  fetchCycles: async (tontineId) => {
    try {
      const cycles = await tontineService.getCycles(tontineId);
      set({ cycles });
    } catch (error) {
      throw error;
    }
  },

  inviteMember: async (tontineId, target) => {
    await tontineService.inviteMember(tontineId, target);
  },

  removeMember: async (tontineId, memberId) => {
    await tontineService.removeMember(tontineId, memberId);
    set((state) => ({ members: state.members.filter((member) => member.id !== memberId) }));
  },

  updateMemberRole: async (tontineId, memberId, role) => {
    const member = await tontineService.updateMemberRole(tontineId, memberId, role);
    set((state) => ({ members: state.members.map((item) => item.id === memberId ? { ...item, ...member } : item) }));
  },

  fetchInvitations: async () => {
    const invitations = await tontineService.getMyInvitations();
    set({ invitations });
  },

  respondToInvitation: async (membershipId, decision) => {
    await tontineService.respondToInvitation(membershipId, decision);
    set((state) => ({ invitations: state.invitations.filter((item) => item.id !== membershipId) }));
  },
}));
