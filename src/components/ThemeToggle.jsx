// ThemeToggle.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative"
        >
            {/* blob background */}
            <motion.div
                className="absolute -inset-6 rounded-full bg-primary/25 blur-2xl -z-10"
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.4, 0.6] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            />

            {/* toggle button */}
            <motion.button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
                aria-label="Toggle theme"
                className="
          relative flex items-center justify-center
          h-12 w-12 rounded-full
          border border-border
          bg-card/60 backdrop-blur-xl
          shadow-lg
          text-foreground
        "
            >
                {/* subtle glass grid */}
                <div className="absolute inset-0 rounded-full bg-grid-small/[0.08] dark:bg-grid-small-dark/[0.12] pointer-events-none" />

                {/* icon */}
                {theme === "dark" ? (
                    <Sun className="h-6 w-6 text-yellow-400" />
                ) : (
                    <Moon className="h-6 w-6 text-indigo-400" />
                )}
            </motion.button>
        </motion.div>
    );
}
