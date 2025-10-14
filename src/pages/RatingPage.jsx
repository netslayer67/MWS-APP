import React, { memo, useState, useEffect, useMemo, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import AnimatedPage from "@/components/AnimatedPage";
import PageLoader from "@/components/PageLoader";
import { Helmet } from "react-helmet";
import { DUMMY_CHECKIN_DATA } from "@/lib/ratingConstants";
import { generateAnalysis, generateRecommendations } from "@/lib/ratingUtils";
import { DecorativeBlobs, GridPattern } from "@/components/rating/DecorativeElements";

// Lazy load components for code splitting
const HeaderSection = lazy(() => import("@/components/rating/HeaderSection"));
const StatusBadge = lazy(() => import("@/components/rating/StatusBadge"));
const MetricsGrid = lazy(() => import("@/components/rating/MetricsGrid"));
const RecommendationCard = lazy(() => import("@/components/rating/RecommendationCard"));
const SupportSection = lazy(() => import("@/components/rating/SupportSection"));
const BackHomeButton = lazy(() => import("@/components/rating/BackHomeButton"));

// ============= MAIN COMPONENT =============
const RatingPage = memo(function RatingPage() {
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    // Use location.state data if available, otherwise use dummy data for demo
    const checkInData = useMemo(() => {
        const data = location.state?.checkInData || DUMMY_CHECKIN_DATA;

        // Sanitize all string inputs
        return {
            ...data,
            name: data.name || "User",
            emotionsDetails: data.emotionsDetails || "",
            supportPerson: data.supportPerson || "No Need"
        };
    }, [location.state]);

    const analysis = useMemo(() => generateAnalysis(checkInData), [checkInData]);
    const recommendations = useMemo(() => generateRecommendations(analysis, checkInData), [analysis, checkInData]);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1500); // Reduced from 2500 to 1500 for better UX
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <AnimatedPage>
            <Helmet>
                <title>Emotional Wellness Results — Millennia World School</title>
                <meta name="description" content="Your personalized emotional wellness analysis and recommendations" />
            </Helmet>

            <div className="relative min-h-screen text-foreground overflow-hidden">
                <DecorativeBlobs />
                <GridPattern />

                <div className="relative z-10 min-h-screen flex items-center justify-center py-8 md:py-12 px-4 md:px-6">
                    <div className="w-full max-w-5xl space-y-6 md:space-y-8">
                        <Suspense fallback={<div className="h-32 animate-pulse bg-muted/20 rounded-lg" />}>
                            <HeaderSection name={checkInData.name} analysis={analysis} />
                        </Suspense>
                        <Suspense fallback={<div className="h-16 animate-pulse bg-muted/20 rounded-lg" />}>
                            <StatusBadge analysis={analysis} />
                        </Suspense>
                        <Suspense fallback={<div className="h-40 animate-pulse bg-muted/20 rounded-lg" />}>
                            <MetricsGrid data={checkInData} analysis={analysis} />
                        </Suspense>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                            className="space-y-4 md:space-y-6 px-2"
                        >
                            <motion.h2
                                className="text-lg md:text-2xl font-semibold text-foreground text-center"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.75, duration: 0.5 }}
                            >
                                Personalized Recommendations
                            </motion.h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-5">
                                {recommendations.map((rec, index) => (
                                    <Suspense key={index} fallback={<div className="h-32 animate-pulse bg-muted/20 rounded-lg" />}>
                                        <RecommendationCard recommendation={rec} index={index} />
                                    </Suspense>
                                ))}
                            </div>
                        </motion.div>

                        <Suspense fallback={<div className="h-24 animate-pulse bg-muted/20 rounded-lg" />}>
                            <SupportSection
                                supportPerson={checkInData.supportPerson}
                                needsSupport={analysis.needsSupport}
                            />
                        </Suspense>

                        <Suspense fallback={<div className="h-16 animate-pulse bg-muted/20 rounded-lg" />}>
                            <BackHomeButton />
                        </Suspense>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
});

RatingPage.displayName = 'RatingPage';

export default RatingPage;