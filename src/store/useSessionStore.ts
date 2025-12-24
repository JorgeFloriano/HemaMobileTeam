import { create } from "zustand";

interface SessionState {
  emergencyOrderId: string | null;
  setEmergencyOrderId: (id: string | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  emergencyOrderId: null, // Valor inicial
  setEmergencyOrderId: (id) => set({ emergencyOrderId: id }),
}));