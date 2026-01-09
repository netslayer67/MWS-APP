import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import socketService from "@/services/socketService";
import {
    fetchMentorAssignments,
    fetchMtssStudents,
    fetchMtssMentors,
} from "@/services/mtssService";
import {
    deriveTeacherSegments,
    normalizeGradeLabel,
    normalizeClassLabel,
    buildGradeQueryValues,
    buildClassQueryValues,
} from "../utils/teacherDashboardUtils";
import {
    buildAdminStatCards,
    buildSystemSnapshot,
    buildSuccessByType,
    buildTrendData,
    buildMentorSpotlights,
    buildMentorRoster,
    buildStrategyHighlights,
    buildTierMovement,
    buildRecentActivity,
    calculateSuccessRate,
    buildSummaryFromStudents,
} from "../utils/adminDashboardUtils";

const STUDENT_LIMIT = 650;

const isKindergartenLabel = (value = "") => {
    const normalized = value?.toString().toLowerCase();
    return normalized?.includes("kindergarten") || normalized?.includes("kindy");
};

const isSpecificKindergartenVariant = (value = "") => /\b(pre[-\s]?k|k\s*1|k\s*2)\b/i.test(value || "");

const JUNIOR_HIGH_GRADES = ["Grade 7", "Grade 8", "Grade 9"];

const normalizeUnit = (value = "") => value.toString().trim().toLowerCase();

const isJuniorHighPrincipal = (user = {}) => {
    if (normalizeUnit(user?.unit) !== "junior high") return false;
    const role = (user?.role || "").toLowerCase();
    const jobPosition = (user?.jobPosition || "").toLowerCase();
    const jobLevel = (user?.jobLevel || "").toLowerCase();
    return role === "head_unit" || jobPosition.includes("principal") || jobLevel.includes("head");
};

const useAdminDashboardData = () => {
    const { user } = useSelector((state) => state.auth);
    const [students, setStudents] = useState([]);
    const [summary, setSummary] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

const segments = useMemo(() => deriveTeacherSegments(user), [user]);
const effectiveSegments = useMemo(() => {
    if (isJuniorHighPrincipal(user)) {
        return {
            ...segments,
            allowedGrades: JUNIOR_HIGH_GRADES,
            allowedClasses: [],
        };
    }
    return segments;
}, [segments, user]);
const gradeQueryValues = useMemo(() => buildGradeQueryValues(effectiveSegments), [effectiveSegments]);
const classQueryValues = useMemo(() => buildClassQueryValues(effectiveSegments), [effectiveSegments]);
const hasKindergartenWildcard = useMemo(
    () => (effectiveSegments.allowedGrades || []).some((grade) => isKindergartenLabel(grade) && !isSpecificKindergartenVariant(grade)),
    [effectiveSegments.allowedGrades],
);

const withinSegments = useCallback(
    (student = {}) => {
        const allowedClasses = effectiveSegments.allowedClasses || [];
        if (!effectiveSegments.allowedGrades.length && !allowedClasses.length) return true;
        const gradeLabel = normalizeGradeLabel(
            student.grade || student.currentGrade || student.className || student.unit || student.classes?.[0]?.grade,
        );
        const classLabel = normalizeClassLabel(student.className || student.currentGrade);
        const matchesGrade =
            !effectiveSegments.allowedGrades.length ||
            effectiveSegments.allowedGrades.includes(gradeLabel) ||
            (hasKindergartenWildcard && isKindergartenLabel(gradeLabel));
        const matchesClass = !allowedClasses.length || (classLabel && allowedClasses.includes(classLabel));
        if (matchesGrade && matchesClass) {
            return true;
        }
        return false;
    },
    [effectiveSegments, hasKindergartenWildcard],
);

const transformStudent = useCallback(
    (student = {}) => {
        const gradeLabel = normalizeGradeLabel(
            student.grade || student.currentGrade || student.className || student.unit || student.classes?.[0]?.grade,
        );
        const classLabel = normalizeClassLabel(student.className || student.currentGrade || student.unit || student.classes?.[0]?.grade);
        return {
            ...student,
            grade: gradeLabel || student.grade,
            className: classLabel || student.className || student.currentGrade || student.unit || student.classes?.[0]?.grade,
        };
    },
    [],
);

const mergeStudents = useCallback(
    (incoming = []) => {
        if (!incoming.length) return;
        setStudents((prev) => {
            const map = new Map(prev.map((student) => [student.id || student._id, student]));
            incoming.forEach((student) => {
                if (!withinSegments(student)) return;
                const key = student.id || student._id;
                if (!key) return;
                const existing = map.get(key) || {};
                map.set(key, { ...existing, ...transformStudent(student) });
            });
            return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
        });
    },
    [transformStudent, withinSegments],
);

const mergeAssignment = useCallback((action, assignment) => {
    if (!assignment?._id) return;
    setAssignments((prev) => {
        const index = prev.findIndex((item) => item._id === assignment._id);
        if (action === "deleted") {
            if (index === -1) return prev;
            const clone = [...prev];
            clone.splice(index, 1);
            return clone;
        }
        if (index === -1) {
            return [...prev, assignment];
        }
        const clone = [...prev];
        clone[index] = assignment;
        return clone;
    });
}, []);

const mentorMatchesSegments = useCallback(
    (mentor = {}) => {
        if (!effectiveSegments.allowedGrades.length && !effectiveSegments.unit) {
            return true;
        }
        const mentorSegments = deriveTeacherSegments(mentor);
        if (effectiveSegments.allowedGrades.length && mentorSegments.allowedGrades?.length) {
            if (mentorSegments.allowedGrades.some((grade) => effectiveSegments.allowedGrades.includes(grade))) {
                return true;
            }
        }
        if (effectiveSegments.unit && mentor.unit) {
            return mentor.unit.toLowerCase() === effectiveSegments.unit.toLowerCase();
        }
        return !effectiveSegments.allowedGrades.length;
    },
    [effectiveSegments],
);

const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const mentorParams = {};
            if (effectiveSegments.unit) {
                mentorParams.unit = effectiveSegments.unit;
            }

            const studentParams = { limit: STUDENT_LIMIT };
        if (effectiveSegments.unit) {
            studentParams.unit = effectiveSegments.unit;
        }
        if (gradeQueryValues.length) {
            studentParams.grade = gradeQueryValues.join(",");
        }
        if (classQueryValues.length) {
            studentParams.className = classQueryValues.join(",");
        }

            const [studentResponse, assignmentResponse, mentorResponse] = await Promise.all([
                fetchMtssStudents(studentParams),
                fetchMentorAssignments(),
                fetchMtssMentors(mentorParams),
            ]);

        const roster = studentResponse.students || [];
        const scopedRoster = effectiveSegments.allowedGrades.length ? roster.filter(withinSegments) : roster;
        const normalizedRoster = scopedRoster.map(transformStudent);
        const studentIdSet = new Set(
            normalizedRoster
                .map((student) => student.id?.toString?.() || student._id?.toString?.())
                .filter(Boolean),
        );

        const scopedAssignments = (assignmentResponse.assignments || []).filter((assignment) => {
            if (!studentIdSet.size) return true;
            return (assignment.studentIds || []).some((student) => {
                const key = student?._id?.toString?.() || student?.id?.toString?.();
                return key ? studentIdSet.has(key) : false;
            });
        });

        const allMentors = mentorResponse.mentors || [];
        const scopedMentors = allMentors.filter(mentorMatchesSegments);

        setStudents(normalizedRoster);
        setSummary(buildSummaryFromStudents(normalizedRoster));
        setAssignments(scopedAssignments);
        setMentors(scopedMentors);
    } catch (err) {
        setError(err?.response?.data?.message || err.message || "Failed to load MTSS dashboard data");
    } finally {
        setLoading(false);
    }
}, [classQueryValues, effectiveSegments.allowedGrades.length, effectiveSegments.unit, gradeQueryValues, mentorMatchesSegments, transformStudent, withinSegments]);

useEffect(() => {
    loadDashboard();
}, [loadDashboard]);

useEffect(() => {
    if (!user?.id && !user?._id) return;

    socketService.connect();
    socketService.joinMtssAdmin();

    const handleStudentsChanged = (payload) => {
        mergeStudents(payload?.students || []);
    };

    const handleAssignmentsChanged = ({ action, assignment }) => {
        mergeAssignment(action || "updated", assignment);
    };

    socketService.onMtssStudentsChanged(handleStudentsChanged);
    socketService.onMtssAssignment(handleAssignmentsChanged);

    return () => {
        socketService.offMtssStudentsChanged(handleStudentsChanged);
        socketService.offMtssAssignment(handleAssignmentsChanged);
        socketService.leaveMtssAdmin();
    };
}, [user, mergeStudents, mergeAssignment]);

const mentorCount = useMemo(() => {
    if (mentors?.length) return mentors.length;
    const uniqueMentors = new Set(assignments.map((assignment) => assignment.mentorId?._id || assignment.mentorId));
    return uniqueMentors.size;
}, [mentors, assignments]);

const successRate = useMemo(() => calculateSuccessRate(assignments), [assignments]);

const statCards = useMemo(
    () => buildAdminStatCards(students.length, mentorCount, successRate),
    [students.length, mentorCount, successRate],
);

const systemSnapshot = useMemo(() => buildSystemSnapshot(summary, students), [summary, students]);
const successByType = useMemo(() => buildSuccessByType(students), [students]);
const { trendData, trendPaths } = useMemo(() => buildTrendData(assignments), [assignments]);
const mentorSpotlights = useMemo(() => buildMentorSpotlights(assignments), [assignments]);
const mentorRoster = useMemo(() => buildMentorRoster(assignments), [assignments]);
const strategyHighlights = useMemo(() => buildStrategyHighlights(assignments), [assignments]);
const tierMovement = useMemo(() => buildTierMovement(students), [students]);
const recentActivity = useMemo(() => buildRecentActivity(assignments), [assignments]);

return {
    students,
    assignments,
    mentors,
    statCards,
    systemSnapshot,
    successByType,
    trendData,
    trendPaths,
    mentorSpotlights,
    mentorRoster,
    strategyHighlights,
    tierMovement,
    recentActivity,
    loading,
    error,
    refresh: loadDashboard,
};

};

export default useAdminDashboardData;
