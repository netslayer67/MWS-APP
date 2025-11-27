import React, { memo } from "react";
import { motion } from "framer-motion";

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
        return (
        <div className="space-y-4">
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="mtss-table-head">
                        <tr className={`${dense ? "text-[11px]" : ""} mtss-table-head-row`}>
                            {selectable && <th className="py-3 font-medium text-left w-12">Select</th>}
                            <th className="py-3 font-medium text-left">Student</th>
                            <th className="py-3 font-medium text-left">Grade</th>
                            <th className="py-3 font-medium text-left">Intervention</th>
                            <th className="py-3 font-medium text-left">Tier</th>
                            <th className="py-3 font-medium text-left">Progress</th>
                            <th className="py-3 font-medium text-left">Next Update</th>
                        {showActions && <th className="py-3 font-medium text-center">Action</th>}
                    </tr>
                </thead>
                <tbody>
                    {students.map((student, index) => {
                        const key = student.id || student._id || student.name;
                        const selected = activeSelectedIds.includes(student.id || student._id);
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
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>

        <div className="md:hidden space-y-3">
            {students.map((student, index) => {
                const key = student.id || student._id || student.name;
                const selected = activeSelectedIds.includes(student.id || student._id);
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
                    />
                );
            })}
        </div>
        </div>
    );
});

const DesktopRow = memo(({ student, TierPill, ProgressBadge, showActions, onView, onUpdate, index, selectable, selected, onSelect }) => (
    <motion.tr
        className="mtss-table-row border-b border-border/40 last:border-none"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
    >
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
    </motion.tr>
));

DesktopRow.displayName = "StudentsTableDesktopRow";

const MobileCard = memo(({ student, TierPill, ProgressBadge, showActions, onView, onUpdate, index, selectable, selected, onSelect }) => (
    <motion.div
        className="glass glass-card mtss-rainbow-shell rounded-2xl p-4 flex flex-col gap-3 shadow-[0_12px_35px_rgba(15,23,42,0.12)]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
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
    </motion.div>
));

MobileCard.displayName = "StudentsTableMobileCard";

StudentsTable.displayName = "StudentsTable";
export default StudentsTable;
