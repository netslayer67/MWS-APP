import { TrendingUp, Zap, Clock, BarChart3, Award } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Line } from "recharts";

const GrowthJourneyMain = ({ intervention, config, CurrentIcon, strategyLabel, durationLabel, frequencyLabel, mentorLabel }) => (
    <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
                    <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Growth Journey</p>
                    <h3 className="text-xl font-bold text-foreground dark:text-white flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
                            <CurrentIcon className="w-5 h-5 text-white" />
                        </div>
                        {intervention.label}
                    </h3>
                </div>
            </div>
            <div className="text-right">
                <span className={`text-3xl sm:text-5xl font-black bg-gradient-to-r ${config.gradient} text-transparent bg-clip-text`}>
                    {intervention.progress || 0}%
                </span>
            </div>
        </div>

        <div className={`${config.lightBg} rounded-2xl p-4`}>
            <div className="h-44 sm:h-60">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={intervention.chart || []}>
                        <defs>
                            <linearGradient id={`gradient-${intervention.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={config.chartColor} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={config.chartColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                        <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{
                                borderRadius: 16,
                                border: "none",
                                backdropFilter: "blur(12px)",
                                background: "rgba(255,255,255,0.95)",
                                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="reading"
                            stroke={config.chartColor}
                            strokeWidth={3}
                            fill={`url(#gradient-${intervention.id})`}
                        />
                        <Line
                            type="monotone"
                            dataKey="goal"
                            stroke="#0ea5e9"
                            strokeWidth={2}
                            strokeDasharray="6 4"
                            dot={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
                { label: "Baseline", value: intervention.baseline, color: "from-pink-500 to-rose-500", bg: "bg-pink-50 dark:bg-pink-900/20" },
                { label: "Current", value: intervention.current, color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                { label: "Target", value: intervention.target, color: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
            ].map((stat) => (
                <div key={stat.label} className={`${stat.bg} rounded-xl sm:rounded-2xl p-2.5 sm:p-4 text-center`}>
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
                    <p className={`text-xl sm:text-2xl font-black bg-gradient-to-r ${stat.color} text-transparent bg-clip-text`}>
                        {stat.value ?? "-"}
                    </p>
                    <p className="text-xs text-muted-foreground">{intervention.progressUnit || "pts"}</p>
                </div>
            ))}
        </div>

        <div className={`${config.lightBg} rounded-2xl p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4`}>
            <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Strategy
                </p>
                <p className="text-sm font-semibold text-foreground dark:text-white truncate">{strategyLabel}</p>
            </div>
            <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Duration
                </p>
                <p className="text-sm font-semibold text-foreground dark:text-white">{durationLabel}</p>
            </div>
            <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" /> Frequency
                </p>
                <p className="text-sm font-semibold text-foreground dark:text-white">{frequencyLabel}</p>
            </div>
            <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Award className="w-3 h-3" /> Mentor
                </p>
                <p className="text-sm font-semibold text-foreground dark:text-white truncate">{mentorLabel}</p>
            </div>
        </div>
    </div>
);

export default GrowthJourneyMain;
