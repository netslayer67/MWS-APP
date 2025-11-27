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
        (event) => {
            event.preventDefault();
            toast({
                title: "Intervention saved",
                description: "Student plan locked in-keep tracking their joyful progress.",
            });
        },
        [toast],
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

    return {
        activeTab,
        setActiveTab,
        interventionForm,
        progressForm,
        handleInterventionChange,
        handleProgressChange,
        handleSavePlan,
        handleSubmitProgress,
    };
};
