import { memo, useMemo, useState } from "react";
import { MessageCircleHeart, Sparkles } from "lucide-react";
import { buildStudentProfileView } from "../utils/studentProfileUtils";
import { formatMentorDisplay } from "../utils/mentorNameUtils";
import EvidenceViewer from "../components/EvidenceViewer";
import { useToast } from "@/components/ui/use-toast";

const SIGNAL_META = {
    emerging: { label: "🌱 Emerging", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
    developing: { label: "🌿 Developing", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
    consistent: { label: "🌳 Consistent", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
};
const TAG_LABELS = {
    emotional_regulation: "Emotional Regulation", language: "Language", social: "Social",
    motor: "Motor Skills", independence: "Independence",
};
const WEEKLY_FOCUS_META = {
    continue: { label: "▶️ Continue", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
    try: { label: "🔄 Try", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" },
    support_needed: { label: "🆘 Support Needed", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
};

const toTimestamp = (value) => {
    if (!value) return 0;
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
};

const StudentMessagesPanel = ({
    student,
    isLoading = false,
    portalViewMode = "student",
    onSubmitHomeObservation,
    isSubmittingHomeObservation = false,
}) => {
    const { toast } = useToast();
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
    const [homeObservationNote, setHomeObservationNote] = useState("");
    const isKindergartenPortal = Boolean(student?.kindergartenPortal?.isKindergarten);
    const parentProxyData = student?.kindergartenPortal?.parentProxy || { homeObservations: [] };

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
                    evidence: [],
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
                        text: entry.observation || entry.notes || "Check-in recorded",
                        score: entry.score,
                        evidence: Array.isArray(entry.evidence) ? entry.evidence : [],
                        signal: entry.signal || null,
                        tags: Array.isArray(entry.tags) ? entry.tags : [],
                        context: entry.context || null,
                        response: entry.response || null,
                        nextStep: entry.nextStep || null,
                        weeklyFocus: entry.weeklyFocus || null,
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

    const handleHomeObservationSubmit = async () => {
        if (!student?.id || !homeObservationNote.trim()) return;
        if (!onSubmitHomeObservation) return;
        try {
            await onSubmitHomeObservation(student.id, {
                note: homeObservationNote.trim(),
                source: portalViewMode === "parent_proxy" ? "parent_proxy" : "student",
            });
            setHomeObservationNote("");
            toast({
                title: "Home observation saved",
                description: "The note is now available in the teacher workflow.",
            });
        } catch (error) {
            toast({
                title: "Unable to save home observation",
                description: error?.response?.data?.message || error?.message || "Please try again.",
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="rounded-[30px] border border-white/80 bg-white/90 p-8 text-center text-sm text-slate-700 shadow-sm dark:border-white/20 dark:bg-slate-900/82 dark:text-slate-200">
                Loading mentor updates...
            </div>
        );
    }

    if (!student) {
        return (
            <div className="rounded-[30px] border border-white/80 bg-white/90 p-8 text-center text-sm text-slate-700 shadow-sm dark:border-white/20 dark:bg-slate-900/82 dark:text-slate-200">
                No communication data available.
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="rounded-[34px] border border-white/80 bg-white/90 p-5 shadow-[0_14px_36px_rgba(236,72,153,0.1)] backdrop-blur-xl dark:border-white/20 dark:bg-slate-900/82">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-600 dark:text-slate-200">Mentor Updates</p>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white">All Subject Communication Log</h3>
                    </div>
                    <MessageCircleHeart className="h-5 w-5 text-pink-600 dark:text-pink-200" />
                </div>

                {subjects.length > 1 && (
                    <div className="mb-4 no-scrollbar flex gap-2 overflow-x-auto pb-1">
                        <button
                            type="button"
                            onClick={() => setSelectedSubject("all")}
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                selectedSubject === "all"
                                    ? "border-violet-300 bg-violet-100 text-violet-700 dark:border-violet-300/55 dark:bg-violet-900/55 dark:text-violet-100"
                                    : "border-white/80 bg-white/92 text-slate-700 dark:border-white/20 dark:bg-slate-800/72 dark:text-slate-200"
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
                                        ? "border-violet-300 bg-violet-100 text-violet-700 dark:border-violet-300/55 dark:bg-violet-900/55 dark:text-violet-100"
                                        : "border-white/80 bg-white/92 text-slate-700 dark:border-white/20 dark:bg-slate-800/72 dark:text-slate-200"
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
                                className="rounded-2xl border border-white/80 bg-gradient-to-r from-sky-50 via-violet-50 to-pink-50 px-4 py-3 shadow-sm dark:border-white/20 dark:from-sky-950/70 dark:via-violet-950/70 dark:to-pink-950/60"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-violet-700 dark:text-violet-100">{message.subject}</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-200">{message.date}</p>
                                </div>
                                <p className="text-sm font-black text-indigo-700 dark:text-indigo-100">{message.from}</p>
                                {message.context && (
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 italic">📍 {message.context}</p>
                                )}
                                <p className="mt-1 text-sm text-slate-700 dark:text-slate-100">{message.text}</p>
                                {message.response && (
                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">↩ {message.response}</p>
                                )}
                                {message.nextStep && (
                                    <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">→ {message.nextStep}</p>
                                )}
                                {message.signal && (
                                    <span className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${SIGNAL_META[message.signal]?.color || ""}`}>
                                        {SIGNAL_META[message.signal]?.label}
                                    </span>
                                )}
                                {message.tags?.length > 0 && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {message.tags.map((tag) => (
                                            <span key={tag} className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                {TAG_LABELS[tag] || tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {message.weeklyFocus && (
                                    <div className={`mt-1 text-[11px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${WEEKLY_FOCUS_META[message.weeklyFocus]?.color || ""}`}>
                                        {WEEKLY_FOCUS_META[message.weeklyFocus]?.label}
                                    </div>
                                )}
                                {!message.signal && message.score !== undefined && message.score !== null && (
                                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-200">Score: {message.score}</p>
                                )}
                                {message.evidence?.length > 0 && (
                                    <div className="mt-2">
                                        <EvidenceViewer evidence={message.evidence} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-white/80 bg-gradient-to-r from-sky-50 via-violet-50 to-pink-50 px-4 py-3 text-sm text-slate-700 dark:border-white/20 dark:from-sky-950/70 dark:via-violet-950/70 dark:to-pink-950/60 dark:text-slate-200">
                        No communication notes for this subject yet.
                    </div>
                )}

                {isKindergartenPortal && (
                    <div className="mt-4 rounded-2xl border border-white/80 bg-gradient-to-r from-emerald-50 via-cyan-50 to-sky-50 p-4 dark:border-white/20 dark:from-emerald-950/60 dark:via-cyan-950/55 dark:to-sky-950/55">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-700 dark:text-emerald-100">
                                    Parent Proxy Portal
                                </p>
                                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">Home Observation Notes</h4>
                            </div>
                            <span className="rounded-full border border-white/70 bg-white/85 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:border-white/20 dark:bg-slate-800/70 dark:text-slate-200">
                                {portalViewMode === "parent_proxy" ? "Edit Mode" : "Read-only"}
                            </span>
                        </div>

                        {portalViewMode === "parent_proxy" ? (
                            <div className="mt-3 space-y-2">
                                <textarea
                                    value={homeObservationNote}
                                    onChange={(event) => setHomeObservationNote(event.target.value)}
                                    placeholder="Share a short home observation (1-2 sentences)."
                                    rows={3}
                                    maxLength={260}
                                    className="w-full rounded-2xl border border-white/75 bg-white/90 px-3 py-2 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none dark:border-white/20 dark:bg-slate-800/70 dark:text-slate-100"
                                />
                                <button
                                    type="button"
                                    onClick={handleHomeObservationSubmit}
                                    disabled={!homeObservationNote.trim() || isSubmittingHomeObservation}
                                    className="inline-flex items-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmittingHomeObservation ? "Saving..." : "Submit Home Observation"}
                                </button>
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-200">
                                Switch to Parent Proxy mode to submit a home observation note.
                            </p>
                        )}

                        {Array.isArray(parentProxyData.homeObservations) && parentProxyData.homeObservations.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {parentProxyData.homeObservations.slice(0, 4).map((entry) => (
                                    <div key={entry.id || `${entry.createdAt}-${entry.note}`} className="rounded-xl border border-white/75 bg-white/85 px-3 py-2 dark:border-white/20 dark:bg-slate-800/70">
                                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-300">
                                            {entry.dateLabel} {entry.submittedByName ? `• ${entry.submittedByName}` : ""}
                                        </p>
                                        <p className="text-sm text-slate-700 dark:text-slate-100">{entry.note}</p>
                                    </div>
                                ))}
                            </div>
                        )}
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
