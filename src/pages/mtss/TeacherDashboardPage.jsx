import React, { memo, useCallback, useState } from "react";
import { fieldClasses, tabs } from "./data/teacherDashboardContent";
import { useTeacherDashboardState } from "./hooks/useTeacherDashboardState";
import useTeacherDashboardData from "./hooks/useTeacherDashboardData";
import TeacherHeroSection from "./teacher/TeacherHeroSection";
import { useToast } from "@/components/ui/use-toast";
import PageLoader from "@/components/PageLoader";
import { useNavigate } from "react-router-dom";
import QuickUpdateModal from "./components/QuickUpdateModal";
import TeacherDashboardPanels from "./components/TeacherDashboardPanels";
import TeacherDashboardStatus from "./components/TeacherDashboardStatus";
import useTeacherDashboardActions from "./hooks/useTeacherDashboardActions";

const TeacherDashboardPage = memo(() => {
    const { toast } = useToast();
    const navigate = useNavigate();
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
    const [quickUpdateStudent, setQuickUpdateStudent] = useState(null);
    const [savingQuickUpdate, setSavingQuickUpdate] = useState(false);

    const { base: baseFieldClass, textarea: textareaClass, notes: notesTextareaClass } = fieldClasses;
    const handleViewStudent = useCallback(
        (student) => {
            if (!student?.slug) return;
            navigate(`/mtss/student/${student.slug}`);
        },
        [navigate],
    );

    const handleOpenQuickUpdate = useCallback((student) => setQuickUpdateStudent(student), []);
    const handleCloseQuickUpdate = useCallback(() => setQuickUpdateStudent(null), []);
    const { handleProgressSubmitForm, handleQuickUpdateSubmit } = useTeacherDashboardActions({
        students,
        progressForm,
        resetProgressForm,
        refresh,
        setSubmittingProgress,
        toast,
        setSavingQuickUpdate,
        onCloseQuickUpdate: handleCloseQuickUpdate,
    });

    return (
        <div className="mtss-theme mtss-animated-bg min-h-screen relative overflow-hidden text-foreground dark:text-white transition-colors">
            {(submittingPlan || submittingProgress || savingQuickUpdate) && <PageLoader />}
            <div className="mtss-bg-overlay" />
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/70 via-[#fef2f2]/40 to-transparent dark:from-white/10 dark:via-white/5" />
                <div className="absolute -bottom-24 left-12 w-[28rem] h-[28rem] bg-gradient-to-br from-[#22d3ee]/35 via-[#a855f7]/25 to-[#f472b6]/20 dark:from-[#0ea5e9]/25 dark:via-[#a855f7]/20 dark:to-[#f472b6]/15 blur-[200px]" />
            </div>

            <div className="relative z-20 container-tight px-4 sm:px-6 py-8 lg:py-14 space-y-8 lg:space-y-10">
                <section
                    className="mtss-gradient-border overflow-hidden rounded-3xl border border-white/40 dark:border-white/10 shadow-[0_25px_60px_rgba(148,163,184,0.25)]"
                    data-aos="fade-up"
                    data-aos-duration="700"
                >
                    <TeacherHeroSection heroBadge={heroBadge} tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                </section>

                <TeacherDashboardStatus loading={dataLoading} error={dataError} onRetry={refresh} />

                <TeacherDashboardPanels
                    activeTab={activeTab}
                    statCards={statCards}
                    students={students}
                    progressData={progressData}
                    interventionForm={interventionForm}
                    progressForm={progressForm}
                    handleInterventionChange={handleInterventionChange}
                    handleProgressChange={handleProgressChange}
                    handleSavePlan={handleSavePlan}
                    handleProgressSubmitForm={handleProgressSubmitForm}
                    baseFieldClass={baseFieldClass}
                    textareaClass={textareaClass}
                    notesTextareaClass={notesTextareaClass}
                    submittingPlan={submittingPlan}
                    submittingProgress={submittingProgress}
                    onViewStudent={handleViewStudent}
                    onQuickUpdate={handleOpenQuickUpdate}
                    refresh={refresh}
                />
            </div>
            {quickUpdateStudent && (
                <QuickUpdateModal
                    student={quickUpdateStudent}
                    onClose={handleCloseQuickUpdate}
                    onSubmit={handleQuickUpdateSubmit}
                    submitting={savingQuickUpdate}
                />
            )}
        </div>
    );
});

TeacherDashboardPage.displayName = "TeacherDashboardPage";
export default TeacherDashboardPage;
