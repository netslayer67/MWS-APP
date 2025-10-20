import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, allowedRoles = [], allowedDepartments = [], requireDirectorateAcademic = false }) => {
    const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

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

    // Special check for dashboard access (directorate + academic department)
    if (requireDirectorateAcademic) {
        if (user?.role !== 'directorate' || user?.department !== 'Academic') {
            return <Navigate to="/select-role" replace />;
        }
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/select-role" replace />;
    }

    if (allowedDepartments.length > 0 && !allowedDepartments.includes(user?.department)) {
        return <Navigate to="/select-role" replace />;
    }

    return children;
};

export default ProtectedRoute;