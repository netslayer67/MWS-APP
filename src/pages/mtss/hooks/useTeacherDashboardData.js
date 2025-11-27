import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchMentorAssignments } from "@/services/mtssService";
import { buildStatCards, getStoredUser, mapAssignmentsToStudents } from "../utils/teacherDashboardUtils";

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
    };
};

const useTeacherDashboardData = () => {
    const storedUser = useMemo(() => getStoredUser(), []);
    const baseHero = useMemo(() => normalizeHeroBadge(storedUser), [storedUser]);

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
            const { assignments = [] } = await fetchMentorAssignments({}, signal ? { signal } : {});
            const cards = buildStatCards(assignments);
            const { students: mappedStudents, spotlightChart, focusLabel } = mapAssignmentsToStudents(
                assignments,
                baseHero.teacher,
            );

            setStatCards(cards);
            setStudents(mappedStudents);
            setProgressData(spotlightChart);
            setHeroBadge((prev) => ({
                ...prev,
                ...baseHero,
                tierFocus: focusLabel || prev.tierFocus || "Tiered Supports",
            }));
        } catch (err) {
            if (err?.name !== "CanceledError" && err?.name !== "AbortError") {
                setError(err?.response?.data?.message || err?.message || "Failed to load MTSS data");
            }
        } finally {
            setLoading(false);
        }
    }, [baseHero]);

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
