import React, { useState, memo, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AnimatedPage from "@/components/AnimatedPage";
import { Helmet } from "react-helmet";
import { Smile, Frown, Meh, Heart, Save, Send, Camera, Brain, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import checkinService from "@/services/checkinService";

/* --- Mood options --- */
const moodOptions = [
    { icon: Smile, label: "Happy", value: "happy", color: "text-green-500" },
    { icon: Heart, label: "Excited", value: "excited", color: "text-red-500" },
    { icon: Meh, label: "Okay", value: "okay", color: "text-yellow-500" },
    { icon: Frown, label: "Sad", value: "sad", color: "text-blue-500" },
];

/* --- Decorative Blob --- */
const DecorativeBlob = memo(({ className, animate }) => (
    <motion.div
        className={`absolute rounded-full blur-3xl ${className}`}
        animate={animate ? {
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
        } : {}}
        transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
        }}
    />
));

/* --- Sanitize input --- */
const sanitizeInput = (value) => {
    return String(value || "")
        .replace(/<[^>]*>?/gm, "")
        .replace(/https?:\/\/\S+/g, "")
        .replace(/(script|onerror|onload|data:|vbscript:)/gi, "")
        .trim()
        .slice(0, 500);
};

const EmotionalCheckinPage = memo(function EmotionalCheckinPage() {
    const [selectedMood, setSelectedMood] = useState(null);
    const [reflection, setReflection] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkinStatus, setCheckinStatus] = useState(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);
    const navigate = useNavigate();
    const { toast } = useToast();

    // Load check-in status on component mount
    useEffect(() => {
        const loadCheckinStatus = async () => {
            try {
                const response = await checkinService.getTodayCheckinStatus();
                setCheckinStatus(response.data.status);
            } catch (error) {
                console.error('Failed to load check-in status:', error);
                toast({
                    title: "Error",
                    description: "Failed to load check-in status. Please refresh the page.",
                    variant: "destructive"
                });
            } finally {
                setIsLoadingStatus(false);
            }
        };

        loadCheckinStatus();
    }, [toast]);

    const handleSubmit = async () => {
        if (!selectedMood) return;

        setIsSubmitting(true);
        try {
            // Submit manual check-in
            const checkinData = {
                weatherType: 'sunny', // Default weather for manual check-in
                selectedMoods: [selectedMood],
                details: reflection,
                presenceLevel: 7, // Default values for manual check-in
                capacityLevel: 7,
                supportContactUserId: 'no_need'
            };

            await checkinService.submitCheckin(checkinData);

            toast({
                title: "Check-in Successful",
                description: "Your manual check-in has been saved successfully!",
            });

            // Reload status to update UI
            const response = await checkinService.getTodayCheckinStatus();
            setCheckinStatus(response.data.status);

            // Reset form
            setSelectedMood(null);
            setReflection("");

        } catch (error) {
            console.error('Check-in submission failed:', error);
            toast({
                title: "Check-in Failed",
                description: error.response?.data?.message || "Failed to save your check-in. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatedPage>
            <Helmet>
                <title>Student Emotional Check-in — Kerjain</title>
            </Helmet>

            <div className="min-h-screen text-foreground relative overflow-hidden">
                {/* Background elements */}
                <DecorativeBlob className="-top-40 -left-40 w-96 h-96 bg-primary/10" animate />
                <DecorativeBlob className="-bottom-40 -right-40 w-80 h-80 bg-accent/10" animate />
                <DecorativeBlob className="top-1/2 left-1/2 w-64 h-64 bg-gold/10" animate />
                <div className="absolute inset-0 bg-grid-small opacity-5 dark:opacity-10" />

                <div className="container mx-auto px-4 py-8 relative z-10">
                    <div className="max-w-md mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-center mb-8"
                        >
                            <h1 className="text-3xl font-bold text-foreground mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                                🌟 How are you feeling today?
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Your feelings matter! Share how you're doing so we can support you.
                            </p>
                        </motion.div>

                        {/* Mood selection */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="glass-strong rounded-2xl p-6 mb-6"
                        >
                            <h2 className="text-lg font-semibold text-foreground mb-4">Select your mood</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {moodOptions.map((mood) => {
                                    const Icon = mood.icon;
                                    const isSelected = selectedMood === mood.value;
                                    return (
                                        <motion.button
                                            key={mood.value}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedMood(mood.value)}
                                            className={`p-4 rounded-xl border-2 transition-all duration-300 ${isSelected
                                                ? "border-primary bg-primary/10 shadow-lg"
                                                : "border-border/40 bg-card/50 hover:border-border/60"
                                                }`}
                                        >
                                            <Icon className={`w-8 h-8 mx-auto mb-2 ${mood.color}`} />
                                            <span className="text-sm font-medium text-foreground">{mood.label}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Reflection */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="glass-strong rounded-2xl p-6 mb-6"
                        >
                            <h2 className="text-lg font-semibold text-foreground mb-4">
                                Share your thoughts (optional)
                            </h2>
                            <Textarea
                                value={reflection}
                                onChange={(e) => setReflection(sanitizeInput(e.target.value))}
                                placeholder="What's on your mind today?"
                                className="min-h-[100px] resize-none transition-all duration-300"
                                maxLength={500}
                            />
                            <div className="text-xs text-muted-foreground mt-2">
                                {reflection.length}/500 characters
                            </div>
                        </motion.div>

                        {/* Check-in Status Indicators */}
                        {checkinStatus && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.25 }}
                                className="glass-strong rounded-2xl p-4 mb-6"
                            >
                                <h3 className="text-sm font-semibold text-foreground mb-3">Today's Check-in Status</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className={`flex items-center gap-2 p-3 rounded-lg ${checkinStatus.hasManualCheckin ? 'bg-green-500/10 border border-green-500/30' : 'bg-muted/50 border border-border/40'}`}>
                                        {checkinStatus.hasManualCheckin ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-muted-foreground" />
                                        )}
                                        <span className="text-xs font-medium text-foreground">Manual Check-in</span>
                                    </div>
                                    <div className={`flex items-center gap-2 p-3 rounded-lg ${checkinStatus.hasAICheckin ? 'bg-green-500/10 border border-green-500/30' : 'bg-muted/50 border border-border/40'}`}>
                                        {checkinStatus.hasAICheckin ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-muted-foreground" />
                                        )}
                                        <span className="text-xs font-medium text-foreground">AI Analysis</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Check-in Options */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                            className="space-y-4"
                        >
                            {/* Manual Check-in */}
                            <div className="space-y-2">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!selectedMood || isSubmitting || (checkinStatus && checkinStatus.hasManualCheckin)}
                                    className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover-card transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <Save className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4 mr-2" />
                                    )}
                                    {isSubmitting ? "Saving..." : checkinStatus?.hasManualCheckin ? "Manual Check-in Completed" : "Manual Check-in"}
                                </Button>
                                {checkinStatus?.hasManualCheckin && (
                                    <p className="text-xs text-green-600 text-center font-medium">
                                        ✅ You have already completed manual check-in today
                                    </p>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-px bg-border" />
                                <span className="text-xs text-muted-foreground font-medium">OR</span>
                                <div className="flex-1 h-px bg-border" />
                            </div>

                            {/* AI Emotional Analysis */}
                            <div className="space-y-2">
                                <Button
                                    onClick={() => navigate('/emotional-checkin/face-scan')}
                                    disabled={checkinStatus && checkinStatus.hasAICheckin}
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    variant="outline"
                                >
                                    <Brain className="w-4 h-4 mr-2" />
                                    <Camera className="w-4 h-4 mr-2" />
                                    {checkinStatus?.hasAICheckin ? "AI Analysis Completed" : "AI Emotional Analysis"}
                                </Button>
                                {checkinStatus?.hasAICheckin && (
                                    <p className="text-xs text-green-600 text-center font-medium">
                                        ✅ You have already completed AI analysis today
                                    </p>
                                )}
                                {!checkinStatus?.hasAICheckin && (
                                    <p className="text-xs text-muted-foreground text-center">
                                        Advanced AI facial analysis for accurate emotional insights
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
});

EmotionalCheckinPage.displayName = 'EmotionalCheckinPage';

export default EmotionalCheckinPage;