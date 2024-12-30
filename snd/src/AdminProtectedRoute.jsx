import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {useAuthStore} from './store/useAuthStore';
import { auth } from './api';


export const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, role, loading, setAuthStatus } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated === null) {
      (async () => {
        try {
          const response = await auth();
          if (response.success) {
            setAuthStatus(true);
          } else {
            setAuthStatus(false);
          }
        } catch (error) {
          setAuthStatus(false);
        }
      })();
    }
  }, [isAuthenticated, setAuthStatus]);

  if (loading || isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated && role === 'admin' ? (
    children
  ) : (
    <Navigate to="/admin" />
  );
};

