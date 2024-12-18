import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: null,
      user: null,
      loading: true,
      setAuthStatus: (status) => set({ isAuthenticated: status, loading: false }),
      setUser: (userData) => set({ user: userData }),
      clearAuth: () => set({ isAuthenticated: false, user: null, loading: false }),
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage, 
    }
  )
);

export default useAuthStore;
