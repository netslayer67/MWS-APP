import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import socketService from "@/services/socketService";
import {
    fetchMtssStudentById,
    fetchMtssStudents,
    submitKindergartenMoodCheckin,
    submitKindergartenHomeObservation,
} from "@/services/mtssService";
import {
    buildGradeTierLabel,
    filterStudentsForViewer,
    mapStudentCard,
} from "../student/portal/studentPortalStateUtils";

const ADMIN_ROLES = new Set(["directorate", "admin", "superadmin", "head_unit"]);
const MENTOR_ROLES = new Set(["teacher", "staff", "support_staff"]);

export const useStudentPortalState = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentDetails, setStudentDetails] = useState(null);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [error, setError] = useState(null);
    const [students, setStudents] = useState([]);
    const [activeTab, setActiveTab] = useState("progress");
    const [isSubmittingMood, setIsSubmittingMood] = useState(false);
    const [isSubmittingHomeObservation, setIsSubmittingHomeObservation] = useState(false);

    const loadStudents = useCallback(async () => {
        try {
            setIsLoadingList(true);
            setError(null);
            const payload = await fetchMtssStudents({ limit: 500 });
            const rawStudents = Array.isArray(payload?.students) ? payload.students : [];
            const scopedStudents = filterStudentsForViewer(rawStudents, user);
            const mapped = scopedStudents.map((student, index) => mapStudentCard(student, index));
            setStudents(mapped);
            if (!selectedStudent && mapped.length === 1) {
                setSelectedStudent(mapped[0].id);
            }
            if (selectedStudent && !mapped.some((student) => String(student.id) === String(selectedStudent))) {
                setSelectedStudent(mapped[0]?.id || null);
                setActiveTab("progress");
            }
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Failed to load student portal");
            setStudents([]);
        } finally {
            setIsLoadingList(false);
        }
    }, [selectedStudent, user]);

    const loadStudentDetails = useCallback(
        async (studentId) => {
            if (!studentId) {
                setStudentDetails(null);
                return;
            }
            try {
                setIsLoadingDetail(true);
                const payload = await fetchMtssStudentById(studentId);
                setStudentDetails(payload?.student || null);
            } catch (err) {
                setStudentDetails(null);
            } finally {
                setIsLoadingDetail(false);
            }
        },
        [],
    );

    useEffect(() => {
        loadStudents();
    }, [loadStudents]);

    useEffect(() => {
        if (!selectedStudent) return;
        loadStudentDetails(selectedStudent);
    }, [loadStudentDetails, selectedStudent]);

    useEffect(() => {
        const refreshPortal = () => {
            loadStudents();
            if (selectedStudent) {
                loadStudentDetails(selectedStudent);
            }
        };

        const interval = setInterval(refreshPortal, 30000);
        return () => clearInterval(interval);
    }, [loadStudents, loadStudentDetails, selectedStudent]);

    useEffect(() => {
        const userId = user?.id || user?._id;
        const role = user?.role;
        if (!userId || !role) return;

        socketService.connect();
        if (ADMIN_ROLES.has(role)) {
            socketService.joinMtssAdmin();
        } else if (MENTOR_ROLES.has(role)) {
            socketService.joinMtssMentor(userId);
        }

        const handleStudentsChanged = () => {
            loadStudents();
            if (selectedStudent) {
                loadStudentDetails(selectedStudent);
            }
        };
        const handleAssignmentChanged = () => {
            loadStudents();
            if (selectedStudent) {
                loadStudentDetails(selectedStudent);
            }
        };

        socketService.onMtssStudentsChanged(handleStudentsChanged);
        socketService.onMtssAssignment(handleAssignmentChanged);

        return () => {
            socketService.offMtssStudentsChanged(handleStudentsChanged);
            socketService.offMtssAssignment(handleAssignmentChanged);
            if (ADMIN_ROLES.has(role)) {
                socketService.leaveMtssAdmin();
            } else if (MENTOR_ROLES.has(role)) {
                socketService.leaveMtssMentor(userId);
            }
        };
    }, [loadStudents, loadStudentDetails, selectedStudent, user]);

    const currentStudent = useMemo(() => {
        const base = students.find((student) => String(student.id) === String(selectedStudent))
            || students[0]
            || null;
        if (!base) return null;

        const merged = studentDetails
            ? {
                ...base,
                ...studentDetails,
                id: String(base.id),
                accent: base.accent,
                focus: studentDetails.primaryIntervention?.label || studentDetails.type || base.focus,
                mentor: studentDetails.mentor || studentDetails.profile?.mentor || base.mentor,
                gradeTierLabel: buildGradeTierLabel(studentDetails),
            }
            : base;

        return merged;
    }, [selectedStudent, studentDetails, students]);

    const handleBack = useCallback(() => {
        if (selectedStudent) {
            setSelectedStudent(null);
            setStudentDetails(null);
            setActiveTab("progress");
            return;
        }
        navigate("/mtss");
    }, [selectedStudent, navigate]);

    const handleSelectStudent = useCallback((studentId) => {
        setSelectedStudent(studentId);
        setActiveTab("progress");
    }, []);

    const refreshPortal = useCallback(async () => {
        await loadStudents();
        if (selectedStudent) {
            await loadStudentDetails(selectedStudent);
        }
    }, [loadStudentDetails, loadStudents, selectedStudent]);

    const submitMoodCheckin = useCallback(
        async (studentId, payload = {}) => {
            const targetId = studentId || selectedStudent;
            if (!targetId) return null;
            setIsSubmittingMood(true);
            try {
                const result = await submitKindergartenMoodCheckin(targetId, payload);
                if (result?.kindergartenPortal) {
                    setStudentDetails((prev) => (prev ? { ...prev, kindergartenPortal: result.kindergartenPortal } : prev));
                } else {
                    await loadStudentDetails(targetId);
                }
                return result;
            } finally {
                setIsSubmittingMood(false);
            }
        },
        [loadStudentDetails, selectedStudent],
    );

    const submitHomeObservation = useCallback(
        async (studentId, payload = {}) => {
            const targetId = studentId || selectedStudent;
            if (!targetId) return null;
            setIsSubmittingHomeObservation(true);
            try {
                const result = await submitKindergartenHomeObservation(targetId, payload);
                await loadStudentDetails(targetId);
                return result;
            } finally {
                setIsSubmittingHomeObservation(false);
            }
        },
        [loadStudentDetails, selectedStudent],
    );

    return {
        selectedStudent,
        activeTab,
        setActiveTab,
        currentStudent,
        isLoadingList,
        isLoadingDetail,
        error,
        handleBack,
        handleSelectStudent,
        refreshPortal,
        students,
        submitMoodCheckin,
        submitHomeObservation,
        isSubmittingMood,
        isSubmittingHomeObservation,
    };
};
