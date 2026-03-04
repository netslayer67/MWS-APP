import React, { memo, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { normalizeTierCode } from "../utils/teacherMappingHelpers";
import { SKIP_REASONS } from "../config/interventionFormConfig";
import EvidenceUploader from "./EvidenceUploader";

const baseField =
    "w-full px-4 py-3 rounded-2xl bg-white/80 dark:bg-white/10 border border-primary/20 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all";
const readonlyField =
    "px-4 py-3 rounded-2xl bg-white/70 dark:bg-white/10 border border-primary/10 text-sm text-muted-foreground min-h-[46px] flex items-center";
const hasValue = (value) => value !== null && value !== undefined && value !== "";

const resolveGoalValue = (option) => {
    if (!option) return null;
    if (hasValue(option.goal)) return option.goal;
    const goals = option.goals;
    if (typeof goals === "string") return goals;
    if (!Array.isArray(goals) || goals.length === 0) return null;
    const entry = goals.find((goal) => goal);
    if (!entry) return null;
    if (typeof entry === "string") return entry;
    return entry.description || entry.goal || entry.title || entry.name || null;
};

const formatScoreValue = (score, fallbackUnit) => {
    if (score === null || score === undefined || score === "") return null;
    if (typeof score === "number" || typeof score === "string") {
        const text = `${score}`.trim();
        if (!text) return null;
        return `${text}${fallbackUnit ? ` ${fallbackUnit}` : ""}`;
    }
    const value = score?.value ?? score?.score ?? score?.amount;
    if (value === null || value === undefined || value === "") return null;
    const unit = score?.unit || fallbackUnit;
    return `${value}${unit ? ` ${unit}` : ""}`;
};

const buildMonitoringLabel = (option) => {
    const parts = [option?.monitoringMethod, option?.monitoringFrequency].filter((part) => hasValue(part));
    return parts.length ? parts.join(" / ") : "Not set";
};

const buildBaselineTargetLabel = (option) => {
    const baseline = formatScoreValue(option?.baselineScore, option?.metricLabel);
    const target = formatScoreValue(option?.targetScore, option?.metricLabel);
    if (!baseline && !target) return "Not set";
    return `${baseline || "Not set"} to ${target || "Not set"}`;
};

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
        skipReason: "",
        skipReasonNote: "",
        scoreValue: "",
        scoreUnit: defaultOption?.metricLabel || "score",
        notes: "",
        badge: "🎉 Progress Party",
        assignmentId: defaultAssignmentId,
    });
    const [evidenceFiles, setEvidenceFiles] = useState([]);
    const [isMobileSheet, setIsMobileSheet] = useState(() =>
        typeof window !== "undefined" ? window.matchMedia("(max-width: 639px)").matches : false,
    );

    const selectedOption = assignmentOptions.find((opt) => opt.assignmentId === formState.assignmentId);
    const lockedUnit = selectedOption?.metricLabel || formState.scoreUnit || "score";
    const strategyDetail = selectedOption?.strategyName || selectedOption?.strategy || selectedOption?.focus || "Not set";
    const goalDetail = resolveGoalValue(selectedOption) || "Not set";
    const durationDetail = selectedOption?.duration || "Ongoing";
    const monitoringDetail = buildMonitoringLabel(selectedOption);
    const baselineTargetDetail = buildBaselineTargetLabel(selectedOption);
    const gradeLabel = student?.grade || student?.currentGrade || "Grade";
    const tierLabel = student?.tier || student?.primaryIntervention?.tier || "Tier 1";
    const gradeTierLabel = `${gradeLabel} - ${tierLabel}`;

    useEffect(() => {
        if (typeof window === "undefined") return undefined;
        const mediaQuery = window.matchMedia("(max-width: 639px)");
        const onChange = (event) => setIsMobileSheet(event.matches);
        setIsMobileSheet(mediaQuery.matches);

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", onChange);
            return () => mediaQuery.removeEventListener("change", onChange);
        }

        mediaQuery.addListener(onChange);
        return () => mediaQuery.removeListener(onChange);
    }, []);

    useEffect(() => {
        if (!student) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [student]);

    if (!student) return null;

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
        onSubmit?.(student, formState, evidenceFiles);
    };

    return (
        <div className="fixed inset-0 z-[90] mtss-theme">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
            <div className="relative z-10 flex min-h-[100dvh] w-full items-end justify-center p-0 sm:items-center sm:p-4">
            <motion.div
                initial={isMobileSheet ? { opacity: 0, y: 36 } : { opacity: 0, scale: 0.95, y: 20 }}
                animate={isMobileSheet ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
                exit={isMobileSheet ? { opacity: 0, y: 36 } : { opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                role="dialog"
                aria-modal="true"
                aria-label="Quick update modal"
                className="relative flex w-full max-w-4xl max-h-[94dvh] sm:max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-t-[30px] rounded-b-none sm:rounded-3xl border border-white/40 bg-white/95 dark:bg-slate-900/90 shadow-[0_25px_80px_rgba(15,23,42,0.35)]"
            >
                <div className="sm:hidden shrink-0 bg-white/95 dark:bg-slate-900/95 pt-2 pb-1 flex justify-center">
                    <span className="h-1.5 w-14 rounded-full bg-slate-300/80 dark:bg-slate-600/80" aria-hidden="true" />
                </div>
                <div className="shrink-0 bg-gradient-to-r from-[#34d399]/85 via-[#22d3ee]/85 to-[#60a5fa]/85 text-white px-4 py-4 sm:px-6 sm:py-5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="uppercase text-[10px] sm:text-xs tracking-[0.28em] sm:tracking-[0.4em] opacity-80">Quick Update</p>
                        <h3 className="text-xl sm:text-2xl font-bold truncate">{student.name}</h3>
                        <p className="text-xs sm:text-sm opacity-90">Share today's check-in and celebrations</p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="shrink-0 p-2 bg-white/30 rounded-full hover:bg-white/50 transition"
                        disabled={submitting}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
                    <div
                        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5 space-y-5 bg-white/80 dark:bg-white/5"
                        style={{ WebkitOverflowScrolling: "touch" }}
                    >
                        <section className="rounded-2xl border border-primary/15 bg-white/70 dark:bg-slate-900/40 p-4 sm:p-5 space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] sm:tracking-[0.3em] text-muted-foreground">Intervention Details</p>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-semibold uppercase tracking-[0.18em] sm:tracking-[0.24em] text-muted-foreground">
                                        Strategy
                                    </label>
                                    <div className={readonlyField}>{strategyDetail}</div>
                                </div>
                                <div className="flex flex-col gap-2 sm:col-span-2">
                                    <label className="text-[11px] font-semibold uppercase tracking-[0.18em] sm:tracking-[0.24em] text-muted-foreground">
                                        Goal
                                    </label>
                                    <div className={readonlyField}>{goalDetail}</div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-semibold uppercase tracking-[0.18em] sm:tracking-[0.24em] text-muted-foreground">
                                        Duration
                                    </label>
                                    <div className={readonlyField}>{durationDetail}</div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-semibold uppercase tracking-[0.18em] sm:tracking-[0.24em] text-muted-foreground">
                                        Monitoring Method / Frequency
                                    </label>
                                    <div className={readonlyField}>{monitoringDetail}</div>
                                </div>
                                <div className="flex flex-col gap-2 sm:col-span-2">
                                    <label className="text-[11px] font-semibold uppercase tracking-[0.18em] sm:tracking-[0.24em] text-muted-foreground">
                                        Baseline to Target
                                    </label>
                                    <div className={readonlyField}>{baselineTargetDetail}</div>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-primary/15 bg-white/70 dark:bg-slate-900/40 p-4 sm:p-5 space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] sm:tracking-[0.3em] text-muted-foreground">Student Snapshot</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-semibold uppercase tracking-[0.18em] sm:tracking-[0.24em] text-muted-foreground">
                                        Student Name
                                    </label>
                                    <div className={readonlyField}>{student.name}</div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-semibold uppercase tracking-[0.18em] sm:tracking-[0.24em] text-muted-foreground">
                                        Grade / Tier
                                    </label>
                                    <div className={readonlyField}>{gradeTierLabel}</div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] sm:tracking-[0.24em] text-muted-foreground">
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
                        </section>

                        <section className="rounded-2xl border border-primary/15 bg-white/70 dark:bg-slate-900/40 p-4 sm:p-5 space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] sm:tracking-[0.3em] text-muted-foreground">Today Update</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-semibold uppercase tracking-[0.18em] sm:tracking-[0.24em] text-muted-foreground">Date</label>
                                    <input
                                        type="date"
                                        className={baseField}
                                        value={formState.date}
                                        onChange={(event) => handleChange("date", event.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-semibold uppercase tracking-[0.18em] sm:tracking-[0.24em] text-muted-foreground">
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

                            {formState.performed === "no" && (
                                <div className="flex flex-col gap-3 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-900/20 border border-amber-200/40 dark:border-amber-700/30">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[11px] font-semibold uppercase tracking-[0.18em] sm:tracking-[0.24em] text-amber-700 dark:text-amber-400">
                                            Reason Not Performed
                                        </label>
                                        <select
                                            className={baseField}
                                            value={formState.skipReason}
                                            onChange={(event) => handleChange("skipReason", event.target.value)}
                                        >
                                            <option value="">Select a reason...</option>
                                            {SKIP_REASONS.map((reason) => (
                                                <option key={reason.value} value={reason.value}>{reason.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {formState.skipReason === "other" && (
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[11px] font-semibold uppercase tracking-[0.18em] sm:tracking-[0.24em] text-amber-700 dark:text-amber-400">
                                                Please specify
                                            </label>
                                            <input
                                                type="text"
                                                className={baseField}
                                                placeholder="Describe the reason..."
                                                value={formState.skipReasonNote}
                                                onChange={(event) => handleChange("skipReasonNote", event.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-semibold uppercase tracking-[0.18em] sm:tracking-[0.24em] text-muted-foreground">Status or Score</label>
                                    <div className="grid grid-cols-[1fr_auto] gap-2">
                                        <input
                                            type="number"
                                            className={baseField}
                                            placeholder="e.g. 78"
                                            value={formState.scoreValue}
                                            onChange={(event) => handleChange("scoreValue", event.target.value)}
                                        />
                                        <div className={`${readonlyField} min-w-[94px] justify-center`}>{lockedUnit}</div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-semibold uppercase tracking-[0.18em] sm:tracking-[0.24em] text-muted-foreground">Celebration Emoji</label>
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
                                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] sm:tracking-[0.24em] text-muted-foreground">Notes & Observations</label>
                                <textarea
                                    className={`${baseField} min-h-[132px] resize-y`}
                                    placeholder="Describe the student's progress, challenges, or celebrations..."
                                    value={formState.notes}
                                    onChange={(event) => handleChange("notes", event.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] sm:tracking-[0.24em] text-muted-foreground">
                                    Evidence (Photos & Documents)
                                </label>
                                <EvidenceUploader files={evidenceFiles} setFiles={setEvidenceFiles} uploading={submitting} />
                            </div>
                        </section>
                    </div>

                    <div className="shrink-0 border-t border-white/40 bg-white/90 dark:bg-slate-900/85 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:px-6 sm:py-4">
                        <div className="flex flex-col-reverse sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
                        <motion.button
                            type="submit"
                            className="w-full sm:w-auto px-5 py-3 rounded-full bg-gradient-to-r from-[#ff58c2] to-[#ffb347] text-white font-semibold shadow-[0_15px_40px_rgba(255,88,194,0.25)] disabled:opacity-60"
                            whileHover={{ scale: submitting ? 1 : 1.03 }}
                            whileTap={{ scale: submitting ? 1 : 0.97 }}
                            disabled={submitting}
                        >
                            {submitting ? "Saving..." : "Save Update"}
                        </motion.button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-5 py-3 rounded-full bg-white/80 dark:bg-white/10 text-foreground font-semibold border border-border/60 disabled:opacity-60"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        </div>
                    </div>
                </form>
            </motion.div>
            </div>
        </div>
    );
});

QuickUpdateModal.displayName = "QuickUpdateModal";
export default QuickUpdateModal;
