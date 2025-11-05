import React, { memo, useMemo, useState } from "react";
import { TrendingUp, Users, Target, AlertCircle, Download, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import ExportButton from "./ExportButton";
import UserListModal from "./UserListModal";

const PercentageAnalytics = memo(({ data = {}, period }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        users: [],
        totalUsers: 0,
        type: ''
    });

    const analytics = useMemo(() => {
        if (!data) return null;

        const totalUsers = data.totalUsers || 0;
        const totalCheckins = data.totalCheckins || 0;
        const submissionRate = data.submissionRate || 0;
        const flaggedUsers = data.flaggedUsers?.length || 0;

        // Calculate percentages for different metrics
        const flaggedPercentage = totalUsers > 0 ? Math.round((flaggedUsers / totalUsers) * 100) : 0;
        const readinessPercentage = 100 - flaggedPercentage;
        const participationRate = submissionRate;

        // Mood distribution percentages (including AI-detected moods)
        const moodDistribution = data.moodDistribution || {};
        const aiMoodIndicators = data.aiMoodIndicators || {};
        const totalMoods = Object.values(moodDistribution).reduce((sum, count) => sum + count, 0);
        const moodPercentages = Object.entries(moodDistribution).map(([mood, count]) => ({
            mood: mood.charAt(0).toUpperCase() + mood.slice(1),
            count,
            percentage: totalMoods > 0 ? Math.round((count / totalMoods) * 100) : 0,
            isAIGenerated: aiMoodIndicators[mood] || mood.includes('ai') || mood.includes('AI') || mood.includes('detected') // Mark AI-generated moods
        })).sort((a, b) => b.percentage - a.percentage);

        // Weather distribution percentages (including AI-analyzed weather patterns)
        const weatherDistribution = data.weatherDistribution || {};
        const aiWeatherIndicators = data.aiWeatherIndicators || {};
        const totalWeather = Object.values(weatherDistribution).reduce((sum, count) => sum + count, 0);
        const weatherPercentages = Object.entries(weatherDistribution).map(([weather, count]) => ({
            weather: weather.charAt(0).toUpperCase() + weather.slice(1),
            count,
            percentage: totalWeather > 0 ? Math.round((count / totalWeather) * 100) : 0,
            isAIGenerated: aiWeatherIndicators[weather] || weather.includes('ai') || weather.includes('AI') || weather.includes('pattern') || weather.includes('analyzed') // Mark AI-analyzed weather
        })).sort((a, b) => b.percentage - a.percentage);

        // Unit breakdown percentages (changed from role to unit)
        const unitBreakdown = data.unitBreakdown || [];
        const totalUnits = unitBreakdown.reduce((sum, unit) => sum + (unit.submitted || 0), 0);
        const unitPercentages = unitBreakdown.map(unit => ({
            unit: unit.unit || 'Unknown',
            count: unit.submitted || 0,
            percentage: totalUnits > 0 ? Math.round((unit.submitted / totalUnits) * 100) : 0
        })).sort((a, b) => b.percentage - a.percentage);

        // Risk assessment and positive indicators (from PredictiveAnalytics)
        const riskFactors = [];
        const positiveIndicators = [];

        // Calculate support rate for risk assessment
        const supportRate = totalUsers > 0 ? (flaggedUsers / totalUsers) * 100 : 0;

        if (supportRate > 20) {
            riskFactors.push({
                type: 'high',
                title: 'High Support Need',
                message: `${supportRate.toFixed(1)}% of users indicated they need support. Consider proactive outreach.`,
                icon: AlertTriangle,
                color: 'text-red-500'
            });
        }

        if (moodPercentages.some(m => ['sad', 'anxious', 'overwhelmed'].includes(m.mood.toLowerCase()))) {
            riskFactors.push({
                type: 'medium',
                title: 'Emotional Well-being Concerns',
                message: 'Negative mood patterns detected. Monitor closely and consider additional support resources.',
                icon: AlertTriangle,
                color: 'text-yellow-500'
            });
        }

        // Positive indicators
        if (supportRate < 10) {
            positiveIndicators.push({
                title: 'Strong Team Resilience',
                message: 'Low support requests indicate good overall team well-being.',
                icon: CheckCircle,
                color: 'text-green-500'
            });
        }

        if (moodPercentages.some(m => ['happy', 'excited', 'calm'].includes(m.mood.toLowerCase()))) {
            positiveIndicators.push({
                title: 'Positive Team Dynamics',
                message: 'Strong presence of positive moods suggests healthy team environment.',
                icon: CheckCircle,
                color: 'text-green-500'
            });
        }

        return {
            participationRate,
            flaggedPercentage,
            readinessPercentage,
            moodPercentages,
            weatherPercentages,
            unitPercentages,
            totalUsers,
            totalCheckins,
            flaggedUsers,
            riskFactors,
            positiveIndicators,
            moodLists: data.moodLists || {},
            weatherLists: data.weatherLists || {},
            unitLists: data.unitLists || {},
            notSubmittedUsers: data.notSubmittedUsers || []
        };
    }, [data]);

    const handleMoodClick = (moodData) => {
        setModalState({
            isOpen: true,
            title: `${moodData.mood} Mood Users`,
            users: analytics.moodLists[moodData.mood.toLowerCase()] || [],
            totalUsers: analytics.totalCheckins,
            type: 'mood'
        });
    };

    const handleWeatherClick = (weatherData) => {
        setModalState({
            isOpen: true,
            title: `${weatherData.weather} Weather Users`,
            users: analytics.weatherLists[weatherData.weather.toLowerCase()] || [],
            totalUsers: analytics.totalCheckins,
            type: 'weather'
        });
    };

    const handleUnitClick = (unitData) => {
        setModalState({
            isOpen: true,
            title: `${unitData.unit} Unit Users`,
            users: analytics.unitLists[unitData.unit.toLowerCase()] || [],
            totalUsers: analytics.totalCheckins,
            type: 'unit'
        });
    };

    const handleParticipationRateClick = () => {
        // Show users who haven't submitted yet
        const notSubmittedUsers = analytics.totalUsers - analytics.totalCheckins;
        setModalState({
            isOpen: true,
            title: `Users Who Haven't Submitted Yet (${notSubmittedUsers})`,
            users: analytics.notSubmittedUsers || [],
            totalUsers: analytics.totalUsers,
            type: 'not-submitted'
        });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, title: '', users: [], totalUsers: 0, type: '' });
    };

    if (!analytics) return null;

    return (
        <div className="glass glass-card transition-all duration-300">
            <div className="glass__refract" />
            <div className="glass__noise" />

            <div className="relative z-10 p-4 md:p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        <h2 className="text-base md:text-lg font-semibold text-foreground">
                            Overview Analytics
                        </h2>
                    </div>
                    <ExportButton period={period} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Participation Rate */}
                    <div
                        className="p-4 rounded-lg bg-card/40 border border-border/40 backdrop-blur-sm cursor-pointer hover:bg-card/60 transition-colors"
                        onClick={handleParticipationRateClick}
                        title="Click to see users who haven't submitted yet"
                    >
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
                        <p className="text-xs text-blue-600 mt-1 font-medium">
                            Click to view not submitted users
                        </p>
                    </div>

                    {/* Emotional Readiness */}
                    <div className="p-4 rounded-lg bg-card/40 border border-border/40 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">Emotional Readiness</span>
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-bold text-foreground mb-1">
                            {analytics.readinessPercentage}%
                        </div>
                        <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 ease-out"
                                style={{ width: `${analytics.readinessPercentage}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {analytics.totalUsers - analytics.flaggedUsers} of {analytics.totalUsers} users ready
                        </p>
                    </div>

                    {/* Top Mood */}
                    <div className="p-4 rounded-lg bg-card/40 border border-white/20 backdrop-blur-sm">
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
                        {analytics.moodPercentages[0]?.count === 0 && (
                            <div className="mt-2 w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-gray-400 to-gray-300 w-full"></div>
                            </div>
                        )}
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
                        {analytics.weatherPercentages[0]?.count === 0 && (
                            <div className="mt-2 w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-gray-400 to-gray-300 w-full"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Risk Factors & Positive Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Risk Factors */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            Risk Factors
                        </h3>
                        <div className="space-y-2">
                            {analytics.riskFactors?.length > 0 ? (
                                analytics.riskFactors.slice(0, 2).map((risk, index) => (
                                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className={`w-4 h-4 mt-0.5 ${risk.color}`} />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{risk.title}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{risk.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <p className="text-sm text-green-700">No significant risk factors detected</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Positive Indicators */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Positive Indicators
                        </h3>
                        <div className="space-y-2">
                            {analytics.positiveIndicators?.length > 0 ? (
                                analytics.positiveIndicators.slice(0, 2).map((indicator, index) => (
                                    <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle className={`w-4 h-4 mt-0.5 ${indicator.color}`} />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{indicator.title}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{indicator.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-yellow-500" />
                                        <p className="text-sm text-yellow-700">Monitoring for positive indicators</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Detailed Breakdowns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Mood Distribution */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-3">Mood Distribution</h3>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.moodPercentages.slice(0, 5)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="count"
                                        onClick={(data, index) => handleMoodClick(analytics.moodPercentages.slice(0, 5)[index])}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {analytics.moodPercentages.slice(0, 5).map((entry, index) => (
                                            <Cell
                                                key={`mood-${index}`}
                                                fill={`hsl(${index * 60}, 70%, 50%)`}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 space-y-1">
                            {analytics.moodPercentages.slice(0, 5).map((item, index) => (
                                <div key={item.mood} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                                        />
                                        <span className="text-foreground capitalize">
                                            {item.mood}
                                            {item.isAIGenerated && (
                                                <span className="ml-1 text-xs text-blue-600 font-medium">(AI)</span>
                                            )}
                                        </span>
                                    </div>
                                    <span className="text-muted-foreground">
                                        {item.percentage}% ({item.count})
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weather Distribution */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-3">Weather Distribution</h3>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.weatherPercentages.slice(0, 5)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="count"
                                        onClick={(data, index) => handleWeatherClick(analytics.weatherPercentages.slice(0, 5)[index])}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {analytics.weatherPercentages.slice(0, 5).map((entry, index) => (
                                            <Cell
                                                key={`weather-${index}`}
                                                fill={`hsl(${index * 45 + 180}, 70%, 50%)`}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 space-y-1">
                            {analytics.weatherPercentages.slice(0, 5).map((item, index) => (
                                <div key={item.weather} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: `hsl(${index * 45 + 180}, 70%, 50%)` }}
                                        />
                                        <span className="text-foreground capitalize">
                                            {item.weather}
                                            {item.isAIGenerated && (
                                                <span className="ml-1 text-xs text-blue-600 font-medium">(AI)</span>
                                            )}
                                        </span>
                                    </div>
                                    <span className="text-muted-foreground">
                                        {item.percentage}% ({item.count})
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Unit Distribution */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-3">Unit Distribution</h3>
                        <div className="space-y-2">
                            {analytics.unitPercentages.slice(0, 5).map((item, index) => (
                                <div
                                    key={item.unit}
                                    className="flex items-center justify-between cursor-pointer hover:bg-muted/20 p-1 rounded transition-colors"
                                    onClick={() => handleUnitClick(item)}
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: `hsl(${index * 72 + 90}, 70%, 50%)` }}
                                        />
                                        <span className="text-sm text-foreground capitalize">{item.unit}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 bg-muted/30 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="h-full bg-accent transition-all duration-500 ease-out"
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

            <UserListModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                title={modalState.title}
                users={modalState.users}
                totalUsers={modalState.totalUsers}
                type={modalState.type}
            />
        </div>
    );
});

PercentageAnalytics.displayName = 'PercentageAnalytics';

export default PercentageAnalytics;