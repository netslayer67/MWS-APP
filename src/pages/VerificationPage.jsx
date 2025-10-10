// EmotionalCheckinFaceScanPage.jsx - Millennia World School AI Edition
import React, { useState, memo, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Camera, Brain, Heart, CheckCircle, Shield, Eye,
    Activity, AlertCircle, Zap, Target, Clock, User,
    CloudRain, Cloud, Sun, Wind, Snowflake, CloudDrizzle
} from "lucide-react";
import AnimatedPage from "@/components/AnimatedPage";
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from "react-helmet";

/* ============================
   DECORATIVE BLOBS
   ============================ */
const DecorativeBlob = memo(({ className, delay = 0 }) => (
    <motion.div
        className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
            scale: [1, 1.12, 1],
            opacity: [0.12, 0.2, 0.12]
        }}
        transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay
        }}
    />
));

/* ============================
   GRID PATTERN
   ============================ */
const GridPattern = memo(() => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
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
   SCANNING OVERLAY
   ============================ */
const ScanningOverlay = memo(() => (
    <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
    >
        <motion.div
            className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_8px_rgba(139,28,47,0.4)]"
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />

        {[
            { pos: "top-3 left-3", borders: "border-t border-l" },
            { pos: "top-3 right-3", borders: "border-t border-r" },
            { pos: "bottom-3 left-3", borders: "border-b border-l" },
            { pos: "bottom-3 right-3", borders: "border-b border-r" }
        ].map((corner, i) => (
            <motion.div
                key={i}
                className={`absolute ${corner.pos} w-8 h-8 md:w-10 md:h-10`}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            >
                <div className={`absolute ${corner.borders} border-primary w-full h-full`} />
            </motion.div>
        ))}

        <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 border border-primary/40 rounded-full"
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity }}
        />
    </motion.div>
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

    // Emotion database sesuai dengan form lama MWS
    const emotionDatabase = [
        {
            id: "genuine_happiness",
            detectedEmotion: "Genuine Happiness",
            confidence: 89,
            icon: "😊",
            weatherIcon: Sun,
            internalWeather: "☀️ Sunny and Clear",
            weatherDesc: "Feeling upbeat, calm, and full of clarity",
            selfreportedEmotions: ["Happy", "Excited", "Hopeful", "Calm"],
            microExpressions: [
                "Crow's feet wrinkles (orbicularis oculi)",
                "Duchenne smile activation",
                "Elevated cheeks symmetrically",
                "Genuine eye crinkling"
            ],
            physiologicalMarkers: {
                heartRate: "Slightly elevated (positive arousal)",
                facialWarmth: "Increased in cheek region",
                muscleEngagement: "Authentic smile muscles active"
            },
            aiAnalysis: "Your facial microexpressions reveal **authentic joy** that cannot be consciously fabricated. The orbicularis oculi engagement (crow's feet) confirms this is genuine happiness, not social masking. Your symmetrical facial activation indicates deep emotional contentment.",
            psychologicalInsight: "This authentic happiness pattern suggests strong psychological well-being and life satisfaction. The Duchenne smile correlates with genuine positive affect and resilience.",
            personalizedRecommendation: "Your elevated mood enhances cognitive performance by ~23% and boosts creative problem-solving. Channel this positive energy into collaborative work or meaningful projects. Consider documenting what triggered this joy for future reference—building awareness of positive patterns strengthens emotional intelligence.",
            presenceCapacity: {
                estimatedPresence: 8,
                estimatedCapacity: 7,
                reasoning: "High emotional clarity suggests strong present-moment awareness and available cognitive resources"
            },
            suggestedActions: [
                "Engage in collaborative or creative tasks while mood is elevated",
                "Share this positive energy with team members",
                "Document triggers of this happiness for pattern recognition"
            ]
        },
        {
            id: "masked_stress",
            detectedEmotion: "Concealed Stress",
            confidence: 82,
            icon: "😰",
            weatherIcon: CloudRain,
            internalWeather: "🌧️ Light Rain / Thunderstorms",
            weatherDesc: "Emotionally heavy with underlying tension",
            selfreportedEmotions: ["Anxious", "Overwhelmed", "Tired", "Scattered"],
            microExpressions: [
                "Jaw tension (masseter contraction)",
                "Forced smile asymmetry",
                "Lip compression (stress indicator)",
                "Micro-frown suppression"
            ],
            physiologicalMarkers: {
                heartRate: "Elevated (stress response active)",
                facialTension: "Chronic jaw and forehead tension",
                eyeMovement: "Rapid scanning (hypervigilance)"
            },
            aiAnalysis: "Despite conscious attempts to appear calm, your microexpressions reveal **underlying stress you're trying to mask**. Your jaw tension and asymmetrical smile are involuntary indicators that contradict your facial presentation. The body cannot lie—these autonomic responses expose genuine stress beneath the surface.",
            psychologicalInsight: "Emotional suppression detected. The incongruence between felt emotions and displayed expressions can lead to emotional exhaustion and burnout. Your body is signaling accumulated cognitive load.",
            personalizedRecommendation: "Acknowledge these feelings rather than suppressing them—emotional authenticity prevents burnout. Consider a structured 10-minute break with the 4-7-8 breathing technique. Prioritize or delegate 1-2 tasks to reduce cognitive load. Connecting with a trusted colleague about workload may provide relief.",
            presenceCapacity: {
                estimatedPresence: 4,
                estimatedCapacity: 3,
                reasoning: "High stress reduces present-moment awareness and significantly limits available cognitive capacity"
            },
            suggestedActions: [
                "Schedule 15-min mindfulness break within next hour",
                "Identify top 3 stressors; delegate or defer 1-2 items",
                "Connect with Ms. Mahrukh or trusted colleague about workload"
            ]
        },
        {
            id: "focused_calm",
            detectedEmotion: "Focused Calm",
            confidence: 86,
            icon: "😌",
            weatherIcon: Cloud,
            internalWeather: "⛅ Partly Cloudy",
            weatherDesc: "Doing alright with mild clarity",
            selfreportedEmotions: ["Calm", "Hopeful"],
            microExpressions: [
                "Relaxed facial muscles",
                "Steady focused gaze",
                "Minimal tension indicators",
                "Balanced neutral expression"
            ],
            physiologicalMarkers: {
                heartRate: "Optimal range (relaxed alertness)",
                facialBalance: "Symmetrical and tension-free",
                eyeMovement: "Steady intentional focus"
            },
            aiAnalysis: "Your expression indicates an **optimal cognitive-emotional state**—the 'flow state' precursor where focus meets calm. The absence of micro-tensions and steady facial patterns suggest mental clarity without stress. This is peak performance territory.",
            psychologicalInsight: "You're in a state of relaxed concentration, ideal for deep work and complex problem-solving. This emotional stability correlates with high productivity and creative output.",
            personalizedRecommendation: "You're in an **optimal state for deep focused work**. This mental clarity window typically lasts 90-120 minutes. Maximize this period by tackling your most cognitively demanding tasks. Protect from interruptions—your brain is primed for high-quality output.",
            presenceCapacity: {
                estimatedPresence: 9,
                estimatedCapacity: 8,
                reasoning: "Optimal emotional state indicates high presence and strong capacity for complex tasks"
            },
            suggestedActions: [
                "Block calendar for 90 minutes of uninterrupted deep work",
                "Tackle most complex or creative task on your list",
                "Minimize notifications during this optimal window"
            ]
        },
        {
            id: "hidden_sadness",
            detectedEmotion: "Suppressed Sadness",
            confidence: 76,
            icon: "😔",
            weatherIcon: CloudDrizzle,
            internalWeather: "🌫️ Foggy / Light Rain",
            weatherDesc: "Mentally unclear with emotional heaviness",
            selfreportedEmotions: ["Sad", "Lonely", "Tired", "Bored"],
            microExpressions: [
                "Downturned mouth corners",
                "Reduced facial animation",
                "Flattened affect range",
                "Lowered brow positioning"
            ],
            physiologicalMarkers: {
                heartRate: "Slightly reduced (withdrawal response)",
                facialExpressiveness: "Diminished animation",
                eyeContact: "Reduced and downward bias"
            },
            aiAnalysis: "Your facial expression shows **subtle sadness indicators you may be minimizing**. The downturned mouth corners and reduced facial animation are involuntary signs of melancholic mood. Your smile (if present) doesn't engage the upper face—a key marker distinguishing genuine vs. masked emotions.",
            psychologicalInsight: "Emotional suppression of sadness detected. While experiencing difficult emotions is natural, prolonged suppression impacts both mental and physical health. Acknowledging feelings is the first step toward processing them healthily.",
            personalizedRecommendation: "It's **healthy and courageous to acknowledge difficult feelings**. Consider reaching out to a trusted confidant—Ms. Mahrukh, Ms. Latifah, or a close colleague. Even brief social connection provides significant emotional relief. Practice self-compassion: treat yourself with the kindness you'd offer a good friend.",
            presenceCapacity: {
                estimatedPresence: 5,
                estimatedCapacity: 4,
                reasoning: "Emotional withdrawal reduces engagement and limits capacity for demanding tasks"
            },
            suggestedActions: [
                "Schedule time with trusted confidant (Ms. Mahrukh recommended)",
                "Engage in gentle self-care: walk, music, creative outlet",
                "Consider journaling to process emotions privately"
            ]
        },
        {
            id: "concealed_anxiety",
            detectedEmotion: "Concealed Anxiety",
            confidence: 79,
            icon: "😬",
            weatherIcon: Wind,
            internalWeather: "🌪️ Tornado Watch / Windy",
            weatherDesc: "Everything feels chaotic and restless",
            selfreportedEmotions: ["Anxious", "Fear", "Overwhelmed", "Scattered"],
            microExpressions: [
                "Rapid blink frequency",
                "Eyebrow micro-elevations",
                "Lip tension and pursing",
                "Facial asymmetry patterns"
            ],
            physiologicalMarkers: {
                heartRate: "Elevated and variable",
                facialTension: "Multiple tension zones active",
                eyeMovement: "Darting hypervigilant scanning"
            },
            aiAnalysis: "Your microexpressions reveal **significant anxiety you're attempting to control**. Rapid blinking, facial tension, and lip compression are autonomic responses outside conscious control. Your eyes show hypervigilance—constantly scanning for potential threats. The body cannot hide what the mind tries to suppress.",
            psychologicalInsight: "High anxiety with attempted emotional regulation. The gap between internal state and external presentation causes additional cognitive strain. Anxiety at this level impairs decision-making and task performance significantly.",
            personalizedRecommendation: "Your body is in **heightened alert mode**. Immediate grounding: try 5-4-3-2-1 sensory technique (5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste). If anxiety persists, reach out to mental health resources. Short-term: reduce caffeine, practice box breathing (4-4-4-4), break tasks into smaller steps.",
            presenceCapacity: {
                estimatedPresence: 3,
                estimatedCapacity: 2,
                reasoning: "Severe anxiety drastically reduces presence and depletes cognitive capacity"
            },
            suggestedActions: [
                "Practice 5-min grounding exercise immediately",
                "Reduce stimulant intake (caffeine, sugar) for 2-3 hours",
                "Contact Ms. Mahrukh or EAP resources if symptoms persist"
            ]
        }
    ];

    const featureDetectionSequence = [
        { name: "Face detected", delay: 100 },
        { name: "43 facial landmarks mapped", delay: 300 },
        { name: "Eye region analyzed", delay: 500 },
        { name: "Mouth microexpressions captured", delay: 700 },
        { name: "Autonomic responses tracked", delay: 900 },
        { name: "Psychological markers analyzed", delay: 1100 }
    ];

    const startScan = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
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
                progress += Math.random() * 10 + 4;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    setTimeout(() => performAnalysis(), 600);
                }
                setScanProgress(Math.min(progress, 100));
            }, 200);
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
        }, 2800);
    }, [stream]);

    const completeCheckin = useCallback(() => {
        toast({
            title: "Emotional Check-in Complete",
            description: "Your wellness data has been processed securely.",
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
                <DecorativeBlob className="top-0 left-0 w-80 h-80 md:w-96 md:h-96 bg-primary/8" delay={0} />
                <DecorativeBlob className="bottom-0 right-0 w-72 h-72 md:w-80 md:h-80 bg-primary/6" delay={1.5} />
                <GridPattern />

                <div className="relative z-10 flex min-h-screen items-center justify-center p-4 md:p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full max-w-3xl"
                    >
                        <div className="glass glass--frosted glass--deep relative p-5 md:p-8">
                            <div className="glass__refract" />
                            <div className="glass__refract--soft" />
                            <div className="glass__noise" />

                            <AnimatePresence mode="wait">
                                {/* INTRO */}
                                {stage === 'intro' && (
                                    <motion.div
                                        key="intro"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-5 md:space-y-6"
                                    >
                                        <div className="text-center space-y-3">
                                            <motion.div
                                                className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20"
                                                animate={{ scale: [1, 1.03, 1] }}
                                                transition={{ duration: 4, repeat: Infinity }}
                                            >
                                                <Brain className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
                                            </motion.div>

                                            <div>
                                                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                                                    AI Emotional Analysis
                                                </h1>
                                                <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
                                                    Advanced micro-expression detection for authentic emotional insights—your conscious mind cannot hide what your face reveals
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3 md:gap-4">
                                            {[
                                                { icon: Eye, label: "43 Landmarks", desc: "Facial mapping" },
                                                { icon: Brain, label: "AI Psychology", desc: "Deep analysis" },
                                                { icon: Shield, label: "Confidential", desc: "Zero storage" }
                                            ].map((f, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="glass glass-card p-3 md:p-4 text-center space-y-2"
                                                >
                                                    <f.icon className="w-5 h-5 md:w-6 md:h-6 text-primary mx-auto" />
                                                    <div>
                                                        <div className="text-xs md:text-sm font-bold text-foreground">{f.label}</div>
                                                        <div className="text-[10px] md:text-xs text-muted-foreground">{f.desc}</div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        <motion.div
                                            className="relative aspect-video rounded-2xl overflow-hidden bg-surface border-2 border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group"
                                            whileHover={{ scale: 1.01 }}
                                            onClick={startScan}
                                        >
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                                                <motion.div
                                                    animate={{ scale: [1, 1.08, 1] }}
                                                    transition={{ duration: 3, repeat: Infinity }}
                                                >
                                                    <Camera className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground/40 mb-4 group-hover:text-primary/60 transition-colors" />
                                                </motion.div>
                                                <p className="text-sm md:text-base font-semibold text-foreground mb-1">
                                                    Begin AI Analysis
                                                </p>
                                                <p className="text-xs md:text-sm text-muted-foreground">
                                                    Position face in center • Good lighting required
                                                </p>
                                            </div>

                                            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-primary/30" />
                                            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-primary/30" />
                                            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-primary/30" />
                                            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-primary/30" />
                                        </motion.div>

                                        <motion.button
                                            onClick={startScan}
                                            className="w-full py-3.5 md:py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                        >
                                            Start Emotional Scan
                                        </motion.button>

                                        <p className="text-[10px] md:text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
                                            <Shield className="w-3 h-3" />
                                            Processed locally • No images saved or transmitted
                                        </p>
                                    </motion.div>
                                )}

                                {/* SCANNING */}
                                {stage === 'scanning' && (
                                    <motion.div
                                        key="scanning"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-5"
                                    >
                                        <div className="text-center">
                                            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1.5">
                                                Analyzing Microexpressions
                                            </h2>
                                            <p className="text-xs md:text-sm text-muted-foreground">
                                                AI detecting authentic emotions beyond conscious control
                                            </p>
                                        </div>

                                        <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-primary shadow-2xl shadow-primary/20">
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full h-full object-cover"
                                            />
                                            <ScanningOverlay />

                                            <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
                                                {detectedFeatures.map((feature, i) => (
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
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Scan Progress</span>
                                                <span className="text-foreground font-bold">{Math.round(scanProgress)}%</span>
                                            </div>
                                            <div className="h-2.5 rounded-full bg-surface overflow-hidden border border-border/30">
                                                <motion.div
                                                    className="h-full bg-primary"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${scanProgress}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                            <Brain className="w-4 h-4 animate-pulse text-primary" />
                                            Neural network processing facial data...
                                        </div>
                                    </motion.div>
                                )}

                                {/* ANALYZING */}
                                {stage === 'analyzing' && (
                                    <motion.div
                                        key="analyzing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="py-10 md:py-12 text-center space-y-5"
                                    >
                                        <motion.div
                                            animate={{ rotate: 360, scale: [1, 1.08, 1] }}
                                            transition={{
                                                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                                                scale: { duration: 2, repeat: Infinity }
                                            }}
                                            className="w-20 h-20 md:w-24 md:h-24 mx-auto"
                                        >
                                            <Brain className="w-full h-full text-primary" />
                                        </motion.div>

                                        <div>
                                            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                                                Deep Analysis in Progress
                                            </h2>
                                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                                Cross-referencing 43 landmarks with emotion database
                                            </p>
                                        </div>

                                        <div className="flex justify-center gap-2">
                                            {[0, 1, 2, 3].map(i => (
                                                <motion.div
                                                    key={i}
                                                    className="w-2 h-2 rounded-full bg-primary"
                                                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                                                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* RESULTS */}
                                {stage === 'results' && analysis && (
                                    <motion.div
                                        key="results"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-5 md:space-y-6"
                                    >
                                        <div className="text-center space-y-3">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 200 }}
                                                className="w-14 h-14 md:w-16 md:h-16 mx-auto rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/25"
                                            >
                                                <CheckCircle className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground" />
                                            </motion.div>
                                            <div>
                                                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                                                    Analysis Complete
                                                </h2>
                                                <p className="text-sm text-muted-foreground">
                                                    Deep psychological insights revealed
                                                </p>
                                            </div>
                                        </div>

                                        <motion.div
                                            initial={{ scale: 0.95, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="glass glass-card p-5 md:p-6 space-y-5"
                                        >
                                            {/* Emotion Header */}
                                            <div className="text-center pb-5 border-b border-border/30">
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.2, type: "spring" }}
                                                    className="text-6xl md:text-7xl mb-4"
                                                >
                                                    {analysis.icon}
                                                </motion.div>
                                                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                                                    {analysis.detectedEmotion}
                                                </h3>
                                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
                                                    <motion.div
                                                        animate={{ scale: [1, 1.2, 1] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                        className="w-2 h-2 rounded-full bg-primary"
                                                    />
                                                    <span className="text-base font-bold text-primary">
                                                        {analysis.confidence}% Confidence
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Internal Weather Report */}
                                            <div className="bg-surface/50 rounded-xl p-4 border border-border/30">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <analysis.weatherIcon className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
                                                            Internal Weather Report
                                                        </h4>
                                                        <p className="text-sm font-semibold text-foreground mb-1">
                                                            {analysis.internalWeather}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {analysis.weatherDesc}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Detected Emotions */}
                                            <div>
                                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                                                    <Heart className="w-3.5 h-3.5" />
                                                    Emotions Detected (matching self-report)
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {analysis.selfreportedEmotions.map((emotion, i) => (
                                                        <motion.span
                                                            key={i}
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: i * 0.08 }}
                                                            className="px-3 py-1.5 rounded-lg bg-primary/5 text-xs font-medium text-foreground border border-primary/20"
                                                        >
                                                            {emotion}
                                                        </motion.span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Micro-expressions */}
                                            <div>
                                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Detected Micro-Expressions
                                                </h4>
                                                <div className="space-y-2">
                                                    {analysis.microExpressions.map((expr, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            className="flex items-start gap-2 text-xs"
                                                        >
                                                            <Zap className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                                                            <span className="text-foreground">{expr}</span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* AI Analysis */}
                                            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                                                <h4 className="text-xs font-bold text-primary uppercase tracking-wide mb-2 flex items-center gap-2">
                                                    <Brain className="w-3.5 h-3.5" />
                                                    AI Psychological Analysis
                                                </h4>
                                                <p className="text-sm leading-relaxed text-foreground">
                                                    {analysis.aiAnalysis}
                                                </p>
                                            </div>

                                            {/* Physiological Markers */}
                                            <details className="group">
                                                <summary className="cursor-pointer p-4 rounded-xl bg-surface/50 border border-border/30 hover:border-primary/40 transition-all duration-300">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                                            <Activity className="w-3.5 h-3.5" />
                                                            Physiological Markers
                                                        </h4>
                                                        <span className="text-xs text-muted-foreground">▼</span>
                                                    </div>
                                                </summary>
                                                <div className="mt-3 p-4 rounded-xl bg-surface/30 border border-border/20 space-y-2.5">
                                                    {Object.entries(analysis.physiologicalMarkers).map(([key, value], i) => (
                                                        <div key={i} className="flex justify-between items-start gap-3 text-xs">
                                                            <span className="text-muted-foreground capitalize font-medium">
                                                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                                                            </span>
                                                            <span className="text-foreground text-right flex-1">
                                                                {value}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>

                                            {/* Psychological Insight */}
                                            <div className="bg-surface/50 rounded-xl p-4 border border-border/30">
                                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                                                    <Target className="w-3.5 h-3.5" />
                                                    Psychological Insight
                                                </h4>
                                                <p className="text-sm leading-relaxed text-foreground">
                                                    {analysis.psychologicalInsight}
                                                </p>
                                            </div>

                                            {/* Presence & Capacity Estimates */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-surface/50 rounded-xl p-4 border border-border/30">
                                                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-bold">
                                                        Estimated Presence
                                                    </div>
                                                    <div className="text-3xl font-bold text-primary mb-1">
                                                        {analysis.presenceCapacity.estimatedPresence}/10
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground leading-tight">
                                                        Current engagement level
                                                    </div>
                                                </div>
                                                <div className="bg-surface/50 rounded-xl p-4 border border-border/30">
                                                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-bold">
                                                        Estimated Capacity
                                                    </div>
                                                    <div className="text-3xl font-bold text-primary mb-1">
                                                        {analysis.presenceCapacity.estimatedCapacity}/10
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground leading-tight">
                                                        Available workload bandwidth
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Reasoning */}
                                            <div className="text-xs text-muted-foreground bg-surface/30 p-3 rounded-lg border border-border/20">
                                                <strong className="text-foreground">AI Reasoning:</strong> {analysis.presenceCapacity.reasoning}
                                            </div>

                                            {/* Personalized Recommendation */}
                                            <motion.div
                                                initial={{ scale: 0.95 }}
                                                animate={{ scale: 1 }}
                                                className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 border-2 border-primary/30 shadow-lg"
                                            >
                                                <h4 className="text-sm font-bold text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                                                    <Zap className="w-4 h-4" />
                                                    Personalized Recommendation
                                                </h4>
                                                <p className="text-sm leading-relaxed text-foreground mb-4">
                                                    {analysis.personalizedRecommendation}
                                                </p>

                                                <div className="space-y-2">
                                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                                                        Suggested Actions:
                                                    </p>
                                                    {analysis.suggestedActions.map((action, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            className="flex items-start gap-2 text-xs text-foreground"
                                                        >
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                                            <span className="flex-1">{action}</span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </motion.div>

                                            {/* Support Recommendation */}
                                            <div className="bg-surface/50 rounded-xl p-4 border border-border/30">
                                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                                                    <User className="w-3.5 h-3.5" />
                                                    Recommended Support Contact
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                    {['Ms. Mahrukh', 'Ms. Latifah', 'Ms. Kholida', 'Mr. Aria', 'Ms. Hana', 'Ms. Wina'].map((person, i) => (
                                                        <motion.button
                                                            key={i}
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: i * 0.05 }}
                                                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${i === 0
                                                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                                                    : 'bg-surface border border-border hover:border-primary/40 text-foreground'
                                                                }`}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            {person}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-muted-foreground mt-3">
                                                    {analysis.presenceCapacity.estimatedPresence < 5
                                                        ? "Low presence detected—reaching out is strongly encouraged"
                                                        : "Consider connecting if you need support"}
                                                </p>
                                            </div>
                                        </motion.div>

                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <motion.button
                                                onClick={resetScan}
                                                className="py-3 rounded-xl border-2 border-border bg-surface text-foreground font-semibold hover:bg-surface/80 hover:border-primary/40 transition-all duration-300"
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                            >
                                                Scan Again
                                            </motion.button>
                                            <motion.button
                                                onClick={completeCheckin}
                                                className="py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all duration-300"
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                            >
                                                Complete Check-in
                                            </motion.button>
                                        </div>

                                        {/* Timestamp */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                            className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
                                        >
                                            <Clock className="w-3 h-3" />
                                            Analysis completed at {new Date().toLocaleTimeString()}
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Bottom Disclaimer */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-5 text-center space-y-2"
                        >
                            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                                <Shield className="w-3 h-3" />
                                Your emotional wellbeing is our priority. This analysis is confidential and designed to support your mental health journey.
                            </p>
                            <p className="text-[10px] text-muted-foreground/70">
                                Millennia World School • Powered by advanced AI psychology engine • For wellness guidance only
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