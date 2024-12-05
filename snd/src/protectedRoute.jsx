import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import { auth } from './api'; // Assuming you have an API to verify authentication

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, setAuthStatus, setUser } = useAuthStore();

  useEffect(() => {
    // Only check authentication if `isAuthenticated` is null
    if (isAuthenticated === null) {
      (async () => {
        try {
          const response = await auth(); // Example: Call backend to verify token
          if (response.success) {
            setAuthStatus(true);
            setUser(response.user);
          } else {
            setAuthStatus(false);
          }
        } catch (error) {
          setAuthStatus(false);
        }
      })();
    }
  }, [isAuthenticated, setAuthStatus, setUser]);

  if (loading || isAuthenticated === null) {
    // Show loading state while checking auth
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};
