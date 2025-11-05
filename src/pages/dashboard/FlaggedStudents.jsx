import React, { memo } from "react";
import { AlertTriangle, Users, UserCheck, Brain, TrendingDown, AlertCircle } from "lucide-react";
import MoodIcon from "./MoodIcon";

const FlaggedUsers = memo(({
    users = [],
    title = "Users Needing Support",
    icon: Icon = AlertTriangle,
    userType = "users",
    showMood = true,
    showMetrics = true
}) => {
    // Transform API flagged users to component format with enhanced AI analysis
    const transformedUsers = users?.map(user => {
        // Generate AI analysis reason based on user data and history
        let aiReason = '';
        const presence = user.presenceLevel || 0;
        const capacity = user.capacityLevel || 0;
        const aiAnalysis = user.aiAnalysis || {};

        // Primary reasons for flagging
        const reasons = [];

        if (presence < 4) reasons.push('Low presence level');
        if (capacity < 4) reasons.push('Low capacity level');
        if (aiAnalysis.needsSupport) reasons.push('AI detected support need');
        if (aiAnalysis.emotionalInstability) reasons.push('Emotional instability detected');
        if (aiAnalysis.trendDecline) reasons.push('Declining emotional trend');

        // Historical analysis (if available)
        if (aiAnalysis.historicalPatterns) {
            if (aiAnalysis.historicalPatterns.consistentLowPresence) reasons.push('Consistently low presence in recent check-ins');
            if (aiAnalysis.historicalPatterns.increasingSupportNeeds) reasons.push('Increasing support requests over time');
            if (aiAnalysis.historicalPatterns.moodVolatility) reasons.push('High mood volatility detected');
        }

        aiReason = reasons.length > 0 ? reasons.join(', ') : 'AI analysis indicates potential support need';

        return {
            id: user.id || user._id,
            name: user.name,
            mood: user.mood || 'sad', // Default mood for flagged users
            lastCheckin: user.lastCheckin || new Date(user.submittedAt).toLocaleDateString(),
            notes: user.notes || (showMetrics ? `Presence: ${user.presenceLevel}/10, Capacity: ${user.capacityLevel}/10` : ''),
            role: user.role,
            department: user.department,
            email: user.email,
            aiReason: aiReason,
            aiAnalysis: aiAnalysis,
            weatherType: user.weatherType,
            selectedMoods: user.selectedMoods || []
        };
    }) || [];

    if (!transformedUsers.length) return null;

    return (
        <div className="glass glass-card transition-all duration-300">
            <div className="glass__refract" />
            <div className="glass__refract--soft" />
            <div className="glass__noise" />

            <div className="relative z-10 p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-primary" />
                        <h2 className="text-base md:text-lg font-semibold text-foreground">
                            {title}
                        </h2>
                    </div>
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                        <span className="text-xs md:text-sm font-bold text-primary">{transformedUsers.length}</span>
                    </div>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mb-4">
                    Teacher/Staff/Student that might need you to check-in with them
                </p>

                <div className="space-y-2 md:space-y-3">
                    {transformedUsers.map((user, index) => (
                        <div
                            key={user.id || user.name}
                            className="p-3 md:p-4 rounded-lg bg-card/40 border border-border/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-card/60 cursor-pointer"
                            style={{ transitionDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-start gap-3">
                                {showMood && (
                                    <MoodIcon mood={user.mood} size="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5" />
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <button
                                            onClick={() => navigate(`/emotional-wellness/${user.userId}`)}
                                            className="font-semibold text-foreground text-sm md:text-base truncate hover:text-primary hover:underline transition-colors text-left"
                                        >
                                            {user.name}
                                        </button>
                                        <span className="text-xs text-muted-foreground flex-shrink-0 px-2 py-1 rounded-full bg-muted/50">
                                            {user.lastCheckin}
                                        </span>
                                    </div>
                                    {user.role && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs text-muted-foreground capitalize">
                                                {user.role}
                                            </span>
                                            {user.department && (
                                                <>
                                                    <span className="text-xs text-muted-foreground">•</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {user.department}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    {user.notes && (
                                        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                            {user.notes}
                                        </p>
                                    )}

                                    {/* Compact AI Analysis and Metrics */}
                                    <div className="mt-2 space-y-1">
                                        {/* AI Analysis Reason */}
                                        {user.aiReason && (
                                            <div className="flex items-start gap-2 text-xs">
                                                <Brain className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-blue-700 leading-tight">{user.aiReason}</span>
                                            </div>
                                        )}

                                        {/* Compact metrics display */}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>P:{user.presenceLevel}/10</span>
                                            <span>•</span>
                                            <span>C:{user.capacityLevel}/10</span>
                                            {user.weatherType && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-purple-600">{user.weatherType}</span>
                                                </>
                                            )}
                                            {user.selectedMoods?.length > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-emerald-600">{user.selectedMoods.slice(0, 2).join(', ')}{user.selectedMoods.length > 2 ? '...' : ''}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {user.supportContact && (
                                        <div className="mt-2 p-2 bg-primary/5 border border-primary/20 rounded text-xs">
                                            <span className="font-medium text-primary">Requested contact: </span>
                                            <span className="text-foreground">{user.supportContact.name}</span>
                                            <span className="text-muted-foreground"> ({user.supportContact.role})</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

FlaggedUsers.displayName = 'FlaggedUsers';

// Backward compatibility
const FlaggedStudents = memo((props) => (
    <FlaggedUsers
        {...props}
        title="Students Needing Support"
        userType="students"
        icon={Users}
    />
));

FlaggedStudents.displayName = 'FlaggedStudents';

export default FlaggedUsers;
export { FlaggedStudents };