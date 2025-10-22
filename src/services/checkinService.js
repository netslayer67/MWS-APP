import api from './authService';

// Check-in API functions
export const submitCheckin = async (checkinData) => {
    const response = await api.post('/checkin/submit', checkinData);
    return response;
};

export const getTodayCheckin = async () => {
    const response = await api.get('/checkin/today');
    return response;
};

export const getCheckinResults = async (checkinId) => {
    const response = await api.get(`/checkin/results/${checkinId}`);
    return response;
};

export const getCheckinHistory = async (page = 1, limit = 10) => {
    const response = await api.get('/checkin/history', {
        params: { page, limit }
    });
    return response;
};

export const getTodayCheckinStatus = async () => {
    const response = await api.get('/checkin/today/status');
    return response;
};

// Default export for backward compatibility
const checkinService = {
    submitCheckin,
    getTodayCheckin,
    getCheckinResults,
    getCheckinHistory,
    getTodayCheckinStatus
};

export default checkinService;