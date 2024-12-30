import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore, useRoleStore } from './store/useAuthStore';
import { auth } from './api';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, setAuthStatus, user } = useAuthStore();
  const { role, setRole } = useRoleStore();

  useEffect(() => {
    const initializeAuth = async () => {
      if (isAuthenticated === null) {
        try {
          const response = await auth();
          if (response.isAuthenticated && user) {
            setAuthStatus(true);
            setRole(user.role);
          } else {
            setAuthStatus(false);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          setAuthStatus(false);
        }
      } else if (isAuthenticated && user && !role) {
        // Set role from user data if authenticated but role is not set
        setRole(user.role);
      }
    };

    initializeAuth();
  }, [isAuthenticated, setAuthStatus, user, role, setRole]);

  // Show loading state while we're waiting for authentication or role
  if (loading || isAuthenticated === null || (isAuthenticated && !role)) {
    return <div>Loading...</div>;
  }

  // Handle unauthenticated state
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  console.log('Current role:', role, 'Required role:', requiredRole);

  // Only check role after we're sure we have one
  if (requiredRole && role && role !== requiredRole) {
    return <Navigate to="/home" replace />; // Redirect to dashboard instead of /unauthorized
  }

  return children;
};

export const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
);

export const UserRoute = ({ children }) => (
  <ProtectedRoute requiredRole="">{children}</ProtectedRoute>
);