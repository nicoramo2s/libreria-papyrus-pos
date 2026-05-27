import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AuthState } from '../types/auth';

export const AUTH_STORAGE_KEY = 'papyrus-auth';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      login: (auth) => set({ accessToken: auth.accessToken, user: auth.user, isAuthenticated: true }),
      logout: () => set({ accessToken: null, user: null, isAuthenticated: false }),
      setAuth: (auth) =>
        set((state) => ({
          ...state,
          ...auth,
          isAuthenticated: auth.accessToken !== undefined ? Boolean(auth.accessToken) : state.isAuthenticated,
        })),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export function getPersistedAccessToken() {
  const inMemoryToken = useAuthStore.getState().accessToken;

  if (inMemoryToken) {
    return inMemoryToken;
  }

  const rawState = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawState) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawState) as { state?: { accessToken?: string | null } };
    return parsed.state?.accessToken ?? null;
  } catch {
    return null;
  }
}
