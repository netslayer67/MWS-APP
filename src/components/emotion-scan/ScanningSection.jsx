import React, { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, CheckCircle } from "lucide-react";
import Webcam from "react-webcam";

const ScanningOverlay = memo(() => (
    <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
    >
        <motion.div
            className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_6px_rgba(139,28,47,0.3)]"
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 border border-primary/40 rounded-full"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity }}
        />
    </motion.div>
));

const ScanningSection = memo(({ videoRef, scanProgress, detectedFeatures, onEmotionDetected, onTakePhoto, stage }) => {
    const [running, setRunning] = useState(false);
    const [currentEmotion, setCurrentEmotion] = useState(null);
    const webcamRef = React.useRef(null);

    useEffect(() => {
        // Set the videoRef to point to the webcam's video element
        if (webcamRef?.current && videoRef) {
            videoRef.current = webcamRef.current.video;
            setRunning(true);
            console.log('📹 Video element assigned to ref');
        }
    }, []);

    if (stage === 'preview') {
        return (
            <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-6"
            >
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-foreground">
                        Camera Preview
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Position yourself comfortably and ensure good lighting
                    </p>
                </div>

                <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-primary/50 shadow-xl shadow-primary/10">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        mirrored
                        videoConstraints={{ facingMode: "user" }}
                        onUserMedia={() => setRunning(true)}
                        style={{ width: "100%", height: "100%" }}
                    />
                </div>

                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        When you're ready, we'll take a photo for emotion analysis
                    </p>
                    <button
                        onClick={onTakePhoto}
                        className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        I'm Ready - Take Photo
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-6"
        >
            <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">
                    AI Emotional Analysis
                </h2>
                <p className="text-sm text-muted-foreground">
                    Advanced face scanning with real-time emotion detection
                </p>
                {currentEmotion && (
                    <p className="text-xs text-primary font-medium">
                        Detected: {currentEmotion.primaryEmotion} ({(currentEmotion.confidence * 100).toFixed(0)}% confidence)
                    </p>
                )}
                {!currentEmotion && (
                    <p className="text-xs text-muted-foreground">
                        Analyzing facial expressions...
                    </p>
                )}
            </div>

            <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-primary/50 shadow-xl shadow-primary/10">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    mirrored
                    videoConstraints={{ facingMode: "user" }}
                    onUserMedia={() => setRunning(true)}
                    style={{ width: "100%", height: "100%" }}
                />
                <ScanningOverlay />

                {detectedFeatures.length > 0 && (
                    <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
                        {detectedFeatures.slice(-3).map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 text-[11px] md:text-xs text-primary-foreground bg-primary/80 backdrop-blur-sm px-2.5 py-1 rounded-lg"
                            >
                                <CheckCircle className="w-3 h-3" />
                                {feature}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground font-semibold">{Math.round(scanProgress)}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface/50 overflow-hidden">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${scanProgress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Brain className="w-4 h-4 animate-pulse text-primary" />
                Advanced AI analysis in progress...
            </div>
        </motion.div>
    )
});

ScanningSection.displayName = 'ScanningSection';
export default ScanningSection;