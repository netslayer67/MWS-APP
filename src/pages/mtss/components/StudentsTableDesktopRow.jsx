import { memo } from "react";
import { ensureStudentInterventions, getMostCriticalForDisplay } from "../utils/interventionUtils";

const StudentsTableDesktopRow = memo(
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

        const classLabel = student.className || "—";
        const mentorLabel = student.mentor || student.profile?.mentor || "-";

        const tierStyle = tierBadgeStyles[criticalInfo.tierCode] || tierBadgeStyles.tier1;
        const icon = criticalInfo.intervention
            ? interventionIcons[criticalInfo.intervention.type] || defaultIcon
            : universalIcon;

        return (
            <tr
                className={`mtss-table-row border-b border-transparent last:border-none bg-gradient-to-r ${theme?.bg} relative hover:brightness-105 transition-all`}
                data-aos={theme?.aos || "fade-up"}
                data-aos-delay="180"
                data-aos-duration="450"
            >
                <td className="w-1">
                    <span className={`block w-1 h-full ${theme?.accent || "bg-primary/40"} rounded-full`} />
                </td>
                {selectable && (
                    <td className="py-4">
                        <input
                            type="checkbox"
                            className="rounded border-border/60"
                            checked={selected}
                            onChange={() => onSelect?.(student)}
                        />
                    </td>
                )}
                <td className="py-4">
                    <button
                        type="button"
                        onClick={() => onView?.(student)}
                        className="text-left font-semibold text-foreground dark:text-white hover:text-primary transition"
                    >
                        {student.name}
                    </button>
                    <div className="text-xs text-muted-foreground dark:text-white/60">{student.grade}</div>
                </td>
                <td className="py-4 text-sm text-muted-foreground">
                    <div className="font-medium text-foreground dark:text-white">{classLabel}</div>
                    <div className="text-xs text-muted-foreground dark:text-white/70">Mentor: {mentorLabel}</div>
                </td>
                <td className="py-4">
                    {criticalInfo.mode === "universal" ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700/50">
                            <span className="text-base">{universalIcon}</span>
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Universal</span>
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/80 dark:bg-white/10 border border-white/60 dark:border-white/20 shadow-sm">
                            <span className="text-base">{icon}</span>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-foreground dark:text-white">
                                    {criticalInfo.label}
                                </span>
                                {criticalInfo.strategy && (
                                    <span className="text-[10px] text-muted-foreground dark:text-white/60 truncate max-w-[120px]">
                                        {criticalInfo.strategy}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </td>
                <td className="py-4">
                    <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${tierStyle.bg} ${tierStyle.text} shadow-md ${tierStyle.shadow}`}
                    >
                        {criticalInfo.tier}
                    </span>
                </td>
                <td className="py-4">
                    <ProgressBadge status={student.progress} />
                </td>
                <td className="py-4 text-sm text-muted-foreground dark:text-white/70">{student.nextUpdate}</td>
                {showActions && (
                    <td className="py-4">
                        <div className="flex items-center gap-2 justify-center">
                            <button
                                onClick={() => onView?.(student)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all"
                            >
                                View
                            </button>
                            <button
                                onClick={() => onUpdate?.(student)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all"
                            >
                                Update
                            </button>
                        </div>
                    </td>
                )}
            </tr>
        );
    },
);

StudentsTableDesktopRow.displayName = "StudentsTableDesktopRow";
export default StudentsTableDesktopRow;
