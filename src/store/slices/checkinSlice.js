import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    submitCheckin as submitCheckinApi,
    getTodayCheckin as getTodayCheckinApi,
    getCheckinResults as getCheckinResultsApi,
    getCheckinHistory as getCheckinHistoryApi
} from '../../services/checkinService';

// Async thunks
export const submitCheckin = createAsyncThunk(
    'checkin/submitCheckin',
    async (checkinData, { rejectWithValue }) => {
        try {
            console.log('Submitting check-in data:', checkinData);
            const response = await submitCheckinApi(checkinData);
            console.log('Check-in response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Check-in submission error:', error.response?.data);
            return rejectWithValue(error.response?.data?.message || 'Failed to submit check-in');
        }
    }
);

export const getTodayCheckin = createAsyncThunk(
    'checkin/getTodayCheckin',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getTodayCheckinApi();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch today\'s check-in');
        }
    }
);

export const getCheckinResults = createAsyncThunk(
    'checkin/getCheckinResults',
    async (checkinId, { rejectWithValue }) => {
        try {
            const response = await getCheckinResultsApi(checkinId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch check-in results');
        }
    }
);

export const getCheckinHistory = createAsyncThunk(
    'checkin/getCheckinHistory',
    async ({ page = 1, limit = 10, userId = null } = {}, { rejectWithValue }) => {
        try {
            const response = await getCheckinHistoryApi(page, limit, userId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch check-in history');
        }
    }
);

// Initial state
const initialState = {
    todayCheckin: null,
    checkinResults: null,
    checkinHistory: [],
    currentCheckin: null,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    }
};

// Slice
const checkinSlice = createSlice({
    name: 'checkin',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentCheckin: (state) => {
            state.currentCheckin = null;
        },
        setCurrentCheckin: (state, action) => {
            state.currentCheckin = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Submit check-in
            .addCase(submitCheckin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitCheckin.fulfilled, (state, action) => {
                state.loading = false;
                state.currentCheckin = action.payload.checkin;
                state.todayCheckin = action.payload.checkin;
                state.error = null;
            })
            .addCase(submitCheckin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get today's check-in
            .addCase(getTodayCheckin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTodayCheckin.fulfilled, (state, action) => {
                state.loading = false;
                state.todayCheckin = action.payload.checkin;
                state.error = null;
            })
            .addCase(getTodayCheckin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.todayCheckin = null;
            })
            // Get check-in results
            .addCase(getCheckinResults.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCheckinResults.fulfilled, (state, action) => {
                state.loading = false;
                state.checkinResults = action.payload.data.checkin;
                state.error = null;
            })
            .addCase(getCheckinResults.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.checkinResults = null;
            })
            // Get check-in history
            .addCase(getCheckinHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCheckinHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.checkinHistory = action.payload.data?.checkins || action.payload.checkins || [];
                state.pagination = action.payload.data?.pagination || action.payload.pagination || {
                    page: 1,
                    limit: 10,
                    total: 0,
                    pages: 0
                };
                state.error = null;
            })
            .addCase(getCheckinHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.checkinHistory = [];
            });
    },
});

export const { clearError, clearCurrentCheckin, setCurrentCheckin } = checkinSlice.actions;
export default checkinSlice.reducer;