import React, { memo, Suspense, lazy } from "react";

// Lazy load components for better performance
const MoodBreakdown = lazy(() =>
    import(/* webpackChunkName: "mood-breakdown" */ "../MoodBreakdown")
);
const InternalWeather = lazy(() =>
    import(/* webpackChunkName: "internal-weather" */ "../InternalWeather")
);
const ThoughtsSection = lazy(() =>
    import(/* webpackChunkName: "thoughts-section" */ "../ThoughtsSection")
);
const CheckInRequests = lazy(() =>
    import(/* webpackChunkName: "check-requests" */ "../CheckInRequests")
);
const NotSubmittedList = lazy(() =>
    import(/* webpackChunkName: "not-submitted" */ "../NotSubmittedList")
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

const ContentSections = memo(({ mockData }) => (
    <>
        <Suspense fallback={<ContentFallback />}>
            {/* Today's Moods Breakdown */}
            <div className="mb-4 md:mb-6">
                <MoodBreakdown
                    moodLists={mockData.today.moodLists}
                    moodDistribution={mockData.today.moodDistribution}
                />
            </div>
        </Suspense>

        <Suspense fallback={<ContentFallback />}>
            {/* Internal Weather */}
            <div className="mb-4 md:mb-6">
                <InternalWeather
                    weatherData={mockData.today.internalWeather}
                    moodLists={mockData.today.moodLists}
                />
            </div>
        </Suspense>

        <Suspense fallback={<ContentFallback />}>
            {/* Share Your Thoughts */}
            <div className="mb-4 md:mb-6">
                <ThoughtsSection thoughts={mockData.today.thoughts} />
            </div>
        </Suspense>

        <Suspense fallback={<ContentFallback />}>
            {/* Check-in Requests */}
            <div className="mb-4 md:mb-6">
                <CheckInRequests requests={mockData.today.checkInRequests} />
            </div>
        </Suspense>

        <Suspense fallback={<ContentFallback />}>
            {/* Not Submitted Yet */}
            <div className="mb-4 md:mb-6">
                <NotSubmittedList notSubmitted={mockData.today.notSubmitted} />
            </div>
        </Suspense>
    </>
));

ContentSections.displayName = 'ContentSections';
export default ContentSections;