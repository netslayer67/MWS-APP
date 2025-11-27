import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, Clock8 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid } from "recharts";
import StudentsTable from "./StudentsTable";
import TeacherStatCards from "../teacher/TeacherStatCards";

const DashboardOverview = memo(({ statCards, students, progressData, TierPill, ProgressBadge }) => {
    const { spotlightStudent, spotlightProfile, progressUnit, spotlightStatus, weekLabel, chartSeries } = useMemo(() => {
        const student = students?.[0] ?? null;
        const profile = student?.profile || {};
        const unit = profile.progressUnit || (student?.type === "Behavior" ? "pts" : student?.type === "Attendance" ? "%" : "wpm");
        const status = profile.target ? Math.round((profile.current / profile.target) * 100) : 0;
        const totalWeeks = parseInt(profile.duration, 10);
        const series = progressData?.length ? progressData : [{ label: "Start", date: "Start", reading: 0, goal: 100 }];
        const currentWeek = series.length;
        const label =
            totalWeeks && currentWeek
                ? `Week ${Math.min(currentWeek, totalWeeks)} of ${totalWeeks}`
                : profile.duration;
        return {
            spotlightStudent: student,
            spotlightProfile: profile,
            progressUnit: unit,
            spotlightStatus: status,
            weekLabel: label,
            chartSeries: series,
        };
    }, [students, progressData]);

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
                <StudentsTable students={students} TierPill={TierPill} ProgressBadge={ProgressBadge} dense />
            </section>

            <section className="mtss-liquid mtss-card-surface mtss-rainbow-shell p-6 space-y-6 border border-primary/10">
                <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="uppercase text-xs tracking-[0.4em] text-muted-foreground">Student Spotlight</p>
                        <h2 className="text-2xl font-bold text-foreground dark:text-white">
                            {spotlightStudent?.name || "Featured Student"}
                        </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="mtss-rainbow-chip mtss-rainbow-chip--soft text-xs font-semibold uppercase tracking-[0.3em]">
                            <Clock8 className="w-4 h-4" />
                            {weekLabel || "Weekly check-in"}
                        </div>
                        <div className="mtss-rainbow-chip mtss-rainbow-chip--emerald text-xs font-semibold uppercase tracking-[0.3em]">
                            <Activity className="w-4 h-4" />
                            {spotlightStatus || 0}% to target
                        </div>
                    </div>
                </header>

                <div className="grid md:grid-cols-3 gap-4">
                    <div className="mtss-rainbow-shell rounded-2xl border border-white/40 dark:border-white/10 p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-[0.4em]">Student Info</p>
                        <ul className="mt-3 space-y-2 text-sm text-foreground dark:text-white">
                            <li><strong>Grade:</strong> {spotlightStudent?.grade ?? "-"}</li>
                            <li><strong>Teacher:</strong> {spotlightProfile.teacher ?? "-"}</li>
                            <li><strong>Mentor:</strong> {spotlightProfile.mentor ?? "-"}</li>
                            <li className="flex items-center gap-2">
                                <strong>Current Tier:</strong>
                                {spotlightStudent?.tier ? <TierPill tier={spotlightStudent.tier} /> : "-"}
                            </li>
                        </ul>
                    </div>
                    <div className="mtss-rainbow-shell rounded-2xl border border-white/40 dark:border-white/10 p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-[0.4em]">Intervention</p>
                        <ul className="mt-3 space-y-2 text-sm text-foreground dark:text-white">
                            <li><strong>Type:</strong> {spotlightProfile.type ?? "-"}</li>
                            <li><strong>Strategy:</strong> {spotlightProfile.strategy ?? "-"}</li>
                            <li><strong>Started:</strong> {spotlightProfile.started ?? "-"}</li>
                            <li><strong>Duration:</strong> {spotlightProfile.duration ?? "-"}</li>
                        </ul>
                    </div>
                    <div className="mtss-rainbow-shell rounded-2xl border border-white/40 dark:border-white/10 p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-[0.4em]">Progress</p>
                        <ul className="mt-3 space-y-2 text-sm text-foreground dark:text-white">
                            <li><strong>Baseline:</strong> {spotlightProfile.baseline ?? "-"} {progressUnit}</li>
                            <li><strong>Current:</strong> {spotlightProfile.current ?? "-"} {progressUnit}</li>
                            <li><strong>Target:</strong> {spotlightProfile.target ?? "-"} {progressUnit}</li>
                            <li><strong>Status:</strong> {spotlightStatus}% to target</li>
                        </ul>
                    </div>
                </div>

                <div className="mtss-rainbow-shell rounded-3xl p-4 border border-white/40 dark:border-white/10">
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
                            <Line type="monotone" dataKey="reading" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 5 }} />
                            <Line type="monotone" dataKey="goal" stroke="hsl(var(--gold))" strokeDasharray="4 4" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </div>
    );
});

DashboardOverview.displayName = "DashboardOverview";
export default DashboardOverview;
