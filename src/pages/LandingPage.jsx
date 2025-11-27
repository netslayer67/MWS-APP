import { memo, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DecorativeBlob from "../components/ui/DecorativeBlob";
import GridPattern from "../components/ui/GridPattern";
import HeroSection from "../components/ui/HeroSection";
import Footer from "../components/ui/Footer";
import InstallButton from "../components/ui/InstallButton";

/* --- Main Component --- */
const LandingPage = memo(function LandingPage() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    // If authenticated, route by role: staff/teacher -> profile, head_unit/directorate -> select-role
    useEffect(() => {
        if (!isAuthenticated) return;
        const role = (user?.role || '').toLowerCase();
        const shouldSeeProfile = role === 'student';

        if (shouldSeeProfile) {
            navigate('/profile', { replace: true });
            return;
        }

        navigate('/support-hub', { replace: true });
    }, [isAuthenticated, user, navigate]);

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* SEO */}
            <title>MWS IntegraLearn - Premium Education Platform</title>

            {/* Decorative Background */}
            <DecorativeBlob variant="primary" className="-top-32 -left-32 md:-top-40 md:-left-40" size="lg" />
            <DecorativeBlob variant="gold" className="top-1/4 -right-24 md:right-1/4" size="md" />
            <DecorativeBlob variant="emerald" className="-bottom-32 left-1/4 md:bottom-1/4 md:left-1/3" size="md" />
            <GridPattern />

            {/* Hero Section */}
            <HeroSection />

            <InstallButton />
            {/* Footer */}
            <Footer />

            {/* PWA Install Button */}
        </div>
    );
});

LandingPage.displayName = 'LandingPage';

export default LandingPage;
