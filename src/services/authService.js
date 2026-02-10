import axios from 'axios';
import { startGlobalLoading, stopGlobalLoading } from '@/lib/loadingManager';

// Default to versioned API to match backend routing
const API_BASE_URL = import.meta.env.VITE_API_BASE || '/api/v1';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        startGlobalLoading();
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        stopGlobalLoading();
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => {
        stopGlobalLoading();
        return response;
    },
    (error) => {
        stopGlobalLoading();
        if (error.response?.status === 401) {
            const msg = error.response?.data?.message || '';
            // Only clear auth for explicit token failures.
            // Keep auth state for non-token 401s to avoid forced logout loops.
            if (msg.includes('Token expired') || msg.includes('Invalid token') || msg.includes('jwt expired')) {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API functions
export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    console.log('Login API response:', response.data);
    return response;
};

export const logout = async () => {
    const response = await api.post('/auth/logout');
    return response;
};

export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response;
};

export const registerUser = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response;
};

export default api;
