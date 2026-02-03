import React, { memo } from "react";
import { ArrowRight, Sparkles, CalendarDays, User } from "lucide-react";

const TeacherHeroSection = ({ heroBadge, tabs, activeTab, onTabChange }) => (
    <div className="relative rounded-[32px] sm:rounded-[40px] p-[1.5px] bg-gradient-to-br from-[#f472b6]/60 via-[#818cf8]/50 to-[#34d399]/60 shadow-[0_30px_80px_rgba(99,102,241,0.2)]">
        <div className="relative overflow-hidden rounded-[30px] sm:rounded-[38px] border border-white/40 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-2xl">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -left-20 w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-br from-[#f472b6]/20 via-[#a78bfa]/15 to-transparent blur-[100px] sm:blur-[140px]" />
                <div className="absolute -bottom-16 -right-16 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-tl from-[#22d3ee]/20 via-[#818cf8]/10 to-transparent blur-[120px] sm:blur-[160px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-[#fbbf24]/8 blur-[100px] rounded-full" />
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.7),_transparent_50%)]" />
            </div>

            <div className="relative px-4 py-6 sm:px-7 sm:py-8 lg:px-9 text-slate-900 dark:text-white">
                {/* Top badges row */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                    <span className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.35em] text-white bg-gradient-to-r from-[#f472b6] via-[#a78bfa] to-[#818cf8] px-3 py-1.5 rounded-full shadow-[0_4px_20px_rgba(168,85,247,0.35)]">
                        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        MTSS Studio
                    </span>
                    <span className="inline-flex px-3 py-1.5 rounded-full bg-white/90 dark:bg-white/10 border border-white/60 dark:border-white/15 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-200 shadow-sm">
                        {heroBadge.school}
                    </span>
                    <span className="inline-flex px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 dark:from-emerald-500/20 dark:to-cyan-500/20 border border-emerald-300/40 dark:border-emerald-500/20 text-[10px] sm:text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                        {heroBadge.gradeLabel}
                    </span>
                </div>

                {/* Main content grid */}
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    {/* Left: Greeting */}
                    <div className="flex-1 min-w-0 space-y-3">
                        <h1 className="text-[22px] sm:text-3xl lg:text-[2.5rem] font-black leading-[1.15] bg-gradient-to-r from-[#1e1b4b] via-[#6366f1] to-[#ec4899] dark:from-[#e0e7ff] dark:via-[#c4b5fd] dark:to-[#f9a8d4] text-transparent bg-clip-text">
                            {heroBadge.greeting || `Hey ${heroBadge.teacher}, let's light up today's boosts.`}
                        </h1>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400/15 to-orange-400/15 dark:from-amber-500/15 dark:to-orange-500/15 border border-amber-300/40 dark:border-amber-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                            </span>
                            <span className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-300">
                                Focus today: {heroBadge.tierFocus}
                            </span>
                        </div>
                    </div>

                    {/* Right: Info cards */}
                    <div className="flex gap-2.5 sm:gap-3 flex-shrink-0">
                        <div className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-purple-50/90 dark:from-indigo-900/30 dark:to-purple-900/20 border border-indigo-200/50 dark:border-indigo-500/15 shadow-sm">
                            <span className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.35)]">
                                <User className="w-3.5 h-3.5" />
                            </span>
                            <div>
                                <span className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-indigo-400 dark:text-indigo-300">Teacher</span>
                                <span className="block text-sm sm:text-base font-bold text-slate-800 dark:text-white leading-tight">{heroBadge.teacher}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/90 dark:from-emerald-900/30 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-500/15 shadow-sm">
                            <span className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-[0_4px_12px_rgba(52,211,153,0.35)]">
                                <CalendarDays className="w-3.5 h-3.5" />
                            </span>
                            <div>
                                <span className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-500 dark:text-emerald-300">Today</span>
                                <span className="block text-sm sm:text-base font-bold text-slate-800 dark:text-white leading-tight">{heroBadge.dateLabel || "Ready to roll"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab navigation */}
                <div className="mt-6 sm:mt-7">
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => onTabChange(tab.key)}
                                    className={`group flex items-center justify-between gap-2 rounded-2xl px-3.5 sm:px-4 py-3 sm:py-3.5 text-sm font-semibold transition-all duration-200 border ${
                                        active
                                            ? "bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] text-white border-transparent shadow-[0_12px_35px_rgba(99,102,241,0.4)] scale-[1.02]"
                                            : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-white border-white/70 dark:border-slate-600/60 hover:bg-white dark:hover:bg-slate-700/80 hover:border-indigo-200/50 dark:hover:border-indigo-400/40 hover:shadow-[0_8px_25px_rgba(99,102,241,0.12)] dark:hover:shadow-[0_8px_25px_rgba(99,102,241,0.2)]"
                                    }`}
                                    aria-pressed={active}
                                >
                                    <span className="flex items-center gap-2.5">
                                        <span
                                            className={`inline-flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                                                active
                                                    ? "bg-white/25 text-white"
                                                    : "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 text-slate-500 dark:text-slate-200 group-hover:from-indigo-50 group-hover:to-purple-50 group-hover:text-indigo-500 dark:group-hover:from-indigo-800 dark:group-hover:to-purple-800 dark:group-hover:text-indigo-300"
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                        </span>
                                        <span className="truncate">{tab.label}</span>
                                    </span>
                                    <ArrowRight
                                        className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                                            active ? "translate-x-0.5" : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
                                        }`}
                                    />
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
