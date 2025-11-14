import React, { memo, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Sparkles, CalendarDays, Target, Timer } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid } from "recharts";
import { TierPill, ProgressBadge } from "./components/StatusPills";
import { findStudentBySlug } from "./data/students";

const StudentProfilePage = memo(() => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const student = useMemo(() => findStudentBySlug(slug), [slug]);

    if (!student) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass glass-card p-6 text-center">
                    <p className="text-lg font-semibold text-destructive">Student not found</p>
                    <button className="mt-4 px-4 py-2 rounded-full bg-primary text-white" onClick={() => navigate("/mtss?tab=students")}>
                        Back to Students
                    </button>
                </div>
            </div>
        );
    }

    const { profile } = student;
    const chartData = profile?.chart || [];
    const history = profile?.history || [];
    const measurementUnit = student.type === "Behavior" ? "pts" : student.type === "Attendance" ? "%" : "wpm";
    const statusPercent = profile?.target ? Math.round((profile.current / profile.target) * 100) : 0;
    const quickFacts = [
        { label: "Focus Area", value: profile?.type || "—", icon: Target, accent: "text-primary" },
        { label: "Started", value: profile?.started || "—", icon: CalendarDays, accent: "text-pink-500 dark:text-pink-300" },
        { label: "Duration", value: profile?.duration || "—", icon: Timer, accent: "text-emerald" },
    ];

    return (
        <div className="mtss-theme mtss-animated-bg min-h-screen relative overflow-hidden text-foreground dark:text-white">
            <div className="mtss-bg-overlay" />
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-32 -left-20 w-64 h-64 bg-primary/15 blur-[160px]" />
                <div className="absolute top-10 right-10 w-52 h-52 bg-emerald/20 blur-[120px]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70vw] h-48 bg-gold/10 blur-[120px]" />
            </div>

            <div className="relative z-20 container-tight py-10 space-y-6">
                <button
                    onClick={() => (window.history.length > 2 ? navigate(-1) : navigate("/mtss/teacher?tab=students"))}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-white/10 text-sm font-semibold shadow"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Students
                </button>

                <motion.section
                    className="glass glass-card rounded-[32px] overflow-hidden shadow-[0_30px_80px_rgba(15,23,42,0.15)]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="bg-gradient-to-r from-[#f472b6]/60 via-[#a855f7]/60 to-[#6366f1]/60 text-white p-6 flex flex-wrap gap-4 items-start justify-between">
                        <div>
                            <p className="uppercase text-xs tracking-[0.4em] opacity-80 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Student Profile
                            </p>
                            <h1 className="text-3xl font-extrabold drop-shadow">{student.name}</h1>
                            <div className="flex items-center gap-2 text-sm opacity-90 mt-2">
                                Grade {student.grade}
                                <span className="w-1 h-1 rounded-full bg-white/80" />
                                Current Tier <TierPill tier={student.tier} />
                            </div>
                        </div>
                        <ProgressBadge status={student.progress} />
                    </div>

                    <div className="px-6 pb-0">
                        <div className="grid md:grid-cols-3 gap-3">
                            {quickFacts.map(({ label, value, icon: FactIcon, accent }) => (
                                <div key={label} className="rounded-2xl bg-white/90 dark:bg-slate-900/70 px-4 py-3 shadow-inner space-y-1 mtss-card-surface">
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                        <FactIcon className={`w-4 h-4 ${accent}`} />
                                        {label}
                                    </div>
                                    <p className="text-base font-semibold text-foreground dark:text-white">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/70 border border-white/40 dark:border-white/10 shadow-inner mtss-card-surface">
                                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Student Information</p>
                                <ul className="mt-3 text-sm space-y-2 text-foreground">
                                    <li>Grade: <strong>{student.grade}</strong></li>
                                    <li>Teacher: <strong>{profile.teacher}</strong></li>
                                    <li>Mentor: <strong>{profile.mentor}</strong></li>
                                    <li className="flex items-center gap-2">Current Tier: <TierPill tier={student.tier} /></li>
                                </ul>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/70 border border-white/40 dark:border-white/10 shadow-inner mtss-card-surface">
                                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Intervention Details</p>
                                <div className="mt-3 text-sm space-y-1 text-foreground">
                                    <p><strong>Type:</strong> {profile.type}</p>
                                    <p><strong>Strategy:</strong> {profile.strategy}</p>
                                    <p><strong>Started:</strong> {profile.started}</p>
                                    <p><strong>Duration:</strong> {profile.duration}</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/70 border border-white/40 dark:border-white/10 shadow-inner mtss-card-surface">
                                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Progress Summary</p>
                                <div className="mt-3 text-sm space-y-2">
                                    <p>Baseline: <strong>{profile.baseline} {measurementUnit}</strong></p>
                                    <p>Current: <strong>{profile.current} {measurementUnit}</strong></p>
                                    <p>Target: <strong>{profile.target} {measurementUnit}</strong></p>
                                    <p>Status: <strong>{statusPercent}% to target</strong></p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/50 p-4 bg-gradient-to-br from-white/80 to-transparent shadow-lg">
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
                                    <XAxis dataKey="label" stroke="rgba(100,116,139,0.9)" />
                                    <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid rgba(148,163,184,0.3)" }} />
                                    <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={3} dot={{ r: 5 }} />
                                    <Line type="monotone" dataKey="goal" stroke="#fbbf24" strokeDasharray="5 4" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="rounded-2xl border border-white/40 dark:border-white/10 p-4 bg-white/95 dark:bg-slate-900/70 shadow-inner mtss-card-surface">
                            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-3">Progress History</p>
                            <div className="space-y-3">
                                {history.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ scale: 1.01 }}
                                        className="rounded-2xl border border-white/40 dark:border-white/10 p-3 flex flex-wrap items-center gap-3 bg-white/95 dark:bg-slate-900/70 mtss-card-surface"
                                    >
                                        <div className="text-sm font-semibold w-28">{item.date}</div>
                                        <div className="text-sm flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-primary" />
                                            Score: {item.score} {measurementUnit}
                                        </div>
                                        <ProgressBadge status={student.progress} />
                                        <p className="text-sm text-muted-foreground flex-1">{item.notes}</p>
                                    </motion.div>
                                ))}
                                {!history.length && <p className="text-sm text-muted-foreground">No history recorded yet.</p>}
                            </div>
                        </div>
                    </div>
                </motion.section>
            </div>
        </div>
    );
});

StudentProfilePage.displayName = "StudentProfilePage";
export default StudentProfilePage;
