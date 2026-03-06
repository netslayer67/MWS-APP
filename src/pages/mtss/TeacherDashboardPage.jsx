import { memo, lazy, Suspense, useCallback, useMemo, useRef, useState } from "react";
import { fieldClasses, tabs } from "./data/teacherDashboardContent";
import { useTeacherDashboardState } from "./hooks/useTeacherDashboardState";
import useTeacherDashboardData from "./hooks/useTeacherDashboardData";
import TeacherHeroSection from "./teacher/TeacherHeroSection";
import { useToast } from "@/components/ui/use-toast";
import { useSelector } from "react-redux";
import PageLoader from "@/components/PageLoader";
import { useNavigate } from "react-router-dom";
import QuickUpdateModal from "./components/QuickUpdateModal";
import TeacherDashboardPanels from "./components/TeacherDashboardPanels";
import TeacherDashboardStatus from "./components/TeacherDashboardStatus";
import useTeacherDashboardActions from "./hooks/useTeacherDashboardActions";
import { canUserEditPlanForStudent, resolveEditableAssignmentForUser } from "./utils/editPlanAccess";

const CheckinCollageLayer = lazy(() => import("@/components/emotion-staff/CheckinCollageLayer"));

const TeacherDashboardPage = memo(() => {
    const { toast } = useToast();
    const authUser = useSelector((state) => state.auth?.user);
    const navigate = useNavigate();
    const pageRef = useRef(null);
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
        editingPlan,
        isEditingPlan,
        handleInterventionChange,
        handleProgressChange,
        handleSavePlan,
        startEditingPlan,
        cancelEditingPlan,
        resetProgressForm,
        submittingPlan,
        setSubmittingProgress,
        submittingProgress,
    } = useTeacherDashboardState(tabs, { onSaveSuccess: refresh });
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
    const canEditPlanForStudent = useCallback(
        (student) => {
            const assignmentOption = resolveEditableAssignmentForUser(authUser, student);
            return Boolean(assignmentOption?.assignmentId);
        },
        [authUser],
    );
    const handleEditPlan = useCallback(
        (payload) => {
            const student = payload?.student || payload;
            if (!student) return;

            const assignmentOption = payload?.assignmentOption || resolveEditableAssignmentForUser(authUser, student);
            if (!assignmentOption?.assignmentId) {
                toast({
                    title: "No editable intervention",
                    description: `${student?.name || "Student"} doesn't have an intervention plan you can edit.`,
                    variant: "destructive",
                });
                return;
            }

            if (!canUserEditPlanForStudent(authUser, student, assignmentOption)) {
                toast({
                    title: "Edit permission denied",
                    description: "Only homeroom teacher or matching subject teacher can edit this intervention plan.",
                    variant: "destructive",
                });
                return;
            }

            startEditingPlan(student, assignmentOption);
        },
        [authUser, startEditingPlan, toast],
    );
    const handleCancelEditPlan = useCallback(() => {
        cancelEditingPlan();
        setActiveTab("students");
    }, [cancelEditingPlan, setActiveTab]);
    const heroTabs = useMemo(() => tabs.filter((tab) => tab.key !== "edit"), []);
    const handleHeroTabChange = useCallback(
        (nextTab) => {
            if (nextTab === "edit" && !isEditingPlan) {
                toast({
                    title: "No active edit session",
                    description: "Use Edit Plan from Dashboard/My Students to open the dedicated edit workspace.",
                });
                return;
            }
            if (nextTab === "create" && isEditingPlan) {
                cancelEditingPlan();
            }
            setActiveTab(nextTab);
        },
        [cancelEditingPlan, isEditingPlan, setActiveTab, toast],
    );
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
        <div ref={pageRef} className="ecd-page-root mtss-theme mtss-animated-bg min-h-screen relative text-foreground dark:text-white transition-colors">
            {(submittingPlan || submittingProgress || savingQuickUpdate) && <PageLoader />}
            <div className="mtss-bg-overlay" />

            {/* Filmstrip + photo mosaic background */}
            <Suspense fallback={null}>
                <CheckinCollageLayer pageSeed={42} />
            </Suspense>

            {/* Soft color blobs (background layer) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
                <div className="absolute -top-20 left-[10%] w-[26rem] h-[26rem] rounded-full bg-[#6366f1] opacity-[0.22] dark:opacity-[0.14] blur-[90px]" />
                <div className="absolute -top-32 right-[5%] w-[30rem] h-[30rem] rounded-full bg-[#c084fc] opacity-[0.20] dark:opacity-[0.13] blur-[100px]" />
                <div className="absolute top-[15%] right-[30%] w-[22rem] h-[22rem] rounded-full bg-[#22d3ee] opacity-[0.18] dark:opacity-[0.10] blur-[80px]" />
                <div className="absolute top-[40%] left-[45%] w-[28rem] h-[28rem] rounded-full bg-[#fbbf24] opacity-[0.14] dark:opacity-[0.08] blur-[120px]" />
                <div className="absolute -bottom-32 -left-20 w-[30rem] h-[30rem] rounded-full bg-[#22d3ee] opacity-[0.20] dark:opacity-[0.12] blur-[100px]" />
                <div className="absolute -bottom-20 right-[15%] w-[24rem] h-[24rem] rounded-full bg-[#f472b6] opacity-[0.18] dark:opacity-[0.11] blur-[100px]" />
                <div className="absolute top-[60%] left-[5%] w-[20rem] h-[20rem] rounded-full bg-[#10b981] opacity-[0.14] dark:opacity-[0.09] blur-[90px]" />
            </div>
            {/* Floating gradient orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
                <div className="mtss-orb mtss-orb-1" />
                <div className="mtss-orb mtss-orb-2" />
                <div className="mtss-orb mtss-orb-3" />
                <div className="mtss-orb mtss-orb-4" />
                <div className="mtss-orb mtss-orb-5" />
                <div className="mtss-orb mtss-orb-6" />
                <div className="mtss-orb mtss-orb-7" />
            </div>

            <div className="relative z-20 container-tight px-4 sm:px-6 py-8 lg:py-14 space-y-8 lg:space-y-10">
                <section
                    className="mtss-gradient-border overflow-hidden rounded-3xl border border-white/40 dark:border-white/10 shadow-[0_25px_60px_rgba(148,163,184,0.25)]"
                    data-aos="fade-up"
                    data-aos-duration="700"
                >
                    <TeacherHeroSection heroBadge={heroBadge} tabs={heroTabs} activeTab={activeTab} onTabChange={handleHeroTabChange} />
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
                    onEditPlan={handleEditPlan}
                    canEditPlanForStudent={canEditPlanForStudent}
                    editingPlan={editingPlan}
                    onCancelEditPlan={handleCancelEditPlan}
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
