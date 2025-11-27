import React, { memo } from "react";
import { Activity, Sparkles } from "lucide-react";

const AdminAnalyticsPanel = ({ successByType, trendPaths, trendData, strategyHighlights, tierMovement }) => (
    <div className="space-y-6">
        <div className="glass glass-card mtss-card-surface p-6 rounded-[32px] space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Pulse</p>
                    <h3 className="text-xl font-black text-foreground dark:text-white">Success rate by intervention type</h3>
                </div>
                <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="space-y-4">
                {successByType.map((item) => (
                    <div key={item.label}>
                        <div className="flex items-center justify-between text-sm font-semibold text-foreground dark:text-white mb-1">
                            <span>{item.label}</span>
                            <span>{item.value}%</span>
                        </div>
                        <div className="h-3 rounded-full bg-white/15">
                            <div className={`h-full rounded-full bg-gradient-to-r ${item.gradient}`} style={{ width: `${item.value}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="glass glass-card mtss-card-surface p-6 rounded-[32px] space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Trajectory</p>
                    <h3 className="text-xl font-black text-foreground dark:text-white">Student progress over time</h3>
                </div>
                <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="w-full overflow-x-auto">
                <svg viewBox="0 0 600 200" className="w-full h-48">
                    <defs>
                        <linearGradient id="metLine" x1="0%" x2="100%" y1="0%" y2="0%">
                            <stop offset="0%" stopColor="#6ee7b7" />
                            <stop offset="100%" stopColor="#22c55e" />
                        </linearGradient>
                        <linearGradient id="supportLine" x1="0%" x2="100%" y1="0%" y2="0%">
                            <stop offset="0%" stopColor="#fb7185" />
                            <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>
                    </defs>
                    <path d={trendPaths.met} fill="none" stroke="url(#metLine)" strokeWidth="4" strokeLinecap="round" />
                    <path d={trendPaths.support} fill="none" stroke="url(#supportLine)" strokeWidth="4" strokeLinecap="round" />
                </svg>
                <div className="flex justify-between text-xs text-muted-foreground dark:text-white/70">
                    {trendData.map((point) => (
                        <span key={point.label}>{point.label}</span>
                    ))}
                </div>
            </div>
        </div>

        <div className="glass glass-card mtss-card-surface p-6 rounded-[32px] grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Strategy lab</p>
                    <h3 className="text-xl font-black text-foreground dark:text-white">Most effective strategies</h3>
                </div>
                <div className="space-y-3 text-sm">
                    {strategyHighlights.map((strategy) => (
                        <div key={strategy.label} className="flex items-center justify-between rounded-2xl bg-white/70 dark:bg-white/5 px-4 py-3">
                            <span className="font-semibold text-foreground dark:text-white">{strategy.label}</span>
                            <span className="text-lg font-black text-primary">{strategy.value}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Movement report</p>
                    <h3 className="text-xl font-black text-foreground dark:text-white">Tier movement (Last 30 days)</h3>
                </div>
                <div className="rounded-[28px] bg-gradient-to-br from-[#f8fafc] to-[#e0f2fe] dark:from-white/10 dark:to-white/5 p-6 space-y-4 text-foreground dark:text-white">
                    {tierMovement.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.label} className="flex items-center gap-3">
                                <Icon className={`w-6 h-6 ${item.accent}`} />
                                <div>
                                    <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">{item.label}</p>
                                    <p className={`text-2xl font-black ${item.accent}`}>{item.detail}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    </div>
);

AdminAnalyticsPanel.displayName = "AdminAnalyticsPanel";
export default memo(AdminAnalyticsPanel);
