/**
 * Assignment to Student mapping utilities
 */

import { normalizeGradeLabel, normalizeClassLabel } from "./teacherGradeUtils";
import { formatDate, slugify } from "./teacherCommonUtils";
import { STATUS_LABELS, STATUS_PRIORITY, TIER_PRIORITY } from "./teacherMappingConstants";
import {
    mapTierLabel,
    normalizeTierCode,
    deriveFocus,
    inferProgressUnit,
    formatDuration,
    inferNextUpdate,
    isUpdateDue,
} from "./teacherMappingHelpers";
import { buildChartSeries, buildHistory } from "./teacherMappingCharts";

export const mapAssignmentsToStudents = (assignments = [], teacherName = "MTSS Mentor") => {
    const map = new Map();
    const assignmentOptionsMap = new Map();
    assignments.forEach((assignment) => {
        const focus = deriveFocus(assignment);
        const tier = mapTierLabel(assignment.tier);
        const tierCode = normalizeTierCode(assignment.tier) || "tier2";
        const statusKey = assignment.status || "active";
        const nextUpdate = inferNextUpdate(assignment);
        const chart = buildChartSeries(assignment);
        const history = buildHistory(assignment);
        const goals = assignment.goals || [];
        const completedGoals = goals.filter((goal) => goal.completed).length;
        const assignmentId = assignment._id?.toString?.() || assignment.id || assignment.assignmentId || null;

        (assignment.studentIds || []).forEach((student) => {
            const id = student?._id?.toString?.() || student?.id || student;
            if (!id) return;
            if (assignmentId) {
                const existingOptions = assignmentOptionsMap.get(id) || [];
                if (!existingOptions.some((option) => option.assignmentId === assignmentId)) {
                    assignmentOptionsMap.set(id, [
                        ...existingOptions,
                        {
                            assignmentId,
                            focus,
                            tier,
                            tierCode,
                            statusKey,
                            statusLabel: STATUS_LABELS[statusKey] || "On Track",
                            metricLabel: assignment.metricLabel || null,
                        },
                    ]);
                }
            }
            const grade = normalizeGradeLabel(
                student?.currentGrade || student?.classes?.[0]?.grade || student?.unit || student?.class || "-",
            );
            const progressUnit = inferProgressUnit(assignment, student);
            const record = {
                id,
                assignmentId,
                slug: student?.slug || slugify(student?.name),
                name: student?.name || "Student",
                grade,
                type: focus,
                tier,
                progress: STATUS_LABELS[statusKey] || "On Track",
                nextUpdate,
                statusKey,
                profile: {
                    teacher: teacherName,
                    mentor: assignment.mentorId?.name || teacherName,
                    type: focus,
                    strategy: assignment.focusAreas?.join(", ") || `Support focus - ${tier}`,
                    started: formatDate(assignment.startDate),
                    duration: formatDuration(assignment.startDate, assignment.endDate),
                    baseline: goals.length ? 0 : null,
                    current: goals.length ? completedGoals : assignment.checkIns?.length || (statusKey === "completed" ? 1 : 0),
                    target: goals.length || Math.max(assignment.checkIns?.length || 1, 1),
                    progressUnit,
                    chart,
                    history,
                },
            };

            const current = map.get(id);
            if (!current || STATUS_PRIORITY[statusKey] > STATUS_PRIORITY[current.statusKey]) {
                map.set(id, record);
            }
        });
    });

    const students = Array.from(map.values()).map((student) => {
        const options = assignmentOptionsMap.get(student.id) || [];
        const sortedOptions = [...options].sort((a, b) => {
            const tierDiff = (TIER_PRIORITY[b.tierCode] || 0) - (TIER_PRIORITY[a.tierCode] || 0);
            if (tierDiff !== 0) return tierDiff;
            return (STATUS_PRIORITY[b.statusKey] || 0) - (STATUS_PRIORITY[a.statusKey] || 0);
        });
        return {
            ...student,
            assignmentOptions: sortedOptions,
        };
    });
    const sorted = students.sort((a, b) => STATUS_PRIORITY[b.statusKey] - STATUS_PRIORITY[a.statusKey]);
    const spotlightChart = sorted[0]?.profile?.chart || [];
    const focusLabel = sorted[0] ? `${sorted[0].tier} ${sorted[0].type}` : null;

    return {
        students: sorted.map(({ statusKey, ...rest }) => rest),
        spotlightChart,
        focusLabel,
    };
};

export const mergeRosterWithAssignments = (rosterStudents = [], assignmentStudents = [], segments = { allowedGrades: [] }) => {
    const assignmentMap = new Map(
        assignmentStudents.map((student) => [student.id?.toString?.() || student.slug || student.name, student]),
    );
    const allowedGrades = segments.allowedGrades || [];
    const allowedClasses = segments.allowedClasses || [];
    const strictClassFilter = segments.strictClassFilter;

    // Helper to check if grade matches (supports partial match)
    const matchesGrade = (grade) => {
        if (!allowedGrades.length) return true;
        const normalized = normalizeGradeLabel(grade);
        return allowedGrades.some((allowed) => {
            const normalizedAllowed = normalizeGradeLabel(allowed);
            return normalized === normalizedAllowed || normalized.startsWith(normalizedAllowed);
        });
    };

    // Helper to check if class matches (supports partial match for "Fireworks" matching "Grade 2 - Fireworks")
    const matchesClass = (className) => {
        if (!strictClassFilter || !allowedClasses.length) return true;
        if (!className) return false;
        const normalized = normalizeClassLabel(className);
        return allowedClasses.some((allowed) => {
            const normalizedAllowed = normalizeClassLabel(allowed);
            // Match exact or as suffix (e.g., "Fireworks" matches "Grade 2 - Fireworks")
            return normalized === normalizedAllowed ||
                   normalized.endsWith(normalizedAllowed) ||
                   normalized.endsWith(`- ${normalizedAllowed}`);
        });
    };

    const merged = rosterStudents
        .map((student) => {
            const id = student.id?.toString?.() || student._id?.toString?.() || student.slug || student.name;
            const gradeLabel = normalizeGradeLabel(student.grade || student.currentGrade || student.className || "-");
            const classLabel = normalizeClassLabel(student.className || student.currentGrade || student.unit);
            if (!matchesGrade(gradeLabel)) return null;
            if (!matchesClass(classLabel)) return null;
            const assignment = assignmentMap.get(id);
            const rosterTierCode = normalizeTierCode(student.tier || student.primaryIntervention?.tier || student.profile?.tier);
            const assignmentTierCode = normalizeTierCode(assignment?.tier);
            const rosterScore = TIER_PRIORITY[rosterTierCode] || 0;
            const assignmentScore = TIER_PRIORITY[assignmentTierCode] || 0;
            const useAssignment = assignment && (!rosterScore || assignmentScore > rosterScore);
            const displaySource = useAssignment ? assignment : student;
            const assignmentOptions = assignment?.assignmentOptions || [];
            return {
                id,
                slug: student.slug || slugify(student.name),
                name: student.name,
                grade: gradeLabel,
                className: classLabel || student.className,
                type: displaySource?.type || student.type || "Universal Supports",
                tier: displaySource?.tier || student.tier || "Tier 1",
                progress: displaySource?.progress || student.progress || "Not Assigned",
                nextUpdate: displaySource?.nextUpdate || student.nextUpdate || "Not scheduled",
                assignmentId: assignment?.assignmentId || null,
                assignmentOptions,
                profile: displaySource?.profile || assignment?.profile || student.profile,
                interventions: student.interventions,
                primaryIntervention: student.primaryIntervention,
            };
        })
        .filter(Boolean);

    if (!merged.length && assignmentStudents.length) return assignmentStudents;
    return merged;
};

export { STATUS_LABELS, STATUS_PRIORITY, isUpdateDue, buildChartSeries, buildHistory };
