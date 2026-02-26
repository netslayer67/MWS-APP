import { useCallback, useEffect, useMemo, useRef, useState } from "react";

let emotionAnalysisServicePromise = null;
const loadEmotionAnalysisService = async () => {
    if (!emotionAnalysisServicePromise) {
        emotionAnalysisServicePromise = import("@/services/emotionAnalysisService")
            .then((mod) => mod.default)
            .catch((error) => {
                emotionAnalysisServicePromise = null;
                throw error;
            });
    }
    return emotionAnalysisServicePromise;
};

const DEFAULT_STAGE = "intro";

export const useCameraScanner = ({
    toast,
    maxRescanAttempts = 2,
    autoStart = false
}) => {
    const initialStage = autoStart ? "loading" : DEFAULT_STAGE;
    const [stage, setStage] = useState(initialStage);
    const [stream, setStream] = useState(null);
    const [scanProgress, setScanProgress] = useState(0);
    const [detectedFeatures, setDetectedFeatures] = useState([]);
    const [rescanCount, setRescanCount] = useState(0);
    const videoRef = useRef(null);
    const scanIntervalRef = useRef(null);

    const startScan = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });
            setStream(mediaStream);
            setStage("preview");
        } catch (error) {
            console.error("Camera access error:", error);
            toast?.({
                title: "Camera Access Required",
                description: "Please allow camera access for emotional analysis.",
                variant: "destructive"
            });
        }
    }, [toast]);

    // Auto-start camera when autoStart is true (skip intro)
    useEffect(() => {
        if (autoStart) {
            startScan();
        }
    }, [autoStart, startScan]);

    const capturePhoto = useCallback(async () => {
        try {
            if (!videoRef.current) {
                throw new Error("Video element not available");
            }
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 480;
            ctx.drawImage(videoRef.current, 0, 0);

            const photoDataUrl = canvas.toDataURL("image/jpeg", 0.9);

            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }

            setStage("analyzing");
            return photoDataUrl;
        } catch (error) {
            console.error("Photo capture failed:", error);
            toast?.({
                title: "Photo Capture Failed",
                description: "Unable to capture photo for analysis.",
                variant: "destructive"
            });
            setStage(autoStart ? "preview" : initialStage);
        }
    }, [autoStart, initialStage, stream, toast]);

    const resetScan = useCallback(async () => {
        try {
            const emotionAnalysisService = await loadEmotionAnalysisService();
            emotionAnalysisService.stopAnalysis();
        } catch {
            // Service may never be needed in this session.
        }

        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
        setStream(null);
        setStage(initialStage);
        setScanProgress(0);
        setDetectedFeatures([]);
    }, [initialStage, stream]);

    const handleRescanRequest = useCallback(() => {
        if (rescanCount >= maxRescanAttempts) {
            return;
        }
        setRescanCount((prev) => prev + 1);
        resetScan();
        if (autoStart) {
            startScan();
        }
    }, [autoStart, maxRescanAttempts, resetScan, rescanCount, startScan]);

    const remainingRescans = useMemo(
        () => Math.max(maxRescanAttempts - rescanCount, 0),
        [maxRescanAttempts, rescanCount]
    );
    const isRescanDisabled = remainingRescans <= 0;

    useEffect(() => {
        return () => {
            loadEmotionAnalysisService()
                .then((emotionAnalysisService) => {
                    emotionAnalysisService.dispose();
                })
                .catch(() => {
                    // Never loaded, nothing to dispose.
                });

            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
            if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
                scanIntervalRef.current = null;
            }
        };
    }, [stream]);

    return {
        stage,
        setStage,
        stream,
        setStream,
        scanProgress,
        setScanProgress,
        detectedFeatures,
        setDetectedFeatures,
        startScan,
        capturePhoto,
        resetScan,
        handleRescanRequest,
        isRescanDisabled,
        remainingRescans,
        rescanCount,
        videoRef,
        scanIntervalRef
    };
};
