import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import PageLoader from '../components/PageLoader';
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

                // Use OAuth callback payload directly to avoid auth reset loops.
                let canonicalUser = userFromQuery;

                // Ensure the user has required role field
                if (!canonicalUser.role) {
                    console.error('❌ OAuth callback user missing role field');
                    navigate('/login?error=missing_role');
                    return;
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

                const normalizedRole = (canonicalUser.role || '').toLowerCase();
                const redirectParam = searchParams.get('redirect');
                const safeRedirect = redirectParam && redirectParam.startsWith('/') ? redirectParam : null;
                const target = normalizedRole === 'student' ? '/student/support-hub' : (safeRedirect || '/support-hub');

                navigate(target, { replace: true });

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
