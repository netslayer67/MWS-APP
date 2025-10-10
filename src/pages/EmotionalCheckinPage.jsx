import React, { useState, memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AnimatedPage from "@/components/AnimatedPage";
import { Helmet } from "react-helmet";
import { Smile, Frown, Meh, Heart, Save, Send } from "lucide-react";

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

    const handleSubmit = async () => {
        if (!selectedMood) return;

        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            alert("Check-in saved successfully!");
            setSelectedMood(null);
            setReflection("");
            setIsSubmitting(false);
        }, 1000);
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

                        {/* Submit */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                            className="flex gap-3"
                        >
                            <Button
                                onClick={handleSubmit}
                                disabled={!selectedMood || isSubmitting}
                                className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover-card transition-all duration-300"
                            >
                                {isSubmitting ? (
                                    <Save className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4 mr-2" />
                                )}
                                {isSubmitting ? "Saving..." : "Submit Check-in"}
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
});

EmotionalCheckinPage.displayName = 'EmotionalCheckinPage';

export default EmotionalCheckinPage;