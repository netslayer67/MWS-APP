import React, { useState, memo } from "react";
import { Helmet } from "react-helmet";
import AnimatedPage from "@/components/AnimatedPage";
import WelcomeSection from "@/components/emotion-staff/WelcomeSection";
import WeatherSelector from "@/components/emotion-staff/WeatherSelector";
import MoodSelector from "@/components/emotion-staff/MoodSelector";
import DetailsInput from "@/components/emotion-staff/DetailsInput";
import PresenceSlider from "@/components/emotion-staff/PresenceSlider";
import CapacitySlider from "@/components/emotion-staff/CapacitySlider";
import SupportSelector from "@/components/emotion-staff/SupportSelector";
import SubmitSection from "@/components/emotion-staff/SubmitSection";
import DecorativeElements from "@/components/emotion-staff/DecorativeElements";

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

    const handleSubmit = async () => {
        if (!selectedWeather || selectedMoods.length === 0) return;

        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            alert("Thank you for your check-in! Your well-being matters to us.");
            setIsSubmitting(false);
        }, 1500);
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
                            <WeatherSelector
                                selectedWeather={selectedWeather}
                                onWeatherSelect={setSelectedWeather}
                            />

                            <MoodSelector
                                selectedMoods={selectedMoods}
                                onMoodToggle={toggleMood}
                            />

                            <DetailsInput
                                details={details}
                                onDetailsChange={setDetails}
                            />

                            <PresenceSlider
                                presence={presence}
                                onPresenceChange={setPresence}
                            />

                            <CapacitySlider
                                capacity={capacity}
                                onCapacityChange={setCapacity}
                            />

                            <SupportSelector
                                supportContact={supportContact}
                                onSupportChange={setSupportContact}
                            />

                            <SubmitSection
                                onSubmit={handleSubmit}
                                isSubmitting={isSubmitting}
                                isValid={isValid}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
});

EmotionalCheckinStaffPage.displayName = 'EmotionalCheckinStaffPage';
export default EmotionalCheckinStaffPage;