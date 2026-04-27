import { useCallback, useEffect, useState } from "react";
import { generateAIAnalysis } from "@/pages/verification/utils/generateAIAnalysis";

const ANALYSIS_TIMEOUT_MS = 20000;

export const useEmotionAnalysis = ({ toast, setStage, fallbackStage = "intro" }) => {
    const [analysis, setAnalysis] = useState(null);
    const [selectedSupportContact, setSelectedSupportContact] = useState(null);

<<<<<<< HEAD
    const finalizeAnalysis = useCallback((emotionResult) => {
        if (!emotionResult) {
            return;
        }

        try {
            const finalAnalysis = generateAIAnalysis(emotionResult);
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
            setStage(fallbackStage);
        }
    }, [fallbackStage, selectedSupportContact, setStage, toast]);

    const analyzePhoto = useCallback(async (imageSource) => {
=======
    const analyzePhoto = useCallback(async (imageDataUrl) => {
        let timeoutId;
>>>>>>> 284c40f (Fix FaceScan loading and cache refresh)
        try {
            setAiEmotionResult(null);
            setAnalysis(null);
            setStage("analyzing");

            let blob = imageSource;
            if (!(blob instanceof Blob)) {
                const response = await fetch(imageSource);
                blob = await response.blob();
            }

            const formData = new FormData();
            formData.append("image", blob, "emotion_capture.jpg");

            const apiBase = import.meta.env.VITE_API_BASE || "/api/v1";
            const controller = new AbortController();
            timeoutId = window.setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT_MS);
            const apiResponse = await fetch(`${apiBase}/checkin/emotion/analyze`, {
                method: "POST",
                body: formData,
                signal: controller.signal
            });

            if (!apiResponse.ok) {
                throw new Error("Emotion analysis API failed");
            }

            const result = await apiResponse.json();
            const emotionResult = result.data?.emotionResult || result.emotionResult;

            if (!emotionResult) {
                throw new Error("Invalid emotion analysis response format - no emotionResult found");
            }

            finalizeAnalysis(emotionResult);
        } catch (error) {
            console.error("Emotion analysis failed:", error);
            const isNetworkError =
                error?.message?.includes("Failed to fetch") ||
                error?.name === "TypeError";
            const isTimeout = error?.name === "AbortError";
            toast?.({
                title: "Analysis Failed",
                description: isTimeout
                    ? "AI analysis took too long. Please try again or continue with manual check-in."
                    : isNetworkError
                    ? "Backend API is unreachable. Make sure backend is running, then try again."
                    : "Unable to perform AI emotion analysis. Please try again.",
                variant: "destructive"
            });
            setStage(fallbackStage);
        } finally {
            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }
        }
<<<<<<< HEAD
    }, [fallbackStage, finalizeAnalysis, setStage, toast]);
=======
    }, [fallbackStage, setStage, toast]);

    const finalizeAnalysis = useCallback(() => {
        if (!aiEmotionResult) {
            return;
        }

        try {
            const finalAnalysis = generateAIAnalysis(aiEmotionResult);
            finalAnalysis.aiEmotionScan = {
                valence: aiEmotionResult.valence,
                arousal: aiEmotionResult.arousal,
                intensity: aiEmotionResult.intensity,
                detectedEmotion: aiEmotionResult.primaryEmotion,
                confidence: aiEmotionResult.confidence,
                explanations: aiEmotionResult.explanations,
                temporalAnalysis: aiEmotionResult.temporalAnalysis,
                emotionalAuthenticity: aiEmotionResult.emotionalAuthenticity,
                psychologicalDepth: aiEmotionResult.psychologicalDepth
            };
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
            setStage(fallbackStage);
        }
    }, [aiEmotionResult, fallbackStage, selectedSupportContact, setStage, toast]);

    useEffect(() => {
        if (!aiEmotionResult) {
            return;
        }
        const timer = setTimeout(finalizeAnalysis, 100);
        return () => clearTimeout(timer);
    }, [aiEmotionResult, finalizeAnalysis]);
>>>>>>> 284c40f (Fix FaceScan loading and cache refresh)

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
        aiEmotionResult,
        selectedSupportContact,
        setSelectedSupportContact
    };
};
