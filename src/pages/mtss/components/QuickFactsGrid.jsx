import { memo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, CalendarDays, Award } from "lucide-react";
import { glassStyles } from "../config/studentProfileConfig";

const QuickFactsGrid = memo(({ student, profile, mentorLabel }) => {
    const quickFacts = [
        { label: "Grade", value: student.grade || "-", icon: BookOpen, gradient: "from-blue-500 to-cyan-500" },
        { label: "Class", value: student.className || "-", icon: Users, gradient: "from-emerald-500 to-teal-500" },
        { label: "Started", value: profile?.started || "-", icon: CalendarDays, gradient: "from-rose-500 to-pink-500" },
        { label: "Mentor", value: mentorLabel, icon: Award, gradient: "from-purple-500 to-violet-500" },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-3">
            {quickFacts.map((fact, i) => {
                const Icon = fact.icon;
                return (
                    <motion.div
                        key={fact.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.05 }}
                        className={`${glassStyles.inner} group rounded-xl sm:rounded-2xl p-2 sm:p-4 ${glassStyles.hover} hover:-translate-y-0.5 active:scale-[0.99]`}
                    >
                        <div className="flex items-center gap-2 sm:block">
                            <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${fact.gradient} flex items-center justify-center sm:mb-2 shadow-md sm:shadow-lg flex-shrink-0`}>
                                <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[8px] sm:text-xs uppercase tracking-wider text-muted-foreground leading-tight">
                                    {fact.label}
                                </p>
                                <p className="text-xs sm:text-base font-bold text-foreground dark:text-white truncate leading-tight">
                                    {fact.value}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
});

QuickFactsGrid.displayName = "QuickFactsGrid";
export default QuickFactsGrid;
