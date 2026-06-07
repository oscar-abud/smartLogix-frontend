import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { IUser } from '@/interfaces/IUser';

interface AuthState {
  user: IUser | null;
  token: string | null;
  setAuth: (user: IUser, token: string) => void;
  clearAuth: () => void;
  isAuthed: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      // --- ACCIONES ---
      setAuth: (user: User, token: string) => set({ user, token }),

      clearAuth: () => set({ user: null, token: null }),

      isAuthed: () => !!get().token,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);