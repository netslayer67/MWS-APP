import React, { memo, useMemo } from "react";
import { Zap, Battery, TrendingUp } from "lucide-react";

const CapacitySlider = memo(({ capacity, onCapacityChange }) => {
    const currentValue = capacity[0];

    // Dynamic feedback based on capacity level
    const feedback = useMemo(() => {
        if (currentValue <= 3) {
            return {
                text: "You're at maximum capacity. Time to discuss workload priorities.",
                color: "primary",
                icon: "🔴",
                gradient: "from-primary/15",
                batteryLevel: "critical"
            };
        } else if (currentValue <= 5) {
            return {
                text: "Your workload is heavy. Focus on what's most important today.",
                color: "primary",
                icon: "🟠",
                gradient: "from-primary/12",
                batteryLevel: "low"
            };
        } else if (currentValue <= 7) {
            return {
                text: "You're managing well. Keep monitoring your capacity balance.",
                color: "gold",
                icon: "🟡",
                gradient: "from-gold/15",
                batteryLevel: "medium"
            };
        } else if (currentValue <= 9) {
            return {
                text: "Great capacity! You're ready to take on additional projects.",
                color: "emerald",
                icon: "🟢",
                gradient: "from-emerald/15",
                batteryLevel: "good"
            };
        } else {
            return {
                text: "Peak capacity! You're primed for new challenges and opportunities.",
                color: "emerald",
                icon: "⚡",
                gradient: "from-emerald/20",
                batteryLevel: "full"
            };
        }
    }, [currentValue]);

    // Calculate progress percentage for visual indicator
    const progressPercentage = ((currentValue - 1) / 9) * 100;

    // Battery visualization segments
    const batterySegments = useMemo(() => {
        return Array.from({ length: 10 }, (_, i) => ({
            active: i < currentValue,
            index: i
        }));
    }, [currentValue]);

    return (
        <div className="glass glass-card hover-lift transition-all duration-300">
            <div className="glass__refract" />
            <div className="glass__refract--soft" />
            <div className="glass__noise" />

            <div className="relative z-10 p-5 md:p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 flex items-center justify-center transition-all duration-300 hover:scale-105">
                        <Zap className="w-6 h-6 md:w-7 md:h-7 text-gold" fill="currentColor" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg md:text-xl font-semibold text-foreground tracking-tight">
                            Capacity Level
                        </h2>
                        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                            How much can you take on today?
                        </p>
                    </div>
                </div>

                {/* Battery Visualization */}
                <div className="flex justify-center">
                    <div className="relative">
                        {/* Glow effect */}
                        <div
                            className={`absolute inset-0 rounded-xl blur-xl opacity-30 animate-pulse`}
                            style={{ backgroundColor: `hsl(var(--${feedback.color}))` }}
                        />

                        {/* Battery container */}
                        <div className="relative flex items-center gap-1 p-2 rounded-xl bg-card/50 border border-border">
                            {/* Battery segments */}
                            {batterySegments.map((segment) => (
                                <div
                                    key={segment.index}
                                    className={`
                    w-4 h-12 md:w-5 md:h-14 rounded transition-all duration-300
                    ${segment.active
                                            ? 'bg-current scale-y-100'
                                            : 'bg-muted/20 scale-y-50'
                                        }
                  `}
                                    style={segment.active ? {
                                        color: `hsl(var(--${feedback.color}))`,
                                        boxShadow: `0 2px 8px hsla(var(--${feedback.color}), 0.3)`
                                    } : {}}
                                />
                            ))}

                            {/* Battery tip */}
                            <div
                                className="w-1 h-6 md:h-8 rounded-r bg-current transition-colors duration-300"
                                style={{ color: currentValue > 0 ? `hsl(var(--${feedback.color}))` : 'hsl(var(--muted))' }}
                            />
                        </div>

                        {/* Value display */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full">
                            <div className="px-3 py-1.5 rounded-full bg-card border border-border shadow-lg">
                                <span className="text-sm font-bold" style={{ color: `hsl(var(--${feedback.color}))` }}>
                                    {currentValue} / 10
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Slider Container */}
                <div className="space-y-3 pt-4">
                    {/* Custom slider track with gradient */}
                    <div className="relative px-2">
                        {/* Background track */}
                        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-2 bg-muted/30 rounded-full" />

                        {/* Progress track - inverted colors (red = overwhelmed, green = ready) */}
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
                            onChange={(e) => onCapacityChange([parseInt(e.target.value)])}
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
                                Overwhelmed
                            </span>
                            <span className="text-muted-foreground leading-tight md:hidden">
                                Maxed Out
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Battery className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Energy Level</span>
                        </div>

                        <div className="flex flex-col items-end max-w-[35%]">
                            <span className="font-medium text-emerald mb-0.5">10</span>
                            <span className="text-muted-foreground leading-tight text-right hidden md:block">
                                Ready for More
                            </span>
                            <span className="text-muted-foreground leading-tight text-right md:hidden">
                                Energized
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

                {/* Capacity Indicators */}
                <div className="grid grid-cols-3 gap-2">
                    <div className={`
            p-2 md:p-3 rounded-lg border text-center transition-all duration-300
            ${currentValue <= 3
                            ? 'bg-primary/10 border-primary/30 scale-105'
                            : 'bg-card/30 border-border/50 opacity-50'
                        }
          `}>
                        <div className="text-lg md:text-xl mb-1">⚠️</div>
                        <p className="text-xs font-medium text-muted-foreground">High Load</p>
                    </div>

                    <div className={`
            p-2 md:p-3 rounded-lg border text-center transition-all duration-300
            ${currentValue > 3 && currentValue <= 7
                            ? 'bg-gold/10 border-gold/30 scale-105'
                            : 'bg-card/30 border-border/50 opacity-50'
                        }
          `}>
                        <div className="text-lg md:text-xl mb-1">⚖️</div>
                        <p className="text-xs font-medium text-muted-foreground">Balanced</p>
                    </div>

                    <div className={`
            p-2 md:p-3 rounded-lg border text-center transition-all duration-300
            ${currentValue > 7
                            ? 'bg-emerald/10 border-emerald/30 scale-105'
                            : 'bg-card/30 border-border/50 opacity-50'
                        }
          `}>
                        <div className="text-lg md:text-xl mb-1">🚀</div>
                        <p className="text-xs font-medium text-muted-foreground">Ready</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

CapacitySlider.displayName = 'CapacitySlider';
export default CapacitySlider;