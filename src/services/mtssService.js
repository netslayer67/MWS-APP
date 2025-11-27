import api from './authService';

const withData = (response) => response?.data?.data || {};

const withConfig = (config = {}, params = {}) => ({ params, ...config });

export const fetchMentorAssignments = (params = {}, config = {}) =>
    api.get('/mtss/mentor-assignments', withConfig(config, params)).then(withData);

export const fetchMyAssignedStudents = (config = {}) =>
    api.get('/mtss/mentor-assignments/my/students', config).then(withData);

export const fetchTierMetadata = (config = {}) => api.get('/mtss/tiers', config).then(withData);

export const fetchStrategies = (params = {}, config = {}) =>
    api.get('/mtss/strategies', withConfig(config, params)).then(withData);

export const fetchMtssStudents = (params = {}, config = {}) =>
    api.get('/mtss/students', withConfig(config, params)).then(withData);

export const fetchMtssStudentById = (id, config = {}) => api.get(`/mtss/students/${id}`, config).then(withData);

export const fetchMtssMentors = (params = {}, config = {}) =>
    api.get('/mtss/mentors', withConfig(config, params)).then(withData);

export const createMentorAssignment = (payload, config = {}) =>
    api.post('/mtss/mentor-assignments', payload, config).then(withData);

export const updateMentorAssignment = (id, payload, config = {}) =>
    api.put(`/mtss/mentor-assignments/${id}`, payload, config).then(withData);

export default {
    fetchMentorAssignments,
    fetchMyAssignedStudents,
    fetchTierMetadata,
    fetchStrategies,
    fetchMtssStudents,
    fetchMtssStudentById,
    fetchMtssMentors,
    createMentorAssignment,
    updateMentorAssignment,
};

