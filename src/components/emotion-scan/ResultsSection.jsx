import React, { memo } from "react";
import { motion } from "framer-motion";
import WeatherReport from "./results/WeatherReport";
import EmotionsDetected from "./results/EmotionsDetected";
import MicroExpressions from "./results/MicroExpressions";
import CapacityMetrics from "./results/CapacityMetrics";
import UserReflectionInput from "./results/UserReflectionInput";
import AIAnalysis from "./results/AIAnalysis";
import PsychologicalInsight from "./results/PsychologicalInsight";
import AIReasoning from "./results/AIReasoning";
import PersonalizedRecommendation from "./results/PersonalizedRecommendation";
import SupportSelector from "@/components/emotion-staff/SupportSelector";

const ResultsSection = memo(({ analysis, onReset, onComplete, onSupportChange }) => (
    <motion.div
        key="results"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-4"
    >
        {/* Header */}
        <div className="text-center space-y-3">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-5xl"
            >
                {analysis.icon}
            </motion.div>
            <div className="space-y-1">
                <h2 className="text-lg font-bold text-foreground">
                    {analysis.detectedEmotion}
                </h2>
                <div className="flex items-center justify-center gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30">
                        <span className="text-sm font-semibold text-primary">
                            {analysis.confidence}% Confidence
                        </span>
                    </div>
                    {analysis.aiDetected && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                            <span className="text-xs font-medium text-emerald-600">
                                AI Detected
                            </span>
                        </div>
                    )}
                </div>
                {analysis.explanations && analysis.explanations.length > 0 && (
                    <div className="text-xs text-muted-foreground max-w-xs mx-auto">
                        {analysis.explanations[0]}
                    </div>
                )}
            </div>
        </div>

        {/* Scrollable Results */}
        <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
            <WeatherReport analysis={analysis} />
            <EmotionsDetected emotions={analysis.selfreportedEmotions} />
            <UserReflectionInput onReflectionChange={(reflection) => {
                // Store reflection in analysis for backend submission
                analysis.userReflection = reflection;
                console.log('User reflection:', reflection);
            }} />
            <MicroExpressions expressions={analysis.microExpressions} />

            <AIAnalysis analysis={analysis} />
            <PsychologicalInsight insight={analysis.psychologicalInsight} />
            <CapacityMetrics capacity={analysis.presenceCapacity} />
            <AIReasoning reasoning={analysis.presenceCapacity.reasoning} />
            <PersonalizedRecommendation
                recommendation={analysis.personalizedRecommendation}
                actions={analysis.suggestedActions}
            />

            <SupportSelector
                supportContact={analysis.selectedSupportContact || ""}
                onSupportChange={(contact) => {
                    // Store selected contact for later use in check-in
                    console.log('Selected support contact:', contact);
                    // Pass to parent component for storage
                    if (onSupportChange) {
                        onSupportChange(contact);
                    }
                }}
            />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
            <motion.button
                onClick={onReset}
                className="py-3 rounded-xl border-2 border-border bg-surface text-foreground font-medium hover:bg-surface/80 hover:border-primary/40 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Scan again for new AI emotional analysis"
            >
                Scan Again
            </motion.button>
            <motion.button
                onClick={() => {
                    // Update analysis state to show loading
                    if (analysis) {
                        analysis.isSubmitting = true;
                    }
                    onComplete();
                }}
                disabled={analysis?.isSubmitting}
                className="py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                whileHover={{ scale: analysis?.isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: analysis?.isSubmitting ? 1 : 0.98 }}
                aria-label="Complete check-in and proceed to results"
            >
                {analysis?.isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        Processing...
                    </div>
                ) : (
                    "Complete Check-in"
                )}
            </motion.button>
        </div>
    </motion.div>
));

ResultsSection.displayName = 'ResultsSection';
export default ResultsSection;