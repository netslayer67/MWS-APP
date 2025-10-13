import React, { useState, memo, useMemo } from "react";
import { TrendingUp, Users, AlertTriangle, Smile, Frown, Meh, Heart, ArrowUpRight, Calendar, Filter } from "lucide-react";

/* --- Mock Data --- */
const mockData = {
    today: {
        totalCheckins: 28,
        averageMood: "okay",
        flaggedStudents: 3,
        moodDistribution: { happy: 12, excited: 5, okay: 8, sad: 3 }
    },
    weekly: [
        { day: "Mon", checkins: 25, flagged: 2 },
        { day: "Tue", checkins: 28, flagged: 1 },
        { day: "Wed", checkins: 22, flagged: 4 },
        { day: "Thu", checkins: 30, flagged: 2 },
        { day: "Fri", checkins: 26, flagged: 3 },
        { day: "Sat", checkins: 15, flagged: 1 },
        { day: "Sun", checkins: 18, flagged: 2 }
    ],
    flaggedStudents: [
        { name: "Alice Johnson", mood: "sad", lastCheckin: "2h ago", notes: "Overwhelmed with assignments" },
        { name: "Bob Smith", mood: "sad", lastCheckin: "4h ago", notes: "Friend conflicts" },
        { name: "Charlie Brown", mood: "sad", lastCheckin: "1h ago", notes: "Family concerns" }
    ]
};

/* --- Mood Icon Component --- */
const MoodIcon = memo(({ mood, size = "w-5 h-5" }) => {
    const config = {
        happy: { Icon: Smile, color: "emerald" },
        excited: { Icon: Heart, color: "gold" },
        okay: { Icon: Meh, color: "muted" },
        sad: { Icon: Frown, color: "primary" }
    };
    const { Icon, color } = config[mood] || config.okay;
    return <Icon className={`${size} text-${color}`} />;
});

/* --- Stat Card --- */
const StatCard = memo(({ icon: Icon, iconColor, title, value, subtitle, trend }) => (
    <div className="glass glass-card hover-lift transition-all duration-300">
        <div className="glass__refract" />
        <div className="glass__noise" />

        <div className="relative z-10 p-5 md:p-6">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${iconColor}/10 to-${iconColor}/5 border border-${iconColor}/20 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${iconColor}`} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-emerald text-xs font-medium">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        {trend}
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <p className="text-xs md:text-sm text-muted-foreground font-medium">{title}</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{value}</p>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
        </div>
    </div>
));

/* --- Mood Distribution --- */
const MoodDistribution = memo(({ distribution }) => {
    const total = Object.values(distribution).reduce((a, b) => a + b, 0);

    const moods = [
        { key: "happy", label: "Happy", color: "emerald" },
        { key: "excited", label: "Excited", color: "gold" },
        { key: "okay", label: "Okay", color: "muted" },
        { key: "sad", label: "Sad", color: "primary" }
    ];

    return (
        <div className="glass glass-card hover-lift transition-all duration-300">
            <div className="glass__refract" />
            <div className="glass__refract--soft" />
            <div className="glass__noise" />

            <div className="relative z-10 p-5 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold text-foreground mb-5">
                    Today's Mood Distribution
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {moods.map(({ key, label, color }) => {
                        const count = distribution[key] || 0;
                        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                        return (
                            <div key={key} className="text-center space-y-2">
                                <MoodIcon mood={key} size="w-8 h-8 md:w-10 md:h-10 mx-auto" />
                                <div>
                                    <div className="text-2xl md:text-3xl font-bold text-foreground">{count}</div>
                                    <div className="text-xs text-muted-foreground">{percentage}%</div>
                                </div>
                                <div className="text-xs md:text-sm font-medium text-muted-foreground">{label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

/* --- Weekly Chart --- */
const WeeklyChart = memo(({ data }) => {
    const maxCheckins = Math.max(...data.map(d => d.checkins));

    return (
        <div className="glass glass-card hover-lift transition-all duration-300">
            <div className="glass__refract" />
            <div className="glass__noise" />

            <div className="relative z-10 p-5 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold text-foreground mb-5">
                    Weekly Activity
                </h2>

                <div className="flex items-end justify-between gap-2 md:gap-3 h-40 md:h-48">
                    {data.map((day, index) => {
                        const heightPercent = (day.checkins / maxCheckins) * 100;

                        return (
                            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                                <div className="relative w-full" style={{ height: `${heightPercent}%` }}>
                                    <div
                                        className="absolute inset-0 rounded-t-lg bg-gradient-to-t from-primary via-gold to-emerald transition-all duration-300 hover:opacity-80"
                                        style={{
                                            transitionDelay: `${index * 50}ms`
                                        }}
                                    />
                                    {day.flagged > 0 && (
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-primary border-2 border-card flex items-center justify-center">
                                            <span className="text-xs font-bold text-white">{day.flagged}</span>
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">{day.day}</span>
                                <span className="text-xs text-foreground font-semibold hidden md:block">{day.checkins}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

/* --- Flagged Students --- */
const FlaggedStudents = memo(({ students }) => (
    <div className="glass glass-card transition-all duration-300">
        <div className="glass__refract" />
        <div className="glass__refract--soft" />
        <div className="glass__noise" />

        <div className="relative z-10 p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg md:text-xl font-semibold text-foreground">
                    Students Needing Support
                </h2>
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{students.length}</span>
                </div>
            </div>

            <div className="space-y-3">
                {students.map((student, index) => (
                    <div
                        key={student.name}
                        className="p-3 md:p-4 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/70"
                        style={{ transitionDelay: `${index * 50}ms` }}
                    >
                        <div className="flex items-start gap-3">
                            <MoodIcon mood={student.mood} size="w-5 h-5 flex-shrink-0 mt-0.5" />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="font-semibold text-foreground text-sm md:text-base truncate">
                                        {student.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground flex-shrink-0">
                                        {student.lastCheckin}
                                    </span>
                                </div>
                                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                    {student.notes}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
));

/* --- Main Dashboard --- */
const EmotionalCheckinDashboard = memo(function EmotionalCheckinDashboard() {
    const [selectedPeriod, setSelectedPeriod] = useState("today");

    const periods = useMemo(() => [
        { id: "today", label: "Today" },
        { id: "week", label: "Week" },
        { id: "month", label: "Month" }
    ], []);

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Decorative Blobs */}
            <div className="fixed top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-blob-left" />
            <div className="fixed bottom-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl pointer-events-none animate-blob-right" />
            <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-emerald/5 rounded-full blur-3xl pointer-events-none animate-blob-left" style={{ animationDelay: '3s' }} />

            {/* Grid Pattern */}
            <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-2">
                                Wellness Dashboard
                            </h1>
                            <p className="text-sm md:text-base text-muted-foreground">
                                Monitor emotional well-being and provide timely support
                            </p>
                        </div>
                        <Calendar className="w-8 h-8 md:w-10 md:h-10 text-primary opacity-20" />
                    </div>

                    {/* Period Selector */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground hidden md:block" />
                        {periods.map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => setSelectedPeriod(id)}
                                className={`
                  px-4 py-2 rounded-lg text-sm font-medium
                  transition-all duration-300 ease-premium
                  ${selectedPeriod === id
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                        : 'bg-card/50 text-muted-foreground border border-border/50 hover:border-primary/40 hover:bg-card/80'
                                    }
                `}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                    <StatCard
                        icon={Users}
                        iconColor="primary"
                        title="Total Check-ins"
                        value={mockData.today.totalCheckins}
                        subtitle="Students checked in today"
                        trend="+12%"
                    />

                    <StatCard
                        icon={TrendingUp}
                        iconColor="gold"
                        title="Average Mood"
                        value={<div className="flex items-center gap-2">
                            <MoodIcon mood={mockData.today.averageMood} size="w-6 h-6" />
                            <span className="capitalize">{mockData.today.averageMood}</span>
                        </div>}
                        subtitle="Overall class sentiment"
                    />

                    <StatCard
                        icon={AlertTriangle}
                        iconColor="primary"
                        title="Need Support"
                        value={mockData.today.flaggedStudents}
                        subtitle="Students requiring attention"
                    />
                </div>

                {/* Mood Distribution */}
                <div className="mb-6 md:mb-8">
                    <MoodDistribution distribution={mockData.today.moodDistribution} />
                </div>

                {/* Weekly Chart */}
                <div className="mb-6 md:mb-8">
                    <WeeklyChart data={mockData.weekly} />
                </div>

                {/* Flagged Students */}
                <FlaggedStudents students={mockData.flaggedStudents} />
            </div>
        </div>
    );
});

EmotionalCheckinDashboard.displayName = 'EmotionalCheckinDashboard';
export default EmotionalCheckinDashboard;