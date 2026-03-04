import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchMentorAssignments, fetchMtssStudents } from "@/services/mtssService";
import socketService from "@/services/socketService";
import {
    buildStaffGreeting,
    formatStaffDisplayName,
    resolveStaffGender,
} from "@/utils/staffIdentity";
import {
    buildStatCards,
    buildGradeQueryValues,
    buildClassQueryValues,
    deriveTeacherSegments,
    getStoredUser,
    mapAssignmentsToStudents,
    mergeRosterWithAssignments,
} from "../utils/teacherDashboardUtils";

const ADMIN_ROLES = new Set(["directorate", "admin", "superadmin", "head_unit"]);

const buildGreeting = (name) =>
    buildStaffGreeting(name, {
        morning: [
            "Good morning %NAME%, ready to spark joyful wins?",
            "Morning %NAME%, let's light up today's boosts.",
            "%NAME%, today's plan is set. Let's uplift every student.",
        ],
        afternoon: [
            "Good afternoon %NAME%, ready to keep the momentum strong?",
            "%NAME%, let's keep this afternoon focused and joyful.",
            "Afternoon %NAME%, your boost studio is in full flow.",
        ],
        evening: [
            "Good evening %NAME%, let's close today with strong progress.",
            "Evening %NAME%, time for a calm and focused MTSS wrap-up.",
            "%NAME%, this evening is perfect for one last student win.",
        ],
    });

const normalizeHeroBadge = (user) => {
    const nameWithTitle = formatStaffDisplayName({
        nickname: user?.nickname,
        username: user?.username,
        name: user?.name,
        gender: resolveStaffGender(user),
        fallback: "MTSS Mentor",
    });
    return {
        teacher: nameWithTitle,
        school: user?.jobPosition || user?.unit || "Millennia21 Schools",
        tierFocus: "Personalized supports",
        greeting: buildGreeting(nameWithTitle),
        gradeLabel: user?.unit || "All Grades",
    };
};

const useTeacherDashboardData = () => {
    const storedUser = useMemo(() => getStoredUser(), []);
    const baseHero = useMemo(() => normalizeHeroBadge(storedUser), [storedUser]);

    const segments = useMemo(() => deriveTeacherSegments(storedUser), [storedUser]);
    const [statCards, setStatCards] = useState(() => buildStatCards());
    const [students, setStudents] = useState([]);
    const [progressData, setProgressData] = useState([]);
    const [heroBadge, setHeroBadge] = useState(baseHero);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadDashboard = useCallback(async ({ signal, silent = false } = {}) => {
        if (!silent) {
            setLoading(true);
        }
        setError(null);
        try {
            const gradeQueryValues = buildGradeQueryValues(segments);
            const classQueryValues = buildClassQueryValues(segments);
            const shouldSendGradeParam =
                gradeQueryValues.length && (segments.shouldFilterServer || segments.unit !== "Junior High");

            const studentParams = {
                limit: segments.unit === "Junior High" ? 500 : 200,
            };
            if (shouldSendGradeParam) {
                studentParams.grade = gradeQueryValues.join(",");
            }
            if (classQueryValues.length) {
                studentParams.className = classQueryValues.join(",");
            }

            const [assignmentPayload, rosterPayload] = await Promise.all([
                fetchMentorAssignments({ limit: 150 }, signal ? { signal } : {}),
                fetchMtssStudents(studentParams, signal ? { signal } : {}),
            ]);

            const assignments = assignmentPayload.assignments || assignmentPayload || [];
            const cards = buildStatCards(assignments);
            const primaryGender = resolveStaffGender(storedUser);
            const primaryName = storedUser?.nickname || storedUser?.username || storedUser?.name || baseHero.teacher;
            const assignmentSummary = mapAssignmentsToStudents(assignments, primaryName);
            const rosterStudents = rosterPayload?.students || [];
            const mergedStudents = mergeRosterWithAssignments(rosterStudents, assignmentSummary.students, segments);
            const teacherWithTitle = formatStaffDisplayName({
                name: primaryName,
                gender: primaryGender,
                fallback: baseHero.teacher || "MTSS Mentor",
            });

            setStatCards(cards);
            const finalStudents = mergedStudents.length ? mergedStudents : assignmentSummary.students;
            setStudents(finalStudents);
            setProgressData(
                assignmentSummary.spotlightChart.length
                    ? assignmentSummary.spotlightChart
                    : [{ label: "Start", date: "Start", reading: 0, goal: 100, value: 0 }],
            );
            setHeroBadge((prev) => ({
                ...prev,
                ...baseHero,
                teacher: teacherWithTitle || baseHero.teacher,
                greeting: buildGreeting(teacherWithTitle || baseHero.teacher),
                tierFocus: assignmentSummary.focusLabel || prev.tierFocus || "Tiered Supports",
                gradeLabel: segments.label,
            }));
        } catch (err) {
            if (err?.name !== "CanceledError" && err?.name !== "AbortError") {
                setError(err?.response?.data?.message || err?.message || "Failed to load MTSS data");
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, [baseHero, segments, storedUser]);

    useEffect(() => {
        const controller = new AbortController();
        loadDashboard({ signal: controller.signal });
        return () => controller.abort();
    }, [loadDashboard]);

    useEffect(() => {
        const userId = storedUser?.id || storedUser?._id;
        const role = storedUser?.role;
        if (!userId || !role) return;

        socketService.connect();
        if (ADMIN_ROLES.has(role)) {
            socketService.joinMtssAdmin();
        } else {
            socketService.joinMtssMentor(userId);
        }

        const handleStudentsChanged = () => {
            loadDashboard({ silent: true });
        };
        const handleAssignmentChanged = () => {
            loadDashboard({ silent: true });
        };

        socketService.onMtssStudentsChanged(handleStudentsChanged);
        socketService.onMtssAssignment(handleAssignmentChanged);

        return () => {
            socketService.offMtssStudentsChanged(handleStudentsChanged);
            socketService.offMtssAssignment(handleAssignmentChanged);
            if (ADMIN_ROLES.has(role)) {
                socketService.leaveMtssAdmin();
            } else {
                socketService.leaveMtssMentor(userId);
            }
        };
    }, [loadDashboard, storedUser]);

    return {
        statCards,
        students,
        progressData: progressData.length ? progressData : [{ label: "Start", date: "Start", reading: 0, goal: 100, value: 0 }],
        heroBadge,
        loading,
        error,
        refresh: () => loadDashboard(),
    };
};

export default useTeacherDashboardData;
