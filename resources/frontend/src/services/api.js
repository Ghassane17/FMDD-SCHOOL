import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
});

console.log('API Base URL:', api.defaults.baseURL);

api.interceptors.request.use(config => {
    console.log('Request:', config.method.toUpperCase(), config.url, config.data);
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    response => {
        console.log('Response:', response.status, response.data);
        return response;
    },
    error => {
        console.error('API Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            code: error.code,
        });
        return Promise.reject(error);
    }
);

export const register = (data) => {
    console.log('Calling register with:', data);
    return api.post('/register', data);
};

export const login = (data) => {
    console.log('Calling login with:', data);
    return api.post('/login', data);
}

export default api;
