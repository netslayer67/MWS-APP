import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchMentorAssignments, fetchMtssStudents } from "@/services/mtssService";
import {
    buildStatCards,
    deriveTeacherSegments,
    getStoredUser,
    mapAssignmentsToStudents,
    mergeRosterWithAssignments,
} from "../utils/teacherDashboardUtils";

const SALUTATION_MAP = {
    male: "Mr.",
    female: "Ms.",
};

const getSalutation = (gender) => SALUTATION_MAP[gender?.toLowerCase?.()] || "";

const buildGreeting = (name) => {
    const templates = [
        "Hey %NAME%, let's light up today's boosts.",
        "Morning %NAME%, ready to spark joyful wins?",
        "%NAME%, today's plan is set—let's uplift every student.",
        "Cheers %NAME%, another day to glow-up kids' progress.",
        "Let's dive in %NAME%, the boost studio is humming.",
    ];
    const today = new Date();
    const index = (today.getDate() + today.getMonth()) % templates.length;
    return templates[index].replace("%NAME%", name);
};

const normalizeHeroBadge = (user) => {
    const baseName = user?.username || user?.name || "MTSS Mentor";
    const salutation = getSalutation(user?.gender);
    const nameWithTitle = salutation ? `${salutation} ${baseName}` : baseName;
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

    const loadDashboard = useCallback(async (signal) => {
        setLoading(true);
        setError(null);
        try {
            const studentParams = segments.allowedGrades.length
                ? { grade: segments.allowedGrades.join(","), limit: 100 }
                : { limit: 100 };

            const [assignmentPayload, rosterPayload] = await Promise.all([
                fetchMentorAssignments({ limit: 150 }, signal ? { signal } : {}),
                fetchMtssStudents(studentParams, signal ? { signal } : {}),
            ]);

            const assignments = assignmentPayload.assignments || assignmentPayload || [];
            const cards = buildStatCards(assignments);
            const primaryName = storedUser?.username || storedUser?.name || baseHero.teacher;
            const primaryGender = storedUser?.gender;
            const assignmentSummary = mapAssignmentsToStudents(assignments, primaryName);
            const rosterStudents = rosterPayload?.students || [];
            const mergedStudents = mergeRosterWithAssignments(rosterStudents, assignmentSummary.students, segments);
            const salutation = getSalutation(primaryGender);
            const teacherWithTitle = salutation ? `${salutation} ${primaryName}` : primaryName;

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
            setLoading(false);
        }
    }, [baseHero, segments]);

    useEffect(() => {
        const controller = new AbortController();
        loadDashboard(controller.signal);
        return () => controller.abort();
    }, [loadDashboard]);

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
