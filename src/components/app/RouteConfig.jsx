// RouteConfig.jsx
import React, { Suspense, lazy, memo } from "react";
import { Routes, Route } from "react-router-dom";
import PageLoader from "@/components/PageLoader";
import AppLayout from "@/components/Layout/AppLayout";
import PageTransition from "./PageTransition";

// Lazy pages (kept as you had them)
const LandingPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/LandingPage'));
const EmotionalCheckinFaceScanPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/VerificationPage'));
const RoleSelectionPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/RoleSelectionPage'));
const RoomChat = lazy(() => import(/* webpackPrefetch: true */ '@/pages/RoomChat'));
const RatingPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/RatingPage'));
const EmotionalCheckinPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/EmotionalCheckinPage'));
const EmotionalCheckinStaffPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/EmotionalCheckinStaffPage'));
const EmotionalCheckinDashboard = lazy(() => import(/* webpackPrefetch: true */ '@/pages/EmotionalCheckinDashboard'));
const NotFound = lazy(() => import(/* webpackPrefetch: true */ '@/pages/NotFound'));

// Keep PageTransition memoized for perf if you want
const MemoizedPageTransition = memo(({ children }) => (
    <PageTransition>{children}</PageTransition>
));
MemoizedPageTransition.displayName = 'MemoizedPageTransition';

// ---- Route groups as plain arrays (NOT memoized components) ----
const publicRoutes = [
    <Route key="landing" path="/" element={<MemoizedPageTransition><LandingPage /></MemoizedPageTransition>} />,
    <Route key="face-scan" path="/emotional-checkin/face-scan" element={<MemoizedPageTransition><EmotionalCheckinFaceScanPage /></MemoizedPageTransition>} />,
    <Route key="select-role" path="/select-role" element={<MemoizedPageTransition><RoleSelectionPage /></MemoizedPageTransition>} />,
    <Route key="emotional-checkin" path="/emotional-checkin" element={<MemoizedPageTransition><EmotionalCheckinPage /></MemoizedPageTransition>} />,
    <Route key="emotional-checkin-staff" path="/emotional-checkin/staff" element={<MemoizedPageTransition><EmotionalCheckinStaffPage /></MemoizedPageTransition>} />,
    <Route key="rate" path="/emotional-checkin/rate" element={<MemoizedPageTransition><RatingPage /></MemoizedPageTransition>} />,
    <Route key="emotional-checkin-dashboard" path="/emotional-checkin/dashboard" element={<MemoizedPageTransition><EmotionalCheckinDashboard /></MemoizedPageTransition>} />,
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
