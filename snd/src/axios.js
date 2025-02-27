import axios from 'axios';
import { refreshToken } from './api';
import { baseUrl } from './constants/constant';

let isRefreshing = false;
let failedRequestsQueue = [];

// Helper function to get CSRF token from cookies
const getCSRFToken = () => {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};

const instance = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
instance.interceptors.request.use(
    (config) => {
        console.log('Request URL:', config.url);
        
        // Add CSRF token for unsafe methods
        if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
            const csrfToken = getCSRFToken();
            if (csrfToken) {
                config.headers['X-CSRFToken'] = csrfToken;
            }
        }
        
        console.log('Request Headers:', config.headers);
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // If the error has no response, just reject
        if (!error.response) {
            return Promise.reject(error);
        }

        if (error.response.status === 401 && !originalRequest._retry) {
            // Prevent infinite loops
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedRequestsQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return instance(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newAccessToken = await refreshToken();
                
                // After successful token refresh, get a new CSRF token
                // For methods that require CSRF protection
                if (['post', 'put', 'patch', 'delete'].includes(originalRequest.method)) {
                    const csrfToken = getCSRFToken();
                    if (csrfToken) {
                        originalRequest.headers['X-CSRFToken'] = csrfToken;
                    }
                }
                
                failedRequestsQueue.forEach((req) => req.resolve(newAccessToken));
                failedRequestsQueue = [];
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return instance(originalRequest);
            } catch (err) {
                failedRequestsQueue.forEach((req) => req.reject(err));
                failedRequestsQueue = [];
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default instance;