import React, { memo, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import BackgroundDecor from '@/components/app/BackgroundDecor';
import UtilityDock from '@/components/app/UtilityDock';
import AppHelmet from '@/components/app/AppHelmet';
import SkipLink from '@/components/app/SkipLink';
import RouteConfig from '@/components/app/RouteConfig';
import GlobalLoadingOverlay from '@/components/app/GlobalLoadingOverlay';


const App = memo(() => {
    const location = useLocation();

    useEffect(() => {
        AOS.init({
            duration: 800,
            easing: 'ease-out-quart',
            offset: 60,
            once: true,
        });
    }, []);

    useEffect(() => {
        AOS.refresh();
    }, [location.pathname]);

    // Memoize key for AnimatePresence to prevent unnecessary re-renders
    const animatePresenceKey = useMemo(() => location.pathname, [location.pathname]);

    return (
        <>
            <AppHelmet />
            <SkipLink />

            <div className="relative min-h-screen bg-background text-foreground">
                <BackgroundDecor />

                <AnimatePresence mode="wait" key={animatePresenceKey}>
                    <RouteConfig />
                </AnimatePresence>

                <UtilityDock />
                <GlobalLoadingOverlay />
            </div>
        </>
    );
});

App.displayName = 'App';

export default App;
