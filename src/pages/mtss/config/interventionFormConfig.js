/**
 * Intervention Form Configuration Constants
 */

export const INTERVENTION_TYPES = [
    { label: "English", value: "english" },
    { label: "Math", value: "math" },
    { label: "Behavior", value: "behavior" },
    { label: "SEL", value: "sel" },
    { label: "Attendance", value: "attendance" },
    { label: "Bahasa Indonesia", value: "indonesian" },
    { label: "Universal Supports", value: "universal" },
];

export const STRATEGY_TYPE_ALIASES = {
    english: ["english", "bahasa inggris", "ela", "literacy", "reading", "ela/reading", "ela & reading", "sight words"],
    math: ["math", "mathematics", "numeracy", "stem"],
    behavior: ["behavior", "behaviour", "conduct", "regulation", "sel"],
    sel: ["sel", "social emotional", "social-emotional", "behavior", "wellness"],
    attendance: ["attendance", "present", "absent", "absences", "engagement"],
    indonesian: ["indonesian", "bahasa indonesia", "bahasa", "bi", "indonesian language"],
    universal: ["universal", "schoolwide", "all", "tier 1"],
};

export const TIERS = [
    { label: "Tier 1", value: "tier1" },
    { label: "Tier 2", value: "tier2" },
    { label: "Tier 3", value: "tier3" },
];

export const DURATIONS = ["4 weeks", "6 weeks", "8 weeks", "10 weeks", "12 weeks", "16 weeks", "20 weeks", "24 weeks"];

export const FREQUENCIES = ["Daily", "Weekly", "Bi-weekly", "Custom"];

export const WEEKDAYS = [
    { label: "Mon", value: "Monday" },
    { label: "Tue", value: "Tuesday" },
    { label: "Wed", value: "Wednesday" },
    { label: "Thu", value: "Thursday" },
    { label: "Fri", value: "Friday" },
];

export const METHODS = [
    "Option 1 - Direct Observation",
    "Option 2 - Student Self-Report",
    "Option 3 - Assessment Data",
];

export const SKIP_REASONS = [
    { label: "Teacher Rescheduled", value: "teacher_rescheduled" },
    { label: "Student Didn't Come", value: "student_absent" },
    { label: "School Holiday", value: "school_holiday" },
    { label: "Schedule Conflict", value: "schedule_conflict" },
    { label: "Other", value: "other" },
];

export const SCORE_UNITS = ["wpm", "%", "pts", "score"];

export const KINDERGARTEN_DOMAIN_TAGS = [
    { value: "emotional_regulation", label: "Emotional Regulation" },
    { value: "language", label: "Language & Communication" },
    { value: "social", label: "Social" },
    { value: "motor", label: "Motor Skills" },
    { value: "independence", label: "Independence" },
];

export const KINDERGARTEN_WEEKLY_FOCUS_OPTIONS = [
    { value: "continue", label: "Continue" },
    { value: "try", label: "Try" },
    { value: "support_needed", label: "Support Needed" },
];

export const KINDERGARTEN_SIGNAL_OPTIONS = [
    { value: "emerging", label: "Emerging" },
    { value: "developing", label: "Developing" },
    { value: "consistent", label: "Consistent" },
];

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

export const validateInterventionForm = (formState, { isKindergarten = false } = {}) => {
    if (isKindergarten) {
        const hasDomainSelection = Array.isArray(formState.domainTags) && formState.domainTags.length > 0;
        const hasActionablePlan = Boolean(
            hasDomainSelection ||
            formState.strategyName?.trim() ||
            formState.goal?.trim() ||
            formState.notes?.trim()
        );
        return Boolean(
            formState.studentId &&
            formState.tier &&
            formState.startDate &&
            hasActionablePlan
        );
    }

    return Boolean(
        formState.studentId &&
        formState.type &&
        formState.tier &&
        formState.startDate &&
        formState.monitorFrequency &&
        formState.monitorMethod
    );
};
