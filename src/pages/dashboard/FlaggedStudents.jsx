import React, { memo } from "react";
import { AlertTriangle } from "lucide-react";
import MoodIcon from "./MoodIcon";

const FlaggedStudents = memo(({ students }) => (
    <div className="glass glass-card transition-all duration-300">
        <div className="glass__refract" />
        <div className="glass__refract--soft" />
        <div className="glass__noise" />

        <div className="relative z-10 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-primary" />
                    <h2 className="text-base md:text-lg font-semibold text-foreground">
                        Students Needing Support
                    </h2>
                </div>
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <span className="text-xs md:text-sm font-bold text-primary">{students.length}</span>
                </div>
            </div>

            <div className="space-y-2 md:space-y-3">
                {students.map((student, index) => (
                    <div
                        key={student.name}
                        className="p-3 md:p-4 rounded-lg bg-card/40 border border-border/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-card/60 cursor-pointer"
                        style={{ transitionDelay: `${index * 50}ms` }}
                    >
                        <div className="flex items-start gap-3">
                            <MoodIcon mood={student.mood} size="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5" />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="font-semibold text-foreground text-sm md:text-base truncate">
                                        {student.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground flex-shrink-0 px-2 py-1 rounded-full bg-muted/50">
                                        {student.lastCheckin}
                                    </span>
                                </div>
                                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                    {student.notes}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
));

FlaggedStudents.displayName = 'FlaggedStudents';
export default FlaggedStudents;