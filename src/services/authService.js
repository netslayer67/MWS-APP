import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'https://bemws-production.up.railway.app/api';

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
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear auth state
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            // Don't redirect immediately, let Redux handle the state update
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