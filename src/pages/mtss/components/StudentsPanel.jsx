import { memo, useMemo, useState, useCallback, useDeferredValue, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import StudentsTable from "./StudentsTable";
import QuickUpdateModal from "./QuickUpdateModal";
import KindergartenWeeklyFocusOverview from "./KindergartenWeeklyFocusOverview";
import { updateMentorAssignment, uploadEvidence } from "@/services/mtssService";
import { canUserSubmitProgressForAssignment } from "../utils/editPlanAccess";
import { ensureStudentInterventions, getMostCriticalForDisplay } from "../utils/interventionUtils";
import { FilterBar, RosterHeader, LoadMore, STUDENTS_PANEL_BATCH } from "./StudentsPanelParts";

const StudentsPanel = memo(({ students, TierPill, ProgressBadge, onRefresh, onEditPlan, canEditPlanForStudent }) => {
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
        async (student, formState, evidenceFiles = []) => {
            const assignmentId = formState?.assignmentId || student?.assignmentId;
            if (!assignmentId) {
                toast({
                    title: "No active intervention",
                    description: `${student?.name || "Student"} isn't linked to an active intervention yet.`,
                    variant: "destructive",
                });
                return;
            }
            const selectedOption = Array.isArray(student?.assignmentOptions)
                ? student.assignmentOptions.find((option) => option?.assignmentId === assignmentId)
                : null;
            if (!canUserSubmitProgressForAssignment(selectedOption)) {
                toast({
                    title: "Progress permission denied",
                    description: "You can only submit progress for subjects assigned to you.",
                    variant: "destructive",
                });
                return;
            }
            setSavingUpdate(true);
            try {
                let evidencePayload;
                if (evidenceFiles.length > 0) {
                    const rawFiles = evidenceFiles.map((f) => f.file);
                    const uploadResult = await uploadEvidence(rawFiles);
                    evidencePayload = uploadResult?.data?.evidence;
                }

                const isKindergarten = /kindergarten/i.test(student?.grade || student?.currentGrade || "");
                const trimmedNotes = formState.notes?.trim() || "";
                const parsedScoreValue = formState.scoreValue !== "" ? Number(formState.scoreValue) : undefined;

                // Build CORN summary for Kindergarten if notes is empty
                const kgSummary = isKindergarten
                    ? [
                        formState.observation?.trim(),
                        formState.nextStep?.trim() ? `Next: ${formState.nextStep.trim()}` : null,
                    ].filter(Boolean).join(" | ") || trimmedNotes || "Observation recorded"
                    : trimmedNotes || "Quick update";

                await updateMentorAssignment(assignmentId, {
                    ...(isKindergarten && { mode: "qualitative" }),
                    checkIns: [
                        {
                            date: formState.date,
                            summary: isKindergarten ? kgSummary : (trimmedNotes || "Quick update"),
                            nextSteps: !isKindergarten ? (trimmedNotes || undefined) : undefined,
                            value: !isKindergarten && Number.isFinite(parsedScoreValue) ? parsedScoreValue : undefined,
                            unit: !isKindergarten ? formState.scoreUnit : undefined,
                            performed: true,
                            skipReason: !isKindergarten && formState.performed !== "yes" ? (formState.skipReason || undefined) : undefined,
                            skipReasonNote: !isKindergarten && formState.performed !== "yes" && formState.skipReason === "other" ? (formState.skipReasonNote || undefined) : undefined,
                            celebration: !isKindergarten ? formState.badge : undefined,
                            // Qualitative fields
                            signal: isKindergarten && formState.signal ? formState.signal : undefined,
                            tags: isKindergarten && formState.tags?.length ? formState.tags : undefined,
                            context: isKindergarten && formState.context?.trim() ? formState.context.trim() : undefined,
                            observation: isKindergarten && formState.observation?.trim() ? formState.observation.trim() : undefined,
                            response: isKindergarten && formState.response?.trim() ? formState.response.trim() : undefined,
                            nextStep: isKindergarten && formState.nextStep?.trim() ? formState.nextStep.trim() : undefined,
                            weeklyFocus: isKindergarten && formState.weeklyFocus ? formState.weeklyFocus : undefined,
                            evidence: evidencePayload?.length ? evidencePayload : undefined,
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
            <KindergartenWeeklyFocusOverview students={filteredStudents} />

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
                        onEditPlan={onEditPlan}
                        canEditPlanForStudent={canEditPlanForStudent}
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
