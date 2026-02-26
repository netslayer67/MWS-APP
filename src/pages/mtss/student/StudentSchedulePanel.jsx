import { memo, useMemo } from "react";
import { CalendarHeart, Clock3, Layers3, Target } from "lucide-react";
import { buildStudentProfileView } from "../utils/studentProfileUtils";
import { formatMentorDisplay } from "../utils/mentorNameUtils";

const normalizeGoals = (goals = []) => {
    if (!Array.isArray(goals)) return [];
    return goals
        .map((goal, idx) => {
            if (!goal) return null;
            if (typeof goal === "string") {
                return { id: `goal-${idx}`, label: goal, completed: false };
            }
            return {
                id: goal._id || goal.id || `goal-${idx}`,
                label: goal.description || goal.goal || goal.title || `Goal ${idx + 1}`,
                completed: Boolean(goal.completed),
            };
        })
        .filter(Boolean);
};

const toTimestamp = (value) => {
    if (!value) return 0;
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
};

const formatReviewDate = (value, fallback = "Awaiting schedule") => {
    if (!value) return fallback;
    try {
        return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
    } catch (error) {
        return fallback;
    }
};

const StudentSchedulePanel = ({ student, isLoading = false }) => {
    const sortedInterventions = useMemo(() => {
        if (!student) return [];
        return buildStudentProfileView(student).sortedInterventions || [];
    }, [student]);

    const interventions = useMemo(() => {
        const withRealData = sortedInterventions.filter((item) => item.hasRealData);
        return withRealData.length ? withRealData : sortedInterventions;
    }, [sortedInterventions]);

    const allGoals = useMemo(
        () =>
            interventions.flatMap((intervention) =>
                normalizeGoals(intervention.goals).map((goal) => ({
                    ...goal,
                    subject: intervention.label || intervention.type || "Intervention",
                })),
            ),
        [interventions],
    );

    const timeline = useMemo(
        () =>
            interventions
                .flatMap((intervention) =>
                    (Array.isArray(intervention.history) ? intervention.history : []).map((entry, index) => ({
                        id: `${intervention.type || intervention.label || "intervention"}-${entry?.date || "timeline"}-${index}`,
                        subject: intervention.label || intervention.type || "Intervention",
                        date: entry?.date || "Recent",
                        dateRaw: entry?.dateRaw || entry?.createdAt || entry?.date,
                        notes: entry?.notes || "Check-in recorded",
                        mentor: formatMentorDisplay({
                            name: intervention.mentor,
                            nickname: intervention.mentorNickname,
                            username: intervention.mentorUsername,
                            gender: intervention.mentorGender,
                        }),
                    })),
                )
                .sort((a, b) => toTimestamp(b.dateRaw || b.date) - toTimestamp(a.dateRaw || a.date))
                .slice(0, 12),
        [interventions],
    );

    if (isLoading) {
        return (
            <div className="rounded-[30px] border border-white/70 bg-white/82 p-8 text-center text-sm text-slate-600 shadow-sm dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
                Loading intervention schedule...
            </div>
        );
    }

    if (!student) {
        return (
            <div className="rounded-[30px] border border-white/70 bg-white/82 p-8 text-center text-sm text-slate-600 shadow-sm dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
                No schedule data available.
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="rounded-[34px] border border-white/70 bg-white/82 p-5 shadow-[0_14px_36px_rgba(14,165,233,0.08)] backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/55 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-300">Intervention Plan</p>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white">All Active Subjects</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-300">
                            {interventions.length} subject intervention{interventions.length > 1 ? "s" : ""} in your schedule
                        </p>
                    </div>
                    <CalendarHeart className="h-5 w-5 text-cyan-500 dark:text-cyan-300" />
                </div>

                <div className="flex flex-wrap gap-2">
                    {interventions.map((intervention) => (
                        <span
                            key={`${intervention.type}-${intervention.id || intervention.label}`}
                            className="rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-white/20 dark:bg-white/10 dark:text-slate-100"
                        >
                            {intervention.label} - {intervention.tierLabel || intervention.tier || "Tier 1"}
                        </span>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {interventions.map((intervention) => {
                    const mentorLabel = formatMentorDisplay({
                        name: intervention.mentor,
                        nickname: intervention.mentorNickname,
                        username: intervention.mentorUsername,
                        gender: intervention.mentorGender,
                    });
                    const scheduleCards = [
                        { key: "next", label: "Next Review", value: formatReviewDate(intervention.endDate, student?.nextUpdate || "Awaiting schedule"), tone: "from-rose-100 to-pink-100 dark:from-rose-500/20 dark:to-pink-500/12" },
                        { key: "monitoring", label: "Monitoring", value: intervention.monitoringFrequency || intervention.monitoringMethod || "Weekly review", tone: "from-sky-100 to-cyan-100 dark:from-sky-500/20 dark:to-cyan-500/12" },
                        { key: "mentor", label: "Mentor", value: mentorLabel || "MTSS Mentor", tone: "from-violet-100 to-fuchsia-100 dark:from-violet-500/20 dark:to-fuchsia-500/12" },
                        { key: "duration", label: "Duration", value: intervention.duration || "Ongoing", tone: "from-amber-100 to-orange-100 dark:from-amber-500/20 dark:to-orange-500/12" },
                    ];

                    return (
                        <div key={`${intervention.type}-${intervention.id || intervention.label}`} className="rounded-[28px] border border-white/70 bg-white/82 p-4 shadow-md backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/55">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">Subject Plan</p>
                                    <h4 className="text-lg font-black text-slate-800 dark:text-white">{intervention.label || "Intervention"}</h4>
                                </div>
                                <span className="rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-violet-600 dark:border-white/20 dark:bg-white/10 dark:text-violet-300">
                                    {intervention.tierLabel || intervention.tier || "Tier 1"}
                                </span>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                {scheduleCards.map((item) => (
                                    <div key={item.key} className={`rounded-2xl bg-gradient-to-r ${item.tone} px-4 py-3`}>
                                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-300">{item.label}</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-100">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-[30px] border border-white/70 bg-white/82 p-5 shadow-md backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/55 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-300">Goals</p>
                            <h3 className="text-lg font-black text-slate-800 dark:text-white">All Subject Targets</h3>
                        </div>
                        <Target className="h-5 w-5 text-rose-500 dark:text-rose-300" />
                    </div>

                    {allGoals.length > 0 ? (
                        <div className="space-y-3">
                            {allGoals.slice(0, 12).map((goal) => (
                                <div
                                    key={`${goal.subject}-${goal.id}`}
                                    className={`rounded-2xl px-4 py-3 border ${
                                        goal.completed
                                            ? "bg-emerald-50/90 border-emerald-200/80 dark:bg-emerald-500/12 dark:border-emerald-400/30"
                                            : "bg-gradient-to-r from-violet-50 to-pink-50 border-white/80 dark:from-violet-500/10 dark:to-pink-500/10 dark:border-white/10"
                                    }`}
                                >
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">{goal.subject}</p>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">{goal.label}</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{goal.completed ? "Completed" : "In Progress"}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-white/80 bg-gradient-to-r from-violet-50 to-pink-50 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:from-violet-500/10 dark:to-pink-500/10 dark:text-slate-300">
                            No detailed goals recorded yet.
                        </div>
                    )}
                </div>

                <div className="rounded-[30px] border border-white/70 bg-white/82 p-5 shadow-md backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/55 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-300">Timeline</p>
                            <h3 className="text-lg font-black text-slate-800 dark:text-white">All Subject Sessions</h3>
                        </div>
                        <Clock3 className="h-5 w-5 text-indigo-500 dark:text-indigo-300" />
                    </div>

                    {timeline.length > 0 ? (
                        <div className="space-y-3">
                            {timeline.map((entry) => (
                                <div key={entry.id} className="rounded-2xl border border-white/80 bg-gradient-to-r from-indigo-50 to-cyan-50 px-4 py-3 dark:border-white/10 dark:from-indigo-500/10 dark:to-cyan-500/10">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">{entry.subject}</p>
                                    <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{entry.date}</p>
                                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-100">{entry.notes}</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">Mentor: {entry.mentor}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-white/80 bg-gradient-to-r from-indigo-50 to-cyan-50 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:from-indigo-500/10 dark:to-cyan-500/10 dark:text-slate-300">
                            Session timeline will appear after mentor check-ins are submitted.
                        </div>
                    )}
                </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                <Layers3 className="h-3.5 w-3.5" />
                Schedule is now unified from all intervention subjects in your MTSS plan.
            </div>
        </div>
    );
};

StudentSchedulePanel.displayName = "StudentSchedulePanel";
export default memo(StudentSchedulePanel);
