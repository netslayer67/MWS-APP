import React, { useState, memo, Suspense, lazy } from "react";
import { Helmet } from "react-helmet";
import AnimatedPage from "@/components/AnimatedPage";
import DecorativeElements from "@/components/emotion-staff/DecorativeElements";
import { useToast } from "@/components/ui/use-toast";

// Lazy load components for better performance
const WelcomeSection = lazy(() => import("@/components/emotion-staff/WelcomeSection"));
const WeatherSelector = lazy(() => import("@/components/emotion-staff/WeatherSelector"));
const MoodSelector = lazy(() => import("@/components/emotion-staff/MoodSelector"));
const DetailsInput = lazy(() => import("@/components/emotion-staff/DetailsInput"));
const PresenceSlider = lazy(() => import("@/components/emotion-staff/PresenceSlider"));
const CapacitySlider = lazy(() => import("@/components/emotion-staff/CapacitySlider"));
const SupportSelector = lazy(() => import("@/components/emotion-staff/SupportSelector"));
const SubmitSection = lazy(() => import("@/components/emotion-staff/SubmitSection"));

// Loading fallback component
const ComponentLoader = memo(() => (
    <div className="glass glass-card animate-pulse">
        <div className="glass__refract" />
        <div className="glass__noise" />
        <div className="p-5 md:p-6 space-y-4">
            <div className="h-6 bg-muted/20 rounded animate-pulse" />
            <div className="h-4 bg-muted/20 rounded animate-pulse" />
            <div className="h-32 bg-muted/20 rounded animate-pulse" />
        </div>
    </div>
));

ComponentLoader.displayName = 'ComponentLoader';

const EmotionalCheckinStaffPage = memo(function EmotionalCheckinStaffPage() {
    const [selectedWeather, setSelectedWeather] = useState(null);
    const [selectedMoods, setSelectedMoods] = useState([]);
    const [details, setDetails] = useState("");
    const [presence, setPresence] = useState([5]);
    const [capacity, setCapacity] = useState([5]);
    const [supportContact, setSupportContact] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleMood = (mood) => {
        setSelectedMoods(prev =>
            prev.includes(mood)
                ? prev.filter(m => m !== mood)
                : [...prev, mood]
        );
    };

    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!selectedWeather || selectedMoods.length === 0) return;

        setIsSubmitting(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast({
                title: "Check-in Submitted Successfully! 🎉",
                description: "Thank you for sharing your feelings. Your well-being matters to us.",
                duration: 5000,
            });

            // Reset form
            setSelectedWeather(null);
            setSelectedMoods([]);
            setDetails("");
            setPresence([5]);
            setCapacity([5]);
            setSupportContact("");
        } catch (error) {
            toast({
                title: "Submission Failed",
                description: "Please try again. If the problem persists, contact support.",
                variant: "destructive",
                duration: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValid = selectedWeather && selectedMoods.length > 0;

    return (
        <AnimatedPage>
            <Helmet>
                <title>Staff Emotional Check-in — MWS</title>
                <meta name="description" content="Daily emotional wellness check-in for Millennia World School staff" />
            </Helmet>

            <div className="relative min-h-screen text-foreground overflow-hidden">
                <DecorativeElements />

                <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-6">
                    <div className="w-full max-w-2xl space-y-6 md:space-y-8">
                        <WelcomeSection />

                        <div className="space-y-4 md:space-y-6">
                            <Suspense fallback={<ComponentLoader />}>
                                <WeatherSelector
                                    selectedWeather={selectedWeather}
                                    onWeatherSelect={setSelectedWeather}
                                />
                            </Suspense>

                            <Suspense fallback={<ComponentLoader />}>
                                <MoodSelector
                                    selectedMoods={selectedMoods}
                                    onMoodToggle={toggleMood}
                                />
                            </Suspense>

                            <Suspense fallback={<ComponentLoader />}>
                                <DetailsInput
                                    details={details}
                                    onDetailsChange={setDetails}
                                />
                            </Suspense>

                            <Suspense fallback={<ComponentLoader />}>
                                <PresenceSlider
                                    presence={presence}
                                    onPresenceChange={setPresence}
                                />
                            </Suspense>

                            <Suspense fallback={<ComponentLoader />}>
                                <CapacitySlider
                                    capacity={capacity}
                                    onCapacityChange={setCapacity}
                                />
                            </Suspense>

                            <Suspense fallback={<ComponentLoader />}>
                                <SupportSelector
                                    supportContact={supportContact}
                                    onSupportChange={setSupportContact}
                                />
                            </Suspense>

                            <Suspense fallback={<ComponentLoader />}>
                                <SubmitSection
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isValid={isValid}
                                />
                            </Suspense>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
});

EmotionalCheckinStaffPage.displayName = 'EmotionalCheckinStaffPage';
export default EmotionalCheckinStaffPage;