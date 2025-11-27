import React, { memo, Suspense, lazy, useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { TierPill, ProgressBadge } from "./components/StatusPills";
import { fieldClasses, tabs } from "./data/teacherDashboardContent";
import { useTeacherDashboardState } from "./hooks/useTeacherDashboardState";
import useTeacherDashboardData from "./hooks/useTeacherDashboardData";
import TeacherHeroSection from "./teacher/TeacherHeroSection";

const DashboardOverview = lazy(() => import("./components/DashboardOverview"));
const StudentsPanel = lazy(() => import("./components/StudentsPanel"));
const InterventionFormPanel = lazy(() => import("./components/InterventionFormPanel"));
const ProgressFormPanel = lazy(() => import("./components/ProgressFormPanel"));

const PanelFallback = () => (
    <div className="glass glass-card p-8 text-center text-muted-foreground animate-pulse">Loading panel...</div>
);

const TeacherDashboardPage = memo(() => {
    const {
        statCards,
        students,
        progressData,
        heroBadge,
        loading: dataLoading,
        error: dataError,
        refresh,
    } = useTeacherDashboardData();
    const {
        activeTab,
        setActiveTab,
        interventionForm,
        progressForm,
        handleInterventionChange,
        handleProgressChange,
        handleSavePlan,
        handleSubmitProgress,
    } = useTeacherDashboardState(tabs);

    const { base: baseFieldClass, textarea: textareaClass, notes: notesTextareaClass } = fieldClasses;

    const panelContent = useMemo(() => {
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
    }, [
        activeTab,
        interventionForm,
        progressForm,
        handleInterventionChange,
        handleProgressChange,
        handleSavePlan,
        handleSubmitProgress,
        baseFieldClass,
        textareaClass,
        notesTextareaClass,
        statCards,
        students,
        progressData,
    ]);

    return (
        <div className="mtss-theme mtss-animated-bg min-h-screen relative overflow-hidden text-foreground dark:text-white transition-colors">
            <div className="mtss-bg-overlay" />
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/70 to-transparent dark:from-white/10" />
                <div className="absolute -bottom-24 left-12 w-[28rem] h-[28rem] bg-primary/30 dark:bg-primary/25 blur-[200px]" />
            </div>

            <div className="relative z-20 container-tight px-4 sm:px-6 py-8 lg:py-14 space-y-8 lg:space-y-10">
                <motion.section
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mtss-gradient-border overflow-hidden rounded-3xl border border-white/40 dark:border-white/10 shadow-[0_25px_60px_rgba(148,163,184,0.25)]"
                >
                    <TeacherHeroSection heroBadge={heroBadge} tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                </motion.section>

                {(dataLoading || dataError) && (
                    <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-white/5 px-4 py-3 flex items-center justify-between gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            {dataLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                            <span>{dataError ? dataError : "Syncing live MTSS data..."}</span>
                        </div>
                        {dataError && (
                            <button onClick={refresh} className="text-primary font-semibold hover:underline">
                                Retry
                            </button>
                        )}
                    </div>
                )}

                <Suspense fallback={<PanelFallback />}>{panelContent}</Suspense>
            </div>
        </div>
    );
});

TeacherDashboardPage.displayName = "TeacherDashboardPage";
export default TeacherDashboardPage;
