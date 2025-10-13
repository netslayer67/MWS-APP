// PageLoader.jsx
import React, { memo } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const PageLoader = memo(() => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
            {/* Background grid with liquid glass mask */}
            <div className="absolute inset-0 bg-grid-small [mask-image:radial-gradient(circle_at_center,white,transparent)] opacity-25 pointer-events-none" />

            {/* Glassmorphic loader container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="
          relative flex flex-col items-center gap-4 sm:gap-5
          rounded-2xl sm:rounded-3xl
          bg-card/40 px-6 py-7 sm:px-8 sm:py-10
          shadow-xl backdrop-blur-2xl
          border border-border/50
        "
            >
                {/* Loader icon */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                    <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
                </motion.div>

                {/* Loading text */}
                <motion.p
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="
            text-sm sm:text-base font-medium 
            text-foreground tracking-wide
          "
                >
                    Memuat...
                </motion.p>

                {/* Glowing accent ring */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0.4 }}
                    animate={{ scale: [0.9, 1.05, 0.9], opacity: [0.4, 0.75, 0.4] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="absolute -inset-3 sm:-inset-4 rounded-3xl border-2 border-accent/40 blur-xl"
                />
            </motion.div>
        </div>
    );
});

PageLoader.displayName = 'PageLoader';

export default PageLoader;
