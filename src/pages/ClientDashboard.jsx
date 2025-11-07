import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion, useReducedMotion } from "framer-motion";
import { Plus, Clock, MessageSquare, CheckCircle2, Loader2, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedPage from "@/components/AnimatedPage";
import EmptyState from "@/components/feedback/EmptyState";

/* ---------------- data ---------------- */
const quickActions = [
    { title: "Post", icon: Plus, path: "/post-job" },
    { title: "History", icon: Clock, path: "/history" },
    { title: "Chat", icon: MessageSquare, path: "/chat" },
];

const activeJobs = [
    { id: 1, title: "Garden Cleaning", worker: "Budi S.", status: "In Progress", progress: 60 },
    { id: 2, title: "Logo Design", worker: "Citra L.", status: "Review", progress: 100 },
];

/* ---------------- helpers ---------------- */
const cn = (...c) => c.filter(Boolean).join(" ");
const badgeClass = (status) =>
    status === "In Progress"
        ? "bg-primary/15 text-primary ring-1 ring-primary/20"
        : status === "Review"
            ? "bg-accent/15 text-accent ring-1 ring-accent/20"
            : "bg-muted text-muted-foreground ring-1 ring-border/10";

/* ---------------- presentational ---------------- */
const KpiCard = React.memo(function KpiCard({ icon: Icon, label, value }) {
    return (
        <Card className="rounded-2xl border border-border/40 glass-strong hover-card">
            <CardContent className="flex items-center gap-3 p-3">
                <div className="rounded-lg p-2 flex items-center justify-center min-w-[36px] h-10 border border-border/50 bg-background/30">
                    <Icon className="h-4 w-4 text-accent" aria-hidden />
                </div>

                <div className="leading-tight min-w-0">
                    <p className="text-[11px] uppercase text-muted-foreground truncate">{label}</p>
                    <p className="text-lg font-semibold truncate">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
});

const QuickActionCard = React.memo(function QuickActionCard({ action }) {
    const Icon = action.icon;
    return (
        <Link to={action.path} aria-label={action.title} className="group block">
            <Card className="rounded-2xl border border-border/40 glass-strong hover-card">
                <CardContent className="flex min-h-[88px] sm:min-h-[96px] flex-col items-center justify-center gap-2 p-3">
                    <div className="rounded-xl p-2 border border-border/50 bg-background/50 transition-transform group-hover:scale-105 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-accent" aria-hidden />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-center leading-snug line-clamp-2 break-words">{action.title}</p>
                </CardContent>
            </Card>
        </Link>
    );
});

const ActiveJobCard = React.memo(function ActiveJobCard({ job }) {
    return (
        <Link to={`/job/${job.id}/track`} className="group block" aria-label={`View ${job.title}`}>
            <Card className="rounded-2xl border border-border/40 glass-strong hover-card">
                <CardContent className="p-3 sm:p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="truncate text-sm sm:text-base font-semibold text-foreground group-hover:text-accent transition-colors duration-320">
                                {job.title}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Worker: <span className="font-medium text-foreground">{job.worker}</span>
                            </p>
                        </div>

                        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium", badgeClass(job.status))}>{job.status}</span>
                    </div>

                    <div>
                        <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                            <span>Progress</span>
                            <span className="text-xs font-medium text-foreground">{job.progress}%</span>
                        </div>

                        <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={job.progress} aria-valuemin={0} aria-valuemax={100}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${job.progress}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="h-2.5 rounded-full bg-gradient-to-r from-primary to-accent"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
});

/* ---------------- main ---------------- */
export default function ClientDashboard() {
    const reduce = useReducedMotion();

    const kpis = useMemo(
        () => [
            { label: "Active", value: activeJobs.length, icon: Loader2 },
            { label: "Completed", value: 12, icon: CheckCircle2 },
            { label: "Chat", value: 3, icon: MessageSquare },
            { label: "Draft", value: 1, icon: Clock },
        ],
        []
    );

    return (
        <AnimatedPage>
            <Helmet>
                <title>Client Dashboard - MWS IntegraLearn</title>
            </Helmet>

            <div className="relative min-h-screen w-full px-3 py-5 sm:px-6 sm:py-6 text-foreground">
                {/* Header */}
                <motion.header initial={{ opacity: 0, y: reduce ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mb-5">
                    <div className="rounded-3xl border border-border/40 glass-strong shadow-sm p-3 sm:p-5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                                <User className="h-5 w-5" aria-hidden />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-base sm:text-xl font-semibold truncate">Hello, Jilliyan 👋</h1>
                                <p className="text-xs text-muted-foreground truncate">Hope your day is going well</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link to="/post-job">
                                <Button size="sm" className="hidden sm:inline-flex rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition duration-320">
                                    <Plus className="mr-2 h-4 w-4" /> Post
                                </Button>
                            </Link>

                            <Link to="/post-job" aria-label="Posting" className="sm:hidden">
                                <Button size="icon" className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition duration-320">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.header>

                {/* KPI row */}
                <section className="mb-4">
                    <div className="hidden sm:grid grid-cols-4 gap-3">
                        {kpis.map((k) => (
                            <KpiCard key={k.label} icon={k.icon} label={k.label} value={k.value} />
                        ))}
                    </div>

                    <div className="sm:hidden">
                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                            {kpis.map((k) => (
                                <div key={k.label} className="min-w-[140px]">
                                    <KpiCard icon={k.icon} label={k.label} value={k.value} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="mt-2">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-base font-semibold">Quick Actions</h2>
                        <Link to="/history" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                            All <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                        {quickActions.map((a) => (
                            <QuickActionCard key={a.title} action={a} />
                        ))}
                    </div>
                </section>

                {/* Active Jobs */}
                <section className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-base font-semibold">Active Jobs</h2>
                        {activeJobs.length > 0 && <p className="text-xs text-muted-foreground">{activeJobs.length} jobs</p>}
                    </div>

                    {activeJobs.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {activeJobs.map((j) => (
                                <ActiveJobCard key={j.id} job={j} />
                            ))}
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: reduce ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }}>
                            <EmptyState
                                title="No active jobs yet."
                                subtitle="Create a new post to start finding workers."
                                action={
                                    <Link to="/post-job">
                                        <Button size="sm" className="font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition duration-320">
                                            <Plus className="mr-2 h-4 w-4" /> Post Job
                                        </Button>
                                    </Link>
                                }
                            />
                        </motion.div>
                    )}
                </section>

                <div className="h-10" />
            </div>
        </AnimatedPage>
    );
}
