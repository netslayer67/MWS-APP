import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import PageLoader from '../components/PageLoader';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const token = searchParams.get('token');
                const userData = searchParams.get('user');

                if (!token || !userData) {
                    console.error('Missing token or user data');
                    navigate('/login?error=missing_data');
                    return;
                }

                const user = JSON.parse(decodeURIComponent(userData));

                console.log('🔐 OAuth login successful:', user.email);

                // Store token
                localStorage.setItem('token', token);
                localStorage.setItem('auth_token', token);
                localStorage.setItem('auth_user', JSON.stringify(user));

                // Update Redux state
                dispatch(loginSuccess({
                    user,
                    token
                }));

                // Redirect to role selection page after OAuth login
                console.log('🔄 Redirecting to role selection after OAuth login');
                navigate('/select-role');

            } catch (error) {
                console.error('Auth callback error:', error);
                navigate('/login?error=callback_failed');
            }
        };

        handleCallback();
    }, [navigate, searchParams, dispatch]);

    return <PageLoader />;
};

export default AuthCallback;