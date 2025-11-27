import { ClipboardCheck, ShieldCheck, Star } from "lucide-react";

export const STAT_TEMPLATE = [
    { key: "active", label: "Active Interventions", sub: "Kids in a boost bubble", icon: ShieldCheck, accent: "from-[#0ea5e9]/90 via-[#818cf8]/85 to-[#34d399]/80" },
    { key: "due", label: "Updates Due", sub: "Check-ins waiting today", icon: ClipboardCheck, accent: "from-[#fcd34d]/90 via-[#fb923c]/85 to-[#38bdf8]/80" },
    { key: "success", label: "Success Rate", sub: "Kids hitting targets", icon: Star, accent: "from-[#22d3ee]/90 via-[#a855f7]/85 to-[#f472b6]/80" },
];

export const STATUS_LABELS = {
    active: "On Track",
    paused: "Needs Attention",
    completed: "Completed",
    closed: "Closed",
};

export const STATUS_PRIORITY = { active: 4, paused: 3, completed: 2, closed: 1 };

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

const formatDuration = (start, end) => {
    if (!start) return "Ongoing";
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diffWeeks = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 7)));
    return `${diffWeeks} wk${diffWeeks > 1 ? "s" : ""}`;
};

const mapTierLabel = (tier) => {
    if (!tier) return "Tier 2";
    const code = tier.toString().toLowerCase();
    if (code.includes("3")) return "Tier 3";
    if (code.includes("1")) return "Tier 1";
    return "Tier 2";
};

const deriveFocus = (assignment) => {
    if (assignment?.focusAreas?.length) return assignment.focusAreas[0];
    if (assignment?.tier === "tier3") return "Intensive Support";
    return "Literacy & SEL";
};

const inferProgressUnit = (assignment, student) => {
    const pool = [
        assignment?.metricLabel,
        assignment?.notes,
        assignment?.focusAreas?.join(" "),
        student?.type,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    if (/attendance|present|absen/.test(pool)) return "%";
    if (/reading|fluency|literacy|wpm/.test(pool)) return "wpm";
    if (/math|numeracy|accuracy|score/.test(pool)) return "score";
    if (/behavior|sel|conduct|check-in|checkin/.test(pool)) return "pts";
    return "score";
};

const isUpdateDue = (assignment) => {
    if (assignment?.status !== "active") return false;
    const lastCheckIn = assignment?.checkIns?.slice(-1)[0]?.date;
    if (!lastCheckIn) return true;
    const diffDays = (Date.now() - new Date(lastCheckIn).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 7;
};

const buildChartSeries = (assignment = {}) => {
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

const buildHistory = (assignment = {}) =>
    (assignment.checkIns || []).slice(-6).reverse().map((entry) => ({
        date: formatDate(entry.date, { month: "short", day: "numeric", year: "numeric" }),
        score: "—",
        notes: entry.summary || entry.nextSteps || "Check-in recorded",
    }));

const inferNextUpdate = (assignment) => {
    const sourceDate = assignment?.checkIns?.slice(-1)[0]?.date || assignment?.startDate;
    if (!sourceDate) return "Awaiting update";
    const date = new Date(sourceDate);
    date.setDate(date.getDate() + 7);
    return formatDate(date);
};

export const buildStatCards = (assignments = []) => {
    const active = assignments.filter((assignment) => assignment.status === "active").length;
    const due = assignments.filter(isUpdateDue).length;
    const totalGoals = assignments.reduce((sum, assignment) => sum + (assignment.goals?.length || 0), 0);
    const completedGoals = assignments.reduce(
        (sum, assignment) => sum + (assignment.goals?.filter((goal) => goal.completed).length || 0),
        0,
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

export const mapAssignmentsToStudents = (assignments = [], teacherName = "MTSS Mentor") => {
    const map = new Map();
    assignments.forEach((assignment) => {
        const focus = deriveFocus(assignment);
        const tier = mapTierLabel(assignment.tier);
        const statusKey = assignment.status || "active";
        const nextUpdate = inferNextUpdate(assignment);
        const chart = buildChartSeries(assignment);
        const history = buildHistory(assignment);
        const goals = assignment.goals || [];
        const completedGoals = goals.filter((goal) => goal.completed).length;

        (assignment.studentIds || []).forEach((student) => {
            const id = student?._id?.toString?.() || student?.id || student;
            if (!id) return;
            const grade = student?.classes?.[0]?.grade || student?.unit || student?.class || "-";
            const progressUnit = inferProgressUnit(assignment, student);
            const record = {
                id,
                slug: student?.slug || slugify(student?.name),
                name: student?.name || "Student",
                grade,
                type: focus,
                tier,
                progress: STATUS_LABELS[statusKey] || "On Track",
                nextUpdate,
                statusKey,
                profile: {
                    teacher: teacherName,
                    mentor: assignment.mentorId?.name || teacherName,
                    type: focus,
                    strategy: assignment.focusAreas?.join(", ") || `Support focus - ${tier}`,
                    started: formatDate(assignment.startDate),
                    duration: formatDuration(assignment.startDate, assignment.endDate),
                    baseline: goals.length ? 0 : null,
                    current: goals.length ? completedGoals : assignment.checkIns?.length || (statusKey === "completed" ? 1 : 0),
                    target: goals.length || Math.max(assignment.checkIns?.length || 1, 1),
                    progressUnit,
                    chart,
                    history,
                },
            };

            const current = map.get(id);
            if (!current || STATUS_PRIORITY[statusKey] > STATUS_PRIORITY[current.statusKey]) {
                map.set(id, record);
            }
        });
    });

    const students = Array.from(map.values());
    const sorted = students.sort((a, b) => STATUS_PRIORITY[b.statusKey] - STATUS_PRIORITY[a.statusKey]);
    const spotlightChart = sorted[0]?.profile?.chart || [];
    const focusLabel = sorted[0] ? `${sorted[0].tier} ${sorted[0].type}` : null;

    return {
        students: sorted.map(({ statusKey, ...rest }) => rest),
        spotlightChart,
        focusLabel,
    };
};

export const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem("auth_user") || "null");
    } catch {
        return null;
    }
};
