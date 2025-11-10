import React, { memo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Shield } from "lucide-react";
import AnimatedPage from "@/components/AnimatedPage";
import { useToast } from "@/components/ui/use-toast";
import IntroSection from "@/components/emotion-scan/IntroSection";
import ScanningSection from "@/components/emotion-scan/ScanningSection";
import AnalyzingSection from "@/components/emotion-scan/AnalyzingSection";
import ResultsSection from "@/components/emotion-scan/ResultsSection";
import { useDispatch, useSelector } from "react-redux";
import { fetchSupportContacts } from "@/store/slices/supportSlice";
import { DecorativeBlob, GridPattern } from "@/pages/verification/components/DecorativeElements";
import { useCameraScanner } from "@/pages/verification/hooks/useCameraScanner";
import { useEmotionAnalysis } from "@/pages/verification/hooks/useEmotionAnalysis";
import { useCheckinSubmission } from "@/pages/verification/hooks/useCheckinSubmission";

const MAX_AI_RESCAN_ATTEMPTS = 2;

const EmotionalCheckinFaceScanPage = memo(() => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const dispatch = useDispatch();
    const { contacts: supportContacts } = useSelector((state) => state.support);
    const { isAuthenticated } = useSelector((state) => state.auth);
    const rescanLimitNoticeShownRef = useRef(false);

    const {
        stage,
        setStage,
        videoRef,
        scanProgress,
        detectedFeatures,
        startScan,
        capturePhoto,
        handleRescanRequest,
        isRescanDisabled,
        remainingRescans,
        rescanCount
    } = useCameraScanner({
        toast,
        maxRescanAttempts: MAX_AI_RESCAN_ATTEMPTS
    });

    const {
        analysis,
        setAnalysis,
        analyzePhoto,
        selectedSupportContact,
        setSelectedSupportContact
    } = useEmotionAnalysis({ toast, setStage });

    const { isSubmitting, completeCheckin } = useCheckinSubmission({
        analysis,
        selectedSupportContact,
        supportContacts,
        toast,
        navigate
    });

    const handleTakePhoto = useCallback(async () => {
        const photoDataUrl = await capturePhoto();
        if (photoDataUrl) {
            await analyzePhoto(photoDataUrl);
        }
    }, [analyzePhoto, capturePhoto]);

    const handleRescan = useCallback(() => {
        setAnalysis(null);
        setSelectedSupportContact(null);
        handleRescanRequest();
    }, [handleRescanRequest, setAnalysis, setSelectedSupportContact]);

    useEffect(() => {
        if (supportContacts.length === 0 && isAuthenticated) {
            dispatch(fetchSupportContacts());
        }
    }, [dispatch, isAuthenticated, supportContacts.length]);

    useEffect(() => {
        if (stage === "results" && analysis && isRescanDisabled && !rescanLimitNoticeShownRef.current) {
            rescanLimitNoticeShownRef.current = true;
            toast({
                title: "Kuota Scan Ulang Habis",
                description: "Anda telah menggunakan seluruh kuota scan ulang AI (2x). Silakan lanjutkan proses check-in atau simpan hasil analisis ini.",
                variant: "destructive"
            });
        }

        if (!isRescanDisabled) {
            rescanLimitNoticeShownRef.current = false;
        }
    }, [analysis, isRescanDisabled, stage, toast]);

    const analysisForView = analysis ? { ...analysis, isSubmitting } : null;

    return (
        <AnimatedPage>
            <Helmet>
                <title>AI Emotional Check-in - Millennia World School</title>
                <meta name="description" content="Advanced AI psychology analysis for MWS educators and staff wellbeing." />
            </Helmet>

            <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
                <DecorativeBlob className="top-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-primary/6" delay={0} />
                <DecorativeBlob className="bottom-0 right-0 w-56 h-56 md:w-72 md:h-72 bg-primary/4" delay={1.5} />
                <GridPattern />

                <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full max-w-md"
                        role="main"
                        aria-label="AI Emotional Analysis"
                    >
                        <div className="glass glass--frosted glass--deep relative p-6">
                            <div className="glass__refract" />
                            <div className="glass__noise" />

                            <AnimatePresence mode="wait">
                                {stage === "intro" && <IntroSection onStartScan={startScan} />}
                                {(stage === "preview" || stage === "scanning") && (
                                    <ScanningSection
                                        videoRef={videoRef}
                                        scanProgress={scanProgress}
                                        detectedFeatures={detectedFeatures}
                                        onTakePhoto={handleTakePhoto}
                                        stage={stage}
                                    />
                                )}
                                {stage === "analyzing" && <AnalyzingSection />}
                                {stage === "results" && analysisForView && (
                                    <ResultsSection
                                        analysis={analysisForView}
                                        onReset={handleRescan}
                                        onComplete={completeCheckin}
                                        onSupportChange={setSelectedSupportContact}
                                        isRescanDisabled={isRescanDisabled}
                                        remainingRescans={remainingRescans}
                                        maxRescans={MAX_AI_RESCAN_ATTEMPTS}
                                    />
                                )}
                            </AnimatePresence>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 text-center"
                        >
                            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                                <Shield className="w-3 h-3" />
                                Your wellbeing is our priority • Confidential analysis
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </AnimatedPage>
    );
});

EmotionalCheckinFaceScanPage.displayName = "EmotionalCheckinFaceScanPage";

export default EmotionalCheckinFaceScanPage;
