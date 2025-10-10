import React, { useState, memo, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import AnimatedPage from "@/components/AnimatedPage";
import { Helmet } from "react-helmet";
import { Sun, Cloud, CloudRain, Zap, Tornado, Snowflake, Rainbow, Eye, Wind, Flame, Send, Heart, Camera, Brain, CheckCircle, AlertCircle } from "lucide-react";

/* --- Weather options --- */
const weatherOptions = [
    { icon: Sun, label: "Sunny and Clear", desc: "Feeling upbeat, calm, and full of clarity", value: "sunny", color: "text-yellow-500" },
    { icon: Cloud, label: "Partly Cloudy", desc: "Doing alright, mild stress or distraction", value: "cloudy", color: "text-gray-500" },
    { icon: CloudRain, label: "Light Rain", desc: "A little heavy emotionally, reflective or tired", value: "rain", color: "text-blue-500" },
    { icon: Zap, label: "Thunderstorms", desc: "Intense feelings—frustration, anxiety, overload", value: "storm", color: "text-purple-500" },
    { icon: Tornado, label: "Tornado Watch", desc: "Everything feels chaotic, hard to focus", value: "tornado", color: "text-red-500" },
    { icon: Snowflake, label: "Snowy and Still", desc: "Feeling slow, introspective, or frozen", value: "snow", color: "text-cyan-500" },
    { icon: Rainbow, label: "Post-Storm Rainbow", desc: "Through difficulty, hope and beauty emerging", value: "rainbow", color: "text-pink-500" },
    { icon: Eye, label: "Foggy", desc: "Mentally fuzzy, unclear, looking for direction", value: "foggy", color: "text-indigo-500" },
    { icon: Flame, label: "Heatwave", desc: "Energetic but burnt out or overstimulated", value: "heatwave", color: "text-orange-500" },
    { icon: Wind, label: "Windy", desc: "Restless, scattered, or in transition", value: "windy", color: "text-teal-500" },
];

/* --- Mood checkboxes --- */
const moodCheckboxes = [
    "Happy / Bahagia", "Excited / Semangat", "Sad / Sedih", "Anxious / Cemas",
    "Hungry / Lapar", "Tired / Lelah", "Lonely / Kesepian", "Bored / Bosan",
    "Overwhelmed / Kewalahan", "Scattered / Buyar", "Hopeful / Penuh Harap",
    "Angry / Marah", "Fear / Takut", "Calm / Tenang"
];

/* --- Support contacts --- */
const supportContacts = [
    "Ms. Mahrukh", "Ms. Latifah", "Ms. Kholida", "Mr. Aria",
    "Ms. Hana", "Ms. Wina", "Ms. Sarah", "Ms. Hanny",
    "Pak Dodi", "Pak Faisal", "No Need"
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
        .slice(0, 1000);
};

const EmotionalCheckinStaffPage = memo(function EmotionalCheckinStaffPage() {
    const [step, setStep] = useState('face-scan'); // 'face-scan', 'form', 'complete'
    const [selectedWeather, setSelectedWeather] = useState(null);
    const [selectedMoods, setSelectedMoods] = useState([]);
    const [details, setDetails] = useState("");
    const [presence, setPresence] = useState([5]);
    const [capacity, setCapacity] = useState([5]);
    const [supportContact, setSupportContact] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Face scan states
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);

    const toggleMood = (mood) => {
        setSelectedMoods(prev =>
            prev.includes(mood)
                ? prev.filter(m => m !== mood)
                : [...prev, mood]
        );
    };

    const startFaceScan = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setIsScanning(true);
        } catch (error) {
            alert("Camera access denied. Please allow camera access to proceed with AI emotion analysis.");
        }
    };

    const performAIScan = async () => {
        setIsScanning(false);
        // Simulate AI analysis
        setTimeout(() => {
            const analyses = [
                {
                    detectedEmotion: "mild stress",
                    confidence: 87,
                    insights: "Your facial expressions suggest you're carrying some tension. This might be related to workload or personal concerns.",
                    recommendation: "Consider taking a short break or discussing your feelings with a trusted colleague."
                },
                {
                    detectedEmotion: "genuine calm",
                    confidence: 92,
                    insights: "Your expression shows authentic peace and focus. You're handling things well today.",
                    recommendation: "Keep up the good work! Your positive energy is valuable to the team."
                },
                {
                    detectedEmotion: "subtle fatigue",
                    confidence: 78,
                    insights: "There are signs of tiredness in your eyes and posture. You might benefit from rest.",
                    recommendation: "Ensure you're getting adequate sleep and consider workload adjustments if needed."
                }
            ];
            const randomAnalysis = analyses[Math.floor(Math.random() * analyses.length)];
            setAiAnalysis(randomAnalysis);
            setScanComplete(true);
        }, 2000);
    };

    const proceedToForm = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setStep('form');
    };

    const handleSubmit = async () => {
        if (!selectedWeather || selectedMoods.length === 0) return;

        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            alert("Thank you for your check-in! Your well-being matters to us.");
            setStep('complete');
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <AnimatedPage>
            <Helmet>
                <title>Staff Emotional Check-in — Kerjain</title>
            </Helmet>

            <div className="min-h-screen text-foreground relative overflow-hidden">
                {/* Background elements */}
                <DecorativeBlob className="-top-40 -left-40 w-96 h-96 bg-primary/10" animate />
                <DecorativeBlob className="-bottom-40 -right-40 w-80 h-80 bg-accent/10" animate />
                <DecorativeBlob className="top-1/4 right-1/4 w-72 h-72 bg-gold/10" animate />
                <DecorativeBlob className="bottom-1/4 left-1/4 w-64 h-64 bg-emerald/10" animate />
                <div className="absolute inset-0 bg-grid-small opacity-5 dark:opacity-10" />

                <div className="container mx-auto px-4 py-8 relative z-10">
                    <div className="max-w-2xl mx-auto">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-center mb-8"
                        >
                            <h1 className="text-3xl font-bold text-foreground mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                                🌈 Daily Emotional Check-In
                            </h1>
                            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                                Dear valued educator, your well-being is our priority. Take a moment to reflect on your emotional weather today.
                            </p>
                        </motion.div>

                        {/* Weather selection */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="glass-strong rounded-2xl p-6 mb-6"
                        >
                            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Sun className="w-5 h-5 text-yellow-500" />
                                What is your internal weather report?
                            </h2>
                            <p className="text-sm text-muted-foreground mb-4">
                                Describe the type of weather you're experiencing internally.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {weatherOptions.map((weather) => {
                                    const Icon = weather.icon;
                                    const isSelected = selectedWeather === weather.value;
                                    return (
                                        <motion.button
                                            key={weather.value}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedWeather(weather.value)}
                                            className={`p-3 rounded-xl border-2 transition-all duration-300 text-center ${isSelected
                                                ? "border-primary bg-primary/10 shadow-lg"
                                                : "border-border/40 bg-card/50 hover:border-border/60"
                                                }`}
                                        >
                                            <Icon className={`w-6 h-6 mx-auto mb-2 ${weather.color}`} />
                                            <span className="text-xs font-medium text-foreground">{weather.label}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Mood checkboxes */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="glass-strong rounded-2xl p-6 mb-6"
                        >
                            <h2 className="text-xl font-semibold text-foreground mb-4">
                                Today I am... (check all that apply)
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {moodCheckboxes.map((mood) => (
                                    <label key={mood} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedMoods.includes(mood)}
                                            onChange={() => toggleMood(mood)}
                                            className="rounded border-border/40 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-foreground">{mood}</span>
                                    </label>
                                ))}
                            </div>
                        </motion.div>

                        {/* Details */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                            className="glass-strong rounded-2xl p-6 mb-6"
                        >
                            <h2 className="text-xl font-semibold text-foreground mb-4">
                                Give a few details as to why you feel that way
                            </h2>
                            <Textarea
                                value={details}
                                onChange={(e) => setDetails(sanitizeInput(e.target.value))}
                                placeholder="Share what's contributing to your current emotional state..."
                                className="min-h-[100px] resize-none transition-all duration-300"
                                maxLength={1000}
                            />
                            <div className="text-xs text-muted-foreground mt-2">
                                {details.length}/1000 characters
                            </div>
                        </motion.div>

                        {/* Presence scale */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                            className="glass-strong rounded-2xl p-6 mb-6"
                        >
                            <h2 className="text-xl font-semibold text-foreground mb-4">
                                Current Presence (Heart & Mind)
                            </h2>
                            <p className="text-sm text-muted-foreground mb-4">
                                On a scale of 1-10, rate your current presence.
                            </p>
                            <div className="space-y-3">
                                <Slider
                                    value={presence}
                                    onValueChange={setPresence}
                                    max={10}
                                    min={1}
                                    step={1}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>1 - Completely preoccupied</span>
                                    <span className="font-semibold text-primary">{presence[0]}</span>
                                    <span>10 - Completely present</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Capacity scale */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.5 }}
                            className="glass-strong rounded-2xl p-6 mb-6"
                        >
                            <h2 className="text-xl font-semibold text-foreground mb-4">
                                Current Capacity (Workload)
                            </h2>
                            <p className="text-sm text-muted-foreground mb-4">
                                On a scale of 1-10, rate your current capacity.
                            </p>
                            <div className="space-y-3">
                                <Slider
                                    value={capacity}
                                    onValueChange={setCapacity}
                                    max={10}
                                    min={1}
                                    step={1}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>1 - Totally overwhelmed</span>
                                    <span className="font-semibold text-primary">{capacity[0]}</span>
                                    <span>10 - Ready for new projects</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Support contact */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.6 }}
                            className="glass-strong rounded-2xl p-6 mb-6"
                        >
                            <h2 className="text-xl font-semibold text-foreground mb-4">
                                Support Request
                            </h2>
                            <p className="text-sm text-muted-foreground mb-4">
                                It would be helpful if the following checked in with me today.
                            </p>
                            <select
                                value={supportContact}
                                onChange={(e) => setSupportContact(e.target.value)}
                                className="w-full p-3 rounded-lg border border-border/40 bg-card/60 backdrop-blur transition-all duration-300"
                            >
                                <option value="">Select a contact...</option>
                                {supportContacts.map((contact) => (
                                    <option key={contact} value={contact}>{contact}</option>
                                ))}
                            </select>
                        </motion.div>

                        {/* Submit */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.7 }}
                            className="flex gap-3"
                        >
                            <Button
                                onClick={handleSubmit}
                                disabled={!selectedWeather || selectedMoods.length === 0 || isSubmitting}
                                className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover-card transition-all duration-300"
                            >
                                {isSubmitting ? (
                                    <Heart className="w-4 h-4 mr-2 animate-pulse" />
                                ) : (
                                    <Send className="w-4 h-4 mr-2" />
                                )}
                                {isSubmitting ? "Submitting..." : "Complete Check-In"}
                            </Button>
                        </motion.div>

                        {/* Footer message */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.8 }}
                            className="text-center mt-8 p-4 glass rounded-xl"
                        >
                            <p className="text-sm text-muted-foreground">
                                Thank you for your dedication. Your well-being helps create a supportive environment for everyone.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
});

/* --- Face Scan Step Component --- */
const FaceScanStep = memo(({ isScanning, scanComplete, aiAnalysis, videoRef, onStartScan, onPerformScan, onProceed }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
    >
        <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">AI Face Verification</h2>
            <p className="text-muted-foreground">Our AI psychologist will analyze your facial expressions for authentic emotional insights.</p>
        </div>

        <div className="glass-strong rounded-2xl p-6">
            {!isScanning && !scanComplete && (
                <div className="text-center space-y-4">
                    <Camera className="w-16 h-16 text-primary mx-auto" />
                    <p className="text-foreground">Click to start face scan verification</p>
                    <Button onClick={onStartScan} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover-card transition-all duration-300">
                        <Camera className="w-4 h-4 mr-2" />
                        Start Face Scan
                    </Button>
                </div>
            )}

            {isScanning && (
                <div className="text-center space-y-4">
                    <div className="relative mx-auto w-64 h-48 bg-card rounded-xl overflow-hidden">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 border-2 border-primary rounded-xl animate-pulse" />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <Brain className="w-5 h-5 text-accent animate-pulse" />
                        <p className="text-foreground">AI analyzing your expressions...</p>
                    </div>
                    <Button onClick={onPerformScan} className="bg-accent text-accent-foreground hover-card transition-all duration-300">
                        Complete Scan
                    </Button>
                </div>
            )}

            {scanComplete && aiAnalysis && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-500">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Scan Complete</span>
                    </div>

                    <div className="bg-card/50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-foreground">Detected Emotion:</span>
                            <span className="font-semibold text-primary capitalize">{aiAnalysis.detectedEmotion}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-foreground">Confidence:</span>
                            <span className="font-semibold text-accent">{aiAnalysis.confidence}%</span>
                        </div>
                        <div className="pt-2 border-t border-border/40">
                            <p className="text-sm text-muted-foreground mb-2">AI Insights:</p>
                            <p className="text-sm text-foreground">{aiAnalysis.insights}</p>
                        </div>
                        <div className="pt-2 border-t border-border/40">
                            <p className="text-sm text-muted-foreground mb-2">Recommendation:</p>
                            <p className="text-sm text-foreground">{aiAnalysis.recommendation}</p>
                        </div>
                    </div>

                    <Button onClick={onProceed} className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover-card transition-all duration-300">
                        Proceed to Check-in
                    </Button>
                </div>
            )}
        </div>
    </motion.div>
));

FaceScanStep.displayName = 'FaceScanStep';

/* --- Check-in Form Component --- */
const CheckInForm = memo(({
    selectedWeather, setSelectedWeather, selectedMoods, toggleMood,
    details, setDetails, presence, setPresence, capacity, setCapacity,
    supportContact, setSupportContact, onSubmit, isSubmitting
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
    >
        {/* Weather selection */}
        <div className="glass-strong rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Sun className="w-5 h-5 text-yellow-500" />
                What is your internal weather report?
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
                Describe the type of weather you're experiencing internally.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {weatherOptions.map((weather) => {
                    const Icon = weather.icon;
                    const isSelected = selectedWeather === weather.value;
                    return (
                        <motion.button
                            key={weather.value}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedWeather(weather.value)}
                            className={`p-3 rounded-xl border-2 transition-all duration-300 text-center ${isSelected
                                    ? "border-primary bg-primary/10 shadow-lg"
                                    : "border-border/40 bg-card/50 hover:border-border/60"
                                }`}
                        >
                            <Icon className={`w-6 h-6 mx-auto mb-2 ${weather.color}`} />
                            <span className="text-xs font-medium text-foreground">{weather.label}</span>
                        </motion.button>
                    );
                })}
            </div>
        </div>

        {/* Mood checkboxes */}
        <div className="glass-strong rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
                Today I am... (check all that apply)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {moodCheckboxes.map((mood) => (
                    <label key={mood} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selectedMoods.includes(mood)}
                            onChange={() => toggleMood(mood)}
                            className="rounded border-border/40 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">{mood}</span>
                    </label>
                ))}
            </div>
        </div>

        {/* Details */}
        <div className="glass-strong rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
                Give a few details as to why you feel that way
            </h2>
            <Textarea
                value={details}
                onChange={(e) => setDetails(sanitizeInput(e.target.value))}
                placeholder="Share what's contributing to your current emotional state..."
                className="min-h-[100px] resize-none transition-all duration-300"
                maxLength={1000}
            />
            <div className="text-xs text-muted-foreground mt-2">
                {details.length}/1000 characters
            </div>
        </div>

        {/* Presence scale */}
        <div className="glass-strong rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
                Current Presence (Heart & Mind)
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
                On a scale of 1-10, rate your current presence.
            </p>
            <div className="space-y-3">
                <Slider
                    value={presence}
                    onValueChange={setPresence}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 - Completely preoccupied</span>
                    <span className="font-semibold text-primary">{presence[0]}</span>
                    <span>10 - Completely present</span>
                </div>
            </div>
        </div>

        {/* Capacity scale */}
        <div className="glass-strong rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
                Current Capacity (Workload)
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
                On a scale of 1-10, rate your current capacity.
            </p>
            <div className="space-y-3">
                <Slider
                    value={capacity}
                    onValueChange={setCapacity}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 - Totally overwhelmed</span>
                    <span className="font-semibold text-primary">{capacity[0]}</span>
                    <span>10 - Ready for new projects</span>
                </div>
            </div>
        </div>

        {/* Support contact */}
        <div className="glass-strong rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
                Support Request
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
                It would be helpful if the following checked in with me today.
            </p>
            <select
                value={supportContact}
                onChange={(e) => setSupportContact(e.target.value)}
                className="w-full p-3 rounded-lg border border-border/40 bg-card/60 backdrop-blur transition-all duration-300"
            >
                <option value="">Select a contact...</option>
                {supportContacts.map((contact) => (
                    <option key={contact} value={contact}>{contact}</option>
                ))}
            </select>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
            <Button
                onClick={onSubmit}
                disabled={!selectedWeather || selectedMoods.length === 0 || isSubmitting}
                className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover-card transition-all duration-300"
            >
                {isSubmitting ? (
                    <Heart className="w-4 h-4 mr-2 animate-pulse" />
                ) : (
                    <Send className="w-4 h-4 mr-2" />
                )}
                {isSubmitting ? "Submitting..." : "Complete Check-In"}
            </Button>
        </div>

        {/* Footer message */}
        <div className="text-center mt-8 p-4 glass rounded-xl">
            <p className="text-sm text-muted-foreground">
                Thank you for your dedication. Your well-being helps create a supportive environment for everyone.
            </p>
        </div>
    </motion.div>
));

CheckInForm.displayName = 'CheckInForm';

/* --- Completion Step Component --- */
const CompletionStep = memo(() => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-6"
    >
        <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-primary-foreground" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Check-in Complete!</h2>
            <p className="text-muted-foreground">
                Thank you for sharing your authentic emotions. Your well-being matters to our community.
            </p>
        </div>
        <div className="glass rounded-2xl p-6">
            <p className="text-sm text-foreground">
                Remember: Your emotional health is just as important as your professional excellence.
                We're here to support you every step of the way.
            </p>
        </div>
    </motion.div>
));

CompletionStep.displayName = 'CompletionStep';

EmotionalCheckinStaffPage.displayName = 'EmotionalCheckinStaffPage';

export default EmotionalCheckinStaffPage;