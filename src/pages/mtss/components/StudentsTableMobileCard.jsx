import { memo } from "react";
import { ensureStudentInterventions, getMostCriticalForDisplay } from "../utils/interventionUtils";

const StudentsTableMobileCard = memo(
    ({
        student,
        ProgressBadge,
        showActions,
        onView,
        onUpdate,
        selectable,
        selected,
        onSelect,
        theme,
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

        return (
            <div
                className={`backdrop-blur-xl rounded-2xl p-4 flex flex-col gap-3 shadow-[0_12px_35px_rgba(15,23,42,0.12)] bg-gradient-to-br ${theme?.bg} border border-white/30 dark:border-white/10`}
                data-aos={theme?.aos || "fade-up"}
                data-aos-delay="120"
                data-aos-duration="450"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <button
                            type="button"
                            onClick={() => onView?.(student)}
                            className="text-sm font-semibold text-foreground dark:text-white hover:text-primary transition truncate block"
                        >
                            {student.name}
                        </button>
                        <span className="block text-xs text-muted-foreground dark:text-white/60">
                            {student.grade} · {student.className || "—"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {selectable && (
                            <input
                                type="checkbox"
                                className="rounded border-border/60"
                                checked={selected}
                                onChange={() => onSelect?.(student)}
                            />
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {criticalInfo.mode === "universal" ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700/50">
                            <span className="text-sm">{universalIcon}</span>
                            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Universal</span>
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-white/10 border border-white/60 dark:border-white/20">
                            <span className="text-sm">{icon}</span>
                            <span className="text-[11px] font-semibold text-foreground dark:text-white">
                                {criticalInfo.label}
                            </span>
                        </div>
                    )}
                    <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-bold ${tierStyle.bg} ${tierStyle.text} shadow-sm`}
                    >
                        {criticalInfo.tier}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <ProgressBadge status={student.progress} compact />
                    <span className="text-xs text-muted-foreground dark:text-white/60">{student.nextUpdate}</span>
                </div>

                {showActions && (
                    <div className="flex items-center gap-2 justify-end pt-2 border-t border-white/20 dark:border-white/5">
                        <button
                            onClick={() => onView?.(student)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm hover:shadow-md transition-all"
                        >
                            View
                        </button>
                        <button
                            onClick={() => onUpdate?.(student)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm hover:shadow-md transition-all"
                        >
                            Update
                        </button>
                    </div>
                )}
            </div>
        );
    },
);

StudentsTableMobileCard.displayName = "StudentsTableMobileCard";
export default StudentsTableMobileCard;
