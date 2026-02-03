import { memo } from "react";
import StudentsTableDesktopRow from "./StudentsTableDesktopRow";
import StudentsTableMobileCard from "./StudentsTableMobileCard";

const MAX_RENDER = 50;

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

const interventionIcons = {
    SEL: "\uD83D\uDC96",
    ENGLISH: "\uD83D\uDCDA",
    MATH: "\uD83D\uDD22",
    BEHAVIOR: "\u2B50",
    ATTENDANCE: "\uD83D\uDCDD",
};

const DEFAULT_ICON = "\uD83D\uDCCB";
const UNIVERSAL_ICON = "\uD83C\uDF1F";

const HEADER_COLS = [
    { label: "Student", align: "text-left" },
    { label: "Class / Mentor", align: "text-left" },
    { label: "Focus Area", align: "text-left" },
    { label: "Tier", align: "text-left" },
    { label: "Progress", align: "text-left" },
    { label: "Next Update", align: "text-left" },
];

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
                {/* Desktop table */}
                <div
                    className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl shadow-[0_20px_60px_rgba(15,23,42,0.10)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.30)]"
                    data-aos="fade-up"
                    data-aos-delay="120"
                    data-aos-duration="500"
                >
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800/80">
                                <th className="py-3.5 w-2" />
                                {selectable && (
                                    <th className="py-3.5 pl-2 font-semibold text-left w-12 text-[10px] text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase">
                                        Sel
                                    </th>
                                )}
                                {HEADER_COLS.map((col) => (
                                    <th
                                        key={col.label}
                                        className={`py-3.5 font-semibold ${col.align} tracking-[0.18em] uppercase text-[10px] text-slate-400 dark:text-slate-500 ${dense ? "text-[9px]" : ""}`}
                                    >
                                        {col.label}
                                    </th>
                                ))}
                                {showActions && (
                                    <th className="py-3.5 font-semibold text-center tracking-[0.18em] uppercase text-[10px] text-slate-400 dark:text-slate-500">
                                        Action
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {limitedStudents.map((student, index) => {
                                const key = student.id || student._id || student.name;
                                const selected = activeSelectedIds.includes(student.id || student._id);
                                return (
                                    <StudentsTableDesktopRow
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
                                        tierBadgeStyles={tierBadgeStyles}
                                        interventionIcons={interventionIcons}
                                        defaultIcon={DEFAULT_ICON}
                                        universalIcon={UNIVERSAL_ICON}
                                    />
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                    {limitedStudents.map((student, index) => {
                        const key = student.id || student._id || student.name;
                        const selected = activeSelectedIds.includes(student.id || student._id);
                        return (
                            <StudentsTableMobileCard
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
                                tierBadgeStyles={tierBadgeStyles}
                                interventionIcons={interventionIcons}
                                defaultIcon={DEFAULT_ICON}
                                universalIcon={UNIVERSAL_ICON}
                            />
                        );
                    })}
                </div>
            </div>
        );
    },
);

StudentsTable.displayName = "StudentsTable";
export default StudentsTable;
