import React, { memo, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/app/PageTransition';
import BackgroundDecor from '@/components/app/BackgroundDecor';
import UtilityDock from '@/components/app/UtilityDock';
import AppHelmet from '@/components/app/AppHelmet';
import SkipLink from '@/components/app/SkipLink';
import RouteConfig from '@/components/app/RouteConfig';

const TRANSITION_MS = 320;

const App = memo(() => {
    const location = useLocation();

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
            </div>
        </>
    );
});

App.displayName = 'App';

export default App;
