// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// const useRoleStore = create((set) => ({
//   role: null,
//   setRole: (role) => set({ role }),
//   clearRole: () => set({ role: null }),
// }));

// const useAuthStore = create(
//     persist(
//       (set) => ({
//         isAuthenticated: null,
//         user: null,
//         loading: true,
//         setAuthStatus: (status, userData) => {
//           set((state) => ({
//             ...state,
//             isAuthenticated: status,
//             user: userData,
//             loading: false,
//           }));
//         },
//         setUser: (userData) => {
//           set((state) => ({
//             ...state,
//             user: userData,
//           }));
//         },
//         clearAuth: () => {
//           console.log('Clearing auth state');
//           set({ isAuthenticated: false, user: null, loading: false });
//           useRoleStore.getState().clearRole();
//         },
//       }),
//       {
//         name: 'auth-storage',
//         getStorage: () => localStorage,
//         onRehydrateStorage: () => (state) => {
//           console.log('Rehydrated state:', state);
//         },
//       }
//     )
//   );
  

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useRoleStore = create((set) => ({
  role: null,
  setRole: (role) => set({ role }),
  clearRole: () => set({ role: null }),
}));

const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: null,
      user: null,
      loading: false,
      lastActivity: null,
      
      initialize: () => {
        const state = get();
        // Validate auth state on initialization
        if (state.isAuthenticated && !state.user) {
          // Invalid state detected, clear auth
          console.log('Invalid auth state detected during initialization');
          set({
            isAuthenticated: false,
            user: null,
            loading: false,
            lastActivity: null
          });
        } else {
          set({ loading: false });
        }
      },

      setAuthStatus: (status, userData) => {
        // Only set as authenticated if we have user data
        if (status && !userData) {
          console.warn('Attempted to set authenticated without user data');
          return;
        }
        
        set({
          isAuthenticated: status,
          user: userData,
          loading: false,
          lastActivity: status ? Date.now() : null,
        });
      },

      setUser: (userData) => {
        if (!userData) {
          console.warn('Attempted to set null user');
          return;
        }
        
        set((state) => ({
          ...state,
          user: userData,
          lastActivity: Date.now(),
        }));
      },

      updateLastActivity: () => {
        const state = get();
        // Only update activity if properly authenticated
        if (state.isAuthenticated && state.user) {
          set({ lastActivity: Date.now() });
        }
      },

      clearAuth: () => {
        console.log('Clearing auth state');
        set({
          isAuthenticated: false,
          user: null,
          loading: false,
          lastActivity: null
        });
        useRoleStore.getState().clearRole();
      },

      validateSession: () => {
        const state = get();
        
        // Check for invalid states
        if (state.isAuthenticated && !state.user) {
          console.log('Invalid auth state detected during validation');
          get().clearAuth();
          return false;
        }

        // Check session timeout
        if (state.lastActivity) {
          const sessionTimeout = 4 * 60 * 60 * 1000; // 4 hours
          if (Date.now() - state.lastActivity > sessionTimeout) {
            console.log('Session expired');
            get().clearAuth();
            return false;
          }
        }

        return true;
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      onRehydrateStorage: () => (state) => {
        console.log('Rehydrating auth state:', state);
        
        // Initialize and validate after rehydration
        setTimeout(() => {
          const store = useAuthStore.getState();
          store.initialize();
          store.validateSession();
        }, 0);
      },
    }
  )
);

// Activity tracker setup
if (typeof window !== 'undefined') {
  // Debounce the update activity function
  let activityTimeout;
  const updateActivity = () => {
    clearTimeout(activityTimeout);
    activityTimeout = setTimeout(() => {
      const store = useAuthStore.getState();
      if (store.isAuthenticated && store.user) {
        store.updateLastActivity();
      }
    }, 1000); // Debounce for 1 second
  };

  // Add event listeners with error handling
  ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
    try {
      window.addEventListener(event, updateActivity);
    } catch (error) {
      console.warn(`Failed to add ${event} listener:`, error);
    }
  });

  // Periodic session validation
  let lastValidationTime = Date.now();
  setInterval(() => {
    try {
      // Prevent multiple validations running too close together
      if (Date.now() - lastValidationTime < 60000) return; // At least 1 minute between checks
      
      lastValidationTime = Date.now();
      const store = useAuthStore.getState();
      store.validateSession();
    } catch (error) {
      console.warn('Session validation failed:', error);
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
}

export { useAuthStore, useRoleStore };