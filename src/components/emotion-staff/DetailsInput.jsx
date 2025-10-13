import React, { memo, useState, useCallback } from "react";
import { MessageSquare, AlertCircle, CheckCircle2, Type } from "lucide-react";

// Advanced input sanitization - prevents XSS, malicious scripts, phishing
const sanitizeInput = (input) => {
    return input
        // Remove script tags
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove javascript: protocol
        .replace(/javascript:/gi, '')
        // Remove on* event handlers (but keep normal text with spaces)
        .replace(/\son\w+\s*=/gi, '')
        // Remove iframe/embed tags
        .replace(/<iframe/gi, '')
        .replace(/<embed/gi, '')
        // Remove data: URLs (can contain malicious content)
        .replace(/data:text\/html/gi, '');
};

const DetailsInput = memo(({ details, onDetailsChange }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [charCount, setCharCount] = useState(details.length);
    const [hasWarning, setHasWarning] = useState(false);

    const maxChars = 500;
    const warningThreshold = 450;

    const handleChange = useCallback((e) => {
        let value = e.target.value;
        const originalLength = value.length;

        // Sanitize input
        value = sanitizeInput(value);

        // Check if sanitization removed content (potential malicious input)
        if (originalLength > value.length && originalLength - value.length > 5) {
            setHasWarning(true);
            setTimeout(() => setHasWarning(false), 3000);
        }

        // Enforce max length
        if (value.length <= maxChars) {
            setCharCount(value.length);
            onDetailsChange(value);
        }
    }, [onDetailsChange]);

    const handleFocus = useCallback(() => setIsFocused(true), []);
    const handleBlur = useCallback(() => setIsFocused(false), []);

    const progress = (charCount / maxChars) * 100;
    const isNearLimit = charCount >= warningThreshold;
    const isEmpty = charCount === 0;

    return (
        <div className="glass glass-card hover-lift transition-all duration-300">
            <div className="glass__refract" />
            <div className="glass__refract--soft" />
            <div className="glass__noise" />

            <div className="relative z-10 p-5 md:p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-primary" />
                            <h2 className="text-lg md:text-xl font-semibold text-foreground tracking-tight">
                                Share Your Thoughts
                            </h2>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">
                            Tell us more about what you're experiencing (optional)
                        </p>
                    </div>

                    {/* Status Indicator */}
                    <div className={`
            flex-shrink-0 transition-all duration-300
            ${isFocused ? 'opacity-100' : 'opacity-0'}
          `}>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald/10 border border-emerald/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
                            <span className="text-xs font-medium text-emerald">Active</span>
                        </div>
                    </div>
                </div>

                {/* Text Area Container */}
                <div className="relative">
                    <textarea
                        value={details}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="What's on your mind today? Share your feelings, thoughts, or what's affecting you..."
                        className={`
              w-full px-4 py-3 md:px-5 md:py-4
              bg-input/50 backdrop-blur-sm
              border-2 rounded-lg
              text-sm md:text-base text-foreground placeholder-muted-foreground
              focus:outline-none
              resize-none
              transition-all duration-300 ease-premium
              ${isFocused
                                ? 'border-primary shadow-lg shadow-primary/10 bg-input/80'
                                : 'border-border hover:border-primary/40 hover:bg-input/70'
                            }
            `}
                        rows={4}
                        maxLength={maxChars}
                    />

                    {/* Floating Character Counter */}
                    {!isEmpty && (
                        <div
                            className={`
                absolute bottom-3 right-3 md:bottom-4 md:right-4
                px-2.5 py-1 rounded-full backdrop-blur-md
                border transition-all duration-300
                ${isNearLimit
                                    ? 'bg-primary/10 border-primary/20 text-primary'
                                    : 'bg-card/80 border-border/50 text-muted-foreground'
                                }
              `}
                        >
                            <span className="text-xs font-medium tabular-nums">
                                {charCount}/{maxChars}
                            </span>
                        </div>
                    )}
                </div>

                {/* Progress Bar & Stats */}
                <div className="space-y-2">
                    {/* Progress Bar */}
                    <div className="relative h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <div
                            className={`
                absolute inset-y-0 left-0 rounded-full transition-all duration-300
                ${progress < 70
                                    ? 'bg-gradient-to-r from-emerald to-gold'
                                    : progress < 90
                                        ? 'bg-gradient-to-r from-gold to-primary'
                                        : 'bg-primary'
                                }
              `}
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Info Row */}
                    <div className="flex items-center justify-between gap-4">
                        {/* Left: Helpful Tips */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Type className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">
                                {isEmpty
                                    ? 'Start typing to share your thoughts'
                                    : isNearLimit
                                        ? 'Almost at character limit'
                                        : 'Your input is secure and private'
                                }
                            </span>
                            <span className="md:hidden">
                                {isEmpty ? 'Start typing' : isNearLimit ? 'Near limit' : 'Secure'}
                            </span>
                        </div>

                        {/* Right: Word Count */}
                        {!isEmpty && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-medium tabular-nums">
                                    {details.split(/\s+/).filter(w => w.length > 0).length} words
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Warning Alert (if malicious content detected) */}
                {hasWarning && (
                    <div
                        className="p-3 rounded-lg bg-primary/5 border border-primary/20 
                       animate-in fade-in slide-in-from-bottom-2 duration-300"
                    >
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1 space-y-1">
                                <p className="text-xs md:text-sm font-medium text-primary">
                                    Suspicious content removed
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    For security, some content was filtered. Please share genuine thoughts only.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Privacy Badge */}
                <div className="flex items-center justify-center gap-2 pt-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald" />
                    <p className="text-xs text-muted-foreground">
                        Your responses are confidential and handled with care
                    </p>
                </div>
            </div>
        </div>
    );
});

DetailsInput.displayName = 'DetailsInput';
export default DetailsInput;