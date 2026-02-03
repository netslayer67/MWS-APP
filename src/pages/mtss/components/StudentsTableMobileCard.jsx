import { memo } from "react";
import { Eye, Pencil } from "lucide-react";
import { ensureStudentInterventions, getMostCriticalForDisplay } from "../utils/interventionUtils";

const CARD_ACCENT = [
    "from-indigo-500 to-purple-500",
    "from-cyan-500 to-blue-500",
    "from-amber-500 to-orange-500",
    "from-emerald-500 to-teal-500",
    "from-pink-500 to-rose-500",
];

const StudentsTableMobileCard = memo(
    ({
        index,
        student,
        ProgressBadge,
        showActions,
        onView,
        onUpdate,
        selectable,
        selected,
        onSelect,
        tierBadgeStyles,
        interventionIcons,
        defaultIcon,
        universalIcon,
    }) => {
        const interventions = ensureStudentInterventions(student.interventions);
        const profile = student.profile || {};
        const criticalInfo = getMostCriticalForDisplay(interventions, profile, student);
        const tierStyle = tierBadgeStyles[criticalInfo.tierCode] || tierBadgeStyles.tier1;
        const icon = criticalInfo.intervention
            ? interventionIcons[criticalInfo.intervention.type] || defaultIcon
            : universalIcon;

        const accent = CARD_ACCENT[index % CARD_ACCENT.length];

        return (
            <div
                className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-200/60 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
            >
                {/* Top accent bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${accent}`} />

                <div className="p-4 space-y-3">
                    {/* Name row */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <button
                                type="button"
                                onClick={() => onView?.(student)}
                                className="text-left"
                            >
                                <span className="font-bold text-sm text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate">
                                    {student.name}
                                </span>
                            </button>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                                {student.grade} · {student.className || "\u2014"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {selectable && (
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded-md border-slate-300 dark:border-slate-600 text-indigo-500"
                                    checked={selected}
                                    onChange={() => onSelect?.(student)}
                                />
                            )}
                            {/* Tier badge in top-right */}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${tierStyle.bg} ${tierStyle.text}`}>
                                {criticalInfo.tier}
                            </span>
                        </div>
                    </div>

                    {/* Focus + Progress row */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {criticalInfo.mode === "universal" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/25 border border-emerald-200/60 dark:border-emerald-700/40 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                <span>{universalIcon}</span>
                                Universal
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                <span className="text-sm">{icon}</span>
                                {criticalInfo.label}
                            </span>
                        )}
                        <ProgressBadge status={student.progress} compact />
                    </div>

                    {/* Bottom row: date + actions */}
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{student.nextUpdate}</span>

                        {showActions && (
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => onView?.(student)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-700/40 active:scale-95 transition-all"
                                >
                                    <Eye className="w-3 h-3" />
                                    View
                                </button>
                                <button
                                    onClick={() => onUpdate?.(student)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-700/40 active:scale-95 transition-all"
                                >
                                    <Pencil className="w-3 h-3" />
                                    Update
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    },
);

StudentsTableMobileCard.displayName = "StudentsTableMobileCard";
export default StudentsTableMobileCard;
