import { useCallback, useState } from "react";

export const useCheckinSubmission = ({
    analysis,
    selectedSupportContact,
    supportContacts,
    toast,
    navigate
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const completeCheckin = useCallback(async () => {
        if (!analysis) {
            toast?.({
                title: "Analysis Missing",
                description: "Please run the AI scan before completing the check-in.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("auth_token") || localStorage.getItem("token");

            if (!token) {
                toast?.({
                    title: "Login Required",
                    description: "Please log in to save your AI emotion check-in.",
                    variant: "destructive"
                });
                navigate("/login");
                return;
            }

            let supportContactUserId = null;
            if (selectedSupportContact && selectedSupportContact !== "No Need") {
                const selectedContact = supportContacts.find(
                    (contact) =>
                        contact.name === selectedSupportContact || contact.id === selectedSupportContact
                );
                supportContactUserId = selectedContact?.id || null;
            }

            const checkInData = {
                detectedEmotion: analysis.detectedEmotion,
                confidence: analysis.confidence || 75,
                selectedMoods: analysis.selfreportedEmotions || [],
                details: analysis.psychologicalInsight || "",
                presenceLevel: analysis.presenceCapacity?.estimatedPresence || 7,
                capacityLevel: analysis.presenceCapacity?.estimatedCapacity || 7,
                selectedSupportContact: selectedSupportContact || "No Need",
                supportContactUserId,
                weatherType: analysis.internalWeather || analysis.weatherDesc || "AI Generated Weather",
                weatherIcon: analysis.weatherIcon || "☀️",
                weatherDescription: analysis.weatherDesc || "",
                aiSummary: analysis.personalizedRecommendation || "",
                aiInsights: analysis.detailedRecommendations || [],
                aiGenerated: true,
                personalizedGreeting: analysis.personalizedRecommendation || "",
                needsSupport:
                    (analysis.presenceCapacity?.estimatedPresence || 7) < 5 ||
                    (analysis.presenceCapacity?.estimatedCapacity || 7) < 5
            };

            const authService = (await import("@/services/authService")).default;
            const response = await authService.post("/checkin/submit", checkInData);
            const result = response.data;
            const checkinId =
                result.checkin?.id ||
                result.checkin?._id ||
                result.data?.checkin?.id ||
                result.data?.checkin?._id;

            if (checkinId) {
                navigate(`/emotional-checkin/rate/${checkinId}`);
            } else {
                navigate("/emotional-checkin/rate");
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || error.message || "Unable to save your check-in.";
            toast?.({
                title: "Save Failed",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [analysis, navigate, selectedSupportContact, supportContacts, toast]);

    return { isSubmitting, completeCheckin };
};



