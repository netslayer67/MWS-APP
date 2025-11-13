import React, { memo } from "react";
import { motion } from "framer-motion";

const StudentsTable = memo(({ students, TierPill, ProgressBadge, dense = false, showActions = false, onView, onUpdate }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm">
            <thead>
                <tr className={`text-left text-muted-foreground border-b border-border/60 ${dense ? "text-xs" : ""}`}>
                    <th className="py-3 font-medium">Student</th>
                    <th className="py-3 font-medium">Grade</th>
                    <th className="py-3 font-medium">Intervention</th>
                    <th className="py-3 font-medium">Tier</th>
                    <th className="py-3 font-medium">Progress</th>
                    <th className="py-3 font-medium">Next Update</th>
                    {showActions && <th className="py-3 font-medium text-center">Action</th>}
                </tr>
            </thead>
            <tbody>
                {students.map((student, index) => (
                    <motion.tr
                        key={student.name}
                        className="border-b border-border/40 last:border-none"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                    >
                        <td className="py-4 font-semibold text-foreground">{student.name}</td>
                        <td className="py-4 text-muted-foreground">{student.grade}</td>
                        <td className="py-4 text-foreground">{student.type}</td>
                        <td className="py-4">
                            <TierPill tier={student.tier} />
                        </td>
                        <td className="py-4">
                            <ProgressBadge status={student.progress} />
                        </td>
                        <td className="py-4 text-muted-foreground">{student.nextUpdate}</td>
                        {showActions && (
                            <td className="py-4">
                                <div className="flex items-center gap-2 justify-center">
                                    <button
                                        onClick={() => onView?.(student)}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-[#a855f7]/80 to-[#ec4899]/80 text-white shadow-sm hover:shadow-md transition"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => onUpdate?.(student)}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-[#34d399]/80 to-[#22d3ee]/80 text-white shadow-sm hover:shadow-md transition"
                                    >
                                        Update
                                    </button>
                                </div>
                            </td>
                        )}
                    </motion.tr>
                ))}
            </tbody>
        </table>
    </div>
));

StudentsTable.displayName = "StudentsTable";
export default StudentsTable;
