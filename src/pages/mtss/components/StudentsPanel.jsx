import React, { memo, useMemo, useState, useCallback, useDeferredValue, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import StudentsTable from "./StudentsTable";
import QuickUpdateModal from "./QuickUpdateModal";
import { updateMentorAssignment } from "@/services/mtssService";
import { ensureStudentInterventions, getMostCriticalForDisplay } from "../utils/interventionUtils";
import { FilterBar, RosterHeader, LoadMore, STUDENTS_PANEL_BATCH } from "./StudentsPanelParts";

const StudentsPanel = memo(({ students, TierPill, ProgressBadge, onRefresh }) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [activeTier, setActiveTier] = useState("All");
    const [query, setQuery] = useState("");
    const [modalState, setModalState] = useState({ type: null, student: null });
    const [savingUpdate, setSavingUpdate] = useState(false);
    const [visibleCount, setVisibleCount] = useState(STUDENTS_PANEL_BATCH);

    const deferredQuery = useDeferredValue(query.trim().toLowerCase());

    const filteredStudents = useMemo(() =>
        students.filter((student) => {
            const interventions = ensureStudentInterventions(student.interventions);
            const criticalInfo = getMostCriticalForDisplay(interventions, student.profile, student);
            const tierLabel = criticalInfo?.tier || student.tier;
            const matchesTier = activeTier === "All" || tierLabel === activeTier;
            if (!deferredQuery) return matchesTier;
            const chipLabels = interventions.map((entry) => entry.label).join(" ");
            const searchPool = `${student.name} ${student.type || ""} ${student.grade || ""} ${student.className || ""} ${criticalInfo?.label || ""} ${chipLabels}`.toLowerCase();
            return matchesTier && searchPool.includes(deferredQuery);
        }),
    [students, activeTier, deferredQuery]);

    const visibleStudents = useMemo(
        () => filteredStudents.slice(0, Math.min(visibleCount, filteredStudents.length)),
        [filteredStudents, visibleCount],
    );

    useEffect(() => {
        setVisibleCount(STUDENTS_PANEL_BATCH);
    }, [activeTier, deferredQuery, students.length]);

    const handleView = useCallback(
        (student) => {
            navigate(`/mtss/student/${student.slug}`);
        },
        [navigate],
    );

    const handleOpen = useCallback((type, student) => setModalState({ type, student }), []);
    const handleClose = useCallback(() => setModalState({ type: null, student: null }), []);

    const handleQuickSubmit = useCallback(
        async (student, formState) => {
            const assignmentId = formState?.assignmentId || student?.assignmentId;
            if (!assignmentId) {
                toast({
                    title: "No active intervention",
                    description: `${student?.name || "Student"} isn't linked to an active intervention yet.`,
                    variant: "destructive",
                });
                return;
            }
            setSavingUpdate(true);
            try {
                const trimmedNotes = formState.notes?.trim() || "";
                const parsedScoreValue = formState.scoreValue !== "" ? Number(formState.scoreValue) : undefined;
                await updateMentorAssignment(assignmentId, {
                    checkIns: [
                        {
                            date: formState.date,
                            summary: trimmedNotes || "Quick update",
                            nextSteps: trimmedNotes || undefined,
                            value: Number.isFinite(parsedScoreValue) ? parsedScoreValue : undefined,
                            unit: formState.scoreUnit,
                            performed: formState.performed === "yes",
                            celebration: formState.badge,
                        },
                    ],
                });
                toast({
                    title: "Progress update saved",
                    description: `${student.name}'s update was recorded!`,
                });
                handleClose();
                onRefresh?.();
            } catch (error) {
                toast({
                    title: "Failed to save update",
                    description: error?.response?.data?.message || error.message || "Please try again in a moment.",
                    variant: "destructive",
                });
            } finally {
                setSavingUpdate(false);
            }
        },
        [toast, handleClose, onRefresh],
    );

    return (
        <div className="space-y-6 mtss-theme">
            <FilterBar activeTier={activeTier} setActiveTier={setActiveTier} query={query} setQuery={setQuery} />

            <section
                className="rounded-[32px] border border-white/40 bg-white/95 dark:bg-slate-900/40 p-6 space-y-4 shadow-[0_14px_48px_rgba(15,23,42,0.14)]"
                data-aos="fade-up"
                data-aos-delay="80"
            >
                <RosterHeader visible={visibleStudents.length} total={filteredStudents.length} />

                <div data-aos="fade-up" data-aos-delay="120">
                    <StudentsTable
                        students={visibleStudents}
                        TierPill={TierPill}
                        ProgressBadge={ProgressBadge}
                        showActions
                        onView={handleView}
                        onUpdate={(student) => handleOpen("update", student)}
                    />
                </div>

                <LoadMore
                    visible={visibleStudents.length}
                    total={filteredStudents.length}
                    onLoadMore={() => setVisibleCount((prev) => Math.min(filteredStudents.length, prev + STUDENTS_PANEL_BATCH))}
                />
            </section>

            {modalState.type === "update" && (
                <QuickUpdateModal
                    student={modalState.student}
                    onClose={handleClose}
                    onSubmit={handleQuickSubmit}
                    submitting={savingUpdate}
                />
            )}
        </div>
    );
});

StudentsPanel.displayName = "StudentsPanel";
export default StudentsPanel;
