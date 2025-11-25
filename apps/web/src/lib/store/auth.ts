import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: { id: string; email: string; name: string } | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: { id: string; email: string; name: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      logout: () => set({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false
      }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        // Check if we're on client side
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Return a dummy storage for SSR
        return {
          getItem: () => null,
          setItem: () => { },
          removeItem: () => { },
        };
      }),
    }
  )
);