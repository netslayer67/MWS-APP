import { memo } from "react";
import { Eye, Pencil } from "lucide-react";
import { ensureStudentInterventions, getMostCriticalForDisplay } from "../utils/interventionUtils";
import { formatPlanAuditDate } from "../utils/editPlanAccess";

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
        onEditPlan,
        canEditPlanForStudent,
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
        const assignmentOptions = Array.isArray(student.assignmentOptions) ? student.assignmentOptions : [];
        const primaryAssignment = assignmentOptions[0] || null;
        const hasInterventionPlan = Boolean(
            assignmentOptions.some((option) => option?.assignmentId) ||
            student.assignmentId ||
            Number(student.activeAssignmentCount || 0) > 0 ||
            Number(student.assignmentCount || 0) > 0,
        );
        const lastModifiedAt = formatPlanAuditDate(primaryAssignment?.lastPlanUpdatedAt);
        const lastModifiedBy = primaryAssignment?.lastPlanUpdatedByName || "Unknown";
        const canEditPlan = hasInterventionPlan && Boolean(onEditPlan) && (
            typeof canEditPlanForStudent === "function"
                ? canEditPlanForStudent(student)
                : Boolean(primaryAssignment?.assignmentId || student.assignmentId)
        );
        const actionButtons = [
            {
                key: "view",
                label: "View",
                onClick: () => onView?.(student),
                icon: Eye,
                className: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-700/40",
            },
        ];
        if (hasInterventionPlan) {
            actionButtons.push({
                key: "progress",
                label: "Progress",
                onClick: () => onUpdate?.(student),
                icon: Pencil,
                className: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-700/40",
            });
        }
        if (canEditPlan) {
            actionButtons.push({
                key: "edit",
                label: "Edit",
                onClick: () => onEditPlan?.(student),
                icon: Pencil,
                className: "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-300 border-cyan-200/50 dark:border-cyan-700/40",
            });
        }

        const accent = CARD_ACCENT[index % CARD_ACCENT.length];

        return (
            <div
                className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-200/60 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
            >
                {/* Top accent bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${accent}`} />

                <div className="p-3 space-y-2.5">
                    {/* Name row */}
                    <div className="flex items-start justify-between gap-2.5">
                        <div className="flex-1 min-w-0">
                            <button
                                type="button"
                                onClick={() => onView?.(student)}
                                className="text-left"
                            >
                                <span className="font-bold text-[13px] text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate">
                                    {student.name}
                                </span>
                            </button>
                            <span className="text-[10px] text-slate-500 dark:text-slate-300 mt-0.5 block truncate">
                                {student.grade} · {student.className || "\u2014"}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            {selectable && (
                                <input
                                    type="checkbox"
                                    className="w-3.5 h-3.5 rounded-md border-slate-300 dark:border-slate-600 text-indigo-500"
                                    checked={selected}
                                    onChange={() => onSelect?.(student)}
                                />
                            )}
                            {/* Tier badge in top-right */}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold ${tierStyle.bg} ${tierStyle.text}`}>
                                {criticalInfo.tier}
                            </span>
                        </div>
                    </div>

                    {/* Focus + Progress row */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {criticalInfo.mode === "universal" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/25 border border-emerald-200/60 dark:border-emerald-700/40 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                <span className="text-[11px]">{universalIcon}</span>
                                Universal
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40 text-[9px] font-semibold text-slate-700 dark:text-slate-200">
                                <span className="text-[11px]">{icon}</span>
                                {criticalInfo.label}
                            </span>
                        )}
                        <ProgressBadge status={student.progress} compact />
                    </div>

                    {/* Bottom row: date + actions */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                        <span className="block text-[10px] text-slate-500 dark:text-slate-300 font-medium truncate">
                            {student.nextUpdate}
                        </span>
                        {lastModifiedAt && (
                            <span
                                className="block text-[9px] text-cyan-600 dark:text-cyan-300 truncate"
                                title={`Last modified: ${lastModifiedBy} · ${lastModifiedAt}`}
                            >
                                Last modified: {lastModifiedBy} · {lastModifiedAt}
                            </span>
                        )}

                        {showActions && (
                            <div
                                className={`grid gap-1.5 ${
                                    actionButtons.length === 3
                                        ? "grid-cols-3"
                                        : actionButtons.length === 2
                                            ? "grid-cols-2"
                                            : "grid-cols-1"
                                }`}
                            >
                                {actionButtons.map((action) => {
                                    const Icon = action.icon;
                                    return (
                                        <button
                                            key={action.key}
                                            type="button"
                                            onClick={action.onClick}
                                            className={`min-w-0 h-7 inline-flex items-center justify-center gap-1 px-1.5 text-[9px] font-semibold rounded-md border active:scale-95 transition-all ${action.className}`}
                                        >
                                            <Icon className="w-2.5 h-2.5 shrink-0" />
                                            <span className="truncate">{action.label}</span>
                                        </button>
                                    );
                                })}
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
