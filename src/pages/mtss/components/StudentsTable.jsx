import { memo } from "react";
import {
    ensureStudentInterventions,
    getMostCriticalForDisplay,
} from "../utils/interventionUtils";

const ROW_THEMES = [
    { bg: "from-[#ecfeff]/90 via-[#fef3c7]/80 to-white/80 dark:from-white/5 dark:via-white/5 dark:to-white/0", accent: "bg-[#22d3ee]/70", aos: "fade-up" },
    { bg: "from-[#f5f3ff]/90 via-[#ede9fe]/85 to-white/80 dark:from-white/10 dark:via-white/5 dark:to-white/5", accent: "bg-[#a855f7]/60", aos: "fade-up-right" },
    { bg: "from-[#fff7ed]/90 via-[#fef3c7]/85 to-white/80 dark:from-white/5 dark:via-white/5 dark:to-white/0", accent: "bg-[#fb923c]/60", aos: "fade-up-left" },
    { bg: "from-[#ecfccb]/90 via-[#d9f99d]/80 to-white/80 dark:from-white/5 dark:via-white/5 dark:to-white/0", accent: "bg-[#4ade80]/70", aos: "zoom-in-up" },
];
const MAX_RENDER = 50;

// Tier badge colors - more vibrant
const tierBadgeStyles = {
    tier1: {
        bg: "bg-gradient-to-r from-emerald-400 to-teal-500",
        text: "text-white",
        shadow: "shadow-emerald-200/50",
    },
    tier2: {
        bg: "bg-gradient-to-r from-amber-400 to-orange-500",
        text: "text-white",
        shadow: "shadow-amber-200/50",
    },
    tier3: {
        bg: "bg-gradient-to-r from-rose-400 to-pink-500",
        text: "text-white",
        shadow: "shadow-rose-200/50",
    },
};

// Intervention icons
const interventionIcons = {
    SEL: "💜",
    ENGLISH: "📚",
    MATH: "🔢",
    BEHAVIOR: "⭐",
    ATTENDANCE: "📅",
};

const StudentsTable = memo(
    ({
        students,
        ProgressBadge,
        dense = false,
        showActions = false,
        onView,
        onUpdate,
        selectable = false,
        selectedIds = [],
        onSelect,
    }) => {
        const activeSelectedIds = selectedIds || [];
        const limitedStudents = students.slice(0, Math.min(MAX_RENDER, students.length));

        return (
            <div className="space-y-5">
                {/* Desktop Table */}
                <div
                    className="hidden md:block overflow-x-auto rounded-[28px] border border-white/30 dark:border-white/10 bg-gradient-to-br from-white/90 via-white/70 to-white/60 dark:from-white/5 dark:via-white/5 dark:to-white/0 shadow-[0_25px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl"
                    data-aos="fade-up"
                    data-aos-delay="220"
                >
                    <table className="w-full text-sm">
                        <thead className="mtss-table-head">
                            <tr className={`${dense ? "text-[11px]" : ""} mtss-table-head-row`}>
                                <th className="py-3 w-2" />
                                {selectable && <th className="py-3 font-semibold text-left w-12 text-slate-500 tracking-[0.2em] uppercase">Select</th>}
                                <th className="py-3 font-semibold text-left tracking-[0.2em] uppercase text-xs text-slate-500">Student</th>
                                <th className="py-3 font-semibold text-left tracking-[0.2em] uppercase text-xs text-slate-500">Class / Mentor</th>
                                <th className="py-3 font-semibold text-left tracking-[0.2em] uppercase text-xs text-slate-500">Focus Area</th>
                                <th className="py-3 font-semibold text-left tracking-[0.2em] uppercase text-xs text-slate-500">Tier</th>
                                <th className="py-3 font-semibold text-left tracking-[0.2em] uppercase text-xs text-slate-500">Progress</th>
                                <th className="py-3 font-semibold text-left tracking-[0.2em] uppercase text-xs text-slate-500">Next Update</th>
                                {showActions && <th className="py-3 font-semibold text-center tracking-[0.2em] uppercase text-xs text-slate-500">Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {limitedStudents.map((student, index) => {
                                const key = student.id || student._id || student.name;
                                const selected = activeSelectedIds.includes(student.id || student._id);
                                const theme = ROW_THEMES[index % ROW_THEMES.length];
                                return (
                                    <DesktopRow
                                        key={key}
                                        index={index}
                                        student={student}
                                        ProgressBadge={ProgressBadge}
                                        showActions={showActions}
                                        onView={onView}
                                        onUpdate={onUpdate}
                                        selectable={selectable}
                                        selected={selected}
                                        onSelect={onSelect}
                                        theme={theme}
                                    />
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                    {limitedStudents.map((student, index) => {
                        const key = student.id || student._id || student.name;
                        const selected = activeSelectedIds.includes(student.id || student._id);
                        const theme = ROW_THEMES[index % ROW_THEMES.length];
                        return (
                            <MobileCard
                                key={key}
                                index={index}
                                student={student}
                                ProgressBadge={ProgressBadge}
                                showActions={showActions}
                                onView={onView}
                                onUpdate={onUpdate}
                                selectable={selectable}
                                selected={selected}
                                onSelect={onSelect}
                                theme={theme}
                            />
                        );
                    })}
                </div>
            </div>
        );
    },
);

const DesktopRow = memo(({ student, ProgressBadge, showActions, onView, onUpdate, selectable, selected, onSelect, theme }) => {
    const interventions = ensureStudentInterventions(student.interventions);
    const profile = student.profile || {};

    // Get the most critical intervention (highest tier, lowest value)
    const criticalInfo = getMostCriticalForDisplay(interventions, profile, student);

    const classLabel = student.className || "—";
    const mentorLabel = student.mentor || student.profile?.mentor || "-";

    // Get tier badge style
    const tierStyle = tierBadgeStyles[criticalInfo.tierCode] || tierBadgeStyles.tier1;
    const icon = criticalInfo.intervention ? interventionIcons[criticalInfo.intervention.type] || "📋" : "🌟";

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
                        <span className="text-base">🌟</span>
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Universal</span>
                    </div>
                ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/80 dark:bg-white/10 border border-white/60 dark:border-white/20 shadow-sm">
                        <span className="text-base">{icon}</span>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-foreground dark:text-white">{criticalInfo.label}</span>
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
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${tierStyle.bg} ${tierStyle.text} shadow-md ${tierStyle.shadow}`}>
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
});

DesktopRow.displayName = "StudentsTableDesktopRow";

const MobileCard = memo(({ student, ProgressBadge, showActions, onView, onUpdate, selectable, selected, onSelect, theme }) => {
    const interventions = ensureStudentInterventions(student.interventions);
    const profile = student.profile || {};

    // Get the most critical intervention (highest tier, lowest value)
    const criticalInfo = getMostCriticalForDisplay(interventions, profile, student);

    // Get tier badge style
    const tierStyle = tierBadgeStyles[criticalInfo.tierCode] || tierBadgeStyles.tier1;
    const icon = criticalInfo.intervention ? interventionIcons[criticalInfo.intervention.type] || "📋" : "🌟";

    return (
        <div
            className={`backdrop-blur-xl rounded-2xl p-4 flex flex-col gap-3 shadow-[0_12px_35px_rgba(15,23,42,0.12)] bg-gradient-to-br ${theme?.bg} border border-white/30 dark:border-white/10`}
            data-aos={theme?.aos || "fade-up"}
            data-aos-delay="120"
            data-aos-duration="450"
        >
            {/* Header */}
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

            {/* Focus Area & Tier */}
            <div className="flex items-center gap-2 flex-wrap">
                {criticalInfo.mode === "universal" ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700/50">
                        <span className="text-sm">🌟</span>
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Universal</span>
                    </div>
                ) : (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-white/10 border border-white/60 dark:border-white/20">
                        <span className="text-sm">{icon}</span>
                        <span className="text-[11px] font-semibold text-foreground dark:text-white">{criticalInfo.label}</span>
                    </div>
                )}
                <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-bold ${tierStyle.bg} ${tierStyle.text} shadow-sm`}>
                    {criticalInfo.tier}
                </span>
            </div>

            {/* Progress & Next Update */}
            <div className="flex items-center justify-between gap-3">
                <ProgressBadge status={student.progress} compact />
                <span className="text-xs text-muted-foreground dark:text-white/60">{student.nextUpdate}</span>
            </div>

            {/* Actions */}
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
});

MobileCard.displayName = "StudentsTableMobileCard";

StudentsTable.displayName = "StudentsTable";
export default StudentsTable;
