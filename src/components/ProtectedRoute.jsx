import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { hasEmotionalDashboardAccess } from '@/utils/accessControl';

const ProtectedRoute = ({
    children,
    allowedRoles = [],
    allowedDepartments = [],
    requireDirectorateAcademic = false,
    accessMatch = 'all',
}) => {
    const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

    // Role-aware fallback: students go to student hub, others to staff hub
    const fallbackPath = user?.role === 'student' ? '/student/support-hub' : '/support-hub';

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Special check for dashboard access (directorate + academic department + head_unit)
    if (requireDirectorateAcademic) {
        if (!hasEmotionalDashboardAccess(user)) {
            return <Navigate to={fallbackPath} replace />;
        }
    }

    const hasRoleRule = allowedRoles.length > 0;
    const hasDepartmentRule = allowedDepartments.length > 0;
    const roleAllowed = !hasRoleRule || allowedRoles.includes(user?.role);
    const departmentAllowed = !hasDepartmentRule || allowedDepartments.includes(user?.department);

    if (accessMatch === 'any' && (hasRoleRule || hasDepartmentRule)) {
        const passesAnyRule =
            (hasRoleRule && roleAllowed) ||
            (hasDepartmentRule && departmentAllowed);

        if (!passesAnyRule) {
            return <Navigate to={fallbackPath} replace />;
        }
    } else {
        if (!roleAllowed || !departmentAllowed) {
            return <Navigate to={fallbackPath} replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
