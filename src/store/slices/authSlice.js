import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginApi, logout as logoutApi, getCurrentUser } from '../../services/authService';

// Async thunks
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            console.log('Attempting login for:', email);
            const response = await loginApi(email, password);
            console.log('Login thunk received:', response.data);
            // Extract data from the nested response structure
            const { data } = response.data;
            console.log('Extracted data:', data);
            return data;
        } catch (error) {
            console.error('Login thunk error:', error);
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await logoutApi();
            return null;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Logout failed');
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getCurrentUser();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
        }
    }
);

// Initial state
const initialState = {
    user: null,
    token: null,
    loading: false,
    error: null,
    isAuthenticated: false,
};

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setUser: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        },
        loginSuccess: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
            // Store in localStorage
            localStorage.setItem('auth_token', action.payload.token);
            localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
            console.log('OAuth login success - Token saved to localStorage:', action.payload.token);
        },
        clearAuth: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
                // Store in localStorage
                localStorage.setItem('auth_token', action.payload.token);
                localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
                console.log('Token saved to localStorage:', action.payload.token);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })
            // Logout
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = null;
                // Clear localStorage
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                // Still clear auth state even if logout API fails
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            })
            // Fetch current user
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            });
    },
});

export const { clearError, setUser, clearAuth, loginSuccess } = authSlice.actions;
export default authSlice.reducer;