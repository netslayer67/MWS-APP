import { memo, useEffect, useMemo, useState } from "react";
import { CircleDot, Sparkles, Star, TrendingUp } from "lucide-react";
import { buildStudentProfileView } from "../utils/studentProfileUtils";
import { formatMentorDisplay } from "../utils/mentorNameUtils";
import EvidenceViewer from "../components/EvidenceViewer";
import { useToast } from "@/components/ui/use-toast";
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

const SIGNAL_BADGE_MAP = {
    emerging: "bg-amber-100 text-amber-700 dark:bg-amber-900/35 dark:text-amber-300",
    developing: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-300",
    consistent: "bg-green-100 text-green-700 dark:bg-green-900/35 dark:text-green-300",
};

const TAG_LABELS = {
    emotional_regulation: "Emotional Regulation",
    language: "Language",
    social: "Social",
    motor: "Motor Skills",
    independence: "Independence",
};

const isKindergartenQualitativeStudent = (student = {}, interventions = []) => {
    if (student?.kindergartenPortal?.isKindergarten && student?.kindergartenPortal?.isQualitative) return true;
    const gradePool = [student?.grade, student?.currentGrade, student?.className]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    const isKindergarten = /(kindergarten|pre[-\s]?k|\bk\s*1\b|\bk\s*2\b|kindy)/i.test(gradePool);
    const hasQualitative = Array.isArray(interventions) && interventions.some((entry) => entry?.mode === "qualitative");
    return isKindergarten && hasQualitative;
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

const StudentProgressPanel = ({
    student,
    isLoading = false,
    portalViewMode = "student",
    onSubmitMoodCheckin,
    isSubmittingMood = false,
}) => {
    const { toast } = useToast();
    const studentProfileView = useMemo(() => {
        if (!student) {
            return {
                profile: null,
                currentIntervention: null,
                sortedInterventions: [],
                strategyLabel: "",
                goalLabel: "",
            };
        }
        return buildStudentProfileView(student);
    }, [student]);

    const {
        profile,
        currentIntervention,
        sortedInterventions,
        strategyLabel,
        goalLabel,
    } = studentProfileView;

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
    const kindergartenPortal = student?.kindergartenPortal || null;
    const isKindergartenQualitative = isKindergartenQualitativeStudent(student, visibleSubjects);
    const [selectedMood, setSelectedMood] = useState("");
    const [selectedRegulation, setSelectedRegulation] = useState("");
    const [moodNote, setMoodNote] = useState("");

    useEffect(() => {
        const today = kindergartenPortal?.moodCheckin?.today;
        if (!today) {
            setSelectedMood("");
            setSelectedRegulation("");
            setMoodNote("");
            return;
        }
        setSelectedMood(today.mood || "");
        setSelectedRegulation(today.regulationChoice || "");
        setMoodNote(today.note || "");
    }, [kindergartenPortal?.moodCheckin?.today]);

    const handleMoodSubmit = async () => {
        if (!student?.id || !selectedMood) return;
        if (!onSubmitMoodCheckin) return;
        try {
            await onSubmitMoodCheckin(student.id, {
                mood: selectedMood,
                regulationChoice: selectedRegulation || undefined,
                note: moodNote.trim() || undefined,
                source: portalViewMode === "parent_proxy" ? "parent_proxy" : "student",
            });
            toast({
                title: "Mood check-in saved",
                description: "Your daily mood check-in has been recorded.",
            });
        } catch (error) {
            toast({
                title: "Unable to save mood check-in",
                description: error?.response?.data?.message || error?.message || "Please try again.",
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="rounded-[30px] border border-white/80 bg-white/90 p-8 text-center text-sm text-slate-700 shadow-sm dark:border-white/20 dark:bg-slate-900/82 dark:text-slate-200">
                Loading latest MTSS progress...
            </div>
        );
    }

    if (!student) {
        return (
            <div className="rounded-[30px] border border-white/80 bg-white/90 p-8 text-center text-sm text-slate-700 shadow-sm dark:border-white/20 dark:bg-slate-900/82 dark:text-slate-200">
                Student profile data is not available yet.
            </div>
        );
    }

    if (isKindergartenQualitative) {
        const growthBoard = kindergartenPortal?.growthBoard || {};
        const moodCheckin = kindergartenPortal?.moodCheckin || {};
        const growthCards = Array.isArray(growthBoard.cards) ? growthBoard.cards : [];
        const moodOptions = Array.isArray(moodCheckin.options) ? moodCheckin.options : [];
        const regulationOptions = Array.isArray(moodCheckin.regulationOptions) ? moodCheckin.regulationOptions : [];
        const moodLocked = portalViewMode === "parent_proxy";

        return (
            <div className="space-y-5">
                <div className="rounded-[34px] border border-white/80 bg-white/90 p-5 shadow-[0_14px_36px_rgba(16,185,129,0.12)] backdrop-blur-xl dark:border-white/20 dark:bg-slate-900/82">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-600 dark:text-slate-200">My Growth Board</p>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white">I Can! Portfolio</h3>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-200">
                                Unlock cards from real classroom evidence and keep collecting growth stamps.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/80 bg-white/88 px-4 py-2 text-sm font-semibold text-slate-800 dark:border-white/20 dark:bg-slate-800/70 dark:text-slate-100">
                            Stamps: {growthBoard?.stampCount || 0} / {growthBoard?.milestone?.target || 5}
                        </div>
                    </div>

                    {growthCards.length > 0 ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {growthCards.slice(0, 12).map((card) => {
                                const cover = card?.imageEvidence?.[0]?.url || null;
                                return (
                                    <div
                                        key={card.id}
                                        className="overflow-hidden rounded-2xl border border-white/80 bg-white/92 shadow-sm dark:border-white/20 dark:bg-slate-800/72"
                                    >
                                        {cover ? (
                                            <img src={cover} alt={card.caption || "Growth evidence"} className="h-36 w-full object-cover" />
                                        ) : (
                                            <div className="h-36 w-full bg-gradient-to-br from-fuchsia-100 via-violet-100 to-cyan-100 dark:from-fuchsia-900/40 dark:via-violet-900/35 dark:to-cyan-900/35" />
                                        )}
                                        <div className="space-y-2 p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-300">{card.dateLabel}</p>
                                                {card.signal && (
                                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${SIGNAL_BADGE_MAP[card.signal] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>
                                                        {card.signal}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{card.caption}</p>
                                            {Array.isArray(card.tags) && card.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {card.tags.map((tag) => (
                                                        <span key={`${card.id}-${tag}`} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                                                            {TAG_LABELS[tag] || tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {Array.isArray(card.audioEvidence) && card.audioEvidence.length > 0 && (
                                                <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                                                    Voice note available
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mt-4 rounded-2xl border border-white/80 bg-gradient-to-r from-emerald-50 to-cyan-50 px-4 py-3 text-sm text-slate-700 dark:border-white/20 dark:from-emerald-950/55 dark:to-cyan-950/55 dark:text-slate-200">
                            Growth cards will appear when teachers upload evidence with developing or consistent signals.
                        </div>
                    )}
                </div>

                <div className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-md backdrop-blur-xl dark:border-white/20 dark:bg-slate-900/82 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-600 dark:text-slate-200">Daily Check-in</p>
                            <h3 className="text-lg font-black text-slate-800 dark:text-white">How do I feel today?</h3>
                        </div>
                        {moodCheckin?.today?.dateLabel && (
                            <span className="rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-white/20 dark:bg-slate-800/70 dark:text-slate-100">
                                Last: {moodCheckin.today.dateLabel}
                            </span>
                        )}
                    </div>

                    {moodLocked ? (
                        <div className="rounded-2xl border border-blue-200 bg-blue-50/90 px-4 py-3 text-sm text-blue-700 dark:border-blue-400/25 dark:bg-blue-400/10 dark:text-blue-300">
                            Parent Proxy mode keeps mood check-in read-only. Switch to Student View to submit today's mood.
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-2 sm:grid-cols-5">
                                {moodOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setSelectedMood(option.value)}
                                        className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                                            selectedMood === option.value
                                                ? "border-violet-300 bg-violet-100 text-violet-700 dark:border-violet-300/55 dark:bg-violet-900/50 dark:text-violet-100"
                                                : "border-white/80 bg-white/92 text-slate-700 dark:border-white/20 dark:bg-slate-800/72 dark:text-slate-200"
                                        }`}
                                    >
                                        <span className="mr-1">{option.icon}</span>
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">
                                    Optional calming choice
                                </p>
                                <div className="grid gap-2 sm:grid-cols-3">
                                    {regulationOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setSelectedRegulation(option.value)}
                                            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                                                selectedRegulation === option.value
                                                    ? "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-300/55 dark:bg-emerald-900/40 dark:text-emerald-200"
                                                    : "border-white/80 bg-white/92 text-slate-700 dark:border-white/20 dark:bg-slate-800/72 dark:text-slate-200"
                                            }`}
                                        >
                                            <span className="mr-1">{option.icon}</span>
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <textarea
                                value={moodNote}
                                onChange={(event) => setMoodNote(event.target.value)}
                                placeholder="Optional note (what happened today)"
                                className="w-full rounded-2xl border border-white/75 bg-white/88 px-4 py-3 text-sm text-slate-700 focus:border-violet-300 focus:outline-none dark:border-white/20 dark:bg-slate-800/72 dark:text-slate-100"
                                rows={2}
                                maxLength={220}
                            />

                            <button
                                type="button"
                                onClick={handleMoodSubmit}
                                disabled={!selectedMood || isSubmittingMood}
                                className="inline-flex items-center rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmittingMood ? "Saving..." : "Save Daily Mood"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    const unitLabel = activeIntervention?.progressUnit || profile?.progressUnit || "pts";
    const baseline = activeIntervention?.baseline ?? profile?.baseline;
    const current = activeIntervention?.current ?? profile?.current;
    const target = activeIntervention?.target ?? profile?.target;
    const progressPercent = activeIntervention?.progress ?? toProgressPercent(current, target);
    const nextReviewLabel = formatReviewDate(activeIntervention?.endDate, student?.nextUpdate || "Awaiting schedule");

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
            <div className="rounded-[34px] border border-white/80 bg-white/90 p-5 shadow-[0_14px_36px_rgba(99,102,241,0.1)] backdrop-blur-xl dark:border-white/20 dark:bg-slate-900/82">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-600 dark:text-slate-200">Current Goal</p>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white">{mainGoal}</h3>
                    </div>
                    <div className="rounded-2xl border border-white/80 bg-white/88 px-4 py-2 text-sm font-semibold text-slate-800 dark:border-white/20 dark:bg-slate-800/70 dark:text-slate-100">
                        Next Review: {nextReviewLabel}
                    </div>
                </div>

                {visibleSubjects.length > 1 && (
                    <div className="mt-4 rounded-2xl border border-white/85 bg-gradient-to-r from-fuchsia-50 via-violet-50 to-cyan-50 p-3 dark:border-white/20 dark:from-fuchsia-900/55 dark:via-violet-900/55 dark:to-cyan-900/45">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-violet-700 dark:text-violet-100">
                                Subject Explorer
                            </p>
                            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-200">
                                Tap to switch view
                            </p>
                        </div>
                        <div className="no-scrollbar flex snap-x gap-2 overflow-x-auto pb-1">
                            {visibleSubjects.map((item) => {
                                const isActive = item.type === activeIntervention?.type;
                                const subjectEmoji = SUBJECT_EMOJI_MAP[item.type] || SUBJECT_EMOJI_MAP[item.label?.toUpperCase()] || "✨";
                                return (
                                    <button
                                        key={`${item.type}-${item.id || item.label}`}
                                        type="button"
                                        onClick={() => setActiveSubjectType(item.type)}
                                        className={`min-w-[180px] snap-start rounded-2xl border px-3 py-2 text-left transition-all duration-300 ${
                                            isActive
                                                ? "border-violet-300 bg-white shadow-md shadow-violet-200/50 dark:border-violet-300/60 dark:bg-violet-900/55 dark:shadow-violet-950/50"
                                                : "border-white/80 bg-white/90 hover:-translate-y-0.5 dark:border-white/20 dark:bg-slate-800/65"
                                        }`}
                                    >
                                        <p className="text-xs font-black text-slate-800 dark:text-slate-50">
                                            <span className="mr-1">{subjectEmoji}</span>
                                            {item.label}
                                        </p>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-200">
                                            {item.tierLabel || item.tier || "Tier 1"} - {item.status || "monitoring"}
                                        </p>
                                        <div className="mt-2 h-1.5 rounded-full bg-slate-300/70 dark:bg-slate-700/75">
                                            <div
                                                className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 transition-all duration-500"
                                                style={{ width: `${Math.max(0, Math.min(100, item.progress ?? 0))}%` }}
                                            />
                                        </div>
                                        <p className="mt-1 text-[11px] font-semibold text-violet-700 dark:text-violet-100">
                                            Progress: {item.progress ?? 0}%
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border border-rose-200/85 bg-gradient-to-r from-rose-100 to-pink-100 px-4 py-3 dark:border-rose-300/35 dark:from-rose-950/70 dark:to-pink-950/65">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-rose-700 dark:text-rose-100">Baseline</p>
                        <p className="text-2xl font-black text-rose-700 dark:text-rose-100">{formatScore(baseline, unitLabel)}</p>
                    </div>
                    <div className="rounded-2xl border border-sky-200/85 bg-gradient-to-r from-sky-100 to-blue-100 px-4 py-3 dark:border-sky-300/35 dark:from-sky-950/70 dark:to-blue-950/65">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-sky-700 dark:text-sky-100">Current</p>
                        <p className="text-2xl font-black text-sky-700 dark:text-sky-100">{formatScore(current, unitLabel)}</p>
                    </div>
                    <div className="rounded-2xl border border-violet-200/85 bg-gradient-to-r from-violet-100 to-indigo-100 px-4 py-3 dark:border-violet-300/35 dark:from-violet-950/70 dark:to-indigo-950/65">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-violet-700 dark:text-violet-100">Target</p>
                        <p className="text-2xl font-black text-violet-700 dark:text-violet-100">{formatScore(target, unitLabel)}</p>
                    </div>
                    <div className={`rounded-2xl border border-white/35 bg-gradient-to-r ${tone.badge} px-4 py-3 text-white shadow-[0_10px_24px_rgba(15,23,42,0.2)]`}>
                        <p className="text-[11px] uppercase tracking-[0.28em] text-white/90">Progress</p>
                        <p className="text-2xl font-black">{progressPercent === null ? "-" : `${progressPercent}%`}</p>
                        <p className="text-xs font-semibold text-white/90">{tone.helper}</p>
                    </div>
                </div>

                {visibleSubjects.length > 0 && (
                    <div className="mt-4 rounded-2xl border border-white/85 bg-gradient-to-r from-indigo-50/95 to-fuchsia-50/95 px-4 py-3 dark:border-white/20 dark:from-indigo-950/70 dark:to-fuchsia-950/60">
                        <div className="mb-2 flex items-center gap-2">
                            <CircleDot className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-200" />
                            <p className="text-xs font-bold uppercase tracking-[0.28em] text-indigo-700 dark:text-indigo-100">
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
                                            ? "border-violet-300 bg-white shadow-md shadow-violet-200/50 dark:border-violet-300/55 dark:bg-violet-900/55"
                                            : "border-white/80 bg-white/90 hover:-translate-y-0.5 dark:border-white/20 dark:bg-slate-800/70"
                                    }`}
                                >
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.label}</p>
                                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-200">
                                        {item.tierLabel || item.tier || "Tier 1"} - {item.status || "monitoring"}
                                    </p>
                                    <p className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-100">
                                        Progress: {item.progress ?? 0}%
                                    </p>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-200">
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
                <div className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-md backdrop-blur-xl dark:border-white/20 dark:bg-slate-900/82">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-600 dark:text-slate-200">Trend</p>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">Progress Trend</h3>
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-200">
                                {activeIntervention?.label || "Intervention"} over time compared to target. Higher line means better progress.
                            </p>
                        </div>
                        <Sparkles className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-200" />
                    </div>

                    <div className={`rounded-2xl border border-slate-300/80 bg-gradient-to-r ${tone.hero} p-3 shadow-inner dark:border-white/20`}>
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
                                <line key={y} x1="20" y1={y} x2="580" y2={y} stroke="rgba(71,85,105,0.28)" strokeWidth="1" />
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
                                    fill="rgba(30,41,59,0.95)"
                                    fontWeight="700"
                                >
                                    {formatScore(value, unitLabel)}
                                </text>
                            ))}
                        </svg>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                        {trendSummary.map((item) => (
                            <div key={item.label} className="rounded-xl border border-white/85 bg-white/88 px-3 py-2 dark:border-white/20 dark:bg-slate-800/72">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-600 dark:text-slate-200">{item.label}</p>
                                <p className="text-sm font-black text-slate-800 dark:text-slate-100">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 flex justify-between gap-2 text-xs text-slate-600 dark:text-slate-200">
                        {trendLabels.map((label, idx) => (
                            <span key={`${label || "point"}-${idx}`} className="max-w-[32%] truncate font-medium">
                                {label || `Point ${idx + 1}`}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-md backdrop-blur-xl dark:border-white/20 dark:bg-slate-900/82">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-600 dark:text-slate-200">Recent Updates</p>
                            <h3 className="text-lg font-black text-slate-800 dark:text-white">Mentor Notes</h3>
                        </div>
                        <Star className="h-5 w-5 text-pink-600 dark:text-pink-200" />
                    </div>

                    {updates.length > 0 ? (
                        <div className="space-y-3">
                            {updates.slice(0, 4).map((update, index) => (
                                <div key={`${update.date || "update"}-${index}`} className="rounded-2xl border border-white/80 bg-gradient-to-r from-violet-50 to-pink-50 px-4 py-3 dark:border-white/20 dark:from-violet-950/70 dark:to-pink-950/60">
                                    <p className="text-sm font-bold text-violet-700 dark:text-violet-100">{update.date || "Recent"}</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-100">{update.notes || "Check-in recorded"}</p>
                                    {update.score !== undefined && update.score !== null && (
                                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-200">Score: {formatScore(update.score, unitLabel)}</p>
                                    )}
                                    {update.evidence?.length > 0 && (
                                        <div className="mt-2">
                                            <EvidenceViewer evidence={update.evidence} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-white/80 bg-gradient-to-r from-violet-50 to-pink-50 px-4 py-3 text-sm text-slate-700 dark:border-white/20 dark:from-violet-950/70 dark:to-pink-950/60 dark:text-slate-200">
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
