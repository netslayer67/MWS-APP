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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {quickFacts.map((fact, i) => {
                const Icon = fact.icon;
                return (
                    <motion.div
                        key={fact.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.05 }}
                        className={`${glassStyles.inner} group rounded-2xl p-3 sm:p-4 ${glassStyles.hover} hover:-translate-y-0.5 active:scale-[0.99]`}
                    >
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${fact.gradient} flex items-center justify-center mb-2 shadow-lg`}>
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                            {fact.label}
                        </p>
                        <p className="text-sm sm:text-base font-bold text-foreground dark:text-white truncate">
                            {fact.value}
                        </p>
                    </motion.div>
                );
            })}
        </div>
    );
});

QuickFactsGrid.displayName = "QuickFactsGrid";
export default QuickFactsGrid;
