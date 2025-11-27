import React, { memo } from "react";
import { CalendarHeart } from "lucide-react";

const StudentSchedulePanel = ({ student }) => (
    <div className="space-y-6">
        {["thisWeek", "nextWeek"].map((weekKey) => (
            <div key={weekKey} className="rounded-[40px] bg-white/95 dark:bg-white/5 border border-white/40 dark:border-white/10 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                            {weekKey === "thisWeek" ? "This Week" : "Next Week"}
                        </p>
                        <h3 className="text-lg font-black text-foreground dark:text-white">My MTSS Schedule</h3>
                    </div>
                    <CalendarHeart className="w-5 h-5 text-sky-500" />
                </div>
                <div className="space-y-3">
                    {student.data.schedule[weekKey].map((item) => (
                        <div
                            key={`${weekKey}-${item.day}`}
                            className="rounded-[30px] bg-gradient-to-r from-[#fff7ed] to-[#fef3c7] dark:from-white/10 dark:to-white/5 p-4 border border-white/70 dark:border-white/10"
                        >
                            <p className="text-sm font-black text-rose-500">{item.day}</p>
                            <p className="text-base font-semibold text-foreground dark:text-white">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.room}</p>
                            <p className="text-sm text-foreground dark:text-white/80 mt-1">{item.note}</p>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

StudentSchedulePanel.displayName = "StudentSchedulePanel";
export default memo(StudentSchedulePanel);
