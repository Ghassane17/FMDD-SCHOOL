import axios from 'axios';

// Déterminer l'URL de base et l'afficher explicitement
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
console.log('Using API base URL:', apiBaseUrl);

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

// Intercepteur de requête amélioré avec plus de logs
// In api.js, modify the request interceptor:
api.interceptors.request.use(
    config => {
        console.log('-------- AXIOS REQUEST --------');
        console.log('URL:', `${config.baseURL}${config.url}`);
        console.log('Method:', config.method?.toUpperCase());

        // Check if data is FormData and avoid setting Content-Type
        // Axios will automatically set the correct Content-Type with boundary
        if (config.data instanceof FormData) {
            console.log('FormData detected - letting Axios set the proper Content-Type');
            // Remove the Content-Type header to let Axios set it with the boundary
            delete config.headers['Content-Type'];
        }

        console.log('Headers:', config.headers);

        const logData = { ...config.data };
        if (logData && logData.password) {
            logData.password = '********';
        }
        if (logData && logData.current_password) {
            logData.current_password = '********';
            logData.new_password = '********';
            logData.new_password_confirmation = '********';
        }
        console.log('Data:', logData);

        const token = localStorage.getItem('token');
        if (token) {
            console.log('Token found - Adding to Authorization header');
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.log('No token found in localStorage');
        }

        return config;
    },
    error => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Intercepteur de réponse amélioré avec gestion d'erreur détaillée
api.interceptors.response.use(
    response => {
        console.log('-------- AXIOS RESPONSE --------');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Headers:', response.headers);
        console.log('Data:', response.data);
        return response;
    },
    error => {
        console.error('-------- AXIOS ERROR --------');

        const errorInfo = {
            message: error.message,
            code: error.code,
        };

        if (error.config) {
            errorInfo.request = {
                url: `${error.config.baseURL}${error.config.url}`,
                method: error.config.method?.toUpperCase(),
                headers: error.config.headers,
                data: error.config.data,
                timeout: error.config.timeout
            };
        }

        if (error.response) {
            errorInfo.response = {
                status: error.response.status,
                statusText: error.response.statusText,
                headers: error.response.headers,
                data: error.response.data
            };
        }

        console.error('Detailed Error Information:', errorInfo);

        if (error.code === 'ECONNABORTED') {
            console.error('⚠️ La requête a expiré - le serveur a mis trop de temps à répondre');
        } else if (error.code === 'ERR_NETWORK') {
            console.error('⚠️ Erreur réseau - vérifiez votre connexion internet');
        } else if (error.response?.status === 401) {
            console.error('⚠️ Non autorisé - problème d\'authentification');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } else if (error.response?.status === 403) {
            console.error('⚠️ Accès refusé - vous n\'avez pas les permissions nécessaires');
        } else if (error.response?.status === 404) {
            console.error('⚠️ Ressource non trouvée - vérifiez l\'URL de l\'API');
        } else if (error.response?.status === 422) {
            console.error('⚠️ Données de validation incorrectes:', error.response.data.errors);
        } else if (error.response?.status >= 500) {
            console.error('⚠️ Erreur serveur - vérifiez les logs du serveur');
        }

        return Promise.reject(error);
    }
);

// Fonctions utilitaires pour la gestion des tokens
export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');

export const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export const setUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
};

export const removeUser = () => localStorage.removeItem('user');

export const isAuthenticated = () => !!getToken();

let enrolledCoursesCache = null;
let dashboardCache = null;
let settingsCache = null;

export const clearAllCaches = () => {
    enrolledCoursesCache = null;
    dashboardCache = null;
    settingsCache = null;
};

export const initializeCSRF = async () => {
    try {
        await axios.get('/sanctum/csrf-cookie', {
            baseURL: import.meta.env.VITE_APP_URL || 'http://localhost:5731',
            withCredentials: true
        });
        console.log('CSRF cookie initialized successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize CSRF cookie:', error);
        return false;
    }
};

export const login = async (data) => {
    clearAllCaches();
    console.log('Preparing login with:', { ...data, password: '********' });

    try {
        console.log('Sending login request to:', `${api.defaults.baseURL}/login`);
        const response = await api.post('/login', data);

        console.log('Login response received:', {
            status: response.status,
            message: response.data.message,
            hasToken: !!response.data.token,
            hasUser: !!response.data.user
        });

        if (response.data.token) {
            setToken(response.data.token);
            console.log('Token stored successfully');
        } else {
            console.warn('No token received in login response');
        }

        if (response.data.user) {
            setUser(response.data.user);
            console.log('User data stored successfully');
        } else {
            console.warn('No user data received in login response');
        }

        return response;
    } catch (error) {
        console.error('Login request failed');
        if (error.response?.status === 422) {
            console.error('Validation errors:', error.response.data.errors);
        } else if (error.response?.status === 401) {
            console.error('Invalid credentials');
        } else if (!error.response) {
            console.error('Network error - server might be down or unreachable');
        }

        throw error;
    }
};

export const register = async (data) => {
    try {
        // For logging: show keys, but don't try to print file objects
        if (data instanceof FormData) {
            const entries = {};
            data.forEach((value, key) => {
                entries[key] = value instanceof File ? '[File]' : value;
            });
            console.log('Sending registration request with:', entries);
        } else {
            console.log('Sending registration request with:', { ...data, password: '********', password_confirmation: '********' });
        }

        await initializeCSRF();

        // Set headers only if data is FormData
        const config = {};
        if (data instanceof FormData) {
            config.headers = { 'Content-Type': 'multipart/form-data' };
        }

        const response = await api.post('/register', data, config);

        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            console.log('Token stored successfully');
        }

        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            console.log('User data stored successfully');
        }

        return response;
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
};

export const completeProfile = async (role, data) => {
    const endpoint = role === 'learner' ? '/learner/profile' : '/instructor/completeRegister';
    try {
        const response = await api.patch(endpoint, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Remove token from axios defaults
    delete axios.defaults.headers.common['Authorization'];
};

export const getLearnerDashboard = async (forceRefresh = false) => {
    if (!isAuthenticated()) {
        console.error('Cannot fetch dashboard: User not authenticated');
        throw new Error('Authentication required');
    }

    if (!forceRefresh && dashboardCache) {
        console.log('Returning cached dashboard');
        return { data: dashboardCache };
    }

    try {
        console.log('Fetching learner dashboard');
        const response = await api.get('/learner');
        console.log('Dashboard fetched successfully');
        dashboardCache = response.data;
        return response;
    } catch (error) {
        console.error('Failed to fetch learner dashboard');
        throw error;
    }
};

export const getEnrolledCourses = async (forceRefresh = false) => {
    if (!isAuthenticated()) {
        console.error('Cannot fetch enrolled courses: User not authenticated');
        throw new Error('Authentication required');
    }

    if (!forceRefresh && enrolledCoursesCache) {
        console.log('Returning cached enrolled courses');
        return { data: { courses: enrolledCoursesCache } };
    }

    try {
        console.log('Fetching enrolled courses');
        const response = await api.get('/learner/all-enrolled-courses');
        console.log('Fetched enrolled courses:', response.data);
        enrolledCoursesCache = response.data.courses || [];
        return response;
    } catch (error) {
        console.error('Failed to fetch enrolled courses');
        throw error;
    }
};

export const getLearnerSettings = async (forceRefresh = false) => {
    if (!forceRefresh && settingsCache) {
        return { data: settingsCache };
    }

    try {
        const response = await api.get('/learner/settings');
        console.log('Fetched learner settings:', response.data);
        settingsCache = response.data;
        return response;
    } catch (error) {
        console.error('Error fetching learner settings:', error);
        throw error;
    }
};

export const submitContactForm = async (data) => {
    try {
        return await api.post('/contact', data);
    } catch (error) {
        throw error; // Let ContactForm handle the error
    }
};

export const courseDetails = async (courseId) => {
    try {
        const response = await api.get(`/courses/${courseId}`);
        return response.data;
    } catch (error) {
        throw error; // Let the caller (EnrollmentPage) handle errors
    }
};

export const getExam = async (courseId) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            const error = new Error('Vous devez être connecté.');
            error.status = 401;
            throw error;
        }

        const url = `/courses/${courseId}/exam`;
        console.log('Calling getExam API:', url);

        const response = await api.get(url, {
            headers: { Authorization: `Bearer ${token}` },
        });

        console.log('🚀 getExam Response:', JSON.stringify(response.data, null, 2));
        if (!response.data?.success) {
            const error = new Error(response.data?.message || "Erreur lors de la récupération de l'examen.");
            error.status = response.status;
            throw error;
        }

        return response.data;
    } catch (error) {
        console.error('❌ getExam Error:', {
            message: error.message,
            status: error.status,
            response: error.response?.data,
        });
        const err = new Error(error.response?.data?.message || error.message || 'Erreur serveur.');
        err.status = error.response?.status || error.status || 500;
        throw err;
    }
};

// Submit exam answers for a course
export const submitExam = async (courseId, answers) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            const error = new Error('Vous devez être connecté.');
            error.status = 401;
            throw error;
        }

        const url = `/courses/${courseId}/exam`;
        console.log('Calling submitExam API:', url, { answers });

        const response = await api.post(url, { answers }, {
            headers: { Authorization: `Bearer ${token}` },
        });

        console.log('🚀 submitExam Response:', JSON.stringify(response.data, null, 2));
        if (!response.data?.success) {
            const error = new Error(response.data?.message || 'Erreur lors de la soumission.');
            error.status = response.status;
            throw error;
        }

        return response.data;
    } catch (error) {
        console.error('❌ submitExam Error:', {
            message: error.message,
            status: error.status,
            response: error.response?.data,
        });
        const err = new Error(error.response?.data?.message || error.message || 'Erreur serveur.');
        err.status = error.response?.status || error.status || 500;
        throw err;
    }
};

// Optional: Check if user is authenticated
export const moduleDetails = async (courseId, moduleId = null) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        const url = moduleId ? `/learner/courses/${courseId}/${moduleId}` : `/learner/courses/${courseId}`;
        console.log('🌐 Fetching module details:', url);
        const response = await api.get(url, {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log('🌐 Module Details Response:', response.data);
        if (!response.data.success) {
            const error = new Error(response.data.message || 'Failed to fetch module details');
            error.status = response.data.status || 400;
            throw error;
        }
        return response.data.data;
    } catch (error) {
        console.error('❌ Module Details Error:', error.response || error);
        const status = error.response?.status || error.status || 500;
        let message = 'Failed to fetch module details';
        if (status === 400) message = 'Invalid course or module ID';
        if (status === 404) message = error.message?.includes('module') ? 'Module not found' : 'Course not found';
        if (status === 401) message = 'Authentication required';
        if (status === 403) message = 'You are not enrolled in this course';
        if (status === 500) message = 'Server error occurred while loading the module. Please try again later.';
        const err = new Error(message);
        err.status = status;
        throw err;
    }
};

export const getAllCourses = async () => {
    try {
        const response = await api.get('/learner/all-courses');
        return response;
    } catch (error) {
        console.error('Failed to fetch all courses:', error);
        throw error;
    }
};

// Notification functions
export const getLearnerNotifications = async () => {
    try {
        return await axios.get('/api/learner/notifications', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

export const markNotificationAsRead = async (notificationId) => {
    try {
        const response = await axios.patch(`/api/learner/notifications/${notificationId}/read`, {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

export const enrollNow = async (courseId) => {
    try {
        const response = await api.post(`/courses/${courseId}/enroll`);
        console.log('🌐 Enroll API Response:', response); // Debug
        if (!response.data || !response.data.message) {
            throw new Error('Invalid enrollment response');
        }
        return response.data;
    } catch (error) {
        console.error('❌ Enroll API Error:', error.response || error);
        throw error;
    }
};

export const leaveCourse = async (courseId) => {
    try {
        const response = await api.delete(`/courses/${courseId}/leave`);
        console.log('🌐 Leave API Response:', response); // Debug
        if (!response.data || !response.data.message) {
            throw new Error('Invalid leave response');
        }
        return response.data;
    } catch (error) {
        console.error('❌ Leave API Error:', error.response || error);
        throw error;
    }
};

/**
 * Submit a comment for a course
 * @param {number} courseId - ID of the course
 * @param {Object} commentData - Comment data including text and rating
 * @returns {Promise<Object>} Response data
 */
export const submitComment = async (courseId, commentData) => {
    try {
        const response = await api.post(`/courses/${courseId}/comments`, {
            text: commentData.text,
            rating: Math.round(commentData.rating) // Ensure integer for unsignedTinyInteger
        });
        return response.data;
    } catch (error) {
        if (error.response?.status === 422) {
            // Validation errors
            const errors = error.response.data.errors;
            if (errors.rating) {
                throw new Error('La note doit être entre 1 et 5 étoiles');
            }
            if (errors.text) {
                throw new Error('Le commentaire doit contenir au moins 3 caractères');
            }
        } else if (error.response?.status === 401) {
            throw new Error('Vous devez être connecté pour laisser un commentaire');
        } else if (error.response?.status === 403) {
            throw new Error('Vous devez être inscrit au cours pour laisser un commentaire');
        } else if (error.response?.status === 404) {
            throw new Error('Cours non trouvé');
        } else if (error.response?.status === 500) {
            throw new Error('Erreur serveur - veuillez réessayer plus tard');
        } else {
            throw new Error('Une erreur est survenue lors de l\'envoi du commentaire');
        }
    }
};

/**
 * Get all resources for a course
 * @param {number} courseId - The ID of the course
 * @param moduleId
 * @returns {Promise<Object>} The course resources
 */
export const getCourseResources = async (courseId, moduleId) => {
    try {
        const response = await axios.get(`/learner/courses/${courseId}/${moduleId}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

/**
 * Get a specific resource
 * @param {number} courseId - The ID of the course
 * @param {number} resourceId - The ID of the resource
 * @returns {Promise<Object>} The resource details
 */
export const getCourseResource = async (courseId, resourceId) => {
    try {
        const response = await axios.get(`/api/courses/${courseId}/resources/${resourceId}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

/**
 * Mark a module as completed
 * @param {number} courseId - The ID of the course
 * @param {number} moduleId - The ID of the module to mark as completed
 * @returns {Promise} - The API response
 */
export const markModuleAsCompleted = async (courseId, moduleId) => {
    try {
        console.log('Frontend: Marking module as completed:', { courseId, moduleId });
        const response = await api.post(`/learner/courses/${courseId}/modules/${moduleId}/complete`);
        console.log('Frontend: Module completion response:', response.data);
        
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to mark module as completed');
        }
        
        return response.data;
    } catch (error) {
        console.error('Frontend: Failed to mark module as completed:', error.response?.data || error);
        throw error;
    }
};

const handleApiError = (error) => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server');
    } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(error.message || 'An error occurred');
    }
};

// Personal Information Section
export const updatePersonalInfo = async (formData) => {
    try {
        const response = await api.patch('/learner/personal-info', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (!response.data || !response.data.data) {
            throw new Error('Invalid response format');
        }
        return response.data;
    } catch (error) {
        console.error('Error updating personal info:', error);
        throw error;
    }
};

// Password Section
export const updatePassword = async (data) => {
    const response = await api.patch('/learner/password', data);
    return response.data;
};

// Additional Information Section
export const updateAdditionalInfo = async (data) => {
    const response = await api.patch('/learner/additional-info', data);
    return response.data;
};

// Notifications Section
export const updateNotifications = async (data) => {
    const response = await api.patch('/learner/notifications', data);
    return response.data;
};

export default api;
