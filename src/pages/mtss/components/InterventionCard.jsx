import { memo } from "react";
import { motion } from "framer-motion";
import { CalendarDays, ChevronRight, CheckCircle2, Target } from "lucide-react";
import {
    INTERVENTION_CONFIG,
    TIER_CONFIG,
    getTierBadgeStyle,
    getStatusBadgeStyle,
    getStatusLabel
} from "../config/studentProfileConfig";

const InterventionCard = memo(({
    intervention,
    index,
    isSelected,
    onSelect
}) => {
    const config = INTERVENTION_CONFIG[intervention.type] || INTERVENTION_CONFIG.SEL;
    const tierCfg = TIER_CONFIG[intervention.tier] || TIER_CONFIG.tier1;
    const isTier1 = intervention.tier === 'tier1' || !intervention.hasRealData;
    const tierLabel = intervention.tierLabel || tierCfg.label;
    const statusLabel = getStatusLabel(intervention.status);
    const tierBadgeStyle = getTierBadgeStyle(intervention.tier);
    const statusBadgeStyle = getStatusBadgeStyle(intervention.status);

    return (
        <div
            data-aos="fade-up"
            data-aos-delay={index * 80}
            data-aos-duration="500"
            className="relative"
        >
            {/* Floating Tier Badge */}
            <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 z-20">
                <span className={`inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[11px] font-bold uppercase tracking-wide shadow-lg ${tierBadgeStyle}`}>
                    {tierLabel}
                </span>
            </div>

            {/* Selected Indicator */}
            {isSelected && (
                <div className="absolute -top-1.5 -left-1.5 sm:-top-2 sm:-left-2 z-20">
                    <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg ring-2 ring-white dark:ring-slate-800">
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </span>
                </div>
            )}

            <motion.button
                whileHover={intervention.hasRealData ? { scale: 1.02, y: -4 } : {}}
                whileTap={intervention.hasRealData ? { scale: 0.98 } : {}}
                onClick={() => intervention.hasRealData ? onSelect(intervention) : null}
                disabled={!intervention.hasRealData}
                className={`group relative w-full text-left rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 backdrop-blur-xl
                    ${isTier1
                        ? 'bg-white/60 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/40 shadow-md'
                        : `bg-white/80 dark:bg-slate-900/50 border-2 ${config.border} shadow-xl ${config.glow}`
                    }
                    ${isSelected ? `ring-4 ${config.ring} shadow-2xl` : intervention.hasRealData ? 'hover:shadow-2xl cursor-pointer' : 'cursor-default opacity-80'}`}
            >
                {/* Card Header with Gradient */}
                <div className={`px-2.5 py-2 sm:px-4 sm:py-3 bg-gradient-to-r ${config.gradient} ${isTier1 ? 'opacity-70' : ''}`}>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/25 backdrop-blur-sm flex items-center justify-center shadow-inner flex-shrink-0">
                            <span className="text-sm sm:text-xl">{config.emoji}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-base font-bold text-white truncate">{intervention.label}</h4>
                        </div>
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-2 sm:p-4 space-y-1.5 sm:space-y-3">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[8px] sm:text-[11px] font-semibold uppercase tracking-wide ring-1 ${statusBadgeStyle}`}>
                            <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${intervention.status === 'active' ? 'bg-emerald-500 animate-pulse' : intervention.status === 'paused' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                            {statusLabel}
                        </span>
                        {intervention.hasRealData && (
                            <Target className={`w-3 h-3 sm:w-4 sm:h-4 ${config.text}`} />
                        )}
                    </div>

                    {/* Strategy */}
                    <p className="text-[10px] sm:text-xs text-muted-foreground dark:text-slate-400 line-clamp-1 sm:line-clamp-2 sm:min-h-[2rem]">
                        <span className="font-medium text-foreground dark:text-slate-300">Strategy:</span>{' '}
                        {intervention.strategyName || intervention.focusArea || "Core supports"}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] sm:text-xs">
                            <span className="text-muted-foreground font-medium">Progress</span>
                            <span className={`font-bold sm:text-sm ${config.text}`}>{intervention.progress || 0}%</span>
                        </div>
                        <div className="h-1.5 sm:h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${intervention.progress || 0}%` }}
                                transition={{ delay: 0.3 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                                className={`h-full rounded-full bg-gradient-to-r ${config.gradient}`}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-slate-200/60 dark:border-slate-700/40">
                        <span className="text-[9px] sm:text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            {intervention.checkInsCount || 0} check-ins
                        </span>
                        {intervention.hasRealData && (
                            <span className={`inline-flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-xs font-semibold ${config.text} group-hover:translate-x-1 transition-transform`}>
                                Details
                                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                            </span>
                        )}
                    </div>
                </div>
            </motion.button>
        </div>
    );
});

InterventionCard.displayName = "InterventionCard";
export default InterventionCard;
