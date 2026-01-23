import { formatDate } from "./teacherCommonUtils";

export const buildChartSeries = (assignment = {}) => {
    const checkIns = assignment.checkIns || [];
    if (checkIns.length) {
        const total = checkIns.length;
        return checkIns.map((entry, index) => {
            const value = Math.round(((index + 1) / total) * 100);
            const label = formatDate(entry.date);
            return { label, date: label, reading: value, goal: 100, value };
        });
    }
    const goals = assignment.goals || [];
    if (goals.length) {
        const total = goals.length;
        let completed = 0;
        return goals.map((goal, index) => {
            if (goal.completed) completed += 1;
            const value = Math.round((completed / total) * 100);
            const label = goal.description || `Goal ${index + 1}`;
            return { label, date: label, reading: value, goal: 100, value };
        });
    }
    const value = assignment.status === "completed" ? 100 : 0;
    const label = formatDate(assignment.startDate);
    return [{ label, date: label, reading: value, goal: 100, value }];
};

export const buildHistory = (assignment = {}) =>
    (assignment.checkIns || [])
        .slice(-6)
        .reverse()
        .map((entry) => ({
            date: formatDate(entry.date, { month: "short", day: "numeric", year: "numeric" }),
            score: "-",
            notes: entry.summary || entry.nextSteps || "Check-in recorded",
        }));
