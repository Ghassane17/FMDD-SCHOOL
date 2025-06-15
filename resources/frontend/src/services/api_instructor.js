import axios from 'axios';

// Déterminer l'URL de base et l'afficher explicitement
const apiBaseUrl = import.meta.env.VITE_BACKEND_URL_API ;
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
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        // Create a new axios instance with multipart/form-data for file uploads
        const uploadApi = axios.create({
            baseURL: apiBaseUrl,
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true,
            timeout: 30000,
        });
        const response = await uploadApi.post('/instructor/profile', profileData);
        return response.data;
    } catch (error) {
        console.error('Error updating instructor profile:', error);
        if (error.response?.data?.errors) {
            // Handle validation errors
            const validationErrors = error.response.data.errors;
            const errorMessage = Object.entries(validationErrors)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('\n');
            throw new Error(errorMessage);
        }
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
 * Get all content course
 *
 * @param {string} courseId - The ID of the course to fetch
 * @returns {Promise} Promise object containing the course data
 */

export const getAllContentCourse = async (courseId) => {
    try {
        const response = await api.get(`/instructor/courses/${courseId}/content`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all content course:', error);
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
 * Update course functions
 * @param {string} courseId - The ID of the course to update
 * @param {Object} overviewData - The overview data to update
 * @returns {Promise} Promise object containing the updated course data
 */
// ─── Update course overview ──────────────────────────────────────────
export const updateCourseOverview = async (courseId, overviewData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        // Create a new axios instance with multipart/form-data for file uploads
        const uploadApi = axios.create({
            baseURL: apiBaseUrl,
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true,
            timeout: 30000,
        });
        const response = await uploadApi.post(`/instructor/courses/${courseId}/overview`, overviewData);
        return response.data;
    } catch (error) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        console.error('Error updating course overview:', error);
        throw error;
    }
};

// ─── Update course resources ──────────────────────────────────────────

export const updateCourseResources = async (courseId, resourcesData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        // Create FormData object
        const formData = new FormData();
        
        // Add resources array to formData
        if (Array.isArray(resourcesData) && resourcesData.length > 0) {
            resourcesData.forEach((resource, index) => {
                // Add each resource property
                formData.append(`resources[${index}][name]`, resource.name);
                formData.append(`resources[${index}][type]`, resource.type);
                
                // Handle file uploads
                if (['pdf', 'video', 'image'].includes(resource.type) && resource.file) {
                    formData.append(`resources[${index}][file]`, resource.file);
                }
                
                // Handle URLs for links and other types
                if (['link', 'other'].includes(resource.type) && resource.url) {
                    formData.append(`resources[${index}][url]`, resource.url);
                }
            });
        } else {
            // If no resources provided, send empty array
            formData.append('resources[]', ''); // This will be interpreted as an empty array by Laravel
        }

        // Log the form data for debugging
        console.log('Sending form data:', {
            resources: resourcesData,
            formDataEntries: Array.from(formData.entries())
        });

        // Create a new axios instance with multipart/form-data for file uploads
        const uploadApi = axios.create({
            baseURL: apiBaseUrl,
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true,
            timeout: 120000, // 2 minutes timeout for file uploads
        });

        const response = await uploadApi.post(`/instructor/courses/${courseId}/resources`, formData);
        return response.data;
    } catch (error) {
        console.error('Error updating course resources:', error);
        if (error.response?.data) {
            // Log the full error response
            console.error('Error response:', error.response.data);
            throw new Error(error.response.data.error || error.response.data.message || 'Failed to update resources');
        }
        throw error;
    }
};

// ─── Update course exam ──────────────────────────────────────────

export const updateCourseExam = async (courseId, examData, durationMin) => {
    try {
        const response = await api.patch(`/instructor/courses/${courseId}/exam`, {
            exam: examData,
            duration_min: durationMin
        });
        return response.data;
    } catch (error) {
        console.error('Error updating course exam:', error);
        throw error;
    }
};

// ─── Update course modules ──────────────────────────────────────────

export const updateCourseModules = async (courseId, modulesData, durationMin) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        // Create FormData object
        const formData = new FormData();
        
        // Add duration_min
        formData.append('duration_min', durationMin);

        // Add modules data
        if (Array.isArray(modulesData) && modulesData.length > 0) {
            modulesData.forEach((module, index) => {
                // Add basic module properties
                formData.append(`modules[${index}][title]`, module.title);
                formData.append(`modules[${index}][type]`, module.type);
                formData.append(`modules[${index}][order]`, module.order);
                formData.append(`modules[${index}][duration_min]`, module.duration_min || 0);

                // Handle text content for text modules
                if (module.type === 'text' && module.text_content) {
                    formData.append(`modules[${index}][text_content]`, module.text_content);
                }

                // Handle file uploads for file-based modules
                if (['pdf', 'video', 'image'].includes(module.type) && module.file) {
                    // Ensure we're sending the file with the correct field name
                    formData.append(`modules[${index}][file]`, module.file);
                }

                // Handle quiz questions
                if (module.type === 'quiz' && module.quiz_questions) {
                    module.quiz_questions.forEach((question, qIndex) => {
                        formData.append(`modules[${index}][quiz_questions][${qIndex}][question]`, question.question);
                        formData.append(`modules[${index}][quiz_questions][${qIndex}][options]`, JSON.stringify(question.options));
                        formData.append(`modules[${index}][quiz_questions][${qIndex}][correct_option]`, question.correct_option);
                    });
                }

                // Add module ID if it exists (for existing modules)
                if (module.id) {
                    formData.append(`modules[${index}][id]`, module.id);
                }
            });
        }

        // Create a new axios instance with multipart/form-data for file uploads
        const uploadApi = axios.create({
            baseURL: apiBaseUrl,
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true,
            timeout: 120000, // 2 minutes timeout for file uploads
        });

        // Log the form data for debugging
        console.log('Sending modules data:', {
            modules: modulesData,
            formDataEntries: Array.from(formData.entries())
        });

        const response = await uploadApi.post(`/instructor/courses/${courseId}/modules`, formData);
        return response.data;
    } catch (error) {
        console.error('Error updating course modules:', error);
        if (error.response?.data) {
            // Log the full error response
            console.error('Error response:', error.response.data);
            throw new Error(error.response.data.message || 'Failed to update modules');
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

/**
 * Get comment replies
 * @param {string} commentId - The ID of the comment to fetch replies for
 * @returns {Promise} Promise object containing the comment replies data
 */

export const getCommentReplies = async (commentId) => {
    try {
        const response = await api.get(`/comments/${commentId}/replies`);
        return response.data;
    } catch (error) {
        console.error('Error fetching comment replies:', error);
        throw error;
    }
};

/**
 * Store a new comment reply
 * @param {string} commentId - The ID of the comment to store the reply for
 * @param {Object} replyData - The reply data to store
 * @returns {Promise} Promise object containing the stored reply data
 */

export const storeCommentReply = async (commentId, replyData) => {
    try {
        const response = await api.post(`/comments/${commentId}/replies`, replyData);
        return response.data;
    } catch (error) {
        console.error('Error storing comment reply:', error);
        throw error;
    }
};

/**
 * Delete a comment reply
 * @param {string} replyId - The ID of the reply to delete
 * @returns {Promise} Promise object containing the deletion result
 */

export const deleteCommentReply = async (replyId) => {
    try {
        const response = await api.delete(`/replies/${replyId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting comment reply:', error);
        throw error;
    }
};

// ─── Notifications functions ──────────────────────────────────────────

export const getNotifications = async () => {
    try {
        const response = await api.get('/instructor/notifications');
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

export const getNavbarNotifications = async () => {
    try {
        const response = await api.get('/instructor/navbar-notifications');
        return response.data;
    } catch (error) {
        console.error('Error fetching navbar notifications:', error);
        throw error;
    }
};

export const markNotificationAsRead = async (notificationId) => {
    try {
        const response = await api.patch(`/instructor/notifications/${notificationId}/read`);
        return response.data;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

export const markAllNotificationsAsRead = async () => {
    try {
        const response = await api.patch('/instructor/notifications/mark-all-read');
        return response.data;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
};

export const deleteNotification = async (notificationId) => {
    try {
        const response = await api.delete(`/instructor/notifications/${notificationId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
};

export const deleteAllNotifications = async () => {
    try {
        const response = await api.delete('/instructor/notifications');
        return response.data;
    } catch (error) {
        console.error('Error deleting all notifications:', error);
        throw error;
    }
};