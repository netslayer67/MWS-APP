import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { playfulStudents } from "../data/studentPortalContent";

export const useStudentPortalState = () => {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [activeTab, setActiveTab] = useState("progress");
    const navigate = useNavigate();

    const currentStudent = useMemo(
        () => playfulStudents.find((student) => student.id === selectedStudent) || playfulStudents[0],
        [selectedStudent],
    );

    const handleBack = useCallback(() => {
        if (selectedStudent) {
            setSelectedStudent(null);
            setActiveTab("progress");
            return;
        }
        navigate("/mtss");
    }, [selectedStudent, navigate]);

    const handleSelectStudent = useCallback((studentId) => {
        setSelectedStudent(studentId);
        setActiveTab("progress");
    }, []);

    return {
        selectedStudent,
        activeTab,
        setActiveTab,
        currentStudent,
        handleBack,
        handleSelectStudent,
        students: playfulStudents,
    };
};
