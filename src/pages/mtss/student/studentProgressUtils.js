const toSafeNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const formatScore = (value, unit = "") => {
    if (value === null || value === undefined || value === "") return "-";
    return `${value}${unit ? ` ${unit}` : ""}`;
};

const toProgressPercent = (current, target) => {
    const currentValue = toSafeNumber(current);
    const targetValue = toSafeNumber(target);
    if (currentValue === null || targetValue === null || targetValue <= 0) return null;
    return Math.max(0, Math.min(100, Math.round((currentValue / targetValue) * 100)));
};

const buildFallbackChart = (current, target) => {
    const currentValue = toSafeNumber(current) ?? 0;
    const targetValue = toSafeNumber(target) ?? Math.max(currentValue, 100);
    return [
        { label: "Start", value: 0 },
        { label: "Current", value: currentValue },
        { label: "Target", value: targetValue },
    ];
};

const resolveTone = (progressPercent) => {
    if (progressPercent === null) {
        return {
            badge: "from-slate-500 to-slate-600",
            hero: "from-violet-500 via-fuchsia-500 to-indigo-500",
            line: ["#8b5cf6", "#ec4899"],
            helper: "Building your baseline",
        };
    }
    if (progressPercent >= 75) {
        return {
            badge: "from-emerald-500 to-teal-500",
            hero: "from-emerald-500 via-cyan-500 to-sky-500",
            line: ["#10b981", "#0ea5e9"],
            helper: "Great momentum",
        };
    }
    if (progressPercent >= 40) {
        return {
            badge: "from-amber-500 to-orange-500",
            hero: "from-amber-500 via-rose-500 to-fuchsia-500",
            line: ["#f59e0b", "#ec4899"],
            helper: "Steady growth",
        };
    }
    return {
        badge: "from-rose-500 to-pink-500",
        hero: "from-rose-500 via-pink-500 to-violet-500",
        line: ["#fb7185", "#8b5cf6"],
        helper: "Small wins count",
    };
};

export {
    formatScore,
    toProgressPercent,
    buildFallbackChart,
    resolveTone,
    toSafeNumber,
};
