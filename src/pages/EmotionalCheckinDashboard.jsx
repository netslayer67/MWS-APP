import React, { useState, memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnimatedPage from "@/components/AnimatedPage";
import { Helmet } from "react-helmet";
import { TrendingUp, Users, AlertTriangle, Calendar, Smile, Frown, Meh, Heart } from "lucide-react";

/* --- Mock data --- */
const mockData = {
    today: {
        totalCheckins: 28,
        averageMood: "okay",
        flaggedStudents: 3,
        moodDistribution: {
            happy: 12,
            excited: 5,
            okay: 8,
            sad: 3
        }
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
        { name: "Alice Johnson", mood: "sad", lastCheckin: "2 hours ago", notes: "Feeling overwhelmed with assignments" },
        { name: "Bob Smith", mood: "sad", lastCheckin: "4 hours ago", notes: "Having trouble with friends" },
        { name: "Charlie Brown", mood: "sad", lastCheckin: "1 hour ago", notes: "Family issues at home" }
    ]
};

/* --- Decorative Blob --- */
const DecorativeBlob = memo(({ className, animate }) => (
    <motion.div
        className={`absolute rounded-full blur-3xl ${className}`}
        animate={animate ? {
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
        } : {}}
        transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
        }}
    />
));

/* --- Mood Icon --- */
const MoodIcon = ({ mood, size = "w-5 h-5" }) => {
    const icons = {
        happy: Smile,
        excited: Heart,
        okay: Meh,
        sad: Frown
    };
    const colors = {
        happy: "text-green-500",
        excited: "text-red-500",
        okay: "text-yellow-500",
        sad: "text-blue-500"
    };
    const Icon = icons[mood] || Meh;
    return <Icon className={`${size} ${colors[mood] || "text-gray-500"}`} />;
};

const EmotionalCheckinDashboard = memo(function EmotionalCheckinDashboard() {
    const [selectedPeriod, setSelectedPeriod] = useState("today");

    return (
        <AnimatedPage>
            <Helmet>
                <title>Emotional Check-in Dashboard — Kerjain</title>
            </Helmet>

            <div className="min-h-screen text-foreground relative overflow-hidden">
                {/* Background elements */}
                <DecorativeBlob className="-top-40 -left-40 w-96 h-96 bg-primary/10" animate />
                <DecorativeBlob className="-bottom-40 -right-40 w-80 h-80 bg-accent/10" animate />
                <div className="absolute inset-0 bg-grid-small opacity-5 dark:opacity-10" />

                <div className="container mx-auto px-4 py-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Emotional Check-in Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Monitor student well-being and identify those who need support.
                        </p>
                    </motion.div>

                    {/* Period selector */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="flex gap-2 mb-6"
                    >
                        {["today", "week", "month"].map((period) => (
                            <Button
                                key={period}
                                variant={selectedPeriod === period ? "default" : "outline"}
                                onClick={() => setSelectedPeriod(period)}
                                className="capitalize transition-all duration-300"
                            >
                                {period}
                            </Button>
                        ))}
                    </motion.div>

                    {/* Today's summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                    >
                        <Card className="glass-strong">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Users className="w-5 h-5 text-primary" />
                                    Total Check-ins
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-foreground">
                                    {mockData.today.totalCheckins}
                                </div>
                                <p className="text-sm text-muted-foreground">Students checked in today</p>
                            </CardContent>
                        </Card>

                        <Card className="glass-strong">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-accent" />
                                    Average Mood
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <MoodIcon mood={mockData.today.averageMood} size="w-6 h-6" />
                                    <span className="text-xl font-bold text-foreground capitalize">
                                        {mockData.today.averageMood}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">Class mood today</p>
                            </CardContent>
                        </Card>

                        <Card className="glass-strong">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                    Flagged Students
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-foreground">
                                    {mockData.today.flaggedStudents}
                                </div>
                                <p className="text-sm text-muted-foreground">Need attention</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Mood distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="glass-strong rounded-2xl p-6 mb-8"
                    >
                        <h2 className="text-xl font-semibold text-foreground mb-4">Today's Mood Distribution</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(mockData.today.moodDistribution).map(([mood, count]) => (
                                <div key={mood} className="text-center">
                                    <MoodIcon mood={mood} size="w-8 h-8" />
                                    <div className="text-2xl font-bold text-foreground mt-2">{count}</div>
                                    <div className="text-sm text-muted-foreground capitalize">{mood}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Weekly trend (simplified) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        className="glass-strong rounded-2xl p-6 mb-8"
                    >
                        <h2 className="text-xl font-semibold text-foreground mb-4">Weekly Trend</h2>
                        <div className="flex items-end gap-2 h-32">
                            {mockData.weekly.map((day, index) => (
                                <div key={day.day} className="flex-1 flex flex-col items-center">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(day.checkins / 30) * 100}%` }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        className="w-full bg-gradient-to-t from-primary to-accent rounded-t transition-all duration-300 hover:opacity-80"
                                    />
                                    <span className="text-xs text-muted-foreground mt-2">{day.day}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Flagged students */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                        className="glass-strong rounded-2xl p-6"
                    >
                        <h2 className="text-xl font-semibold text-foreground mb-4">Students Needing Attention</h2>
                        <div className="space-y-4">
                            {mockData.flaggedStudents.map((student, index) => (
                                <motion.div
                                    key={student.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                                    className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/40"
                                >
                                    <div className="flex items-center gap-3">
                                        <MoodIcon mood={student.mood} />
                                        <div>
                                            <div className="font-medium text-foreground">{student.name}</div>
                                            <div className="text-sm text-muted-foreground">{student.lastCheckin}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground mb-1">Notes</div>
                                        <div className="text-sm text-foreground max-w-xs truncate">{student.notes}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </AnimatedPage>
    );
});

EmotionalCheckinDashboard.displayName = 'EmotionalCheckinDashboard';

export default EmotionalCheckinDashboard;