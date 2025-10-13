import React, { memo, useState } from "react";
import { ChevronDown, ChevronUp, Users } from "lucide-react";
import MoodIcon from "./MoodIcon";

const MoodBreakdown = memo(({ moodLists, moodDistribution }) => {
    const [expandedMood, setExpandedMood] = useState(null);

    const moodCategories = [
        { key: "excited", label: "Excited", color: "gold", icon: "⚡" },
        { key: "happy", label: "Happy", color: "emerald", icon: "😊" },
        { key: "calm", label: "Calm", color: "emerald", icon: "🧘" },
        { key: "hopeful", label: "Hopeful", color: "emerald", icon: "🌈" },
        { key: "tired", label: "Tired", color: "muted", icon: "😴" },
        { key: "hungry", label: "Hungry", color: "muted", icon: "🍽️" },
        { key: "lonely", label: "Lonely", color: "muted", icon: "🤝" },
        { key: "scattered", label: "Scattered", color: "muted", icon: "💭" },
        { key: "anxious", label: "Anxious", color: "primary", icon: "😰" },
        { key: "sad", label: "Sad", color: "primary", icon: "😢" },
        { key: "fear", label: "Fear", color: "primary", icon: "😨" },
        { key: "overwhelmed", label: "Overwhelmed", color: "primary", icon: "😵" }
    ];

    const toggleMood = (moodKey) => {
        setExpandedMood(expandedMood === moodKey ? null : moodKey);
    };

    return (
        <div className="glass glass-card transition-all duration-300">
            <div className="glass__refract" />
            <div className="glass__noise" />

            <div className="relative z-10 p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-primary" />
                    <h2 className="text-base md:text-lg font-semibold text-foreground">
                        Today's Moods
                    </h2>
                </div>

                <div className="space-y-2">
                    {moodCategories.map(({ key, label, color, icon }) => {
                        const count = moodDistribution[key] || 0;
                        const names = moodLists[key] || [];
                        const isExpanded = expandedMood === key;

                        if (count === 0) return null;

                        return (
                            <div key={key} className="glass glass-card transition-all duration-300">
                                <div className="glass__refract" />
                                <div className="glass__noise" />

                                <div className="relative z-10">
                                    <button
                                        onClick={() => toggleMood(key)}
                                        className="w-full p-3 md:p-4 text-left transition-all duration-300 rounded-lg"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">{icon}</span>
                                                <div>
                                                    <span className="font-medium text-foreground">{label}</span>
                                                    <span className="ml-2 text-sm text-muted-foreground">
                                                        {count} {count === 1 ? 'person' : 'people'}
                                                    </span>
                                                </div>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </button>

                                    {isExpanded && names.length > 0 && (
                                        <div className="px-3 md:px-4 pb-3 md:pb-4">
                                            <div className="border-t border-border/30 pt-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {names.map((name, index) => (
                                                        <div
                                                            key={index}
                                                            className="text-sm text-muted-foreground bg-card/20 px-2 py-1 rounded border border-border/20"
                                                        >
                                                            {name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

MoodBreakdown.displayName = 'MoodBreakdown';
export default MoodBreakdown;