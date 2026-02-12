import React, { memo } from "react";
import { MessageCircleHeart, Sparkles } from "lucide-react";
import { buildStudentProfileView } from "../utils/studentProfileUtils";

const buildFeed = (mentor, notes, history) => {
    const entries = [];

    if (notes) {
        entries.push({
            from: mentor || "MTSS Mentor",
            date: "Latest Plan Note",
            text: notes,
        });
    }

    if (Array.isArray(history)) {
        history.forEach((entry) => {
            if (!entry) return;
            entries.push({
                from: mentor || "MTSS Mentor",
                date: entry.date || "Recent",
                text: entry.notes || "Check-in recorded",
                score: entry.score,
            });
        });
    }

    return entries;
};

const StudentMessagesPanel = ({ student, isLoading = false }) => {
    if (isLoading) {
        return (
            <div className="rounded-[30px] border border-white/70 bg-white/82 p-8 text-center text-sm text-slate-600 shadow-sm dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
                Loading mentor updates...
            </div>
        );
    }

    if (!student) {
        return (
            <div className="rounded-[30px] border border-white/70 bg-white/82 p-8 text-center text-sm text-slate-600 shadow-sm dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
                No communication data available.
            </div>
        );
    }

    const {
        currentIntervention,
        mentorLabel,
        notesLabel,
    } = buildStudentProfileView(student);

    const history = Array.isArray(currentIntervention?.history) ? currentIntervention.history.slice(0, 10) : [];
    const feed = buildFeed(mentorLabel, notesLabel, history);

    return (
        <div className="space-y-5">
            <div className="rounded-[34px] border border-white/70 bg-white/82 p-5 shadow-[0_14px_36px_rgba(236,72,153,0.08)] backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/55">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-300">Mentor Updates</p>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white">Communication Log</h3>
                    </div>
                    <MessageCircleHeart className="h-5 w-5 text-pink-500 dark:text-pink-300" />
                </div>

                {feed.length > 0 ? (
                    <div className="space-y-3">
                        {feed.map((message, index) => (
                            <div
                                key={`${message.from}-${message.date}-${index}`}
                                className="rounded-2xl border border-white/80 bg-gradient-to-r from-sky-50 via-violet-50 to-pink-50 px-4 py-3 shadow-sm dark:border-white/10 dark:from-sky-500/10 dark:via-violet-500/10 dark:to-pink-500/10"
                            >
                                <p className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                                    {message.from} - {message.date}
                                </p>
                                <p className="mt-1 text-sm text-slate-700 dark:text-slate-100">{message.text}</p>
                                {(message.score !== undefined && message.score !== null) && (
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">Score: {message.score}</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-white/80 bg-gradient-to-r from-sky-50 via-violet-50 to-pink-50 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:from-sky-500/10 dark:via-violet-500/10 dark:to-pink-500/10 dark:text-slate-300">
                        No communication notes yet. Mentor updates will appear after intervention check-ins.
                    </div>
                )}

                <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-2 text-xs font-semibold text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Read-only for students. Ask your mentor/homeroom teacher for direct follow-up.
                </div>
            </div>
        </div>
    );
};

StudentMessagesPanel.displayName = "StudentMessagesPanel";
export default memo(StudentMessagesPanel);
