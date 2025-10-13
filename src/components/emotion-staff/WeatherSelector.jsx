import React, { memo, useMemo } from "react";
import { Sun, Cloud, CloudRain, Zap, Tornado, Snowflake, Rainbow, Eye, Wind, Flame } from "lucide-react";

const weatherOptions = [
    {
        icon: Sun,
        label: "Sunny & Clear",
        labelFull: "Sunny and Clear",
        desc: "Upbeat, calm, full of clarity",
        value: "sunny",
        color: "gold"
    },
    {
        icon: Cloud,
        label: "Partly Cloudy",
        labelFull: "Partly Cloudy",
        desc: "Mild stress or distraction",
        value: "cloudy",
        color: "muted"
    },
    {
        icon: CloudRain,
        label: "Light Rain",
        labelFull: "Light Rain",
        desc: "Reflective or tired",
        value: "rain",
        color: "primary"
    },
    {
        icon: Zap,
        label: "Thunderstorms",
        labelFull: "Thunderstorms",
        desc: "Intense feelings, anxiety",
        value: "storm",
        color: "primary"
    },
    {
        icon: Tornado,
        label: "Chaotic",
        labelFull: "Tornado Watch",
        desc: "Hard to focus",
        value: "tornado",
        color: "primary"
    },
    {
        icon: Snowflake,
        label: "Snowy & Still",
        labelFull: "Snowy and Still",
        desc: "Slow, introspective",
        value: "snow",
        color: "emerald"
    },
    {
        icon: Rainbow,
        label: "Rainbow",
        labelFull: "Post-Storm Rainbow",
        desc: "Hope emerging",
        value: "rainbow",
        color: "emerald"
    },
    {
        icon: Eye,
        label: "Foggy",
        labelFull: "Foggy",
        desc: "Unclear, seeking direction",
        value: "foggy",
        color: "muted"
    },
    {
        icon: Flame,
        label: "Heatwave",
        labelFull: "Heatwave",
        desc: "Burnt out, overstimulated",
        value: "heatwave",
        color: "gold"
    },
    {
        icon: Wind,
        label: "Windy",
        labelFull: "Windy",
        desc: "Restless, in transition",
        value: "windy",
        color: "emerald"
    },
];

const WeatherCard = memo(({ weather, isSelected, onClick, index }) => {
    const Icon = weather.icon;

    const colorClasses = useMemo(() => {
        const baseColors = {
            gold: {
                selected: 'border-gold bg-gold/10 shadow-gold/15',
                icon: 'text-gold',
                text: 'text-gold',
                hover: 'hover:border-gold/50 hover:bg-gold/5',
                gradient: 'from-gold/10'
            },
            emerald: {
                selected: 'border-emerald bg-emerald/10 shadow-emerald/15',
                icon: 'text-emerald',
                text: 'text-emerald',
                hover: 'hover:border-emerald/50 hover:bg-emerald/5',
                gradient: 'from-emerald/10'
            },
            primary: {
                selected: 'border-primary bg-primary/10 shadow-primary/15',
                icon: 'text-primary',
                text: 'text-primary',
                hover: 'hover:border-primary/50 hover:bg-primary/5',
                gradient: 'from-primary/10'
            },
            muted: {
                selected: 'border-muted bg-muted/10 shadow-muted/15',
                icon: 'text-muted-foreground',
                text: 'text-muted-foreground',
                hover: 'hover:border-muted/50 hover:bg-muted/5',
                gradient: 'from-muted/10'
            }
        };
        return baseColors[weather.color] || baseColors.primary;
    }, [weather.color]);

    return (
        <button
            onClick={onClick}
            className={`
        group relative p-3 md:p-4 rounded-lg border
        transition-all duration-300 ease-premium
        ${isSelected
                    ? `${colorClasses.selected} shadow-lg transform scale-[1.02]`
                    : `border-border bg-card/40 ${colorClasses.hover}`
                }
      `}
            style={{
                transitionDelay: `${index * 20}ms`
            }}
        >
            {/* Glass effects */}
            <div className="glass__refract opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="glass__noise" />

            {/* Icon */}
            <div className="relative z-10 flex flex-col items-center gap-2">
                <Icon
                    className={`
            w-7 h-7 md:w-9 md:h-9 
            transition-all duration-300 ease-premium
            ${isSelected
                            ? colorClasses.icon
                            : 'text-muted-foreground group-hover:' + colorClasses.icon
                        }
            ${isSelected ? 'scale-110' : 'group-hover:scale-105'}
          `}
                />

                {/* Label - adaptive for mobile/desktop */}
                <span className={`
          text-xs md:text-sm font-medium leading-tight
          transition-colors duration-300
          ${isSelected
                        ? colorClasses.text
                        : 'text-foreground group-hover:' + colorClasses.text
                    }
        `}>
                    <span className="hidden md:inline">{weather.labelFull}</span>
                    <span className="md:hidden">{weather.label}</span>
                </span>
            </div>

            {/* Selection indicator */}
            {isSelected && (
                <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                    <div className={`
            absolute inset-0 bg-gradient-to-br ${colorClasses.gradient} to-transparent
            opacity-40
          `} />
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-current shadow-lg"
                        style={{ color: `hsl(var(--${weather.color}))` }} />
                </div>
            )}

            {/* Hover shimmer effect */}
            <div className={`
        absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
        transition-opacity duration-300 pointer-events-none
        bg-gradient-to-br ${colorClasses.gradient} to-transparent
      `} />
        </button>
    );
});

WeatherCard.displayName = 'WeatherCard';

const WeatherSelector = memo(({ selectedWeather, onWeatherSelect }) => {
    const selectedOption = useMemo(
        () => weatherOptions.find(w => w.value === selectedWeather),
        [selectedWeather]
    );

    return (
        <div className="glass glass-card hover-lift transition-all duration-300">
            <div className="glass__refract" />
            <div className="glass__refract--soft" />
            <div className="glass__noise" />

            <div className="relative z-10 p-5 md:p-6 space-y-5">
                {/* Header */}
                <div className="space-y-2">
                    <h2 className="text-lg md:text-xl font-semibold text-foreground tracking-tight">
                        Internal Weather Report
                    </h2>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                        How are you feeling internally right now?
                    </p>
                </div>

                {/* Weather Grid - Responsive: 2 cols mobile, 5 cols desktop */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
                    {weatherOptions.map((weather, index) => (
                        <WeatherCard
                            key={weather.value}
                            weather={weather}
                            isSelected={selectedWeather === weather.value}
                            onClick={() => onWeatherSelect(weather.value)}
                            index={index}
                        />
                    ))}
                </div>

                {/* Selected Description - Smooth reveal */}
                {selectedOption && (
                    <div
                        className="p-3 md:p-4 rounded-lg border border-border bg-card/60 backdrop-blur-sm
                       animate-in fade-in slide-in-from-bottom-2 duration-300"
                    >
                        <p className="text-xs md:text-sm text-muted-foreground text-center leading-relaxed">
                            <span className="font-medium text-foreground">{selectedOption.labelFull}:</span>{' '}
                            {selectedOption.desc}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
});

WeatherSelector.displayName = 'WeatherSelector';
export default WeatherSelector;