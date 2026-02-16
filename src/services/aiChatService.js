import api from './authService';

const withData = (response) => response?.data?.data || {};

/**
 * Send a message to AI and get response
 */
export const sendChatMessage = (message, sessionId = null) =>
    api.post('/ai-chat/message', { message, sessionId }).then(response => response.data);

/**
 * Get conversation history
 */
export const getConversationHistory = (sessionId, limit = 50) =>
    api.get(`/ai-chat/conversations/${sessionId}`, { params: { limit } }).then(withData);

/**
 * Get user's recent conversations
 */
export const getUserConversations = (limit = 10) =>
    api.get('/ai-chat/conversations', { params: { limit } }).then(withData);

/**
 * Start a new conversation
 */
export const startNewConversation = () =>
    api.post('/ai-chat/conversations/new').then(withData);

/**
 * Archive a conversation
 */
export const archiveConversation = (sessionId) =>
    api.post(`/ai-chat/conversations/${sessionId}/archive`).then(response => response.data);

export default {
    sendChatMessage,
    getConversationHistory,
    getUserConversations,
    startNewConversation,
    archiveConversation
};
