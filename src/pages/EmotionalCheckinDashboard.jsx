import React, { useState, memo, useMemo, useCallback, Suspense, lazy, useEffect } from "react";
import { Users, TrendingUp, AlertTriangle } from "lucide-react";
import { mockData } from "./dashboard/utils";

// Dynamic imports for aggressive code splitting with webpack chunk names
const PrimaryNavButtons = lazy(() =>
    import(/* webpackChunkName: "nav-buttons" */ "./dashboard/PrimaryNavButtons")
);
const DashboardHeader = lazy(() =>
    import(/* webpackChunkName: "dashboard-header" */ "./dashboard/DashboardHeader")
);
const StatCard = lazy(() =>
    import(/* webpackChunkName: "stat-card" */ "./dashboard/StatCard")
);
const MoodBreakdown = lazy(() =>
    import(/* webpackChunkName: "mood-breakdown" */ "./dashboard/MoodBreakdown")
);
const InternalWeather = lazy(() =>
    import(/* webpackChunkName: "internal-weather" */ "./dashboard/InternalWeather")
);
const CheckInRequests = lazy(() =>
    import(/* webpackChunkName: "check-requests" */ "./dashboard/CheckInRequests")
);
const NotSubmittedList = lazy(() =>
    import(/* webpackChunkName: "not-submitted" */ "./dashboard/NotSubmittedList")
);
const ThoughtsSection = lazy(() =>
    import(/* webpackChunkName: "thoughts-section" */ "./dashboard/ThoughtsSection")
);

/* --- Main Dashboard --- */
const EmotionalCheckinDashboard = memo(function EmotionalCheckinDashboard() {
    const [selectedPeriod, setSelectedPeriod] = useState("today");
    const [selectedDate, setSelectedDate] = useState("2025-10-13");
    const [isLoaded, setIsLoaded] = useState(false);

    // Performance optimization: Defer heavy operations
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handlePeriodChange = useCallback((period) => {
        setSelectedPeriod(period);
    }, []);

    const handleDateChange = useCallback((date) => {
        setSelectedDate(date);
    }, []);

    const handleMTSSClick = useCallback(() => {
        // Navigate to MTSS system
        console.log('Navigate to MTSS');
    }, []);

    const handleDailyCheckinClick = useCallback(() => {
        // Navigate to daily check-in management
        console.log('Navigate to Daily Check-in');
    }, []);

    // Optimized loading fallback component - reduced animations for performance
    const LoadingFallback = memo(() => (
        <div className="glass glass-card">
            <div className="glass__refract" />
            <div className="glass__noise" />
            <div className="p-6 space-y-4">
                <div className="h-4 bg-muted/30 rounded w-1/3"></div>
                <div className="h-3 bg-muted/20 rounded w-1/2"></div>
                <div className="h-3 bg-muted/20 rounded w-2/3"></div>
            </div>
        </div>
    ));

    LoadingFallback.displayName = 'LoadingFallback';

    // Performance optimization: Reduce GPU-intensive animations on mobile
    const isMobile = useMemo(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth < 768;
        }
        return false;
    }, []);

    return (
        <div className="min-h-screen text-foreground relative overflow-hidden">
            {/* Decorative Elements - Optimized for performance */}
            <div className="fixed inset-0 pointer-events-none">
                {/* Grid Pattern - Static, no animation */}
                <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `
                            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                        `,
                        backgroundSize: '32px 32px'
                    }} />
                </div>

                {/* Animated Blobs - Reduced on mobile for performance */}
                {!isMobile && (
                    <>
                        <div className="absolute -top-32 -left-32 w-80 h-80 md:w-96 md:h-96 bg-primary/8 rounded-full blur-3xl animate-blob-left" />
                        <div className="absolute -bottom-32 -right-32 w-72 h-72 md:w-80 md:h-80 bg-gold/6 rounded-full blur-3xl animate-blob-right" />
                        <div className="absolute top-1/3 right-1/4 w-64 h-64 md:w-72 md:h-72 bg-emerald/5 rounded-full blur-3xl animate-blob-left" style={{ animationDelay: '3s' }} />
                    </>
                )}
            </div>

            <div className="relative z-10 container-tight py-4 md:py-6">
                <Suspense fallback={<LoadingFallback />}>
                    {/* Dashboard Header */}
                    <DashboardHeader
                        selectedPeriod={selectedPeriod}
                        onPeriodChange={handlePeriodChange}
                        selectedDate={selectedDate}
                        onDateChange={handleDateChange}
                    />
                </Suspense>

                <Suspense fallback={<LoadingFallback />}>
                    {/* Primary Navigation Buttons */}
                    <PrimaryNavButtons
                        onMTSSClick={handleMTSSClick}
                        onDailyCheckinClick={handleDailyCheckinClick}
                    />
                </Suspense>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
                    <Suspense fallback={<LoadingFallback />}>
                        <StatCard
                            icon={Users}
                            iconColor="primary"
                            title="Submissions"
                            value={mockData.today.totalCheckins}
                            subtitle="Staff checked in today"
                            trend="+12%"
                        />
                    </Suspense>

                    <Suspense fallback={<LoadingFallback />}>
                        <StatCard
                            icon={TrendingUp}
                            iconColor="gold"
                            title="Avg. Presence"
                            value={`${mockData.today.averagePresence}/10`}
                            subtitle="Engagement level"
                        />
                    </Suspense>

                    <Suspense fallback={<LoadingFallback />}>
                        <StatCard
                            icon={AlertTriangle}
                            iconColor="primary"
                            title="Avg. Capacity"
                            value={`${mockData.today.averageCapacity}/10`}
                            subtitle="Workload bandwidth"
                        />
                    </Suspense>
                </div>

                <Suspense fallback={<LoadingFallback />}>
                    {/* Today's Moods Breakdown */}
                    <div className="mb-4 md:mb-6">
                        <MoodBreakdown
                            moodLists={mockData.today.moodLists}
                            moodDistribution={mockData.today.moodDistribution}
                        />
                    </div>
                </Suspense>

                <Suspense fallback={<LoadingFallback />}>
                    {/* Internal Weather */}
                    <div className="mb-4 md:mb-6">
                        <InternalWeather
                            weatherData={mockData.today.internalWeather}
                            moodLists={mockData.today.moodLists}
                        />
                    </div>
                </Suspense>

                <Suspense fallback={<LoadingFallback />}>
                    {/* Share Your Thoughts */}
                    <div className="mb-4 md:mb-6">
                        <ThoughtsSection thoughts={mockData.today.thoughts} />
                    </div>
                </Suspense>

                <Suspense fallback={<LoadingFallback />}>
                    {/* Check-in Requests */}
                    <div className="mb-4 md:mb-6">
                        <CheckInRequests requests={mockData.today.checkInRequests} />
                    </div>
                </Suspense>

                <Suspense fallback={<LoadingFallback />}>
                    {/* Not Submitted Yet */}
                    <div className="mb-4 md:mb-6">
                        <NotSubmittedList notSubmitted={mockData.today.notSubmitted} />
                    </div>
                </Suspense>
            </div>
        </div>
    );
});

EmotionalCheckinDashboard.displayName = 'EmotionalCheckinDashboard';
export default EmotionalCheckinDashboard;