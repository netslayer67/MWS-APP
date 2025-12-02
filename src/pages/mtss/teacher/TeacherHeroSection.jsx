import React, { memo } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

const TeacherHeroSection = ({ heroBadge, tabs, activeTab, onTabChange }) => (
    <div className="relative overflow-hidden rounded-[44px] border border-white/20 dark:border-white/5 bg-gradient-to-br from-[#dbeafe] via-[#fdf2f8] to-[#fef3c7] dark:from-[#111827] dark:via-[#1f2937] dark:to-[#312e81] shadow-[0_45px_120px_rgba(15,23,42,0.35)]">
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -left-6 w-64 h-64 bg-gradient-to-br from-[#f472b6]/40 via-transparent to-transparent blur-3xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-[#22d3ee]/30 via-transparent to-transparent blur-[120px]" />
        </div>
        <div className="relative px-6 py-8 sm:px-10 text-slate-900 dark:text-white">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                <div className="space-y-4">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-600 dark:text-slate-300">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/70 dark:bg-white/10 text-rose-500">
                            <Sparkles className="w-3.5 h-3.5" />
                        </span>
                        MTSS Studio
                    </p>
                    <div className="inline-flex px-3 py-1 rounded-full bg-white/80 dark:bg-white/10 border border-white/60 dark:border-white/20 tracking-[0.3em] uppercase text-[11px] font-semibold text-slate-600 dark:text-slate-200">
                        {heroBadge.school}
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black leading-tight bg-gradient-to-r from-[#0f172a] via-[#334155] to-[#1d4ed8] dark:from-white dark:via-[#c7d2fe] dark:to-[#f472b6] text-transparent bg-clip-text">
                        {heroBadge.greeting || `Hey ${heroBadge.teacher}, let's light up today's boosts.`}
                    </h1>
                </div>
                <div className="flex flex-wrap gap-3 px-4 py-3 rounded-3xl bg-white/70 dark:bg-white/5 border border-white/50 dark:border-white/10 shadow-inner max-w-sm">
                    <div>
                        <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">Teacher</p>
                        <p className="text-base font-semibold">{heroBadge.teacher}</p>
                    </div>
                    <div>
                        <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">Today</p>
                        <p className="text-base font-semibold">{heroBadge.dateLabel || "Ready to roll"}</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.key;
                    const baseClasses =
                        "flex items-center justify-between gap-2 rounded-3xl px-4 py-3 text-sm font-semibold transition shadow-[0_12px_35px_rgba(15,23,42,0.15)] border";
                    const activeClasses =
                        "bg-gradient-to-r from-[#22d3ee] via-[#3b82f6] to-[#a855f7] text-white border-transparent";
                    const inactiveClasses =
                        "bg-white/75 dark:bg-white/10 text-slate-600 dark:text-slate-200 border-white/70 dark:border-white/15 hover:bg-white hover:dark:bg-white/15";
                    return (
                        <button
                            key={tab.key}
                            onClick={() => onTabChange(tab.key)}
                            className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
                            aria-pressed={active}
                        >
                            <span className="flex items-center gap-2">
                                <span
                                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
                                        active
                                            ? "bg-white/30 text-white"
                                            : "bg-white/80 dark:bg-white/10 text-slate-500 dark:text-slate-200"
                                    }`}
                                >
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
