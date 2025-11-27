import React, { memo } from "react";
import { motion } from "framer-motion";

const AdminOverviewPanel = ({ statCards, systemSnapshot, recentActivity, mentorSpotlights, icons }) => {
    const TierIcon = icons.tier;
    const InterventionIcon = icons.interventions;
    const ActivityIcon = icons.activity;
    const MentorIcon = icons.mentor;

    return (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
                {statCards.map((card, index) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative p-6 rounded-[28px] bg-gradient-to-br text-white overflow-hidden mtss-card-pop shadow-[0_25px_80px_rgba(15,23,42,0.22)]"
                    >
                        <div className={`absolute inset-0 opacity-80 bg-gradient-to-br ${card.accent}`} />
                        <span className="mtss-liquid-hover-blob" />
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.4em] text-white/80">
                                <card.icon className="w-5 h-5" />
                                {card.label}
                            </div>
                            <div>
                                <p className="text-4xl font-black tracking-tight">{card.value}</p>
                                <p className="text-sm opacity-80">{card.caption}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="glass glass-card mtss-card-surface p-6 rounded-[32px] space-y-5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground dark:text-white">Students by Tier</h3>
                        <TierIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-4">
                        {systemSnapshot.tierBreakdown.map((tier) => (
                            <div key={tier.label} className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-sm font-black text-primary">
                                    {tier.count}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-foreground dark:text-white">{tier.label}</p>
                                    <p className="text-xs text-muted-foreground">{tier.description}</p>
                                    <div className="h-2.5 bg-white/30 dark:bg-white/10 rounded-full">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-primary/70 via-rose/70 to-gold/70"
                                            style={{ width: `${(tier.count / systemSnapshot.totalStudents) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="glass glass-card mtss-card-surface p-6 rounded-[32px] space-y-5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground dark:text-white">Intervention Types</h3>
                        <InterventionIcon className="w-5 h-5 text-sky-500" />
                    </div>
                    <div className="space-y-4">
                        {systemSnapshot.interventions.map((item) => (
                            <div key={item.label} className="flex items-center justify-between text-sm font-semibold">
                                <span className="text-foreground dark:text-white">{item.label}</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-32 h-2 rounded-full bg-white/20">
                                        <div
                                            className="h-2 rounded-full bg-gradient-to-r from-[#7dd3fc] to-[#60a5fa]"
                                            style={{ width: `${(item.count / systemSnapshot.totalStudents) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-muted-foreground dark:text-white/70">{item.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="glass glass-card mtss-card-surface p-6 rounded-[32px] space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground dark:text-white">Recent Activity</h3>
                        <ActivityIcon className="w-5 h-5 text-rose-500" />
                    </div>
                    <div className="space-y-3 text-sm">
                        {recentActivity.map((item) => (
                            <div
                                key={`${item.date}-${item.student}`}
                                className="grid grid-cols-[90px_1fr] gap-4 rounded-2xl bg-white/50 dark:bg-white/5 p-4"
                            >
                                <div>
                                    <p className="font-semibold text-foreground dark:text-white">{item.date}</p>
                                    <p className="text-xs text-muted-foreground">{item.mentor}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground dark:text-white">{item.student}</p>
                                    <p className="text-sm text-muted-foreground dark:text-white/70">{item.activity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="glass glass-card mtss-card-surface p-6 rounded-[32px] space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground dark:text-white">Mentor Spotlight</h3>
                        <MentorIcon className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="space-y-4">
                        {mentorSpotlights.map((mentor) => (
                            <div key={mentor.name} className="flex items-center gap-4 rounded-2xl bg-white/60 dark:bg-white/5 p-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/70 to-rose/70 text-white font-black flex items-center justify-center">
                                    {mentor.name
                                        .split(" ")
                                        .map((part) => part[0])
                                        .slice(0, 2)
                                        .join("")}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-foreground dark:text-white">{mentor.name}</p>
                                    <p className="text-xs text-muted-foreground">{mentor.focus}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-foreground dark:text-white">{mentor.caseload} students</p>
                                    <p className="text-xs text-emerald-500 font-semibold">{mentor.trend}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

AdminOverviewPanel.displayName = "AdminOverviewPanel";
export default memo(AdminOverviewPanel);
