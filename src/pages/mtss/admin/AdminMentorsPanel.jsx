import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PilotTaskHintBanner from "../components/PilotTaskHintBanner";
import { CARD_THEMES, AOS_VARIANTS, CARD_BATCH_SIZE } from "./config/mentorPanelConfig";
import { buildMentorRoster, makeMentorKey } from "./utils/mentorRosterUtils";
import AdminMentorsHeader from "./components/AdminMentorsHeader";
import MentorCard from "./components/MentorCard";
import AdminMentorsFooter from "./components/AdminMentorsFooter";

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
