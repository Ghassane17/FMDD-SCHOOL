// api.js - Your API service file
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest' // Add this for Laravel to recognize AJAX requests
    }
});

console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api');

api.interceptors.request.use(config => {
    // Log request for debugging
    console.log('Making request:', config.method, config.url, config.data);

    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
export const register = (credentials) => {
    console.log('Calling register with:', credentials);
    return api.post('/register', credentials);
};
api.interceptors.response.use(
    response => {
        console.log('Response received:', response.status, response.data);
        return response;
    },
    error => {
        console.error('API Error:', error.response?.status, error.response?.data);

        // Don't alert in production - log errors instead
        if (error.response?.data?.message) {
            console.error('Error message:', error.response.data.message);
        }

        return Promise.reject(error);
    }
);

// Public routes
export const getCourses = () => api.get('/formations');
export const getCourseDetails = (courseId) => api.get(`/formations/${courseId}`); // Fixed path
export const getTeachers = () => api.get('/teachers');

// Learner
export const getMyCourses = () => api.get('/learner/my-courses');
export const enrollCourse = (courseId) => api.post('/learner/enroll', { course_id: courseId });
export const getSuggestedCourses = () => api.get('/learner/suggested-courses');
export const getQuiz = (courseId) => api.g
