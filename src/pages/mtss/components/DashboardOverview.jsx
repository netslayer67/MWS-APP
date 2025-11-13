import React, { memo } from "react";
import { motion } from "framer-motion";
import { Activity, Clock8 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid } from "recharts";
import StudentsTable from "./StudentsTable";

const DashboardOverview = memo(({ statCards, students, progressData, TierPill, ProgressBadge }) => {
    const spotlightStudent = students?.[0];
    const spotlightProfile = spotlightStudent?.profile || {};
    const progressUnit =
        spotlightStudent?.type === "Behavior" ? "pts" : spotlightStudent?.type === "Attendance" ? "%" : "wpm";
    const spotlightStatus = spotlightProfile.target
        ? Math.round((spotlightProfile.current / spotlightProfile.target) * 100)
        : 0;
    const totalWeeks = parseInt(spotlightProfile.duration, 10);
    const currentWeek = progressData?.length || null;
    const weekLabel =
        totalWeeks && currentWeek ? `Week ${Math.min(currentWeek, totalWeeks)} of ${totalWeeks}` : spotlightProfile.duration;

    return (
        <div className="space-y-8">
            <section className="grid md:grid-cols-3 gap-6">
                {statCards.map((card, idx) => (
                    <motion.div
                        key={card.label}
                        className="relative rounded-3xl p-[1px] bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-white/20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <div className={`rounded-3xl p-6 h-full bg-gradient-to-br ${card.accent} text-white shadow-[0_20px_40px_rgba(0,0,0,0.15)]`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="uppercase text-xs tracking-[0.3em] text-white/80">{card.label}</p>
                                    <p className="text-4xl font-extrabold mt-2">{card.value}</p>
                                    <p className="text-sm text-white/80 mt-1">{card.sub}</p>
                                </div>
                                <card.icon className="w-12 h-12 opacity-70" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </section>

            <section className="glass glass-card p-6 md:p-8 space-y-6">
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p className="uppercase text-xs text-muted-foreground tracking-[0.4em]">My Students</p>
                        <h2 className="text-2xl font-bold text-foreground dark:text-white">Recent Updates</h2>
                    </div>
                    <motion.button
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white shadow-glass-md hover:shadow-glass-lg transition-all text-sm font-semibold"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Quick Add
                    </motion.button>
                </header>
                <StudentsTable students={students} TierPill={TierPill} ProgressBadge={ProgressBadge} dense />
            </section>

            <section className="glass glass-card p-6 space-y-6">
                <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="uppercase text-xs tracking-[0.4em] text-muted-foreground">Student Spotlight</p>
                        <h2 className="text-2xl font-bold text-foreground dark:text-white">
                            {spotlightStudent?.name || "Featured Student"}
                        </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/40 text-primary text-sm font-semibold">
                            <Clock8 className="w-4 h-4" />
                            {weekLabel || "Weekly check-in"}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald/10 border border-emerald/40 text-emerald text-sm font-semibold">
                            <Activity className="w-4 h-4" />
                            {spotlightStatus || 0}% to target
                        </div>
                    </div>
                </header>

                <div className="grid md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-border/40 p-4 bg-surface/80">
                        <p className="text-xs text-muted-foreground uppercase tracking-[0.4em]">Student Information</p>
                        <ul className="mt-3 space-y-2 text-sm text-foreground">
                            <li><strong>Grade:</strong> {spotlightStudent?.grade ?? "—"}</li>
                            <li><strong>Teacher:</strong> {spotlightProfile.teacher ?? "—"}</li>
                            <li><strong>Mentor:</strong> {spotlightProfile.mentor ?? "—"}</li>
                            <li className="flex items-center gap-2">
                                <strong>Current Tier:</strong>
                                {spotlightStudent?.tier ? <TierPill tier={spotlightStudent.tier} /> : "—"}
                            </li>
                        </ul>
                    </div>
                    <div className="rounded-2xl border border-border/40 p-4 bg-surface/80">
                        <p className="text-xs text-muted-foreground uppercase tracking-[0.4em]">Intervention Details</p>
                        <ul className="mt-3 space-y-2 text-sm text-foreground">
                            <li><strong>Type:</strong> {spotlightProfile.type ?? "—"}</li>
                            <li><strong>Strategy:</strong> {spotlightProfile.strategy ?? "—"}</li>
                            <li><strong>Started:</strong> {spotlightProfile.started ?? "—"}</li>
                            <li><strong>Duration:</strong> {spotlightProfile.duration ?? "—"}</li>
                        </ul>
                    </div>
                    <div className="rounded-2xl border border-border/40 p-4 bg-surface/80">
                        <p className="text-xs text-muted-foreground uppercase tracking-[0.4em]">Progress Summary</p>
                        <ul className="mt-3 space-y-2 text-sm text-foreground">
                            <li><strong>Baseline:</strong> {spotlightProfile.baseline ?? "—"} {progressUnit}</li>
                            <li><strong>Current:</strong> {spotlightProfile.current ?? "—"} {progressUnit}</li>
                            <li><strong>Target:</strong> {spotlightProfile.target ?? "—"} {progressUnit}</li>
                            <li><strong>Status:</strong> {spotlightStatus}% to target</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-surface rounded-3xl p-4 border border-border/40">
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={progressData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
                            <XAxis dataKey="date" stroke="rgba(100,116,139,0.9)" />
                            <Tooltip
                                cursor={{ stroke: "rgba(99,102,241,0.4)", strokeWidth: 2 }}
                                contentStyle={{ borderRadius: 16, border: "1px solid rgba(148,163,184,0.3)" }}
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
