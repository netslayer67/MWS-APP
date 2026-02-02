import React, { memo, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { normalizeTierCode } from "../utils/teacherMappingHelpers";

const baseField =
    "px-4 py-3 rounded-2xl bg-white/80 dark:bg-white/10 border border-primary/20 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all w-full";
const readonlyField =
    "px-4 py-3 rounded-2xl bg-white/70 dark:bg-white/10 border border-primary/10 text-sm text-muted-foreground";

const getAssignmentOptions = (student) => {
    if (!student) return [];
    const rawOptions = Array.isArray(student.assignmentOptions) ? student.assignmentOptions : [];
    if (rawOptions.length) return rawOptions;
    if (!student.assignmentId) return [];
    return [
        {
            assignmentId: student.assignmentId,
            focus: student.type || "Focused Support",
            tier: student.tier || "Tier 1",
            tierCode: normalizeTierCode(student.tier) || "tier1",
            statusLabel: student.progress || "On Track",
        },
    ];
};

const getEscalatedOptions = (options = []) => {
    const escalated = options.filter((option) => option.tierCode && option.tierCode !== "tier1");
    return escalated.length ? escalated : options;
};

const formatSubjectLabel = (option) => {
    const focusLabel = option.focus || option.label || "Focused Support";
    const tierLabel = option.tier || "Tier 1";
    return `${focusLabel} - ${tierLabel}`;
};

const QuickUpdateModal = memo(({ student, onClose, onSubmit, submitting = false }) => {
    const initialDate = useMemo(() => new Date().toISOString().split("T")[0], []);
    const assignmentOptions = useMemo(() => getEscalatedOptions(getAssignmentOptions(student)), [student]);
    const defaultOption = assignmentOptions[0];
    const defaultAssignmentId = defaultOption?.assignmentId || "";
    const [formState, setFormState] = useState({
        date: initialDate,
        performed: "yes",
        scoreValue: "",
        scoreUnit: defaultOption?.metricLabel || "score",
        notes: "",
        badge: "🎉 Progress Party",
        assignmentId: defaultAssignmentId,
    });

    const selectedOption = assignmentOptions.find((opt) => opt.assignmentId === formState.assignmentId);
    const lockedUnit = selectedOption?.metricLabel || formState.scoreUnit || "score";

    if (!student) return null;

    const gradeLabel = student.grade || student.currentGrade || "Grade";
    const tierLabel = student.tier || student.primaryIntervention?.tier || "Tier 1";
    const gradeTierLabel = `${gradeLabel} - ${tierLabel}`;

    const handleChange = (field, value) => {
        if (field === "assignmentId") {
            const option = assignmentOptions.find((opt) => opt.assignmentId === value);
            setFormState((prev) => ({ ...prev, assignmentId: value, scoreUnit: option?.metricLabel || prev.scoreUnit }));
            return;
        }
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit?.(student, formState);
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 mtss-theme">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl rounded-[28px] overflow-hidden border border-white/40 bg-white/95 dark:bg-slate-900/90 shadow-[0_25px_80px_rgba(15,23,42,0.35)]"
            >
                <div className="bg-gradient-to-r from-[#34d399]/80 via-[#22d3ee]/80 to-[#60a5fa]/80 text-white p-6 flex items-center justify-between">
                    <div>
                        <p className="uppercase text-xs tracking-[0.4em] opacity-80">Quick Update</p>
                        <h3 className="text-2xl font-bold">{student.name}</h3>
                        <p className="text-sm opacity-90">Share today's check-in and celebrations</p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="p-2 bg-white/30 rounded-full hover:bg-white/50 transition"
                        disabled={submitting}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form className="p-6 space-y-4" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                Student Name
                            </label>
                            <div className={readonlyField}>{student.name}</div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                Grade / Tier
                            </label>
                            <div className={readonlyField}>{gradeTierLabel}</div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                            Focus Subject (Tier 2/3)
                        </label>
                        <select
                            className={baseField}
                            value={formState.assignmentId}
                            onChange={(event) => handleChange("assignmentId", event.target.value)}
                            disabled={!assignmentOptions.length}
                        >
                            {assignmentOptions.length ? (
                                assignmentOptions.map((option) => (
                                    <option key={option.assignmentId} value={option.assignmentId}>
                                        {formatSubjectLabel(option)}
                                    </option>
                                ))
                            ) : (
                                <option value="">No Tier 2/3 subjects available</option>
                            )}
                        </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Date</label>
                            <input
                                type="date"
                                className={baseField}
                                value={formState.date}
                                onChange={(event) => handleChange("date", event.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                Intervention Performed?
                            </label>
                            <select
                                className={baseField}
                                value={formState.performed}
                                onChange={(event) => handleChange("performed", event.target.value)}
                            >
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Status or Score</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    className={`${baseField} flex-1`}
                                    placeholder="e.g. 78"
                                    value={formState.scoreValue}
                                    onChange={(event) => handleChange("scoreValue", event.target.value)}
                                />
                                <div className={`${readonlyField} w-28 flex items-center`}>{lockedUnit}</div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Celebration Emoji</label>
                            <select
                                className={baseField}
                                value={formState.badge}
                                onChange={(event) => handleChange("badge", event.target.value)}
                            >
                                <option value="🎉 Progress Party">🎉 Progress Party</option>
                                <option value="✨ Stellar Boost">✨ Stellar Boost</option>
                                <option value="🌈 Focus Mode">🌈 Focus Mode</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Notes & Observations</label>
                        <textarea
                            className={`${baseField} min-h-[120px]`}
                            placeholder="Describe the student's progress, challenges, or celebrations..."
                            value={formState.notes}
                            onChange={(event) => handleChange("notes", event.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                        <motion.button
                            type="submit"
                            className="px-5 py-3 rounded-full bg-gradient-to-r from-[#ff58c2] to-[#ffb347] text-white font-semibold shadow-[0_15px_40px_rgba(255,88,194,0.25)] disabled:opacity-60"
                            whileHover={{ scale: submitting ? 1 : 1.03 }}
                            whileTap={{ scale: submitting ? 1 : 0.97 }}
                            disabled={submitting}
                        >
                            {submitting ? "Saving..." : "Save Update"}
                        </motion.button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-3 rounded-full bg-white/80 dark:bg-white/10 text-foreground font-semibold border border-border/60 disabled:opacity-60"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
});

QuickUpdateModal.displayName = "QuickUpdateModal";
export default QuickUpdateModal;

