import React, { memo, Suspense, lazy } from "react";
import { Users, TrendingUp, AlertTriangle } from "lucide-react";

// Lazy load StatCard for better performance
const StatCard = lazy(() =>
    import(/* webpackChunkName: "stat-card" */ "../StatCard")
);

// Optimized loading fallback - minimal animations for performance
const StatCardFallback = memo(() => (
    <div className="glass glass-card">
        <div className="glass__noise" />
        <div className="p-4 md:p-5">
            <div className="h-4 bg-muted/30 rounded w-1/3 mb-3"></div>
            <div className="h-6 bg-muted/20 rounded w-2/3 mb-2"></div>
            <div className="h-3 bg-muted/20 rounded w-1/2"></div>
        </div>
    </div>
));

StatCardFallback.displayName = 'StatCardFallback';

const StatsGrid = memo(({ mockData }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
        <Suspense fallback={<StatCardFallback />}>
            <StatCard
                icon={Users}
                iconColor="primary"
                title="Submissions"
                value={mockData.today.totalCheckins}
                subtitle="Staff checked in today"
                trend="+12%"
            />
        </Suspense>

        <Suspense fallback={<StatCardFallback />}>
            <StatCard
                icon={TrendingUp}
                iconColor="gold"
                title="Avg. Presence"
                value={`${mockData.today.averagePresence}/10`}
                subtitle="Engagement level"
            />
        </Suspense>

        <Suspense fallback={<StatCardFallback />}>
            <StatCard
                icon={AlertTriangle}
                iconColor="primary"
                title="Avg. Capacity"
                value={`${mockData.today.averageCapacity}/10`}
                subtitle="Workload bandwidth"
            />
        </Suspense>
    </div>
));

StatsGrid.displayName = 'StatsGrid';
export default StatsGrid;