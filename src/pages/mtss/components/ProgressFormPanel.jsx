import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Loader2 } from "lucide-react";

const SCORE_UNITS = ["wpm", "%", "pts", "score"];

const ProgressFormPanel = memo(
    ({ formState, onChange, onSubmit, baseFieldClass, textareaClass, students = [], submitting = false }) => {
        const selectedStudent = useMemo(
            () => students.find((student) => student.id === formState.studentId),
            [students, formState.studentId],
        );

        const handleStudentChange = (event) => {
            const value = event.target.value;
            const student = students.find((candidate) => candidate.id === value);
            onChange("studentId", value);
            onChange("studentName", student?.name || "");
            onChange("assignmentId", student?.assignmentId || "");
        };

        const isValid = Boolean(formState.studentId && formState.date && formState.scoreValue !== "");

        return (
            <motion.section
                className="mtss-theme rounded-[32px] border border-white/40 bg-white/90 dark:bg-slate-900/40 shadow-[0_25px_80px_rgba(15,23,42,0.12)] p-6 space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <header>
                    <p className="uppercase text-xs tracking-[0.4em] text-muted-foreground">Progress Ping</p>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Log today's glow</h2>
                    <p className="text-sm text-muted-foreground">
                        Share check-in data, SEL notes, and small wins to keep the MTSS trail fresh.
                    </p>
                </header>
                <form className="space-y-5" onSubmit={onSubmit}>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                Student Name
                            </label>
                            <select className={baseFieldClass} value={formState.studentId} onChange={handleStudentChange}>
                                <option value="">Select student</option>
                                {students.map((student) => (
                                    <option key={student.id} value={student.id}>
                                        {student.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                Grade / Tier
                            </label>
                            <div className="px-4 py-3 rounded-2xl bg-white/70 dark:bg-white/10 border border-primary/10 text-sm text-muted-foreground">
                                {selectedStudent
                                    ? `${selectedStudent.grade || "Grade"} - ${selectedStudent.tier || "Tier 1"}`
                                    : "Select a student to view current tier"}
                            </div>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                Date of Update
                            </label>
                            <input
                                type="date"
                                className={baseFieldClass}
                                value={formState.date}
                                onChange={(e) => onChange("date", e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                Intervention Performed?
                            </label>
                            <select
                                className={baseFieldClass}
                                value={formState.performed}
                                onChange={(e) => onChange("performed", e.target.value)}
                            >
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                Status or Score
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    className={`${baseFieldClass} flex-1`}
                                    placeholder="e.g. 72"
                                    value={formState.scoreValue}
                                    onChange={(e) => onChange("scoreValue", e.target.value)}
                                />
                                <select
                                    className={`${baseFieldClass} w-28`}
                                    value={formState.scoreUnit}
                                    onChange={(e) => onChange("scoreUnit", e.target.value)}
                                >
                                    {SCORE_UNITS.map((unit) => (
                                        <option key={unit} value={unit}>
                                            {unit}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                Celebration Emoji
                            </label>
                        <select
                            className={baseFieldClass}
                            value={formState.badge || "🎉 Progress Party"}
                            onChange={(e) => onChange("badge", e.target.value)}
                        >
                            <option value="🎉 Progress Party">🎉 Progress Party</option>
                            <option value="🌟 Stellar Boost">🌟 Stellar Boost</option>
                            <option value="🎯 Focus Mode">🎯 Focus Mode</option>
                            <option value="👏 Great Effort">👏 Great Effort</option>
                            <option value="🏅 Milestone Hit">🏅 Milestone Hit</option>
                            <option value="📈 Growth Spurt">📈 Growth Spurt</option>
                            <option value="🌱 Keep Going">🌱 Keep Going</option>
                        </select>
                    </div>
                </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                            Notes & Observations
                        </label>
                        <textarea
                            className={textareaClass}
                            placeholder="Describe student's progress, challenges, or celebrations..."
                            value={formState.notes}
                            onChange={(e) => onChange("notes", e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap gap-3 pt-3">
                        <motion.button
                            type="submit"
                            disabled={!isValid || submitting}
                            className="mtss-rainbow-chip mtss-rainbow-chip--emerald inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
                            {submitting ? "Saving..." : "Submit Progress Update"}
                        </motion.button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-muted text-foreground font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </motion.section>
        );
    },
);

ProgressFormPanel.displayName = "ProgressFormPanel";
export default ProgressFormPanel;
