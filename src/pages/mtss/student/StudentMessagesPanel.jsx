import { memo, useMemo, useState } from "react";
import { MessageCircleHeart, Sparkles } from "lucide-react";
import { buildStudentProfileView } from "../utils/studentProfileUtils";
import { formatMentorDisplay } from "../utils/mentorNameUtils";

const toTimestamp = (value) => {
    if (!value) return 0;
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
};

const StudentMessagesPanel = ({ student, isLoading = false }) => {
    const sortedInterventions = useMemo(() => {
        if (!student) return [];
        return buildStudentProfileView(student).sortedInterventions || [];
    }, [student]);

    const interventions = useMemo(() => {
        const withRealData = sortedInterventions.filter((item) => item.hasRealData);
        return withRealData.length ? withRealData : sortedInterventions;
    }, [sortedInterventions]);

    const subjects = useMemo(
        () => interventions.map((intervention) => ({
            type: intervention.type,
            label: intervention.label || intervention.type || "Intervention",
        })),
        [interventions],
    );
    const [selectedSubject, setSelectedSubject] = useState("all");

    const feed = useMemo(() => {
        const entries = interventions.flatMap((intervention) => {
            const mentor = formatMentorDisplay({
                name: intervention.mentor,
                nickname: intervention.mentorNickname,
                username: intervention.mentorUsername,
                gender: intervention.mentorGender,
            });
            const subject = intervention.label || intervention.type || "Intervention";
            const list = [];

            if (intervention.notes) {
                list.push({
                    id: `${intervention.type || subject}-notes`,
                    subjectType: intervention.type,
                    subject,
                    from: mentor || "MTSS Mentor",
                    date: "Latest Plan Note",
                    dateRaw: intervention.updatedAt || intervention.endDate || intervention.startDate || null,
                    text: intervention.notes,
                    score: null,
                });
            }

            if (Array.isArray(intervention.history)) {
                intervention.history.forEach((entry, index) => {
                    if (!entry) return;
                    list.push({
                        id: `${intervention.type || subject}-${entry.date || "recent"}-${index}`,
                        subjectType: intervention.type,
                        subject,
                        from: mentor || "MTSS Mentor",
                        date: entry.date || "Recent",
                        dateRaw: entry.dateRaw || entry.createdAt || entry.date,
                        text: entry.notes || "Check-in recorded",
                        score: entry.score,
                    });
                });
            }

            return list;
        });

        return entries.sort((a, b) => toTimestamp(b.dateRaw || b.date) - toTimestamp(a.dateRaw || a.date));
    }, [interventions]);

    const filteredFeed = useMemo(
        () => (selectedSubject === "all" ? feed : feed.filter((entry) => entry.subjectType === selectedSubject)),
        [feed, selectedSubject],
    );

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

    return (
        <div className="space-y-5">
            <div className="rounded-[34px] border border-white/70 bg-white/82 p-5 shadow-[0_14px_36px_rgba(236,72,153,0.08)] backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/55">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-300">Mentor Updates</p>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white">All Subject Communication Log</h3>
                    </div>
                    <MessageCircleHeart className="h-5 w-5 text-pink-500 dark:text-pink-300" />
                </div>

                {subjects.length > 1 && (
                    <div className="mb-4 no-scrollbar flex gap-2 overflow-x-auto pb-1">
                        <button
                            type="button"
                            onClick={() => setSelectedSubject("all")}
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                selectedSubject === "all"
                                    ? "border-violet-300 bg-violet-100 text-violet-700 dark:border-violet-400/40 dark:bg-violet-500/20 dark:text-violet-200"
                                    : "border-white/70 bg-white/90 text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300"
                            }`}
                        >
                            All Subjects
                        </button>
                        {subjects.map((subject) => (
                            <button
                                key={subject.type}
                                type="button"
                                onClick={() => setSelectedSubject(subject.type)}
                                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                    selectedSubject === subject.type
                                        ? "border-violet-300 bg-violet-100 text-violet-700 dark:border-violet-400/40 dark:bg-violet-500/20 dark:text-violet-200"
                                        : "border-white/70 bg-white/90 text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300"
                                }`}
                            >
                                {subject.label}
                            </button>
                        ))}
                    </div>
                )}

                {filteredFeed.length > 0 ? (
                    <div className="space-y-3">
                        {filteredFeed.map((message) => (
                            <div
                                key={message.id}
                                className="rounded-2xl border border-white/80 bg-gradient-to-r from-sky-50 via-violet-50 to-pink-50 px-4 py-3 shadow-sm dark:border-white/10 dark:from-sky-500/10 dark:via-violet-500/10 dark:to-pink-500/10"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">{message.subject}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-300">{message.date}</p>
                                </div>
                                <p className="text-sm font-black text-indigo-700 dark:text-indigo-300">{message.from}</p>
                                <p className="mt-1 text-sm text-slate-700 dark:text-slate-100">{message.text}</p>
                                {(message.score !== undefined && message.score !== null) && (
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">Score: {message.score}</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-white/80 bg-gradient-to-r from-sky-50 via-violet-50 to-pink-50 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:from-sky-500/10 dark:via-violet-500/10 dark:to-pink-500/10 dark:text-slate-300">
                        No communication notes for this subject yet.
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
