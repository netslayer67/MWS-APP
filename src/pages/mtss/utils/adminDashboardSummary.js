import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

const TIER_PRIORITY = { "Tier 1": 1, "Tier 2": 2, "Tier 3": 3 };

export const buildSystemSnapshot = (summary, students = []) => {
    const fallbackTotal = students.length;
    return {
        totalStudents: summary?.total || fallbackTotal,
        tierBreakdown: summary?.tierBreakdown?.length
            ? summary.tierBreakdown
            : [{ label: "Tier 1", count: fallbackTotal, description: `${fallbackTotal} students` }],
        interventions: summary?.interventions?.length
            ? summary.interventions.slice(0, 5)
            : [{ label: "Universal Supports", count: fallbackTotal }],
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
