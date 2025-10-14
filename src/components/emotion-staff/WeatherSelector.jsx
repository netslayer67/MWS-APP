import React, { memo, useMemo } from "react";
import WeatherCard from "./components/WeatherCard";

const weatherOptions = [
    { icon: "Sun", label: "Sunny & Clear", labelFull: "Sunny and Clear", desc: "Upbeat, calm, full of clarity", value: "sunny", color: "gold" },
    { icon: "Cloud", label: "Partly Cloudy", labelFull: "Partly Cloudy", desc: "Mild stress or distraction", value: "cloudy", color: "muted" },
    { icon: "CloudRain", label: "Light Rain", labelFull: "Light Rain", desc: "Reflective or tired", value: "rain", color: "primary" },
    { icon: "Zap", label: "Thunderstorms", labelFull: "Thunderstorms", desc: "Intense feelings, anxiety", value: "storm", color: "primary" },
    { icon: "Tornado", label: "Chaotic", labelFull: "Tornado Watch", desc: "Hard to focus", value: "tornado", color: "primary" },
    { icon: "Snowflake", label: "Snowy & Still", labelFull: "Snowy and Still", desc: "Slow, introspective", value: "snow", color: "emerald" },
    { icon: "Rainbow", label: "Rainbow", labelFull: "Post-Storm Rainbow", desc: "Hope emerging", value: "rainbow", color: "emerald" },
    { icon: "CloudFog", label: "Foggy", labelFull: "Foggy", desc: "Unclear, seeking direction", value: "foggy", color: "muted" },
    { icon: "Flame", label: "Heatwave", labelFull: "Heatwave", desc: "Burnt out, overstimulated", value: "heatwave", color: "gold" },
    { icon: "Wind", label: "Windy", labelFull: "Windy", desc: "Restless, in transition", value: "windy", color: "emerald" }
];

const Header = memo(() => (
    <div className="space-y-2">
        <h2 className="text-lg md:text-xl font-semibold text-foreground tracking-tight">
            Internal Weather Report
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            How are you feeling internally right now?
        </p>
    </div>
));

const WeatherGrid = memo(({ selectedWeather, onWeatherSelect }) => (
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
));

const SelectedDescription = memo(({ selectedOption }) => (
    selectedOption && (
        <div className="p-3 md:p-4 rounded-lg border border-border bg-card/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-xs md:text-sm text-muted-foreground text-center leading-relaxed">
                <span className="font-medium text-foreground">{selectedOption.labelFull}:</span>{' '}
                {selectedOption.desc}
            </p>
        </div>
    )
));

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
                <Header />
                <WeatherGrid selectedWeather={selectedWeather} onWeatherSelect={onWeatherSelect} />
                <SelectedDescription selectedOption={selectedOption} />
            </div>
        </div>
    );
});

WeatherSelector.displayName = 'WeatherSelector';
export default WeatherSelector;
