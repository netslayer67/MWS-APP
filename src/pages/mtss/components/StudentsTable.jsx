import { memo } from "react";
import StudentsTableDesktopRow from "./StudentsTableDesktopRow";
import StudentsTableMobileCard from "./StudentsTableMobileCard";

const ROW_THEMES = [
    { bg: "from-[#ecfeff]/90 via-[#fef3c7]/80 to-white/80 dark:from-white/5 dark:via-white/5 dark:to-white/0", accent: "bg-[#22d3ee]/70", aos: "fade-up" },
    { bg: "from-[#f5f3ff]/90 via-[#ede9fe]/85 to-white/80 dark:from-white/10 dark:via-white/5 dark:to-white/5", accent: "bg-[#a855f7]/60", aos: "fade-up-right" },
    { bg: "from-[#fff7ed]/90 via-[#fef3c7]/85 to-white/80 dark:from-white/5 dark:via-white/5 dark:to-white/0", accent: "bg-[#fb923c]/60", aos: "fade-up-left" },
    { bg: "from-[#ecfccb]/90 via-[#d9f99d]/80 to-white/80 dark:from-white/5 dark:via-white/5 dark:to-white/0", accent: "bg-[#4ade80]/70", aos: "zoom-in-up" },
];
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
                <div
                    className="hidden md:block overflow-x-auto rounded-[28px] border border-white/30 dark:border-white/10 bg-gradient-to-br from-white/90 via-white/70 to-white/60 dark:from-white/5 dark:via-white/5 dark:to-white/0 shadow-[0_25px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl"
                    data-aos="fade-up"
                    data-aos-delay="220"
                >
                    <table className="w-full text-sm">
                        <thead className="mtss-table-head">
                            <tr className={`${dense ? "text-[11px]" : ""} mtss-table-head-row`}>
                                <th className="py-3 w-2" />
                                {selectable && (
                                    <th className="py-3 font-semibold text-left w-12 text-slate-500 tracking-[0.2em] uppercase">
                                        Select
                                    </th>
                                )}
                                <th className="py-3 font-semibold text-left tracking-[0.2em] uppercase text-xs text-slate-500">
                                    Student
                                </th>
                                <th className="py-3 font-semibold text-left tracking-[0.2em] uppercase text-xs text-slate-500">
                                    Class / Mentor
                                </th>
                                <th className="py-3 font-semibold text-left tracking-[0.2em] uppercase text-xs text-slate-500">
                                    Focus Area
                                </th>
                                <th className="py-3 font-semibold text-left tracking-[0.2em] uppercase text-xs text-slate-500">
                                    Tier
                                </th>
                                <th className="py-3 font-semibold text-left tracking-[0.2em] uppercase text-xs text-slate-500">
                                    Progress
                                </th>
                                <th className="py-3 font-semibold text-left tracking-[0.2em] uppercase text-xs text-slate-500">
                                    Next Update
                                </th>
                                {showActions && (
                                    <th className="py-3 font-semibold text-center tracking-[0.2em] uppercase text-xs text-slate-500">
                                        Action
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {limitedStudents.map((student, index) => {
                                const key = student.id || student._id || student.name;
                                const selected = activeSelectedIds.includes(student.id || student._id);
                                const theme = ROW_THEMES[index % ROW_THEMES.length];
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
                                        theme={theme}
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

                <div className="md:hidden space-y-3">
                    {limitedStudents.map((student, index) => {
                        const key = student.id || student._id || student.name;
                        const selected = activeSelectedIds.includes(student.id || student._id);
                        const theme = ROW_THEMES[index % ROW_THEMES.length];
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
                                theme={theme}
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
