import api from './authService';

// Dashboard API functions
export const getDashboardStats = async (period = 'today', date = null, force = false) => {
    const params = { period };
    if (date) params.date = date;
    if (force) params.force = force; // Add force parameter to bypass cache
    const response = await api.get('/dashboard/stats', { params });
    return response;
};

export const getMoodDistribution = async () => {
    const response = await api.get('/dashboard/moods');
    return response;
};

export const getRecentCheckins = async (params = {}) => {
    const { limit = 20, period, role, department } = params;
    const queryParams = { limit };
    if (period) queryParams.period = period;
    if (role) queryParams.role = role;
    if (department) queryParams.department = department;

    const response = await api.get('/dashboard/checkins', {
        params: queryParams
    });
    return response;
};

export const exportDashboardData = async (period = 'today', format = 'json') => {
    const response = await api.get('/dashboard/export', {
        params: { period, format },
        responseType: format === 'csv' ? 'blob' : 'json'
    });
    return response;
};

export const getUserTrends = async (userId, period = 'month') => {
    const response = await api.get('/dashboard/user-trends', {
        params: { userId, period }
    });
    return response;
};