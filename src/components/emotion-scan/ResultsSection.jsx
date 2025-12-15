import React, { memo, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Sparkles, Activity, HeartHandshake, RefreshCcw, Quote, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import EmotionsDetected from "./results/EmotionsDetected";
import MicroExpressions from "./results/MicroExpressions";
import UserReflectionInput from "./results/UserReflectionInput";
import SupportSelector from "@/components/emotion-staff/SupportSelector";

const defaultHints = {
    gradientCss: "linear-gradient(135deg, rgba(245,243,255,0.92) 0%, rgba(237,233,254,0.85) 52%, rgba(255,255,255,0.92) 100%)",
    glassColor: "rgba(255,255,255,0.92)",
    borderColor: "rgba(148, 163, 184, 0.35)",
    accentColor: "#8b5cf6",
    animationAnchor: "fade-up",
    badges: []
};

const getPanelStyle = (hints) => ({
    borderColor: hints.borderColor || defaultHints.borderColor,
    backgroundColor: hints.glassColor || defaultHints.glassColor,
    backdropFilter: "blur(28px)"
});

const getReadinessFallback = (analysis) => {
    const presence = analysis?.presenceCapacity?.estimatedPresence || 6;
    const capacity = analysis?.presenceCapacity?.estimatedCapacity || 6;
    const overall = Math.round(((presence + capacity) / 20) * 100);
    return {
        presenceScore: presence,
        capacityScore: capacity,
        overallReadiness: overall,
        readinessLane: overall >= 80 ? "glide" : overall >= 60 ? "steady" : overall >= 40 ? "sensitive" : "repair",
        signals: [
            {
                label: "Presence",
                status: presence >= 7 ? "clear" : presence >= 5 ? "foggy" : "dense",
                idea: presence >= 7 ? "Use your clarity for intentional work."
                    : "Create a quiet 10-minute buffer before big tasks."
            },
            {
                label: "Capacity",
                status: capacity >= 7 ? "charged" : capacity >= 5 ? "oscillating" : "drained",
                idea: capacity >= 6 ? "Channel surplus energy toward people work."
                    : "Pair each intense block with a micro-reset ritual."
            }
        ]
    };
};

const ResultsSection = memo(({
    analysis,
    onReset,
    onComplete,
    onSupportChange,
    isRescanDisabled = false,
    remainingRescans = 0,
    maxRescans = 2
}) => {
    useEffect(() => {
        AOS.init({
            once: true,
            duration: 650,
            easing: "ease-out-cubic"
        });
    }, []);

    const rescanStatus = isRescanDisabled
        ? "Kuota scan ulang untuk fitur ini sudah habis."
        : `Sisa kuota scan ulang: ${remainingRescans}/${maxRescans}`;

    const hints = analysis?.displayHints || defaultHints;
    const readiness = analysis?.readinessMatrix || getReadinessFallback(analysis);
    const storyline = analysis?.emotionalStoryline || {
        title: analysis?.detectedEmotion || "Mindful Awareness",
        chapter: analysis?.internalWeather || "Balanced Skies",
        narrative: analysis?.psychologicalInsight || "Teruskan kebiasaan melakukan check-in emosi ini demi menjaga keseimbangan harianmu.",
        arc: "balancing",
        confidence: analysis?.confidence || 70,
        colorTone: hints?.theme || "lilac"
    };
    const supportCompass = analysis?.supportCompass || {
        needsSupport: readiness.overallReadiness < 55,
        supportLevel: readiness.overallReadiness < 55 ? "active" : "monitor",
        suggestedAllies: ["Peer ally", "Trusted mentor"],
        message: readiness.overallReadiness < 55
            ? "Pertimbangkan untuk menghubungi support contact agar mendapatkan ko-regulasi."
            : "Bagikan energi positifmu ke rekan kerja hari ini.",
        storylineContext: storyline.title
    };
    const heroStyle = {
        ...getPanelStyle(hints),
        backgroundImage: hints.gradientCss || defaultHints.gradientCss
    };

    const chips = analysis?.insightChips?.length
        ? analysis.insightChips
        : [{ label: analysis?.detectedEmotion, type: "mood" }];

    const recommendations = analysis?.detailedRecommendations || [];

    return (
        <div className="space-y-4 text-foreground">
            <div
                className="rounded-[28px] border shadow-xl p-5 text-center space-y-3"
                style={heroStyle}
                data-aos={hints.animationAnchor || "fade-up"}
            >
                <div className="text-5xl">{analysis?.icon || "🌤️"}</div>
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">{analysis?.detectedEmotion}</h2>
                    <p className="text-sm text-muted-foreground">{analysis?.internalWeather}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/40 text-foreground border border-white/60">
                        {analysis?.confidence ?? 70}% Confidence
                    </span>
                    {chips.map((chip, idx) => (
                        <span
                            key={`${chip.label}-${idx}`}
                            className="px-2.5 py-1 text-[11px] rounded-full bg-black/10 dark:bg-white/10 text-foreground/80"
                        >
                            {chip.label}
                        </span>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">
                    {analysis?.psychologicalInsight || storyline.narrative}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div
                    className="rounded-3xl border shadow-lg p-4 space-y-3"
                    style={getPanelStyle(hints)}
                    data-aos="fade-up"
                >
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Emotional Storyline
                        </span>
                    </div>
                    <div>
                        <p className="text-base font-semibold">{storyline.title}</p>
                        <p className="text-sm text-muted-foreground">{storyline.chapter}</p>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90">
                        {storyline.narrative}
                    </p>
                    {analysis?.personalizedRecommendation && (
                        <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-white/40 p-3 space-y-2">
                            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                                <Quote className="w-3.5 h-3.5" />
                                Personalized Guidance
                            </div>
                            <p className="text-sm text-foreground/90">
                                {analysis.personalizedRecommendation}
                            </p>
                        </div>
                    )}
                </div>

                <div
                    className="rounded-3xl border shadow-lg p-4 space-y-4"
                    style={getPanelStyle(hints)}
                    data-aos="fade-up"
                >
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Readiness Matrix
                        </span>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Presence</p>
                            <div className="h-2 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-primary"
                                    style={{ width: `${(readiness.presenceScore / 10) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Capacity</p>
                            <div className="h-2 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-emerald-500"
                                    style={{ width: `${(readiness.capacityScore / 10) * 100}%` }}
                                />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Lane: <span className="font-medium text-foreground">{readiness.readinessLane}</span>
                        </p>
                    </div>
                    <div className="rounded-2xl bg-black/5 dark:bg-white/10 p-3">
                        {readiness.signals?.map((signal) => (
                            <div key={signal.label} className="mb-2 last:mb-0">
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                    {signal.label} • {signal.status}
                                </p>
                                <p className="text-sm text-foreground/90">{signal.idea}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div
                    className="rounded-3xl border shadow-lg p-4 space-y-4"
                    style={getPanelStyle(hints)}
                    data-aos="fade-up"
                >
                    <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Emotional Landscape
                        </span>
                    </div>
                    <div className="space-y-3">
                        <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-white/30 p-3">
                            <p className="text-sm font-semibold">{analysis?.internalWeather}</p>
                            <p className="text-xs text-muted-foreground">{analysis?.weatherDesc}</p>
                        </div>
                        <EmotionsDetected emotions={analysis?.selfreportedEmotions} />
                        <MicroExpressions expressions={analysis?.microExpressions} />
                    </div>
                </div>

                <div
                    className="rounded-3xl border shadow-lg p-4 space-y-4"
                    style={getPanelStyle(hints)}
                    data-aos="fade-up"
                >
                    <div className="flex items-center gap-2">
                        <HeartHandshake className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Support Compass
                        </span>
                    </div>
                    <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-white/30 p-3 space-y-2">
                        <p className="text-sm font-semibold">
                            {supportCompass.needsSupport ? "Perlu dukungan aktif" : "Tetap dalam mode pemantauan"}
                        </p>
                        <p className="text-xs text-muted-foreground">{supportCompass.message}</p>
                        <div className="flex flex-wrap gap-1.5">
                            {supportCompass.suggestedAllies?.map((ally) => (
                                <span key={ally} className="px-2 py-0.5 text-[11px] rounded-full bg-black/5 dark:bg-white/10">
                                    {ally}
                                </span>
                            ))}
                        </div>
                    </div>
                    <SupportSelector
                        supportContact={analysis.selectedSupportContact || ""}
                        onSupportChange={(contact) => {
                            if (onSupportChange) {
                                onSupportChange(contact);
                            }
                        }}
                    />
                    <UserReflectionInput
                        onReflectionChange={(reflection) => {
                            analysis.userReflection = reflection;
                        }}
                    />
                </div>
            </div>

            <div
                className="rounded-3xl border shadow-lg p-4 space-y-4"
                style={getPanelStyle(hints)}
                data-aos="fade-up"
            >
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Recommended Moves
                    </span>
                </div>
                <div className="space-y-3">
                    {recommendations.slice(0, 4).map((rec, idx) => (
                        <div key={`${rec.title}-${idx}`} className="rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-white/30 p-3">
                            <p className="text-sm font-semibold">{rec.title}</p>
                            <p className="text-xs text-muted-foreground">{rec.description}</p>
                        </div>
                    ))}
                    {analysis?.metadata?.callToAction && (
                        <div className="rounded-2xl bg-black/5 dark:bg-white/10 px-3 py-2 text-sm text-foreground/90">
                            {analysis.metadata.callToAction}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                    onClick={isRescanDisabled ? undefined : onReset}
                    disabled={isRescanDisabled}
                    className={cn(
                        "py-3 rounded-2xl border text-sm font-medium transition-colors",
                        isRescanDisabled
                            ? "cursor-not-allowed opacity-60 border-border/40 text-muted-foreground"
                            : "border-border bg-white/70 dark:bg-slate-900/70 hover:bg-white/80"
                    )}
                    aria-label="Scan again for new AI emotional analysis"
                >
                    <div className="flex items-center justify-center gap-2">
                        <RefreshCcw className="w-4 h-4" />
                        <span>Scan Again</span>
                    </div>
                </button>
                <button
                    onClick={() => {
                        if (analysis) {
                            analysis.isSubmitting = true;
                        }
                        onComplete();
                    }}
                    disabled={analysis?.isSubmitting}
                    className={cn(
                        "py-3 rounded-2xl text-white font-semibold shadow-lg transition-colors",
                        analysis?.isSubmitting
                            ? "bg-primary/60 cursor-wait"
                            : "bg-primary hover:bg-primary/90"
                    )}
                    aria-label="Complete check-in and proceed to results"
                >
                    {analysis?.isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                        </div>
                    ) : (
                        "Complete Check-in"
                    )}
                </button>
            </div>
            <p
                className={cn(
                    "text-xs text-center",
                    isRescanDisabled ? "text-destructive" : "text-muted-foreground"
                )}
                role="status"
            >
                {rescanStatus}
            </p>
        </div>
    );
});

ResultsSection.displayName = "ResultsSection";
export default ResultsSection;
