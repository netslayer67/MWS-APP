import { TrendingUp, Zap, Clock, BarChart3, Award, Target, ClipboardList, CalendarDays, FileText } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Line } from "recharts";

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
    DEFAULT: {
        bar: "from-cyan-500 via-sky-500 to-blue-500",
        icon: "from-cyan-500 to-blue-500",
        bg: "from-cyan-50 via-white to-sky-50",
        text: "text-sky-700 dark:text-sky-200",
        shadow: "shadow-[0_18px_50px_rgba(14,165,233,0.18)]",
    },
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

    return (
        <div className="flex-1 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Growth Journey</p>
                        <h3 className="text-xl font-bold text-foreground dark:text-white flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
                                <CurrentIcon className="w-5 h-5 text-white" />
                            </div>
                            {intervention.label}
                        </h3>
                    </div>
                </div>
                <div className="text-right">
                    <span className={`text-3xl sm:text-5xl font-black bg-gradient-to-r ${config.gradient} text-transparent bg-clip-text`}>
                        {intervention.progress || 0}%
                    </span>
                </div>
            </div>

            <div className={`${config.lightBg} rounded-2xl p-4`}>
                <div className="h-44 sm:h-60">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={intervention.chart || []}>
                            <defs>
                                <linearGradient id={`gradient-${intervention.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={config.chartColor} stopOpacity={0.4} />
                                    <stop offset="95%" stopColor={config.chartColor} stopOpacity={0} />
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
                                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="reading"
                                stroke={config.chartColor}
                                strokeWidth={3}
                                fill={`url(#gradient-${intervention.id})`}
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

            <div className="flex justify-center">
                <div className="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
                    {[
                        { label: "Baseline", value: intervention.baseline, color: "from-pink-500 to-rose-500", bg: "bg-pink-50 dark:bg-pink-900/20" },
                        { label: "Current", value: intervention.current, color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                        { label: "Target", value: intervention.target, color: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
                    ].map((stat) => (
                        <div key={stat.label} className={`${stat.bg} rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center`}>
                            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
                            <p className={`text-xl sm:text-2xl font-black bg-gradient-to-r ${stat.color} text-transparent bg-clip-text`}>
                                {stat.value ?? "-"}
                            </p>
                            <p className="text-xs text-muted-foreground">{intervention.progressUnit || "pts"}</p>
                        </div>
                    ))}
                </div>
            </div>

            {(hasCompactRow || hasGoal || hasMonitoring || hasStartDate || hasNotes) && (
                <div className="rounded-2xl border border-white/50 bg-white/70 dark:bg-slate-900/40 p-4 sm:p-5 space-y-5">
                    {hasCompactRow && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            {hasStrategy && (
                                <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/85 dark:bg-slate-900/50 p-3 sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 to-blue-500 opacity-90" />
                                    <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                                        <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-105">
                                            <Zap className="w-4 h-4" />
                                        </span>
                                        Strategy
                                    </div>
                                    <p className="mt-2 text-sm sm:text-base font-semibold text-foreground dark:text-white truncate">
                                        {strategyLabel}
                                    </p>
                                </div>
                            )}
                            {hasDuration && (
                                <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/85 dark:bg-slate-900/50 p-3 sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-90" />
                                    <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                                        <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-105">
                                            <Clock className="w-4 h-4" />
                                        </span>
                                        Duration
                                    </div>
                                    <p className="mt-2 text-sm sm:text-base font-semibold text-foreground dark:text-white truncate">
                                        {durationLabel}
                                    </p>
                                </div>
                            )}
                            {hasFrequency && (
                                <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/85 dark:bg-slate-900/50 p-3 sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-90" />
                                    <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                                        <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-105">
                                            <BarChart3 className="w-4 h-4" />
                                        </span>
                                        Frequency
                                    </div>
                                    <p className="mt-2 text-sm sm:text-base font-semibold text-foreground dark:text-white truncate">
                                        {frequencyLabel}
                                    </p>
                                </div>
                            )}
                            {hasMentor && (
                                <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/85 dark:bg-slate-900/50 p-3 sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-90" />
                                    <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                                        <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-105">
                                            <Award className="w-4 h-4" />
                                        </span>
                                        Mentor
                                    </div>
                                    <p className="mt-2 text-sm sm:text-base font-semibold text-foreground dark:text-white truncate">
                                        {mentorLabel}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {hasGoal && (
                        <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/85 dark:bg-slate-900/50 p-4 shadow-sm">
                            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-rose-500 to-pink-500 opacity-90" />
                            <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md">
                                    <Target className="w-4 h-4" />
                                </span>
                                Goal
                            </div>
                            <p className="mt-3 text-sm sm:text-base font-semibold text-foreground dark:text-white break-words leading-relaxed">
                                {goalLabel}
                            </p>
                        </div>
                    )}

                    {hasMonitoring && (
                        <div className={`relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br ${monitoringTone.bg} dark:from-slate-900/70 dark:via-slate-900/60 dark:to-slate-900/40 p-5 sm:p-6 ${monitoringTone.shadow}`}>
                            <div className={`absolute inset-x-0 top-0 h-2.5 bg-gradient-to-r ${monitoringTone.bar}`} />
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div className={`flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-wider ${monitoringTone.text}`}>
                                    <span className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${monitoringTone.icon} flex items-center justify-center text-white shadow-md`}>
                                        <ClipboardList className="w-5 h-5" />
                                    </span>
                                    Monitoring Method
                                </div>
                                <span className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-muted-foreground">
                                    Focus
                                </span>
                            </div>
                            <p className="mt-4 text-base sm:text-lg font-semibold text-slate-900 dark:text-white break-words leading-relaxed">
                                {monitoringMethodLabel}
                            </p>
                        </div>
                    )}

                    {(hasStartDate || hasNotes) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {hasStartDate && (
                                <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/85 dark:bg-slate-900/50 p-3 sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-90" />
                                    <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                                        <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-105">
                                            <CalendarDays className="w-4 h-4" />
                                        </span>
                                        Start Date
                                    </div>
                                    <p className="mt-2 text-sm sm:text-base font-semibold text-foreground dark:text-white">
                                        {startDateLabel}
                                    </p>
                                </div>
                            )}
                            {hasNotes && (
                                <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/85 dark:bg-slate-900/50 p-3 sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-500 opacity-90" />
                                    <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                                        <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-105">
                                            <FileText className="w-4 h-4" />
                                        </span>
                                        Notes
                                    </div>
                                    <p className="mt-2 text-sm sm:text-base font-semibold text-foreground dark:text-white break-words leading-relaxed">
                                        {notesLabel}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GrowthJourneyMain;

