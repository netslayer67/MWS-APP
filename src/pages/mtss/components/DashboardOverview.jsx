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
        <div className="space-y-8 mtss-theme">
            <section className="grid md:grid-cols-3 gap-6">
                {statCards.map((card, idx) => (
                    <motion.div
                        key={card.label}
                        className="relative rounded-3xl p-[1px] bg-gradient-to-br from-white/60 via-transparent to-transparent dark:from-white/20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -8, scale: 1.01 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <div className={`relative rounded-3xl p-6 h-full bg-gradient-to-br ${card.accent} text-slate-900 dark:text-white shadow-[0_20px_40px_rgba(0,0,0,0.12)]`}>
                            <div className="absolute inset-0 bg-white/35 dark:bg-transparent" />
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="uppercase text-xs tracking-[0.3em] text-slate-700 dark:text-white/80">{card.label}</p>
                                    <p className="text-4xl font-extrabold mt-2 drop-shadow-[0_1px_4px_rgba(255,255,255,0.5)] dark:drop-shadow-none">{card.value}</p>
                                    <p className="text-sm text-slate-700/90 dark:text-white/80 mt-1">{card.sub}</p>
                                </div>
                                <card.icon className="w-12 h-12 text-white/80" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </section>

            <section className="glass glass-card mtss-card-surface p-6 md:p-8 space-y-6 border border-primary/10">
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p className="uppercase text-xs text-muted-foreground tracking-[0.4em]">Fresh Updates</p>
                        <h2 className="text-2xl font-bold text-foreground dark:text-white">Kids on your radar today</h2>
                    </div>
                    <motion.button
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#ff58c2] to-[#ffb347] text-white shadow-[0_12px_30px_rgba(255,88,194,0.25)] transition-all text-sm font-semibold"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                    >
                        Quick Add
                    </motion.button>
                </header>
                <StudentsTable students={students} TierPill={TierPill} ProgressBadge={ProgressBadge} dense />
            </section>

            <section className="mtss-liquid mtss-card-surface p-6 space-y-6 border border-primary/10 bg-white/95 dark:bg-slate-900/80">
                <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="uppercase text-xs tracking-[0.4em] text-muted-foreground">Student Spotlight</p>
                        <h2 className="text-2xl font-bold text-foreground dark:text-white">
                            {spotlightStudent?.name || "Featured Student"}
                        </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/85 dark:bg-primary/20 border border-primary/30 text-primary text-sm font-semibold">
                            <Clock8 className="w-4 h-4" />
                            {weekLabel || "Weekly check-in"}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/85 dark:bg-emerald/20 border border-emerald/30 text-emerald text-sm font-semibold">
                            <Activity className="w-4 h-4" />
                            {spotlightStatus || 0}% to target
                        </div>
                    </div>
                </header>

                <div className="grid md:grid-cols-3 gap-4">
                    <div className="mtss-card-surface rounded-2xl border border-border/40 p-4 bg-white/95 dark:bg-slate-900/80">
                        <p className="text-xs text-muted-foreground uppercase tracking-[0.4em]">Student Info</p>
                        <ul className="mt-3 space-y-2 text-sm text-foreground dark:text-white">
                            <li><strong>Grade:</strong> {spotlightStudent?.grade ?? "—"}</li>
                            <li><strong>Teacher:</strong> {spotlightProfile.teacher ?? "—"}</li>
                            <li><strong>Mentor:</strong> {spotlightProfile.mentor ?? "—"}</li>
                            <li className="flex items-center gap-2">
                                <strong>Current Tier:</strong>
                                {spotlightStudent?.tier ? <TierPill tier={spotlightStudent.tier} /> : "—"}
                            </li>
                        </ul>
                    </div>
                    <div className="mtss-card-surface rounded-2xl border border-border/40 p-4 bg-white/95 dark:bg-slate-900/80">
                        <p className="text-xs text-muted-foreground uppercase tracking-[0.4em]">Intervention</p>
                        <ul className="mt-3 space-y-2 text-sm text-foreground dark:text-white">
                            <li><strong>Type:</strong> {spotlightProfile.type ?? "—"}</li>
                            <li><strong>Strategy:</strong> {spotlightProfile.strategy ?? "—"}</li>
                            <li><strong>Started:</strong> {spotlightProfile.started ?? "—"}</li>
                            <li><strong>Duration:</strong> {spotlightProfile.duration ?? "—"}</li>
                        </ul>
                    </div>
                    <div className="mtss-card-surface rounded-2xl border border-border/40 p-4 bg-white/95 dark:bg-slate-900/80">
                        <p className="text-xs text-muted-foreground uppercase tracking-[0.4em]">Progress</p>
                        <ul className="mt-3 space-y-2 text-sm text-foreground dark:text-white">
                            <li><strong>Baseline:</strong> {spotlightProfile.baseline ?? "—"} {progressUnit}</li>
                            <li><strong>Current:</strong> {spotlightProfile.current ?? "—"} {progressUnit}</li>
                            <li><strong>Target:</strong> {spotlightProfile.target ?? "—"} {progressUnit}</li>
                            <li><strong>Status:</strong> {spotlightStatus}% to target</li>
                        </ul>
                    </div>
                </div>

                <div className="mtss-card-surface bg-white/95 dark:bg-slate-900/80 rounded-3xl p-4 border border-border/40">
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={progressData}>
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
