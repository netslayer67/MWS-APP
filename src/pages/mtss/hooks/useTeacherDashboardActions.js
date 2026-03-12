import { useCallback } from "react";
import { updateMentorAssignment, uploadEvidence } from "@/services/mtssService";
import { canUserSubmitProgressForAssignment } from "../utils/editPlanAccess";

const useTeacherDashboardActions = ({
    students,
    progressForm,
    resetProgressForm,
    refresh,
    setSubmittingProgress,
    toast,
    setSavingQuickUpdate,
    onCloseQuickUpdate,
}) => {
    const handleProgressSubmitForm = useCallback(
        async (event) => {
            event.preventDefault();
            if (!progressForm.studentId || !progressForm.date || progressForm.scoreValue === "") {
                toast({
                    title: "Complete the required fields",
                    description: "Student, date, and score are required to submit progress.",
                    variant: "destructive",
                });
                return;
            }
            const selectedStudent = students.find((student) => student.id === progressForm.studentId);
            if (!selectedStudent) {
                toast({
                    title: "Select a student",
                    description: "Choose a student before logging progress.",
                    variant: "destructive",
                });
                return;
            }
            const assignmentId = progressForm.assignmentId || selectedStudent.assignmentId;
            if (!assignmentId) {
                toast({
                    title: "No active intervention",
                    description: `${selectedStudent.name} is not linked to an active intervention yet.`,
                    variant: "destructive",
                });
                return;
            }
            const selectedOption = Array.isArray(selectedStudent.assignmentOptions)
                ? selectedStudent.assignmentOptions.find((option) => option?.assignmentId === assignmentId)
                : null;
            if (!canUserSubmitProgressForAssignment(selectedOption)) {
                toast({
                    title: "Progress permission denied",
                    description: "You can only submit progress for subjects assigned to you.",
                    variant: "destructive",
                });
                return;
            }
            try {
                const trimmedNotes = progressForm.notes?.trim() || "";
                const parsedScoreValue = progressForm.scoreValue !== "" ? Number(progressForm.scoreValue) : undefined;
                setSubmittingProgress(true);
                await updateMentorAssignment(assignmentId, {
                    checkIns: [
                        {
                            date: progressForm.date || new Date(),
                            summary: trimmedNotes || "Progress update logged via dashboard",
                            nextSteps: trimmedNotes || undefined,
                            value: Number.isFinite(parsedScoreValue) ? parsedScoreValue : undefined,
                            unit: progressForm.scoreUnit,
                            performed: progressForm.performed === "yes",
                            skipReason: progressForm.performed !== "yes" ? (progressForm.skipReason || undefined) : undefined,
                            skipReasonNote: progressForm.performed !== "yes" && progressForm.skipReason === "other" ? (progressForm.skipReasonNote || undefined) : undefined,
                        },
                    ],
                });
                toast({
                    title: "Progress saved",
                    description: `${selectedStudent.name}'s update is now on the dashboard.`,
                });
                resetProgressForm();
                refresh();
            } catch (error) {
                toast({
                    title: "Failed to save progress",
                    description: error?.response?.data?.message || error.message || "Unable to record update now.",
                    variant: "destructive",
                });
            } finally {
                setSubmittingProgress(false);
            }
        },
        [progressForm, students, toast, resetProgressForm, refresh, setSubmittingProgress],
    );

    const handleQuickUpdateSubmit = useCallback(
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
            setSavingQuickUpdate(true);
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
                onCloseQuickUpdate();
                refresh();
            } catch (error) {
                toast({
                    title: "Failed to save update",
                    description: error?.response?.data?.message || error.message || "Please try again in a moment.",
                    variant: "destructive",
                });
            } finally {
                setSavingQuickUpdate(false);
            }
        },
        [toast, onCloseQuickUpdate, refresh, setSavingQuickUpdate],
    );

    return { handleProgressSubmitForm, handleQuickUpdateSubmit };
};

export default useTeacherDashboardActions;
