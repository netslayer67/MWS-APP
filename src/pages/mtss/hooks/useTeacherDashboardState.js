import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import { createDefaultInterventionForm, createDefaultProgressForm } from "../data/teacherDashboardContent";
import { createMentorAssignment, updateMentorAssignment } from "@/services/mtssService";

export const useTeacherDashboardState = (tabs) => {
    const { toast } = useToast();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [interventionForm, setInterventionForm] = useState(() => createDefaultInterventionForm());
    const [progressForm, setProgressForm] = useState(() => createDefaultProgressForm());
    const [submittingPlan, setSubmittingPlan] = useState(false);
    const [submittingProgress, setSubmittingProgress] = useState(false);

    // Get current user from Redux auth state
    const user = useSelector((state) => state.auth?.user);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const requestedTab = params.get("tab");
        if (requestedTab && tabs.some((tab) => tab.key === requestedTab)) {
            setActiveTab(requestedTab);
        }
    }, [location.search, tabs]);

    const handleInterventionChange = useCallback((field, value) => {
        setInterventionForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleProgressChange = useCallback((field, value) => {
        setProgressForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleSavePlan = useCallback(
        async (event, form) => {
            event.preventDefault();
            if (submittingPlan) return;

            const currentForm = form || interventionForm;
            const requiredKeys = ["studentId", "type", "tier", "startDate", "monitorFrequency", "monitorMethod"];
            const missing = requiredKeys.filter((key) => !currentForm[key]);
            if (missing.length) {
                toast({
                    title: "Complete the required fields",
                    description: "Student, type, tier, start date, frequency, and method are required.",
                    variant: "destructive",
                });
                return;
            }

            try {
                setSubmittingPlan(true);

                // Build payload for API
                const mentorId = user?.id || user?._id;
                const payload = {
                    mentorId,
                    studentIds: [currentForm.studentId],
                    tier: currentForm.tier,
                    focusAreas: currentForm.type ? [currentForm.type] : ["Universal Supports"],
                    startDate: currentForm.startDate || new Date().toISOString(),
                    duration: currentForm.duration || undefined,
                    strategyId: currentForm.strategyId || undefined,
                    strategyName: currentForm.strategyName || undefined,
                    monitoringMethod: currentForm.monitorMethod || undefined,
                    monitoringFrequency: currentForm.monitorFrequency || undefined,
                    metricLabel: currentForm.baselineUnit || currentForm.targetUnit || "score",
                    baselineScore: currentForm.baselineValue
                        ? { value: Number(currentForm.baselineValue), unit: currentForm.baselineUnit || "score" }
                        : undefined,
                    targetScore: currentForm.targetValue
                        ? { value: Number(currentForm.targetValue), unit: currentForm.targetUnit || "score" }
                        : undefined,
                    notes: currentForm.notes || undefined,
                    goals: currentForm.goal
                        ? [{ description: currentForm.goal, successCriteria: "" }]
                        : undefined,
                };

                await createMentorAssignment(payload);

                toast({
                    title: "Intervention saved",
                    description: "Student plan created successfully. Track their progress!",
                });

                // Reset form after success
                setInterventionForm(createDefaultInterventionForm());
            } catch (error) {
                console.error("Failed to save intervention plan:", error);
                toast({
                    title: "Failed to save plan",
                    description: error?.response?.data?.message || error?.message || "Please try again.",
                    variant: "destructive",
                });
            } finally {
                setSubmittingPlan(false);
            }
        },
        [interventionForm, submittingPlan, toast, user],
    );

    const handleSubmitProgress = useCallback(
        async (event) => {
            event.preventDefault();
            if (submittingProgress) return;

            if (!progressForm.assignmentId || !progressForm.notes) {
                toast({
                    title: "Complete the required fields",
                    description: "Please select a student and provide progress notes.",
                    variant: "destructive",
                });
                return;
            }

            try {
                setSubmittingProgress(true);

                const payload = {
                    checkIns: [{
                        date: progressForm.date || new Date().toISOString(),
                        summary: progressForm.notes || "Progress update",
                        value: progressForm.scoreValue ? Number(progressForm.scoreValue) : undefined,
                        unit: progressForm.scoreUnit || "score",
                        performed: progressForm.performed === "yes" || progressForm.performed === true,
                        celebration: progressForm.badge || undefined,
                    }],
                };

                await updateMentorAssignment(progressForm.assignmentId, payload);

                toast({
                    title: "Progress submitted",
                    description: "Your monitoring update is live on the MTSS dashboard.",
                });

                // Reset form after success
                setProgressForm(createDefaultProgressForm());
            } catch (error) {
                console.error("Failed to submit progress:", error);
                toast({
                    title: "Failed to submit progress",
                    description: error?.response?.data?.message || error?.message || "Please try again.",
                    variant: "destructive",
                });
            } finally {
                setSubmittingProgress(false);
            }
        },
        [progressForm, submittingProgress, toast],
    );

    const resetInterventionForm = useCallback(() => {
        setInterventionForm(createDefaultInterventionForm());
    }, []);

    const resetProgressForm = useCallback(() => {
        setProgressForm(createDefaultProgressForm());
    }, []);

    return {
        activeTab,
        setActiveTab,
        interventionForm,
        progressForm,
        handleInterventionChange,
        handleProgressChange,
        handleSavePlan,
        handleSubmitProgress,
        resetInterventionForm,
        resetProgressForm,
        submittingPlan,
        setSubmittingPlan,
        submittingProgress,
        setSubmittingProgress,
    };
};
