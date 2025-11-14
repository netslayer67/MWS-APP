import React, { memo } from "react";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";

const grades = ["Grade 4", "Grade 5", "Grade 6"];
const interventionTypes = ["Literacy", "Numeracy", "Behavior"];
const tiers = ["Tier 1", "Tier 2", "Tier 3"];
const durations = ["4 weeks", "6 weeks", "8 weeks"];
const frequencies = ["Daily", "Weekly", "Bi-weekly"];
const methods = ["Observation", "Assessment", "Conference"];

const InterventionFormPanel = memo(({ formState, onChange, onSubmit, baseFieldClass, textareaClass }) => (
    <motion.section
        className="mtss-theme glass glass-card mtss-card-surface p-6 space-y-6 border border-primary/15"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
        <header>
            <p className="uppercase text-xs tracking-[0.4em] text-muted-foreground">Plan Builder</p>
            <h2 className="text-2xl font-bold text-foreground dark:text-white">Set up a playful boost</h2>
        </header>

        <form className="space-y-5" onSubmit={onSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Student Name</label>
                    <input
                        type="text"
                        className={baseFieldClass}
                        placeholder="Enter student name"
                        value={formState.studentName}
                        onChange={(e) => onChange("studentName", e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Grade</label>
                    <select
                        className={baseFieldClass}
                        value={formState.grade}
                        onChange={(e) => onChange("grade", e.target.value)}
                    >
                        <option value="">Select grade</option>
                        {grades.map((grade) => <option key={grade} value={grade.split(" ")[1]}>{grade}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Intervention Type</label>
                    <select
                        className={baseFieldClass}
                        value={formState.type}
                        onChange={(e) => onChange("type", e.target.value)}
                    >
                        <option value="">Select type</option>
                        {interventionTypes.map((type) => <option key={type} value={type.toLowerCase()}>{type}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Tier Level</label>
                    <select
                        className={baseFieldClass}
                        value={formState.tier}
                        onChange={(e) => onChange("tier", e.target.value)}
                    >
                        {tiers.map((tier) => <option key={tier} value={tier}>{tier}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Goal</label>
                <textarea
                    className={textareaClass}
                    placeholder="Describe the intervention goal..."
                    value={formState.goal}
                    onChange={(e) => onChange("goal", e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Intervention Strategy</label>
                <textarea
                    className={textareaClass}
                    placeholder="Enter strategy details..."
                    value={formState.strategy}
                    onChange={(e) => onChange("strategy", e.target.value)}
                />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Start Date</label>
                    <input
                        type="date"
                        className={baseFieldClass}
                        value={formState.startDate}
                        onChange={(e) => onChange("startDate", e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Duration</label>
                    <select
                        className={baseFieldClass}
                        value={formState.duration}
                        onChange={(e) => onChange("duration", e.target.value)}
                    >
                        <option value="">Select duration</option>
                        {durations.map((duration) => <option key={duration} value={duration}>{duration}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Monitoring Frequency</label>
                    <select
                        className={baseFieldClass}
                        value={formState.monitorFrequency}
                        onChange={(e) => onChange("monitorFrequency", e.target.value)}
                    >
                        <option value="">Select frequency</option>
                        {frequencies.map((frequency) => <option key={frequency} value={frequency}>{frequency}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Monitoring Method</label>
                    <select
                        className={baseFieldClass}
                        value={formState.monitorMethod}
                        onChange={(e) => onChange("monitorMethod", e.target.value)}
                    >
                        <option value="">Select method</option>
                        {methods.map((method) => <option key={method} value={method}>{method}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Baseline Score</label>
                    <input
                        type="number"
                        className={baseFieldClass}
                        placeholder="e.g. 45 wpm"
                        value={formState.baseline}
                        onChange={(e) => onChange("baseline", e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Target Score</label>
                    <input
                        type="number"
                        className={baseFieldClass}
                        placeholder="e.g. 70 wpm"
                        value={formState.target}
                        onChange={(e) => onChange("target", e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-3">
                <motion.button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-[#ff58c2] to-[#ffb347] text-white font-semibold shadow-[0_15px_40px_rgba(255,88,194,0.25)]"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <PlusCircle className="w-4 h-4" />
                    Save Intervention Plan
                </motion.button>
                <button type="button" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-muted text-foreground font-semibold">
                    Cancel
                </button>
            </div>
        </form>
    </motion.section>
));

InterventionFormPanel.displayName = "InterventionFormPanel";
export default InterventionFormPanel;
