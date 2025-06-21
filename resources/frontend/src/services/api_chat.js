import axios from 'axios';


/**
 * API pour les messages de chat
 */

const apiBaseUrl = import.meta.env.VITE_BACKEND_URL_API ;

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
        if (error.response && error.response.status === 401) {
            // Rediriger vers la page de login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Fonctions pour les messages de chat

/**
 * Récupère les messages de chat pour un cours spécifique
 * @param {number} courseId - L'ID du cours
 * @returns {Promise<Object>} - Les messages de chat
 */
export const getChatMessages = async (courseId) => {
    try {
        const response = await api.get(`/courses/${courseId}/chat`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des messages de chat:', error);
        throw error;
    }
};

/**
 * Envoie un message de chat pour un cours spécifique
 * @param {number} courseId - L'ID du cours
 * @param {string} content - Le contenu du message à envoyer
 * @param {number|null} parentMessageId - L'ID du message parent pour une réponse (optionnel)
 * @returns {Promise<Object>} - Le message envoyé
 */
export const sendChatMessage = async (courseId, content, parentMessageId = null) => {
    try {
        const response = await api.post(`/courses/${courseId}/chat`, { 
            course_id: courseId,
            content: content,
            parent_message_id: parentMessageId
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de l\'envoi d\'un message de chat:', error);
        throw error;
    }
};

/**
 * Met à jour un message de chat
 * @param {number} courseId - L'ID du cours
 * @param {number} messageId - L'ID du message à modifier
 * @param {string} content - Le nouveau contenu du message
 * @returns {Promise<Object>} - Le message mis à jour
 */
export const updateChatMessage = async (courseId, messageId, content) => {
    try {
        const response = await api.put(`/courses/${courseId}/chat/${messageId}`, { 
            content: content
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du message de chat:', error);
        throw error;
    }
};

/**
 * Supprime un message de chat
 * @param {number} courseId - L'ID du cours
 * @param {number} messageId - L'ID du message à supprimer
 * @returns {Promise<Object>} - Confirmation de suppression
 */
export const deleteChatMessage = async (courseId, messageId) => {
    try {
        const response = await api.delete(`/courses/${courseId}/chat/${messageId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la suppression du message de chat:', error);
        throw error;
    }
};

    
