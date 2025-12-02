import React, { memo } from "react";

const ROW_THEMES = [
    { bg: "from-[#ecfeff]/90 via-[#fef3c7]/80 to-white/80 dark:from-white/5 dark:via-white/5 dark:to-white/0", accent: "bg-[#22d3ee]/70", aos: "fade-up" },
    { bg: "from-[#f5f3ff]/90 via-[#ede9fe]/85 to-white/80 dark:from-white/10 dark:via-white/5 dark:to-white/5", accent: "bg-[#a855f7]/60", aos: "fade-up-right" },
    { bg: "from-[#fff7ed]/90 via-[#fef3c7]/85 to-white/80 dark:from-white/5 dark:via-white/5 dark:to-white/0", accent: "bg-[#fb923c]/60", aos: "fade-up-left" },
    { bg: "from-[#ecfccb]/90 via-[#d9f99d]/80 to-white/80 dark:from-white/5 dark:via-white/5 dark:to-white/0", accent: "bg-[#4ade80]/70", aos: "zoom-in-up" },
];
const MAX_RENDER = 50;

const StudentsTable = memo(
    ({
        students,
        TierPill,
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
                <div
                    className="hidden md:block overflow-x-auto rounded-[28px] border border-white/30 dark:border-white/10 bg-gradient-to-br from-white/90 via-white/70 to-white/60 dark:from-white/5 dark:via-white/5 dark:to-white/0 shadow-[0_25px_70px_rgba(15,23,42,0.18)]"
                    data-aos="fade-up"
                    data-aos-delay="220"
                >
                    <table className="w-full text-sm">
                        <thead className="mtss-table-head">
                            <tr className={`${dense ? "text-[11px]" : ""} mtss-table-head-row`}>
                                <th className="py-3 w-2" />
                                {selectable && <th className="py-3 font-semibold text-left w-12 text-slate-500 tracking-[0.2em] uppercase">Select</th>}
                                <th className="py-3 font-semibold text-left tracking-[0.2em] uppercase text-xs text-slate-500">Student</th>
                                <th className="py-3 font-semibold text-left tracking-[0.2em] uppercase text-xs text-slate-500">Grade</th>
                                <th className="py-3 font-semibold text-left tracking-[0.2em] uppercase text-xs text-slate-500">Intervention</th>
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
                                        TierPill={TierPill}
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
                                TierPill={TierPill}
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

const DesktopRow = memo(({ student, TierPill, ProgressBadge, showActions, onView, onUpdate, selectable, selected, onSelect, theme }) => (
    <tr
        className={`mtss-table-row border-b border-transparent last:border-none bg-gradient-to-r ${theme?.bg} relative`}
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
        <td className="py-4 font-semibold text-foreground dark:text-white">{student.name}</td>
        <td className="py-4 text-muted-foreground dark:text-white/70">{student.grade}</td>
        <td className="py-4 text-foreground dark:text-white">{student.type}</td>
        <td className="py-4">
            <TierPill tier={student.tier} />
        </td>
        <td className="py-4">
            <ProgressBadge status={student.progress} />
        </td>
        <td className="py-4 text-muted-foreground">{student.nextUpdate}</td>
        {showActions && (
            <td className="py-4">
                <div className="flex items-center gap-2 justify-center">
                    <button
                        onClick={() => onView?.(student)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-[#0ea5e9]/85 via-[#6366f1]/85 to-[#34d399]/80 text-white shadow-sm hover:shadow-md transition"
                    >
                        View
                    </button>
                    <button
                        onClick={() => onUpdate?.(student)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-[#fbbf24]/80 to-[#fb7185]/80 text-white shadow-sm hover:shadow-md transition"
                    >
                        Update
                    </button>
                </div>
            </td>
        )}
    </tr>
));

DesktopRow.displayName = "StudentsTableDesktopRow";

const MobileCard = memo(({ student, TierPill, ProgressBadge, showActions, onView, onUpdate, selectable, selected, onSelect, theme }) => (
    <div
        className={`glass glass-card rounded-2xl p-4 flex flex-col gap-3 shadow-[0_12px_35px_rgba(15,23,42,0.12)] bg-gradient-to-br ${theme?.bg}`}
        data-aos={theme?.aos || "fade-up"}
        data-aos-delay="120"
        data-aos-duration="450"
    >
        <div className="flex items-start justify-between gap-3">
            <div>
                <p className="text-sm font-semibold text-foreground">{student.name}</p>
                <span className="text-xs text-muted-foreground">
                    {student.grade} &nbsp; {student.type}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{student.nextUpdate}</span>
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
        <div className="flex items-center justify-between gap-3">
            <TierPill tier={student.tier} compact />
            <ProgressBadge status={student.progress} compact />
        </div>
        {showActions && (
            <div className="flex items-center gap-2 justify-end pt-2">
                <button
                    onClick={() => onView?.(student)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-[#0ea5e9]/85 via-[#6366f1]/85 to-[#34d399]/80 text-white shadow-sm hover:shadow-md transition"
                >
                    View
                </button>
                <button
                    onClick={() => onUpdate?.(student)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-[#fbbf24]/80 to-[#fb7185]/80 text-white shadow-sm hover:shadow-md transition"
                >
                    Update
                </button>
            </div>
        )}
    </div>
));

MobileCard.displayName = "StudentsTableMobileCard";

StudentsTable.displayName = "StudentsTable";
export default StudentsTable;
