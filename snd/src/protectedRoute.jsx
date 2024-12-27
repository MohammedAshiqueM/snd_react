import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from './api';

export const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await auth(); // Validates session via cookie
                setIsAuthenticated(true); // User is authenticated
            } catch {
                setIsAuthenticated(false); // User is not authenticated
            } finally {
                setLoading(false); // Stop loading
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return <div>Loading...</div>; // Show a loading state while checking authentication
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

// export default ProtectedRoute;
