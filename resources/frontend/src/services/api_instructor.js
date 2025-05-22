import axios from 'axios';

// Déterminer l'URL de base et l'afficher explicitement
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
console.log('Using API base URL:', apiBaseUrl);

// Create axios instance with default config
const api = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    },
    withCredentials: true,
    timeout: 30000,
});

// Add request interceptor to add auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear local storage and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

/**
 * Get instructor dashboard data
 * @returns {Promise} Promise object containing instructor dashboard data
 */
export const getInstructorDashboard = async () => {
    try {
        const response = await api.get('/instructor/dashboard');
        return response.data;
    } catch (error) {
        console.error('Error fetching instructor dashboard:', error);
        throw error;
    }
};

/**
 * Update instructor profile
 * @param {Object} profileData - The profile data to update
 * @returns {Promise} Promise object containing updated instructor data
 */
export const updateInstructorProfile = async (profileData) => {
    try {
        const response = await api.patch('/instructor/profile', profileData);
        return response.data;
    } catch (error) {
        console.error('Error updating instructor profile:', error);
        throw error;
    }
};

/**
 * Update instructor availability
 * @param {Object} availabilityData - The availability data to update
 * @returns {Promise} Promise object containing updated availability data
 */
export const updateInstructorAvailability = async (availabilityData) => {
    try {
        const response = await api.patch('/instructor/availability', {
            availability: availabilityData.availability
        });
        return response.data;
    } catch (error) {
        console.error('Error updating instructor availability:', error);
        throw error;
    }
};

/**
 * Update instructor Bank information
 * @param {Object} bankInfo - The bank information data to update
 * @returns {Promise} Promise object containing updated bank information data
 */
export const updateInstructorBankAccount = async (bankInfo) => {
    try {
        const response = await api.patch('/instructor/bankInfo', bankInfo);
        return response.data;
    } catch (error) {
        console.error('Error updating instructor bank information:', error);
        throw error;
    }
};


