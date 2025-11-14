import React, { memo, useMemo, useState, Suspense, lazy, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
    ClipboardCheck,
    GraduationCap,
    LineChart as LineChartIcon,
    PlusCircle,
    ShieldCheck,
    Sparkles,
    Users2,
    Star,
    FileCheck2,
    ArrowRight,
    Target,
    Building2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TierPill, ProgressBadge } from "./components/StatusPills";
import { mtssStudents } from "./data/students";

const DashboardOverview = lazy(() => import("./components/DashboardOverview"));
const StudentsPanel = lazy(() => import("./components/StudentsPanel"));
const InterventionFormPanel = lazy(() => import("./components/InterventionFormPanel"));
const ProgressFormPanel = lazy(() => import("./components/ProgressFormPanel"));

const statCards = [
    {
        label: "Active Interventions",
        sub: "Kids in a boost bubble",
        value: 12,
        icon: ShieldCheck,
        accent: "from-primary/70 via-[#F472B6]/90 to-primary/60",
    },
    {
        label: "Updates Due",
        sub: "Check-ins waiting today",
        value: 5,
        icon: ClipboardCheck,
        accent: "from-[#FBBF24]/80 via-gold/70 to-[#F97316]/70",
    },
    {
        label: "Success Rate",
        sub: "Kids hitting targets",
        value: "78%",
        icon: Star,
        accent: "from-emerald/70 via-[#34d399]/70 to-emerald/60",
    },
];

const progressData = [
    { date: "Oct 1", reading: 45, goal: 70 },
    { date: "Oct 8", reading: 55, goal: 70 },
    { date: "Oct 15", reading: 65, goal: 75 },
    { date: "Oct 22", reading: 72, goal: 80 },
    { date: "Oct 29", reading: 79, goal: 85 },
];

const students = mtssStudents;

const tabs = [
    { key: "dashboard", label: "Dashboard", icon: LineChartIcon },
    { key: "students", label: "My Students", icon: Users2 },
    { key: "create", label: "Create Intervention", icon: PlusCircle },
    { key: "submit", label: "Submit Progress", icon: FileCheck2 },
];

const PanelFallback = () => (
    <div className="glass glass-card p-8 text-center text-muted-foreground animate-pulse">
        Loading panel...
    </div>
);

const TeacherDashboardPage = memo(() => {
    const { toast } = useToast();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [interventionForm, setInterventionForm] = useState({
        studentName: "",
        grade: "",
        type: "",
        tier: "Tier 2",
        goal: "",
        strategy: "",
        startDate: "",
        duration: "",
        monitorFrequency: "",
        monitorMethod: "",
        baseline: "",
        target: "",
    });
    const [progressForm, setProgressForm] = useState({
        studentName: "",
        date: "",
        performed: "yes",
        score: "",
        notes: "",
    });

    const heroBadge = useMemo(
        () => ({
            teacher: "Sarah Johnson",
            school: "Sunrise Elementary",
            tierFocus: "Tier 2 Literacy",
        }),
        [],
    );

    const baseFieldClass = "px-4 py-3 rounded-2xl bg-white/80 dark:bg-white/10 border border-primary/20 text-sm text-foreground dark:text-white placeholder:text-muted-foreground/70 dark:placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all";
    const textareaClass = `${baseFieldClass} min-h-[80px]`;
    const notesTextareaClass = `${baseFieldClass} min-h-[120px]`;

    const handleInterventionChange = (field, value) => {
        setInterventionForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleProgressChange = (field, value) => {
        setProgressForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSavePlan = (event) => {
        event.preventDefault();
        toast({
            title: "Intervention saved",
            description: "Student plan locked in—keep tracking their joyful progress.",
        });
    };

    const handleSubmitProgress = (event) => {
        event.preventDefault();
        toast({
            title: "Progress submitted",
            description: "Your monitoring update is live on the MTSS dashboard.",
        });
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const requestedTab = params.get("tab");
        if (requestedTab && tabs.some((tab) => tab.key === requestedTab)) {
            setActiveTab(requestedTab);
        }
    }, [location.search]);

    const renderPanel = () => {
        switch (activeTab) {
            case "dashboard":
                return (
                    <DashboardOverview
                        statCards={statCards}
                        students={students}
                        progressData={progressData}
                        TierPill={TierPill}
                        ProgressBadge={ProgressBadge}
                    />
                );
            case "students":
                return <StudentsPanel students={students} TierPill={TierPill} ProgressBadge={ProgressBadge} />;
            case "create":
                return (
                    <InterventionFormPanel
                        formState={interventionForm}
                        onChange={handleInterventionChange}
                        onSubmit={handleSavePlan}
                        baseFieldClass={baseFieldClass}
                        textareaClass={textareaClass}
                    />
                );
            case "submit":
                return (
                    <ProgressFormPanel
                        formState={progressForm}
                        onChange={handleProgressChange}
                        onSubmit={handleSubmitProgress}
                        baseFieldClass={baseFieldClass}
                        textareaClass={notesTextareaClass}
                        students={students}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="mtss-theme mtss-animated-bg min-h-screen relative overflow-hidden text-foreground dark:text-white transition-colors">
            <div className="mtss-bg-overlay" />
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/70 to-transparent dark:from-white/10" />
                <div className="absolute -bottom-24 left-12 w-[28rem] h-[28rem] bg-primary/30 dark:bg-primary/25 blur-[200px]" />
            </div>

            <div className="relative z-20 container-tight py-10 lg:py-14 space-y-10">
                <motion.section
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mtss-gradient-border overflow-hidden"
                >
                    <div className="glass glass-strong overflow-hidden mtss-liquid relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,192,203,0.35),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.25),transparent_60%)] opacity-90 dark:opacity-0 pointer-events-none" />
                        <div className="glass__noise" />
                        <div className="relative bg-gradient-to-r from-primary/15 via-[#F472B6]/20 to-gold/20 dark:from-primary/40 dark:via-[#F472B6]/30 dark:to-gold/25 p-6 md:p-10 text-foreground dark:text-white">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                <div>
                                    <p className="uppercase text-xs font-semibold tracking-[0.3em] text-muted-foreground dark:text-white/70 mb-2 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-gold" />
                                        MTSS Studio
                                </p>
                                <h1 className="text-3xl md:text-4xl font-black drop-shadow-lg">Hey {heroBadge.teacher}, let's light up today's boosts.</h1>
                                <p className="text-muted-foreground dark:text-white/85 mt-3 leading-relaxed text-base">
                                    Quick wins, bright notes, and speedy nudges&mdash;all in one playful dashboard.
                                </p>
                            </div>
                            <div className="grid gap-3 whitespace-nowrap text-sm font-semibold">
                                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/40 dark:bg-white/10 text-rose-500 dark:text-rose-200 shadow-sm">
                                    <Building2 className="w-4 h-4" />
                                    {heroBadge.school}
                                </span>
                                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/40 dark:bg-white/10 text-primary shadow-sm">
                                    <GraduationCap className="w-4 h-4" />
                                    {heroBadge.teacher}
                                </span>
                                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/40 dark:bg-white/10 text-emerald shadow-sm">
                                    <Target className="w-4 h-4" />
                                    {heroBadge.tierFocus}
                                </span>
                            </div>
                            </div>

                            <div className="mt-8 grid md:grid-cols-4 gap-3 items-center">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const active = activeTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${active ? "bg-gradient-to-r from-[#ff58c2]/90 to-[#ffb347]/90 text-white shadow-[0_15px_40px_rgba(255,88,194,0.25)]" : "bg-white/40 text-muted-foreground hover:bg-white/60 dark:bg-white/10 dark:text-white/70"}`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <Icon className="w-4 h-4" />
                                            {tab.label}
                                        </span>
                                        <ArrowRight className={`w-4 h-4 transition-transform ${active ? "translate-x-1" : ""}`} />
                                    </button>
                                );
                            })}
                            </div>
                        </div>
                    </div>
                </motion.section>

                <Suspense fallback={<PanelFallback />}>
                    {renderPanel()}
                </Suspense>
            </div>
        </div>
    );
});

TeacherDashboardPage.displayName = "TeacherDashboardPage";
export default TeacherDashboardPage;

