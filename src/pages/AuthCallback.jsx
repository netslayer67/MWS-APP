import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import PageLoader from '../components/PageLoader';
import { getCurrentUser } from '@/services/authService';
import { hasEmotionalDashboardAccess, getEmotionalDashboardRole } from '@/utils/accessControl';

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

                // Parse user data from query parameters
                const userFromQuery = JSON.parse(decodeURIComponent(userData));
                console.log('🔐 OAuth login successful for:', userFromQuery.email);
                console.log('📊 Initial user data from backend:', userFromQuery);

                // Persist token for API calls
                localStorage.setItem('token', token);
                localStorage.setItem('auth_token', token);

                // Try to fetch canonical user from backend to get complete user data including role
                let canonicalUser = userFromQuery;
                try {
                    const resp = await getCurrentUser();
                    console.log('🔍 Backend /auth/me response:', resp);

                    // Handle different response structures
                    if (resp?.data?.data?.user) {
                        canonicalUser = resp.data.data.user;
                    } else if (resp?.data?.user) {
                        canonicalUser = resp.data.user;
                    } else if (resp?.data) {
                        canonicalUser = resp.data;
                    }

                    console.log('✅ Canonical user from database:', canonicalUser);
                } catch (e) {
                    console.warn('⚠️ Failed to fetch canonical user via /auth/me:', e);
                    console.log('📋 Using user data from OAuth callback:', userFromQuery);
                }

                // Ensure the user has the required role field and validate
                if (!canonicalUser.role) {
                    console.warn('⚠️ User missing role field, using query data as fallback');
                    canonicalUser = { ...userFromQuery, ...canonicalUser };
                }

                // Log role validation for dashboard access
                const canonicalDashboardRole = getEmotionalDashboardRole(canonicalUser);
                const canViewDashboard = hasEmotionalDashboardAccess(canonicalUser);
                console.log('🎯 Role validation for dashboard access:', {
                    userRole: canonicalUser.role,
                    dashboardRole: canonicalDashboardRole,
                    delegatedFrom: canonicalUser.dashboardAccess?.delegatedFromName || canonicalUser.dashboardAccess?.delegatedFromEmail || null,
                    hasDashboardAccess: canViewDashboard,
                    department: canonicalUser.department,
                    unit: canonicalUser.unit
                });

                // Persist canonical user and update Redux
                localStorage.setItem('auth_user', JSON.stringify(canonicalUser));
                dispatch(loginSuccess({ user: canonicalUser, token }));

                console.log('📱 User state updated in Redux');
                console.log('🎯 Expected dashboard access:', canViewDashboard ? 'YES' : 'NO');

                navigate('/support-hub', { replace: true });

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
