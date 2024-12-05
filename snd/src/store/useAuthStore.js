import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: null, // Use `null` to indicate unknown initial state
      user: null, // Store user details
      loading: true, // Track loading state
      setAuthStatus: (status) => set({ isAuthenticated: status, loading: false }),
      setUser: (userData) => set({ user: userData }),
      clearAuth: () => set({ isAuthenticated: false, user: null, loading: false }),
    }),
    {
      name: 'auth-storage', // Key for localStorage
      getStorage: () => localStorage, // Use localStorage for persistence
    }
  )
);

export default useAuthStore;
