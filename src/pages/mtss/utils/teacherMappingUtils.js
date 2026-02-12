/**
 * Assignment to Student mapping utilities
 */

import { normalizeGradeLabel } from "./teacherGradeUtils";
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
import { mergeRosterWithAssignments } from "./teacherRosterMerge";

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
        const goals = Array.isArray(assignment.goals) ? assignment.goals : [];
        const completedGoals = goals.filter((goal) => goal?.completed).length;
        const goalEntry = goals.find((goal) => goal);
        const goalDescription =
            assignment.goal ||
            (typeof assignment.goals === "string" ? assignment.goals : null) ||
            (typeof goalEntry === "string" ? goalEntry : null) ||
            goalEntry?.description ||
            goalEntry?.goal ||
            goalEntry?.title ||
            goalEntry?.name ||
            null;
        const strategyName =
            assignment.strategyName ||
            assignment.strategy?.name ||
            assignment.strategy?.label ||
            assignment.strategy?.title ||
            null;
        const duration = assignment.duration || formatDuration(assignment.startDate, assignment.endDate);
        const monitoringFrequency = assignment.monitoringFrequency || assignment.monitorFrequency || null;
        const monitoringMethod = assignment.monitoringMethod || assignment.monitorMethod || null;
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
                            strategyName,
                            duration,
                            monitoringFrequency,
                            monitoringMethod,
                            goal: goalDescription,
                            baselineScore: assignment.baselineScore || null,
                            targetScore: assignment.targetScore || null,
                            notes: assignment.notes || null,
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

export { mergeRosterWithAssignments, STATUS_LABELS, STATUS_PRIORITY, isUpdateDue, buildChartSeries, buildHistory };
