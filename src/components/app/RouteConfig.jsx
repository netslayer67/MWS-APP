// RouteConfig.jsx
import React, { Suspense, lazy, memo } from "react";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import PageLoader from "@/components/PageLoader";
import AppLayout from "@/components/Layout/AppLayout";
import PageTransition from "./PageTransition";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProfilePage from "../../pages/ProfilePage";

// Lazy pages (kept as you had them)
const LandingPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/LandingPage'));
const AuthCallback = lazy(() => import(/* webpackPrefetch: true */ '@/pages/AuthCallback'));
const EmotionalCheckinFaceScanPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/VerificationPage'));
const RoleSelectionPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/RoleSelectionPage'));
const RatingPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/RatingPage'));
const EmotionalCheckinPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/EmotionalCheckinPage'));
const EmotionalCheckinStaffPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/EmotionalCheckinStaffPage'));
const EmotionalCheckinDashboard = lazy(() => import(/* webpackPrefetch: true */ '@/pages/EmotionalCheckinDashboard'));
const EmotionalWellnessPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/dashboard/IndividualDashboard'));
const PersonalStatsPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/PersonalStatsPage'));
const EmotionalHistoryPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/EmotionalHistoryPage'));
const EmotionalPatternsPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/EmotionalPatternsPage'));
const UserManagementDashboard = lazy(() => import(/* webpackPrefetch: true */ '@/pages/UserManagementDashboard'));
const NotFound = lazy(() => import(/* webpackPrefetch: true */ '@/pages/NotFound'));

// Keep PageTransition memoized for perf if you want
const MemoizedPageTransition = memo(({ children }) => (
    <PageTransition>{children}</PageTransition>
));
MemoizedPageTransition.displayName = 'MemoizedPageTransition';

// Protected route for admin access
const AdminProtectedRoute = memo(({ children }) => {
    const { user } = useSelector((state) => state.auth);

    const hasAdminAccess = user && (
        user.role === 'directorate' ||
        user.role === 'superadmin' ||
        user.role === 'admin'
    );

    if (!hasAdminAccess) {
        return (
            <MemoizedPageTransition>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="glass glass-card p-8 text-center">
                        <h2 className="text-2xl font-bold text-destructive mb-4">Access Denied</h2>
                        <p className="text-muted-foreground">
                            You don't have permission to access this page.
                        </p>
                    </div>
                </div>
            </MemoizedPageTransition>
        );
    }

    return <MemoizedPageTransition>{children}</MemoizedPageTransition>;
});
AdminProtectedRoute.displayName = 'AdminProtectedRoute';

// ---- Route groups as plain arrays (NOT memoized components) ----
const publicRoutes = [
    <Route key="landing" path="/" element={<MemoizedPageTransition><LandingPage /></MemoizedPageTransition>} />,
    <Route key="auth-callback" path="/auth/callback" element={<MemoizedPageTransition><AuthCallback /></MemoizedPageTransition>} />,
    <Route key="face-scan" path="/emotional-checkin/face-scan" element={<MemoizedPageTransition><EmotionalCheckinFaceScanPage /></MemoizedPageTransition>} />,
    <Route key="select-role" path="/select-role" element={<ProtectedRoute><MemoizedPageTransition><RoleSelectionPage /></MemoizedPageTransition></ProtectedRoute>} />,
    <Route key="profile" path="/profile" element={<ProtectedRoute><MemoizedPageTransition><ProfilePage /></MemoizedPageTransition></ProtectedRoute>} />,
    <Route key="emotional-checkin" path="/emotional-checkin" element={<MemoizedPageTransition><EmotionalCheckinPage /></MemoizedPageTransition>} />,
    <Route key="emotional-checkin-staff" path="/emotional-checkin/staff" element={<ProtectedRoute><MemoizedPageTransition><EmotionalCheckinStaffPage /></MemoizedPageTransition></ProtectedRoute>} />,
    <Route key="rate" path="/emotional-checkin/rate" element={<ProtectedRoute><MemoizedPageTransition><RatingPage /></MemoizedPageTransition></ProtectedRoute>} />,
    <Route key="rate-with-id" path="/emotional-checkin/rate/:checkinId" element={<ProtectedRoute><MemoizedPageTransition><RatingPage /></MemoizedPageTransition></ProtectedRoute>} />,
    <Route key="emotional-checkin-dashboard" path="/emotional-checkin/dashboard" element={<ProtectedRoute requireDirectorateAcademic={true}><MemoizedPageTransition><EmotionalCheckinDashboard /></MemoizedPageTransition></ProtectedRoute>} />,
    <Route key="emotional-wellness" path="/emotional-wellness" element={<ProtectedRoute><MemoizedPageTransition><EmotionalWellnessPage /></MemoizedPageTransition></ProtectedRoute>} />,
    <Route key="emotional-wellness-user" path="/emotional-wellness/:userId" element={<ProtectedRoute><MemoizedPageTransition><EmotionalWellnessPage /></MemoizedPageTransition></ProtectedRoute>} />,
    <Route key="personal-stats" path="/profile/personal-stats" element={<ProtectedRoute><MemoizedPageTransition><PersonalStatsPage /></MemoizedPageTransition></ProtectedRoute>} />,
    <Route key="personal-stats-user" path="/profile/personal-stats/:userId" element={<ProtectedRoute><MemoizedPageTransition><PersonalStatsPage /></MemoizedPageTransition></ProtectedRoute>} />,
    <Route key="emotional-history" path="/profile/emotional-history" element={<ProtectedRoute><MemoizedPageTransition><EmotionalHistoryPage /></MemoizedPageTransition></ProtectedRoute>} />,
    <Route key="emotional-history-user" path="/profile/emotional-history/:userId" element={<ProtectedRoute><MemoizedPageTransition><EmotionalHistoryPage /></MemoizedPageTransition></ProtectedRoute>} />,
    <Route key="emotional-patterns" path="/profile/emotional-patterns" element={<ProtectedRoute><MemoizedPageTransition><EmotionalPatternsPage /></MemoizedPageTransition></ProtectedRoute>} />,
    <Route key="emotional-patterns-user" path="/profile/emotional-patterns/:userId" element={<ProtectedRoute><MemoizedPageTransition><EmotionalPatternsPage /></MemoizedPageTransition></ProtectedRoute>} />,
    <Route key="user-management" path="/user-management" element={<AdminProtectedRoute><UserManagementDashboard /></AdminProtectedRoute>} />,

];



// ---- Main route config ----
const RouteConfig = memo(() => (
    <Suspense fallback={<PageLoader />}>
        <Routes>
            {publicRoutes}
            <Route path="*" element={<MemoizedPageTransition><NotFound /></MemoizedPageTransition>} />
        </Routes>
    </Suspense>
));
RouteConfig.displayName = 'RouteConfig';
export default RouteConfig;
