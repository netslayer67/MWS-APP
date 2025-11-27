import React, { memo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { studentTabs } from "./data/studentPortalContent";
import { useStudentPortalState } from "./hooks/useStudentPortalState";
import StudentSelectionView from "./student/StudentSelectionView";
import StudentProgressPanel from "./student/StudentProgressPanel";
import StudentSchedulePanel from "./student/StudentSchedulePanel";
import StudentMessagesPanel from "./student/StudentMessagesPanel";

const StudentPortalPage = memo(() => {
    const { selectedStudent, activeTab, setActiveTab, currentStudent, handleBack, handleSelectStudent, students } =
        useStudentPortalState();

    if (!selectedStudent) {
        return <StudentSelectionView students={students} onSelect={handleSelectStudent} onBack={handleBack} />;
    }

    return (
        <div className="mtss-theme mtss-animated-bg min-h-screen relative overflow-hidden text-foreground dark:text-white">
            <div className="mtss-bg-overlay" />
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-[#fde68a]/50 via-[#f9a8d4]/50 to-[#c4b5fd]/50" />
                <motion.div
                    className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white/40"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 6 }}
                />
            </div>

            <div className="relative z-10 container-tight py-12 space-y-10">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-[28px] bg-white/90 dark:bg-white/10 shadow-lg text-sm font-semibold text-rose-500"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <div className="text-right space-y-1">
                        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground dark:text-white/70">My MTSS Portal</p>
                        <h1 className="text-3xl md:text-4xl font-black">{currentStudent.data.title || `${currentStudent.name} Journey`}</h1>
                    </div>
                    <div className="px-4 py-2 rounded-[28px] bg-gradient-to-r from-[#fecdd3] to-[#f5d0fe] text-sm font-black text-rose-700 shadow-lg">
                        Logged in as: {currentStudent.name}
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    {studentTabs.map((tab) => {
                        const TabIcon = tab.icon;
                        const active = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-5 py-3 rounded-[30px] border font-semibold text-sm flex items-center gap-2 transition ${
                                    active
                                        ? "bg-gradient-to-r from-[#fdf2f8] to-[#eef2ff] text-rose-600 border-white/60"
                                        : "bg-white/15 text-white border-white/30 hover:bg-white/25"
                                }`}
                            >
                                <TabIcon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {activeTab === "progress" && <StudentProgressPanel student={currentStudent} />}
                {activeTab === "schedule" && <StudentSchedulePanel student={currentStudent} />}
                {activeTab === "messages" && <StudentMessagesPanel student={currentStudent} />}
            </div>
        </div>
    );
});

StudentPortalPage.displayName = "StudentPortalPage";
export default StudentPortalPage;
