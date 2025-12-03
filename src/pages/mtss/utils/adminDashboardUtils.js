import { ArrowDownRight, ArrowUpRight, Minus, Building2, UserCheck, Star } from "lucide-react";

const TIER_PRIORITY = { "Tier 1": 1, "Tier 2": 2, "Tier 3": 3 };

const formatDateLabel = (value) => {
    if (!value) return "-";
    try {
        return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
    } catch {
        return "-";
    }
};

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

export const buildSystemSnapshot = (summary, students = []) => {
    const fallbackTotal = students.length;
    return {
        totalStudents: summary?.total || fallbackTotal,
        tierBreakdown: summary?.tierBreakdown?.length ? summary.tierBreakdown : [
            { label: "Tier 1", count: fallbackTotal, description: `${fallbackTotal} students` },
        ],
        interventions: summary?.interventions?.length ? summary.interventions.slice(0, 5) : [
            { label: "Universal Supports", count: fallbackTotal },
        ],
    };
};

export const buildSummaryFromStudents = (students = []) => {
    const tierCounts = {};
    const interventionCounts = {};

    students.forEach((student) => {
        const tier = student.tier || student.profile?.tier || "Tier 1";
        tierCounts[tier] = (tierCounts[tier] || 0) + 1;

        const type = student.type || student.profile?.type;
        if (type) {
            interventionCounts[type] = (interventionCounts[type] || 0) + 1;
        }
    });

    const tierBreakdown = Object.entries(tierCounts)
        .map(([label, count]) => ({
            label,
            count,
            description: `${count} students`,
        }))
        .sort((a, b) => (TIER_PRIORITY[a.label] || 99) - (TIER_PRIORITY[b.label] || 99));

    const interventions = Object.entries(interventionCounts)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);

    return {
        total: students.length,
        tierBreakdown,
        interventions,
    };
};

export const buildSuccessByType = (students = []) => {
    const statusScores = {};
    students.forEach((student) => {
        const key = student.type || "Universal Supports";
        const existing = statusScores[key] || { total: 0, success: 0 };
        existing.total += 1;
        if (["On Track", "Completed"].includes(student.progress)) {
            existing.success += 1;
        }
        statusScores[key] = existing;
    });

    const gradients = [
        "from-[#a78bfa] to-[#6366f1]",
        "from-[#f472b6] to-[#fb7185]",
        "from-[#34d399] to-[#10b981]",
        "from-[#22d3ee] to-[#3b82f6]",
        "from-[#fcd34d] to-[#f97316]",
    ];

    return Object.entries(statusScores)
        .map(([label, value], index) => ({
            label,
            value: value.total ? Math.round((value.success / value.total) * 100) : 0,
            gradient: gradients[index % gradients.length],
        }))
        .sort((a, b) => b.value - a.value);
};

const getWeekKey = (date) => {
    const current = new Date(date);
    const firstDayOfYear = new Date(current.getFullYear(), 0, 1);
    const pastDays = Math.floor((current - firstDayOfYear) / 86400000);
    const weekNumber = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
    return `${current.getFullYear()}-${weekNumber}`;
};

const buildTrendPaths = (trendData = []) => {
    if (!trendData.length) {
        return { met: "", support: "" };
    }
    const width = 600;
    const height = 200;
    const maxIndex = Math.max(trendData.length - 1, 1);

    const createPath = (key) =>
        trendData
            .map((point, index) => {
                const x = (index / maxIndex) * width;
                const y = height - ((point[key] || 0) / 100) * height;
                return `${index === 0 ? "M" : "L"}${x},${y}`;
            })
            .join(" ");

    return {
        met: createPath("met"),
        support: createPath("support"),
    };
};

export const buildTrendData = (assignments = []) => {
    const buckets = new Map();
    assignments.forEach((assignment) => {
        const rawDate = assignment.updatedAt || assignment.startDate || assignment.createdAt;
        if (!rawDate) return;
        const date = new Date(rawDate);
        const key = getWeekKey(date);
        if (!buckets.has(key)) {
            buckets.set(key, { total: 0, success: 0, date });
        }
        const bucket = buckets.get(key);
        bucket.total += 1;
        if (["active", "completed"].includes(assignment.status)) {
            bucket.success += 1;
        }
    });

    const sorted = Array.from(buckets.values())
        .sort((a, b) => a.date - b.date)
        .slice(-6);

    const trendData = sorted.map((bucket) => {
        const met = bucket.total ? Math.round((bucket.success / bucket.total) * 100) : 0;
        return {
            label: formatDateLabel(bucket.date),
            met,
            support: Math.max(0, 100 - met),
        };
    });

    return {
        trendData,
        trendPaths: buildTrendPaths(trendData),
    };
};

export const buildMentorSpotlights = (assignments = []) => {
    const map = new Map();
    assignments.forEach((assignment) => {
        const mentorName = assignment.mentorId?.name || "Unassigned Mentor";
        if (!map.has(mentorName)) {
            map.set(mentorName, {
                name: mentorName,
                focusAreas: new Set(),
                caseload: 0,
                success: 0,
                total: 0,
            });
        }
        const entry = map.get(mentorName);
        entry.total += 1;
        entry.caseload += assignment.studentIds?.length || 0;
        if (assignment.focusAreas?.length) {
            assignment.focusAreas.forEach((area) => entry.focusAreas.add(area));
        }
        if (["completed", "active"].includes(assignment.status)) {
            entry.success += 1;
        }
    });

    return Array.from(map.values())
        .map((entry) => ({
            name: entry.name,
            caseload: entry.caseload,
            focus: entry.focusAreas.size ? Array.from(entry.focusAreas).slice(0, 2).join(", ") : "Tiered Supports",
            trend: entry.total ? `${Math.round((entry.success / entry.total) * 100)}% success` : "New mentor",
        }))
        .sort((a, b) => b.caseload - a.caseload)
        .slice(0, 3);
};

export const buildMentorRoster = (assignments = []) => {
    const map = new Map();
    assignments.forEach((assignment) => {
        const mentorId = assignment.mentorId?._id?.toString?.() || null;
        const mentorEmail = assignment.mentorId?.email || null;
        const mentorKey = mentorId || mentorEmail || assignment.mentorId?.name || "unassigned";
        if (!map.has(mentorKey)) {
            map.set(mentorKey, {
                id: mentorId,
                email: mentorEmail,
                name: assignment.mentorId?.name || "Unassigned",
                role: assignment.mentorId?.jobPosition || assignment.mentorId?.role || "Mentor",
                students: 0,
                total: 0,
                completed: 0,
            });
        }
        const entry = map.get(mentorKey);
        entry.students += assignment.studentIds?.length || 0;
        entry.total += 1;
        if (assignment.status === "completed") {
            entry.completed += 1;
        }
    });

    return Array.from(map.values())
        .map((entry) => ({
            _id: entry.id,
            email: entry.email,
            name: entry.name,
            role: entry.role,
            activeStudents: entry.students,
            successRate: entry.total ? `${Math.round((entry.completed / entry.total) * 100)}%` : "0%",
        }))
        .sort((a, b) => b.activeStudents - a.activeStudents);
};

export const buildStrategyHighlights = (assignments = []) => {
    const counts = {};
    assignments.forEach((assignment) => {
        (assignment.focusAreas || []).forEach((area) => {
            counts[area] = (counts[area] || 0) + 1;
        });
    });

    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([label, count]) => ({
            label,
            value: `${count} active`,
        }));
};

export const buildTierMovement = (students = []) => {
    const improved = students.filter((student) => ["On Track", "Completed"].includes(student.progress)).length;
    const needsSupport = students.filter((student) => student.progress === "Needs Attention").length;
    const stable = Math.max(0, students.length - improved - needsSupport);

    return [
        { label: "Improved", detail: `${improved} students`, accent: "text-emerald-500", icon: ArrowUpRight },
        { label: "Needs Support", detail: `${needsSupport} students`, accent: "text-rose-500", icon: ArrowDownRight },
        { label: "Stable", detail: `${stable} students`, accent: "text-sky-500", icon: Minus },
    ];
};

export const buildRecentActivity = (assignments = []) => {
    const entries = [];
    assignments.forEach((assignment) => {
        const studentName = assignment.studentIds?.[0]?.name || "Student group";
        const mentorName = assignment.mentorId?.name || "Mentor team";
        const checkIn = assignment.checkIns?.slice(-1)[0];
        if (checkIn) {
            entries.push({
                date: checkIn.date,
                student: studentName,
                mentor: mentorName,
                activity: checkIn.summary || "Progress update recorded",
            });
        } else {
            entries.push({
                date: assignment.updatedAt || assignment.startDate || assignment.createdAt,
                student: studentName,
                mentor: mentorName,
                activity: `Status updated to ${assignment.status}`,
            });
        }
    });

    return entries
        .filter((entry) => entry.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6)
        .map((entry) => ({
            ...entry,
            date: formatDateLabel(entry.date),
        }));
};

export const calculateSuccessRate = (assignments = []) => {
    if (!assignments.length) return 0;
    const completed = assignments.filter((assignment) => assignment.status === "completed").length;
    return Math.round((completed / assignments.length) * 100);
};
