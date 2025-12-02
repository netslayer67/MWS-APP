import React, { memo } from "react";
import { motion } from "framer-motion";

const StudentSelectionView = ({ students, onSelect, onBack }) => (
    <div className="mtss-theme mtss-animated-bg min-h-screen relative overflow-hidden">
        <div className="mtss-bg-overlay" />
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-[#fde68a]/50 via-[#f9a8d4]/50 to-[#a5b4fc]/50" />
            <div className="absolute -top-20 left-6 w-72 h-72 bg-[#fcd34d]/30 blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#a5b4fc]/20 blur-[160px]" />
        </div>

        <div className="relative z-10 container-tight py-14 text-foreground dark:text-white space-y-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
                <p className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/80 dark:bg-white/10 text-xs font-black tracking-[0.6em] text-rose-500 shadow-lg">
                    ????? Student/Parent
                </p>
                <h1 className="text-4xl md:text-5xl font-black">
                    <span className="bg-gradient-to-r from-[#f97316] via-[#ec4899] to-[#14b8a6] bg-clip-text text-transparent">My MTSS Portal</span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground dark:text-white/75">
                    Select a student account to see cheerful dashboards, schedules, and quick chat logs.
                </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2">
                {students.map((student) => {
                    const mentorDisplay =
                        Array.isArray(student.teachers) && student.teachers.length
                            ? student.teachers.join(", ")
                            : student.mentor;
                    return (
                        <motion.button
                        key={student.id}
                        whileHover={{ scale: 1.02, y: -6 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(student.id)}
                        className="group relative overflow-hidden rounded-[48px] border border-white/50 dark:border-white/15 text-left shadow-[0_25px_70px_rgba(15,23,42,0.25)]"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${student.accent}`} />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/15 mix-blend-overlay" />
                        <div className="relative z-10 p-8 text-white space-y-3">
                            <p className="text-sm uppercase tracking-[0.5em] opacity-80">Who is logging in?</p>
                            <h2 className="text-3xl font-black drop-shadow-lg">{student.name}</h2>
                            <p className="text-lg font-semibold">{student.grade}</p>
                            <div className="rounded-3xl bg-white/20 px-4 py-2 text-sm font-semibold">
                                <p>Focus: {student.focus}</p>
                                <p>Mentor: {mentorDisplay}</p>
                            </div>
                            <span className="inline-flex items-center gap-2 text-sm uppercase font-black tracking-[0.5em]">
                                Enter Portal
                                <motion.span animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>
                                    →
                                </motion.span>
                            </span>
                        </div>
                        </motion.button>
                    );
                })}
            </div>

            <div className="flex justify-center">
                <button
                    onClick={onBack}
                    className="px-6 py-3 rounded-full bg-white/85 dark:bg-white/10 text-sm font-semibold text-rose-500 shadow-lg border border-white/60 hover:shadow-xl transition"
                >
                    ← Back to Role Selection
                </button>
            </div>
        </div>
    </div>
);

StudentSelectionView.displayName = "StudentSelectionView";
export default memo(StudentSelectionView);
