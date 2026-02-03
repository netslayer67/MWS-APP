import { memo } from "react";
import { Eye, Pencil } from "lucide-react";
import { ensureStudentInterventions, getMostCriticalForDisplay } from "../utils/interventionUtils";

const ROW_ACCENT_COLORS = [
    "from-indigo-500 to-purple-500",
    "from-cyan-500 to-blue-500",
    "from-amber-500 to-orange-500",
    "from-emerald-500 to-teal-500",
    "from-pink-500 to-rose-500",
];

const StudentsTableDesktopRow = memo(
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

        const classLabel = student.className || "\u2014";
        const mentorLabel = student.mentor || student.profile?.mentor || "-";
        const tierStyle = tierBadgeStyles[criticalInfo.tierCode] || tierBadgeStyles.tier1;
        const icon = criticalInfo.intervention
            ? interventionIcons[criticalInfo.intervention.type] || defaultIcon
            : universalIcon;

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
                    <td className="py-4 pl-2">
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded-md border-slate-300 dark:border-slate-600 text-indigo-500 focus:ring-indigo-400 transition"
                            checked={selected}
                            onChange={() => onSelect?.(student)}
                        />
                    </td>
                )}

                {/* Student name */}
                <td className="py-4 pl-3">
                    <button
                        type="button"
                        onClick={() => onView?.(student)}
                        className="text-left group/name"
                    >
                        <span className="font-semibold text-sm text-slate-800 dark:text-white group-hover/name:text-indigo-600 dark:group-hover/name:text-indigo-400 transition-colors">
                            {student.name}
                        </span>
                        <span className="block text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{student.grade}</span>
                    </button>
                </td>

                {/* Class / Mentor */}
                <td className="py-4">
                    <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">{classLabel}</span>
                    <span className="block text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Mentor: {mentorLabel}</span>
                </td>

                {/* Focus Area */}
                <td className="py-4">
                    {criticalInfo.mode === "universal" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/25 border border-emerald-200/70 dark:border-emerald-700/40 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <span>{universalIcon}</span>
                            Universal
                        </span>
                    ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/40">
                            <span className="text-base leading-none">{icon}</span>
                            <div className="flex flex-col">
                                <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{criticalInfo.label}</span>
                                {criticalInfo.strategy && (
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[110px]">{criticalInfo.strategy}</span>
                                )}
                            </div>
                        </div>
                    )}
                </td>

                {/* Tier */}
                <td className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide ${tierStyle.bg} ${tierStyle.text} shadow-sm`}>
                        {criticalInfo.tier}
                    </span>
                </td>

                {/* Progress */}
                <td className="py-4">
                    <ProgressBadge status={student.progress} />
                </td>

                {/* Next Update */}
                <td className="py-4 text-[12px] text-slate-500 dark:text-slate-400 font-medium">{student.nextUpdate}</td>

                {/* Actions */}
                {showActions && (
                    <td className="py-4">
                        <div className="flex items-center gap-1.5 justify-center">
                            <button
                                onClick={() => onView?.(student)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-700/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:shadow-md hover:shadow-indigo-200/30 dark:hover:shadow-indigo-900/20 hover:-translate-y-0.5 transition-all duration-150"
                            >
                                <Eye className="w-3 h-3" />
                                View
                            </button>
                            <button
                                onClick={() => onUpdate?.(student)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-700/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:shadow-md hover:shadow-amber-200/30 dark:hover:shadow-amber-900/20 hover:-translate-y-0.5 transition-all duration-150"
                            >
                                <Pencil className="w-3 h-3" />
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
