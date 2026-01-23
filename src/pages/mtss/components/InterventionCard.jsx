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
            {/* Floating Tier Badge - Top Right Corner */}
            <div className="absolute -top-2 -right-2 z-20">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wide shadow-lg ${tierBadgeStyle}`}>
                    {tierLabel}
                </span>
            </div>

            {/* Selected Indicator */}
            {isSelected && (
                <div className="absolute -top-2 -left-2 z-20">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg ring-2 ring-white dark:ring-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                    </span>
                </div>
            )}

            <motion.button
                whileHover={intervention.hasRealData ? { scale: 1.02, y: -4 } : {}}
                whileTap={intervention.hasRealData ? { scale: 0.98 } : {}}
                onClick={() => intervention.hasRealData ? onSelect(intervention) : null}
                disabled={!intervention.hasRealData}
                className={`group relative w-full text-left rounded-2xl overflow-hidden transition-all duration-300 backdrop-blur-xl
                    ${isTier1
                        ? 'bg-white/60 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/40 shadow-md'
                        : `bg-white/80 dark:bg-slate-900/50 border-2 ${config.border} shadow-xl ${config.glow}`
                    }
                    ${isSelected ? `ring-4 ${config.ring} shadow-2xl` : intervention.hasRealData ? 'hover:shadow-2xl cursor-pointer' : 'cursor-default opacity-80'}`}
            >
                {/* Card Header with Gradient */}
                <div className={`px-4 py-3 bg-gradient-to-r ${config.gradient} ${isTier1 ? 'opacity-70' : ''}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/25 backdrop-blur-sm flex items-center justify-center shadow-inner">
                            <span className="text-xl">{config.emoji}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-base font-bold text-white truncate">{intervention.label}</h4>
                        </div>
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                    {/* Status Badge - Clean Row */}
                    <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wide ring-1 ${statusBadgeStyle}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${intervention.status === 'active' ? 'bg-emerald-500 animate-pulse' : intervention.status === 'paused' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                            {statusLabel}
                        </span>
                        {intervention.hasRealData && (
                            <Target className={`w-4 h-4 ${config.text}`} />
                        )}
                    </div>

                    {/* Strategy */}
                    <p className="text-xs text-muted-foreground dark:text-slate-400 line-clamp-2 min-h-[2rem]">
                        <span className="font-medium text-foreground dark:text-slate-300">Strategy:</span>{' '}
                        {intervention.strategyName || intervention.focusArea || "Core supports"}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground font-medium">Progress</span>
                            <span className={`font-bold text-sm ${config.text}`}>{intervention.progress || 0}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${intervention.progress || 0}%` }}
                                transition={{ delay: 0.3 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                                className={`h-full rounded-full bg-gradient-to-r ${config.gradient}`}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/40">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {intervention.checkInsCount || 0} check-ins
                        </span>
                        {intervention.hasRealData && (
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold ${config.text} group-hover:translate-x-1 transition-transform`}>
                                Details
                                <ChevronRight className="w-4 h-4" />
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
