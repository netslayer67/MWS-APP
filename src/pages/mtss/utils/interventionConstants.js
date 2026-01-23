export const TIER_LABELS = {
    tier1: "Tier 1",
    tier2: "Tier 2",
    tier3: "Tier 3",
};

export const INTERVENTION_TYPES = [
    { key: "SEL", label: "SEL", accent: "from-[#f472b6]/20 to-[#fb7185]/30 text-rose-600" },
    { key: "ENGLISH", label: "English", accent: "from-[#bfdbfe]/40 to-[#93c5fd]/50 text-sky-600" },
    { key: "MATH", label: "Math", accent: "from-[#bbf7d0]/40 to-[#86efac]/50 text-emerald-600" },
    { key: "BEHAVIOR", label: "Behavior", accent: "from-[#fed7aa]/50 to-[#fdba74]/50 text-amber-600" },
    { key: "ATTENDANCE", label: "Attendance", accent: "from-[#ddd6fe]/50 to-[#c4b5fd]/50 text-indigo-600" },
];

export const TYPE_LOOKUP = new Map(INTERVENTION_TYPES.map((type) => [type.key, type]));

export const TIER_PRIORITY = { tier1: 1, tier2: 2, tier3: 3 };

export const STATUS_LABELS = {
    monitoring: "Monitoring",
    active: "Active",
    paused: "Paused",
    closed: "Closed",
};

export const FOCUS_TYPE_MATCHERS = [
    { key: "ATTENDANCE", pattern: /attendance|absen|present|presence/i },
    { key: "BEHAVIOR", pattern: /behavior|behaviour|conduct|discipline/i },
    { key: "MATH", pattern: /math|mathematics|numeracy|algebra|geometry/i },
    { key: "ENGLISH", pattern: /english|ela|literacy|reading|writing|fluency/i },
    { key: "SEL", pattern: /sel|social|emotional|wellbeing|well-being/i },
];

export const tierToneClasses = {
    tier1: "bg-emerald-50 text-emerald-700 border-emerald-100",
    tier2: "bg-amber-50 text-amber-700 border-amber-100",
    tier3: "bg-rose-50 text-rose-700 border-rose-100",
};
