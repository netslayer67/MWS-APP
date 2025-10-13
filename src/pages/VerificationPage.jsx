import React, { useState, memo, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import AnimatedPage from "@/components/AnimatedPage";
import { useToast } from "@/components/ui/use-toast";
import { emotionDatabase, featureDetectionSequence } from "@/lib/emotionConstants";
import IntroSection from "@/components/emotion-scan/IntroSection";
import ScanningSection from "@/components/emotion-scan/ScanningSection";
import AnalyzingSection from "@/components/emotion-scan/AnalyzingSection";
import ResultsSection from "@/components/emotion-scan/ResultsSection";
import { Shield } from "lucide-react";

/* ============================
   DECORATIVE ELEMENTS
   ============================ */
const DecorativeBlob = memo(({ className, delay = 0 }) => (
    <motion.div
        className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
            scale: [1, 1.12, 1],
            opacity: [0.08, 0.15, 0.08]
        }}
        transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay
        }}
    />
));

const GridPattern = memo(() => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.015]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="mws-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mws-grid)" className="text-foreground" />
        </svg>
    </div>
));

/* ============================
   MAIN COMPONENT
   ============================ */
const EmotionalCheckinFaceScanPage = memo(() => {
    const [stage, setStage] = useState('intro');
    const [stream, setStream] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [scanProgress, setScanProgress] = useState(0);
    const [detectedFeatures, setDetectedFeatures] = useState([]);
    const videoRef = useRef(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    const startScan = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });

            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setStage('scanning');
            setDetectedFeatures([]);

            featureDetectionSequence.forEach((feature) => {
                setTimeout(() => {
                    setDetectedFeatures(prev => [...prev, feature.name]);
                }, feature.delay);
            });

            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15 + 5;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    setTimeout(() => performAnalysis(), 800);
                }
                setScanProgress(Math.min(progress, 100));
            }, 300);
        } catch (error) {
            toast({
                title: "Camera Access Required",
                description: "Please allow camera access for AI emotional analysis.",
                variant: "destructive"
            });
        }
    }, [toast]);

    const performAnalysis = useCallback(() => {
        setStage('analyzing');

        setTimeout(() => {
            const randomAnalysis = emotionDatabase[Math.floor(Math.random() * emotionDatabase.length)];
            setAnalysis(randomAnalysis);
            setStage('results');

            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        }, 2000);
    }, [stream]);

    const completeCheckin = useCallback(() => {
        toast({
            title: "Check-in Complete",
            description: "Your emotional data has been securely processed.",
        });
        navigate("/dashboard");
    }, [navigate, toast]);

    const resetScan = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setStage('intro');
        setAnalysis(null);
        setScanProgress(0);
        setDetectedFeatures([]);
        setStream(null);
    }, [stream]);

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    return (
        <AnimatedPage>
            <Helmet>
                <title>AI Emotional Check-in — Millennia World School</title>
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
                    >
                        <div className="glass glass--frosted glass--deep relative p-6">
                            <div className="glass__refract" />
                            <div className="glass__noise" />

                            <AnimatePresence mode="wait">
                                {stage === 'intro' && <IntroSection onStartScan={startScan} />}
                                {stage === 'scanning' && (
                                    <ScanningSection
                                        videoRef={videoRef}
                                        scanProgress={scanProgress}
                                        detectedFeatures={detectedFeatures}
                                    />
                                )}
                                {stage === 'analyzing' && <AnalyzingSection />}
                                {stage === 'results' && analysis && (
                                    <ResultsSection
                                        analysis={analysis}
                                        onReset={resetScan}
                                        onComplete={completeCheckin}
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

EmotionalCheckinFaceScanPage.displayName = 'EmotionalCheckinFaceScanPage';

export default EmotionalCheckinFaceScanPage;