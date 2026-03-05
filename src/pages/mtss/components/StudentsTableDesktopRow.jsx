import { memo } from "react";
import { Eye, TrendingUp, FilePenLine } from "lucide-react";
import { ensureStudentInterventions, getMostCriticalForDisplay } from "../utils/interventionUtils";
import { formatPlanAuditDate } from "../utils/editPlanAccess";

const ROW_ACCENT_COLORS = [
    "from-indigo-500 to-purple-500",
    "from-cyan-500 to-blue-500",
    "from-amber-500 to-orange-500",
    "from-emerald-500 to-teal-500",
    "from-pink-500 to-rose-500",
];

const formatAuditDateCompact = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(parsed);
};

const compactPersonName = (value = "Unknown") => {
    const normalized = String(value || "Unknown").split(",")[0].trim();
    if (!normalized) return "Unknown";
    const words = normalized.split(/\s+/).filter(Boolean);
    if (words.length <= 2) return normalized;
    return `${words[0]} ${words[1]}`;
};

const StudentsTableDesktopRow = memo(
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

        const classLabel = student.className || "\u2014";
        const mentorLabel = student.mentor || student.profile?.mentor || "-";
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
        const lastModifiedAtFull = formatPlanAuditDate(primaryAssignment?.lastPlanUpdatedAt);
        const lastModifiedAtCompact = formatAuditDateCompact(primaryAssignment?.lastPlanUpdatedAt);
        const lastModifiedBy = primaryAssignment?.lastPlanUpdatedByName || "Unknown";
        const lastModifiedByCompact = compactPersonName(lastModifiedBy);
        const canEditPlan = hasInterventionPlan && Boolean(onEditPlan) && (
            typeof canEditPlanForStudent === "function"
                ? canEditPlanForStudent(student)
                : Boolean(primaryAssignment?.assignmentId || student.assignmentId)
        );
        const actionButtons = [
            {
                key: "view",
                label: "View Details",
                onClick: () => onView?.(student),
                icon: Eye,
                className: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-700/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:shadow-indigo-200/30 dark:hover:shadow-indigo-900/20",
            },
        ];
        if (hasInterventionPlan) {
            actionButtons.push({
                key: "progress",
                label: "Progress Update",
                onClick: () => onUpdate?.(student),
                icon: TrendingUp,
                className: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-700/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:shadow-amber-200/30 dark:hover:shadow-amber-900/20",
            });
        }
        if (canEditPlan) {
            actionButtons.push({
                key: "edit",
                label: "Edit Plan",
                onClick: () => onEditPlan?.(student),
                icon: FilePenLine,
                className: "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-300 border-cyan-200/60 dark:border-cyan-700/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 hover:shadow-cyan-200/30 dark:hover:shadow-cyan-900/20",
            });
        }

        const accentColor = ROW_ACCENT_COLORS[index % ROW_ACCENT_COLORS.length];

        return (
            <tr
                className="group border-b border-slate-100/80 dark:border-slate-700/40 last:border-none hover:bg-gradient-to-r hover:from-indigo-50/50 hover:via-purple-50/30 hover:to-transparent dark:hover:from-white/[0.04] dark:hover:via-white/[0.02] dark:hover:to-transparent transition-colors duration-200"
            >
                {/* Accent bar */}
                <td className="w-1.5 py-0">
                    <div className={`w-1 h-8 my-auto rounded-full bg-gradient-to-b ${accentColor} opacity-60 group-hover:opacity-100 group-hover:h-10 transition-all duration-200`} />
                </td>

                {selectable && (
                    <td className="py-3.5 pl-2 align-top">
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded-md border-slate-300 dark:border-slate-600 text-indigo-500 focus:ring-indigo-400 transition"
                            checked={selected}
                            onChange={() => onSelect?.(student)}
                        />
                    </td>
                )}

                {/* Student name */}
                <td className="py-3.5 pl-3 pr-2 align-top w-[23%]">
                    <button
                        type="button"
                        onClick={() => onView?.(student)}
                        className="text-left group/name"
                    >
                        <span
                            className="block truncate max-w-[220px] font-semibold text-sm text-slate-800 dark:text-white group-hover/name:text-indigo-600 dark:group-hover/name:text-indigo-400 transition-colors"
                            title={student.name}
                        >
                            {student.name}
                        </span>
                        <span className="block text-[10px] text-slate-500 dark:text-slate-300 mt-0.5">{student.grade}</span>
                    </button>
                </td>

                {/* Class / Mentor */}
                <td className="py-3.5 pr-2 align-top w-[16%]">
                    <span className="block text-sm font-medium text-slate-700 dark:text-slate-200 truncate" title={classLabel}>
                        {classLabel}
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-300 mt-0.5 truncate" title={`Mentor: ${mentorLabel}`}>
                        Mentor: {mentorLabel}
                    </span>
                </td>

                {/* Focus Area */}
                <td className="py-3.5 pr-2 align-top w-[15%]">
                    {criticalInfo.mode === "universal" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/25 border border-emerald-200/70 dark:border-emerald-700/40 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                            <span className="text-[12px]">{universalIcon}</span>
                            Universal
                        </span>
                    ) : (
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/40 max-w-full">
                            <span className="text-[13px] leading-none">{icon}</span>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[120px]" title={criticalInfo.label}>
                                    {criticalInfo.label}
                                </span>
                                {criticalInfo.strategy && (
                                    <span className="text-[9px] text-slate-500 dark:text-slate-300 truncate max-w-[120px]" title={criticalInfo.strategy}>
                                        {criticalInfo.strategy}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </td>

                {/* Tier */}
                <td className="py-3.5 pr-2 align-top w-[8%]">
                    <span className={`inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide ${tierStyle.bg} ${tierStyle.text} shadow-sm`}>
                        {criticalInfo.tier}
                    </span>
                </td>

                {/* Progress */}
                <td className="py-3.5 pr-2 align-top w-[11%]">
                    <ProgressBadge status={student.progress} />
                </td>

                {/* Next Update */}
                <td className="py-3.5 pr-2 align-top w-[17%] text-[12px] text-slate-600 dark:text-slate-300 font-medium">
                    <div className="whitespace-nowrap">{student.nextUpdate}</div>
                    {lastModifiedAtCompact && (
                        <div
                            className="text-[10px] text-cyan-600 dark:text-cyan-300 mt-1 truncate max-w-[220px]"
                            title={`Last modified: ${lastModifiedBy} · ${lastModifiedAtFull || lastModifiedAtCompact}`}
                        >
                            Updated {lastModifiedAtCompact} by {lastModifiedByCompact}
                        </div>
                    )}
                </td>

                {/* Actions */}
                {showActions && (
                    <td className="py-3.5 pr-3 align-top w-[14%]">
                        <div
                            className={`ml-auto grid gap-1 ${
                                actionButtons.length === 3
                                    ? "grid-cols-3"
                                    : actionButtons.length === 2
                                        ? "grid-cols-2"
                                        : "grid-cols-1"
                            } max-w-[250px]`}
                        >
                            {actionButtons.map((action) => {
                                const Icon = action.icon;
                                return (
                                <button
                                    key={action.key}
                                    type="button"
                                    onClick={action.onClick}
                                    title={action.label}
                                    aria-label={action.label}
                                    className={`w-8 h-8 inline-flex items-center justify-center rounded-lg border hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150 ${action.className}`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                </button>
                                );
                            })}
                        </div>
                    </td>
                )}
            </tr>
        );
    },
);

StudentsTableDesktopRow.displayName = "StudentsTableDesktopRow";
export default StudentsTableDesktopRow;
