import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from './api';
import { AuthCall } from './AuthCall';
export const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
  
    useEffect(() => {
        const authenticate = async () => {
          try {
            const res = await AuthCall();
            console.log("Authentication result:", res); // Debug log
            setIsAuthenticated(res);
          } catch (err) {
            console.error("Auth error:", err);
          }
          setLoading(false);
        };
      
        authenticate();
      }, []);
      
  
    if (loading) return <div>Loading...</div>;
    return isAuthenticated ? children : <Navigate to="/login" />;
  };
  