import React, { memo, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const baseField =
    "px-4 py-3 rounded-2xl bg-white/80 dark:bg-white/10 border border-primary/20 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all w-full";
const SCORE_UNITS = ["wpm", "%", "pts", "score"];

const QuickUpdateModal = memo(({ student, onClose, onSubmit, submitting = false }) => {
    const initialDate = useMemo(() => new Date().toISOString().split("T")[0], []);
    const [formState, setFormState] = useState({
        date: initialDate,
        performed: "yes",
        scoreValue: "",
        scoreUnit: "score",
        notes: "",
        badge: "🎉 Progress Party",
    });

    if (!student) return null;

    const handleChange = (field, value) => {
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
                                <select
                                    className={`${baseField} w-28`}
                                    value={formState.scoreUnit}
                                    onChange={(event) => handleChange("scoreUnit", event.target.value)}
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
