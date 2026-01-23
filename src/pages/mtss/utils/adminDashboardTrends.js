export const formatDateLabel = (value) => {
    if (!value) return "-";
    try {
        return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
    } catch {
        return "-";
    }
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
