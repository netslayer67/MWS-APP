import React, { memo, useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import AdminMentorAssignModal from "./AdminMentorAssignModal";

const AdminMentorsPanel = ({ mentorRoster = [], mentorDirectory = [], students = [], onRefresh }) => {
    const roster = (mentorRoster.length ? mentorRoster : mentorDirectory).map((mentor) => ({
        _id: mentor._id || mentor.id || mentor.mentorId?._id,
        name: mentor.name,
        role: mentor.jobPosition || mentor.role || "Teacher",
        activeStudents: mentor.activeStudents || mentor.students || 0,
        successRate: mentor.successRate || "0%",
    }));

    const [activeMentorId, setActiveMentorId] = useState(null);
    const activeMentor = useMemo(
        () => mentorDirectory.find((mentor) => mentor._id === activeMentorId),
        [mentorDirectory, activeMentorId],
    );

    const triggerAssign = useCallback(
        (mentorItem) => {
            if (mentorItem._id) {
                setActiveMentorId(mentorItem._id);
                return;
            }
            const match = mentorDirectory.find((mentor) => mentor.name === mentorItem.name);
            if (match?._id) {
                setActiveMentorId(match._id);
            }
        },
        [mentorDirectory],
    );

    return (
        <div className="space-y-8">
            <div className="glass glass-card mtss-card-surface p-8 rounded-[40px] shadow-[0_30px_90px_rgba(15,23,42,0.32)] border border-white/10 bg-white/15 dark:bg-white/5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <p className="text-[0.7rem] uppercase tracking-[0.5em] text-muted-foreground dark:text-white/60">Mentor Squad</p>
                        <h3 className="text-2xl font-black text-foreground dark:text-white">Manage Mentors</h3>
                        <p className="text-sm text-muted-foreground dark:text-white/70 max-w-2xl">
                            Assign caseloads, check success rates, and celebrate wins without losing the playful flow.
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-primary font-semibold">
                            <Sparkles className="w-4 h-4" />
                            Tap “Assign students” to pair a mentor with multiple kids instantly.
                        </div>
                    </div>
                    <button className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#fef9c3] to-[#fbcfe8] text-sm font-semibold text-rose-600 shadow-lg hover:shadow-[#f43f5e]/30 transition">
                        Add Mentor
                    </button>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                {roster.map((mentor, index) => (
                    <motion.div
                        key={mentor.name}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className="rounded-[32px] bg-white/90 dark:bg-white/10 border border-white/60 dark:border-white/10 p-6 space-y-5 shadow-[0_25px_80px_rgba(15,23,42,0.24)] backdrop-blur-xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-rose text-white font-black flex items-center justify-center shadow-inner">
                                {mentor.name
                                    .split(" ")
                                    .map((part) => part[0])
                                    .slice(0, 2)
                                    .join("")}
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-foreground dark:text-white">{mentor.name}</p>
                                <p className="text-sm text-muted-foreground dark:text-white/70">{mentor.role}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm font-semibold text-foreground dark:text-white gap-4">
                            <div>
                                <p className="text-[0.65rem] uppercase tracking-[0.6em] text-muted-foreground">Active students</p>
                                <p className="text-3xl font-black">{mentor.activeStudents}</p>
                            </div>
                            <div>
                                <p className="text-[0.65rem] uppercase tracking-[0.6em] text-muted-foreground">Success rate</p>
                                <p className="text-3xl font-black text-emerald-500">{mentor.successRate}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button className="flex-1 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#7dd3fc] to-[#60a5fa] text-white text-sm font-semibold shadow-md hover:-translate-y-0.5 transition">
                                View Details
                            </button>
                            <button
                                className="flex-1 px-4 py-2.5 rounded-full border border-primary/40 text-primary text-sm font-semibold bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition dark:bg-white/5 dark:text-white"
                                onClick={() => triggerAssign(mentor)}
                            >
                                Assign Students
                            </button>
                        </div>
                    </motion.div>
                ))}
                </div>
                {activeMentor && (
                    <AdminMentorAssignModal
                        open={Boolean(activeMentor)}
                        mentor={activeMentor}
                        students={students}
                        onClose={() => setActiveMentorId(null)}
                        onAssigned={() => {
                            setActiveMentorId(null);
                            onRefresh?.();
                        }}
                    />
                )}
            </div>
        </div>
    );
};

AdminMentorsPanel.displayName = "AdminMentorsPanel";
export default memo(AdminMentorsPanel);
