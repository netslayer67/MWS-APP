import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { Search, Users, Sparkles, Shuffle, Filter } from "lucide-react";
import StudentsTable from "../components/StudentsTable";
import { TierPill, ProgressBadge } from "../components/StatusPills";
import AdminAssignmentModal from "./AdminAssignmentModal";

const BATCH_SIZE = 10;

const AdminStudentsPanel = ({
    filters,
    onFilterChange,
    gradeOptions,
    tierOptions,
    typeOptions,
    mentorOptions,
    filteredStudents,
    allStudents,
    onViewStudent,
    onUpdateStudent,
    selectedIds,
    onToggleSelect,
    onResetSelection,
    mentorDirectory,
    onRefresh,
}) => {
    const [assignmentOpen, setAssignmentOpen] = useState(false);
    const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
    const loadMoreRef = useRef(null);

    const selectedStudents = useMemo(() => {
        if (!selectedIds?.length) return [];
        return allStudents.filter((student) => selectedIds.includes(student.id || student._id));
    }, [selectedIds, allStudents]);

    useEffect(() => {
        setVisibleCount(BATCH_SIZE);
    }, [filteredStudents]);

    useEffect(() => {
        if (!loadMoreRef.current) return;
        const sentinel = loadMoreRef.current;
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting) {
                    setVisibleCount((prev) => {
                        if (prev >= filteredStudents.length) return prev;
                        return Math.min(filteredStudents.length, prev + BATCH_SIZE);
                    });
                }
            },
            { threshold: 0.4 },
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [filteredStudents.length]);

    const visibleStudents = useMemo(
        () => filteredStudents.slice(0, Math.min(visibleCount, filteredStudents.length)),
        [filteredStudents, visibleCount],
    );
    const hasMoreStudents = visibleStudents.length < filteredStudents.length;

    const filterClass =
        "w-full px-4 py-3 rounded-2xl bg-white/80 dark:bg-white/10 border border-white/60 dark:border-white/10 text-sm text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner shadow-white/40 dark:shadow-none";

    const renderSelect = (value, options, field, labelFn, animation) => (
        <div
            data-aos={animation?.variant || "fade-up"}
            data-aos-delay={animation?.delay || 0}
            data-aos-duration="650"
            data-aos-easing="ease-out-cubic"
        >
            <select className={filterClass} value={value} onChange={(event) => onFilterChange(field, event.target.value)}>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {labelFn(option)}
                    </option>
                ))}
            </select>
        </div>
    );

    const disableAssignment = selectedStudents.length < 2 || mentorDirectory.length === 0;

    return (
        <div className="space-y-6">
            <div
                className="glass glass-card mtss-card-surface p-6 rounded-[36px] border border-white/20 bg-gradient-to-br from-[#ecfeff]/90 via-[#fef9c3]/80 to-[#fce7f3]/85 dark:from-white/5 dark:via-white/10 dark:to-white/5 backdrop-blur-2xl"
                data-aos="fade-up"
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div className="space-y-1" data-aos="fade-right" data-aos-duration="700">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 dark:bg-white/10 border border-white/60 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-white">
                            <Filter className="w-3.5 h-3.5" />
                            Smart filters
                        </div>
                        <p className="text-sm text-muted-foreground dark:text-white/60">
                            Blend grade, tier, and mentor filters to spot caseload gaps instantly.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600 dark:text-white/70" data-aos="fade-left">
                        <span className="px-3 py-1 rounded-full bg-white/80 dark:bg-white/5 border border-white/60 dark:border-white/20 backdrop-blur">
                            {filteredStudents.length} matches
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/80 dark:bg-white/5 border border-white/60 dark:border-white/20 backdrop-blur">
                            {allStudents.length} total roster
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/80 dark:bg-white/5 border border-white/60 dark:border-white/20 backdrop-blur flex items-center gap-1">
                            <Shuffle className="w-4 h-4" />
                            auto-sort ready
                        </span>
                    </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-5">
                    {renderSelect(filters.grade, gradeOptions, "grade", (value) => (value === "all" ? "All Grades" : value), {
                        variant: "fade-up-right",
                        delay: 80,
                    })}
                    {renderSelect(filters.tier, tierOptions, "tier", (value) => (value === "all" ? "All Tiers" : value), {
                        variant: "fade-up",
                        delay: 120,
                    })}
                    {renderSelect(filters.type, typeOptions, "type", (value) => (value === "all" ? "All Types" : value), {
                        variant: "fade-up-left",
                        delay: 160,
                    })}
                    {renderSelect(filters.mentor, mentorOptions, "mentor", (value) => (value === "all" ? "All Mentors" : value), {
                        variant: "zoom-in-up",
                        delay: 200,
                    })}
                    <div
                        className="relative"
                        data-aos="fade-down"
                        data-aos-delay="220"
                        data-aos-duration="650"
                        data-aos-easing="ease-out-quart"
                    >
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                        <input
                            type="text"
                            className={`${filterClass} pl-10`}
                            placeholder="Search students"
                            value={filters.query}
                            onChange={(event) => onFilterChange("query", event.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div
                className="glass glass-card mtss-card-surface p-6 rounded-[36px] border border-white/20 bg-gradient-to-br from-white/90 via-white/70 to-white/60 dark:from-white/10 dark:via-white/5 dark:to-white/5 backdrop-blur-2xl"
                data-aos="fade-up"
                data-aos-delay="120"
            >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                    <div className="space-y-1" data-aos="fade-right" data-aos-delay="150">
                        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Roster</p>
                        <h3 className="text-2xl font-black text-foreground dark:text-white bg-gradient-to-r from-[#0ea5e9] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent">
                            All students in MTSS
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-xl">
                            Highlight tiers, next updates, and progress streaks so principals can triage faster.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end" data-aos="fade-left" data-aos-delay="180">
                        <div className="flex items-center gap-3 w-full sm:w-auto px-4 py-2 rounded-2xl bg-gradient-to-r from-white/90 via-white/70 to-white/50 dark:from-white/10 dark:via-white/5 dark:to-white/0 border border-white/60 dark:border-white/10 shadow-inner shadow-white/40 dark:shadow-none">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f472b6] to-[#facc15] dark:from-[#1d4ed8] dark:to-[#a855f7] text-white flex items-center justify-center shadow-lg shadow-rose-200/60 dark:shadow-none">
                                <Users className="w-4 h-4" />
                            </div>
                            <div className="text-sm font-semibold leading-tight text-slate-700 dark:text-white">
                                <span className="block">{selectedStudents.length} selected</span>
                                <span className="text-xs font-normal text-slate-500 dark:text-white/60">
                                    {mentorDirectory.length} mentors available
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                onClick={onResetSelection}
                                disabled={selectedStudents.length === 0}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-full border text-sm font-semibold transition ${selectedStudents.length === 0
                                        ? "border-white/40 dark:border-white/10 text-slate-400 dark:text-white/30 cursor-not-allowed"
                                        : "border-white/70 dark:border-white/30 text-foreground dark:text-white bg-white/80 dark:bg-white/5 shadow-inner hover:-translate-y-0.5"
                                    }`}
                            >
                                Clear selection
                            </button>
                            <button
                                disabled={disableAssignment}
                                onClick={() => setAssignmentOpen(true)}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-full text-sm font-semibold text-white flex items-center justify-center gap-2 transition ${disableAssignment
                                        ? "bg-gradient-to-r from-slate-200 to-slate-100 dark:from-white/10 dark:to-white/5 text-slate-400 dark:text-white/40 cursor-not-allowed"
                                        : "bg-gradient-to-r from-[#34d399] via-[#3b82f6] to-[#a855f7] shadow-lg shadow-primary/30 hover:-translate-y-0.5"
                                    }`}
                            >
                                <Sparkles className="w-4 h-4" />
                                Assign Selected
                            </button>
                        </div>
                    </div>
                </div>
                <StudentsTable
                    students={visibleStudents}
                    TierPill={TierPill}
                    ProgressBadge={ProgressBadge}
                    showActions
                    onView={onViewStudent}
                    onUpdate={onUpdateStudent}
                    selectable
                    selectedIds={selectedIds}
                    onSelect={onToggleSelect}
                />
                <div
                    ref={loadMoreRef}
                    className="mt-6 flex flex-col items-center gap-2 text-xs font-semibold text-muted-foreground"
                    data-aos="fade-up"
                    data-aos-delay="200"
                >
                    <span>
                        Showing {visibleStudents.length} of {filteredStudents.length} students
                    </span>
                    {hasMoreStudents ? (
                        <span className="px-3 py-1 rounded-full border border-white/50 dark:border-white/20 bg-white/70 dark:bg-white/5 text-[0.7rem] uppercase tracking-[0.3em]">
                            Scroll to load more
                        </span>
                    ) : (
                        <span className="px-3 py-1 rounded-full border border-emerald-200/50 bg-emerald-50 text-emerald-500 text-[0.7rem] uppercase tracking-[0.3em]">
                            All caught up
                        </span>
                    )}
                </div>
            </div>

            {assignmentOpen && (
                <AdminAssignmentModal
                    open={assignmentOpen}
                    onClose={() => setAssignmentOpen(false)}
                    students={selectedStudents}
                    mentors={mentorDirectory}
                    onAssigned={() => {
                        onResetSelection();
                        setAssignmentOpen(false);
                        onRefresh?.();
                    }}
                />
            )}
        </div>
    );
};

AdminStudentsPanel.displayName = "AdminStudentsPanel";
export default memo(AdminStudentsPanel);
