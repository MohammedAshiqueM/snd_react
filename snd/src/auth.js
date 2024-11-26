// auth.js
import { refreshToken } from './api';

// Helper function to check if a token is valid
const isTokenValid = (token) => {
  if (!token) return false;

  try {
    const [, payload] = token.split('.');
    const { exp } = JSON.parse(atob(payload));
    return exp * 1000 > Date.now(); // Check expiration time
  } catch (error) {
    console.error('Invalid token format:', error);
    return false;
  }
};


// Function to initialize the app on page load
export const initializeApp = async () => {
    console.log('Initializing app...');
    const accessToken = localStorage.getItem('access_token');
    const refreshTokenValue = localStorage.getItem('refresh_token');
  
    if (!refreshTokenValue) {
      console.warn('No refresh token found.');
      return false; // Return a falsy value instead of rejecting
    }
  
    if (!isTokenValid(accessToken)) {
      console.log('Access token is invalid or expired. Attempting to refresh...');
      try {
        await refreshToken();
        console.log('Token refreshed successfully.');
        return true; // Token refresh was successful
      } catch (error) {
        console.error('Failed to refresh token:', error);
        return false; // Return falsy value instead of throwing
      }
    }
  
    console.log('Access token is valid. Initialization complete.');
    return true; // Everything is good
  };
  

  
