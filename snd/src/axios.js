import axios from 'axios';
import { baseUrl } from './constants/constant';

// Create Axios instance
const instance = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

// Function to refresh access token
export const refreshToken = async () => {
  try {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      throw new Error('No refresh token found');
    }

    const response = await instance.post('/token/refresh/', { refresh });
    const newAccessToken = response.data.access;

    // Save new access token to localStorage
    localStorage.setItem('access_token', newAccessToken);
    console.log('New access token received:', newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

// Request Interceptor
instance.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
instance.interceptors.response.use(
    (response) => response, // Pass successful responses
    async (error) => {
      const originalRequest = error.config;
  
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
  
        try {
          const newAccessToken = await refreshToken();
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance(originalRequest); // Retry failed request with new token
        } catch (refreshError) {
          console.error('Token refresh failed, redirecting to login:', refreshError);
          window.location.href = '/login'; // Redirect to login
          return Promise.reject(refreshError);
        }
      }
  
      return Promise.reject(error); // Pass other errors to be handled globally
    }
  );
  
export default instance;
