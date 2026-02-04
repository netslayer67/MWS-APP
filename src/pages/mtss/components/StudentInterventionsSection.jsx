import { motion } from "framer-motion";
import { Activity, Star } from "lucide-react";
import InterventionCard from "./InterventionCard";

const StudentInterventionsSection = ({ sortedInterventions, selectedIntervention, onSelect, glassStyles }) => (
    <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`${glassStyles.inner} rounded-xl sm:rounded-3xl p-3 sm:p-6`}
    >
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg flex-shrink-0">
                <Activity className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
                <p className="text-[9px] sm:text-xs uppercase tracking-wider text-muted-foreground">Support Map</p>
                <h3 className="text-sm sm:text-xl font-bold text-foreground dark:text-white">
                    All Interventions
                    <span className="hidden sm:inline text-sm font-normal text-muted-foreground ml-2">
                        (Click Tier 2/3 to view progress)
                    </span>
                </h3>
            </div>
        </div>

        {sortedInterventions.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-4">
                {sortedInterventions.map((intervention, idx) => (
                    <InterventionCard
                        key={intervention.id || idx}
                        intervention={intervention}
                        index={idx}
                        isSelected={selectedIntervention?.id === intervention.id}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-6 sm:py-10 text-muted-foreground">
                <Star className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-amber-400" />
                <p className="font-medium text-sm sm:text-base">No active interventions</p>
                <p className="text-xs sm:text-sm opacity-70">Universal supports are in place</p>
            </div>
        )}
    </motion.section>
);

export default StudentInterventionsSection;
