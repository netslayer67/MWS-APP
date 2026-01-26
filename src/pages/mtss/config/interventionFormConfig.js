/**
 * Intervention Form Configuration Constants
 */

export const INTERVENTION_TYPES = [
    { label: "English", value: "english" },
    { label: "Math", value: "math" },
    { label: "Behavior", value: "behavior" },
    { label: "SEL", value: "sel" },
    { label: "Attendance", value: "attendance" },
    { label: "Universal Supports", value: "universal" },
];

export const STRATEGY_TYPE_ALIASES = {
    english: ["english", "ela", "literacy", "reading", "ela/reading", "ela & reading", "sight words"],
    math: ["math", "mathematics", "numeracy", "stem"],
    behavior: ["behavior", "behaviour", "conduct", "regulation", "sel"],
    sel: ["sel", "social emotional", "social-emotional", "behavior", "wellness"],
    attendance: ["attendance", "present", "absent", "absences", "engagement"],
    universal: ["universal", "schoolwide", "all", "tier 1"],
};

export const TIERS = [
    { label: "Tier 1", value: "tier1" },
    { label: "Tier 2", value: "tier2" },
    { label: "Tier 3", value: "tier3" },
];

export const DURATIONS = ["4 weeks", "6 weeks", "8 weeks"];

export const FREQUENCIES = ["Daily", "Weekly", "Bi-weekly"];

export const METHODS = [
    "Option 1 - Direct Observation",
    "Option 2 - Student Self-Report",
    "Option 3 - Assessment Data",
];

export const SCORE_UNITS = ["wpm", "%", "pts", "score"];

export const filterStrategiesByType = (strategies, type) => {
    if (!type) return strategies;
    const typeKey = type.toLowerCase();
    const aliasList = STRATEGY_TYPE_ALIASES[typeKey] || [typeKey];
    const aliasSet = new Set(aliasList.map((token) => token.toLowerCase()));

    const matchesAlias = (value = "") => {
        const normalized = value.toString().toLowerCase();
        if (!normalized) return false;
        return Array.from(aliasSet).some((alias) => normalized === alias || normalized.includes(alias));
    };

    return strategies.filter((strategy) => {
        const bestForMatches = Array.isArray(strategy.bestFor)
            ? strategy.bestFor.some((area) => matchesAlias(area))
            : false;
        const tagMatches = Array.isArray(strategy.tags)
            ? strategy.tags.some((tag) => matchesAlias(tag))
            : false;
        return bestForMatches || tagMatches;
    });
};

export const validateInterventionForm = (formState) => {
    return Boolean(
        formState.studentId &&
        formState.type &&
        formState.tier &&
        formState.startDate &&
        formState.monitorFrequency &&
        formState.monitorMethod
    );
};
