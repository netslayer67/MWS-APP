import React, { memo, useMemo } from "react";
import { Smile, Frown, Zap, AlertCircle, Coffee, Moon, Users, XCircle, Brain, Shuffle, Sparkles, Flame, Shield, HeartPulse } from "lucide-react";

const moodOptions = [
    { id: "happy", label: "Happy", labelId: "Bahagia", icon: Smile, color: "gold" },
    { id: "excited", label: "Excited", labelId: "Semangat", icon: Zap, color: "gold" },
    { id: "calm", label: "Calm", labelId: "Tenang", icon: HeartPulse, color: "emerald" },
    { id: "hopeful", label: "Hopeful", labelId: "Penuh Harap", icon: Sparkles, color: "emerald" },
    { id: "sad", label: "Sad", labelId: "Sedih", icon: Frown, color: "primary" },
    { id: "anxious", label: "Anxious", labelId: "Cemas", icon: AlertCircle, color: "primary" },
    { id: "angry", label: "Angry", labelId: "Marah", icon: Flame, color: "primary" },
    { id: "fear", label: "Fear", labelId: "Takut", icon: Shield, color: "primary" },
    { id: "tired", label: "Tired", labelId: "Lelah", icon: Moon, color: "muted" },
    { id: "hungry", label: "Hungry", labelId: "Lapar", icon: Coffee, color: "muted" },
    { id: "lonely", label: "Lonely", labelId: "Kesepian", icon: Users, color: "muted" },
    { id: "bored", label: "Bored", labelId: "Bosan", icon: XCircle, color: "muted" },
    { id: "overwhelmed", label: "Overwhelmed", labelId: "Kewalahan", icon: Brain, color: "primary" },
    { id: "scattered", label: "Scattered", labelId: "Buyar", icon: Shuffle, color: "muted" }
];

const MoodChip = memo(({ mood, isSelected, onToggle, index }) => {
    const Icon = mood.icon;

    const colorClasses = useMemo(() => {
        const colors = {
            gold: {
                selected: 'border-gold bg-gold/10 shadow-gold/20',
                text: 'text-gold',
                gradient: 'from-gold/15',
                hover: 'hover:border-gold/60 hover:bg-gold/5'
            },
            emerald: {
                selected: 'border-emerald bg-emerald/10 shadow-emerald/20',
                text: 'text-emerald',
                gradient: 'from-emerald/15',
                hover: 'hover:border-emerald/60 hover:bg-emerald/5'
            },
            primary: {
                selected: 'border-primary bg-primary/10 shadow-primary/20',
                text: 'text-primary',
                gradient: 'from-primary/15',
                hover: 'hover:border-primary/60 hover:bg-primary/5'
            },
            muted: {
                selected: 'border-muted-foreground bg-muted/20 shadow-muted/20',
                text: 'text-muted-foreground',
                gradient: 'from-muted/20',
                hover: 'hover:border-muted/60 hover:bg-muted/10'
            }
        };
        return colors[mood.color] || colors.primary;
    }, [mood.color]);

    return (
        <button
            onClick={onToggle}
            className={`
        group relative p-2.5 md:p-3 rounded-lg border
        transition-all duration-300 ease-premium
        flex items-center gap-2 md:gap-2.5
        ${isSelected
                    ? `${colorClasses.selected} shadow-md scale-[1.02]`
                    : `border-border bg-card/50 ${colorClasses.hover}`
                }
      `}
            style={{
                transitionDelay: `${index * 15}ms`
            }}
        >
            {/* Glass effects */}
            <div className="glass__refract opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="glass__noise" />

            {/* Checkbox indicator */}
            <div className={`
        relative flex-shrink-0 w-4 h-4 md:w-5 md:h-5 rounded border-2
        transition-all duration-300
        ${isSelected
                    ? `border-current ${colorClasses.text} bg-current`
                    : 'border-border bg-card group-hover:border-current'
                }
      `}>
                {isSelected && (
                    <svg
                        className="absolute inset-0 w-full h-full text-white p-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>

            {/* Icon - hidden on mobile, shown on desktop */}
            <Icon className={`
        hidden md:block w-4 h-4 transition-all duration-300
        ${isSelected
                    ? colorClasses.text
                    : 'text-muted-foreground group-hover:' + colorClasses.text
                }
      `} />

            {/* Label */}
            <span className={`
        text-xs md:text-sm font-medium leading-tight
        transition-colors duration-300
        ${isSelected
                    ? colorClasses.text
                    : 'text-foreground group-hover:' + colorClasses.text
                }
      `}>
                <span className="hidden md:inline">{mood.label}</span>
                <span className="md:hidden">{mood.labelId}</span>
            </span>

            {/* Selection gradient overlay */}
            {isSelected && (
                <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                    <div className={`
            absolute inset-0 bg-gradient-to-br ${colorClasses.gradient} to-transparent
            opacity-30
          `} />
                </div>
            )}

            {/* Hover shimmer */}
            <div className={`
        absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
        transition-opacity duration-300 pointer-events-none
        bg-gradient-to-br ${colorClasses.gradient} to-transparent
      `} />
        </button>
    );
});

MoodChip.displayName = 'MoodChip';

const MoodSelector = memo(({ selectedMoods, onMoodToggle }) => {
    // Group moods by emotion type for better organization
    const groupedMoods = useMemo(() => ({
        positive: moodOptions.filter(m => ['happy', 'excited', 'calm', 'hopeful'].includes(m.id)),
        challenging: moodOptions.filter(m => ['sad', 'anxious', 'angry', 'fear', 'overwhelmed'].includes(m.id)),
        neutral: moodOptions.filter(m => ['tired', 'hungry', 'lonely', 'bored', 'scattered'].includes(m.id))
    }), []);

    const selectedCount = selectedMoods.length;

    return (
        <div className="glass glass-card hover-lift transition-all duration-300">
            <div className="glass__refract" />
            <div className="glass__refract--soft" />
            <div className="glass__noise" />

            <div className="relative z-10 p-5 md:p-6 space-y-5">
                {/* Header */}
                <div className="space-y-2">
                    <h2 className="text-lg md:text-xl font-semibold text-foreground tracking-tight">
                        How Are You Feeling?
                    </h2>
                    <p className="text-xs md:text-sm text-muted-foreground">
                        Select all emotions that resonate with you today
                    </p>
                </div>

                {/* Mood Groups - Organized by emotional category */}
                <div className="space-y-4">
                    {/* Positive Emotions */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 px-2">
                            <div className="w-1 h-4 bg-gradient-to-b from-gold to-emerald rounded-full" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Positive
                            </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {groupedMoods.positive.map((mood, idx) => (
                                <MoodChip
                                    key={mood.id}
                                    mood={mood}
                                    isSelected={selectedMoods.includes(mood.id)}
                                    onToggle={() => onMoodToggle(mood.id)}
                                    index={idx}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Challenging Emotions */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 px-2">
                            <div className="w-1 h-4 bg-gradient-to-b from-primary to-primary/60 rounded-full" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Challenging
                            </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {groupedMoods.challenging.map((mood, idx) => (
                                <MoodChip
                                    key={mood.id}
                                    mood={mood}
                                    isSelected={selectedMoods.includes(mood.id)}
                                    onToggle={() => onMoodToggle(mood.id)}
                                    index={idx + 4}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Neutral/Physical States */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 px-2">
                            <div className="w-1 h-4 bg-gradient-to-b from-muted to-muted/60 rounded-full" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Physical & Neutral
                            </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {groupedMoods.neutral.map((mood, idx) => (
                                <MoodChip
                                    key={mood.id}
                                    mood={mood}
                                    isSelected={selectedMoods.includes(mood.id)}
                                    onToggle={() => onMoodToggle(mood.id)}
                                    index={idx + 9}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Selection Counter */}
                {selectedCount > 0 && (
                    <div
                        className="p-3 md:p-4 rounded-lg border border-border bg-card/60 backdrop-blur-sm
                       animate-in fade-in slide-in-from-bottom-2 duration-300"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-xs md:text-sm text-muted-foreground">
                                Selected emotions
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
                                <span className="text-sm md:text-base font-semibold text-foreground">
                                    {selectedCount}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

MoodSelector.displayName = 'MoodSelector';
export default MoodSelector;