import { memo, useEffect, useMemo, useState } from "react";
import {
    Activity,
    AlertTriangle,
    Bug,
    CheckCircle2,
    Clock3,
    MessageSquareText,
    RefreshCcw,
    Search,
    ShieldCheck,
    Users2,
    Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import usePilotFeedbackDashboardData from "../hooks/usePilotFeedbackDashboardData";

const STATUS_LABELS = {
    in_progress: "In progress",
    completed: "Completed",
};

const READINESS_LABELS = {
    yes: "Ready",
    almost: "Almost ready",
    "not-yet": "Not ready",
};

const formatDateTime = (value) => {
    if (!value) return "Not yet";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Not yet";
    return parsed.toLocaleString();
};

const formatRelativeTime = (value) => {
    if (!value) return "No live updates yet";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "No live updates yet";
    const diffMinutes = Math.round((Date.now() - parsed.getTime()) / 60000);
    if (diffMinutes <= 1) return "Updated just now";
    if (diffMinutes < 60) return `Updated ${diffMinutes} min ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `Updated ${diffHours} hr ago`;
    return formatDateTime(value);
};

const buildStepCoverage = (sessions = []) => {
    const map = new Map();
    sessions.forEach((session) => {
        (session.stepFeedback || []).forEach((step) => {
            const key = step.stepId || step.id;
            if (!key) return;
            const current = map.get(key) || {
                stepId: key,
                title: step.title || key,
                order: step.order || 0,
                completed: 0,
                total: 0,
            };
            current.total += 1;
            if (step.completedInHub || step.completionStatus === "yes") {
                current.completed += 1;
            }
            map.set(key, current);
        });
    });

    return Array.from(map.values())
        .sort((left, right) => left.order - right.order)
        .map((entry) => ({
            ...entry,
            completionRate: entry.total ? Math.round((entry.completed / entry.total) * 100) : 0,
        }));
};

const SummaryCard = ({ icon: Icon, label, value, note, accent = "text-slate-900 dark:text-white" }) => (
    <div className="rounded-[24px] border border-white/45 bg-white/80 p-4 shadow-lg dark:border-white/10 dark:bg-white/5">
        <div className="flex items-start justify-between gap-3">
            <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-white/55">{label}</p>
                <p className={cn("mt-2 text-3xl font-black", accent)}>{value}</p>
                {note ? <p className="mt-1 text-xs text-slate-500 dark:text-white/55">{note}</p> : null}
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-[#f97316] via-[#ec4899] to-[#6366f1] p-3 text-white shadow-lg">
                <Icon className="h-5 w-5" />
            </div>
        </div>
    </div>
);

const AdminPilotFeedbackPanel = memo(() => {
    const { sessions, stats, loading, error, refresh, lastLiveEventAt } = usePilotFeedbackDashboardData({ enabled: true });
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [readinessFilter, setReadinessFilter] = useState("all");
    const [bugFilter, setBugFilter] = useState("all");
    const [selectedSessionKey, setSelectedSessionKey] = useState("");

    const filteredSessions = useMemo(() => {
        const loweredQuery = query.trim().toLowerCase();
        return sessions.filter((session) => {
            const testerName = String(session?.tester?.name || "").toLowerCase();
            const testerEmail = String(session?.tester?.email || "").toLowerCase();
            const testerUnit = String(session?.tester?.unit || "").toLowerCase();
            const readiness = session?.finalFeedbackSavedAt
                ? String(session?.finalFeedback?.readiness || "")
                : "draft";
            const hasBug = Number(session?.bugCount || 0) > 0;
            const matchesQuery =
                !loweredQuery
                || testerName.includes(loweredQuery)
                || testerEmail.includes(loweredQuery)
                || testerUnit.includes(loweredQuery);
            const matchesStatus = statusFilter === "all" || session?.status === statusFilter;
            const matchesReadiness = readinessFilter === "all" || readiness === readinessFilter;
            const matchesBug = bugFilter === "all" || (bugFilter === "bugged" ? hasBug : !hasBug);
            return matchesQuery && matchesStatus && matchesReadiness && matchesBug;
        });
    }, [bugFilter, query, readinessFilter, sessions, statusFilter]);

    const selectedSession = useMemo(
        () => filteredSessions.find((entry) => entry.sessionKey === selectedSessionKey) || filteredSessions[0] || null,
        [filteredSessions, selectedSessionKey],
    );

    const stepCoverage = useMemo(() => buildStepCoverage(sessions), [sessions]);

    useEffect(() => {
        if (!filteredSessions.length) {
            setSelectedSessionKey("");
            return;
        }

        if (!filteredSessions.some((entry) => entry.sessionKey === selectedSessionKey)) {
            setSelectedSessionKey(filteredSessions[0].sessionKey);
        }
    }, [filteredSessions, selectedSessionKey]);

    return (
        <div className="space-y-6">
            <div
                className="glass glass-card mtss-card-surface rounded-[32px] p-6 space-y-5"
                data-aos="fade-up"
                data-aos-duration="700"
                data-aos-easing="ease-out-cubic"
            >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Pilot feedback command center</p>
                        <h3 className="text-3xl font-black text-foreground dark:text-white">Principal testing feedback for Pak Faisal</h3>
                        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground dark:text-white/70">
                            This page collects every principal testing session automatically. Feedback syncs from the Pilot Testing Hub to the backend,
                            then appears here with detailed step ratings, bug notes, final readiness, and live updates.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Badge className="rounded-full border-0 bg-emerald-500/90 px-3 py-1 text-white">
                            <Wifi className="mr-1 h-3.5 w-3.5" />
                            Live stream
                        </Badge>
                        <span className="text-xs text-slate-500 dark:text-white/55">{formatRelativeTime(lastLiveEventAt)}</span>
                        <Button variant="glass" onClick={refresh}>
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <SummaryCard
                        icon={Users2}
                        label="Sessions"
                        value={stats.totalSessions}
                        note={`${stats.principalCount} principals`}
                    />
                    <SummaryCard
                        icon={CheckCircle2}
                        label="Completed"
                        value={stats.completedSessions}
                        note={`${stats.inProgressSessions} still in progress`}
                        accent="text-emerald-600 dark:text-emerald-300"
                    />
                    <SummaryCard
                        icon={Bug}
                        label="Sessions with bugs"
                        value={stats.sessionsWithBugs}
                        note="At least one bug reported"
                        accent="text-rose-600 dark:text-rose-300"
                    />
                    <SummaryCard
                        icon={ShieldCheck}
                        label="Avg confidence"
                        value={`${stats.averageConfidence || 0}/5`}
                        note="Overall pilot confidence"
                        accent="text-sky-600 dark:text-sky-300"
                    />
                    <SummaryCard
                        icon={Clock3}
                        label="Active 24h"
                        value={stats.activeLast24Hours}
                        note="Recently updated sessions"
                        accent="text-amber-600 dark:text-amber-300"
                    />
                </div>
            </div>

            <div
                className="glass glass-card mtss-card-surface rounded-[32px] p-6 space-y-5"
                data-aos="fade-up"
                data-aos-duration="700"
                data-aos-delay="80"
                data-aos-easing="ease-out-cubic"
            >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Coverage pulse</p>
                        <h3 className="text-2xl font-black text-foreground dark:text-white">How far each guided step has been tested</h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-white/55">Coverage is based on sessions currently stored in the live pilot feedback database.</p>
                </div>

                <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                    {stepCoverage.map((entry) => (
                        <div key={entry.stepId} className="rounded-[24px] border border-white/45 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-white/55">
                                        Step {entry.order}
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{entry.title}</p>
                                </div>
                                <Badge variant="outline" className="rounded-full border-slate-300 bg-white/80 dark:border-white/15 dark:bg-white/5">
                                    {entry.completed}/{entry.total}
                                </Badge>
                            </div>
                            <div className="mt-3 h-2 rounded-full bg-slate-200/80 dark:bg-white/10">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#22c55e] via-[#14b8a6] to-[#38bdf8]"
                                    style={{ width: `${entry.completionRate}%` }}
                                />
                            </div>
                            <p className="mt-2 text-xs text-slate-500 dark:text-white/55">{entry.completionRate}% of sessions completed this step</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
                <section
                    className="glass glass-card mtss-card-surface rounded-[32px] p-6 space-y-5"
                    data-aos="fade-up"
                    data-aos-duration="700"
                    data-aos-delay="120"
                    data-aos-easing="ease-out-cubic"
                >
                    <div className="flex flex-col gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Session list</p>
                            <h3 className="text-2xl font-black text-foreground dark:text-white">All principal feedback sessions</h3>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    className="rounded-2xl border-white/40 bg-white/85 pl-9 dark:border-white/10 dark:bg-white/5"
                                    placeholder="Search principal, email, or unit"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <select
                                    className="rounded-2xl border border-white/40 bg-white/85 px-3 py-2 text-sm text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    value={statusFilter}
                                    onChange={(event) => setStatusFilter(event.target.value)}
                                >
                                    <option value="all">All status</option>
                                    <option value="in_progress">In progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                                <select
                                    className="rounded-2xl border border-white/40 bg-white/85 px-3 py-2 text-sm text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    value={readinessFilter}
                                    onChange={(event) => setReadinessFilter(event.target.value)}
                                >
                                    <option value="all">All readiness</option>
                                    <option value="yes">Ready</option>
                                    <option value="almost">Almost</option>
                                    <option value="not-yet">Not ready</option>
                                    <option value="draft">Draft only</option>
                                </select>
                                <select
                                    className="rounded-2xl border border-white/40 bg-white/85 px-3 py-2 text-sm text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    value={bugFilter}
                                    onChange={(event) => setBugFilter(event.target.value)}
                                >
                                    <option value="all">All bugs</option>
                                    <option value="bugged">With bugs</option>
                                    <option value="clean">No bugs</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="rounded-[28px] border border-dashed border-white/50 bg-white/60 p-8 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                            Loading pilot feedback sessions...
                        </div>
                    ) : error ? (
                        <div className="rounded-[28px] border border-rose-200 bg-rose-50/80 p-5 dark:border-rose-400/30 dark:bg-rose-500/10">
                            <p className="text-sm font-semibold text-rose-700 dark:text-rose-200">{error}</p>
                            <Button variant="glass" className="mt-3" onClick={refresh}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Retry
                            </Button>
                        </div>
                    ) : filteredSessions.length ? (
                        <div className="space-y-3 max-h-[70rem] overflow-y-auto pr-1">
                            {filteredSessions.map((session) => {
                                const active = session.sessionKey === selectedSession?.sessionKey;
                                const hasBugs = Number(session?.bugCount || 0) > 0;
                                const readiness = session?.finalFeedbackSavedAt
                                    ? READINESS_LABELS[session?.finalFeedback?.readiness] || "No final feedback"
                                    : "Draft only";
                                return (
                                    <button
                                        key={session.sessionKey}
                                        type="button"
                                        onClick={() => setSelectedSessionKey(session.sessionKey)}
                                        className={cn(
                                            "w-full rounded-[28px] border p-4 text-left transition",
                                            active
                                                ? "border-transparent bg-gradient-to-br from-[#fff7ed] via-[#fdf4ff] to-[#eff6ff] shadow-[0_18px_48px_rgba(15,23,42,0.14)] dark:from-white/10 dark:via-white/10 dark:to-white/5"
                                                : "border-white/45 bg-white/75 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white">{session?.tester?.name || "Unnamed principal"}</p>
                                                <p className="text-xs text-slate-500 dark:text-white/55">{session?.tester?.email || "No email"} · {session?.tester?.unit || "No unit"}</p>
                                            </div>
                                            <Badge
                                                className={cn(
                                                    "rounded-full border-0 px-3 py-1 text-white",
                                                    session?.status === "completed" ? "bg-emerald-500/90" : "bg-amber-500/90",
                                                )}
                                            >
                                                {STATUS_LABELS[session?.status] || "In progress"}
                                            </Badge>
                                        </div>

                                        <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                                            <div className="rounded-2xl bg-white/80 px-3 py-2 dark:bg-white/5">
                                                <p className="text-slate-500 dark:text-white/50">Progress</p>
                                                <p className="mt-1 text-base font-black text-slate-900 dark:text-white">{session?.completionRate || 0}%</p>
                                            </div>
                                            <div className="rounded-2xl bg-white/80 px-3 py-2 dark:bg-white/5">
                                                <p className="text-slate-500 dark:text-white/50">Bugs</p>
                                                <p className={cn("mt-1 text-base font-black", hasBugs ? "text-rose-600 dark:text-rose-300" : "text-emerald-600 dark:text-emerald-300")}>
                                                    {session?.bugCount || 0}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl bg-white/80 px-3 py-2 dark:bg-white/5">
                                                <p className="text-slate-500 dark:text-white/50">Confidence</p>
                                                <p className="mt-1 text-base font-black text-slate-900 dark:text-white">
                                                    {session?.finalFeedbackSavedAt ? `${session?.finalFeedback?.overallConfidence || 0}/5` : "Draft"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap items-center gap-2">
                                            <Badge variant="outline" className="rounded-full border-slate-300 bg-white/85 dark:border-white/15 dark:bg-white/5">
                                                {readiness}
                                            </Badge>
                                            {hasBugs ? (
                                                <Badge className="rounded-full border-0 bg-rose-500/90 px-3 py-1 text-white">
                                                    <Bug className="mr-1 h-3.5 w-3.5" />
                                                    Needs review
                                                </Badge>
                                            ) : null}
                                        </div>

                                        <p className="mt-3 text-xs text-slate-500 dark:text-white/55">
                                            Last updated: {formatDateTime(session?.updatedAt || session?.clientUpdatedAt)}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-[28px] border border-dashed border-white/50 bg-white/60 p-8 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                            No pilot feedback sessions match the current filters yet.
                        </div>
                    )}
                </section>

                <section
                    className="glass glass-card mtss-card-surface rounded-[32px] p-6 space-y-5"
                    data-aos="fade-up"
                    data-aos-duration="700"
                    data-aos-delay="160"
                    data-aos-easing="ease-out-cubic"
                >
                    {selectedSession ? (
                        <>
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="space-y-2">
                                    <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Selected session</p>
                                    <h3 className="text-2xl font-black text-foreground dark:text-white">
                                        {selectedSession?.tester?.name || "Unnamed principal"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground dark:text-white/70">
                                        {selectedSession?.tester?.email || "No email"} · {selectedSession?.tester?.unit || "No unit"} · {selectedSession?.tester?.role || "No role"}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge
                                        className={cn(
                                            "rounded-full border-0 px-3 py-1 text-white",
                                            selectedSession?.status === "completed" ? "bg-emerald-500/90" : "bg-amber-500/90",
                                        )}
                                    >
                                        {STATUS_LABELS[selectedSession?.status] || "In progress"}
                                    </Badge>
                                    <Badge variant="outline" className="rounded-full border-slate-300 bg-white/85 dark:border-white/15 dark:bg-white/5">
                                        Session {selectedSession.sessionKey}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <SummaryCard
                                    icon={Activity}
                                    label="Completion"
                                    value={`${selectedSession?.completionRate || 0}%`}
                                    note={`${selectedSession?.completedStepCount || 0}/${selectedSession?.stepCount || 0} steps completed`}
                                    accent="text-sky-600 dark:text-sky-300"
                                />
                                <SummaryCard
                                    icon={Bug}
                                    label="Bug reports"
                                    value={selectedSession?.bugCount || 0}
                                    note="Across all guided steps"
                                    accent="text-rose-600 dark:text-rose-300"
                                />
                                <SummaryCard
                                    icon={ShieldCheck}
                                    label="Confidence"
                                    value={selectedSession?.finalFeedbackSavedAt ? `${selectedSession?.finalFeedback?.overallConfidence || 0}/5` : "Draft"}
                                    note={
                                        selectedSession?.finalFeedbackSavedAt
                                            ? READINESS_LABELS[selectedSession?.finalFeedback?.readiness] || "No final feedback"
                                            : "No final feedback submitted yet"
                                    }
                                    accent="text-emerald-600 dark:text-emerald-300"
                                />
                                <SummaryCard
                                    icon={Clock3}
                                    label="Last update"
                                    value={formatRelativeTime(selectedSession?.updatedAt || selectedSession?.clientUpdatedAt)}
                                    note={formatDateTime(selectedSession?.updatedAt || selectedSession?.clientUpdatedAt)}
                                    accent="text-amber-600 dark:text-amber-300"
                                />
                            </div>

                            <div className="rounded-[28px] border border-white/45 bg-gradient-to-br from-[#eff6ff]/80 via-white to-[#fff7ed]/75 p-5 dark:border-white/10 dark:from-white/5 dark:via-white/10 dark:to-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl bg-gradient-to-br from-[#6366f1] via-[#ec4899] to-[#f97316] p-3 text-white shadow-lg">
                                        <MessageSquareText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500 dark:text-white/55">Final feedback</p>
                                        <h4 className="text-lg font-black text-slate-900 dark:text-white">Rollout readiness and key takeaways</h4>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-white/55">
                                            {selectedSession?.finalFeedbackSavedAt
                                                ? "Final feedback has been submitted by the principal."
                                                : "This area may still be draft content until the principal saves final feedback."}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-4 md:grid-cols-2">
                                    <div className="rounded-2xl bg-white/80 p-4 dark:bg-white/5">
                                        <p className="text-xs font-semibold text-slate-500 dark:text-white/55">Most useful feature</p>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-white/80">
                                            {selectedSession?.finalFeedback?.mostUsefulFeature || "Not provided"}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-white/80 p-4 dark:bg-white/5">
                                        <p className="text-xs font-semibold text-slate-500 dark:text-white/55">Most confusing feature</p>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-white/80">
                                            {selectedSession?.finalFeedback?.mostConfusingFeature || "Not provided"}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-white/80 p-4 dark:bg-white/5">
                                        <p className="text-xs font-semibold text-slate-500 dark:text-white/55">Slowest part</p>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-white/80">
                                            {selectedSession?.finalFeedback?.slowestPart || "Not provided"}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-white/80 p-4 dark:bg-white/5">
                                        <p className="text-xs font-semibold text-slate-500 dark:text-white/55">Missing feature</p>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-white/80">
                                            {selectedSession?.finalFeedback?.missingFeature || "Not provided"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <div className="rounded-2xl bg-white/80 p-4 dark:bg-white/5">
                                        <p className="text-xs font-semibold text-slate-500 dark:text-white/55">Top improvement priorities</p>
                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-white/80">
                                            {selectedSession?.finalFeedback?.topImprovements || "Not provided"}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-white/80 p-4 dark:bg-white/5">
                                        <p className="text-xs font-semibold text-slate-500 dark:text-white/55">Additional comments</p>
                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-white/80">
                                            {selectedSession?.finalFeedback?.additionalComments || "Not provided"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Step-by-step evidence</p>
                                        <h4 className="text-2xl font-black text-foreground dark:text-white">Detailed feedback per guided step</h4>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-white/55">
                                        Final feedback saved: {formatDateTime(selectedSession?.finalFeedbackSavedAt)}
                                    </p>
                                </div>

                                <div className="space-y-4 max-h-[70rem] overflow-y-auto pr-1">
                                    {(selectedSession?.stepFeedback || []).map((step) => (
                                        <article key={step.stepId} className="rounded-[28px] border border-white/45 bg-white/80 p-5 dark:border-white/10 dark:bg-white/5">
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                <div>
                                                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-white/55">
                                                        Step {step.order}
                                                    </p>
                                                    <h5 className="mt-1 text-xl font-black text-slate-900 dark:text-white">{step.title || step.stepId}</h5>
                                                    <p className="mt-1 text-xs text-slate-500 dark:text-white/55">{step.duration || "No duration"} · completion status: {step.completionStatus}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge
                                                        className={cn(
                                                            "rounded-full border-0 px-3 py-1 text-white",
                                                            step.completedInHub ? "bg-emerald-500/90" : "bg-slate-500/90",
                                                        )}
                                                    >
                                                        {step.completedInHub ? "Marked complete" : "Not marked complete"}
                                                    </Badge>
                                                    {step.bugFound ? (
                                                        <Badge className="rounded-full border-0 bg-rose-500/90 px-3 py-1 text-white">
                                                            <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                                                            Bug · {step.bugSeverity}
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <div className="mt-4 grid gap-3 md:grid-cols-3">
                                                <div className="rounded-2xl bg-white/80 px-4 py-3 dark:bg-white/5">
                                                    <p className="text-xs text-slate-500 dark:text-white/55">Ease of use</p>
                                                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{step.easeOfUse}/5</p>
                                                </div>
                                                <div className="rounded-2xl bg-white/80 px-4 py-3 dark:bg-white/5">
                                                    <p className="text-xs text-slate-500 dark:text-white/55">Clarity</p>
                                                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{step.clarity}/5</p>
                                                </div>
                                                <div className="rounded-2xl bg-white/80 px-4 py-3 dark:bg-white/5">
                                                    <p className="text-xs text-slate-500 dark:text-white/55">Performance</p>
                                                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{step.performance}/5</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                <div className="rounded-2xl bg-white/80 p-4 dark:bg-white/5">
                                                    <p className="text-xs font-semibold text-slate-500 dark:text-white/55">Helpful notes</p>
                                                    <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-white/80">
                                                        {step.helpfulNotes || "No helpful notes recorded"}
                                                    </p>
                                                </div>
                                                <div className="rounded-2xl bg-white/80 p-4 dark:bg-white/5">
                                                    <p className="text-xs font-semibold text-slate-500 dark:text-white/55">Confusing or missing</p>
                                                    <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-white/80">
                                                        {step.confusingNotes || "No confusion recorded"}
                                                    </p>
                                                </div>
                                            </div>

                                            {step.partialReason ? (
                                                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-400/30 dark:bg-amber-500/10">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-200">Why this step was partial or failed</p>
                                                    <p className="mt-2 text-sm leading-relaxed text-amber-900 dark:text-amber-100/85">{step.partialReason}</p>
                                                </div>
                                            ) : null}

                                            {step.bugFound ? (
                                                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 dark:border-rose-400/30 dark:bg-rose-500/10">
                                                    <div className="flex items-center gap-2">
                                                        <Bug className="h-4 w-4 text-rose-600 dark:text-rose-300" />
                                                        <p className="text-sm font-black text-rose-700 dark:text-rose-200">Bug detail</p>
                                                    </div>
                                                    <div className="mt-3 grid gap-4 md:grid-cols-2">
                                                        <div>
                                                            <p className="text-xs font-semibold text-rose-700 dark:text-rose-200/80">Bug summary</p>
                                                            <p className="mt-1 text-sm leading-relaxed text-rose-900 dark:text-rose-100/85">
                                                                {step.bugSummary || "Not provided"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-rose-700 dark:text-rose-200/80">Expected result</p>
                                                            <p className="mt-1 text-sm leading-relaxed text-rose-900 dark:text-rose-100/85">
                                                                {step.expectedResult || "Not provided"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-rose-700 dark:text-rose-200/80">Reproduction steps</p>
                                                            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-rose-900 dark:text-rose-100/85">
                                                                {step.reproductionSteps || "Not provided"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-rose-700 dark:text-rose-200/80">Screenshot / video link</p>
                                                            <p className="mt-1 break-all text-sm leading-relaxed text-rose-900 dark:text-rose-100/85">
                                                                {step.screenshotLink || "Not provided"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="rounded-[28px] border border-dashed border-white/50 bg-white/60 p-8 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                            No pilot feedback session is selected yet.
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
});

AdminPilotFeedbackPanel.displayName = "AdminPilotFeedbackPanel";

export default AdminPilotFeedbackPanel;
