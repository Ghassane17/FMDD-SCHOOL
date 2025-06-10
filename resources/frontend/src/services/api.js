import axios from 'axios';
import { toast } from 'react-toastify'; // Added for toast notifications

const API_URL = import.meta.env.VITE_BACKEND_URL_API;

// Log API base URL for debugging
console.log('Using API base URL:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    },
    withCredentials: true,
    timeout: 30000,
});

// Request interceptor with enhanced logging
api.interceptors.request.use(
    config => {
        console.log('-------- AXIOS REQUEST --------');
        console.log('URL:', `${config.baseURL}${config.url}`);
        console.log('Method:', config.method?.toUpperCase());

        if (config.data instanceof FormData) {
            console.log('FormData detected - letting Axios set Content-Type');
            delete config.headers['Content-Type'];
        }

        console.log('Headers:', config.headers);

        const logData = { ...config.data };
        if (logData?.password) logData.password = '********';
        if (logData?.current_password) {
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

// Response interceptor with detailed error handling
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
                timeout: error.config.timeout,
            };
        }

        if (error.response) {
            errorInfo.response = {
                status: error.response.status,
                statusText: error.response.statusText,
                headers: error.response.headers,
                data: error.response.data,
            };
        }

        console.error('Detailed Error Information:', errorInfo);

        if (error.code === 'ECONNABORTED') {
            console.error('⚠️ Request timed out - server took too long to respond');
        } else if (error.code === 'ERR_NETWORK') {
            console.error('⚠️ Network error - check your internet connection');
        } else if (error.response?.status === 401) {
            console.error('⚠️ Unauthorized - authentication issue');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } else if (error.response?.status === 403) {
            console.error('⚠️ Forbidden - insufficient permissions');
        } else if (error.response?.status === 404) {
            console.error('⚠️ Resource not found - check API URL');
        } else if (error.response?.status === 422) {
            console.error('⚠️ Validation errors:', error.response.data.errors);
        } else if (error.response?.status >= 500) {
            console.error('⚠️ Server error - check server logs');
        }

        return Promise.reject(error);
    }
);

// Token management utilities
export const getToken = () => localStorage.getItem('token');
export const setToken = token => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');

export const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export const setUser = user => localStorage.setItem('user', JSON.stringify(user));
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
        await api.get('/sanctum/csrf-cookie');
        console.log('CSRF cookie initialized successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize CSRF cookie:', error);
        return false;
    }
};

export const login = async data => {
    clearAllCaches();
    console.log('Preparing login with:', { ...data, password: '********' });

    try {
        console.log('Sending login request to:', `${api.defaults.baseURL}/api/login`);
        const response = await api.post('/login', data);

        console.log('Login response received:', {
            status: response.status,
            message: response.data.message,
            hasToken: !!response.data.token,
            hasUser: !!response.data.user,
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

export const register = async data => {
    try {
        if (data instanceof FormData) {
            const entries = {};
            data.forEach((value, key) => {
                entries[key] = value instanceof File ? '[File]' : value;
            });
            console.log('Sending registration request with:', entries);
        } else {
            console.log('Sending registration request with:', {
                ...data,
                password: '********',
                password_confirmation: '********',
            });
        }

        await initializeCSRF();
        const response = await api.post('/register', data);

        if (response.data.token) {
            setToken(response.data.token);
            console.log('Token stored successfully');
        }

        if (response.data.user) {
            setUser(response.data.user);
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
    const response = await api.patch(endpoint, data);
    return response.data;
};

export const logout = () => {
    removeToken();
    removeUser();
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
        console.log('Returning cached settings');
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

export const submitContactForm = async data => {
    return await api.post('/contact', data);
};

export const courseDetails = async courseId => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
};

export const getExam = async courseId => {
    try {
        if (!getToken()) {
            const error = new Error('Vous devez être connecté.');
            error.status = 401;
            throw error;
        }

        const url = `/courses/${courseId}/exam`;
        console.log('Calling getExam API:', url);
        const response = await api.get(url);

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

export const submitExam = async (courseId, answers) => {
    try {
        if (!getToken()) {
            const error = new Error('Vous devez être connecté.');
            error.status = 401;
            throw error;
        }

        const url = `/courses/${courseId}/exam`;
        console.log('Calling submitExam API:', url, { answers });
        const response = await api.post(url, { answers });

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

export const moduleDetails = async (courseId, moduleId = null) => {
    try {
        if (!getToken()) {
            throw new Error('No authentication token found');
        }
        const url = moduleId ? `/learner/courses/${courseId}/${moduleId}` : `/learner/courses/${courseId}`;
        console.log('🌐 Fetching module details:', url);
        const response = await api.get(url);
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
        if (status >= 500) message = 'Server error occurred while loading the module. Please try again later.';
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

export const getLearnerNotifications = async () => {
    try {
        return await api.get('/learner/notifications');
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

export const markNotificationAsRead = async notificationId => {
    try {
        const response = await api.patch(`/learner/notifications/${notificationId}/read`, {});
        return response;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

export const enrollNow = async courseId => {
    try {
        const response = await api.post(`/courses/${courseId}/enroll`);
        console.log('🌐 Enroll API Response:', response);
        if (!response.data?.message) {
            throw new Error('Invalid enrollment response');
        }
        return response.data;
    } catch (error) {
        console.error('❌ Enroll API Error:', error.response || error);
        throw error;
    }
};

export const leaveCourse = async courseId => {
    try {
        const response = await api.delete(`/courses/${courseId}/leave`);
        console.log('🌐 Leave API Response:', response);
        if (!response.data?.message) {
            throw new Error('Invalid leave response');
        }
        return response.data;
    } catch (error) {
        console.error('❌ Leave API Error:', error.response || error);
        throw error;
    }
};

export const submitComment = async (courseId, commentData) => {
    try {
        const response = await api.post(`/courses/${courseId}/comments`, {
            text: commentData.text,
            rating: Math.round(commentData.rating),
        });
        return response.data;
    } catch (error) {
        const status = error.response?.status;
        const errors = error.response?.data?.errors;

        if (status === 422 && errors) {
            if (errors.rating) throw new Error('La note doit être entre 1 et 5 étoiles');
            if (errors.text) throw new Error('Le commentaire doit contenir au moins 3 caractères');
        } else if (status === 401) {
            throw new Error('Vous devez être connecté pour laisser un commentaire');
        } else if (status === 403) {
            throw new Error('Vous devez être inscrit au cours pour laisser un commentaire');
        } else if (status === 404) {
            throw new Error('Cours non trouvé');
        } else if (status >= 500) {
            throw new Error('Erreur serveur - veuillez réessayer plus tard');
        }
        throw new Error(error.response?.data?.message || 'Une erreur est survenue lors de l\'envoi du commentaire');
    }
};

export const ShowCourseComments = async (courseId) => {
    const response = await api.get(`/courses/${courseId}/comments`); 
    return response.data; 
};

export const getCourseResources = async (courseId, moduleId) => {
    try {
        const response = await api.get(`/learner/courses/${courseId}/${moduleId}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getCourseResource = async (courseId, resourceId) => {
    try {
        const response = await api.get(`/courses/${courseId}/resources/${resourceId}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

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

export const updatePersonalInfo = async formData => {
    try {
        const response = await api.patch('/learner/personal-info', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (!response.data?.data) {
            throw new Error('Invalid response format');
        }
        return response.data;
    } catch (error) {
        console.error('Error updating personal info:', error);
        throw error;
    }
};

export const updatePassword = async data => {
    try {
        const response = await api.patch('/learner/password', data);
        return response.data;
    } catch (error) {
        const status = error.response?.status;
        if (status === 422) {
            throw new Error(error.response.data.errors?.current_password || 'Validation failed');
        } else if (status === 401) {
            throw new Error('Authentication required');
        } else if (status >= 500) {
            throw new Error('Server error - please try again later');
        }
        throw new Error(error.response?.data?.message || 'Failed to update password');
    }
};

export const updateAdditionalInfo = async data => {
    try {
        const response = await api.patch('/learner/additional-info', data);
        return response.data;
    } catch (error) {
        const status = error.response?.status;
        if (status === 422) {
            throw new Error(error.response.data.errors || 'Validation failed');
        } else if (status === 401) {
            throw new Error('Authentication required');
        } else if (status >= 500) {
            throw new Error('Server error - please try again later');
        }
        throw new Error(error.response?.data?.message || 'Failed to update additional info');
    }
};

export const updateNotifications = async data => {
    try {
        const response = await api.patch('/learner/notifications', data);
        return response.data;
    } catch (error) {
        const status = error.response?.status;
        if (status === 422) {
            throw new Error(error.response.data.errors || 'Validation failed');
        } else if (status === 401) {
            throw new Error('Authentication required');
        } else if (status >= 500) {
            throw new Error('Server error - please try again later');
        }
        throw new Error(error.response?.data?.message || 'Failed to update notifications');
    }
};

export const downloadResource = async resourceId => {
    try {
        if (!getToken()) {
            throw new Error('No authentication token found');
        }

        console.log('🌐 Initiating resource download:', { resourceId });
        const response = await api.get('/download-resource', {
            params: { resource_id: resourceId },
            responseType: 'blob',
        });

        const contentType = response.headers['content-type'];
        if (contentType.includes('application/json')) {
            const text = await response.data.text();
            const json = JSON.parse(text);
            if (json.redirect_url) {
                console.log('🌐 Redirecting to external link:', json.redirect_url);
                window.open(json.redirect_url, '_blank');
                toast.success('Opening external resource');
                return { success: true, isRedirect: true };
            }
            throw new Error(json.error || 'Download failed');
        }

        const fileName = response.headers['content-disposition']
            ?.match(/filename="(.+)"/)?.[1] || `resource_${resourceId}`;
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('🌐 Resource downloaded successfully:', { resourceId, fileName });
        toast.success(`Downloaded ${fileName}`);
        return { success: true, isRedirect: false };
    } catch (error) {
        console.error('❌ Resource download error:', error.response || error);
        const message = error.response?.data?.error || error.message || 'Failed to download resource';
        toast.error(message);
        throw new Error(message);
    }
};

const handleApiError = error => {
    if (error.response) {
        throw new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
        throw new Error('No response from server');
    } else {
        throw new Error(error.message || 'An error occurred');
    }
};

export default api;
