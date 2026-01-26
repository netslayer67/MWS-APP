import React, { memo, useEffect, useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { fetchStrategies } from "@/services/mtssService";
import { filterStrategiesByType, validateInterventionForm } from "../config/interventionFormConfig";
import InterventionFormFields from "./InterventionFormFields";

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
                if (mounted) setLoadingStrategies(false);
            });
        return () => { mounted = false; };
    }, [formState.type]);

    const filteredStrategies = useMemo(
        () => filterStrategiesByType(strategies, formState.type),
        [formState.type, strategies]
    );

    const selectedStudent = useMemo(
        () => students.find((student) => student.id === formState.studentId || student._id === formState.studentId),
        [students, formState.studentId]
    );

    const handleStudentChange = (event) => {
        const value = event.target.value;
        const student = students.find((candidate) => candidate.id === value || candidate._id === value);
        onChange("studentId", value);
        onChange("studentName", student?.name || "");
        onChange("grade", student?.grade || student?.currentGrade || "");
        onChange("className", student?.className || "");
    };

    const handleStrategyChange = (event) => {
        const strategyId = event.target.value;
        const strategy = strategies.find((item) => item._id === strategyId);
        onChange("strategyId", strategyId);
        onChange("strategyName", strategy?.name || "");
        if (strategy?.name && !formState.goal) {
            onChange("goal", strategy.overview || "");
        }
    };

    const isValid = validateInterventionForm(formState);

    return (
        <section
            className="mtss-theme relative overflow-hidden rounded-[36px] border border-white/50 dark:border-white/10 bg-white/75 dark:bg-slate-900/50 shadow-[0_30px_90px_rgba(15,23,42,0.18)] p-6 sm:p-8 space-y-6 backdrop-blur-2xl"
            data-aos="fade-up"
            data-aos-duration="700"
        >
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 -left-10 h-56 w-56 bg-gradient-to-br from-[#f472b6]/25 via-[#60a5fa]/20 to-transparent blur-[120px]" />
                <div className="absolute -bottom-16 right-0 h-64 w-64 bg-gradient-to-br from-[#22d3ee]/20 via-[#a855f7]/15 to-transparent blur-[140px]" />
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_transparent_60%)] dark:opacity-20" />
            </div>
            <div className="relative space-y-6">
                <header className="space-y-2" data-aos="fade-up" data-aos-delay="60">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-white/10 border border-white/60 dark:border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-slate-600 dark:text-slate-200">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Plan Builder
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black leading-tight bg-gradient-to-r from-[#0f172a] via-[#334155] to-[#2563eb] dark:from-white dark:via-[#c7d2fe] dark:to-[#f472b6] text-transparent bg-clip-text">
                        Set up a playful boost
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-200 max-w-2xl">
                        Drop a mini plan for the kids who need a little more spark this week.
                    </p>
                </header>

                <form className="space-y-5" onSubmit={onSubmit}>
                <InterventionFormFields
                    formState={formState}
                    onChange={onChange}
                    students={students}
                    selectedStudent={selectedStudent}
                    strategies={strategies}
                    filteredStrategies={filteredStrategies}
                    loadingStrategies={loadingStrategies}
                    baseFieldClass={baseFieldClass}
                    textareaClass={textareaClass}
                    onStudentChange={handleStudentChange}
                    onStrategyChange={handleStrategyChange}
                />

                <div className="flex flex-wrap gap-3 pt-3" data-aos="fade-up" data-aos-delay="260">
                    <button
                        type="submit"
                        disabled={!isValid || submitting}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-[#22d3ee] via-[#3b82f6] to-[#a855f7] text-white font-semibold shadow-[0_18px_45px_rgba(59,130,246,0.3)] transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {submitting ? "Saving..." : "Save Intervention Plan"}
                    </button>
                </div>
            </form>
            </div>
        </section>
    );
});

InterventionFormPanel.displayName = "InterventionFormPanel";
export default InterventionFormPanel;
