import { memo } from "react";
import { motion } from "framer-motion";

const DecorativeBlob = memo(({ variant = "primary", className = "", size = "lg" }) => {
    const sizeMap = {
        sm: "w-48 h-48 md:w-64 md:h-64",
        md: "w-64 h-64 md:w-80 md:h-80",
        lg: "w-80 h-80 md:w-96 md:h-96"
    };

    const variantMap = {
        primary: "bg-primary/20",
        gold: "bg-gold/15",
        emerald: "bg-emerald/15"
    };

    return (
        <motion.div
            className={`absolute rounded-full blur-3xl ${sizeMap[size]} ${variantMap[variant]} ${className}`}
            animate={{
                scale: [1, 1.08, 1],
                opacity: [0.2, 0.35, 0.2]
            }}
            transition={{
                duration: variant === "primary" ? 10 : variant === "gold" ? 12 : 14,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        />
    );
});

DecorativeBlob.displayName = 'DecorativeBlob';

export default DecorativeBlob;