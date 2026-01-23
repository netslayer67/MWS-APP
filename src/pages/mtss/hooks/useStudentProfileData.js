import { useEffect, useMemo, useState } from "react";
import { fetchMentorAssignments, fetchMtssStudentById } from "@/services/mtssService";
import { getStoredUser, mapAssignmentsToStudents } from "../utils/teacherDashboardUtils";

const useStudentProfileData = (slug) => {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedIntervention, setSelectedIntervention] = useState(null);

    const mentor = useMemo(() => getStoredUser(), []);

    useEffect(() => {
        let mounted = true;
        const controller = new AbortController();

        const loadStudent = async () => {
            setLoading(true);
            setError(null);
            try {
                const payload = await fetchMtssStudentById(slug, { signal: controller.signal });
                if (!mounted) return;
                setStudent(payload?.student || null);

                const details = payload?.student?.interventionDetails || [];
                if (details.length > 0) {
                    setSelectedIntervention(details[0]);
                }
            } catch (err) {
                if (!mounted || err?.name === "CanceledError" || err?.name === "AbortError") return;
                try {
                    const { assignments = [] } = await fetchMentorAssignments({}, { signal: controller.signal });
                    if (!mounted) return;
                    const { students: normalized } = mapAssignmentsToStudents(
                        assignments,
                        mentor?.username || mentor?.name || "MTSS Mentor",
                    );
                    const assigned = normalized.find((item) => item.slug === slug);
                    if (assigned) {
                        setStudent(assigned);
                        return;
                    }
                } catch (fallbackError) {
                    if (!mounted) return;
                }
                setError(err.response?.data?.message || err.message || "Unable to load student profile");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadStudent();
        return () => {
            mounted = false;
            controller.abort();
        };
    }, [slug, mentor]);

    return {
        student,
        loading,
        error,
        selectedIntervention,
        setSelectedIntervention,
    };
};

export default useStudentProfileData;
