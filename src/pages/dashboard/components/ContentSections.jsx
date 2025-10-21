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

const ContentSections = memo(({ mockData, realData, loading, selectedPeriod }) => {
    // Use real data if available, otherwise fall back to mock data
    const data = realData || {};

    return (
        <>
            {/* AI Insights Panel */}
            <Suspense fallback={<ContentFallback />}>
                <InsightsPanel insights={data?.insights || []} />
            </Suspense>

            {/* Role Breakdown Chart */}
            <Suspense fallback={<ContentFallback />}>
                <div className="mb-4 md:mb-6">
                    <div className="glass glass-card p-4 md:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-foreground">Role-Based Analytics</h3>
                            <ExportButton period={selectedPeriod} />
                        </div>
                        <RoleBreakdownChart
                            roleBreakdown={data?.roleBreakdown || []}
                            viewMode="bar"
                        />
                    </div>
                </div>
            </Suspense>

            <Suspense fallback={<ContentFallback />}>
                {/* Today's Moods Breakdown */}
                <div className="mb-4 md:mb-6">
                    <MoodBreakdown
                        moodLists={data?.moodLists || {}}
                        moodDistribution={data?.moodDistribution || {}}
                    />
                </div>
            </Suspense>

            <Suspense fallback={<ContentFallback />}>
                {/* Internal Weather */}
                <div className="mb-4 md:mb-6">
                    <InternalWeather
                        weatherData={data?.weatherDistribution || {}}
                        moodLists={data?.moodLists || {}}
                    />
                </div>
            </Suspense>

            <Suspense fallback={<ContentFallback />}>
                {/* Not Submitted Users */}
                <div className="mb-4 md:mb-6">
                    <NotSubmittedList notSubmitted={data?.notSubmittedUsers || []} />
                </div>
            </Suspense>

            <Suspense fallback={<ContentFallback />}>
                {/* Check-in Requests */}
                <div className="mb-4 md:mb-6">
                    <CheckInRequests requests={data?.checkinRequests || []} />
                </div>
            </Suspense>

            <Suspense fallback={<ContentFallback />}>
                {/* Flagged Users */}
                <div className="mb-4 md:mb-6">
                    <FlaggedUsers users={data?.flaggedUsers || []} />
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
                    <PercentageAnalytics data={data} />
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
        </>
    );
});

ContentSections.displayName = 'ContentSections';
export default ContentSections;