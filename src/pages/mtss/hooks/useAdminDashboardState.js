import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const buildOptions = (students = [], key) => {
    const values = new Set();
    students.forEach((student) => {
        const value = student[key];
        if (value) values.add(value);
    });
    return ["all", ...Array.from(values)];
};

export const useAdminDashboardState = (students = []) => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [activeTab, setActiveTab] = useState("overview");
    const [filters, setFilters] = useState({
        grade: "all",
        tier: "all",
        type: "all",
        mentor: "all",
        query: "",
    });
    const [selectedIds, setSelectedIds] = useState([]);

    const filteredStudents = useMemo(() => {
        const query = filters.query.trim().toLowerCase();
        return students.filter((student) => {
            const matchesGrade = filters.grade === "all" || student.grade === filters.grade;
            const matchesTier = filters.tier === "all" || student.tier === filters.tier;
            const matchesType = filters.type === "all" || student.type === filters.type;
            const mentorLabel = student.mentor || student.profile?.mentor;
            const teacherRoster =
                Array.isArray(student.teachers) && student.teachers.length
                    ? student.teachers
                    : Array.isArray(student.profile?.teacherRoster) && student.profile.teacherRoster.length
                        ? student.profile.teacherRoster
                        : mentorLabel
                            ? [mentorLabel]
                            : [];
            const matchesMentor = filters.mentor === "all" || teacherRoster.includes(filters.mentor);
            const matchesQuery =
                !query ||
                student.name?.toLowerCase().includes(query) ||
                student.type?.toLowerCase().includes(query) ||
                mentorLabel?.toLowerCase().includes(query) ||
                teacherRoster.some((teacher) => teacher.toLowerCase().includes(query));

            return matchesGrade && matchesTier && matchesType && matchesMentor && matchesQuery;
        });
    }, [students, filters]);

    const gradeOptions = useMemo(() => buildOptions(students, "grade"), [students]);
    const tierOptions = useMemo(() => buildOptions(students, "tier"), [students]);
    const typeOptions = useMemo(() => buildOptions(students, "type"), [students]);
    const mentorOptions = useMemo(() => {
        const values = new Set();
        students.forEach((student) => {
            const roster =
                Array.isArray(student.teachers) && student.teachers.length
                    ? student.teachers
                    : Array.isArray(student.profile?.teacherRoster) && student.profile.teacherRoster.length
                        ? student.profile.teacherRoster
                        : [];
            if (roster.length) {
                roster.forEach((teacher) => values.add(teacher));
                return;
            }
            const mentor = student.mentor || student.profile?.mentor;
            if (mentor) {
                values.add(mentor);
            }
        });
        return ["all", ...Array.from(values)];
    }, [students]);

    const handleFilterChange = useCallback((field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    }, []);

    const toggleSelection = useCallback((student) => {
        const id = student.id || student._id;
        if (!id) return;
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    }, []);

    const resetSelection = useCallback(() => setSelectedIds([]), []);

    useEffect(() => {
        setSelectedIds((prev) => prev.filter((id) => students.some((student) => (student.id || student._id) === id)));
    }, [students]);

    const handleViewStudent = useCallback(
        (student) => {
            navigate(`/mtss/student/${student.slug}`);
        },
        [navigate],
    );

    const handleQuickUpdate = useCallback(
        (student) => {
            toast({
                title: "Mentor nudged",
                description: `Flagged ${student.name}'s plan for a system review.`,
            });
        },
        [toast],
    );

    return {
        activeTab,
        setActiveTab,
        filters,
        handleFilterChange,
        filteredStudents,
        gradeOptions,
        tierOptions,
        typeOptions,
        mentorOptions,
        selectedIds,
        toggleSelection,
        resetSelection,
        handleViewStudent,
        handleQuickUpdate,
    };
};
