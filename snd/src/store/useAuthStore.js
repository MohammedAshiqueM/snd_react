// useAuthStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Separate store for role management (not persisted)
const useRoleStore = create((set) => ({
  role: null,
  setRole: (role) => set({ role }),
  clearRole: () => set({ role: null }),
}));

// Main auth store (persisted)
const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: null,
      user: null,
      loading: true,
      setAuthStatus: (status) => set({ isAuthenticated: status, loading: false }),
      setUser: (userData) => set({ user: userData }),
      clearAuth: () => {
        set({ isAuthenticated: false, user: null, loading: false });
        useRoleStore.getState().clearRole(); // Clear role when logging out
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);

export { useAuthStore, useRoleStore };