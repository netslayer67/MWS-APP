import React, { memo } from "react";
import { motion } from "framer-motion";

const DecorativeBlob = memo(({ className, animate, delay = 0 }) => (
    <motion.div
        className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
        animate={animate ? {
            scale: [1, 1.1, 1],
            opacity: [0.03, 0.08, 0.03]
        } : {}}
        transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay
        }}
    />
));

const GridPattern = memo(() => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.015] dark:opacity-[0.025]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="luxury-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#luxury-grid)" className="text-foreground" />
        </svg>
    </div>
));

const DecorativeElements = memo(() => (
    <>
        <GridPattern />
        <DecorativeBlob className="-top-32 -left-32 w-80 h-80 md:w-96 md:h-96 bg-primary/8" animate delay={0} />
        <DecorativeBlob className="-bottom-32 -right-32 w-72 h-72 md:w-80 md:h-80 bg-accent/6" animate delay={0.8} />
        <DecorativeBlob className="top-1/3 right-1/4 w-64 h-64 md:w-72 md:h-72 bg-gold/5" animate delay={1.6} />
        <DecorativeBlob className="bottom-1/3 left-1/4 w-56 h-56 md:w-64 md:h-64 bg-emerald/5" animate delay={2.4} />
    </>
));

DecorativeElements.displayName = 'DecorativeElements';
export default DecorativeElements;