import React, { memo, Suspense, lazy, useMemo } from "react";
import { motion } from "framer-motion";
import { adminTabs, heroCard, overviewIcons } from "./data/adminDashboardContent";
import useAdminDashboardData from "./hooks/useAdminDashboardData";
import { useAdminDashboardState } from "./hooks/useAdminDashboardState";
import AdminHeroSection from "./admin/AdminHeroSection";

const AdminOverviewPanel = lazy(() => import("./admin/AdminOverviewPanel"));
const AdminStudentsPanel = lazy(() => import("./admin/AdminStudentsPanel"));
const AdminMentorsPanel = lazy(() => import("./admin/AdminMentorsPanel"));
const AdminAnalyticsPanel = lazy(() => import("./admin/AdminAnalyticsPanel"));

const PanelFallback = () => (
    <div className="glass glass-card p-8 text-center text-muted-foreground animate-pulse">Loading dashboard...</div>
);

const AdminDashboardPage = memo(() => {
    const {
        students,
        statCards,
        systemSnapshot,
        recentActivity,
        mentorSpotlights,
        mentorRoster,
        mentors,
        successByType,
        trendData,
        trendPaths,
        strategyHighlights,
        tierMovement,
        loading,
        error,
        refresh,
    } = useAdminDashboardData();

    const {
        activeTab,
        setActiveTab,
        filters,
        handleFilterChange,
        filteredStudents,
        gradeOptions,
        tierOptions,
        typeOptions,
        mentorOptions,
        handleViewStudent,
        handleQuickUpdate,
        selectedIds,
        toggleSelection,
        resetSelection,
    } = useAdminDashboardState(students);

    const activePanel = useMemo(() => {
        switch (activeTab) {
            case "overview":
                return (
                    <AdminOverviewPanel
                        statCards={statCards}
                        systemSnapshot={systemSnapshot}
                        recentActivity={recentActivity}
                        mentorSpotlights={mentorSpotlights}
                        icons={overviewIcons}
                    />
                );
            case "students":
                return (
                    <AdminStudentsPanel
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        gradeOptions={gradeOptions}
                        tierOptions={tierOptions}
                        typeOptions={typeOptions}
                        mentorOptions={mentorOptions}
                        filteredStudents={filteredStudents}
                        allStudents={students}
                        onViewStudent={handleViewStudent}
                        onUpdateStudent={handleQuickUpdate}
                        selectedIds={selectedIds}
                        onToggleSelect={toggleSelection}
                        onResetSelection={resetSelection}
                        mentorDirectory={mentors}
                        onRefresh={refresh}
                    />
                );
            case "mentors":
                return (
                    <AdminMentorsPanel
                        mentorRoster={mentorRoster}
                        mentorDirectory={mentors}
                    />
                );
            case "analytics":
                return (
                    <AdminAnalyticsPanel
                        successByType={successByType}
                        trendPaths={trendPaths}
                        trendData={trendData}
                        strategyHighlights={strategyHighlights}
                        tierMovement={tierMovement}
                    />
                );
            default:
                return null;
        }
    }, [
        activeTab,
        filters,
        gradeOptions,
        tierOptions,
        typeOptions,
        mentorOptions,
        filteredStudents,
        handleFilterChange,
        handleViewStudent,
        handleQuickUpdate,
        selectedIds,
        toggleSelection,
        resetSelection,
        mentorRoster,
        mentors,
        statCards,
        systemSnapshot,
        recentActivity,
        mentorSpotlights,
        successByType,
        trendData,
        trendPaths,
        strategyHighlights,
        tierMovement,
    ]);

    return (
        <div className="mtss-theme mtss-animated-bg min-h-screen relative overflow-hidden">
            <div className="mtss-bg-overlay" />
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 left-0 w-96 h-96 bg-[#ff80b5]/30 blur-[180px]" />
                <div className="absolute top-40 right-0 w-80 h-80 bg-[#60a5fa]/30 blur-[180px]" />
                <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-[#fcd34d]/20 blur-[180px]" />
            </div>

            <div className="relative z-20 container-tight py-12 lg:py-16 text-foreground dark:text-white space-y-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} data-aos="fade-up">
                    <AdminHeroSection heroCard={heroCard} tabs={adminTabs} activeTab={activeTab} onTabChange={setActiveTab} />
                </motion.div>

                {(loading || error) && (
                    <div className="rounded-2xl border border-border/50 bg-white/70 dark:bg-white/10 px-4 py-3 flex items-center justify-between gap-4 text-sm text-muted-foreground">
                        <span>{error || "Syncing MTSS data..."}</span>
                        {error && (
                            <button onClick={refresh} className="text-primary font-semibold hover:underline">
                                Retry
                            </button>
                        )}
                    </div>
                )}

                <div data-aos="fade-up" data-aos-delay="120">
                    <Suspense fallback={<PanelFallback />}>{activePanel}</Suspense>
                </div>
            </div>
        </div>
    );
});

AdminDashboardPage.displayName = "AdminDashboardPage";
export default AdminDashboardPage;
