import React, { memo, useMemo } from "react";
import { Heart, Focus, Sparkles } from "lucide-react";

const PresenceSlider = memo(({ presence, onPresenceChange }) => {
    const currentValue = presence[0];

    // Dynamic feedback based on presence level
    const feedback = useMemo(() => {
        if (currentValue <= 3) {
            return {
                text: "Your attention seems scattered. Take a moment to center yourself.",
                color: "primary",
                icon: "🌫️",
                gradient: "from-primary/15"
            };
        } else if (currentValue <= 6) {
            return {
                text: "You're somewhat present. A few deep breaths might help you focus.",
                color: "gold",
                icon: "⛅",
                gradient: "from-gold/15"
            };
        } else if (currentValue <= 8) {
            return {
                text: "Good presence! You're engaged and focused on what matters.",
                color: "emerald",
                icon: "☀️",
                gradient: "from-emerald/15"
            };
        } else {
            return {
                text: "Exceptional presence! You're fully here, heart and mind aligned.",
                color: "emerald",
                icon: "✨",
                gradient: "from-emerald/20"
            };
        }
    }, [currentValue]);

    // Calculate progress percentage for visual indicator
    const progressPercentage = ((currentValue - 1) / 9) * 100;

    return (
        <div className="glass glass-card hover-lift transition-all duration-300">
            <div className="glass__refract" />
            <div className="glass__refract--soft" />
            <div className="glass__noise" />

            <div className="relative z-10 p-5 md:p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center transition-all duration-300 hover:scale-105">
                        <Heart className="w-6 h-6 md:w-7 md:h-7 text-primary" fill="currentColor" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg md:text-xl font-semibold text-foreground tracking-tight">
                            Presence Level
                        </h2>
                        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                            How focused are you right now?
                        </p>
                    </div>
                </div>

                {/* Value Display - Center Badge */}
                <div className="flex justify-center">
                    <div className="relative">
                        {/* Pulse rings */}
                        <div
                            className={`absolute inset-0 rounded-full animate-ping opacity-20`}
                            style={{ backgroundColor: `hsl(var(--${feedback.color}))` }}
                        />

                        {/* Main value container */}
                        <div
                            className={`
                relative w-20 h-20 md:w-24 md:h-24 rounded-full
                border-4 flex items-center justify-center
                transition-all duration-500 ease-premium
                bg-gradient-to-br ${feedback.gradient} to-transparent
              `}
                            style={{
                                borderColor: `hsl(var(--${feedback.color}))`,
                                boxShadow: `0 8px 24px hsla(var(--${feedback.color}), 0.2)`
                            }}
                        >
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold" style={{ color: `hsl(var(--${feedback.color}))` }}>
                                    {currentValue}
                                </div>
                                <div className="text-xs text-muted-foreground font-medium">/ 10</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Slider Container */}
                <div className="space-y-3">
                    {/* Custom slider track with gradient */}
                    <div className="relative px-2">
                        {/* Background track */}
                        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-2 bg-muted/30 rounded-full" />

                        {/* Progress track */}
                        <div
                            className="absolute left-2 top-1/2 -translate-y-1/2 h-2 rounded-full transition-all duration-300"
                            style={{
                                width: `calc(${progressPercentage}% - 0.5rem)`,
                                background: `linear-gradient(90deg, 
                  hsl(var(--primary)) 0%, 
                  hsl(var(--gold)) 50%, 
                  hsl(var(--emerald)) 100%)`
                            }}
                        />

                        {/* Native range input */}
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={currentValue}
                            onChange={(e) => onPresenceChange([parseInt(e.target.value)])}
                            className="relative w-full h-2 appearance-none bg-transparent cursor-pointer z-10"
                            style={{
                                WebkitAppearance: 'none',
                            }}
                        />

                        <style jsx>{`
              input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: hsl(var(--${feedback.color}));
                border: 3px solid hsl(var(--card));
                box-shadow: 0 4px 12px hsla(var(--${feedback.color}), 0.4);
                cursor: pointer;
                transition: all 0.3s cubic-bezier(.2,.9,.1,1);
              }
              
              input[type="range"]::-webkit-slider-thumb:hover {
                transform: scale(1.2);
                box-shadow: 0 6px 16px hsla(var(--${feedback.color}), 0.6);
              }

              input[type="range"]::-moz-range-thumb {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: hsl(var(--${feedback.color}));
                border: 3px solid hsl(var(--card));
                box-shadow: 0 4px 12px hsla(var(--${feedback.color}), 0.4);
                cursor: pointer;
                transition: all 0.3s cubic-bezier(.2,.9,.1,1);
              }

              input[type="range"]::-moz-range-thumb:hover {
                transform: scale(1.2);
                box-shadow: 0 6px 16px hsla(var(--${feedback.color}), 0.6);
              }
            `}</style>
                    </div>

                    {/* Labels */}
                    <div className="flex justify-between items-start px-2 text-xs md:text-sm">
                        <div className="flex flex-col items-start max-w-[35%]">
                            <span className="font-medium text-primary mb-0.5">1</span>
                            <span className="text-muted-foreground leading-tight hidden md:block">
                                Distracted
                            </span>
                            <span className="text-muted-foreground leading-tight md:hidden">
                                Scattered
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Focus className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Focus Level</span>
                        </div>

                        <div className="flex flex-col items-end max-w-[35%]">
                            <span className="font-medium text-emerald mb-0.5">10</span>
                            <span className="text-muted-foreground leading-tight text-right hidden md:block">
                                Fully Present
                            </span>
                            <span className="text-muted-foreground leading-tight text-right md:hidden">
                                Focused
                            </span>
                        </div>
                    </div>
                </div>

                {/* Feedback Card */}
                <div
                    className={`
            p-3 md:p-4 rounded-lg border backdrop-blur-sm
            animate-in fade-in slide-in-from-bottom-2 duration-300
          `}
                    style={{
                        backgroundColor: `hsla(var(--${feedback.color}), 0.05)`,
                        borderColor: `hsla(var(--${feedback.color}), 0.2)`
                    }}
                >
                    <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{feedback.icon}</span>
                        <p
                            className="text-xs md:text-sm font-medium leading-relaxed"
                            style={{ color: `hsl(var(--${feedback.color}))` }}
                        >
                            {feedback.text}
                        </p>
                    </div>
                </div>

                {/* Micro-interactions: Scale indicators */}
                <div className="flex justify-between gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                            key={num}
                            onClick={() => onPresenceChange([num])}
                            className={`
                flex-1 h-1.5 rounded-full transition-all duration-300
                ${currentValue === num
                                    ? 'bg-current scale-y-150'
                                    : 'bg-border hover:bg-muted-foreground/30'
                                }
              `}
                            style={currentValue === num ? {
                                color: `hsl(var(--${feedback.color}))`,
                                boxShadow: `0 2px 8px hsla(var(--${feedback.color}), 0.4)`
                            } : {}}
                            aria-label={`Set presence to ${num}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
});

PresenceSlider.displayName = 'PresenceSlider';
export default PresenceSlider;