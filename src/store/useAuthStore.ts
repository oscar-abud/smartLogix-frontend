import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { IUser } from "@/interfaces/IUser";

interface AuthState {
  user: IUser | null;
  token: string | null;
  setAuth: (user: IUser, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
