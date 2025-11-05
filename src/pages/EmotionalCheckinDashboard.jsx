import React, { useState, memo, useMemo, useCallback, Suspense, lazy, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDashboardStats, setSelectedPeriod, setSelectedDate, removeFlaggedUser } from "../store/slices/dashboardSlice";
import socketService from "../services/socketService";
import { mockData } from "./dashboard/utils";
import AdvancedFilters from "./dashboard/components/AdvancedFilters";
import RealTimeNotifications from "./dashboard/components/RealTimeNotifications";

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
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { stats, loading, error } = useSelector((state) => state.dashboard);

    const { selectedPeriod, selectedDate } = useSelector((state) => state.dashboard);

    // Check if user is head_unit for special UI elements
    const isHeadUnit = user?.role === 'head_unit';
    const [isLoaded, setIsLoaded] = useState(false);
    const [filters, setFilters] = useState({});

    // Performance optimization: Defer heavy operations
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Load dashboard data and set up real-time updates
    useEffect(() => {
        // Check if user has appropriate permissions for dashboard access
        // Allow directorate users, superadmin, admin, or head_unit roles
        const hasDashboardAccess = user && (
            user.role === 'directorate' ||
            user.role === 'superadmin' ||
            user.role === 'admin' ||
            user.role === 'head_unit'
        );

        if (hasDashboardAccess) {
            console.log('Fetching dashboard stats for period:', selectedPeriod, 'User:', user);
            dispatch(fetchDashboardStats({ period: selectedPeriod }));

            // Connect to Socket.io for real-time updates
            socketService.connect();
            socketService.joinDashboard(user.id);

            // Set up real-time listeners
            const handleDashboardUpdate = (data) => {
                console.log('Real-time dashboard update:', data);
                dispatch(fetchDashboardStats({ period: selectedPeriod })); // Refresh data
            };

            const handleNewCheckin = (checkinData) => {
                console.log('New check-in received:', checkinData);
                // Force refresh by clearing cache and refetching
                dispatch(fetchDashboardStats({ period: selectedPeriod, force: true }));
                // Also show a brief notification
                console.log('Dashboard updated with new check-in data');
            };

            const handleUserFlagged = (userData) => {
                console.log('User flagged for support:', userData);
                // Could dispatch a specific action for flagged users
            };

            const handleSupportRequestHandled = (data) => {
                console.log('Support request handled, removing from flagged users:', data);
                dispatch(removeFlaggedUser(data));
            };

            socketService.onDashboardUpdate(handleDashboardUpdate);
            socketService.onNewCheckin(handleNewCheckin);
            socketService.onUserFlagged(handleUserFlagged);
            socketService.onSupportRequestHandled(handleSupportRequestHandled);

            // Cleanup on unmount
            return () => {
                socketService.offDashboardUpdate(handleDashboardUpdate);
                socketService.offNewCheckin(handleNewCheckin);
                socketService.offUserFlagged(handleUserFlagged);
                socketService.offSupportRequestHandled(handleSupportRequestHandled);
                socketService.leaveDashboard();
            };
        } else {
            console.log('User not authorized for dashboard:', { user });
        }
    }, [dispatch, user, selectedPeriod]);

    const handlePeriodChange = useCallback((period) => {
        dispatch(setSelectedPeriod(period));
    }, [dispatch]);

    const handleDateChange = useCallback((date) => {
        dispatch(setSelectedDate(date));
    }, [dispatch]);

    const handleFiltersChange = useCallback((newFilters) => {
        setFilters(newFilters);
        // Refetch data with filters
        dispatch(fetchDashboardStats({ period: selectedPeriod, filters: newFilters }));
    }, [dispatch, selectedPeriod]);

    // Debug: Log current state (remove in production)
    // console.log('Dashboard state:', { stats, loading, error, user });
    // console.log('Selected period:', selectedPeriod);
    // console.log('Stats data:', stats);
    // console.log('Stats.stats:', stats?.stats);

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
                        isHeadUnit={isHeadUnit}
                        userUnit={user?.unit || user?.department}
                    />
                </Suspense>

                {/* Advanced Filters */}
                <div className="flex justify-end mb-4">
                    <AdvancedFilters
                        onFiltersChange={handleFiltersChange}
                        currentFilters={filters}
                    />
                </div>

                <Suspense fallback={<LoadingFallback />}>
                    {/* Primary Navigation Buttons
                    <PrimaryNavButtons
                        onMTSSClick={handleMTSSClick}
                        onDailyCheckinClick={handleDailyCheckinClick}
                    /> */}
                </Suspense>



                {/* Optimized Stats Grid - Commented out as no longer needed
                <Suspense fallback={<LoadingFallback />}>
                    <StatsGrid
                        mockData={mockData}
                        realData={stats?.stats}
                        loading={loading}
                    />
                </Suspense> */}

                {/* Optimized Content Sections */}
                <Suspense fallback={<LoadingFallback />}>
                    <ContentSections
                        mockData={mockData}
                        realData={stats?.stats}
                        loading={loading}
                        selectedPeriod={selectedPeriod}
                        userId={user?.id}
                        isHeadUnit={isHeadUnit}
                    />
                </Suspense>
            </div>

            {/* Real-time Notifications */}
            <RealTimeNotifications socketService={socketService} user={user} />

            {/* Performance Monitor - Development only */}
            <Suspense fallback={null}>
                <PerformanceMonitor />
            </Suspense>
        </div>
    );
});

EmotionalCheckinDashboard.displayName = 'EmotionalCheckinDashboard';
export default EmotionalCheckinDashboard;