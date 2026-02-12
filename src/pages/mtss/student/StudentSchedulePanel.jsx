import React, { memo } from "react";
import { CalendarHeart, Clock3, Target } from "lucide-react";
import { buildStudentProfileView } from "../utils/studentProfileUtils";

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

const StudentSchedulePanel = ({ student, isLoading = false }) => {
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

    const {
        currentIntervention,
        durationLabel,
        frequencyLabel,
        mentorLabel,
        monitoringMethodLabel,
    } = buildStudentProfileView(student);

    const goals = normalizeGoals(currentIntervention?.goals);
    const timeline = Array.isArray(currentIntervention?.history) ? currentIntervention.history.slice(0, 6) : [];

    const scheduleCards = [
        { key: "next", label: "Next Review", value: student.nextUpdate || "Awaiting schedule", tone: "from-rose-100 to-pink-100 dark:from-rose-500/20 dark:to-pink-500/12" },
        { key: "monitoring", label: "Monitoring", value: frequencyLabel || monitoringMethodLabel || "Weekly review", tone: "from-sky-100 to-cyan-100 dark:from-sky-500/20 dark:to-cyan-500/12" },
        { key: "mentor", label: "Mentor", value: mentorLabel || "MTSS Mentor", tone: "from-violet-100 to-fuchsia-100 dark:from-violet-500/20 dark:to-fuchsia-500/12" },
        { key: "duration", label: "Duration", value: durationLabel || "Ongoing", tone: "from-amber-100 to-orange-100 dark:from-amber-500/20 dark:to-orange-500/12" },
    ];

    return (
        <div className="space-y-5">
            <div className="rounded-[34px] border border-white/70 bg-white/82 p-5 shadow-[0_14px_36px_rgba(14,165,233,0.08)] backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/55 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-300">Intervention Plan</p>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white">{currentIntervention?.label || student.type || "Student Support Plan"}</h3>
                    </div>
                    <CalendarHeart className="h-5 w-5 text-cyan-500 dark:text-cyan-300" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {scheduleCards.map((item) => (
                        <div key={item.key} className={`rounded-2xl bg-gradient-to-r ${item.tone} px-4 py-3`}>
                            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-300">{item.label}</p>
                            <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-100">{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-[30px] border border-white/70 bg-white/82 p-5 shadow-md backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/55 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-300">Goals</p>
                            <h3 className="text-lg font-black text-slate-800 dark:text-white">Target Checklist</h3>
                        </div>
                        <Target className="h-5 w-5 text-rose-500 dark:text-rose-300" />
                    </div>

                    {goals.length > 0 ? (
                        <div className="space-y-3">
                            {goals.map((goal) => (
                                <div
                                    key={goal.id}
                                    className={`rounded-2xl px-4 py-3 border ${
                                        goal.completed
                                            ? "bg-emerald-50/90 border-emerald-200/80 dark:bg-emerald-500/12 dark:border-emerald-400/30"
                                            : "bg-gradient-to-r from-violet-50 to-pink-50 border-white/80 dark:from-violet-500/10 dark:to-pink-500/10 dark:border-white/10"
                                    }`}
                                >
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">{goal.label}</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{goal.completed ? "Completed" : "In Progress"}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-white/80 bg-gradient-to-r from-violet-50 to-pink-50 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:from-violet-500/10 dark:to-pink-500/10 dark:text-slate-300">
                            No detailed goals recorded for this intervention yet.
                        </div>
                    )}
                </div>

                <div className="rounded-[30px] border border-white/70 bg-white/82 p-5 shadow-md backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/55 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-300">Timeline</p>
                            <h3 className="text-lg font-black text-slate-800 dark:text-white">Recent Sessions</h3>
                        </div>
                        <Clock3 className="h-5 w-5 text-indigo-500 dark:text-indigo-300" />
                    </div>

                    {timeline.length > 0 ? (
                        <div className="space-y-3">
                            {timeline.map((entry, index) => (
                                <div key={`${entry.date || "timeline"}-${index}`} className="rounded-2xl border border-white/80 bg-gradient-to-r from-indigo-50 to-cyan-50 px-4 py-3 dark:border-white/10 dark:from-indigo-500/10 dark:to-cyan-500/10">
                                    <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{entry.date || "Recent"}</p>
                                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-100">{entry.notes || "Check-in recorded"}</p>
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
        </div>
    );
};

StudentSchedulePanel.displayName = "StudentSchedulePanel";
export default memo(StudentSchedulePanel);
