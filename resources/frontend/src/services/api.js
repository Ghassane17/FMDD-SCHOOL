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

export const logout = async () => {
    console.log('Logging out user');

    try {
        if (isAuthenticated()) {
            await api.post('/logout');
            console.log('Server-side logout successful');
        }
    } catch (error) {
        console.error('Server-side logout failed:', error);
    }

    clearAllCaches();
    removeToken();
    removeUser();
    console.log('Client-side logout complete');
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
    if (!isAuthenticated()) {
        console.error('Cannot fetch settings: User not authenticated');
        throw new Error('Authentication required');
    }

    if (!forceRefresh && settingsCache) {
        console.log('Returning cached settings');
        return { data: settingsCache };
    }

    try {
        console.log('Fetching learner settings');
        const response = await api.get('/learner/settings');
        console.log('Fetched learner settings:', response.data);
        settingsCache = response.data;
        return response;
    } catch (error) {
        console.error('Failed to fetch learner settings');
        throw error;
    }
}; //fix later

export const updateLearnerSettings = async (data) => {
    if (!isAuthenticated()) {
        console.error('Cannot update settings: User not authenticated');
        throw new Error('Authentication required');
    }

    try {
        console.log('Updating learner settings with:', {
            ...data,
            current_password: '********',
            new_password: '********',
            new_password_confirmation: '********'
        });

        // Use FormData for file upload
        const formattedData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'avatar' && data[key] instanceof File) {
                formattedData.append('avatar', data[key]);
            } else if (key === 'notifications') {
                formattedData.append(key, JSON.stringify(data[key]));
            } else if (key === 'languages' || key === 'certifications' || key === 'fields_of_interest' || key === 'bank_info') {
                if (data[key] !== null && data[key] !== undefined) {
                    formattedData.append(key, JSON.stringify(data[key]));
                }
            } else if (key === 'current_password' || key === 'new_password' || key === 'new_password_confirmation') {
                if (data[key]) {
                    formattedData.append(key, data[key]);
                }
            } else {
                formattedData.append(key, data[key] !== undefined ? data[key] : '');
            }
        });

        const response = await api.patch('/learner/settings', formattedData, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log('Updated learner settings:', response.data);
        settingsCache = null; // Clear cache
        return response;
    } catch (error) {
        console.error('Failed to update learner settings:', error.response?.data || error.message);
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
export const moduleDetails = async (courseId, moduleId) => {
    try {
        const response = await axios.get(`/api/courses/${courseId}/${moduleId}`);
        return response.data;
    } catch (error) {
        throw error;
    }} ;

// Enroll in a course
export const enrollNow = async (courseId) => {
    try {
        const response = await api.post(`/courses/${courseId}/enroll`);
        return response.data;
    } catch (error) {
        throw error; // Let the caller handle errors
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
        const response = await axios.get('/api/learner/notifications', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response;
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

export const leaveCourse = async (courseId) => {
    try {
        const response = await api.delete(`/courses/${courseId}/leave`);
        return response.data;
    } catch (error) {
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

export default api;
