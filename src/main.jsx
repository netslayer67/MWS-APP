import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { fetchCurrentUser } from './store/slices/authSlice';
import App from '@/App';
import '@/index.css';
import 'leaflet/dist/leaflet.css';
import { Toaster } from '@/components/ui/toaster';
import { syncInitialTheme } from '@/lib/theme';

syncInitialTheme();

// Initialize auth state from localStorage
const token = localStorage.getItem('auth_token');
const user = localStorage.getItem('auth_user');

console.log('Initializing app - localStorage values:', { token: !!token, user: !!user });

if (token && user) {
    try {
        const userData = JSON.parse(user);
        console.log('Restoring auth state:', { user: userData.name, token: token.substring(0, 20) + '...' });
        store.dispatch({
            type: 'auth/setUser',
            payload: { user: userData, token }
        });
        // Validate token and refresh user profile from backend
        store.dispatch(fetchCurrentUser());
    } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    }
} else {
    console.log('No stored auth data found');
}

// Service worker registration is handled by Vite PWA plugin

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <App />
                <Toaster />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
);
