import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
      (set) => ({
        isAuthenticated: null,
        user: null,
        role: null,
        loading: true,
        setAuthStatus: (status) => set({ isAuthenticated: status, loading: false }),
        setUser: (userData, userRole) => set({ user: userData, role: userRole }),
        clearAuth: () => set({ isAuthenticated: false, user: null, role: null, loading: false }),
      }),
      {
        name: 'auth-storage',
        getStorage: () => localStorage,
        onRehydrateStorage: () => (state) => {
          if (state?.isAuthenticated && state?.user) {
            set({ loading: false });
          }
        },
      }
    )
  );
  

export default useAuthStore;
