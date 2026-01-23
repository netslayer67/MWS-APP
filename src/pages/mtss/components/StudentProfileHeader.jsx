import { memo } from "react";
import { ProgressBadge } from "./StatusPills";
import { TIER_CONFIG } from "../config/studentProfileConfig";

const StudentProfileHeader = memo(({
    student,
    highlight,
    currentTier,
    currentInterventionLabel
}) => {
    const tierConfig = TIER_CONFIG[currentTier] || TIER_CONFIG.tier1;
    const classLabel = student.className && student.className !== student.grade ? student.className : null;

    return (
        <div className="relative overflow-hidden text-white">
            <div className="absolute inset-0 mtss-hero-gradient" />
            <div className="absolute inset-0 mtss-hero-aurora opacity-80" />
            <div className="absolute inset-0 mtss-hero-shine hidden sm:block" />
            <div className="relative px-4 sm:px-8 py-6 sm:py-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-3">
                        <span className="mtss-chip bg-white/15 text-white/90">
                            Student Spotlight
                        </span>
                        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{student.name}</h1>
                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-white/90">
                            <span className="px-3 py-1 rounded-full bg-white/15">
                                {student.grade || "-"}
                            </span>
                            {classLabel && (
                                <span className="px-3 py-1 rounded-full bg-white/10">
                                    {classLabel}
                                </span>
                            )}
                            <span className="px-3 py-1 rounded-full bg-white/10">
                                {highlight?.label || "Universal Supports"}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r ${tierConfig.gradient} shadow-lg`}>
                            {tierConfig.label}
                        </span>
                        <span className="px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-white/15 backdrop-blur-sm">
                            {currentInterventionLabel || highlight?.label || "Universal"}
                        </span>
                        <ProgressBadge status={student.progress} />
                    </div>
                </div>
            </div>
        </div>
    );
});

StudentProfileHeader.displayName = "StudentProfileHeader";
export default StudentProfileHeader;
