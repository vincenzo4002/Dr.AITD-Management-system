import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { BASE_URL } from '../constants/api';

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Send cookies efficiently
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        // Try getting token from Cookie (JS accessible) or LocalStorage
        // Note: HttpOnly cookies are automatically sent by browser with withCredentials: true
        // But we also support the Bearer header strategy for compatibility
        const token = Cookies.get('token') || localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Global Errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status, data } = error.response;
            const isLoginRequest = error.config?.url?.includes('/auth/login');
            
            if (status === 401 && !isLoginRequest) {
                // Token expired or invalid (but not login failure)
                console.warn('Unauthorized access - clearing tokens');
                
                // Clear all tokens
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                Cookies.remove('token');
                
                // Show error message
                toast.error('Session expired. Please login again.');
                
                // Redirect to login if not already there
                if (!window.location.pathname.includes('/login')) {
                    setTimeout(() => {
                        window.location.href = '/login?sessionExpired=true';
                    }, 1000);
                }
            } else if (status === 403) {
                toast.error('Access denied. Insufficient permissions.');
            } else if (status >= 500) {
                toast.error('Server error. Please try again later.');
            }
        } else if (error.request) {
            toast.error('Network error. Please check your connection.');
        }
        
        return Promise.reject(error);
    }
);

export default api;
