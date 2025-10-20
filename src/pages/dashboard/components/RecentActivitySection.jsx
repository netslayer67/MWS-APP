import React, { memo, useState } from "react";
import { Activity, Clock, User, Eye } from "lucide-react";
import UserDetailModal from "./UserDetailModal";

const RecentActivitySection = memo(({ activities = [] }) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!activities || activities.length === 0) return null;

    const handleUserClick = (activity) => {
        setSelectedUser({
            id: activity.id,
            name: activity.userName,
            role: activity.role,
            department: activity.department
        });
        setIsModalOpen(true);
    };

    const getWeatherIcon = (weatherType) => {
        const icons = {
            sunny: "☀️",
            cloudy: "☁️",
            rain: "🌧️",
            storm: "⛈️",
            tornado: "🌪️",
            snow: "❄️"
        };
        return icons[weatherType] || "🌤️";
    };

    return (
        <div className="glass glass-card transition-all duration-300">
            <div className="glass__refract" />
            <div className="glass__noise" />

            <div className="relative z-10 p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-primary" />
                    <h2 className="text-base md:text-lg font-semibold text-foreground">
                        Recent Activity ({activities.length})
                    </h2>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {activities.map((activity, index) => (
                        <div
                            key={activity.id || index}
                            className="flex items-start gap-3 p-3 rounded-lg bg-card/20 border border-border/20 hover:bg-card/40 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-primary" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <button
                                        onClick={() => handleUserClick(activity)}
                                        className="font-medium text-foreground text-sm hover:text-primary transition-colors text-left"
                                    >
                                        {activity.userName}
                                    </button>
                                    <span className="text-xs text-muted-foreground capitalize px-2 py-1 rounded-full bg-muted/50">
                                        {activity.role}
                                    </span>
                                    <span className="text-lg">
                                        {getWeatherIcon(activity.weatherType)}
                                    </span>
                                    <button
                                        onClick={() => handleUserClick(activity)}
                                        className="ml-auto p-1 hover:bg-muted/50 rounded transition-colors"
                                        title="View user details"
                                    >
                                        <Eye className="w-3 h-3 text-muted-foreground" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                                    <span>Presence: {activity.presenceLevel}/10</span>
                                    <span>Capacity: {activity.capacityLevel}/10</span>
                                    {activity.department && (
                                        <span className="capitalize">{activity.department}</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    <span>{new Date(activity.submittedAt).toLocaleString()}</span>
                                </div>

                                {activity.selectedMoods && activity.selectedMoods.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {activity.selectedMoods.slice(0, 3).map((mood, idx) => (
                                            <span
                                                key={idx}
                                                className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize"
                                            >
                                                {mood}
                                            </span>
                                        ))}
                                        {activity.selectedMoods.length > 3 && (
                                            <span className="text-xs text-muted-foreground">
                                                +{activity.selectedMoods.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* User Detail Modal */}
            <UserDetailModal
                user={selectedUser}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedUser(null);
                }}
            />
        </div>
    );
});

RecentActivitySection.displayName = 'RecentActivitySection';

export default RecentActivitySection;