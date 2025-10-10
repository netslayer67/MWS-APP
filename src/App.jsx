// App.jsx
import React, { Suspense, lazy, useMemo } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Helmet } from 'react-helmet';

import AppLayout from '@/components/Layout/AppLayout';
import PageLoader from '@/components/PageLoader';
import ThemeToggle from '@/components/ThemeToggle';

// Lazy load pages
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const EmotionalCheckinFaceScanPage = lazy(() => import('@/pages/VerificationPage'));
const RoleSelectionPage = lazy(() => import('@/pages/RoleSelectionPage'));
const ClientDashboard = lazy(() => import('@/pages/ClientDashboard'));
const WorkerDashboard = lazy(() => import('@/pages/WorkerDashboard'));
const PostJobPage = lazy(() => import('@/pages/PostJobPage'));
const JobTrackingPage = lazy(() => import('@/pages/JobTrackingPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));
const RoomChat = lazy(() => import('@/pages/RoomChat'));
const WalletPage = lazy(() => import('@/pages/WalletPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const RatingPage = lazy(() => import('@/pages/RatingPage'));
const DisputePage = lazy(() => import('@/pages/DisputePage'));
const HelpCenterPage = lazy(() => import('@/pages/HelpCenterPage'));
const ReferralPage = lazy(() => import('@/pages/ReferralPage'));
const GamificationPage = lazy(() => import('@/pages/GamificationPage'));
const NotificationPage = lazy(() => import('@/pages/NotificationPage'));
const NotificationSettingsPage = lazy(() => import('@/pages/NotificationSettingsPage'));
const HistoryPage = lazy(() => import('@/pages/HistoryPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage'));
const JobPage = lazy(() => import('@/pages/JobPage'));
const JobStatusPage = lazy(() => import('@/pages/JobStatusPage'));
const OffersInboxPage = lazy(() => import('@/pages/OffersInboxPage'));
const SecurityPage = lazy(() => import('@/pages/SecurityPage'));
const EmotionalCheckinPage = lazy(() => import('@/pages/EmotionalCheckinPage'));
const EmotionalCheckinStaffPage = lazy(() => import('@/pages/EmotionalCheckinStaffPage'));
const EmotionalCheckinDashboard = lazy(() => import('@/pages/EmotionalCheckinDashboard'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Smooth, premium duration across the app
const TRANSITION_MS = 320; // 300–350ms sweet spot

// Page transition wrapper — keeps routes lean & consistent
function PageWrapper({ children }) {
    const prefersReducedMotion = useReducedMotion();

    const variants = useMemo(() => ({
        initial: prefersReducedMotion ? {} : { opacity: 0, y: 8 },
        animate: prefersReducedMotion ? {} : { opacity: 1, y: 0 },
        exit: prefersReducedMotion ? {} : { opacity: 0, y: -6 },
    }), [prefersReducedMotion]);

    return (
        <motion.main
            id="content"
            role="main"
            className="relative min-h-screen"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={{ duration: TRANSITION_MS / 1000, ease: 'easeOut' }}
        >
            {children}
        </motion.main>
    );
}

// Decorative but lightweight background using your tokens
function BackgroundDecor() {
    const prefersReducedMotion = useReducedMotion();
    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Subtle grid */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                    backgroundImage:
                        'repeating-linear-gradient(to right, hsl(var(--foreground)/0.045) 0 1px, transparent 1px 56px), repeating-linear-gradient(to bottom, hsl(var(--foreground)/0.045) 0 1px, transparent 1px 56px)',
                }}
            />

            {/* Radial accents */}
            <motion.div
                aria-hidden
                className="absolute -top-24 -left-20 h-80 w-80 rounded-full 
                   bg-[hsl(var(--accent))]/25 blur-3xl z-0"
                initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
                animate={prefersReducedMotion ? {} : { opacity: 0.7, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
            />
            <motion.div
                aria-hidden
                className="absolute bottom-[-4rem] right-[-3rem] h-96 w-96 rounded-full 
                   bg-[hsl(var(--ring))]/25 blur-3xl z-0"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? {} : { opacity: 0.6, y: 0 }}
                transition={{ duration: 0.35, delay: 0.06, ease: 'easeOut' }}
            />
        </div>
    );
}


// Floating utility dock for global actions (Theme)
function UtilityDock() {
    return (
        <div className="fixed bottom-16 right-5 z-50 flex items-center gap-2">
            <ThemeToggle />
        </div>
    );
}

export default function App() {
    const location = useLocation();

    return (
        <>
            <Helmet>
                <title>Kerjain — Dapatkan Bantuan, Tawarkan Jasa</title>
                <meta name="description" content="Kerjain: platform auto-matching untuk tugas mikro hingga proyek makro." />
                <meta property="og:title" content="Kerjain — Dapatkan Bantuan, Tawarkan Jasa" />
                <meta property="og:description" content="Platform auto-matching untuk semua jenis pekerjaan." />
                <meta name="theme-color" content="#090040" />
            </Helmet>

            <a
                href="#content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60]
          focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-2 focus:rounded-lg"
            >
                Lompat ke konten
            </a>

            <div className="relative min-h-screen bg-background text-foreground">
                <BackgroundDecor />

                <AnimatePresence mode="wait">
                    <Suspense fallback={<PageLoader />}>
                        <Routes location={location} key={location.pathname}>
                            {/* Public */}
                            <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
                            <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
                            <Route path="/register" element={<PageWrapper><SignupPage /></PageWrapper>} />
                            <Route path="/emotional-checkin/face-scan" element={<PageWrapper><EmotionalCheckinFaceScanPage /></PageWrapper>} />
                            <Route path="/select-role" element={<PageWrapper><RoleSelectionPage /></PageWrapper>} />
                            <Route path="/job/:id/status" element={<PageWrapper><JobStatusPage /></PageWrapper>} />

                            {/* Protected with AppLayout */}
                            <Route element={<AppLayout />}>
                                {/* Client */}
                                <Route path="/client/dashboard" element={<PageWrapper><ClientDashboard /></PageWrapper>} />
                                <Route path="/client/wallet" element={<PageWrapper><WalletPage role="client" /></PageWrapper>} />
                                <Route path="/client/history" element={<PageWrapper><HistoryPage role="client" /></PageWrapper>} />
                                <Route path="/client/offers" element={<PageWrapper><OffersInboxPage /></PageWrapper>} />

                                {/* Worker */}
                                <Route path="/worker/dashboard" element={<PageWrapper><WorkerDashboard /></PageWrapper>} />
                                <Route path="/worker/jobs" element={<PageWrapper><JobPage /></PageWrapper>} />
                                <Route path="/worker/wallet" element={<PageWrapper><WalletPage role="worker" /></PageWrapper>} />
                                <Route path="/worker/history" element={<PageWrapper><HistoryPage role="worker" /></PageWrapper>} />
                                <Route path="/worker/chat" element={<PageWrapper><ChatPage role="worker" /></PageWrapper>} />

                                {/* Shared */}
                                <Route path="/post-job" element={<PageWrapper><PostJobPage /></PageWrapper>} />
                                <Route path="/job/:id/track" element={<PageWrapper><JobTrackingPage /></PageWrapper>} />
                                <Route path="/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
                                <Route path="/profile/security" element={<PageWrapper><SecurityPage /></PageWrapper>} />
                                <Route path="/job/:id/rate" element={<PageWrapper><RatingPage /></PageWrapper>} />
                                <Route path="/dispute" element={<PageWrapper><DisputePage /></PageWrapper>} />
                                <Route path="/help" element={<PageWrapper><HelpCenterPage /></PageWrapper>} />
                                <Route path="/referral" element={<PageWrapper><ReferralPage /></PageWrapper>} />
                                <Route path="/gamification" element={<PageWrapper><GamificationPage /></PageWrapper>} />
                                <Route path="/notifications" element={<PageWrapper><NotificationPage /></PageWrapper>} />
                                <Route path="/notifications/settings" element={<PageWrapper><NotificationSettingsPage /></PageWrapper>} />
                                <Route path="/emotional-checkin" element={<PageWrapper><EmotionalCheckinPage /></PageWrapper>} />
                                <Route path="/emotional-checkin/staff" element={<PageWrapper><EmotionalCheckinStaffPage /></PageWrapper>} />
                                <Route path="/emotional-checkin/dashboard" element={<PageWrapper><EmotionalCheckinDashboard /></PageWrapper>} />
                            </Route>

                            {/* Standalone */}
                            <Route path="/chat/:id" element={<PageWrapper><RoomChat /></PageWrapper>} />
                            <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
                        </Routes>
                    </Suspense>
                </AnimatePresence>

                <UtilityDock />
            </div>
        </>
    );
}
