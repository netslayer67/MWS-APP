import React, { memo } from "react";
import { Send, Heart, AlertCircle, Sparkles, Shield, CheckCircle } from "lucide-react";

const SubmitSection = memo(({ onSubmit, isSubmitting, isValid }) => {
    return (
        <div className="space-y-4">
            {/* Appreciation Card */}
            <div className="glass glass--frosted glass--deep">
                <div className="glass__refract" />
                <div className="glass__refract--soft" />
                <div className="glass__noise" />

                <div className="relative z-10 p-5 md:p-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/20 to-primary/20 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-gold" />
                        </div>
                        <span className="text-xs md:text-sm font-semibold text-gold uppercase tracking-wide">
                            Thank You
                        </span>
                    </div>
                    <p className="text-sm md:text-base text-foreground font-medium leading-relaxed">
                        Your well-being matters to our community
                    </p>
                </div>
            </div>

            {/* Submit Button */}
            <div className="glass glass-card hover-lift transition-all duration-300">
                <div className="glass__refract" />
                <div className="glass__noise" />

                <div className="relative z-10 p-4 md:p-5">
                    <button
                        onClick={onSubmit}
                        disabled={!isValid || isSubmitting}
                        className={`
              group relative w-full p-4 md:p-5 rounded-lg
              font-semibold text-base md:text-lg
              transition-all duration-300 ease-premium
              overflow-hidden
              ${isValid && !isSubmitting
                                ? 'bg-gradient-to-r from-primary via-primary to-gold text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                            }
            `}
                    >
                        {/* Button shimmer effect */}
                        {isValid && !isSubmitting && (
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        )}

                        {/* Button content */}
                        <div className="relative flex items-center justify-center gap-3">
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span className="hidden md:inline">Submitting Your Check-in...</span>
                                    <span className="md:hidden">Submitting...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    <span className="hidden md:inline">Submit Wellness Check-in</span>
                                    <span className="md:hidden">Submit</span>
                                </>
                            )}
                        </div>

                        {/* Pulse effect for valid state */}
                        {isValid && !isSubmitting && (
                            <div className="absolute inset-0 rounded-lg bg-primary/20 animate-ping opacity-20" />
                        )}
                    </button>

                    {/* Validation Message */}
                    {!isValid && (
                        <div
                            className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20
                         animate-in fade-in slide-in-from-bottom-2 duration-300"
                        >
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                <p className="text-xs md:text-sm text-primary leading-relaxed">
                                    <span className="font-medium">Almost there!</span> Please select your weather and at least one mood.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 md:p-4 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-4 h-4 text-emerald" />
                        <span className="text-xs font-medium text-emerald">Confidential</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Your responses are private & secure
                    </p>
                </div>

                <div className="p-3 md:p-4 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <Heart className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium text-primary">Supportive</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        We're here to help you thrive
                    </p>
                </div>
            </div>

            {/* Footer Branding */}
            <div className="pt-4 border-t border-border/50">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center">
                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                            Millennia World School
                        </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        Wellness & Emotional Support Platform
                    </span>
                </div>
            </div>
        </div>
    );
});

SubmitSection.displayName = 'SubmitSection';
export default SubmitSection;