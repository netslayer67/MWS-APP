import React, { memo, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import StudentsTable from "../components/StudentsTable";
import { TierPill, ProgressBadge } from "../components/StatusPills";
import AdminAssignmentModal from "./AdminAssignmentModal";

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
    const selectedStudents = useMemo(() => {
        if (!selectedIds?.length) return [];
        return allStudents.filter((student) => selectedIds.includes(student.id || student._id));
    }, [selectedIds, allStudents]);

    const filterClass =
        "px-4 py-3 rounded-2xl bg-white/70 dark:bg-white/10 border border-white/40 dark:border-white/10 text-sm text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40";

    const renderSelect = (value, options, field, labelFn) => (
        <select className={filterClass} value={value} onChange={(event) => onFilterChange(field, event.target.value)}>
            {options.map((option) => (
                <option key={option} value={option}>
                    {labelFn(option)}
                </option>
            ))}
        </select>
    );

    const disableAssignment = selectedStudents.length < 2 || mentorDirectory.length === 0;

    return (
        <div className="space-y-6">
            <div className="glass glass-card mtss-card-surface p-6 rounded-[36px]" data-aos="fade-up">
                <div className="grid gap-4 lg:grid-cols-5">
                    {renderSelect(filters.grade, gradeOptions, "grade", (value) => (value === "all" ? "All Grades" : value))}
                    {renderSelect(filters.tier, tierOptions, "tier", (value) => (value === "all" ? "All Tiers" : value))}
                    {renderSelect(filters.type, typeOptions, "type", (value) => (value === "all" ? "All Types" : value))}
                    {renderSelect(filters.mentor, mentorOptions, "mentor", (value) => (value === "all" ? "All Mentors" : value))}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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

            <div className="glass glass-card mtss-card-surface p-6 rounded-[36px]" data-aos="fade-up" data-aos-delay="150">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Roster</p>
                        <h3 className="text-xl font-black text-foreground dark:text-white">All students in MTSS</h3>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            <span>
                                {selectedStudents.length} selected &middot; {mentorDirectory.length} mentors available
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedStudents.length > 0 && (
                                <button
                                    onClick={onResetSelection}
                                    className="px-4 py-2 rounded-full border border-border/60 text-sm font-semibold text-foreground dark:text-white hover:bg-white/70 dark:hover:bg-white/10 transition"
                                >
                                    Clear selection
                                </button>
                            )}
                            <button
                                disabled={disableAssignment}
                                onClick={() => setAssignmentOpen(true)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold text-white shadow ${
                                    disableAssignment
                                        ? "bg-muted cursor-not-allowed opacity-60"
                                        : "bg-gradient-to-r from-[#7dd3fc] to-[#60a5fa] hover:-translate-y-0.5 transition"
                                }`}
                            >
                                Assign Selected
                            </button>
                        </div>
                    </div>
                </div>
                <StudentsTable
                    students={filteredStudents}
                    TierPill={TierPill}
                    ProgressBadge={ProgressBadge}
                    showActions
                    onView={onViewStudent}
                    onUpdate={onUpdateStudent}
                    selectable
                    selectedIds={selectedIds}
                    onSelect={onToggleSelect}
                />
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
