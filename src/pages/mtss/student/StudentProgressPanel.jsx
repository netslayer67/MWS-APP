import React, { memo } from "react";
import { Sparkles, Star, TrendingUp } from "lucide-react";
import { buildStudentProfileView } from "../utils/studentProfileUtils";
import {
    buildFallbackChart,
    formatScore,
    resolveTone,
    toProgressPercent,
    toSafeNumber,
} from "./studentProgressUtils";

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
        strategyLabel,
        goalLabel,
    } = buildStudentProfileView(student);

    const unitLabel = currentIntervention?.progressUnit || profile?.progressUnit || "pts";
    const baseline = currentIntervention?.baseline ?? profile?.baseline;
    const current = currentIntervention?.current ?? profile?.current;
    const target = currentIntervention?.target ?? profile?.target;
    const progressPercent = currentIntervention?.progress ?? toProgressPercent(current, target);

    const chart = Array.isArray(currentIntervention?.chart) && currentIntervention.chart.length
        ? currentIntervention.chart
        : Array.isArray(profile?.chart) && profile.chart.length
            ? profile.chart
            : buildFallbackChart(current, target);

    const updates = Array.isArray(currentIntervention?.history) && currentIntervention.history.length
        ? currentIntervention.history
        : Array.isArray(profile?.history)
            ? profile.history
            : [];

    const tone = resolveTone(progressPercent);
    const mainGoal = goalLabel || strategyLabel || "Follow your MTSS intervention goals";

    return (
        <div className="space-y-5">
            <div className="rounded-[34px] border border-white/70 bg-white/82 p-5 shadow-[0_14px_36px_rgba(99,102,241,0.08)] backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/55">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-300">Current Goal</p>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white">{mainGoal}</h3>
                    </div>
                    <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-white/15 dark:bg-white/5 dark:text-slate-100">
                        Next Review: {student.nextUpdate || "Awaiting schedule"}
                    </div>
                </div>

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
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-[30px] border border-white/70 bg-white/82 p-5 shadow-md backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/55">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-300">Trend</p>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">Progress Trend</h3>
                        </div>
                        <Sparkles className="h-5 w-5 text-fuchsia-500 dark:text-fuchsia-300" />
                    </div>

                    <div className={`rounded-2xl bg-gradient-to-r ${tone.hero} p-3`}>
                        <svg viewBox="0 0 600 200" className="h-48 w-full">
                            <defs>
                                <linearGradient id="portalSparkLine" x1="0%" x2="100%" y1="0%" y2="0%">
                                    <stop offset="0%" stopColor={tone.line[0]} />
                                    <stop offset="100%" stopColor={tone.line[1]} />
                                </linearGradient>
                            </defs>
                            <polyline
                                fill="none"
                                stroke="url(#portalSparkLine)"
                                strokeWidth="6"
                                strokeLinecap="round"
                                points={chart
                                    .map((point, index) => {
                                        const x = (index / Math.max(1, chart.length - 1)) * 580 + 10;
                                        const rawValue = toSafeNumber(point.value ?? point.reading) ?? 0;
                                        const normalized = Math.max(0, Math.min(100, rawValue));
                                        const y = 190 - (normalized / 100) * 180;
                                        return `${x},${y}`;
                                    })
                                    .join(" ")}
                            />
                        </svg>
                    </div>

                    <div className="mt-3 flex justify-between gap-2 text-xs text-slate-500 dark:text-slate-300">
                        {chart.map((point, idx) => (
                            <span key={`${point.label || point.date || "point"}-${idx}`} className="max-w-[32%] truncate font-medium">
                                {point.label || point.date || `Point ${idx + 1}`}
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
