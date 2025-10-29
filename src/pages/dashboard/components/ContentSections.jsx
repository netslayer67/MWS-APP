import React, { memo, Suspense, lazy } from "react";

// Lazy load components for better performance
const MoodBreakdown = lazy(() =>
    import(/* webpackChunkName: "mood-breakdown" */ "../../dashboard/MoodBreakdown")
);
const InternalWeather = lazy(() =>
    import(/* webpackChunkName: "internal-weather" */ "../../dashboard/InternalWeather")
);
const ThoughtsSection = lazy(() =>
    import(/* webpackChunkName: "thoughts-section" */ "../ThoughtsSection")
);

const NotSubmittedList = lazy(() =>
    import(/* webpackChunkName: "not-submitted" */ "../NotSubmittedList")
);
const FlaggedUsers = lazy(() =>
    import(/* webpackChunkName: "flagged-users" */ "../FlaggedStudents")
);
const CheckInRequests = lazy(() =>
    import(/* webpackChunkName: "check-requests" */ "../CheckInRequests")
);
const InsightsPanel = lazy(() =>
    import(/* webpackChunkName: "insights-panel" */ "./InsightsPanel")
);
const RoleBreakdownChart = lazy(() =>
    import(/* webpackChunkName: "role-breakdown" */ "./RoleBreakdownChart")
);
const ExportButton = lazy(() =>
    import(/* webpackChunkName: "export-button" */ "./ExportButton")
);
const RecentActivitySection = lazy(() =>
    import(/* webpackChunkName: "recent-activity" */ "./RecentActivitySection")
);
const DepartmentAnalytics = lazy(() =>
    import(/* webpackChunkName: "department-analytics" */ "./DepartmentAnalytics")
);
const PercentageAnalytics = lazy(() =>
    import(/* webpackChunkName: "percentage-analytics" */ "./PercentageAnalytics")
);
const UserTrendChart = lazy(() =>
    import(/* webpackChunkName: "user-trend-chart" */ "./UserTrendChart")
);
const MoodTrendAnalysis = lazy(() =>
    import(/* webpackChunkName: "mood-trend-analysis" */ "./MoodTrendAnalysis")
);
const WeatherPatternAnalysis = lazy(() =>
    import(/* webpackChunkName: "weather-pattern-analysis" */ "./WeatherPatternAnalysis")
);
const PredictiveAnalytics = lazy(() =>
    import(/* webpackChunkName: "predictive-analytics" */ "./PredictiveAnalytics")
);
const ComparativeAnalysis = lazy(() =>
    import(/* webpackChunkName: "comparative-analysis" */ "./ComparativeAnalysis")
);
const UserHistorySection = lazy(() =>
    import(/* webpackChunkName: "user-history" */ "./UserHistorySection")
);

// Optimized loading fallback - minimal animations for performance
const ContentFallback = memo(() => (
    <div className="glass glass-card">
        <div className="glass__noise" />
        <div className="p-4 md:p-6">
            <div className="h-4 bg-muted/30 rounded w-1/3 mb-3"></div>
            <div className="h-3 bg-muted/20 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-muted/20 rounded w-2/3"></div>
        </div>
    </div>
));

ContentFallback.displayName = 'ContentFallback';

const ContentSections = memo(({ mockData, realData, loading, selectedPeriod, userId }) => {
    // Use real data if available, otherwise fall back to mock data
    const data = realData || {};

    return (
        <>
            {/* Critical Information - Prioritized at top */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                <Suspense fallback={<ContentFallback />}>
                    {/* Check-in Requests - Prioritized for immediate attention */}
                    <CheckInRequests requests={data?.checkinRequests || []} />
                </Suspense>

                <Suspense fallback={<ContentFallback />}>
                    {/* Flagged Users - Need Support - Prioritized for immediate attention */}
                    <FlaggedUsers users={data?.flaggedUsers || []} />
                </Suspense>
            </div>

            {/* Today's Mood and Internal Weather - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                <Suspense fallback={<ContentFallback />}>
                    <MoodBreakdown
                        moodLists={data?.moodLists || {}}
                        moodDistribution={data?.moodDistribution || {}}
                    />
                </Suspense>

                <Suspense fallback={<ContentFallback />}>
                    <InternalWeather
                        weatherData={data?.weatherDistribution || {}}
                        moodLists={data?.moodLists || {}}
                    />
                </Suspense>
            </div>

            <Suspense fallback={<ContentFallback />}>
                {/* Not Submitted Users */}
                <div className="mb-4 md:mb-6">
                    <NotSubmittedList notSubmitted={data?.notSubmittedUsers || []} />
                </div>
            </Suspense>

            <Suspense fallback={<ContentFallback />}>
                {/* Recent Activity */}
                <div className="mb-4 md:mb-6">
                    <RecentActivitySection activities={data?.recentActivity || []} />
                </div>
            </Suspense>

            <Suspense fallback={<ContentFallback />}>
                {/* Percentage Analytics */}
                <div className="mb-4 md:mb-6">
                    <PercentageAnalytics data={data} period={selectedPeriod} />
                </div>
            </Suspense>

            <Suspense fallback={<ContentFallback />}>
                {/* Department Analytics */}
                <div className="mb-4 md:mb-6">
                    <DepartmentAnalytics departments={data?.departmentBreakdown || []} />
                </div>
            </Suspense>

            <Suspense fallback={<ContentFallback />}>
                {/* Mood Trend Analysis */}
                <div className="mb-4 md:mb-6">
                    <MoodTrendAnalysis data={data} period={selectedPeriod} />
                </div>
            </Suspense>

            {/* <Suspense fallback={<ContentFallback />}>
                Weather Pattern Analysis
                <div className="mb-4 md:mb-6">
                    <WeatherPatternAnalysis data={data} period={selectedPeriod} />
                </div>
            </Suspense> */}

            <Suspense fallback={<ContentFallback />}>
                {/* Predictive Analytics */}
                <div className="mb-4 md:mb-6">
                    <PredictiveAnalytics data={data} period={selectedPeriod} />
                </div>
            </Suspense>

            <Suspense fallback={<ContentFallback />}>
                {/* Comparative Analysis */}
                <div className="mb-4 md:mb-6">
                    <ComparativeAnalysis data={data} currentPeriod={selectedPeriod} />
                </div>
            </Suspense>

            <Suspense fallback={<ContentFallback />}>
                {/* User Trend Analysis */}
                <div className="mb-4 md:mb-6">
                    <UserTrendChart userData={data?.recentActivity || []} period={selectedPeriod} />
                </div>
            </Suspense>

            {/* AI Insights Panel - Trigger-based loading */}
            <Suspense fallback={<ContentFallback />}>
                <InsightsPanel insights={data?.insights || []} />
            </Suspense>

            {/* User Check-in History - Only show if userId is provided (individual dashboard) */}
            {userId && (
                <Suspense fallback={<ContentFallback />}>
                    <div className="mb-4 md:mb-6">
                        <UserHistorySection userId={userId} />
                    </div>
                </Suspense>
            )}
        </>
    );
});

ContentSections.displayName = 'ContentSections';
export default ContentSections;