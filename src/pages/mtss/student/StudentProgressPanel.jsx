import React, { memo } from "react";
import { Sparkles, Star } from "lucide-react";

const StudentProgressPanel = ({ student }) => (
    <div className="space-y-6">
        <div className="rounded-[40px] bg-white/95 dark:bg-white/5 border border-white/40 dark:border-white/10 p-6 shadow-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Current Goal</p>
                    <h3 className="text-2xl font-black text-foreground dark:text-white">{student.data.goal}</h3>
                </div>
                <div className="rounded-[32px] bg-gradient-to-r from-[#fef3c7] to-[#fbcfe8] px-5 py-3 text-sm font-semibold text-rose-600">
                    Next Session: {student.data.nextSession.label}
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[28px] bg-gradient-to-r from-[#fee2e2] to-[#fecdd3] p-4 space-y-1">
                    <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Progress</p>
                    <p className="text-3xl font-black text-rose-500">{student.data.progress}</p>
                </div>
                <div className="rounded-[28px] bg-gradient-to-r from-[#dbeafe] to-[#bfdbfe] p-4 space-y-1">
                    <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Status</p>
                    <p className="text-3xl font-black text-sky-500">{student.data.status}</p>
                </div>
                <div className="rounded-[28px] bg-gradient-to-r from-[#fef9c3] to-[#fef3c7] p-4 space-y-1">
                    <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Next Session</p>
                    <p className="text-base font-semibold text-rose-500">{student.data.nextSession.detail}</p>
                    <p className="text-sm text-muted-foreground">{student.data.nextSession.room}</p>
                </div>
            </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[36px] bg-gradient-to-br from-white/90 to-[#fef9c3]/70 dark:from-white/5 dark:to-white/10 border border-white/50 dark:border-white/10 p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Sparkline</p>
                        <h3 className="text-xl font-black text-foreground dark:text-white">Progress Trend</h3>
                    </div>
                    <Sparkles className="w-5 h-5 text-rose-500" />
                </div>
                <svg viewBox="0 0 600 200" className="w-full h-48">
                    <defs>
                        <linearGradient id="sparkLine" x1="0%" x2="100%" y1="0%" y2="0%">
                            <stop offset="0%" stopColor="#f472b6" />
                            <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>
                    </defs>
                    <polyline
                        fill="none"
                        stroke="url(#sparkLine)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        points={student.data.chart
                            .map((point, index) => {
                                const x = (index / Math.max(1, student.data.chart.length - 1)) * 580 + 10;
                                const y = 190 - (point.value / 100) * 180;
                                return `${x},${y}`;
                            })
                            .join(" ")}
                    />
                </svg>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    {student.data.chart.map((point) => (
                        <span key={point.label}>{point.label}</span>
                    ))}
                </div>
            </div>

            <div className="rounded-[36px] bg-white/95 dark:bg-white/5 border border-white/40 dark:border-white/10 p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Recent Updates</p>
                        <h3 className="text-lg font-black text-foreground dark:text-white">Joyful Notes</h3>
                    </div>
                    <Star className="w-5 h-5 text-pink-500" />
                </div>
                {student.data.updates.map((update) => (
                    <div key={update.date} className="rounded-[24px] bg-gradient-to-r from-[#eef2ff] to-[#ffe4e6] dark:from-white/10 dark:to-white/5 p-4">
                        <p className="text-sm font-semibold text-purple-600 dark:text-purple-300">{update.date}</p>
                        <p className="text-sm text-foreground dark:text-white/80">{update.note}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

StudentProgressPanel.displayName = "StudentProgressPanel";
export default memo(StudentProgressPanel);
