import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { initializeApp } from './auth';
export const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
  
    useEffect(() => {
      const authenticate = async () => {
        const isAuthenticated = await initializeApp(); // Check or refresh tokens
        setIsAuthenticated(isAuthenticated);
        setLoading(false); // Finish loading
      };
  
      authenticate();
    }, []);
  
    if (loading) return <div>Loading...</div>;
    return isAuthenticated ? children : <Navigate to="/login" />;
  };
  