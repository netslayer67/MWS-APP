import React, { memo, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Sparkles, CalendarDays, Target, Timer } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid } from "recharts";
import { TierPill, ProgressBadge } from "./components/StatusPills";
import { fetchMentorAssignments, fetchMtssStudentById } from "@/services/mtssService";
import { getStoredUser, mapAssignmentsToStudents } from "./utils/teacherDashboardUtils";

const StudentProfilePage = memo(() => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const mentor = useMemo(() => getStoredUser(), []);

    useEffect(() => {
        let mounted = true;
        const controller = new AbortController();
        const loadStudent = async () => {
            setLoading(true);
            setError(null);
            try {
                const { assignments = [] } = await fetchMentorAssignments({}, { signal: controller.signal });
                if (!mounted) return;
                const { students: normalized } = mapAssignmentsToStudents(assignments, mentor?.username || mentor?.name || "MTSS Mentor");
                const assigned = normalized.find((item) => item.slug === slug);
                if (assigned) {
                    setStudent(assigned);
                    return;
                }
                const fallback = await fetchMtssStudentById(slug, { signal: controller.signal });
                if (!mounted) return;
                setStudent(fallback?.student || null);
            } catch (err) {
                if (!mounted || err?.name === "CanceledError" || err?.name === "AbortError") return;
                setError(err.response?.data?.message || err.message || "Unable to load student profile");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        loadStudent();
        return () => {
            mounted = false;
            controller.abort();
        };
    }, [slug, mentor]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading student profile…</div>;
    }

    if (error || !student) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass glass-card p-6 text-center space-y-4">
                    <p className="text-lg font-semibold text-destructive">{error || "Student not found"}</p>
                    <button className="px-4 py-2 rounded-full bg-primary text-white" onClick={() => navigate("/mtss?tab=students")}>
                        Back to Students
                    </button>
                </div>
            </div>
        );
    }

    const { profile } = student;
    const chartData = profile?.chart?.length ? profile.chart : [{ label: "Start", date: "Start", value: 0, reading: 0, goal: 100 }];
    const history = profile?.history || [];
    const measurementUnit = profile?.progressUnit || (student.type === "Behavior" ? "pts" : student.type === "Attendance" ? "%" : "wpm");
    const statusPercent = profile?.target ? Math.round((profile.current / profile.target) * 100) : 0;
    const quickFacts = [
        { label: "Focus", value: profile?.type || "-", icon: Target, accent: "text-primary" },
        { label: "Started", value: profile?.started || "-", icon: CalendarDays, accent: "text-rose-500 dark:text-rose-300" },
        { label: "Duration", value: profile?.duration || "-", icon: Timer, accent: "text-emerald-500" },
        { label: "Mentor", value: profile?.mentor || student.profile?.teacher || "TBD", icon: BookOpen, accent: "text-sky-500" },
    ];
    const focusChips = [
        { label: "Tier", value: student.tier || "Tier 2", gradient: "from-[#14b8a6] via-[#3b82f6] to-[#a855f7]" },
        { label: "Progress", value: student.progress || "On Track", gradient: "from-[#f97316] via-[#ef4444] to-[#ec4899]" },
        { label: "Next Update", value: student.nextUpdate || "Not scheduled", gradient: "from-[#34d399] via-[#10b981] to-[#22d3ee]" },
    ];

    return (
        <div className="mtss-theme mtss-animated-bg min-h-screen relative overflow-hidden text-foreground dark:text-white">
            <div className="mtss-bg-overlay" />
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-24 left-6 w-64 h-64 bg-gradient-to-br from-primary/40 to-rose/30 blur-3xl" />
                <div className="absolute top-16 right-6 w-72 h-72 bg-gradient-to-br from-sky-200/40 to-emerald-200/30 blur-[130px]" />
                <div className="absolute bottom-0 -right-24 w-80 h-80 bg-gradient-to-br from-amber-200/30 to-fuchsia-200/30 blur-[150px]" />
            </div>
            <div className="relative z-20 container-tight py-10 space-y-6">
                <button
                    onClick={() => (window.history.length > 2 ? navigate(-1) : navigate("/mtss/teacher?tab=students"))}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 dark:bg-white/10 text-sm font-semibold shadow"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Students
                </button>
                <motion.section className="glass glass-card rounded-[32px] overflow-hidden shadow-[0_35px_90px_rgba(15,23,42,0.2)]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-gradient-to-r from-[#f472b6] via-[#a855f7] to-[#6366f1] text-white px-6 py-7 flex flex-wrap gap-6 items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.45em] opacity-80">Student Spotlight</p>
                            <h1 className="text-3xl font-black tracking-tight">{student.name}</h1>
                            <p className="text-sm opacity-90">{student.grade} · {student.type}</p>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center">
                            {focusChips.map((chip) => (
                                <span key={chip.label} className={`px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${chip.gradient} text-white shadow-lg`}>
                                    {chip.value}
                                </span>
                            ))}
                            <ProgressBadge status={student.progress} />
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {quickFacts.map((fact) => {
                                const Icon = fact.icon;
                                return (
                                    <div
                                        key={fact.label}
                                        className="rounded-2xl glass glass-card bg-gradient-to-br from-white/90 via-white/80 to-white/60 dark:from-white/5 dark:via-white/10 dark:to-white/5 border border-white/40 dark:border-white/10 px-4 py-3 flex items-center gap-3 shadow-sm min-h-[90px]"
                                    >
                                        <div className="w-10 h-10 rounded-2xl bg-white/70 dark:bg-white/10 flex items-center justify-center shadow-inner">
                                            <Icon className={`w-5 h-5 ${fact.accent}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] uppercase tracking-[0.45em] text-muted-foreground">{fact.label}</p>
                                            <p className="text-lg font-semibold text-foreground dark:text-white truncate">{fact.value}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                            <div className="rounded-[30px] bg-white/85 dark:bg-white/5 border border-primary/10 p-6 space-y-4 shadow-inner backdrop-blur-xl">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Growth Journey</p>
                                        <h3 className="text-xl font-black text-foreground dark:text-white">{profile.strategy}</h3>
                                    </div>
                                    <span className="text-4xl font-black bg-gradient-to-r from-primary to-rose text-transparent bg-clip-text">{statusPercent}%</span>
                                </div>
                                <div className="h-60">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                                            <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
                                            <Tooltip contentStyle={{ borderRadius: 12, borderColor: "rgba(148,163,184,0.3)" }} />
                                            <Line type="monotone" dataKey="reading" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} />
                                            <Line type="monotone" dataKey="goal" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="8 4" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-3 text-sm">
                                    {[
                                        { label: "Baseline", value: profile.baseline ?? "-", tint: "from-[#fdf2f8]/90 to-[#f5d0fe]/70", text: "text-pink-900" },
                                        { label: "Current", value: profile.current ?? "-", tint: "from-[#ecfccb]/90 to-[#bbf7d0]/70", text: "text-emerald-900" },
                                        { label: "Target", value: profile.target ?? "-", tint: "from-[#fef9c3]/90 to-[#fde68a]/70", text: "text-amber-900" },
                                    ].map((stat) => (
                                        <div key={stat.label} className={`rounded-2xl bg-gradient-to-r ${stat.tint} ${stat.text} dark:text-white p-3`}>
                                            <p className="text-[11px] uppercase tracking-[0.4em]">{stat.label}</p>
                                            <p className="text-2xl font-black">{stat.value} {measurementUnit}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="rounded-3xl bg-gradient-to-r from-[#e0f2fe]/70 to-[#fef9c3]/70 dark:from-white/5 dark:to-white/5 border border-white/40 dark:border-white/5 p-4 flex flex-wrap gap-4">
                                    <div className="min-w-[140px]">
                                        <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">Next Step</p>
                                        <p className="font-semibold text-foreground dark:text-white">{profile?.nextUpdate || student.nextUpdate || "Schedule reflection"}</p>
                                    </div>
                                    <div className="min-w-[140px]">
                                        <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">Focus Strategy</p>
                                        <p className="font-semibold text-foreground dark:text-white break-words">{profile?.strategy || "Awaiting plan"}</p>
                                    </div>
                                    <div className="min-w-[140px]">
                                        <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">Mentor</p>
                                        <p className="font-semibold text-foreground dark:text-white">{profile?.mentor || student.profile?.teacher || "Unassigned"}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-[30px] bg-gradient-to-br from-white/90 to-white/70 dark:from-white/10 dark:to-white/5 border border-white/50 dark:border-white/10 p-6 space-y-4 shadow backdrop-blur-xl">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Mentor Pulse</p>
                                        <h3 className="text-lg font-bold text-foreground dark:text-white">Recent reflections</h3>
                                    </div>
                                </div>
                                <div className="space-y-3 text-sm max-h-72 overflow-y-auto pr-2 custom-scroll">
                                    {history.length ? history.map((entry, index) => (
                                        <div key={`${entry.date}-${index}`} className="rounded-2xl bg-white/70 dark:bg-white/5 border border-white/40 dark:border-white/5 px-4 py-3 shadow-sm">
                                            <div className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">{entry.date}</div>
                                            <p className="text-foreground dark:text-white">{entry.notes}</p>
                                        </div>
                                    )) : <p className="text-muted-foreground text-sm">No check-in notes yet.</p>}
                                </div>
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
