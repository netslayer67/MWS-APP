import { Building2, UserCheck, Star } from "lucide-react";

const STAT_CARD_TEMPLATE = [
    {
        key: "students",
        label: "Students in MTSS",
        caption: "Across all tiers",
        accent: "from-[#ff80b5] via-[#f472b6] to-[#c084fc]",
        icon: Building2,
    },
    {
        key: "mentors",
        label: "Active Mentors",
        caption: "Teachers & specialists",
        accent: "from-[#fcd34d] via-[#fb923c] to-[#f87171]",
        icon: UserCheck,
    },
    {
        key: "success",
        label: "Success Rate",
        caption: "Meeting intervention goals",
        accent: "from-[#6ee7b7] via-[#34d399] to-[#10b981]",
        icon: Star,
    },
];

export const buildAdminStatCards = (studentCount = 0, mentorCount = 0, successRate = 0) =>
    STAT_CARD_TEMPLATE.map((card) => {
        if (card.key === "students") {
            return { ...card, value: studentCount };
        }
        if (card.key === "mentors") {
            return { ...card, value: mentorCount };
        }
        return { ...card, value: `${successRate}%` };
    });

export const calculateSuccessRate = (assignments = []) => {
    if (!assignments.length) return 0;
    const completed = assignments.filter((assignment) => assignment.status === "completed").length;
    return Math.round((completed / assignments.length) * 100);
};
