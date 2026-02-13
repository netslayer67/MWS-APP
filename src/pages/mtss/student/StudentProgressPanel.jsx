import React, { memo, useEffect, useMemo, useState } from "react";
import { CircleDot, Sparkles, Star, TrendingUp } from "lucide-react";
import { buildStudentProfileView } from "../utils/studentProfileUtils";
import { formatMentorDisplay } from "../utils/mentorNameUtils";
import {
    buildFallbackChart,
    buildTrendSeries,
    formatScore,
    resolveTone,
    toProgressPercent,
} from "./studentProgressUtils";

const SUBJECT_EMOJI_MAP = {
    ENGLISH: "📘",
    MATH: "🧮",
    SEL: "💚",
    BEHAVIOR: "🧠",
    ATTENDANCE: "🕒",
};

const formatReviewDate = (value, fallback = "Awaiting schedule") => {
    if (!value) return fallback;
    try {
        return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
    } catch (error) {
        return fallback;
    }
};

const resolveInterventionGoal = (intervention, fallback) => {
    if (!intervention) return fallback;
    if (intervention.goal) return intervention.goal;
    if (Array.isArray(intervention.goals) && intervention.goals.length) {
        const first = intervention.goals.find(Boolean);
        if (typeof first === "string") return first;
        if (first) return first.description || first.goal || first.title || first.name || fallback;
    }
    return intervention.strategyName || intervention.focusArea || fallback;
};

const StudentProgressPanel = ({ student, isLoading = false }) => {
    if (isLoading) {
        return (
            <div className="rounded-[30px] border border-white/70 bg-white/82 p-8 text-center text-sm text-slate-600 shadow-sm dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
                Loading latest MTSS progress...
            </div>
        );
    }

    if (!student) {
        return (
            <div className="rounded-[30px] border border-white/70 bg-white/82 p-8 text-center text-sm text-slate-600 shadow-sm dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
                Student profile data is not available yet.
            </div>
        );
    }

    const {
        profile,
        currentIntervention,
        sortedInterventions,
        strategyLabel,
        goalLabel,
    } = buildStudentProfileView(student);

    const subjectInterventions = sortedInterventions.filter((entry) => entry.hasRealData);
    const visibleSubjects = subjectInterventions.length > 0 ? subjectInterventions : sortedInterventions;
    const [activeSubjectType, setActiveSubjectType] = useState(null);

    useEffect(() => {
        if (!visibleSubjects.length) {
            if (activeSubjectType !== null) setActiveSubjectType(null);
            return;
        }
        const hasSelected = visibleSubjects.some((item) => item.type === activeSubjectType);
        if (hasSelected) return;
        const fallbackType = currentIntervention?.type || visibleSubjects[0]?.type || null;
        if (fallbackType !== activeSubjectType) {
            setActiveSubjectType(fallbackType);
        }
    }, [activeSubjectType, currentIntervention?.type, visibleSubjects]);

    const activeIntervention = useMemo(() => {
        if (!visibleSubjects.length) return currentIntervention || null;
        return visibleSubjects.find((item) => item.type === activeSubjectType) || currentIntervention || visibleSubjects[0];
    }, [activeSubjectType, currentIntervention, visibleSubjects]);

    const unitLabel = activeIntervention?.progressUnit || profile?.progressUnit || "pts";
    const baseline = activeIntervention?.baseline ?? profile?.baseline;
    const current = activeIntervention?.current ?? profile?.current;
    const target = activeIntervention?.target ?? profile?.target;
    const progressPercent = activeIntervention?.progress ?? toProgressPercent(current, target);
    const nextReviewLabel = formatReviewDate(activeIntervention?.endDate, student.nextUpdate || "Awaiting schedule");

    const chart = Array.isArray(activeIntervention?.chart) && activeIntervention.chart.length
        ? activeIntervention.chart
        : Array.isArray(profile?.chart) && profile.chart.length
            ? profile.chart
            : buildFallbackChart(current, target);

    const updates = Array.isArray(activeIntervention?.history) && activeIntervention.history.length
        ? activeIntervention.history
        : Array.isArray(profile?.history)
            ? profile.history
            : [];

    const tone = resolveTone(progressPercent);
    const mainGoal = resolveInterventionGoal(
        activeIntervention,
        goalLabel || strategyLabel || "Follow your MTSS intervention goals",
    );
    const trend = buildTrendSeries(chart, target);
    const trendLabels = trend.labels.length > 3
        ? [trend.labels[0], trend.labels[Math.floor((trend.labels.length - 1) / 2)], trend.labels[trend.labels.length - 1]]
        : trend.labels;
    const trendSummary = [
        { label: "Start", value: formatScore(trend.baselineValue, unitLabel) },
        { label: "Latest", value: formatScore(trend.latestValue, unitLabel) },
        {
            label: "Change",
            value: trend.deltaValue === null
                ? "-"
                : `${trend.deltaValue > 0 ? "+" : ""}${formatScore(trend.deltaValue, unitLabel)}`,
        },
        { label: "Target", value: formatScore(target, unitLabel) },
    ];

    return (
        <div className="space-y-5">
            <div className="rounded-[34px] border border-white/70 bg-white/82 p-5 shadow-[0_14px_36px_rgba(99,102,241,0.08)] backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/55">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-300">Current Goal</p>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white">{mainGoal}</h3>
                    </div>
                    <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-white/15 dark:bg-white/5 dark:text-slate-100">
                        Next Review: {nextReviewLabel}
                    </div>
                </div>

                {visibleSubjects.length > 1 && (
                    <div className="mt-4 rounded-2xl border border-white/80 bg-gradient-to-r from-fuchsia-50/90 via-violet-50/90 to-cyan-50/90 p-3 dark:border-white/10 dark:from-fuchsia-500/12 dark:via-violet-500/12 dark:to-cyan-500/12">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-violet-600 dark:text-violet-300">
                                Subject Explorer
                            </p>
                            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-300">
                                Tap to switch view
                            </p>
                        </div>
                        <div className="no-scrollbar flex snap-x gap-2 overflow-x-auto pb-1">
                            {visibleSubjects.map((item, index) => {
                                const isActive = item.type === activeIntervention?.type;
                                const subjectEmoji = SUBJECT_EMOJI_MAP[item.type] || SUBJECT_EMOJI_MAP[item.label?.toUpperCase()] || "✨";
                                return (
                                    <button
                                        key={`${item.type}-${item.id || item.label}`}
                                        type="button"
                                        onClick={() => setActiveSubjectType(item.type)}
                                        className={`min-w-[180px] snap-start rounded-2xl border px-3 py-2 text-left transition-all duration-300 ${
                                            isActive
                                                ? "border-violet-300 bg-white shadow-md shadow-violet-200/50 dark:border-violet-400/40 dark:bg-violet-500/20"
                                                : "border-white/80 bg-white/80 hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5"
                                        }`}
                                    >
                                        <p className="text-xs font-black text-slate-700 dark:text-slate-100">
                                            <span className="mr-1">{subjectEmoji}</span>
                                            {item.label}
                                        </p>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-300">
                                            {item.tierLabel || item.tier || "Tier 1"} - {item.status || "monitoring"}
                                        </p>
                                        <div className="mt-2 h-1.5 rounded-full bg-slate-200/80 dark:bg-white/15">
                                            <div
                                                className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 transition-all duration-500"
                                                style={{ width: `${Math.max(0, Math.min(100, item.progress ?? 0))}%` }}
                                            />
                                        </div>
                                        <p className="mt-1 text-[11px] font-semibold text-violet-600 dark:text-violet-300">
                                            Progress: {item.progress ?? 0}%
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl bg-gradient-to-r from-rose-100 to-pink-100 px-4 py-3 dark:from-rose-500/20 dark:to-pink-500/15">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-300">Baseline</p>
                        <p className="text-2xl font-black text-rose-600 dark:text-rose-300">{formatScore(baseline, unitLabel)}</p>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-r from-sky-100 to-blue-100 px-4 py-3 dark:from-sky-500/20 dark:to-blue-500/15">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-300">Current</p>
                        <p className="text-2xl font-black text-sky-600 dark:text-sky-300">{formatScore(current, unitLabel)}</p>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-r from-violet-100 to-indigo-100 px-4 py-3 dark:from-violet-500/20 dark:to-indigo-500/15">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-300">Target</p>
                        <p className="text-2xl font-black text-violet-600 dark:text-violet-300">{formatScore(target, unitLabel)}</p>
                    </div>
                    <div className={`rounded-2xl bg-gradient-to-r ${tone.badge} px-4 py-3 text-white`}>
                        <p className="text-[11px] uppercase tracking-[0.28em] text-white/85">Progress</p>
                        <p className="text-2xl font-black">{progressPercent === null ? "-" : `${progressPercent}%`}</p>
                        <p className="text-xs font-semibold text-white/85">{tone.helper}</p>
                    </div>
                </div>

                {visibleSubjects.length > 0 && (
                    <div className="mt-4 rounded-2xl border border-white/80 bg-gradient-to-r from-indigo-50/85 to-fuchsia-50/85 px-4 py-3 dark:border-white/10 dark:from-indigo-500/12 dark:to-fuchsia-500/12">
                        <div className="mb-2 flex items-center gap-2">
                            <CircleDot className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-300" />
                            <p className="text-xs font-bold uppercase tracking-[0.28em] text-indigo-600 dark:text-indigo-300">
                                Intervention Subjects
                            </p>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                            {visibleSubjects.map((item) => (
                                <button
                                    key={`${item.type}-${item.id || item.label}`}
                                    type="button"
                                    onClick={() => setActiveSubjectType(item.type)}
                                    className={`rounded-xl border px-3 py-2 text-left transition-all duration-300 ${
                                        item.type === activeIntervention?.type
                                            ? "border-violet-300 bg-white shadow-md shadow-violet-200/50 dark:border-violet-400/40 dark:bg-violet-500/20"
                                            : "border-white/75 bg-white/90 hover:-translate-y-0.5 dark:border-white/20 dark:bg-white/10"
                                    }`}
                                >
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-100">{item.label}</p>
                                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-300">
                                        {item.tierLabel || item.tier || "Tier 1"} - {item.status || "monitoring"}
                                    </p>
                                    <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-300">
                                        Progress: {item.progress ?? 0}%
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-300">
                                        Mentor: {formatMentorDisplay({
                                            name: item.mentor,
                                            nickname: item.mentorNickname,
                                            username: item.mentorUsername,
                                            gender: item.mentorGender,
                                        })}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-[30px] border border-white/70 bg-white/82 p-5 shadow-md backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/55">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-300">Trend</p>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">Progress Trend</h3>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                                {activeIntervention?.label || "Intervention"} over time compared to target. Higher line means better progress.
                            </p>
                        </div>
                        <Sparkles className="h-5 w-5 text-fuchsia-500 dark:text-fuchsia-300" />
                    </div>

                    <div className={`rounded-2xl border border-slate-200/80 bg-gradient-to-r ${tone.hero} p-3 shadow-inner dark:border-white/10`}>
                        <svg viewBox="0 0 600 200" className="h-48 w-full">
                            <defs>
                                <linearGradient id="portalSparkLine" x1="0%" x2="100%" y1="0%" y2="0%">
                                    <stop offset="0%" stopColor={tone.line[0]} />
                                    <stop offset="100%" stopColor={tone.line[1]} />
                                </linearGradient>
                                <linearGradient id="portalSparkArea" x1="0%" x2="0%" y1="0%" y2="100%">
                                    <stop offset="0%" stopColor={tone.line[1]} stopOpacity="0.16" />
                                    <stop offset="100%" stopColor={tone.line[1]} stopOpacity="0.015" />
                                </linearGradient>
                            </defs>
                            {[30, 95, 160].map((y) => (
                                <line key={y} x1="20" y1={y} x2="580" y2={y} stroke="rgba(71,85,105,0.18)" strokeWidth="1" />
                            ))}
                            <polygon fill="url(#portalSparkArea)" points={trend.areaPoints} />
                            <polyline
                                fill="none"
                                stroke="rgba(255,255,255,0.75)"
                                strokeWidth="9"
                                strokeLinecap="round"
                                points={trend.points}
                            />
                            <polyline
                                fill="none"
                                stroke="url(#portalSparkLine)"
                                strokeWidth="6.5"
                                strokeLinecap="round"
                                points={trend.points}
                            />
                            {trend.coordinates.map((point) => (
                                <g key={`${point.label}-${point.x}`}>
                                    <circle cx={point.x} cy={point.y} r="5.5" fill="rgba(255,255,255,0.95)" />
                                    <circle cx={point.x} cy={point.y} r="3.2" fill={tone.line[1]} />
                                </g>
                            ))}
                            {trend.yAxis.map((value, idx) => (
                                <text
                                    key={`${value}-${idx}`}
                                    x="24"
                                    y={idx === 0 ? 24 : idx === 1 ? 98 : 172}
                                    fontSize="11"
                                    fill="rgba(51,65,85,0.88)"
                                    fontWeight="700"
                                >
                                    {formatScore(value, unitLabel)}
                                </text>
                            ))}
                        </svg>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                        {trendSummary.map((item) => (
                            <div key={item.label} className="rounded-xl border border-white/80 bg-white/75 px-3 py-2 dark:border-white/10 dark:bg-white/10">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">{item.label}</p>
                                <p className="text-sm font-black text-slate-700 dark:text-slate-100">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 flex justify-between gap-2 text-xs text-slate-500 dark:text-slate-300">
                        {trendLabels.map((label, idx) => (
                            <span key={`${label || "point"}-${idx}`} className="max-w-[32%] truncate font-medium">
                                {label || `Point ${idx + 1}`}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="rounded-[30px] border border-white/70 bg-white/82 p-5 shadow-md backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/55">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-300">Recent Updates</p>
                            <h3 className="text-lg font-black text-slate-800 dark:text-white">Mentor Notes</h3>
                        </div>
                        <Star className="h-5 w-5 text-pink-500 dark:text-pink-300" />
                    </div>

                    {updates.length > 0 ? (
                        <div className="space-y-3">
                            {updates.slice(0, 4).map((update, index) => (
                                <div key={`${update.date || "update"}-${index}`} className="rounded-2xl border border-white/70 bg-gradient-to-r from-violet-50 to-pink-50 px-4 py-3 dark:border-white/10 dark:from-violet-500/10 dark:to-pink-500/10">
                                    <p className="text-sm font-bold text-violet-700 dark:text-violet-300">{update.date || "Recent"}</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-100">{update.notes || "Check-in recorded"}</p>
                                    {update.score !== undefined && update.score !== null && (
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">Score: {formatScore(update.score, unitLabel)}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-white/70 bg-gradient-to-r from-violet-50 to-pink-50 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:from-violet-500/10 dark:to-pink-500/10 dark:text-slate-300">
                            No mentor updates yet. New notes will appear after intervention check-ins.
                        </div>
                    )}

                    <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/90 px-3 py-2 text-xs font-semibold text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Keep going. Your progress is tracked in real time.
                    </div>
                </div>
            </div>
        </div>
    );
};

StudentProgressPanel.displayName = "StudentProgressPanel";
export default memo(StudentProgressPanel);
