import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import AdminAssignmentModal from "./AdminAssignmentModal";
import AdminStudentsFilters from "./components/AdminStudentsFilters";
import AdminStudentsRoster from "./components/AdminStudentsRoster";

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
    const disableAssignment = selectedStudents.length < 2 || mentorDirectory.length === 0;

    return (
        <div className="space-y-6">
            <AdminStudentsFilters
                filters={filters}
                onFilterChange={onFilterChange}
                gradeOptions={gradeOptions}
                tierOptions={tierOptions}
                typeOptions={typeOptions}
                mentorOptions={mentorOptions}
                filteredCount={filteredStudents.length}
                totalCount={allStudents.length}
            />

            <AdminStudentsRoster
                visibleStudents={visibleStudents}
                filteredCount={filteredStudents.length}
                selectedCount={selectedStudents.length}
                mentorCount={mentorDirectory.length}
                onResetSelection={onResetSelection}
                onOpenAssign={() => setAssignmentOpen(true)}
                disableAssignment={disableAssignment}
                selectedIds={selectedIds}
                onToggleSelect={onToggleSelect}
                onViewStudent={onViewStudent}
                onUpdateStudent={onUpdateStudent}
                loadMoreRef={loadMoreRef}
                hasMoreStudents={hasMoreStudents}
            />

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
