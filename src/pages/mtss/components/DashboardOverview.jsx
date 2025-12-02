import React, { memo, useMemo, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Activity, Clock8, ChevronLeft, ChevronRight, Sparkles, Clock4 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid } from "recharts";
import StudentsTable from "./StudentsTable";
import TeacherStatCards from "../teacher/TeacherStatCards";

const BATCH = 10;

const DashboardOverview = memo(({ statCards, students, progressData, TierPill, ProgressBadge }) => {
    const [spotlightIndex, setSpotlightIndex] = useState(0);

    useEffect(() => {
        setSpotlightIndex(0);
    }, [students.length]);

    const setNext = useCallback(() => {
        setSpotlightIndex((prev) => (students.length ? (prev + 1) % students.length : 0));
    }, [students.length]);

    const setPrev = useCallback(() => {
        setSpotlightIndex((prev) => {
            if (!students.length) return 0;
            return (prev - 1 + students.length) % students.length;
        });
    }, [students.length]);

    const { spotlightStudent, spotlightProfile, progressUnit, spotlightStatus, weekLabel, chartSeries, history } = useMemo(() => {
        const student = students?.[spotlightIndex] ?? students?.[0] ?? null;
        const profile = student?.profile || {};
        const unit = profile.progressUnit || (student?.type === "Behavior" ? "pts" : student?.type === "Attendance" ? "%" : "wpm");
        const status = profile.target ? Math.round((profile.current / profile.target) * 100) : 0;
        const totalWeeks = parseInt(profile.duration, 10);
        const series = profile.chart?.length ? profile.chart : progressData?.length ? progressData : [{ label: "Start", date: "Start", reading: 0, goal: 100 }];
        const currentWeek = series.length;
        const label =
            totalWeeks && currentWeek
                ? `Week ${Math.min(currentWeek, totalWeeks)} of ${totalWeeks}`
                : profile.duration || "Weekly check-in";
        const historyList = profile.history || [];
        return {
            spotlightStudent: student,
            spotlightProfile: profile,
            progressUnit: unit,
            spotlightStatus: status,
            weekLabel: label,
            chartSeries: series,
            history: historyList,
        };
    }, [students, progressData, spotlightIndex]);

    const [visibleCount, setVisibleCount] = useState(BATCH);

    useEffect(() => {
        setVisibleCount(BATCH);
    }, [students.length]);

    const visibleStudents = useMemo(
        () => (students || []).slice(0, Math.min(visibleCount, students.length)),
        [students, visibleCount],
    );

    return (
        <div className="space-y-8 mtss-theme">
            <TeacherStatCards statCards={statCards} />

            <section className="glass glass-card mtss-card-surface mtss-rainbow-shell p-6 md:p-8 space-y-6 border border-primary/10">
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p className="uppercase text-xs text-muted-foreground tracking-[0.4em]">Fresh Updates</p>
                        <h2 className="text-2xl font-bold text-foreground dark:text-white">Kids on your radar today</h2>
                    </div>
                    <motion.button
                        className="mtss-rainbow-chip px-5 py-2 text-sm font-semibold"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                    >
                        Quick Add
                    </motion.button>
                </header>
                <div data-aos="fade-up" data-aos-delay="120">
                    <StudentsTable students={visibleStudents} TierPill={TierPill} ProgressBadge={ProgressBadge} dense />
                </div>
                <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground" data-aos="fade-up" data-aos-delay="180">
                    {visibleStudents.length < students.length ? (
                        <button
                            type="button"
                            onClick={() => setVisibleCount((prev) => Math.min(students.length, prev + BATCH))}
                            className="px-4 py-2 rounded-full bg-white/80 dark:bg-white/10 border border-primary/30 text-sm font-semibold text-primary shadow-sm hover:-translate-y-0.5 transition"
                        >
                            Load 10 more kids ({visibleStudents.length}/{students.length})
                        </button>
                    ) : (
                        <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-200 border border-emerald-200/70 dark:border-emerald-500/30">
                            All kids loaded
                        </span>
                    )}
                </div>
            </section>

            <section className="mtss-liquid mtss-card-surface mtss-rainbow-shell p-6 space-y-6 border border-primary/10">
                <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="uppercase text-xs tracking-[0.4em] text-muted-foreground">Student Spotlight</p>
                        <h2 className="text-2xl font-bold text-foreground dark:text-white">
                            {spotlightStudent?.name || "Featured Student"}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Quickly scan assignment context, trends, and recent notes for this student.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/75 dark:bg-white/10 border border-white/50 text-xs font-semibold text-foreground dark:text-white shadow-sm">
                            <Sparkles className="w-4 h-4 text-primary" />
                            {students.length} in roster
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 dark:bg-white/10 border border-white/60 dark:border-white/20 shadow-sm hover:-translate-y-0.5 transition"
                                onClick={setPrev}
                                aria-label="Previous student"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <select
                                className="px-4 py-2 rounded-full bg-white/80 dark:bg-white/10 border border-white/60 dark:border-white/20 text-sm font-semibold text-foreground dark:text-white shadow-sm"
                                value={spotlightStudent?.id || ""}
                                onChange={(e) => {
                                    const idx = students.findIndex((s) => (s.id || s._id) === e.target.value);
                                    setSpotlightIndex(idx >= 0 ? idx : 0);
                                }}
                            >
                                {students.map((student) => (
                                    <option key={student.id || student._id} value={student.id || student._id}>
                                        {student.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 dark:bg-white/10 border border-white/60 dark:border-white/20 shadow-sm hover:-translate-y-0.5 transition"
                                onClick={setNext}
                                aria-label="Next student"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mtss-rainbow-chip mtss-rainbow-chip--emerald text-xs font-semibold uppercase tracking-[0.3em]">
                            <Activity className="w-4 h-4" />
                            {spotlightStatus || 0}% to target
                        </div>
                    </div>
                </header>

                <div className="grid md:grid-cols-4 gap-4" data-aos="fade-up" data-aos-delay="80">
                    <div className="rounded-2xl border border-white/35 dark:border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur p-4 space-y-3 shadow-inner">
                        <div className="flex items-center justify-between">
                            <div className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Student</div>
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-white/10 border border-white/30 text-[11px] font-semibold text-foreground dark:text-white">
                                <Clock8 className="w-3.5 h-3.5" />
                                {weekLabel}
                            </span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span>Grade</span>
                                <span className="font-semibold text-foreground dark:text-white">{spotlightStudent?.grade ?? "-"}</span>
                            </div>
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span>Teacher</span>
                                <span className="font-semibold text-foreground dark:text-white">{spotlightProfile.teacher ?? "-"}</span>
                            </div>
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span>Mentor</span>
                                <span className="font-semibold text-foreground dark:text-white">{spotlightProfile.mentor ?? "-"}</span>
                            </div>
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span>Tier</span>
                                {spotlightStudent?.tier ? <TierPill tier={spotlightStudent.tier} /> : <span className="font-semibold text-foreground dark:text-white">-</span>}
                            </div>
                        </div>
                    </div>

                    <div className="mtss-rainbow-shell rounded-2xl border border-white/40 dark:border-white/10 p-4 space-y-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-[0.4em]">Intervention</p>
                        <ul className="space-y-2 text-sm text-foreground dark:text-white">
                            <li><strong>Type:</strong> {spotlightProfile.type ?? "-"}</li>
                            <li><strong>Strategy:</strong> {spotlightProfile.strategy ?? "-"}</li>
                            <li><strong>Started:</strong> {spotlightProfile.started ?? "-"}</li>
                            <li><strong>Duration:</strong> {spotlightProfile.duration ?? "-"}</li>
                        </ul>
                    </div>

                    <div className="mtss-rainbow-shell rounded-2xl border border-white/40 dark:border-white/10 p-4 space-y-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-[0.4em]">Progress</p>
                        <div className="grid grid-cols-2 gap-2 text-sm text-foreground dark:text-white">
                            <div><strong>Baseline:</strong> {spotlightProfile.baseline ?? "-"} {progressUnit}</div>
                            <div><strong>Current:</strong> {spotlightProfile.current ?? "-"} {progressUnit}</div>
                            <div><strong>Target:</strong> {spotlightProfile.target ?? "-"} {progressUnit}</div>
                            <div className="col-span-2"><strong>Status:</strong> {spotlightStatus}% to target</div>
                        </div>
                    </div>

                    <div className="mtss-rainbow-shell rounded-2xl border border-white/40 dark:border-white/10 p-4 space-y-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-[0.4em]">Recent Notes</p>
                        <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                            {history?.length ? (
                                history.map((entry, idx) => (
                                    <div key={`${entry.date || idx}-${idx}`} className="rounded-xl bg-white/70 dark:bg-white/5 border border-white/20 px-3 py-2 text-xs text-foreground dark:text-white">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-semibold">{entry.date || "Recent"}</span>
                                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                                <Clock4 className="w-3 h-3" />
                                                {entry.score || entry.value || ""}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-[12px] text-muted-foreground">{entry.notes || entry.summary || entry.description || "Check-in recorded"}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-muted-foreground">No recent notes.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mtss-rainbow-shell rounded-3xl p-4 border border-white/40 dark:border-white/10" data-aos="fade-up" data-aos-delay="140">
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={chartSeries}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
                            <XAxis dataKey="date" stroke="rgba(209,213,219,0.85)" tick={{ fill: "rgba(148,163,184,0.85)" }} />
                            <Tooltip
                                cursor={{ stroke: "rgba(99,102,241,0.4)", strokeWidth: 2 }}
                                contentStyle={{
                                    borderRadius: 16,
                                    border: "1px solid rgba(148,163,184,0.3)",
                                    backgroundColor: "rgba(15,23,42,0.9)",
                                    color: "#f8fafc",
                                }}
                            />
                            <Line type="monotone" dataKey="reading" stroke="hsl(var(--primary))" strokeWidth={2.4} dot={false} />
                            <Line type="monotone" dataKey="goal" stroke="hsl(var(--gold))" strokeDasharray="4 4" strokeWidth={1.8} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </div>
    );
});

DashboardOverview.displayName = "DashboardOverview";
export default DashboardOverview;
