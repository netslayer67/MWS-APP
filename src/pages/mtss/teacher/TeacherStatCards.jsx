import React, { memo } from "react";

const CARD_STYLES = [
    {
        gradient: "from-[#6366f1] via-[#818cf8] to-[#a78bfa]",
        iconBg: "bg-white/20",
        glow: "shadow-[0_16px_40px_rgba(99,102,241,0.3)]",
        darkGlow: "dark:shadow-[0_16px_40px_rgba(99,102,241,0.2)]",
    },
    {
        gradient: "from-[#f59e0b] via-[#f97316] to-[#ef4444]",
        iconBg: "bg-white/20",
        glow: "shadow-[0_16px_40px_rgba(249,115,22,0.3)]",
        darkGlow: "dark:shadow-[0_16px_40px_rgba(249,115,22,0.2)]",
    },
    {
        gradient: "from-[#10b981] via-[#14b8a6] to-[#06b6d4]",
        iconBg: "bg-white/20",
        glow: "shadow-[0_16px_40px_rgba(20,184,166,0.3)]",
        darkGlow: "dark:shadow-[0_16px_40px_rgba(20,184,166,0.2)]",
    },
];

const TeacherStatCards = ({ statCards }) => (
    <section className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {statCards.map((card, index) => {
            const style = CARD_STYLES[index % CARD_STYLES.length];
            const Icon = card.icon;
            return (
                <div
                    key={card.label}
                    className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br ${style.gradient} p-3.5 sm:p-5 lg:p-6 ${style.glow} ${style.darkGlow} transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.01]`}
                    data-aos="fade-up"
                    data-aos-delay={50 + index * 40}
                    data-aos-duration="500"
                >
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute -top-8 -right-8 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/10 blur-xl" />
                        <div className="absolute -bottom-6 -left-6 w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white/5 blur-lg" />
                    </div>
                    <div className="relative flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <p className="text-[9px] sm:text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.25em] sm:tracking-[0.35em] text-white/80 truncate">
                                {card.label}
                            </p>
                            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mt-1 sm:mt-2 drop-shadow-sm">
                                {card.value}
                            </p>
                            <p className="hidden sm:block text-xs lg:text-sm text-white/75 mt-0.5 lg:mt-1">{card.sub}</p>
                        </div>
                        <span className={`${style.iconBg} flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 lg:w-[3.25rem] lg:h-[3.25rem] rounded-xl sm:rounded-2xl inline-flex items-center justify-center text-white`}>
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </span>
                    </div>
                </div>
            );
        })}
    </section>
);

export default memo(TeacherStatCards);
