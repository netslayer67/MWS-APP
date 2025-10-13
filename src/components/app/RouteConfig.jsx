// RouteConfig.jsx
import React, { Suspense, lazy, memo } from "react";
import { Routes, Route } from "react-router-dom";
import PageLoader from "@/components/PageLoader";
import AppLayout from "@/components/Layout/AppLayout";
import PageTransition from "./PageTransition";

// Lazy pages (kept as you had them)
const LandingPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/LandingPage'));
const LoginPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/LoginPage'));
const EmotionalCheckinFaceScanPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/VerificationPage'));
const RoleSelectionPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/RoleSelectionPage'));
const ClientDashboard = lazy(() => import(/* webpackPrefetch: true */ '@/pages/ClientDashboard'));
const WorkerDashboard = lazy(() => import(/* webpackPrefetch: true */ '@/pages/WorkerDashboard'));
const PostJobPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/PostJobPage'));
const JobTrackingPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/JobTrackingPage'));
const ChatPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/ChatPage'));
const RoomChat = lazy(() => import(/* webpackPrefetch: true */ '@/pages/RoomChat'));
const WalletPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/WalletPage'));
const ProfilePage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/ProfilePage'));
const RatingPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/RatingPage'));
const DisputePage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/DisputePage'));
const HelpCenterPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/HelpCenterPage'));
const ReferralPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/ReferralPage'));
const GamificationPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/GamificationPage'));
const NotificationPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/NotificationPage'));
const NotificationSettingsPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/NotificationSettingsPage'));
const HistoryPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/HistoryPage'));
const SignupPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/SignupPage'));
const JobPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/JobPage'));
const JobStatusPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/JobStatusPage'));
const OffersInboxPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/OffersInboxPage'));
const SecurityPage = lazy(() => import(/* webpackPrefetch: true */ '@/pages/SecurityPage'));
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
    <Route key="login" path="/login" element={<MemoizedPageTransition><LoginPage /></MemoizedPageTransition>} />,
    <Route key="register" path="/register" element={<MemoizedPageTransition><SignupPage /></MemoizedPageTransition>} />,
    <Route key="face-scan" path="/emotional-checkin/face-scan" element={<MemoizedPageTransition><EmotionalCheckinFaceScanPage /></MemoizedPageTransition>} />,
    <Route key="select-role" path="/select-role" element={<MemoizedPageTransition><RoleSelectionPage /></MemoizedPageTransition>} />,
    <Route key="job-status" path="/job/:id/status" element={<MemoizedPageTransition><JobStatusPage /></MemoizedPageTransition>} />,
    <Route key="emotional-checkin" path="/emotional-checkin" element={<MemoizedPageTransition><EmotionalCheckinPage /></MemoizedPageTransition>} />,
    <Route key="emotional-checkin-staff" path="/emotional-checkin/staff" element={<MemoizedPageTransition><EmotionalCheckinStaffPage /></MemoizedPageTransition>} />,
    <Route key="emotional-checkin-dashboard" path="/emotional-checkin/dashboard" element={<MemoizedPageTransition><EmotionalCheckinDashboard /></MemoizedPageTransition>} />
];

const clientRoutes = [
    <Route key="client-dashboard" path="/client/dashboard" element={<MemoizedPageTransition><ClientDashboard /></MemoizedPageTransition>} />,
    <Route key="client-wallet" path="/client/wallet" element={<MemoizedPageTransition><WalletPage role="client" /></MemoizedPageTransition>} />,
    <Route key="client-history" path="/client/history" element={<MemoizedPageTransition><HistoryPage role="client" /></MemoizedPageTransition>} />,
    <Route key="client-offers" path="/client/offers" element={<MemoizedPageTransition><OffersInboxPage /></MemoizedPageTransition>} />
];

const workerRoutes = [
    <Route key="worker-dashboard" path="/worker/dashboard" element={<MemoizedPageTransition><WorkerDashboard /></MemoizedPageTransition>} />,
    <Route key="worker-jobs" path="/worker/jobs" element={<MemoizedPageTransition><JobPage /></MemoizedPageTransition>} />,
    <Route key="worker-wallet" path="/worker/wallet" element={<MemoizedPageTransition><WalletPage role="worker" /></MemoizedPageTransition>} />,
    <Route key="worker-history" path="/worker/history" element={<MemoizedPageTransition><HistoryPage role="worker" /></MemoizedPageTransition>} />,
    <Route key="worker-chat" path="/worker/chat" element={<MemoizedPageTransition><ChatPage role="worker" /></MemoizedPageTransition>} />
];

const sharedRoutes = [
    <Route key="post-job" path="/post-job" element={<MemoizedPageTransition><PostJobPage /></MemoizedPageTransition>} />,
    <Route key="job-track" path="/job/:id/track" element={<MemoizedPageTransition><JobTrackingPage /></MemoizedPageTransition>} />,
    <Route key="profile" path="/profile" element={<MemoizedPageTransition><ProfilePage /></MemoizedPageTransition>} />,
    <Route key="profile-security" path="/profile/security" element={<MemoizedPageTransition><SecurityPage /></MemoizedPageTransition>} />,
    <Route key="job-rate" path="/job/:id/rate" element={<MemoizedPageTransition><RatingPage /></MemoizedPageTransition>} />,
    <Route key="dispute" path="/dispute" element={<MemoizedPageTransition><DisputePage /></MemoizedPageTransition>} />,
    <Route key="help" path="/help" element={<MemoizedPageTransition><HelpCenterPage /></MemoizedPageTransition>} />,
    <Route key="referral" path="/referral" element={<MemoizedPageTransition><ReferralPage /></MemoizedPageTransition>} />,
    <Route key="gamification" path="/gamification" element={<MemoizedPageTransition><GamificationPage /></MemoizedPageTransition>} />,
    <Route key="notifications" path="/notifications" element={<MemoizedPageTransition><NotificationPage /></MemoizedPageTransition>} />,
    <Route key="notifications-settings" path="/notifications/settings" element={<MemoizedPageTransition><NotificationSettingsPage /></MemoizedPageTransition>} />,
];

// ---- Main route config ----
const RouteConfig = memo(() => (
    <Suspense fallback={<PageLoader />}>
        <Routes>
            {/* Public routes (insert array so <Routes> sees raw <Route/> children) */}
            {publicRoutes}

            {/* Protected routes with AppLayout (children must also be <Route/>) */}
            <Route element={<AppLayout />}>
                {clientRoutes}
                {workerRoutes}
                {sharedRoutes}
            </Route>

            {/* Standalone routes */}
            <Route path="/chat/:id" element={<MemoizedPageTransition><RoomChat /></MemoizedPageTransition>} />
            <Route path="*" element={<MemoizedPageTransition><NotFound /></MemoizedPageTransition>} />
        </Routes>
    </Suspense>
));
RouteConfig.displayName = 'RouteConfig';
export default RouteConfig;
