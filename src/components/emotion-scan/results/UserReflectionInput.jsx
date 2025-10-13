import React, { memo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";

const UserReflectionInput = memo(({ onReflectionChange }) => {
    const [reflection, setReflection] = useState("");

    const handleChange = useCallback((e) => {
        const value = e.target.value;
        // Security: sanitize input to prevent XSS and other attacks
        const sanitized = value
            .replace(/<[^>]*>?/gm, '') // Remove HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/data:/gi, '') // Remove data: protocol
            .replace(/vbscript:/gi, '') // Remove vbscript: protocol
            .replace(/on\w+\s*=/gi, '') // Remove event handlers
            .slice(0, 500); // Limit length

        setReflection(sanitized);
        onReflectionChange?.(sanitized);
    }, [onReflectionChange]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-primary/5 to-emerald/5 rounded-lg p-4 border border-primary/20"
        >
            <h4 className="text-xs font-bold text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                Share Your Thoughts
            </h4>
            <p className="text-sm text-foreground mb-3 leading-relaxed">
                What triggered this feeling? Share a few details to help us understand your experience better.
            </p>
            <textarea
                value={reflection}
                onChange={handleChange}
                placeholder="e.g., 'Had a challenging meeting this morning...' or 'Feeling grateful for team support...'"
                className="w-full p-3 rounded-lg bg-background border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all duration-300"
                rows={3}
                maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-muted-foreground">
                    Your reflection helps personalize future insights
                </p>
                <span className="text-xs text-muted-foreground">
                    {reflection.length}/500
                </span>
            </div>
        </motion.div>
    );
});

UserReflectionInput.displayName = 'UserReflectionInput';
export default UserReflectionInput;