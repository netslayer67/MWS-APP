import { formatDateLabel } from "./adminDashboardTrends";
import {
    getAssignmentFocusLabels,
    getAssignmentStudentKeys,
    getAssignmentSupportUnitCount,
} from "./supportUnitUtils";

const normalizeTierCode = (tier = "") => {
    const normalized = String(tier || "").toLowerCase().replace(/\s+/g, "");
    if (normalized.includes("3")) return "tier3";
    if (normalized.includes("1")) return "tier1";
    return "tier2";
};

const mapTierLabel = (tier = "") => {
    const code = normalizeTierCode(tier);
    if (code === "tier3") return "Tier 3";
    if (code === "tier1") return "Tier 1";
    return "Tier 2";
};

export const buildMentorSpotlights = (assignments = []) => {
    const map = new Map();
    assignments.forEach((assignment) => {
        const mentorName = assignment.mentorId?.name || "Unassigned Mentor";
        if (!map.has(mentorName)) {
            map.set(mentorName, {
                name: mentorName,
                focusAreas: new Set(),
                caseload: 0,
                success: 0,
                total: 0,
            });
        }
        const entry = map.get(mentorName);
        const supportUnitCount = getAssignmentSupportUnitCount(assignment);
        entry.total += supportUnitCount;
        entry.caseload += supportUnitCount;
        getAssignmentFocusLabels(assignment).forEach((area) => entry.focusAreas.add(area));
        if (["completed", "active"].includes(assignment.status)) {
            entry.success += supportUnitCount;
        }
    });

    return Array.from(map.values())
        .map((entry) => ({
            name: entry.name,
            caseload: entry.caseload,
            focus: entry.focusAreas.size ? Array.from(entry.focusAreas).slice(0, 2).join(", ") : "Tiered Supports",
            trend: entry.total ? `${Math.round((entry.success / entry.total) * 100)}% success` : "New mentor",
        }))
        .sort((a, b) => b.caseload - a.caseload)
        .slice(0, 3);
};

export const buildMentorRoster = (assignments = []) => {
    const map = new Map();
    assignments.forEach((assignment) => {
        const mentorId = assignment.mentorId?._id?.toString?.() || null;
        const mentorEmail = assignment.mentorId?.email || null;
        const mentorKey = mentorId || mentorEmail || assignment.mentorId?.name || "unassigned";
        if (!map.has(mentorKey)) {
            map.set(mentorKey, {
                id: mentorId,
                email: mentorEmail,
                name: assignment.mentorId?.name || "Unassigned",
                role: assignment.mentorId?.jobPosition || assignment.mentorId?.role || "Mentor",
                students: 0,
                total: 0,
                completed: 0,
                coverage: new Map(),
            });
        }
        const entry = map.get(mentorKey);
        const studentCount = Math.max(getAssignmentStudentKeys(assignment).length, 1);
        const supportUnitCount = getAssignmentSupportUnitCount(assignment);
        entry.students += supportUnitCount;
        entry.total += supportUnitCount;
        const focusLabels = getAssignmentFocusLabels(assignment);
        const tierCode = normalizeTierCode(assignment.tier);
        const tierLabel = mapTierLabel(assignment.tier);
        focusLabels.forEach((focus) => {
            const coverageKey = `${focus}|${tierCode}`;
            const existingCoverage = entry.coverage.get(coverageKey) || {
                focus,
                tier: tierLabel,
                tierCode,
                count: 0,
                assignmentCount: 0,
            };
            existingCoverage.count += studentCount;
            existingCoverage.assignmentCount += 1;
            entry.coverage.set(coverageKey, existingCoverage);
        });
        if (assignment.status === "completed") {
            entry.completed += supportUnitCount;
        }
    });

    return Array.from(map.values())
        .map((entry) => ({
            _id: entry.id,
            email: entry.email,
            name: entry.name,
            role: entry.role,
            activeStudents: entry.students,
            successRate: entry.total ? `${Math.round((entry.completed / entry.total) * 100)}%` : "0%",
            coverage: Array.from(entry.coverage.values())
                .sort((a, b) => {
                    const tierRank = { tier3: 3, tier2: 2, tier1: 1 };
                    const rankDiff = (tierRank[b.tierCode] || 0) - (tierRank[a.tierCode] || 0);
                    if (rankDiff) return rankDiff;
                    return b.count - a.count;
                }),
        }))
        .sort((a, b) => b.activeStudents - a.activeStudents);
};

export const buildRecentActivity = (assignments = []) => {
    const entries = [];
    assignments.forEach((assignment) => {
        const studentName = assignment.studentIds?.[0]?.name || "Student group";
        const mentorName = assignment.mentorId?.name || "Mentor team";
        const checkIn = assignment.checkIns?.slice(-1)[0];
        if (checkIn) {
            entries.push({
                date: checkIn.date,
                student: studentName,
                mentor: mentorName,
                activity: checkIn.summary || "Progress update recorded",
            });
        } else {
            entries.push({
                date: assignment.updatedAt || assignment.startDate || assignment.createdAt,
                student: studentName,
                mentor: mentorName,
                activity: `Status updated to ${assignment.status}`,
            });
        }
    });

    return entries
        .filter((entry) => entry.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6)
        .map((entry) => ({
            ...entry,
            date: formatDateLabel(entry.date),
        }));
};
