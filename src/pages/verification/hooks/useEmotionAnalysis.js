import { useCallback, useEffect, useState } from "react";
import { generateAIAnalysis } from "@/pages/verification/utils/generateAIAnalysis";

export const useEmotionAnalysis = ({ toast, setStage }) => {
    const [analysis, setAnalysis] = useState(null);
    const [selectedSupportContact, setSelectedSupportContact] = useState(null);
    const [aiEmotionResult, setAiEmotionResult] = useState(null);

    const analyzePhoto = useCallback(async (imageDataUrl) => {
        try {
            setStage("analyzing");
            const response = await fetch(imageDataUrl);
            const blob = await response.blob();
            const formData = new FormData();
            formData.append("image", blob, "emotion_capture.jpg");

            const apiResponse = await fetch(`${import.meta.env.VITE_API_BASE}/checkin/emotion/analyze`, {
                method: "POST",
                body: formData
            });

            if (!apiResponse.ok) {
                throw new Error("Emotion analysis API failed");
            }

            const result = await apiResponse.json();
            const emotionResult = result.data?.emotionResult || result.emotionResult;

            if (!emotionResult) {
                throw new Error("Invalid emotion analysis response format - no emotionResult found");
            }

            setAiEmotionResult(emotionResult);
        } catch (error) {
            console.error("Emotion analysis failed:", error);
            toast?.({
                title: "Analysis Failed",
                description: "Unable to perform AI emotion analysis. Please try again.",
                variant: "destructive"
            });
            setStage("intro");
        }
    }, [setStage, toast]);

    const finalizeAnalysis = useCallback(() => {
        if (!aiEmotionResult) {
            return;
        }

        try {
            const finalAnalysis = generateAIAnalysis(aiEmotionResult);
            finalAnalysis.selectedSupportContact = selectedSupportContact;
            finalAnalysis.isSubmitting = false;
            setAnalysis(finalAnalysis);
            setStage("results");
        } catch (error) {
            console.error("Failed to generate AI analysis:", error);
            toast?.({
                title: "Analysis Failed",
                description: "Unable to process AI emotion analysis. Please try again.",
                variant: "destructive"
            });
            setStage("intro");
        }
    }, [aiEmotionResult, selectedSupportContact, setStage, toast]);

    useEffect(() => {
        if (!aiEmotionResult) {
            return;
        }
        const timer = setTimeout(finalizeAnalysis, 100);
        return () => clearTimeout(timer);
    }, [aiEmotionResult, finalizeAnalysis]);

    useEffect(() => {
        setAnalysis((prev) => {
            if (!prev) {
                return prev;
            }
            return { ...prev, selectedSupportContact };
        });
    }, [selectedSupportContact]);

    return {
        analysis,
        setAnalysis,
        analyzePhoto,
        selectedSupportContact,
        setSelectedSupportContact
    };
};
