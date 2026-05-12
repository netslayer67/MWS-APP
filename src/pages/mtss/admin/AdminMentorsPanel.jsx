import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, BarChart3, CheckCircle2 } from "lucide-react";
import PilotTaskHintBanner from "../components/PilotTaskHintBanner";
import { CARD_THEMES, AOS_VARIANTS, CARD_BATCH_SIZE } from "./config/mentorPanelConfig";
import { buildMentorRoster, makeMentorKey } from "./utils/mentorRosterUtils";
import AdminMentorsHeader from "./components/AdminMentorsHeader";
import MentorCard from "./components/MentorCard";
import AdminMentorsFooter from "./components/AdminMentorsFooter";

const getMentorWorkload = (mentor = {}) => {
    const classOwnedStudents = Number(mentor.classOwnedStudents ?? mentor.activeStudents) || 0;
    const manualAssignedStudents = Number(mentor.manualAssignedStudents ?? mentor.interventionStudents) || 0;
    return classOwnedStudents + manualAssignedStudents;
};

const AdminMentorsPanel = ({ mentorRoster = [], mentorDirectory = [], students = [], pilotGuide = null }) => {
    const navigate = useNavigate();
    const [tierFilter, setTierFilter] = useState("all");
    const roster = useMemo(
        () => buildMentorRoster(mentorRoster, mentorDirectory, students),
        [mentorRoster, mentorDirectory, students],
    );
    const hasTierCoverage = useCallback(
        (mentor, tierCode) => Array.isArray(mentor.coverage) && mentor.coverage.some((item) => item?.tierCode === tierCode),
        [],
    );
    const tierCounts = useMemo(() => ({
        all: roster.length,
        tier2: roster.filter((mentor) => hasTierCoverage(mentor, "tier2")).length,
        tier3: roster.filter((mentor) => hasTierCoverage(mentor, "tier3")).length,
    }), [hasTierCoverage, roster]);
    const filteredRoster = useMemo(() => {
        if (tierFilter === "all") return roster;
        return roster.filter((mentor) => hasTierCoverage(mentor, tierFilter));
    }, [hasTierCoverage, roster, tierFilter]);
    const workloadSummary = useMemo(() => {
        const rows = filteredRoster
            .map((mentor) => ({
                name: mentor.name,
                role: mentor.role,
                classOwnedStudents: Number(mentor.classOwnedStudents ?? mentor.activeStudents) || 0,
                supportUnits: Number(mentor.manualAssignedStudents ?? mentor.interventionStudents) || 0,
                total: getMentorWorkload(mentor),
            }))
            .sort((a, b) => b.total - a.total);
        const nonZeroRows = rows.filter((row) => row.total > 0);
        const max = rows[0]?.total || 0;
        const min = nonZeroRows.length ? nonZeroRows[nonZeroRows.length - 1].total : 0;
        const average = rows.length ? rows.reduce((sum, row) => sum + row.total, 0) / rows.length : 0;
        const ratio = min > 0 ? max / min : (max > 0 ? Infinity : 0);
        const level = ratio >= 10
            ? "critical"
            : max >= average * 1.8 && max - min >= 5
                ? "warning"
                : "balanced";
        const guidance = level === "critical"
            ? `${rows[0]?.name || "One mentor"} has at least 10x more students/support units than ${nonZeroRows[nonZeroRows.length - 1]?.name || "another mentor"}. Rebalance new handoffs before assigning more students.`
            : level === "warning"
                ? "Workload is starting to skew. Review the top-loaded mentor before approving another special-case handoff."
                : "Workload is currently balanced enough for normal assignment decisions.";
        return {
            rows,
            max,
            min,
            average,
            ratio,
            level,
            guidance,
        };
    }, [filteredRoster]);

    const [visibleCount, setVisibleCount] = useState(CARD_BATCH_SIZE);
    const sentinelRef = useRef(null);

    useEffect(() => {
        setVisibleCount(CARD_BATCH_SIZE);
    }, [filteredRoster.length, tierFilter]);

    useEffect(() => {
        if (!sentinelRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                    if (entry.isIntersecting) {
                        setVisibleCount((prev) => {
                            if (prev >= filteredRoster.length) return prev;
                            return Math.min(filteredRoster.length, prev + CARD_BATCH_SIZE);
                        });
                    }
            },
            { threshold: 0.4 },
        );
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [filteredRoster.length]);

    const visibleMentors = useMemo(
        () => filteredRoster.slice(0, Math.min(visibleCount, filteredRoster.length)),
        [filteredRoster, visibleCount],
    );

    const deriveMentorProfile = useCallback(
        (mentorItem) => {
            const rosterKey = makeMentorKey(mentorItem);
            const directoryMatch = mentorDirectory.find((mentor) => makeMentorKey(mentor) === rosterKey);
            if (!directoryMatch) return mentorItem;
            return {
                ...mentorItem,
                ...directoryMatch,
                _id: directoryMatch._id || mentorItem._id || mentorItem.id || null,
            };
        },
        [mentorDirectory],
    );

    const triggerAssign = useCallback(
        (mentorItem) => {
            const mergedMentor = deriveMentorProfile(mentorItem);
            if (!mergedMentor?._id) {
                console.warn("Mentor missing identifier, unable to assign", mentorItem);
                return;
            }
            navigate(`/mtss/admin/assign/${mergedMentor._id}`, {
                state: { mentor: mergedMentor },
            });
        },
        [deriveMentorProfile, navigate],
    );

    return (
        <div className="space-y-8" data-aos="fade-up" data-aos-delay="100">
            <div className="glass glass-card mtss-card-surface p-8 rounded-[40px] shadow-[0_30px_90px_rgba(15,23,42,0.32)] border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-white/5 dark:via-white/10 dark:to-white/5 backdrop-blur-2xl">
                {pilotGuide && (
                    <div className="mb-6">
                        <PilotTaskHintBanner guide={pilotGuide} actionLabel="Follow this mentor check next" />
                    </div>
                    )}
                    <AdminMentorsHeader />
                    <div className="mb-5 flex flex-wrap items-center gap-2">
                        {[
                            { key: "all", label: "All", count: tierCounts.all },
                            { key: "tier2", label: "Tier 2", count: tierCounts.tier2 },
                            { key: "tier3", label: "Tier 3", count: tierCounts.tier3 },
                        ].map((option) => {
                            const active = tierFilter === option.key;
                            return (
                                <button
                                    key={option.key}
                                    type="button"
                                    onClick={() => setTierFilter(option.key)}
                                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.2em] transition ${
                                        active
                                            ? "border-cyan-300 bg-cyan-500 text-white shadow-lg shadow-cyan-500/25"
                                            : "border-white/50 bg-white/75 text-slate-600 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white/70"
                                    }`}
                                >
                                    {option.label}
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white/70"}`}>
                                        {option.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <div className={`mb-6 rounded-[28px] border p-5 ${
                        workloadSummary.level === "critical"
                            ? "border-rose-200 bg-rose-50/85 text-rose-900 dark:border-rose-400/25 dark:bg-rose-950/25 dark:text-rose-100"
                            : workloadSummary.level === "warning"
                                ? "border-amber-200 bg-amber-50/85 text-amber-900 dark:border-amber-400/25 dark:bg-amber-950/25 dark:text-amber-100"
                                : "border-emerald-200 bg-emerald-50/85 text-emerald-900 dark:border-emerald-400/25 dark:bg-emerald-950/25 dark:text-emerald-100"
                    }`}>
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="max-w-2xl">
                                <div className="flex items-center gap-2">
                                    {workloadSummary.level === "balanced" ? (
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                                    ) : (
                                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                                    )}
                                    <p className="text-[11px] font-black uppercase tracking-[0.28em]">Workload balance</p>
                                </div>
                                <p className="mt-2 text-sm font-semibold leading-relaxed">{workloadSummary.guidance}</p>
                            </div>
                            <div className="grid min-w-[240px] grid-cols-3 gap-2 text-center text-xs font-black">
                                <div className="rounded-2xl bg-white/70 px-3 py-2 dark:bg-white/10">
                                    <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">Highest</p>
                                    <p className="text-2xl">{workloadSummary.max}</p>
                                </div>
                                <div className="rounded-2xl bg-white/70 px-3 py-2 dark:bg-white/10">
                                    <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">Lowest</p>
                                    <p className="text-2xl">{workloadSummary.min}</p>
                                </div>
                                <div className="rounded-2xl bg-white/70 px-3 py-2 dark:bg-white/10">
                                    <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">Ratio</p>
                                    <p className="text-2xl">{workloadSummary.ratio === Infinity ? "∞" : `${workloadSummary.ratio.toFixed(1)}x`}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            {workloadSummary.rows.slice(0, 6).map((row) => {
                                const pct = workloadSummary.max ? Math.max(4, Math.round((row.total / workloadSummary.max) * 100)) : 0;
                                return (
                                    <div key={row.name} className="grid gap-2 text-xs font-semibold sm:grid-cols-[160px_1fr_88px] sm:items-center">
                                        <div className="min-w-0">
                                            <p className="truncate">{row.name}</p>
                                            <p className="truncate text-[10px] opacity-70">{row.role || "Mentor"}</p>
                                        </div>
                                        <div className="h-3 rounded-full bg-white/70 dark:bg-white/10">
                                            <div
                                                className={`h-full rounded-full ${
                                                    workloadSummary.level === "critical"
                                                        ? "bg-rose-500"
                                                        : workloadSummary.level === "warning"
                                                            ? "bg-amber-500"
                                                            : "bg-emerald-500"
                                                }`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <div className="inline-flex items-center gap-1 tabular-nums">
                                            <BarChart3 className="h-3.5 w-3.5" />
                                            {row.total} total
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="grid gap-5 lg:gap-6 md:grid-cols-2 xl:grid-cols-3" data-aos="fade-up" data-aos-delay="180">
                        {visibleMentors.map((mentor, index) => {
                        const theme = CARD_THEMES[index % CARD_THEMES.length];
                        const aosVariant = AOS_VARIANTS[(index + 2) % AOS_VARIANTS.length];
                        return (
                            <MentorCard
                                key={mentor.name}
                                mentor={mentor}
                                theme={theme}
                                aosVariant={aosVariant}
                                index={index}
                                batchSize={CARD_BATCH_SIZE}
                                workloadMax={workloadSummary.max}
                                highlightAssign={pilotGuide?.mentorAction === "assign" && index === 0}
                                onAssign={triggerAssign}
                            />
                        );
                    })}
                    </div>
                    <div ref={sentinelRef}>
                        <AdminMentorsFooter visibleCount={visibleMentors.length} total={filteredRoster.length} />
                    </div>
            </div>
        </div>
    );
};

AdminMentorsPanel.displayName = "AdminMentorsPanel";
export default memo(AdminMentorsPanel);
