import React, { memo } from "react";

const AdminHeroSection = ({ heroCard, tabs, activeTab, onTabChange }) => {
    const BadgeIcon = heroCard.badgeIcon;

    return (
        <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-xl shadow-lg">
                <BadgeIcon className="w-5 h-5 text-rose-500" />
                <div>
                    <p className="text-[0.6rem] uppercase tracking-[0.5em] text-muted-foreground">{heroCard.badgeLabel}</p>
                    <p className="text-sm font-semibold">{heroCard.badgeCaption}</p>
                </div>
            </div>
            <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">{heroCard.heading}</h1>
                <p className="text-base md:text-lg text-muted-foreground dark:text-white/80 mt-2">{heroCard.subheading}</p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
                {tabs.map((tab) => {
                    const TabIcon = tab.icon;
                    const active = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => onTabChange(tab.key)}
                            className={`px-5 py-3 rounded-full border backdrop-blur-xl font-semibold text-sm flex items-center gap-2 transition shadow-lg ${
                                active
                                    ? "bg-gradient-to-r from-[#ffe29f] via-[#ffa99f] to-[#ff719a] text-[#831843] border-white/60 shadow-[0_10px_30px_rgba(255,113,154,0.45)]"
                                    : "bg-white/25 text-white border-white/30 hover:bg-white/40 hover:text-rose-100"
                            }`}
                        >
                            <TabIcon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

AdminHeroSection.displayName = "AdminHeroSection";
export default memo(AdminHeroSection);
