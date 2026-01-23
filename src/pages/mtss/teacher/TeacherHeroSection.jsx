import React, { memo } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

const TeacherHeroSection = ({ heroBadge, tabs, activeTab, onTabChange }) => (
    <div className="relative rounded-[40px] p-[1.5px] bg-gradient-to-r from-[#fb7185]/50 via-[#60a5fa]/50 to-[#34d399]/50 shadow-[0_35px_90px_rgba(15,23,42,0.28)]">
        <div className="relative overflow-hidden rounded-[38px] border border-white/40 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-24 -left-16 w-72 h-72 bg-gradient-to-br from-[#f472b6]/25 via-[#60a5fa]/15 to-transparent blur-[140px]" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-[#22d3ee]/25 via-[#a855f7]/15 to-transparent blur-[160px]" />
                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_transparent_60%)]" />
            </div>
            <div className="relative px-5 py-7 sm:px-8 text-slate-900 dark:text-white">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-white/10 border border-white/60 dark:border-white/15 px-3 py-1 rounded-full">
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 dark:bg-white/15 text-rose-500">
                                    <Sparkles className="w-3.5 h-3.5" />
                                </span>
                                MTSS Studio
                            </span>
                            <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-gradient-to-r from-white/90 via-white/70 to-white/60 dark:from-white/10 dark:via-white/5 dark:to-white/5 border border-white/60 dark:border-white/15 tracking-[0.3em] uppercase text-[11px] font-semibold text-slate-600 dark:text-slate-200">
                                {heroBadge.school}
                            </span>
                            <span className="hidden md:inline-flex px-3 py-1 rounded-full bg-gradient-to-r from-emerald-100/80 to-sky-100/80 dark:from-emerald-900/40 dark:to-sky-900/30 text-[11px] font-semibold text-emerald-700 dark:text-emerald-200">
                                {heroBadge.gradeLabel}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black leading-tight bg-gradient-to-r from-[#0f172a] via-[#334155] to-[#1d4ed8] dark:from-white dark:via-[#c7d2fe] dark:to-[#f472b6] text-transparent bg-clip-text">
                            {heroBadge.greeting || `Hey ${heroBadge.teacher}, let's light up today's boosts.`}
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-200 max-w-xl">
                            Focus today: <span className="font-semibold text-slate-900 dark:text-white">{heroBadge.tierFocus}</span>
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                        <div className="px-4 py-3 rounded-3xl bg-white/80 dark:bg-white/10 border border-white/60 dark:border-white/15 shadow-inner text-sm font-semibold">
                            <span className="text-slate-500 dark:text-slate-300 text-[11px] uppercase tracking-[0.3em]">Teacher</span>
                            <div className="text-base font-semibold">{heroBadge.teacher}</div>
                        </div>
                        <div className="px-4 py-3 rounded-3xl bg-white/80 dark:bg-white/10 border border-white/60 dark:border-white/15 shadow-inner text-sm font-semibold">
                            <span className="text-slate-500 dark:text-slate-300 text-[11px] uppercase tracking-[0.3em]">Today</span>
                            <div className="text-base font-semibold">{heroBadge.dateLabel || "Ready to roll"}</div>
                        </div>
                    </div>
                </div>

                <div className="mt-7 rounded-3xl bg-white/70 dark:bg-white/5 border border-white/60 dark:border-white/10 p-2 shadow-inner">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.key;
                            const baseClasses =
                                "group flex items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition border shadow-[0_10px_30px_rgba(15,23,42,0.12)]";
                            const activeClasses =
                                "bg-gradient-to-r from-[#22d3ee] via-[#3b82f6] to-[#a855f7] text-white border-transparent shadow-[0_18px_45px_rgba(59,130,246,0.35)]";
                            const inactiveClasses =
                                "bg-white/80 dark:bg-white/10 text-slate-600 dark:text-slate-200 border-white/70 dark:border-white/15 hover:bg-white hover:dark:bg-white/20";
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
                                                    ? "bg-white/25 text-white"
                                                    : "bg-white/90 dark:bg-white/10 text-slate-500 dark:text-slate-200"
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                        </span>
                                        {tab.label}
                                    </span>
                                    <ArrowRight className={`w-4 h-4 transition-transform ${active ? "translate-x-1" : "group-hover:translate-x-1"}`} />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

TeacherHeroSection.displayName = "TeacherHeroSection";
export default memo(TeacherHeroSection);
