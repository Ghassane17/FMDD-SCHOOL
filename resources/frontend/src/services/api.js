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
    const endpoint = role === 'learner' ? '/learner/profile' : '/instructor/profile';
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
        const response = await api.patch('/learner/settings', data);
        console.log('Updated learner settings:', response.data);
        settingsCache = null; // Clear cache to fetch updated settings
        return response;
    } catch (error) {
        console.error('Failed to update learner settings');
        throw error;
    }
}; //fix later

export const submitContactForm = async (data) => {
    if (!isAuthenticated()) {
        console.error('Cannot submit contact form: User not authenticated');
        throw new Error('Authentication required');
    }

    try {
        console.log('Submitting contact form with:', data);
        const response = await api.post('/learner/contact', data);
        console.log('Contact form submitted successfully:', response.data);
        return response;
    } catch (error) {
        console.error('Failed to submit contact form');
        throw error;
    }
};

export const getCourseById = async (courseId) => {
    if (!isAuthenticated()) {
        console.error('Cannot fetch course: User not authenticated');
        throw new Error('Authentication required');
    }

    try {
        console.log(`Fetching course with ID: ${courseId}`);
        const response = await api.get(`/courses/${courseId}`);
        console.log('Course fetched:', response.data);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch course with ID ${courseId}:`, error);
        if (error.response?.status === 401) {
            console.error('Unauthorized: Invalid or missing token');
            removeToken();
            removeUser();
        } else if (error.response?.status === 404) {
            console.error('Course not found');
        } else if (error.response?.status === 403) {
            console.error('Forbidden: User not enrolled in course');
        }
        throw error;
    }
};

export default api;
