import React, { memo, useEffect, useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { fetchStrategies } from "@/services/mtssService";

const INTERVENTION_TYPES = [
    { label: "English", value: "english" },
    { label: "Math", value: "math" },
    { label: "Behavior", value: "behavior" },
    { label: "SEL", value: "sel" },
    { label: "Attendance", value: "attendance" },
    { label: "Universal Supports", value: "universal" },
];

const TIERS = ["Tier 1", "Tier 2", "Tier 3"];
const DURATIONS = ["4 weeks", "6 weeks", "8 weeks"];
const FREQUENCIES = ["Daily", "Weekly", "Bi-weekly"];
const METHODS = [
    "Option 1 - Direct Observation",
    "Option 2 - Student Self-Report",
    "Option 3 - Assessment Data",
];
const SCORE_UNITS = ["wpm", "%", "pts", "score"];

const InterventionFormPanel = memo(({ formState, onChange, onSubmit, baseFieldClass, textareaClass, students = [], submitting = false }) => {
    const [strategies, setStrategies] = useState([]);
    const [loadingStrategies, setLoadingStrategies] = useState(false);

    useEffect(() => {
        let mounted = true;
        setLoadingStrategies(true);
        const params = formState.type ? { type: formState.type } : {};
        fetchStrategies(params)
            .then((response) => {
                if (!mounted) return;
                setStrategies(response?.strategies || []);
            })
            .catch(() => {
                if (!mounted) return;
                setStrategies([]);
            })
            .finally(() => {
                if (mounted) {
                    setLoadingStrategies(false);
                }
            });
        return () => {
            mounted = false;
        };
    }, [formState.type]);

    const filteredStrategies = useMemo(() => {
        if (!formState.type) return strategies;
        const typeKey = formState.type.toLowerCase();
        return strategies.filter((strategy) =>
            strategy.bestFor?.some((area) => area?.toLowerCase().includes(typeKey)) ||
            strategy.tags?.some?.((tag) => tag?.toLowerCase().includes(typeKey)),
        );
    }, [formState.type, strategies]);

    const selectedStudent = useMemo(
        () => students.find((student) => student.id === formState.studentId),
        [students, formState.studentId],
    );

    const handleStudentChange = (event) => {
        const value = event.target.value;
        const student = students.find((candidate) => candidate.id === value);
        onChange("studentId", value);
        onChange("studentName", student?.name || "");
        onChange("grade", student?.grade || "");
    };

    const handleStrategyChange = (event) => {
        const strategyId = event.target.value;
        const strategy = strategies.find((item) => item._id === strategyId);
        onChange("strategyId", strategyId);
        if (strategy?.name) {
            onChange("goal", strategy.overview || formState.goal);
        }
    };

    const dualFieldClass = `${baseFieldClass} flex-1`;
    const isValid =
        Boolean(
            formState.studentId &&
            formState.type &&
            formState.tier &&
            formState.startDate &&
            formState.monitorFrequency &&
            formState.monitorMethod,
        );

    return (
        <section
            className="mtss-theme rounded-[32px] border border-white/40 bg-white/90 dark:bg-slate-900/40 shadow-[0_25px_80px_rgba(15,23,42,0.15)] p-6 space-y-6"
            data-aos="fade-up"
            data-aos-duration="700"
        >
            <header className="space-y-1" data-aos="fade-up" data-aos-delay="60">
                <p className="uppercase text-xs tracking-[0.4em] text-muted-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Plan Builder
                </p>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Set up a playful boost</h2>
                <p className="text-sm text-muted-foreground">
                    Drop a mini plan for the kids who need a little more spark this week.
                </p>
            </header>

            <form className="space-y-5" onSubmit={onSubmit}>
                <div className="grid md:grid-cols-2 gap-4" data-aos="fade-up" data-aos-delay="90">
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
                            Class Scope
                        </label>
                        <div className="px-4 py-3 rounded-2xl bg-white/70 dark:bg-white/10 border border-primary/10 text-sm text-muted-foreground">
                            {selectedStudent?.className || selectedStudent?.grade || formState.grade || "Filtered to your classes"}
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4" data-aos="fade-up" data-aos-delay="120">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                            Intervention Type
                        </label>
                        <select
                            className={baseFieldClass}
                            value={formState.type}
                            onChange={(e) => onChange("type", e.target.value)}
                        >
                            <option value="">Select type</option>
                            {INTERVENTION_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                            Tier Level
                        </label>
                        <select className={baseFieldClass} value={formState.tier} onChange={(e) => onChange("tier", e.target.value)}>
                            {TIERS.map((tier) => (
                                <option key={tier} value={tier}>
                                    {tier}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4" data-aos="fade-up" data-aos-delay="150">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                            Strategy Library
                        </label>
                        <select
                            className={baseFieldClass}
                            value={formState.strategyId || ""}
                            onChange={handleStrategyChange}
                            disabled={loadingStrategies}
                        >
                            <option value="">{loadingStrategies ? "Loading strategies..." : "Select strategy"}</option>
                            {filteredStrategies.map((strategy) => (
                                <option key={strategy._id} value={strategy._id}>
                                    {strategy.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-muted-foreground">
                            Suggestions filtered by intervention type.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                            Duration
                        </label>
                        <select className={baseFieldClass} value={formState.duration} onChange={(e) => onChange("duration", e.target.value)}>
                            <option value="">Select duration</option>
                            {DURATIONS.map((duration) => (
                                <option key={duration} value={duration}>
                                    {duration}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-2" data-aos="fade-up" data-aos-delay="170">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Goal</label>
                    <textarea
                        className={textareaClass}
                        placeholder="Describe the intervention goal..."
                        value={formState.goal}
                        onChange={(e) => onChange("goal", e.target.value)}
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-4" data-aos="fade-up" data-aos-delay="190">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                            Start Date
                        </label>
                        <input
                            type="date"
                            className={baseFieldClass}
                            value={formState.startDate}
                            onChange={(e) => onChange("startDate", e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                            Monitoring Frequency
                        </label>
                        <select
                            className={baseFieldClass}
                            value={formState.monitorFrequency}
                            onChange={(e) => onChange("monitorFrequency", e.target.value)}
                        >
                            <option value="">Select frequency</option>
                            {FREQUENCIES.map((frequency) => (
                                <option key={frequency} value={frequency}>
                                    {frequency}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4" data-aos="fade-up" data-aos-delay="210">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                            Monitoring Method
                        </label>
                        <select
                            className={baseFieldClass}
                            value={formState.monitorMethod}
                            onChange={(e) => onChange("monitorMethod", e.target.value)}
                        >
                            <option value="">Select method</option>
                            {METHODS.map((method) => (
                                <option key={method} value={method}>
                                    {method}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                            Notes
                        </label>
                        <textarea
                            className={textareaClass}
                            placeholder="Add context or reminders..."
                            value={formState.notes}
                            onChange={(e) => onChange("notes", e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4" data-aos="fade-up" data-aos-delay="230">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                            Baseline Score
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                className={dualFieldClass}
                                placeholder="e.g. 45"
                                value={formState.baselineValue}
                                onChange={(e) => onChange("baselineValue", e.target.value)}
                            />
                            <select
                                className={`${baseFieldClass} w-28`}
                                value={formState.baselineUnit}
                                onChange={(e) => onChange("baselineUnit", e.target.value)}
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
                            Target Score
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                className={dualFieldClass}
                                placeholder="e.g. 70"
                                value={formState.targetValue}
                                onChange={(e) => onChange("targetValue", e.target.value)}
                            />
                            <select
                                className={`${baseFieldClass} w-28`}
                                value={formState.targetUnit}
                                onChange={(e) => onChange("targetUnit", e.target.value)}
                            >
                                {SCORE_UNITS.map((unit) => (
                                    <option key={unit} value={unit}>
                                        {unit}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-3" data-aos="fade-up" data-aos-delay="260">
                    <button
                        type="submit"
                        disabled={!isValid || submitting}
                        className={`inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-[#ff58c2] to-[#ffb347] text-white font-semibold shadow-[0_15px_40px_rgba(255,88,194,0.25)] transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {submitting ? "Saving..." : "Save Intervention Plan"}
                    </button>
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/90 dark:bg-white/10 text-foreground font-semibold border border-border/60"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </section>
    );
});

InterventionFormPanel.displayName = "InterventionFormPanel";
export default InterventionFormPanel;


