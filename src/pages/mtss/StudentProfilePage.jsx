import { memo, useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, BookOpen, Sparkles, CalendarDays, Users, TrendingUp,
    Activity, Award, Clock, Zap, ChevronRight, BarChart3,
    CheckCircle2, AlertCircle, Star, Heart, Calculator, ShieldCheck
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Line } from "recharts";
import { ProgressBadge } from "./components/StatusPills";
import { fetchMentorAssignments, fetchMtssStudentById } from "@/services/mtssService";
import { getStoredUser, mapAssignmentsToStudents } from "./utils/teacherDashboardUtils";
import {
    ensureStudentInterventions,
    pickPrimaryIntervention,
} from "./utils/interventionUtils";

// Intervention type configurations with vibrant colors
const INTERVENTION_CONFIG = {
    SEL: {
        icon: Heart,
        gradient: "from-purple-500 via-fuchsia-500 to-pink-500",
        lightBg: "bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/40 dark:to-fuchsia-950/30",
        cardBg: "bg-gradient-to-br from-purple-100/80 to-fuchsia-100/60 dark:from-purple-900/40 dark:to-fuchsia-900/30",
        border: "border-purple-200/60 dark:border-purple-700/40",
        text: "text-purple-700 dark:text-purple-300",
        ring: "ring-purple-400/30",
        glow: "shadow-purple-500/20"
    },
    ENGLISH: {
        icon: BookOpen,
        gradient: "from-blue-500 via-cyan-500 to-teal-500",
        lightBg: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/30",
        cardBg: "bg-gradient-to-br from-blue-100/80 to-cyan-100/60 dark:from-blue-900/40 dark:to-cyan-900/30",
        border: "border-blue-200/60 dark:border-blue-700/40",
        text: "text-blue-700 dark:text-blue-300",
        ring: "ring-blue-400/30",
        glow: "shadow-blue-500/20"
    },
    MATH: {
        icon: Calculator,
        gradient: "from-emerald-500 via-green-500 to-teal-500",
        lightBg: "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/30",
        cardBg: "bg-gradient-to-br from-emerald-100/80 to-green-100/60 dark:from-emerald-900/40 dark:to-green-900/30",
        border: "border-emerald-200/60 dark:border-emerald-700/40",
        text: "text-emerald-700 dark:text-emerald-300",
        ring: "ring-emerald-400/30",
        glow: "shadow-emerald-500/20"
    },
    BEHAVIOR: {
        icon: ShieldCheck,
        gradient: "from-amber-500 via-orange-500 to-yellow-500",
        lightBg: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30",
        cardBg: "bg-gradient-to-br from-amber-100/80 to-orange-100/60 dark:from-amber-900/40 dark:to-orange-900/30",
        border: "border-amber-200/60 dark:border-amber-700/40",
        text: "text-amber-700 dark:text-amber-300",
        ring: "ring-amber-400/30",
        glow: "shadow-amber-500/20"
    },
    ATTENDANCE: {
        icon: CalendarDays,
        gradient: "from-indigo-500 via-violet-500 to-purple-500",
        lightBg: "bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/30",
        cardBg: "bg-gradient-to-br from-indigo-100/80 to-violet-100/60 dark:from-indigo-900/40 dark:to-violet-900/30",
        border: "border-indigo-200/60 dark:border-indigo-700/40",
        text: "text-indigo-700 dark:text-indigo-300",
        ring: "ring-indigo-400/30",
        glow: "shadow-indigo-500/20"
    }
};

// Tier configurations
const TIER_CONFIG = {
    tier1: {
        label: "Tier 1",
        bg: "bg-emerald-500",
        gradient: "from-emerald-500 to-teal-500",
        text: "text-emerald-700 dark:text-emerald-300",
        lightBg: "bg-emerald-100 dark:bg-emerald-900/30"
    },
    tier2: {
        label: "Tier 2",
        bg: "bg-amber-500",
        gradient: "from-amber-500 to-orange-500",
        text: "text-amber-700 dark:text-amber-300",
        lightBg: "bg-amber-100 dark:bg-amber-900/30"
    },
    tier3: {
        label: "Tier 3",
        bg: "bg-rose-500",
        gradient: "from-rose-500 to-pink-500",
        text: "text-rose-700 dark:text-rose-300",
        lightBg: "bg-rose-100 dark:bg-rose-900/30"
    }
};

// Glass morphism styles
const glass = {
    card: "backdrop-blur-xl bg-white/60 dark:bg-slate-900/50 border border-white/40 dark:border-white/10",
    inner: "backdrop-blur-md bg-white/40 dark:bg-white/5 border border-white/30 dark:border-white/5",
    hover: "hover:bg-white/70 dark:hover:bg-slate-900/60 hover:shadow-xl transition-all duration-300"
};

const StudentProfilePage = memo(() => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedIntervention, setSelectedIntervention] = useState(null);
    const mentor = useMemo(() => getStoredUser(), []);

    useEffect(() => {
        let mounted = true;
        const controller = new AbortController();

        const loadStudent = async () => {
            setLoading(true);
            setError(null);
            try {
                const payload = await fetchMtssStudentById(slug, { signal: controller.signal });
                if (!mounted) return;
                setStudent(payload?.student || null);

                // Auto-select first intervention with data
                const details = payload?.student?.interventionDetails || [];
                if (details.length > 0) {
                    setSelectedIntervention(details[0]);
                }
            } catch (err) {
                if (!mounted || err?.name === "CanceledError" || err?.name === "AbortError") return;
                try {
                    const { assignments = [] } = await fetchMentorAssignments({}, { signal: controller.signal });
                    if (!mounted) return;
                    const { students: normalized } = mapAssignmentsToStudents(
                        assignments,
                        mentor?.username || mentor?.name || "MTSS Mentor"
                    );
                    const assigned = normalized.find((item) => item.slug === slug);
                    if (assigned) {
                        setStudent(assigned);
                        return;
                    }
                } catch (fallbackError) {
                    if (!mounted) return;
                }
                setError(err.response?.data?.message || err.message || "Unable to load student profile");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadStudent();
        return () => {
            mounted = false;
            controller.abort();
        };
    }, [slug, mentor]);

    const handleSelectIntervention = useCallback((intervention) => {
        setSelectedIntervention(intervention);
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-slate-950 dark:via-purple-950/20 dark:to-pink-950/20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
                        <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-ping opacity-20" />
                    </div>
                    <p className="text-muted-foreground font-medium">Loading student profile…</p>
                </motion.div>
            </div>
        );
    }

    // Error state
    if (error || !student) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-rose-50/30 dark:from-slate-950 dark:to-rose-950/20 p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${glass.card} rounded-3xl p-8 text-center space-y-4 max-w-md shadow-2xl`}
                >
                    <div className="w-20 h-20 mx-auto rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                        <AlertCircle className="w-10 h-10 text-rose-500" />
                    </div>
                    <p className="text-lg font-semibold text-rose-600 dark:text-rose-400">
                        {error || "Student not found"}
                    </p>
                    <button
                        className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                        onClick={() => navigate("/mtss?tab=students")}
                    >
                        Back to Students
                    </button>
                </motion.div>
            </div>
        );
    }

    const { profile = {}, interventionDetails = [] } = student;
    const allInterventions = ensureStudentInterventions(student.interventions);
    const highlight = pickPrimaryIntervention(allInterventions);

    // Merge interventionDetails (from assignments) with allInterventions (all 5 types)
    // This ensures we show ALL subjects, with real data where available
    const mergedInterventions = allInterventions.map(intervention => {
        // Find matching detail from backend
        const detail = interventionDetails.find(d =>
            d.type?.toUpperCase() === intervention.type?.toUpperCase()
        );

        if (detail) {
            // Has real assignment data - use it
            return {
                ...detail,
                hasRealData: true,
                // Ensure type matches for config lookup
                type: intervention.type
            };
        }

        // No assignment - use the intervention from student.interventions (Tier 1 default)
        return {
            id: `default-${intervention.type}`,
            type: intervention.type,
            label: intervention.label,
            tier: intervention.tierCode || 'tier1',
            tierLabel: intervention.tier || 'Tier 1',
            status: intervention.status || 'monitoring',
            strategyName: intervention.strategies?.[0] || null,
            baseline: null,
            current: null,
            target: null,
            progressUnit: 'pts',
            progress: 0,
            checkInsCount: 0,
            chart: [],
            history: [],
            hasRealData: false
        };
    });

    // Sort: Tier 3 first, then Tier 2, then Tier 1
    const sortedInterventions = [...mergedInterventions].sort((a, b) => {
        const tierOrder = { tier3: 0, tier2: 1, tier1: 2 };
        const aTier = a.tier?.toLowerCase() || 'tier1';
        const bTier = b.tier?.toLowerCase() || 'tier1';
        return (tierOrder[aTier] ?? 2) - (tierOrder[bTier] ?? 2);
    });

    // Selected intervention data (or fallback to first escalated or first)
    const escalatedInterventions = sortedInterventions.filter(d => d.tier === 'tier2' || d.tier === 'tier3');
    const defaultSelected = escalatedInterventions[0] || sortedInterventions[0] || null;
    const currentIntervention = selectedIntervention || defaultSelected;
    const currentConfig = currentIntervention
        ? INTERVENTION_CONFIG[currentIntervention.type] || INTERVENTION_CONFIG.SEL
        : INTERVENTION_CONFIG.SEL;
    const currentTierConfig = currentIntervention
        ? TIER_CONFIG[currentIntervention.tier] || TIER_CONFIG.tier1
        : TIER_CONFIG.tier1;
    const CurrentIcon = currentConfig.icon || Sparkles;
    const classLabel = student.className && student.className !== student.grade ? student.className : null;
    const strategyLabel = currentIntervention?.strategyName || currentIntervention?.focusArea || "Core supports";
    const durationLabel = currentIntervention?.duration || "Ongoing";
    const frequencyLabel = currentIntervention?.monitoringFrequency || currentIntervention?.monitoringMethod || "Weekly";
    const mentorLabel = currentIntervention?.mentor || profile?.mentor || student.mentor || "TBD";

    const quickFacts = [
        { label: "Grade", value: student.grade || "-", icon: BookOpen, gradient: "from-blue-500 to-cyan-500" },
        { label: "Class", value: student.className || "-", icon: Users, gradient: "from-emerald-500 to-teal-500" },
        { label: "Started", value: profile?.started || "-", icon: CalendarDays, gradient: "from-rose-500 to-pink-500" },
        { label: "Mentor", value: mentorLabel, icon: Award, gradient: "from-purple-500 to-violet-500" },
    ];

    return (
        <div className="relative min-h-screen mtss-theme bg-gradient-to-br from-slate-50 via-white to-rose-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-rose-950/20">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 hidden sm:block mtss-animated-bg opacity-70" />
                <div className="absolute -top-32 -left-32 hidden sm:block w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-600/10 dark:to-pink-600/10 rounded-full blur-3xl" />
                <div className="absolute top-1/4 -right-32 hidden sm:block w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 dark:from-blue-600/10 dark:to-cyan-600/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 left-1/4 hidden sm:block w-72 h-72 bg-gradient-to-br from-amber-400/15 to-orange-400/15 dark:from-amber-600/10 dark:to-orange-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 container max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-8 space-y-3 sm:space-y-6">
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => (window.history.length > 2 ? navigate(-1) : navigate("/mtss/teacher?tab=students"))}
                    className={`${glass.card} ${glass.hover} inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg`}
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back to Students</span>
                    <span className="sm:hidden">Back</span>
                </motion.button>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`${glass.card} rounded-3xl overflow-hidden shadow-2xl`}
                >
                    {/* Header */}
                    <div className="relative overflow-hidden text-white">
                        <div className="absolute inset-0 mtss-hero-gradient" />
                        <div className="absolute inset-0 mtss-hero-aurora opacity-80" />
                        <div className="absolute inset-0 mtss-hero-shine hidden sm:block" />
                        <div className="relative px-4 sm:px-8 py-6 sm:py-8">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div className="space-y-3">
                                    <span className="mtss-chip bg-white/15 text-white/90">
                                        Student Spotlight
                                    </span>
                                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{student.name}</h1>
                                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-white/90">
                                        <span className="px-3 py-1 rounded-full bg-white/15">
                                            {student.grade || "-"}
                                        </span>
                                        {classLabel && (
                                            <span className="px-3 py-1 rounded-full bg-white/10">
                                                {classLabel}
                                            </span>
                                        )}
                                        <span className="px-3 py-1 rounded-full bg-white/10">
                                            {highlight?.label || "Universal Supports"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r ${currentTierConfig.gradient} shadow-lg`}>
                                        {currentTierConfig.label}
                                    </span>
                                    <span className="px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-white/15 backdrop-blur-sm">
                                        {currentIntervention?.label || highlight?.label || "Universal"}
                                    </span>
                                    <ProgressBadge status={student.progress} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                        {/* Quick Facts */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                            {quickFacts.map((fact, i) => {
                                const Icon = fact.icon;
                                return (
                                    <motion.div
                                        key={fact.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 + i * 0.05 }}
                                        className={`${glass.inner} group rounded-2xl p-3 sm:p-4 ${glass.hover} hover:-translate-y-0.5 active:scale-[0.99]`}
                                    >
                                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${fact.gradient} flex items-center justify-center mb-2 shadow-lg`}>
                                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                        </div>
                                        <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                                            {fact.label}
                                        </p>
                                        <p className="text-sm sm:text-base font-bold text-foreground dark:text-white truncate">
                                            {fact.value}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Active Interventions - Clickable Cards */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className={`${glass.inner} rounded-2xl sm:rounded-3xl p-4 sm:p-6`}
                        >
                            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Support Map</p>
                                    <h3 className="text-lg sm:text-xl font-bold text-foreground dark:text-white">
                                        All Interventions
                                        <span className="text-sm font-normal text-muted-foreground ml-2">
                                            (Click Tier 2/3 to view progress)
                                        </span>
                                    </h3>
                                </div>
                            </div>

                            {sortedInterventions.length > 0 ? (
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 sm:overflow-visible sm:pb-0">
                                    {sortedInterventions.map((intervention, idx) => {
                                        const config = INTERVENTION_CONFIG[intervention.type] || INTERVENTION_CONFIG.SEL;
                                        const tierCfg = TIER_CONFIG[intervention.tier] || TIER_CONFIG.tier1;
                                        const isSelected = selectedIntervention?.id === intervention.id;
                                        const isTier1 = intervention.tier === 'tier1' || !intervention.hasRealData;
                                        const ConfigIcon = config.icon || Sparkles;
                                        const tierLabel = intervention.tierLabel || tierCfg.label;
                                        const statusLabel = intervention.status === 'active'
                                            ? 'Active'
                                            : intervention.status === 'paused'
                                                ? 'Paused'
                                                : intervention.status === 'closed'
                                                    ? 'Closed'
                                                    : 'Monitoring';
                                        

                                        return (
                                            <motion.button
                                                key={intervention.id || idx}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.35 + idx * 0.05 }}
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => intervention.hasRealData ? handleSelectIntervention(intervention) : null}
                                                disabled={!intervention.hasRealData}
                                                className={`group relative text-left rounded-3xl p-4 sm:p-5 min-w-[250px] sm:min-w-0 snap-start transition-all duration-300 overflow-hidden backdrop-blur-xl
                                                    ${isTier1
                                                        ? 'bg-white/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50 shadow-[0_12px_32px_rgba(15,23,42,0.10)]'
                                                        : `${config.cardBg} ${config.border} border shadow-[0_20px_50px_rgba(15,23,42,0.18)] ${config.glow}`
                                                    }
                                                    ${isSelected ? `ring-4 ${config.ring} shadow-2xl -translate-y-1` : intervention.hasRealData ? 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer' : 'cursor-default'}`}
                                            >
                                                <div className={`-mx-4 sm:-mx-5 -mt-4 sm:-mt-5 mb-3 px-4 sm:px-5 py-3 rounded-t-3xl bg-gradient-to-r ${config.gradient} ${isTier1 ? 'opacity-80' : ''}`}>
                                                    <div className="flex items-center justify-between gap-3 text-white">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <div className="w-9 h-9 rounded-xl bg-white/25 flex items-center justify-center shadow-sm">
                                                                <ConfigIcon className="w-4 h-4 text-white" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold truncate">{intervention.label}</p>
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-white/20 border border-white/30">
                                                                    {statusLabel}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-white/20 border border-white/30 whitespace-nowrap">
                                                            {tierLabel}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <p className="text-xs sm:text-sm text-muted-foreground dark:text-white/70 line-clamp-2">
                                                        <span className="font-medium">Strategy:</span> {intervention.strategyName || intervention.focusArea || "Core supports"}
                                                    </p>

                                                    <div>
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="text-muted-foreground">Progress</span>
                                                            <span className={`font-bold ${config.text}`}>{intervention.progress || 0}%</span>
                                                        </div>
                                                        <div className="h-2.5 rounded-full bg-white/70 dark:bg-black/30 overflow-hidden shadow-inner">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${intervention.progress || 0}%` }}
                                                                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                                                                className={`h-full rounded-full bg-gradient-to-r ${config.gradient}`}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2 border-t border-white/40 dark:border-white/10 text-xs text-muted-foreground">
                                                        <span>{intervention.checkInsCount || 0} check-ins</span>
                                                        <span className={`inline-flex items-center gap-1 ${config.text} font-semibold`}>
                                                            Details
                                                            <ChevronRight className="w-4 h-4" />
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground">
                                    <Star className="w-12 h-12 mx-auto mb-3 text-amber-400" />
                                    <p className="font-medium">No active interventions</p>
                                    <p className="text-sm opacity-70">Universal supports are in place</p>
                                </div>
                            )}
                        </motion.section>

                        {/* Growth Journey - Per Intervention */}
                        <AnimatePresence mode="wait">
                            {currentIntervention && (
                                <motion.section
                                    key={currentIntervention.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className={`${glass.inner} rounded-2xl sm:rounded-3xl p-4 sm:p-6`}
                                >
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* Left: Chart & Stats */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center justify-between flex-wrap gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentConfig.gradient} flex items-center justify-center shadow-lg`}>
                                                        <TrendingUp className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Growth Journey</p>
                                                        <h3 className="text-xl font-bold text-foreground dark:text-white flex items-center gap-2">
                                                            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${currentConfig.gradient} flex items-center justify-center shadow-lg`}>
                                                                <CurrentIcon className="w-5 h-5 text-white" />
                                                            </div>
                                                            {currentIntervention.label}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-3xl sm:text-5xl font-black bg-gradient-to-r ${currentConfig.gradient} text-transparent bg-clip-text`}>
                                                        {currentIntervention.progress || 0}%
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Chart */}
                                            <div className={`${currentConfig.lightBg} rounded-2xl p-4`}>
                                                <div className="h-44 sm:h-60">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={currentIntervention.chart || []}>
                                                            <defs>
                                                                <linearGradient id={`gradient-${currentIntervention.id}`} x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor={currentConfig.gradient.includes('purple') ? '#a855f7' : currentConfig.gradient.includes('blue') ? '#3b82f6' : currentConfig.gradient.includes('emerald') ? '#10b981' : currentConfig.gradient.includes('amber') ? '#f59e0b' : '#6366f1'} stopOpacity={0.4} />
                                                                    <stop offset="95%" stopColor={currentConfig.gradient.includes('purple') ? '#a855f7' : currentConfig.gradient.includes('blue') ? '#3b82f6' : currentConfig.gradient.includes('emerald') ? '#10b981' : currentConfig.gradient.includes('amber') ? '#f59e0b' : '#6366f1'} stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                                                            <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                                                            <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                                                            <Tooltip
                                                                contentStyle={{
                                                                    borderRadius: 16,
                                                                    border: "none",
                                                                    backdropFilter: "blur(12px)",
                                                                    background: "rgba(255,255,255,0.95)",
                                                                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
                                                                }}
                                                            />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="reading"
                                                                stroke={currentConfig.gradient.includes('purple') ? '#a855f7' : currentConfig.gradient.includes('blue') ? '#3b82f6' : currentConfig.gradient.includes('emerald') ? '#10b981' : currentConfig.gradient.includes('amber') ? '#f59e0b' : '#6366f1'}
                                                                strokeWidth={3}
                                                                fill={`url(#gradient-${currentIntervention.id})`}
                                                            />
                                                            <Line
                                                                type="monotone"
                                                                dataKey="goal"
                                                                stroke="#0ea5e9"
                                                                strokeWidth={2}
                                                                strokeDasharray="6 4"
                                                                dot={false}
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                                {[
                                                    { label: "Baseline", value: currentIntervention.baseline, color: "from-pink-500 to-rose-500", bg: "bg-pink-50 dark:bg-pink-900/20" },
                                                    { label: "Current", value: currentIntervention.current, color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                                                    { label: "Target", value: currentIntervention.target, color: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
                                                ].map((stat) => (
                                                    <div key={stat.label} className={`${stat.bg} rounded-xl sm:rounded-2xl p-2.5 sm:p-4 text-center`}>
                                                        <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
                                                        <p className={`text-xl sm:text-2xl font-black bg-gradient-to-r ${stat.color} text-transparent bg-clip-text`}>
                                                            {stat.value ?? "-"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{currentIntervention.progressUnit || "pts"}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Intervention Details */}
                                            <div className={`${currentConfig.lightBg} rounded-2xl p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4`}>
                                                <div>
                                                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                                        <Zap className="w-3 h-3" /> Strategy
                                                    </p>
                                                    <p className="text-sm font-semibold text-foreground dark:text-white truncate">
                                                        {strategyLabel}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> Duration
                                                    </p>
                                                    <p className="text-sm font-semibold text-foreground dark:text-white">
                                                        {durationLabel}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                                        <BarChart3 className="w-3 h-3" /> Frequency
                                                    </p>
                                                    <p className="text-sm font-semibold text-foreground dark:text-white">
                                                        {frequencyLabel}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                                        <Award className="w-3 h-3" /> Mentor
                                                    </p>
                                                    <p className="text-sm font-semibold text-foreground dark:text-white truncate">
                                                        {mentorLabel}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: History */}
                                        <div className="lg:w-80 xl:w-96">
                                            <div className={`${glass.inner} rounded-2xl p-4 h-full`}>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentConfig.gradient} flex items-center justify-center shadow-lg`}>
                                                        <Sparkles className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Check-in History</p>
                                                        <h4 className="text-base font-bold text-foreground dark:text-white">Recent Reflections</h4>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 max-h-56 sm:max-h-80 overflow-y-auto pr-0 sm:pr-1 custom-scroll">
                                                    {(currentIntervention.history || []).length > 0 ? (
                                                        currentIntervention.history.map((entry, idx) => (
                                                            <motion.div
                                                                key={idx}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.1 + idx * 0.05 }}
                                                                className={`${currentConfig.lightBg} rounded-xl p-3 ${currentConfig.border} border`}
                                                            >
                                                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                                                                    <CalendarDays className="w-3 h-3" />
                                                                    {entry.date}
                                                                </div>
                                                                <p className="text-sm text-foreground dark:text-white">{entry.notes}</p>
                                                                {entry.score != null && (
                                                                    <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${currentConfig.lightBg} ${currentConfig.text} text-xs font-medium`}>
                                                                        <TrendingUp className="w-3 h-3" />
                                                                        {entry.score} {currentIntervention.progressUnit || "pts"}
                                                                    </div>
                                                                )}
                                                                {entry.celebration && (
                                                                    <div className="mt-2 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full inline-flex items-center gap-1">
                                                                        🎉 {entry.celebration}
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-8 text-muted-foreground">
                                                            <span className="text-3xl block mb-2">📝</span>
                                                            <p className="text-sm">No check-ins yet</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.section>
                            )}
                        </AnimatePresence>

                        {/* No intervention selected fallback */}
                        {!currentIntervention && sortedInterventions.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`${glass.inner} rounded-2xl p-8 text-center`}
                            >
                                <Star className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                                <h3 className="text-xl font-bold text-foreground dark:text-white mb-2">
                                    Universal Supports Active
                                </h3>
                                <p className="text-muted-foreground">
                                    This student is receiving Tier 1 universal classroom supports.
                                    No targeted interventions are currently assigned.
                                </p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
});

StudentProfilePage.displayName = "StudentProfilePage";
export default StudentProfilePage;
