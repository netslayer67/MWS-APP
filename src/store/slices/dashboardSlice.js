import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDashboardStats, getMoodDistribution } from '../../services/dashboardService';

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
    'dashboard/fetchDashboardStats',
    async ({ period = 'today', date, force = false } = {}, { rejectWithValue }) => {
        try {
            const response = await getDashboardStats(period, date, force);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
        }
    }
);

export const fetchMoodDistribution = createAsyncThunk(
    'dashboard/fetchMoodDistribution',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getMoodDistribution();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch mood distribution');
        }
    }
);

// Initial state
const initialState = {
    stats: null,
    moodDistribution: null,
    loading: false,
    error: null,
    lastUpdated: null,
    selectedPeriod: 'today',
    selectedDate: new Date().toISOString().split('T')[0],
};

// Slice
const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        updateStats: (state, action) => {
            state.stats = action.payload;
            state.lastUpdated = new Date().toISOString();
        },
        clearStats: (state) => {
            state.stats = null;
            state.moodDistribution = null;
            state.lastUpdated = null;
        },
        setSelectedPeriod: (state, action) => {
            state.selectedPeriod = action.payload;
        },
        setSelectedDate: (state, action) => {
            state.selectedDate = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch dashboard stats
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload.data;
                state.lastUpdated = new Date().toISOString();
                state.error = null;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch mood distribution
            .addCase(fetchMoodDistribution.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMoodDistribution.fulfilled, (state, action) => {
                state.loading = false;
                state.moodDistribution = action.payload.moodDistribution;
                state.error = null;
            })
            .addCase(fetchMoodDistribution.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, updateStats, clearStats, setSelectedPeriod, setSelectedDate } = dashboardSlice.actions;
export default dashboardSlice.reducer;