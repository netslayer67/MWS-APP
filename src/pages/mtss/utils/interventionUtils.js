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

const TYPE_LOOKUP = new Map(INTERVENTION_TYPES.map((type) => [type.key, type]));
const TIER_PRIORITY = { tier1: 1, tier2: 2, tier3: 3 };
const STATUS_LABELS = {
    monitoring: "Monitoring",
    active: "Active",
    paused: "Paused",
    closed: "Closed",
};

export const tierToneClasses = {
    tier1: "bg-emerald-50 text-emerald-700 border-emerald-100",
    tier2: "bg-amber-50 text-amber-700 border-amber-100",
    tier3: "bg-rose-50 text-rose-700 border-rose-100",
};

const normalizeTierCode = (value) => {
    if (!value) return "tier1";
    const normalized = value.toString().trim().toLowerCase();
    return TIER_LABELS[normalized] ? normalized : "tier1";
};

const normalizeStatus = (value) => {
    if (!value) return "monitoring";
    const normalized = value.toString().trim().toLowerCase();
    return STATUS_LABELS[normalized] ? normalized : "monitoring";
};

export const ensureStudentInterventions = (entries = []) => {
    const map = new Map();
    if (Array.isArray(entries)) {
        entries.forEach((entry) => {
            const typeKey = entry?.type?.toString().toUpperCase();
            if (typeKey && TYPE_LOOKUP.has(typeKey)) {
                map.set(typeKey, entry);
            }
        });
    }

    return INTERVENTION_TYPES.map((meta) => {
        const payload = map.get(meta.key) || {};
        const tierCode = normalizeTierCode(payload.tier);
        return {
            type: meta.key,
            label: meta.label,
            accent: meta.accent,
            tierCode,
            tier: TIER_LABELS[tierCode],
            status: normalizeStatus(payload.status),
            strategies: Array.isArray(payload.strategies) ? payload.strategies.filter(Boolean) : [],
            notes: payload.notes || "",
            updatedAt: payload.updatedAt,
            updatedBy: payload.updatedBy,
            history: Array.isArray(payload.history) ? payload.history : [],
        };
    });
};

export const pickPrimaryIntervention = (interventions = []) => {
    if (!interventions.length) return null;
    const escalated = interventions
        .filter((entry) => entry.tierCode !== "tier1")
        .sort((a, b) => TIER_PRIORITY[b.tierCode] - TIER_PRIORITY[a.tierCode]);
    if (escalated.length) return escalated[0];
    return interventions[0];
};

export const getStatusLabel = (status) => STATUS_LABELS[status] || STATUS_LABELS.monitoring;
