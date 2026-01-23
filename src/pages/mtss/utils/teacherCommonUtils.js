/**
 * Common utility functions for teacher dashboard
 */

import { ClipboardCheck, ShieldCheck, Star } from "lucide-react";

export const STAT_TEMPLATE = [
    { key: "active", label: "Active Interventions", sub: "Kids in a boost bubble", icon: ShieldCheck, accent: "from-[#0ea5e9]/90 via-[#818cf8]/85 to-[#34d399]/80" },
    { key: "due", label: "Updates Due", sub: "Check-ins waiting today", icon: ClipboardCheck, accent: "from-[#fcd34d]/90 via-[#fb923c]/85 to-[#38bdf8]/80" },
    { key: "success", label: "Success Rate", sub: "Kids hitting targets", icon: Star, accent: "from-[#22d3ee]/90 via-[#a855f7]/85 to-[#f472b6]/80" },
];

export const formatDate = (value, options = { month: "short", day: "numeric" }) => {
    if (!value) return "—";
    try {
        return new Intl.DateTimeFormat("en-US", options).format(new Date(value));
    } catch {
        return "—";
    }
};

export const slugify = (value) =>
    value
        ? value
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)+/g, "")
        : `student-${Math.random().toString(36).slice(2, 6)}`;

export const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem("auth_user") || "null");
    } catch {
        return null;
    }
};

const isUpdateDue = (assignment) => {
    if (assignment?.status !== "active") return false;
    const lastCheckIn = assignment?.checkIns?.slice(-1)[0]?.date;
    if (!lastCheckIn) return true;
    const diffDays = (Date.now() - new Date(lastCheckIn).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 7;
};

export const buildStatCards = (assignments = []) => {
    const active = assignments.filter((assignment) => assignment.status === "active").length;
    const due = assignments.filter(isUpdateDue).length;
    const totalGoals = assignments.reduce((sum, assignment) => sum + (assignment.goals?.length || 0), 0);
    const completedGoals = assignments.reduce(
        (sum, assignment) => sum + (assignment.goals?.filter((goal) => goal.completed).length || 0),
        0
    );
    const successBase = totalGoals || assignments.length || 1;
    const successfulAssignments = assignments.filter((item) => item.status === "completed").length;
    const successRate = Math.round(((completedGoals || successfulAssignments) / successBase) * 100);

    return [
        { ...STAT_TEMPLATE[0], value: active },
        { ...STAT_TEMPLATE[1], value: due },
        { ...STAT_TEMPLATE[2], value: `${Number.isFinite(successRate) ? successRate : 0}%` },
    ];
};
