import React, { memo } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck } from "lucide-react";

const ProgressFormPanel = memo(({ formState, onChange, onSubmit, baseFieldClass, textareaClass, students }) => (
    <motion.section
        className="glass glass-card p-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
        <header>
            <p className="uppercase text-xs tracking-[0.4em] text-muted-foreground">Submit Progress</p>
            <h2 className="text-2xl font-bold text-foreground dark:text-white">Monitoring Update</h2>
        </header>
        <form className="space-y-5" onSubmit={onSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Student Name</label>
                    <select
                        className={baseFieldClass}
                        value={formState.studentName}
                        onChange={(e) => onChange("studentName", e.target.value)}
                    >
                        <option value="">Select student</option>
                        {students.map((student) => (
                            <option key={student.name} value={student.name}>
                                {student.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Date of Update</label>
                    <input
                        type="date"
                        className={baseFieldClass}
                        value={formState.date}
                        onChange={(e) => onChange("date", e.target.value)}
                    />
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Was intervention performed?</label>
                    <select
                        className={baseFieldClass}
                        value={formState.performed}
                        onChange={(e) => onChange("performed", e.target.value)}
                    >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Status or Score</label>
                    <input
                        type="text"
                        className={baseFieldClass}
                        placeholder="e.g. 72 wpm"
                        value={formState.score}
                        onChange={(e) => onChange("score", e.target.value)}
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Notes & Observations</label>
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
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-emerald text-white font-semibold shadow-glass-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <ClipboardCheck className="w-4 h-4" />
                    Submit Progress Update
                </motion.button>
                <button type="button" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-muted text-foreground font-semibold">
                    Cancel
                </button>
            </div>
        </form>
    </motion.section>
));

ProgressFormPanel.displayName = "ProgressFormPanel";
export default ProgressFormPanel;

