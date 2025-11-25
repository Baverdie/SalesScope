import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: { id: string; email: string; name: string } | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: { id: string; email: string; name: string }) => void;
  logout: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  _hasHydrated: false,
  setTokens: (accessToken, refreshToken) => {
    set({ accessToken, refreshToken, isAuthenticated: true });
    // Save to sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);
    }
  },
  setUser: (user) => {
    set({ user });
    // Save to sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('user', JSON.stringify(user));
    }
  },
  logout: () => {
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false
    });
    // Clear sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
    }
  },
  setHasHydrated: (state) => set({ _hasHydrated: state }),
}));