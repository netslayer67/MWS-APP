import React, { memo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Sun, Cloud, CloudRain, Zap, Wind, Snowflake, Rainbow, Droplets, Flame } from "lucide-react";
import { sanitizeInput } from "@/lib/ratingUtils";
import { weatherIcons } from "@/lib/ratingConstants";

const HeaderSection = memo(({ name, analysis }) => {
    const iconMap = {
        "sunny": Sun,
        "partly-cloudy": Cloud,
        "light-rain": CloudRain,
        "thunderstorms": Zap,
        "tornado": Wind,
        "snowy": Snowflake,
        "rainbow": Rainbow,
        "foggy": Droplets,
        "heatwave": Flame,
        "windy": Wind
    };

    const WeatherIcon = iconMap[analysis.weatherValue] || Cloud;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center space-y-4 md:space-y-6 mb-6 md:mb-10"
        >
            <div className="flex justify-center">
                <motion.div
                    className="relative"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 200 }}
                >
                    <motion.div
                        className="absolute inset-0 rounded-full bg-emerald/20 dark:bg-emerald/15"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <div className="relative w-14 h-14 md:w-20 md:h-20 rounded-full glass glass-card flex items-center justify-center shadow-lg shadow-emerald/10">
                        <div className="glass__refract" />
                        <div className="glass__refract--soft" />
                        <CheckCircle2 className="relative z-10 w-7 h-7 md:w-10 md:h-10 text-emerald" />
                    </div>
                </motion.div>
            </div>

            <div className="space-y-2">
                <motion.h1
                    className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    Welcome, {sanitizeInput(name.split(' ')[0])}
                </motion.h1>
                <motion.p
                    className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    Your wellness analysis is complete. Here's what we discovered.
                </motion.p>
            </div>
        </motion.div>
    );
});

HeaderSection.displayName = 'HeaderSection';

export default HeaderSection;
