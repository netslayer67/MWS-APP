import { memo, Suspense, lazy, useMemo } from "react";
import { TierPill, ProgressBadge } from "./StatusPills";

const DashboardOverview = lazy(() => import("./DashboardOverview"));
const StudentsPanel = lazy(() => import("./StudentsPanel"));
const InterventionFormPanel = lazy(() => import("./InterventionFormPanel"));
const ProgressFormPanel = lazy(() => import("./ProgressFormPanel"));

const PanelFallback = () => (
    <div className="glass glass-card p-8 text-center text-muted-foreground animate-pulse">Loading panel...</div>
);

const TeacherDashboardPanels = memo(
    ({
        activeTab,
        statCards,
        students,
        progressData,
        interventionForm,
        progressForm,
        handleInterventionChange,
        handleProgressChange,
        handleSavePlan,
        handleProgressSubmitForm,
        baseFieldClass,
        textareaClass,
        notesTextareaClass,
        submittingPlan,
        submittingProgress,
        onViewStudent,
        onQuickUpdate,
        refresh,
    }) => {
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
                            onView={onViewStudent}
                            onUpdate={onQuickUpdate}
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
            baseFieldClass,
            handleInterventionChange,
            handleProgressChange,
            handleProgressSubmitForm,
            handleSavePlan,
            interventionForm,
            notesTextareaClass,
            onQuickUpdate,
            onViewStudent,
            progressData,
            progressForm,
            refresh,
            statCards,
            students,
            submittingPlan,
            submittingProgress,
            textareaClass,
        ]);

        return <Suspense fallback={<PanelFallback />}>{panelContent}</Suspense>;
    },
);

TeacherDashboardPanels.displayName = "TeacherDashboardPanels";
export default TeacherDashboardPanels;
