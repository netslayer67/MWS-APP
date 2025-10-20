import React, { memo, useMemo } from "react";
import { TrendingUp, Users, Target, AlertCircle } from "lucide-react";

const PercentageAnalytics = memo(({ data = {} }) => {
    const analytics = useMemo(() => {
        if (!data) return null;

        const totalUsers = data.totalUsers || 0;
        const totalCheckins = data.totalCheckins || 0;
        const submissionRate = data.submissionRate || 0;
        const flaggedUsers = data.flaggedUsers?.length || 0;

        // Calculate percentages for different metrics
        const flaggedPercentage = totalUsers > 0 ? Math.round((flaggedUsers / totalUsers) * 100) : 0;
        const participationRate = submissionRate;

        // Mood distribution percentages
        const moodDistribution = data.moodDistribution || {};
        const totalMoods = Object.values(moodDistribution).reduce((sum, count) => sum + count, 0);
        const moodPercentages = Object.entries(moodDistribution).map(([mood, count]) => ({
            mood: mood.charAt(0).toUpperCase() + mood.slice(1),
            count,
            percentage: totalMoods > 0 ? Math.round((count / totalMoods) * 100) : 0
        })).sort((a, b) => b.percentage - a.percentage);

        // Weather distribution percentages
        const weatherDistribution = data.weatherDistribution || {};
        const totalWeather = Object.values(weatherDistribution).reduce((sum, count) => sum + count, 0);
        const weatherPercentages = Object.entries(weatherDistribution).map(([weather, count]) => ({
            weather: weather.charAt(0).toUpperCase() + weather.slice(1),
            count,
            percentage: totalWeather > 0 ? Math.round((count / totalWeather) * 100) : 0
        })).sort((a, b) => b.percentage - a.percentage);

        return {
            participationRate,
            flaggedPercentage,
            moodPercentages,
            weatherPercentages,
            totalUsers,
            totalCheckins,
            flaggedUsers
        };
    }, [data]);

    if (!analytics) return null;

    return (
        <div className="glass glass-card transition-all duration-300">
            <div className="glass__refract" />
            <div className="glass__noise" />

            <div className="relative z-10 p-4 md:p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Target className="w-4 h-4 text-primary" />
                    <h2 className="text-base md:text-lg font-semibold text-foreground">
                        Percentage Analytics
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Participation Rate */}
                    <div className="p-4 rounded-lg bg-card/40 border border-border/40 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">Participation Rate</span>
                            <Users className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-bold text-foreground mb-1">
                            {analytics.participationRate}%
                        </div>
                        <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 ease-out"
                                style={{ width: `${analytics.participationRate}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {analytics.totalCheckins} of {analytics.totalUsers} users
                        </p>
                    </div>

                    {/* Support Needed Rate */}
                    <div className="p-4 rounded-lg bg-card/40 border border-border/40 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">Support Needed</span>
                            <AlertCircle className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="text-2xl font-bold text-foreground mb-1">
                            {analytics.flaggedPercentage}%
                        </div>
                        <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500 ease-out"
                                style={{ width: `${analytics.flaggedPercentage}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {analytics.flaggedUsers} of {analytics.totalUsers} users
                        </p>
                    </div>

                    {/* Top Mood */}
                    <div className="p-4 rounded-lg bg-card/40 border border-border/40 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">Top Mood</span>
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold text-foreground mb-1">
                            {analytics.moodPercentages[0]?.percentage || 0}%
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                            {analytics.moodPercentages[0]?.mood || 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {analytics.moodPercentages[0]?.count || 0} responses
                        </p>
                    </div>

                    {/* Top Weather */}
                    <div className="p-4 rounded-lg bg-card/40 border border-border/40 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">Top Weather</span>
                            <TrendingUp className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="text-2xl font-bold text-foreground mb-1">
                            {analytics.weatherPercentages[0]?.percentage || 0}%
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                            {analytics.weatherPercentages[0]?.weather || 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {analytics.weatherPercentages[0]?.count || 0} responses
                        </p>
                    </div>
                </div>

                {/* Detailed Breakdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Mood Distribution */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-3">Mood Distribution</h3>
                        <div className="space-y-2">
                            {analytics.moodPercentages.slice(0, 5).map((item, index) => (
                                <div key={item.mood} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                                        />
                                        <span className="text-sm text-foreground capitalize">{item.mood}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 bg-muted/30 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-500 ease-out"
                                                style={{ width: `${item.percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground w-8 text-right">
                                            {item.percentage}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weather Distribution */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-3">Weather Distribution</h3>
                        <div className="space-y-2">
                            {analytics.weatherPercentages.slice(0, 5).map((item, index) => (
                                <div key={item.weather} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: `hsl(${index * 45 + 180}, 70%, 50%)` }}
                                        />
                                        <span className="text-sm text-foreground capitalize">{item.weather}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 bg-muted/30 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="h-full bg-secondary transition-all duration-500 ease-out"
                                                style={{ width: `${item.percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground w-8 text-right">
                                            {item.percentage}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

PercentageAnalytics.displayName = 'PercentageAnalytics';

export default PercentageAnalytics;