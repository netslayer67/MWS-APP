import React, { memo } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

const TeacherHeroSection = ({ heroBadge, tabs, activeTab, onTabChange }) => (
    <div className="glass glass-strong overflow-hidden mtss-liquid relative">
        <div className="absolute inset-0 mtss-hero-gradient opacity-95 dark:opacity-80 pointer-events-none" />
        <div className="absolute inset-0 mtss-hero-aurora pointer-events-none" />
        <div className="absolute inset-0 mtss-hero-pulse pointer-events-none" />
        <div className="absolute inset-0 mtss-hero-orbit pointer-events-none" />
        <div className="absolute inset-0 mtss-hero-shine pointer-events-none" />
        <div className="glass__noise" />

        <div className="relative mtss-hero-panel p-5 sm:p-8 text-foreground dark:text-white">
            <div className="flex flex-col gap-6">
                <div className="space-y-3">
                    <p className="mtss-hero-badge mb-1 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-sky-300 drop-shadow" />
                        MTSS Studio
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                        <span className="mtss-rainbow-chip px-3 py-1 tracking-[0.35em] uppercase">{heroBadge.school}</span>
                        <span className="mtss-rainbow-chip mtss-rainbow-chip--soft px-3 py-1">
                            Focus: {heroBadge.tierFocus}
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black leading-tight">
                        <span className="mtss-gradient-text mtss-heading-rainbow">
                            {heroBadge.greeting || `Hey ${heroBadge.teacher}, let's light up today's boosts.`}
                        </span>
                    </h1>
                    <p className="mtss-ink-soft dark:text-white/80 mt-2 leading-relaxed text-sm sm:text-base">
                        Quick wins, bright notes, and speedy nudges- all in one playful dashboard.
                    </p>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 items-stretch">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => onTabChange(tab.key)}
                            className={`mtss-tab ${active ? "mtss-tab--active" : "mtss-tab--inactive"}`}
                            aria-pressed={active}
                        >
                            <span className="flex items-center gap-2">
                                <span className={`mtss-tab__icon ${active ? "mtss-tab__icon--active" : ""}`}>
                                    <Icon className="w-4 h-4" />
                                </span>
                                {tab.label}
                            </span>
                            <ArrowRight className={`w-4 h-4 transition-transform ${active ? "translate-x-1" : ""}`} />
                        </button>
                    );
                })}
            </div>
        </div>
    </div>
);

TeacherHeroSection.displayName = "TeacherHeroSection";
export default memo(TeacherHeroSection);
