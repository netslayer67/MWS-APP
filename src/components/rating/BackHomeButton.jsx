import React, { memo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";

const BackHomeButton = memo(() => {
    const { user } = useSelector((state) => state.auth);

    // Determine home route based on user role
    const homeRoute = user && (user.role === 'directorate' || user.role === 'admin' || user.role === 'superadmin')
        ? '/emotional-checkin/dashboard'
        : '/profile';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="pt-6 md:pt-8 flex justify-center px-2"
        >
            <Link to={homeRoute} className="w-full sm:w-auto">
                <Button
                    className="w-full sm:w-auto px-8 py-3 md:px-12 md:py-4 rounded-2xl bg-gradient-to-r from-maroon via-maroon to-maroon/90 hover:from-maroon/90 hover:via-maroon hover:to-maroon text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative flex items-center justify-center gap-2">
                        <Home className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-x-0.5" />
                        <span className="text-sm md:text-base">Back Home</span>
                    </span>
                </Button>
            </Link>
        </motion.div>
    );
});

BackHomeButton.displayName = 'BackHomeButton';

export default BackHomeButton;