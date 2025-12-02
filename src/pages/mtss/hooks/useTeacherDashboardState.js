import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { createDefaultInterventionForm, createDefaultProgressForm } from "../data/teacherDashboardContent";

export const useTeacherDashboardState = (tabs) => {
    const { toast } = useToast();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [interventionForm, setInterventionForm] = useState(() => createDefaultInterventionForm());
    const [progressForm, setProgressForm] = useState(() => createDefaultProgressForm());
    const [submittingPlan, setSubmittingPlan] = useState(false);
    const [submittingProgress, setSubmittingProgress] = useState(false);

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

            const requiredKeys = ["studentId", "type", "tier", "startDate", "monitorFrequency", "monitorMethod"];
            const missing = requiredKeys.filter((key) => !(form?.[key] || interventionForm[key]));
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
                await new Promise((resolve) => setTimeout(resolve, 600));
                toast({
                    title: "Intervention saved",
                    description: "Student plan locked in—keep tracking their joyful progress.",
                });
            } finally {
                setSubmittingPlan(false);
            }
        },
        [interventionForm, submittingPlan, toast],
    );

    const handleSubmitProgress = useCallback(
        (event) => {
            event.preventDefault();
            toast({
                title: "Progress submitted",
                description: "Your monitoring update is live on the MTSS dashboard.",
            });
        },
        [toast],
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
