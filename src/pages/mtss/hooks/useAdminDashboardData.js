import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import socketService from "@/services/socketService";
import {
    fetchMentorAssignments,
    fetchMtssStudents,
    fetchMtssMentors,
} from "@/services/mtssService";
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
} from "../utils/adminDashboardUtils";

const STUDENT_LIMIT = 650;

const useAdminDashboardData = () => {
    const { user } = useSelector((state) => state.auth);
    const [students, setStudents] = useState([]);
    const [summary, setSummary] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const mergeStudents = useCallback((incoming = []) => {
        if (!incoming.length) return;
        setStudents((prev) => {
            const map = new Map(prev.map((student) => [student.id || student._id, student]));
            incoming.forEach((student) => {
                const key = student.id || student._id;
                if (!key) return;
                const existing = map.get(key) || {};
                map.set(key, { ...existing, ...student });
            });
            return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
        });
    }, []);

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

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [studentResponse, assignmentResponse, mentorResponse] = await Promise.all([
                fetchMtssStudents({ limit: STUDENT_LIMIT }),
                fetchMentorAssignments(),
                fetchMtssMentors(),
            ]);

            setStudents(studentResponse.students || []);
            setSummary(studentResponse.summary || null);
            setAssignments(assignmentResponse.assignments || []);
            setMentors(mentorResponse.mentors || []);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Failed to load MTSS dashboard data");
        } finally {
            setLoading(false);
        }
    }, []);

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
