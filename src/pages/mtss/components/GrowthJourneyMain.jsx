import { useState, useCallback, useMemo } from "react";
import { TrendingUp, Zap, Clock, BarChart3, Award, Target, ClipboardList, CalendarDays, FileText, ChevronRight, ChevronDown, History } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Line, ReferenceLine, Legend } from "recharts";
import NotesBottomSheet from "./NotesBottomSheet";
import InfoCardDetailSheet from "./InfoCardDetailSheet";

const isMeaningfulValue = (value) => {
    if (value === null || value === undefined) return false;
    const text = `${value}`.trim();
    if (!text) return false;
    const normalized = text.toLowerCase();
    if (["not set", "tbd", "-"].includes(normalized)) return false;
    return /[a-z0-9]/i.test(text);
};

const MONITORING_TONES = {
    SEL: {
        bar: "from-rose-500 via-pink-500 to-fuchsia-500",
        icon: "from-rose-500 to-pink-500",
        bg: "from-rose-50 via-white to-pink-50",
        text: "text-rose-700 dark:text-rose-200",
        shadow: "shadow-[0_18px_50px_rgba(244,63,94,0.18)]",
    },
    ENGLISH: {
        bar: "from-sky-500 via-blue-500 to-indigo-500",
        icon: "from-sky-500 to-blue-500",
        bg: "from-sky-50 via-white to-blue-50",
        text: "text-sky-700 dark:text-sky-200",
        shadow: "shadow-[0_18px_50px_rgba(14,165,233,0.18)]",
    },
    MATH: {
        bar: "from-emerald-500 via-teal-500 to-green-500",
        icon: "from-emerald-500 to-teal-500",
        bg: "from-emerald-50 via-white to-teal-50",
        text: "text-emerald-700 dark:text-emerald-200",
        shadow: "shadow-[0_18px_50px_rgba(16,185,129,0.18)]",
    },
    BEHAVIOR: {
        bar: "from-amber-500 via-orange-500 to-yellow-500",
        icon: "from-amber-500 to-orange-500",
        bg: "from-amber-50 via-white to-orange-50",
        text: "text-amber-700 dark:text-amber-200",
        shadow: "shadow-[0_18px_50px_rgba(245,158,11,0.18)]",
    },
    ATTENDANCE: {
        bar: "from-indigo-500 via-violet-500 to-purple-500",
        icon: "from-indigo-500 to-violet-500",
        bg: "from-indigo-50 via-white to-violet-50",
        text: "text-indigo-700 dark:text-indigo-200",
        shadow: "shadow-[0_18px_50px_rgba(99,102,241,0.18)]",
    },
    INDONESIAN: {
        bar: "from-rose-500 via-red-500 to-pink-500",
        icon: "from-rose-500 to-red-500",
        bg: "from-rose-50 via-white to-red-50",
        text: "text-rose-700 dark:text-rose-200",
        shadow: "shadow-[0_18px_50px_rgba(225,29,72,0.18)]",
    },
    DEFAULT: {
        bar: "from-cyan-500 via-sky-500 to-blue-500",
        icon: "from-cyan-500 to-blue-500",
        bg: "from-cyan-50 via-white to-sky-50",
        text: "text-sky-700 dark:text-sky-200",
        shadow: "shadow-[0_18px_50px_rgba(14,165,233,0.18)]",
    },
};

const formatMethodShort = (method) => {
    if (!method) return "Not set";
    return method.replace(/^Option \d+ - /, "");
};

const formatLogDate = (dateValue) => {
    if (!dateValue) return "";
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
};

const SIGNAL_META = {
    emerging: {
        label: "Emerging",
        chip: "bg-amber-100 text-amber-700 dark:bg-amber-900/35 dark:text-amber-300",
        text: "text-amber-700 dark:text-amber-300",
        bar: "bg-amber-500",
    },
    developing: {
        label: "Developing",
        chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-300",
        text: "text-emerald-700 dark:text-emerald-300",
        bar: "bg-emerald-500",
    },
    consistent: {
        label: "Consistent",
        chip: "bg-green-100 text-green-700 dark:bg-green-900/35 dark:text-green-300",
        text: "text-green-700 dark:text-green-300",
        bar: "bg-green-500",
    },
};

const WEEKLY_FOCUS_META = {
    continue: { label: "Continue", chip: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
    try: { label: "Try", chip: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" },
    support_needed: { label: "Support Needed", chip: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" },
};

const DOMAIN_LABELS = {
    emotional_regulation: "Emotional Regulation",
    language: "Language",
    social: "Social",
    motor: "Motor Skills",
    independence: "Independence",
};

const InfoCard = ({ icon: Icon, label, value, gradient, shortLabel, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/60 dark:border-slate-700/40 bg-white/85 dark:bg-slate-900/50 p-2 sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg text-left w-full cursor-pointer active:scale-[0.97]"
    >
        <div className="absolute inset-x-0 top-0 h-0.5 sm:h-1 bg-gradient-to-r opacity-90" style={{}} />
        <div className={`absolute inset-x-0 top-0 h-0.5 sm:h-1 bg-gradient-to-r ${gradient} opacity-90`} />
        <div className="flex items-center gap-1.5 sm:gap-2">
            <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-105 flex-shrink-0`}>
                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-muted-foreground leading-tight">
                    <span className="sm:hidden">{shortLabel || label}</span>
                    <span className="hidden sm:inline">{label}</span>
                </p>
                <p className="text-[11px] sm:text-sm font-semibold text-foreground dark:text-white truncate leading-tight">
                    {value}
                </p>
            </div>
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground/50 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </div>
    </button>
);

/* ── iOS-style Plan Change Log ── */
const PlanChangeLog = ({ entries }) => {
    const [open, setOpen] = useState(false);
    const sorted = useMemo(
        () => [...entries].sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt)),
        [entries]
    );

    return (
        <div
            className="rounded-2xl border border-white/60 dark:border-slate-700/40 overflow-hidden"
            style={{
                background: "hsl(var(--card) / 0.85)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
            }}
        >
            {/* header / toggle */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 w-full px-3 py-2.5 sm:px-4 sm:py-3 text-left active:bg-slate-100/60 dark:active:bg-slate-800/40 transition-colors duration-150"
                style={{ WebkitTapHighlightColor: "transparent" }}
            >
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-[10px] bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                    <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>
                <div className="flex-1 min-w-0">
                    <span
                        className="text-[13px] sm:text-sm font-semibold text-foreground"
                        style={{ fontFamily: "-apple-system, 'SF Pro Text', system-ui, sans-serif" }}
                    >
                        Update Log
                    </span>
                    <span className="ml-2 text-[11px] sm:text-xs text-muted-foreground/50">
                        {entries.length}
                    </span>
                </div>
                <ChevronDown
                    className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                />
            </button>

            {/* collapsible content — CSS grid trick for smooth height */}
            <div
                className="transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] grid"
                style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
            >
                <div className="overflow-hidden">
                    <div className="px-3 pb-3 sm:px-4 sm:pb-4 max-h-52 overflow-y-auto overscroll-contain">
                        {/* separator */}
                        <div className="h-px bg-slate-200/60 dark:bg-slate-700/40 mb-2.5" />

                        <div className="space-y-1.5">
                            {sorted.map((entry, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200"
                                    style={{
                                        background: "hsl(var(--muted) / 0.3)",
                                        opacity: open ? 1 : 0,
                                        transform: open ? "translateY(0)" : "translateY(-6px)",
                                        transitionDelay: open ? `${Math.min(idx * 40, 200)}ms` : "0ms",
                                    }}
                                >
                                    {/* timeline dot + line */}
                                    <div className="flex flex-col items-center shrink-0 pt-1">
                                        <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_0_2px_hsl(var(--card))]" />
                                        {idx < sorted.length - 1 && (
                                            <div className="w-px flex-1 mt-1 bg-amber-300/30 dark:bg-amber-500/20 min-h-[12px]" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        {/* field label + date */}
                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                            <span
                                                className="text-[11px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400"
                                                style={{ fontFamily: "-apple-system, 'SF Pro Text', system-ui, sans-serif" }}
                                            >
                                                {entry.label}
                                            </span>
                                            {entry.changedAt && (
                                                <span className="text-[10px] text-muted-foreground/45 whitespace-nowrap shrink-0">
                                                    {formatLogDate(entry.changedAt)}
                                                </span>
                                            )}
                                        </div>
                                        {/* from → to */}
                                        <div className="text-[11px] sm:text-xs leading-relaxed">
                                            <span className="text-muted-foreground/70 line-through decoration-muted-foreground/25">
                                                {formatMethodShort(entry.fromValue) || "Not set"}
                                            </span>
                                            <span className="mx-1.5 text-muted-foreground/35">&rarr;</span>
                                            <span
                                                className="font-semibold text-foreground"
                                                style={{ fontFamily: "-apple-system, 'SF Pro Text', system-ui, sans-serif" }}
                                            >
                                                {formatMethodShort(entry.toValue) || "Not set"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GrowthJourneyMain = ({
    intervention,
    config,
    CurrentIcon,
    strategyLabel,
    durationLabel,
    frequencyLabel,
    mentorLabel,
    goalLabel,
    monitoringMethodLabel,
    startDateLabel,
    notesLabel,
}) => {
    const hasStrategy = isMeaningfulValue(strategyLabel);
    const hasDuration = isMeaningfulValue(durationLabel);
    const hasFrequency = isMeaningfulValue(frequencyLabel);
    const hasMentor = isMeaningfulValue(mentorLabel);
    const hasGoal = isMeaningfulValue(goalLabel);
    const hasMonitoring = isMeaningfulValue(monitoringMethodLabel);
    const hasStartDate = isMeaningfulValue(startDateLabel);
    const hasNotes = isMeaningfulValue(notesLabel);

    const hasCompactRow = hasStrategy || hasDuration || hasFrequency || hasMentor;
    const toneKey = intervention?.type?.toUpperCase?.() || "DEFAULT";
    const monitoringTone = MONITORING_TONES[toneKey] || MONITORING_TONES.DEFAULT;
    const isQualitative = intervention?.mode === "qualitative";
    const latestSignal = intervention?.latestSignal || null;
    const latestWeeklyFocus = intervention?.latestWeeklyFocus || null;
    const latestTags = Array.isArray(intervention?.latestTags) ? intervention.latestTags : [];
    const latestContext = intervention?.latestContext || null;
    const latestObservation = intervention?.latestObservation || null;
    const latestResponse = intervention?.latestResponse || null;
    const latestNextStep = intervention?.latestNextStep || null;
    const signalDistribution = intervention?.signalDistribution || {};
    const signalKeys = ["emerging", "developing", "consistent"];
    const totalSignals = signalKeys.reduce((sum, key) => sum + Number(signalDistribution[key] || 0), 0);
    const latestHistory = Array.isArray(intervention?.history) ? intervention.history[0] : null;
    const lastObservationDate = latestHistory?.date || "-";
    const [notesSheetOpen, setNotesSheetOpen] = useState(false);
    const [detailSheet, setDetailSheet] = useState(null);

    const openDetail = useCallback((key) => setDetailSheet(key), []);
    const closeDetail = useCallback(() => setDetailSheet(null), []);

    return (
        <div className="flex-1 space-y-3 sm:space-y-5">
            {/* Header: Icon + Label */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                        <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[8px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                            {isQualitative ? "Learning Story" : "Growth Journey"}
                        </p>
                        <h3 className="text-sm sm:text-xl font-bold text-foreground dark:text-white flex items-center gap-1.5 sm:gap-2">
                            <div className={`w-6 h-6 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                                <CurrentIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <span className="truncate">{intervention.label}</span>
                        </h3>
                    </div>
                </div>
                {isQualitative ? (
                    <div className="flex flex-col items-end gap-1">
                        {latestSignal && (
                            <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${SIGNAL_META[latestSignal]?.chip || "bg-slate-100 text-slate-700"}`}>
                                Signal: {SIGNAL_META[latestSignal]?.label || latestSignal}
                            </span>
                        )}
                        {!latestSignal && (
                            <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
                                Signal not logged
                            </span>
                        )}
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                            {intervention.checkInsCount || 0} observations
                        </span>
                    </div>
                ) : (
                    <span className={`text-2xl sm:text-5xl font-black bg-gradient-to-r ${config.gradient} text-transparent bg-clip-text flex-shrink-0`}>
                        {intervention.progress ?? 0}%
                    </span>
                )}
            </div>

            {isQualitative ? (
                <div className="relative rounded-xl sm:rounded-2xl p-2.5 sm:p-4 bg-white/80 dark:bg-slate-800/60 border border-white/60 dark:border-slate-700/40 space-y-3">
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                        <div className="rounded-lg sm:rounded-2xl p-2 sm:p-4 text-center bg-emerald-50 dark:bg-emerald-900/20">
                            <p className="text-[8px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-0.5 sm:mb-1">Observations</p>
                            <p className="text-base sm:text-2xl font-black text-emerald-600 dark:text-emerald-300">{intervention.checkInsCount || 0}</p>
                            <p className="text-[8px] sm:text-xs text-muted-foreground">journal logs</p>
                        </div>
                        <div className="rounded-lg sm:rounded-2xl p-2 sm:p-4 text-center bg-violet-50 dark:bg-violet-900/20">
                            <p className="text-[8px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-0.5 sm:mb-1">Last Logged</p>
                            <p className="text-[11px] sm:text-base font-bold text-violet-700 dark:text-violet-300">{lastObservationDate}</p>
                            <p className="text-[8px] sm:text-xs text-muted-foreground">latest update</p>
                        </div>
                        <div className="rounded-lg sm:rounded-2xl p-2 sm:p-4 text-center bg-amber-50 dark:bg-amber-900/20">
                            <p className="text-[8px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-0.5 sm:mb-1">Weekly Focus</p>
                            <p className="text-[11px] sm:text-base font-bold text-amber-700 dark:text-amber-300">
                                {WEEKLY_FOCUS_META[latestWeeklyFocus]?.label || "Not set"}
                            </p>
                            <p className="text-[8px] sm:text-xs text-muted-foreground">teacher intent</p>
                        </div>
                    </div>

                    <div className="rounded-lg sm:rounded-xl border border-white/60 dark:border-slate-700/40 bg-white/70 dark:bg-slate-900/50 p-2 sm:p-3">
                        <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Signal Distribution</p>
                        <div className="space-y-1.5">
                            {signalKeys.map((signalKey) => {
                                const count = Number(signalDistribution[signalKey] || 0);
                                const ratio = totalSignals > 0 ? Math.round((count / totalSignals) * 100) : 0;
                                return (
                                    <div key={signalKey} className="space-y-0.5">
                                        <div className="flex items-center justify-between text-[10px] sm:text-xs">
                                            <span className={`font-semibold ${SIGNAL_META[signalKey].text}`}>
                                                {SIGNAL_META[signalKey].label}
                                            </span>
                                            <span className="text-muted-foreground">{count}</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${SIGNAL_META[signalKey].bar}`}
                                                style={{ width: `${ratio}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-lg sm:rounded-xl border border-white/60 dark:border-slate-700/40 bg-white/70 dark:bg-slate-900/50 p-2.5 sm:p-3">
                        <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">CORN Observation Snapshot</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            <div className="rounded-lg border border-slate-200/70 dark:border-slate-700/50 p-2">
                                <p className="text-[8px] uppercase tracking-wider text-muted-foreground">Context</p>
                                <p className="text-[10px] sm:text-xs text-foreground dark:text-slate-100 leading-snug">{latestContext || "-"}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200/70 dark:border-slate-700/50 p-2">
                                <p className="text-[8px] uppercase tracking-wider text-muted-foreground">Observation</p>
                                <p className="text-[10px] sm:text-xs text-foreground dark:text-slate-100 leading-snug">{latestObservation || "-"}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200/70 dark:border-slate-700/50 p-2">
                                <p className="text-[8px] uppercase tracking-wider text-muted-foreground">Response</p>
                                <p className="text-[10px] sm:text-xs text-foreground dark:text-slate-100 leading-snug">{latestResponse || "-"}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200/70 dark:border-slate-700/50 p-2">
                                <p className="text-[8px] uppercase tracking-wider text-muted-foreground">Next Step</p>
                                <p className="text-[10px] sm:text-xs text-foreground dark:text-slate-100 leading-snug">{latestNextStep || "-"}</p>
                            </div>
                        </div>
                        {latestTags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                {latestTags.map((tag) => (
                                    <span key={tag} className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                                        {DOMAIN_LABELS[tag] || tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    {/* Chart */}
                    <div className="relative rounded-xl sm:rounded-2xl p-2.5 sm:p-4 bg-white/80 dark:bg-slate-800/60 border border-white/60 dark:border-slate-700/40">
                        <div className="h-40 sm:h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={intervention.chart || []} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id={`gradient-${intervention.id}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={config.chartColor} stopOpacity={0.35} />
                                            <stop offset="95%" stopColor={config.chartColor} stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" vertical={false} />
                                    {intervention.target != null && (
                                        <ReferenceLine
                                            y={Number(intervention.target) || 0}
                                            stroke="#f59e0b"
                                            strokeDasharray="8 4"
                                            strokeWidth={1.5}
                                            label={{ value: `Target: ${intervention.target}`, position: "insideTopRight", fill: "#f59e0b", fontSize: 9, fontWeight: 600 }}
                                        />
                                    )}
                                    {intervention.baseline != null && (
                                        <ReferenceLine
                                            y={Number(intervention.baseline) || 0}
                                            stroke="#f472b6"
                                            strokeDasharray="4 4"
                                            strokeWidth={1}
                                            label={{ value: `Baseline: ${intervention.baseline}`, position: "insideBottomRight", fill: "#f472b6", fontSize: 9, fontWeight: 600 }}
                                        />
                                    )}
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fill: "rgba(148,163,184,1)", fontSize: 9, fontWeight: 500 }}
                                        stroke="rgba(148,163,184,0.3)"
                                        tickLine={false}
                                        dy={4}
                                    />
                                    <YAxis
                                        tick={{ fill: "rgba(148,163,184,1)", fontSize: 9, fontWeight: 500 }}
                                        stroke="rgba(148,163,184,0.3)"
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: 14,
                                            border: "1px solid rgba(148,163,184,0.2)",
                                            backdropFilter: "blur(16px)",
                                            background: "rgba(255,255,255,0.95)",
                                            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                                            fontSize: 12,
                                            padding: "8px 12px",
                                        }}
                                        labelStyle={{ fontWeight: 700, marginBottom: 4, color: "#334155" }}
                                        formatter={(value, name) => {
                                            const label = name === "reading" ? "Score" : name === "goal" ? "Goal Line" : name;
                                            return [value, label];
                                        }}
                                        cursor={{ stroke: config.chartColor, strokeWidth: 1, strokeDasharray: "4 4" }}
                                    />
                                    <Legend
                                        verticalAlign="top"
                                        align="right"
                                        iconType="circle"
                                        iconSize={7}
                                        wrapperStyle={{ fontSize: 10, fontWeight: 600, paddingBottom: 4 }}
                                        formatter={(value) => {
                                            if (value === "reading") return "Progress";
                                            if (value === "goal") return "Goal Line";
                                            return value;
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="reading"
                                        name="reading"
                                        stroke={config.chartColor}
                                        strokeWidth={2.5}
                                        fill={`url(#gradient-${intervention.id})`}
                                        dot={{ r: 3, fill: config.chartColor, stroke: "#fff", strokeWidth: 1.5 }}
                                        activeDot={{ r: 5, fill: config.chartColor, stroke: "#fff", strokeWidth: 2 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="goal"
                                        name="goal"
                                        stroke="#0ea5e9"
                                        strokeWidth={2}
                                        strokeDasharray="6 4"
                                        dot={false}
                                        activeDot={{ r: 4, fill: "#0ea5e9", stroke: "#fff", strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Baseline / Current / Target */}
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-3 max-w-2xl mx-auto">
                        {[
                            { label: "Baseline", value: intervention.baseline, color: "from-pink-500 to-rose-500", bg: "bg-pink-50 dark:bg-pink-900/20" },
                            { label: "Current", value: intervention.current, color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                            { label: "Target", value: intervention.target, color: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
                        ].map((stat) => (
                            <div key={stat.label} className={`${stat.bg} rounded-lg sm:rounded-2xl p-2 sm:p-4 text-center`}>
                                <p className="text-[8px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-0.5 sm:mb-1">{stat.label}</p>
                                <p className={`text-base sm:text-2xl font-black bg-gradient-to-r ${stat.color} text-transparent bg-clip-text`}>
                                    {stat.value ?? "-"}
                                </p>
                                <p className="text-[8px] sm:text-xs text-muted-foreground">{intervention.progressUnit || "pts"}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Info Cards — 2-col grid on mobile */}
            {(hasCompactRow || hasGoal || hasMonitoring || hasStartDate || hasNotes) && (
                <div className="rounded-xl sm:rounded-2xl border border-white/50 dark:border-slate-700/30 bg-white/70 dark:bg-slate-900/40 p-2.5 sm:p-5 space-y-2.5 sm:space-y-4">
                    {/* Strategy / Duration / Frequency / Mentor */}
                    {hasCompactRow && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-3">
                            {hasStrategy && (
                                <InfoCard icon={Zap} label="Strategy" value={strategyLabel} gradient="from-sky-500 to-blue-500" onClick={() => openDetail("strategy")} />
                            )}
                            {hasDuration && (
                                <InfoCard icon={Clock} label="Duration" shortLabel="Dur." value={durationLabel} gradient="from-amber-500 to-orange-500" onClick={() => openDetail("duration")} />
                            )}
                            {hasFrequency && (
                                <InfoCard icon={BarChart3} label="Frequency" shortLabel="Freq." value={frequencyLabel} gradient="from-emerald-500 to-teal-500" onClick={() => openDetail("frequency")} />
                            )}
                            {hasMentor && (
                                <InfoCard icon={Award} label="Mentor" value={mentorLabel} gradient="from-violet-500 to-fuchsia-500" onClick={() => openDetail("mentor")} />
                            )}
                        </div>
                    )}

                    {/* Goal + Monitoring — 2-col on mobile */}
                    {(hasGoal || hasMonitoring) && (
                        <div className={`grid ${hasGoal && hasMonitoring ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-1.5 sm:gap-3`}>
                            {hasGoal && (
                                <button
                                    type="button"
                                    onClick={() => openDetail("goal")}
                                    className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/60 dark:border-slate-700/40 bg-white/85 dark:bg-slate-900/50 p-2.5 sm:p-4 shadow-sm text-left w-full cursor-pointer active:scale-[0.98] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                                >
                                    <div className="absolute inset-x-0 top-0 h-0.5 sm:h-1.5 bg-gradient-to-r from-rose-500 to-pink-500 opacity-90" />
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-[10px] uppercase tracking-wider text-muted-foreground">
                                            <span className="w-6 h-6 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
                                                <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </span>
                                            Goal
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/50 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                    <p className="mt-1.5 sm:mt-3 text-[11px] sm:text-sm font-semibold text-foreground dark:text-white line-clamp-2 leading-snug sm:leading-relaxed">
                                        {goalLabel}
                                    </p>
                                </button>
                            )}

                            {hasMonitoring && (
                                <button
                                    type="button"
                                    onClick={() => openDetail("monitoring")}
                                    className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/70 dark:border-slate-700/40 bg-gradient-to-br ${monitoringTone.bg} dark:from-slate-900/70 dark:via-slate-900/60 dark:to-slate-900/40 p-2.5 sm:p-5 text-left w-full cursor-pointer active:scale-[0.98] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg`}
                                >
                                    <div className={`absolute inset-x-0 top-0 h-1 sm:h-2.5 bg-gradient-to-r ${monitoringTone.bar}`} />
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            <div className={`flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-[10px] uppercase tracking-wider ${monitoringTone.text}`}>
                                                <span className={`w-6 h-6 sm:w-11 sm:h-11 rounded-lg sm:rounded-2xl bg-gradient-to-br ${monitoringTone.icon} flex items-center justify-center text-white shadow-md flex-shrink-0`}>
                                                    <ClipboardList className="w-3 h-3 sm:w-5 sm:h-5" />
                                                </span>
                                                <span className="sm:hidden">Monitor</span>
                                                <span className="hidden sm:inline">Monitoring Method</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/50 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                    <p className="mt-1.5 sm:mt-4 text-[11px] sm:text-base font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug sm:leading-relaxed">
                                        {monitoringMethodLabel}
                                    </p>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Plan Change Log — iOS-style disclosure */}
                    {intervention?.planChangeLog?.length > 0 && (
                        <PlanChangeLog entries={intervention.planChangeLog} />
                    )}

                    {/* Start Date + Notes — always 2-col */}
                    {(hasStartDate || hasNotes) && (
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
                            {hasStartDate && (
                                <InfoCard icon={CalendarDays} label="Start Date" shortLabel="Start" value={startDateLabel} gradient="from-indigo-500 to-purple-500" onClick={() => openDetail("startDate")} />
                            )}
                            {hasNotes && (
                                <button
                                    type="button"
                                    onClick={() => setNotesSheetOpen(true)}
                                    className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/60 dark:border-slate-700/40 bg-white/85 dark:bg-slate-900/50 p-2 sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg text-left w-full cursor-pointer active:scale-[0.98]"
                                >
                                    <div className="absolute inset-x-0 top-0 h-0.5 sm:h-1 bg-gradient-to-r from-amber-500 to-yellow-500 opacity-90" />
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-105 flex-shrink-0">
                                            <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-muted-foreground leading-tight">Notes</p>
                                            <p className="text-[11px] sm:text-sm font-semibold text-foreground dark:text-white leading-snug line-clamp-1">
                                                {notesLabel}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Notes Bottom Sheet */}
            <NotesBottomSheet
                open={notesSheetOpen}
                onOpenChange={setNotesSheetOpen}
                notes={notesLabel}
                interventionLabel={intervention?.label}
            />

            {/* Detail Sheets for InfoCards */}
            <InfoCardDetailSheet open={detailSheet === "strategy"} onOpenChange={closeDetail} icon={Zap} label="Strategy" gradient="from-sky-500 to-blue-500">
                <p className="text-sm font-semibold text-foreground dark:text-white leading-relaxed break-words">
                    {strategyLabel}
                </p>
            </InfoCardDetailSheet>

            <InfoCardDetailSheet open={detailSheet === "duration"} onOpenChange={closeDetail} icon={Clock} label="Duration" gradient="from-amber-500 to-orange-500">
                <p className="text-sm font-semibold text-foreground dark:text-white leading-relaxed">
                    {durationLabel}
                </p>
            </InfoCardDetailSheet>

            <InfoCardDetailSheet open={detailSheet === "frequency"} onOpenChange={closeDetail} icon={BarChart3} label="Frequency" gradient="from-emerald-500 to-teal-500">
                <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground dark:text-white">
                        {intervention?.monitoringFrequency || frequencyLabel}
                    </p>
                    {intervention?.monitoringFrequency === "Custom" && Array.isArray(intervention?.customFrequencyDays) && intervention.customFrequencyDays.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Selected Days</p>
                            <div className="flex flex-wrap gap-2">
                                {intervention.customFrequencyDays.map((day) => (
                                    <span key={day} className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200/60 dark:border-emerald-700/40">
                                        {day}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {intervention?.monitoringFrequency === "Custom" && intervention?.customFrequencyNote && (
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Note</p>
                            <p className="text-sm text-foreground dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/40">
                                {intervention.customFrequencyNote}
                            </p>
                        </div>
                    )}
                </div>
            </InfoCardDetailSheet>

            <InfoCardDetailSheet open={detailSheet === "mentor"} onOpenChange={closeDetail} icon={Award} label="Mentor" gradient="from-violet-500 to-fuchsia-500">
                <p className="text-sm font-semibold text-foreground dark:text-white leading-relaxed">
                    {mentorLabel}
                </p>
            </InfoCardDetailSheet>

            <InfoCardDetailSheet open={detailSheet === "goal"} onOpenChange={closeDetail} icon={Target} label="Goal" gradient="from-rose-500 to-pink-500">
                <p className="text-sm font-semibold text-foreground dark:text-white leading-relaxed break-words whitespace-pre-wrap">
                    {goalLabel}
                </p>
            </InfoCardDetailSheet>

            <InfoCardDetailSheet open={detailSheet === "monitoring"} onOpenChange={closeDetail} icon={ClipboardList} label="Monitoring Method" gradient={monitoringTone.icon}>
                <p className="text-sm font-semibold text-foreground dark:text-white leading-relaxed break-words">
                    {monitoringMethodLabel}
                </p>
            </InfoCardDetailSheet>

            <InfoCardDetailSheet open={detailSheet === "startDate"} onOpenChange={closeDetail} icon={CalendarDays} label="Start Date" gradient="from-indigo-500 to-purple-500">
                <p className="text-sm font-semibold text-foreground dark:text-white leading-relaxed">
                    {startDateLabel}
                </p>
            </InfoCardDetailSheet>
        </div>
    );
};

export default GrowthJourneyMain;
