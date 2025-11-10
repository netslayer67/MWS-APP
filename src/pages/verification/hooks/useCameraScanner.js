import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import emotionAnalysisService from "@/services/emotionAnalysisService";

const DEFAULT_STAGE = "intro";

export const useCameraScanner = ({
    toast,
    maxRescanAttempts = 2
}) => {
    const [stage, setStage] = useState(DEFAULT_STAGE);
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
            setStage(DEFAULT_STAGE);
        }
    }, [stream, toast]);

    const resetScan = useCallback(() => {
        emotionAnalysisService.stopAnalysis();
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
        setStream(null);
        setStage(DEFAULT_STAGE);
        setScanProgress(0);
        setDetectedFeatures([]);
    }, [stream]);

    const handleRescanRequest = useCallback(() => {
        if (rescanCount >= maxRescanAttempts) {
            return;
        }
        setRescanCount((prev) => prev + 1);
        resetScan();
    }, [maxRescanAttempts, resetScan, rescanCount]);

    const remainingRescans = useMemo(
        () => Math.max(maxRescanAttempts - rescanCount, 0),
        [maxRescanAttempts, rescanCount]
    );
    const isRescanDisabled = remainingRescans <= 0;

    useEffect(() => {
        return () => {
            emotionAnalysisService.dispose();
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
