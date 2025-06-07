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

/**
 * Create a new course
 * @param {FormData} courseData - The course data including files
 * @returns {Promise} Promise object containing created course data
 */
export const createCourse = async (courseData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        // Create a new axios instance with longer timeout for file uploads
        const uploadApi = axios.create({
            baseURL: apiBaseUrl,
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            withCredentials: true,
            timeout: 120000, // 2 minutes timeout for file uploads
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(`Upload Progress: ${percentCompleted}%`);
            }
        });

        const response = await uploadApi.post('/createCourse', courseData);
        return response.data;
    } catch (error) {
        console.error('Error creating course:', error);
        
        // Log the full error response for debugging
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
        }
        
        // Handle specific error cases
        if (error.code === 'ECONNABORTED') {
            throw new Error('The request took too long to complete. Please try again with smaller files or check your internet connection.');
        }
        
        if (error.response?.status === 413) {
            throw new Error('The files you are trying to upload are too large. Please reduce the file sizes and try again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('You are not authorized to create courses. Please check your instructor status.');
        }

        if (error.response?.status === 422) {
            // Handle validation errors
            const validationErrors = error.response.data.errors;
            if (validationErrors) {
                const errorMessages = Object.entries(validationErrors)
                    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                    .join('\n');
                throw new Error(`Validation failed:\n${errorMessages}`);
            }
        }
        
        throw error;
    }
};


/**
 * Get instructor statistics
 * @returns {Promise} Promise object containing instructor statistics data
 */
export const getInstructorStatistics = async () => {
    try {
        const response = await api.get('/instructor/statistics');
        return response.data;
    } catch (error) {
        console.error('Error fetching instructor statistics:', error);
        throw error;
    }
};

/**
 * Update instructor skills
 * @param {Object} skillsData - The skills data to update
 * @returns {Promise} Promise object containing updated skills data
 */

export const updateInstructorSkills = async (skillsData) => {
    try {
        const response = await api.patch('/instructor/skills', skillsData);
        return response.data;
    } catch (error) {
        console.error('Error updating instructor skills:', error);
        throw error;
    }
};

/**
 * Update instructor languages
 * @param {Object} languagesData - The languages data to update
 * @returns {Promise} Promise object containing updated languages data
 */

export const updateInstructorLanguages = async (languagesData) => {
    try {
        const response = await api.patch('/instructor/languages', languagesData);
        return response.data;
    } catch (error) {
        console.error('Error updating instructor languages:', error);
        throw error;
    }
};

/**
 * Update instructor certifications
 * @param {Object} certificationsData - The certifications data to update
 * @returns {Promise} Promise object containing updated certifications data
 */

export const updateInstructorCertifications = async (certificationsData) => {
    try {
        const response = await api.patch('/instructor/certifications', certificationsData);
        return response.data;
    } catch (error) {
        console.error('Error updating instructor certifications:', error);
        throw error;
    }
};

// ─── Courses functions ──────────────────────────────────────────

/**
 * Get instructor courses
 * @returns {Promise} Promise object containing instructor courses data
 */


export const getInstructorCourses = async () => {
    try {
        const response = await api.get('/instructor/courses');
        return response.data;
    } catch (error) {
        console.error('Error fetching instructor courses:', error);
        throw error;
    }
};


/**
 * Fetch a course by ID
 * @param {string} courseId - The ID of the course to fetch
 * @returns {Promise} Promise object containing the course data
 */

export const getCourseById = async (courseId) => {
    try {
        const response = await api.get(`/instructor/courses/${courseId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching course by ID:', error);
        throw error;
    }
};


/**
 * Delete a course
 * @param {string} courseId - The ID of the course to delete
 * @returns {Promise} Promise object containing the deletion result
 */

export const deleteCourse = async (courseId) => {
    try {
        const response = await api.delete(`/instructor/courses/${courseId}`);
        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to delete course');
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw error;
    }
};

/**
 * Get instructor comments
 * @returns {Promise} Promise object containing instructor comments data
 */

export const getInstructorComments = async () => {
    try {
        const response = await api.get('/instructor/comments');
        return response.data;
    } catch (error) {
        console.error('Error fetching instructor comments:', error);
        throw error;
    }
};

