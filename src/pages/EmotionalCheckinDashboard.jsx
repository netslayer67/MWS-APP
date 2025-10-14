import React, { useState, memo, useMemo, useCallback, Suspense, lazy, useEffect } from "react";
import { mockData } from "./dashboard/utils";

// Optimized imports - split into logical components
const PrimaryNavButtons = lazy(() =>
    import(/* webpackChunkName: "nav-buttons" */ "./dashboard/PrimaryNavButtons")
);
const DashboardHeader = lazy(() =>
    import(/* webpackChunkName: "dashboard-header" */ "./dashboard/DashboardHeader")
);

// New optimized component imports
const StatsGrid = lazy(() =>
    import(/* webpackChunkName: "stats-grid" */ "./dashboard/components/StatsGrid")
);
const ContentSections = lazy(() =>
    import(/* webpackChunkName: "content-sections" */ "./dashboard/components/ContentSections")
);
const DecorativeElements = lazy(() =>
    import(/* webpackChunkName: "decorative-elements" */ "./dashboard/components/DecorativeElements")
);
const PerformanceMonitor = lazy(() =>
    import(/* webpackChunkName: "performance-monitor" */ "./dashboard/components/PerformanceMonitor")
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
            {/* Optimized Decorative Elements */}
            <Suspense fallback={null}>
                <DecorativeElements isMobile={isMobile} />
            </Suspense>

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

                {/* Optimized Stats Grid */}
                <Suspense fallback={<LoadingFallback />}>
                    <StatsGrid mockData={mockData} />
                </Suspense>

                {/* Optimized Content Sections */}
                <Suspense fallback={<LoadingFallback />}>
                    <ContentSections mockData={mockData} />
                </Suspense>
            </div>

            {/* Performance Monitor - Development only */}
            <Suspense fallback={null}>
                <PerformanceMonitor />
            </Suspense>
        </div>
    );
});

EmotionalCheckinDashboard.displayName = 'EmotionalCheckinDashboard';
export default EmotionalCheckinDashboard;