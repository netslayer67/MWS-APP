import { motion } from "framer-motion";
import { Sparkles, CalendarDays, TrendingUp } from "lucide-react";

const GrowthJourneyHistory = ({ intervention, config, glassStyles }) => (
    <div className="lg:w-80 xl:w-96">
        <div className={`${glassStyles.inner} rounded-2xl p-4 h-full`}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Check-in History</p>
                    <h4 className="text-base font-bold text-foreground dark:text-white">Recent Reflections</h4>
                </div>
            </div>

            <div className="space-y-3 max-h-56 sm:max-h-80 overflow-y-auto pr-0 sm:pr-1 custom-scroll">
                {(intervention.history || []).length > 0 ? (
                    intervention.history.map((entry, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + idx * 0.05 }}
                            className={`${config.lightBg} rounded-xl p-3 ${config.border} border`}
                        >
                            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                                <CalendarDays className="w-3 h-3" />
                                {entry.date}
                            </div>
                            <p className="text-sm text-foreground dark:text-white">{entry.notes}</p>
                            {entry.score != null && (
                                <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${config.lightBg} ${config.text} text-xs font-medium`}>
                                    <TrendingUp className="w-3 h-3" />
                                    {entry.score} {intervention.progressUnit || "pts"}
                                </div>
                            )}
                            {entry.celebration && (
                                <div className="mt-2 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full inline-flex items-center gap-1">
                                    {entry.celebration}
                                </div>
                            )}
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <span className="text-3xl block mb-2">No check-ins yet</span>
                    </div>
                )}
            </div>
        </div>
    </div>
);

export default GrowthJourneyHistory;
