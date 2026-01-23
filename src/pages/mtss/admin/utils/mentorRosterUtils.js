import { KEYWORDS } from "../config/mentorPanelConfig";

export const makeMentorKey = (mentor = {}) =>
    (mentor._id || mentor.id || mentor.email || mentor.name || "").toString().toLowerCase();

const isTeacherProfile = (mentor) => {
    const jobPosition = (mentor.jobPosition || "").toLowerCase();
    const role = (mentor.role || "").toLowerCase();
    const classRole = Array.isArray(mentor.classes)
        ? mentor.classes.some((cls) => (cls.role || "").toLowerCase().includes("teacher"))
        : false;
    return KEYWORDS.some((keyword) => jobPosition.includes(keyword)) || classRole || role.includes("teacher");
};

export const buildMentorRoster = (mentorRoster = [], mentorDirectory = []) => {
    const teacherMentors = mentorDirectory.filter(isTeacherProfile);

    const statsMap = new Map(
        mentorRoster.map((mentor) => [
            makeMentorKey(mentor),
            {
                activeStudents: mentor.activeStudents || mentor.students || 0,
                successRate: mentor.successRate || "0%",
            },
        ]),
    );

    const rosterMap = new Map();

    teacherMentors.forEach((mentor) => {
        const key = makeMentorKey(mentor);
        const stats = statsMap.get(key) || { activeStudents: 0, successRate: "0%" };
        rosterMap.set(key, {
            _id: mentor._id || mentor.id || null,
            name: mentor.name,
            role: mentor.jobPosition || mentor.role || "Teacher",
            activeStudents: stats.activeStudents,
            successRate: stats.successRate,
        });
    });

    mentorRoster.forEach((mentor) => {
        const key = makeMentorKey(mentor);
        const existing = rosterMap.get(key);
        rosterMap.set(key, {
            _id: mentor._id || mentor.id || rosterMap.get(key)?._id || null,
            name: mentor.name,
            role: mentor.role || existing?.role || "Teacher",
            activeStudents: mentor.activeStudents || mentor.students || existing?.activeStudents || 0,
            successRate: mentor.successRate || existing?.successRate || "0%",
        });
    });

    return Array.from(rosterMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};
