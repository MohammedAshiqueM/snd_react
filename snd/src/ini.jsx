import useAuthStore from './store/useAuthStore';
import { auth } from './api';

const initializeAuth = async () => {
    const { setAuthStatus, setUser } = useAuthStore.getState();
    try {
        const response = await auth(); // Call the auth API
        const { user, role } = response; // Extract user and role
        setAuthStatus(true);
        setUser(user, role); // Update Zustand state
    } catch (error) {
        console.error('Auth initialization failed:', error);
        setAuthStatus(false); // Mark as unauthenticated if the auth check fails
    }
};

export default initializeAuth;
