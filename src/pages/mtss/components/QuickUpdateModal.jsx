import React, { memo, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const baseField = "px-4 py-3 rounded-2xl bg-surface border border-border/60 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent transition-all w-full";

const QuickUpdateModal = memo(({ student, onClose, onSubmit }) => {
    const initialDate = useMemo(() => new Date().toISOString().split("T")[0], []);
    const [formState, setFormState] = useState({
        date: initialDate,
        performed: "yes",
        score: "",
        notes: "",
        badge: "🌈 Progress Party",
    });

    if (!student) return null;

    const handleChange = (field, value) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.(student, formState);
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl glass glass-card rounded-[28px] overflow-hidden"
            >
                <div className="bg-gradient-to-r from-[#34d399]/70 to-[#22d3ee]/70 text-white p-5 flex items-center justify-between">
                    <div>
                        <p className="uppercase text-xs tracking-[0.4em] opacity-80">Quick Update</p>
                        <h3 className="text-2xl font-bold">{student.name}</h3>
                        <p className="text-sm opacity-90">Share today’s check-in and celebrations</p>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="p-2 bg-white/30 rounded-full hover:bg-white/50 transition">
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
                                onChange={(e) => handleChange("date", e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Intervention Performed?</label>
                            <select
                                className={baseField}
                                value={formState.performed}
                                onChange={(e) => handleChange("performed", e.target.value)}
                            >
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Status or Score</label>
                            <input
                                type="text"
                                className={baseField}
                                placeholder="e.g. 78 wpm"
                                value={formState.score}
                                onChange={(e) => handleChange("score", e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Celebration emoji</label>
                            <select
                                className={baseField}
                                value={formState.badge || "🌈 Progress Party"}
                                onChange={(e) => handleChange("badge", e.target.value)}
                            >
                                <option value="🌈 Progress Party">🌈 Progress Party</option>
                                <option value="⭐ Stellar Boost">⭐ Stellar Boost</option>
                                <option value="🎯 Focus Mode">🎯 Focus Mode</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Notes & Observations</label>
                        <textarea
                            className={`${baseField} min-h-[120px]`}
                            placeholder="Describe the student's progress, challenges, or celebrations..."
                            value={formState.notes}
                            onChange={(e) => handleChange("notes", e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                        <motion.button
                            type="submit"
                            className="px-5 py-3 rounded-full bg-primary text-white font-semibold shadow-glass-md"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            Save Update
                        </motion.button>
                        <button type="button" onClick={onClose} className="px-5 py-3 rounded-full bg-muted text-foreground font-semibold">
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
