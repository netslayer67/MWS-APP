import React, { memo, Suspense, lazy, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { TierPill, ProgressBadge } from "./components/StatusPills";
import { fieldClasses, tabs } from "./data/teacherDashboardContent";
import { useTeacherDashboardState } from "./hooks/useTeacherDashboardState";
import useTeacherDashboardData from "./hooks/useTeacherDashboardData";
import TeacherHeroSection from "./teacher/TeacherHeroSection";
import { useToast } from "@/components/ui/use-toast";
import { updateMentorAssignment } from "@/services/mtssService";
import PageLoader from "@/components/PageLoader";

const DashboardOverview = lazy(() => import("./components/DashboardOverview"));
const StudentsPanel = lazy(() => import("./components/StudentsPanel"));
const InterventionFormPanel = lazy(() => import("./components/InterventionFormPanel"));
const ProgressFormPanel = lazy(() => import("./components/ProgressFormPanel"));

const PanelFallback = () => (
    <div className="glass glass-card p-8 text-center text-muted-foreground animate-pulse">Loading panel...</div>
);

const TeacherDashboardPage = memo(() => {
    const { toast } = useToast();
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
        resetProgressForm,
        submittingPlan,
        setSubmittingProgress,
        submittingProgress,
    } = useTeacherDashboardState(tabs);

    const { base: baseFieldClass, textarea: textareaClass, notes: notesTextareaClass } = fieldClasses;

    const handleProgressSubmitForm = useCallback(
        async (event) => {
            event.preventDefault();
            if (!progressForm.studentId || !progressForm.date || progressForm.scoreValue === "") {
                toast({
                    title: "Complete the required fields",
                    description: "Student, date, and score are required to submit progress.",
                    variant: "destructive",
                });
                return;
            }
            const selectedStudent = students.find((student) => student.id === progressForm.studentId);
            if (!selectedStudent) {
                toast({
                    title: "Select a student",
                    description: "Choose a student before logging progress.",
                    variant: "destructive",
                });
                return;
            }
            if (!selectedStudent.assignmentId) {
                toast({
                    title: "No active intervention",
                    description: `${selectedStudent.name} is not linked to an active intervention yet.`,
                    variant: "destructive",
                });
                return;
            }
            try {
                setSubmittingProgress(true);
                await updateMentorAssignment(selectedStudent.assignmentId, {
                    checkIns: [
                        {
                            date: progressForm.date || new Date(),
                            summary: progressForm.notes || "Progress update logged via dashboard",
                            nextSteps: progressForm.notes,
                            value: progressForm.scoreValue ? Number(progressForm.scoreValue) : undefined,
                            unit: progressForm.scoreUnit,
                            performed: progressForm.performed === "yes",
                        },
                    ],
                });
                toast({
                    title: "Progress saved",
                    description: `${selectedStudent.name}'s update is now on the dashboard.`,
                });
                resetProgressForm();
                refresh();
            } catch (error) {
                toast({
                    title: "Failed to save progress",
                    description: error?.response?.data?.message || error.message || "Unable to record update now.",
                    variant: "destructive",
                });
            } finally {
                setSubmittingProgress(false);
            }
        },
        [progressForm, students, toast, resetProgressForm, refresh, setSubmittingProgress],
    );

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
                return (
                    <StudentsPanel
                        students={students}
                        TierPill={TierPill}
                        ProgressBadge={ProgressBadge}
                        onRefresh={refresh}
                    />
                );
            case "create":
                return (
                    <InterventionFormPanel
                        formState={interventionForm}
                        onChange={handleInterventionChange}
                        onSubmit={(event) => handleSavePlan(event, interventionForm)}
                        baseFieldClass={baseFieldClass}
                        textareaClass={textareaClass}
                        students={students}
                        submitting={submittingPlan}
                    />
                );
            case "submit":
                return (
                    <ProgressFormPanel
                        formState={progressForm}
                        onChange={handleProgressChange}
                        onSubmit={handleProgressSubmitForm}
                        baseFieldClass={baseFieldClass}
                        textareaClass={notesTextareaClass}
                        students={students}
                        submitting={submittingProgress}
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
        handleProgressSubmitForm,
        baseFieldClass,
        textareaClass,
        notesTextareaClass,
        statCards,
        students,
        progressData,
        refresh,
    ]);

    return (
        <div className="mtss-theme mtss-animated-bg min-h-screen relative overflow-hidden text-foreground dark:text-white transition-colors">
            {(submittingPlan || submittingProgress) && <PageLoader />}
            <div className="mtss-bg-overlay" />
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/70 via-[#fef2f2]/40 to-transparent dark:from-white/10 dark:via-white/5" />
                <div className="absolute -bottom-24 left-12 w-[28rem] h-[28rem] bg-gradient-to-br from-[#22d3ee]/35 via-[#a855f7]/25 to-[#f472b6]/20 dark:from-[#0ea5e9]/25 dark:via-[#a855f7]/20 dark:to-[#f472b6]/15 blur-[200px]" />
            </div>

            <div className="relative z-20 container-tight px-4 sm:px-6 py-8 lg:py-14 space-y-8 lg:space-y-10">
                <motion.section
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mtss-gradient-border overflow-hidden rounded-3xl border border-white/40 dark:border-white/10 shadow-[0_25px_60px_rgba(148,163,184,0.25)]"
                    data-aos="fade-up"
                    data-aos-duration="700"
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
