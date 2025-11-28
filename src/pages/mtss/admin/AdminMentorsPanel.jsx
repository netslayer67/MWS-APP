import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import AdminMentorAssignModal from "./AdminMentorAssignModal";

const KEYWORDS = ["teacher", "homeroom", "subject", "special"];
const CARD_THEMES = [
    {
        glass: "from-[#fdf2f8]/95 via-[#f5f3ff]/70 to-[#e0f2fe]/80 dark:from-white/10 dark:via-white/5 dark:to-[#0f172a]/60",
        accent: "from-[#ec4899] via-[#f97316] to-[#facc15]",
        tag: "from-[#ffe4e6]/85 via-[#fef3c7]/80 to-[#dbeafe]/80 text-rose-600",
        halo: "from-[#f472b6]/35 via-[#fef08a]/25 to-transparent",
    },
    {
        glass: "from-[#e0f2fe]/95 via-[#ccfbf1]/70 to-[#f5f5ff]/80 dark:from-[#0f172a]/70 dark:via-[#0b1220]/70 dark:to-[#111827]/80",
        accent: "from-[#3b82f6] via-[#22d3ee] to-[#a855f7]",
        tag: "from-[#bae6fd]/80 via-[#ccfbf1]/80 to-[#ede9fe]/80 text-sky-700",
        halo: "from-[#22d3ee]/30 via-[#6366f1]/30 to-transparent",
    },
    {
        glass: "from-[#fff7ed]/95 via-[#fef9c3]/70 to-[#e0f2fe]/80 dark:from-[#1f2937]/80 dark:via-[#0f172a]/80 dark:to-[#0f172a]/60",
        accent: "from-[#f97316] via-[#facc15] to-[#4ade80]",
        tag: "from-[#ffedd5]/90 via-[#fef3c7]/80 to-[#e0f2fe]/80 text-amber-700",
        halo: "from-[#fb923c]/30 via-[#fde047]/25 to-transparent",
    },
    {
        glass: "from-[#ede9fe]/95 via-[#e0f2fe]/70 to-[#fef3c7]/80 dark:from-[#0f172a]/70 dark:via-[#111827]/70 dark:to-[#1f2937]/70",
        accent: "from-[#a855f7] via-[#ec4899] to-[#f472b6]",
        tag: "from-[#ddd6fe]/90 via-[#f9a8d4]/80 to-[#fef3c7]/80 text-fuchsia-700",
        halo: "from-[#c084fc]/35 via-[#fb7185]/25 to-transparent",
    },
];
const AOS_VARIANTS = ["fade-up", "zoom-in", "flip-left", "fade-up-right", "zoom-out-up", "fade-up-left"];

const CARD_BATCH_SIZE = 9;

const AdminMentorsPanel = ({ mentorRoster = [], mentorDirectory = [], students = [], onRefresh }) => {
    const makeKey = (mentor) => (mentor?._id || mentor?.id || mentor?.email || mentor?.name || "").toString().toLowerCase();

    const isTeacherProfile = (mentor) => {
        const jobPosition = (mentor.jobPosition || "").toLowerCase();
        const role = (mentor.role || "").toLowerCase();
        const classRole = Array.isArray(mentor.classes)
            ? mentor.classes.some((cls) => (cls.role || "").toLowerCase().includes("teacher"))
            : false;
        return KEYWORDS.some((keyword) => jobPosition.includes(keyword)) || classRole || role.includes("teacher");
    };

    const teacherMentors = mentorDirectory.filter(isTeacherProfile);

    const statsMap = new Map(
        mentorRoster.map((mentor) => [
            makeKey(mentor),
            {
                activeStudents: mentor.activeStudents || mentor.students || 0,
                successRate: mentor.successRate || "0%",
            },
        ]),
    );

    const rosterMap = new Map();

    teacherMentors.forEach((mentor) => {
        const key = makeKey(mentor);
        const stats = statsMap.get(key) || { activeStudents: 0, successRate: "0%" };
        rosterMap.set(key, {
            _id: mentor._id || mentor.id || null,
            name: mentor.name,
            role: mentor.jobPosition || mentor.role || "Teacher",
            activeStudents: stats.activeStudents,
            successRate: stats.successRate,
        });
    });
    mentorRoster.forEach((mentor) => {
        const key = makeKey(mentor);
        const existing = rosterMap.get(key);
        rosterMap.set(key, {
            _id: mentor._id || mentor.id || rosterMap.get(key)?._id || null,
            name: mentor.name,
            role: mentor.role || existing?.role || "Teacher",
            activeStudents: mentor.activeStudents || mentor.students || existing?.activeStudents || 0,
            successRate: mentor.successRate || existing?.successRate || "0%",
        });
    });
    const roster = Array.from(rosterMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    const [visibleCount, setVisibleCount] = useState(CARD_BATCH_SIZE);
    const sentinelRef = useRef(null);

    useEffect(() => {
        setVisibleCount(CARD_BATCH_SIZE);
    }, [roster.length]);

    useEffect(() => {
        if (!sentinelRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting) {
                    setVisibleCount((prev) => {
                        if (prev >= roster.length) return prev;
                        return Math.min(roster.length, prev + CARD_BATCH_SIZE);
                    });
                }
            },
            { threshold: 0.4 },
        );
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [roster.length]);

    const visibleMentors = useMemo(() => roster.slice(0, Math.min(visibleCount, roster.length)), [roster, visibleCount]);

    const [activeMentorId, setActiveMentorId] = useState(null);
    const activeMentor = useMemo(
        () => mentorDirectory.find((mentor) => mentor._id === activeMentorId),
        [mentorDirectory, activeMentorId],
    );

    const triggerAssign = useCallback(
        (mentorItem) => {
            if (mentorItem._id) {
                setActiveMentorId(mentorItem._id);
                return;
            }
            const match = mentorDirectory.find((mentor) => mentor.name === mentorItem.name);
            if (match?._id) {
                setActiveMentorId(match._id);
            }
        },
        [mentorDirectory],
    );

    return (
        <div className="space-y-8" data-aos="fade-up" data-aos-delay="100">
            <div className="glass glass-card mtss-card-surface p-8 rounded-[40px] shadow-[0_30px_90px_rgba(15,23,42,0.32)] border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-white/5 dark:via-white/10 dark:to-white/5 backdrop-blur-2xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8" data-aos="fade-up" data-aos-delay="150">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-[#e0f2fe] via-[#fef3c7] to-[#fbcfe8] text-sm font-semibold text-slate-700 dark:text-white shadow-inner">
                            <Sparkles className="w-4 h-4 text-rose-500" />
                            Mentor Squad
                        </div>
                        <div className="rounded-[28px] bg-gradient-to-r from-white/95 via-white/70 to-white/40 dark:from-white/10 dark:via-white/5 dark:to-white/5 p-5 border border-white/60 dark:border-white/10 shadow-inner backdrop-blur-xl space-y-2">
                            <h3 className="text-3xl font-black text-foreground dark:text-white bg-gradient-to-r from-[#14b8a6] via-[#3b82f6] to-[#a855f7] text-transparent bg-clip-text">
                                Manage Mentors
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-white/70 max-w-2xl">
                                Assign caseloads, check success rates, and celebrate wins without losing the playful flow. Liquid-glass cards keep the data airy and joyful.
                            </p>
                            <div className="rounded-2xl bg-gradient-to-r from-[#fee2e2]/80 via-[#fef9c3]/80 to-[#cffafe]/80 dark:from-white/10 dark:via-white/5 dark:to-white/5 px-4 py-2 text-xs font-semibold text-rose-500 flex items-center gap-2 shadow-sm">
                                <Sparkles className="w-4 h-4" />
                                Tap “Assign students” to pair mentors with multiple kids instantly.
                            </div>
                        </div>
                    </div>
                    <button className="px-5 py-3 rounded-full bg-gradient-to-r from-[#fde68a] via-[#fca5a5] to-[#f472b6] text-sm font-semibold text-rose-700 shadow-lg hover:-translate-y-0.5 transition border border-white/70">
                        Add Mentor
                    </button>
                </div>
                <div className="grid gap-5 lg:gap-6 md:grid-cols-2 xl:grid-cols-3" data-aos="fade-up" data-aos-delay="180">
                    {visibleMentors.map((mentor, index) => {
                        const theme = CARD_THEMES[index % CARD_THEMES.length];
                        const aosVariant = AOS_VARIANTS[(index + 2) % AOS_VARIANTS.length];
                        const activeStudents = Number(mentor.activeStudents) || 0;
                        const successValue = Number(String(mentor.successRate ?? "0").replace(/[^\d.]/g, "")) || 0;
                        const successTone =
                            successValue >= 85 ? "text-emerald-400" : successValue >= 60 ? "text-amber-400" : "text-rose-400";

                        return (
                            <motion.div
                                key={mentor.name}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: (index % CARD_BATCH_SIZE) * 0.05 }}
                                className={`relative group overflow-hidden rounded-[24px] border border-white/40 dark:border-white/5 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.16)] backdrop-blur-xl bg-gradient-to-br ${theme.glass}`}
                                data-aos={aosVariant}
                                data-aos-delay={200 + (index % CARD_BATCH_SIZE) * 60}
                                data-aos-duration={650 + (index % 4) * 120}
                            >
                                <div className={`absolute -top-14 right-3 w-32 h-32 bg-gradient-to-br ${theme.halo} blur-3xl opacity-60 group-hover:opacity-80 transition`} />
                                <div className="absolute inset-0 pointer-events-none opacity-15 group-hover:opacity-30 transition bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_60%)]" />

                                <div className="relative space-y-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-2xl bg-white/85 text-slate-900 font-black flex items-center justify-center shadow-inner shadow-white/40">
                                                {mentor.name
                                                    .split(" ")
                                                    .map((part) => part[0])
                                                    .slice(0, 2)
                                                    .join("")}
                                            </div>
                                            <div>
                                                <p className="text-base font-semibold text-slate-900 dark:text-white">{mentor.name}</p>
                                                <p className="text-xs font-medium text-slate-600 dark:text-white/70">{mentor.role}</p>
                                            </div>
                                        </div>
                                        <div className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-white/60">
                                            <span className={`px-3 py-1 rounded-full shadow-inner shadow-white/20 bg-gradient-to-r ${theme.tag}`}>
                                                Trusted
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-600 dark:text-white/70">
                                        <div className="rounded-2xl border border-white/40 dark:border-white/10 px-3 py-3 bg-white/80 dark:bg-white/5 backdrop-blur text-center">
                                            <p className="text-[0.55rem] uppercase tracking-[0.35em] text-slate-500 dark:text-white/60">Active</p>
                                            <p className="text-2xl font-black text-slate-900 dark:text-white">{activeStudents}</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/40 dark:border-white/10 px-3 py-3 bg-white/80 dark:bg-white/5 backdrop-blur text-center">
                                            <p className="text-[0.55rem] uppercase tracking-[0.35em] text-slate-500 dark:text-white/60">Success</p>
                                            <p className={`text-2xl font-black ${successTone}`}>{mentor.successRate}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 text-[0.65rem] font-semibold text-slate-600 dark:text-white/70">
                                        <span className="px-3 py-1 rounded-full border border-white/60 dark:border-white/20 bg-white/80 dark:bg-white/5">
                                            {activeStudents >= 12 ? "High load" : "Balanced load"}
                                        </span>
                                        <span className="px-3 py-1 rounded-full border border-white/60 dark:border-white/20 bg-white/80 dark:bg-white/5">
                                            SEL friendly
                                        </span>
                                        <span className="px-3 py-1 rounded-full border border-white/60 dark:border-white/20 bg-white/80 dark:bg-white/5">
                                            {successValue >= 90 ? "Spotlight" : "Steady growth"}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            className={`flex-1 px-4 py-2.5 rounded-full text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition bg-gradient-to-r ${theme.accent}`}
                                        >
                                            Pulse profile
                                        </button>
                                        <button
                                            className="flex-1 px-4 py-2.5 rounded-full border border-white/60 dark:border-white/20 text-slate-900 dark:text-white bg-white/85 dark:bg-white/5 shadow-inner hover:-translate-y-0.5 transition"
                                            onClick={() => triggerAssign(mentor)}
                                        >
                                            Assign
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                <div
                    ref={sentinelRef}
                    className="mt-8 flex flex-col items-center gap-2 text-xs font-semibold text-muted-foreground"
                    data-aos="fade-up"
                >
                    <span>
                        Showing {visibleMentors.length} of {roster.length} mentors
                    </span>
                    {visibleMentors.length < roster.length ? (
                        <span className="px-3 py-1 rounded-full border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/5 text-[0.65rem] uppercase tracking-[0.3em]">
                            Scroll to load more
                        </span>
                    ) : (
                        <span className="px-3 py-1 rounded-full border border-emerald-200/60 bg-emerald-50 text-emerald-600 text-[0.65rem] uppercase tracking-[0.3em]">
                            All mentors loaded
                        </span>
                    )}
                </div>

                {activeMentor && (
                    <AdminMentorAssignModal
                        open={Boolean(activeMentor)}
                        mentor={activeMentor}
                        students={students}
                        onClose={() => setActiveMentorId(null)}
                        onAssigned={() => {
                            setActiveMentorId(null);
                            onRefresh?.();
                        }}
                    />
                )}
            </div>
        </div>
    );
};

AdminMentorsPanel.displayName = "AdminMentorsPanel";
export default memo(AdminMentorsPanel);
