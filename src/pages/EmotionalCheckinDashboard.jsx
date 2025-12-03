import React, { useState, memo, useMemo, useCallback, Suspense, lazy, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { fetchDashboardStats, setSelectedPeriod, setSelectedDate, removeFlaggedUser } from "../store/slices/dashboardSlice";
import socketService from "../services/socketService";
import AdvancedFilters from "./dashboard/components/AdvancedFilters";
import RealTimeNotifications from "./dashboard/components/RealTimeNotifications";
import {
    getEmotionalDashboardRole,
    hasEmotionalDashboardAccess,
    hasDelegatedDashboardAccess,
    getDelegatedDashboardDetails
} from "@/utils/accessControl";

// Optimized imports - split into logical components
const PrimaryNavButtons = lazy(() =>
    import(/* webpackChunkName: "nav-buttons" */ "./dashboard/PrimaryNavButtons")
);
const DashboardHeader = lazy(() =>
    import(/* webpackChunkName: "dashboard-header" */ "./dashboard/DashboardHeader")
);
// New optimized component imports
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
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { stats, loading, error, selectedPeriod, selectedDate } = useSelector((state) => state.dashboard);

    const [pendingDate, setPendingDate] = useState(selectedDate);

    const dashboardRole = useMemo(() => getEmotionalDashboardRole(user), [user]);
    const canViewDashboard = useMemo(() => hasEmotionalDashboardAccess(user), [user]);
    const delegatedDashboardDetails = useMemo(() => getDelegatedDashboardDetails(user), [user]);
    const delegatedDashboardAccess = hasDelegatedDashboardAccess(user);

    // Check if user is head_unit for special UI elements
    const isHeadUnit = dashboardRole === 'head_unit';
    const isDirectorate = ['directorate', 'admin', 'superadmin'].includes(dashboardRole || '');
    const [isLoaded, setIsLoaded] = useState(false);
    const [filters, setFilters] = useState({});
    const directorateAutoPeriodApplied = useRef(false);

    // Performance optimization: Defer heavy operations
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setPendingDate(selectedDate);
    }, [selectedDate]);

    // Load dashboard data and set up real-time updates
    useEffect(() => {
        if (!user) return;

        if (canViewDashboard) {
            if (isDirectorate && selectedPeriod === 'today' && !directorateAutoPeriodApplied.current) {
                directorateAutoPeriodApplied.current = true;
                dispatch(setSelectedPeriod('all'));
                return;
            }

            console.log('Fetching dashboard stats for period:', selectedPeriod, 'User:', user);
            dispatch(fetchDashboardStats({ period: selectedPeriod, date: selectedDate }));

            socketService.connect();
            socketService.joinDashboard(user.id);

            const handleDashboardUpdate = (data) => {
                console.log('Real-time dashboard update:', data);
                dispatch(fetchDashboardStats({ period: selectedPeriod, date: selectedDate }));
            };

            const handleNewCheckin = (checkinData) => {
                console.log('New check-in received:', checkinData);
                dispatch(fetchDashboardStats({ period: selectedPeriod, date: selectedDate, force: true }));
                console.log('Dashboard updated with new check-in data');
            };

            const handleUserFlagged = (userData) => {
                console.log('User flagged for support:', userData);
            };

            const handleSupportRequestHandled = (data) => {
                console.log('Support request handled, removing from flagged users:', data);
                dispatch(removeFlaggedUser(data));
            };

            socketService.onDashboardUpdate(handleDashboardUpdate);
            socketService.onNewCheckin(handleNewCheckin);
            socketService.onUserFlagged(handleUserFlagged);
            socketService.onSupportRequestHandled(handleSupportRequestHandled);

            return () => {
                socketService.offDashboardUpdate(handleDashboardUpdate);
                socketService.offNewCheckin(handleNewCheckin);
                socketService.offUserFlagged(handleUserFlagged);
                socketService.offSupportRequestHandled(handleSupportRequestHandled);
                socketService.leaveDashboard();
            };
        }

        console.log('User not authorized for dashboard:', { user });
        navigate('/support-hub', { replace: true });
    }, [canViewDashboard, dispatch, isDirectorate, navigate, selectedPeriod, selectedDate, user]);

    const handlePeriodChange = useCallback((period) => {
        dispatch(setSelectedPeriod(period));
    }, [dispatch]);

    const handleFiltersChange = useCallback((newFilters) => {
        setFilters(newFilters);
        // Refetch data with filters
        dispatch(fetchDashboardStats({ period: selectedPeriod, date: selectedDate, filters: newFilters }));
    }, [dispatch, selectedDate, selectedPeriod]);

    // Debug: Log current state (remove in production)
    // console.log('Dashboard state:', { stats, loading, error, user });
    // console.log('Selected period:', selectedPeriod);
    // console.log('Stats data:', stats);
    // console.log('Dashboard stats:', stats);

    const handleMTSSClick = useCallback(() => {
        navigate('/mtss');
    }, [navigate]);

    const handleDailyCheckinClick = useCallback(() => {
        navigate('/support-hub');
    }, [navigate]);

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

    const handleDateInputChange = useCallback((value) => {
        setPendingDate(value);
    }, []);

    const handleApplyDate = useCallback(() => {
        if (!pendingDate) return;
        dispatch(setSelectedDate(pendingDate));
        dispatch(fetchDashboardStats({ period: selectedPeriod, date: pendingDate }));
    }, [dispatch, pendingDate, selectedPeriod]);

    const isApplyDisabled = useMemo(() => {
        if (selectedPeriod === "all") return true;
        if (!pendingDate) return true;
        return pendingDate === selectedDate;
    }, [pendingDate, selectedDate, selectedPeriod]);

    return (
        <div className="min-h-screen text-foreground relative overflow-hidden">
            {/* Optimized Decorative Elements */}
            <Suspense fallback={null}>
                <DecorativeElements isMobile={isMobile} />
            </Suspense>

            <div className="relative z-10 container-tight py-4 md:py-6">
                {delegatedDashboardAccess && delegatedDashboardDetails && (
                    <div className="glass glass-card p-4 mb-4 flex items-start gap-3 border border-amber-200/70 bg-amber-50/70 dark:bg-amber-500/10">
                        <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-300 mt-0.5" />
                        <div className="text-sm text-muted-foreground">
                            <p className="font-semibold text-foreground">Delegated dashboard access</p>
                            <p>
                                You're viewing the Emotional Check-in Dashboard with the same visibility as{" "}
                                <span className="font-medium text-foreground">
                                    {delegatedDashboardDetails.delegatedFromName || delegatedDashboardDetails.delegatedFromEmail || 'the assigned directorate lead'}
                                </span>
                                . All actions remain logged under your account.
                            </p>
                        </div>
                    </div>
                )}

                <Suspense fallback={<LoadingFallback />}>
                    {/* Dashboard Header */}
                        <DashboardHeader
                            selectedPeriod={selectedPeriod}
                            onPeriodChange={handlePeriodChange}
                            selectedDate={pendingDate}
                            onDateChange={handleDateInputChange}
                            onApplyDate={handleApplyDate}
                            isApplyDisabled={isApplyDisabled}
                            isHeadUnit={isHeadUnit}
                            userUnit={user?.unit || user?.department}
                            isDirectorate={isDirectorate}
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



                {/* Optimized Content Sections */}
                {!stats ? (
                    <LoadingFallback />
                ) : (
                    <Suspense fallback={<LoadingFallback />}>
                        <ContentSections
                            realData={stats}
                            loading={loading}
                            selectedPeriod={selectedPeriod}
                            userId={user?.id}
                            isHeadUnit={isHeadUnit}
                            isDirectorate={isDirectorate}
                        />
                    </Suspense>
                )}
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
