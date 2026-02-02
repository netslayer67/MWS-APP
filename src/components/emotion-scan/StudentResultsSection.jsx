import React, { memo, useState } from "react";
import confetti from "canvas-confetti";
import {
    Sparkles, Activity, HeartHandshake, RefreshCcw, Quote,
    CloudSun, CloudRain, Sun, Moon, ArrowUpRight, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import EmotionsDetected from "./results/EmotionsDetected";
import MicroExpressions from "./results/MicroExpressions";
import UserReflectionInput from "./results/UserReflectionInput";
import StudentSupportSelector from "@/components/emotion-student/StudentSupportSelector";

const moodColorSchemes = {
    happy: { hero: "from-amber-400 via-yellow-300 to-orange-400", card: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20", accent: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-700/40" },
    calm: { hero: "from-emerald-400 via-teal-300 to-cyan-400", card: "from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20", accent: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-700/40" },
    sad: { hero: "from-blue-400 via-indigo-400 to-sky-500", card: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20", accent: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-700/40" },
    anxious: { hero: "from-purple-400 via-violet-400 to-indigo-500", card: "from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20", accent: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-700/40" },
    angry: { hero: "from-red-400 via-rose-400 to-pink-500", card: "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20", accent: "text-red-600 dark:text-red-400", border: "border-red-200 dark:border-red-700/40" },
    neutral: { hero: "from-slate-400 via-gray-400 to-zinc-500", card: "from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20", accent: "text-slate-600 dark:text-slate-400", border: "border-slate-200 dark:border-slate-700/40" },
    default: { hero: "from-violet-400 via-purple-400 to-pink-500", card: "from-violet-50 to-pink-50 dark:from-violet-900/20 dark:to-pink-900/20", accent: "text-violet-600 dark:text-violet-400", border: "border-violet-200 dark:border-violet-700/40" }
};

const detectMoodKey = (analysis) => {
    const emotion = (analysis?.detectedEmotion || '').toLowerCase();
    if (emotion.includes('happ') || emotion.includes('joy') || emotion.includes('genuine')) return 'happy';
    if (emotion.includes('calm') || emotion.includes('peace') || emotion.includes('serene')) return 'calm';
    if (emotion.includes('sad') || emotion.includes('depress') || emotion.includes('suppress')) return 'sad';
    if (emotion.includes('anxi') || emotion.includes('stress') || emotion.includes('worried')) return 'anxious';
    if (emotion.includes('anger') || emotion.includes('angry') || emotion.includes('frustrat')) return 'angry';
    if (emotion.includes('neutral') || emotion.includes('focused')) return 'neutral';
    return 'default';
};

const getReadinessFallback = (analysis) => ({
    presenceScore: analysis?.presenceCapacity?.estimatedPresence || 7,
    capacityScore: analysis?.presenceCapacity?.estimatedCapacity || 7,
    overallReadiness: Math.round(((analysis?.presenceCapacity?.estimatedPresence || 7) + (analysis?.presenceCapacity?.estimatedCapacity || 7)) / 2 * 10),
    readinessLane: 'steady',
    signals: []
});

const StudentResultsSection = memo(({
    analysis,
    onReset,
    onComplete,
    onSupportChange,
    isRescanDisabled = false,
    remainingRescans = 0,
    maxRescans = 2
}) => {
    const [hasReflection, setHasReflection] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    const rescanStatus = isRescanDisabled
        ? "Rescan quota exhausted."
        : `Remaining rescans: ${remainingRescans}/${maxRescans}`;

    const readiness = analysis?.readinessMatrix || getReadinessFallback(analysis);
    const moodKey = detectMoodKey(analysis);
    const colors = moodColorSchemes[moodKey] || moodColorSchemes.default;

    const storyline = analysis?.emotionalStoryline || {
        title: analysis?.detectedEmotion || "Mindful Awareness",
        chapter: analysis?.internalWeather || "Balanced Skies",
        narrative: analysis?.psychologicalInsight || "You're doing great! Keep checking in with yourself."
    };

    const heroDescription = analysis?.psychologicalInsight || storyline.narrative;
    const heroIcon = analysis?.icon;
    const confidence = analysis?.confidence ?? 70;

    const chips = analysis?.insightChips || [];
    const recommendations = (analysis?.detailedRecommendations || []).slice(0, 3);

    return (
        <section className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
            {/* Hero Section */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 items-start">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 flex-1 w-full">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${colors.hero} flex items-center justify-center shadow-xl`}>
                        {heroIcon ? (
                            <span className="text-3xl sm:text-5xl">{heroIcon}</span>
                        ) : (
                            <CloudSun className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        )}
                    </div>
                    <div className="flex-1 text-center sm:text-left w-full">
                        <p className={`text-xs font-semibold ${colors.accent} mb-1 flex items-center justify-center sm:justify-start gap-2`}>
                            <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
                            {storyline.chapter}
                        </p>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mb-2">
                            {storyline.title}
                        </h1>
                        <p className="text-sm sm:text-base text-foreground/70 font-medium mb-3 leading-relaxed">
                            {heroDescription}
                        </p>
                        <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full bg-gradient-to-r ${colors.card} ${colors.accent} ${colors.border} border`}>
                                {confidence}% Confidence
                            </span>
                            {chips.slice(0, 3).map((chip, idx) => (
                                <span key={`${chip.label}-${idx}`} className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                    {chip.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Readiness Score */}
                <div className={`w-full lg:w-56 bg-gradient-to-br ${colors.hero} rounded-2xl p-4 sm:p-5 text-white shadow-xl`}>
                    <p className="text-xs font-semibold opacity-90 mb-1">Overall Readiness</p>
                    <p className="text-4xl sm:text-5xl font-black mb-1">{readiness.overallReadiness}%</p>
                    <p className="text-xs opacity-85 leading-snug capitalize">{readiness.readinessLane} mode</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className={`backdrop-blur-xl bg-gradient-to-br ${colors.card} border ${colors.border} rounded-xl p-3 sm:p-4`}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Presence</p>
                    <p className="text-xl sm:text-2xl font-black text-foreground">{readiness.presenceScore}/10</p>
                </div>
                <div className={`backdrop-blur-xl bg-gradient-to-br ${colors.card} border ${colors.border} rounded-xl p-3 sm:p-4`}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Capacity</p>
                    <p className="text-xl sm:text-2xl font-black text-foreground">{readiness.capacityScore}/10</p>
                </div>
                <div className={`backdrop-blur-xl bg-gradient-to-br ${colors.card} border ${colors.border} rounded-xl p-3 sm:p-4`}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Lane</p>
                    <p className="text-xl sm:text-2xl font-black text-foreground capitalize">{readiness.readinessLane}</p>
                </div>
            </div>

            {/* Emotions & Micro Expressions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <EmotionsDetected emotions={analysis?.selfreportedEmotions || []} />
                <MicroExpressions expressions={analysis?.microExpressions || []} />
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className={`backdrop-blur-xl bg-gradient-to-br ${colors.card} border ${colors.border} rounded-2xl p-4 sm:p-5`}>
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className={`w-4 h-4 ${colors.accent}`} />
                        <h3 className="text-sm font-bold text-foreground">Tips For You</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                        {recommendations.map((rec, idx) => (
                            <div key={idx} className="bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/10 rounded-xl p-3">
                                <p className="text-xs font-bold text-foreground mb-1">{rec.title}</p>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">{rec.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Support & Reflection */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <HeartHandshake className={`w-5 h-5 ${colors.accent}`} />
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">Support & Reflection</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <StudentSupportSelector
                        supportContact={analysis?.selectedSupportContact || ""}
                        onSupportChange={(contact) => onSupportChange?.(contact)}
                    />
                    <UserReflectionInput
                        onReflectionChange={(reflection) => {
                            if (analysis) analysis.userReflection = reflection;
                        }}
                        onValidationChange={setHasReflection}
                    />
                </div>
            </div>

            {/* Notification */}
            <AnimatePresence>
                {showNotification && !hasReflection && (
                    <motion.div
                        initial={{ opacity: 0, y: -15, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.97 }}
                        transition={{ duration: 0.25 }}
                        className="bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-900/30 dark:via-orange-900/30 dark:to-rose-900/30 border-2 border-amber-300 dark:border-amber-600 rounded-2xl p-4 shadow-lg"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300 to-orange-300 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center">
                                <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-200" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-amber-800 dark:text-amber-200 mb-0.5">
                                    Don't forget to share your thoughts!
                                </p>
                                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                                    Your reflection helps us understand your experience better. Please take a moment to share what triggered this feeling.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action Center */}
            <div className={`bg-gradient-to-br ${colors.hero} rounded-2xl p-5 sm:p-7 text-white shadow-xl`}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs font-semibold opacity-90 mb-0.5">ACTION CENTER</p>
                        <h2 className="text-xl sm:text-2xl font-black">Finalize Session</h2>
                    </div>
                    <ArrowUpRight className="w-6 h-6 opacity-50" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <button
                        onClick={isRescanDisabled ? undefined : onReset}
                        disabled={isRescanDisabled}
                        className={cn(
                            "py-3.5 sm:py-4 rounded-xl text-sm font-bold transition-all duration-300",
                            isRescanDisabled
                                ? "cursor-not-allowed opacity-40 bg-white/20 text-white/50"
                                : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30 active:scale-95"
                        )}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <RefreshCcw className="w-4 h-4" />
                            <span>Scan Again</span>
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            if (!hasReflection) {
                                setShowNotification(true);
                                setTimeout(() => setShowNotification(false), 5000);
                                return;
                            }
                            const duration = 3000;
                            const end = Date.now() + duration;
                            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
                            const rand = (min, max) => Math.random() * (max - min) + min;
                            const interval = setInterval(() => {
                                if (Date.now() > end) return clearInterval(interval);
                                const count = 50 * ((end - Date.now()) / duration);
                                confetti({ ...defaults, particleCount: count, origin: { x: rand(0.1, 0.3), y: Math.random() - 0.2 } });
                                confetti({ ...defaults, particleCount: count, origin: { x: rand(0.7, 0.9), y: Math.random() - 0.2 } });
                            }, 250);
                            if (analysis) analysis.isSubmitting = true;
                            setTimeout(() => onComplete(), 500);
                        }}
                        disabled={analysis?.isSubmitting}
                        className={cn(
                            "py-3.5 sm:py-4 rounded-xl text-sm font-bold transition-all duration-300",
                            analysis?.isSubmitting
                                ? "bg-white/40 cursor-wait"
                                : !hasReflection
                                ? "bg-white/50 text-white/70 cursor-not-allowed"
                                : "bg-white text-gray-800 hover:bg-white/95 active:scale-95"
                        )}
                    >
                        {analysis?.isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-gray-600/30 border-t-gray-600 rounded-full animate-spin" />
                                <span>Processing...</span>
                            </div>
                        ) : (
                            <span>Complete Session</span>
                        )}
                    </button>
                </div>

                <p className="text-xs text-center text-white/70">{rescanStatus}</p>
            </div>
        </section>
    );
});

StudentResultsSection.displayName = "StudentResultsSection";

export default StudentResultsSection;
