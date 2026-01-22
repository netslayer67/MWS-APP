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
const FOCUS_TYPE_MATCHERS = [
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

const normalizeTierCode = (value) => {
    if (!value) return "tier1";
    const normalized = value.toString().trim().toLowerCase();
    // Handle both "tier2" and "Tier 2" formats
    if (TIER_LABELS[normalized]) return normalized;
    // Convert "Tier 2" -> "tier2"
    const cleaned = normalized.replace(/\s+/g, "");
    return TIER_LABELS[cleaned] ? cleaned : "tier1";
};

const normalizeStatus = (value) => {
    if (!value) return "monitoring";
    const normalized = value.toString().trim().toLowerCase();
    return STATUS_LABELS[normalized] ? normalized : "monitoring";
};

const resolveTypeKey = (value) => {
    if (!value) return null;
    const cleaned = value.toString().trim();
    const upper = cleaned.toUpperCase();
    if (TYPE_LOOKUP.has(upper)) return upper;
    const lower = cleaned.toLowerCase();
    const byLabel = INTERVENTION_TYPES.find((entry) => entry.label.toLowerCase() === lower);
    if (byLabel) return byLabel.key;
    const match = FOCUS_TYPE_MATCHERS.find((entry) => entry.pattern.test(lower));
    return match ? match.key : null;
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
        // Use tierCode directly if available (from backend), otherwise normalize from tier
        const tierCode = payload.tierCode
            ? normalizeTierCode(payload.tierCode)
            : normalizeTierCode(payload.tier);
        // Check if this intervention has actual data (not just default values)
        const hasData = Boolean(
            payload.type ||
            payload.tier ||
            payload.tierCode ||
            payload.status === "active" ||
            payload.hasData
        );
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
            hasData, // Flag to indicate if this intervention has actual data
        };
    });
};

// Get only interventions that have actual data (tier2/tier3 or active status)
export const getActiveInterventions = (interventions = []) => {
    return interventions.filter(entry =>
        entry.hasData ||
        entry.tierCode === "tier2" ||
        entry.tierCode === "tier3"
    );
};

export const pickPrimaryIntervention = (interventions = []) => {
    if (!interventions.length) return null;
    const escalated = interventions
        .filter((entry) => entry.tierCode !== "tier1")
        .sort((a, b) => TIER_PRIORITY[b.tierCode] - TIER_PRIORITY[a.tierCode]);
    if (escalated.length) return escalated[0];
    return interventions[0];
};

/**
 * Pick the intervention that needs most attention for display in student table
 * Priority:
 * 1. Highest tier (Tier 3 > Tier 2 > Tier 1)
 * 2. If same tier, lowest current value (needs more work)
 *
 * @param {Array} interventions - Array of intervention objects
 * @param {Object} profile - Student profile with baseline/current/target values
 * @returns {Object|null} - The most critical intervention or null
 */
export const pickMostCriticalIntervention = (interventions = [], profile = {}) => {
    if (!interventions.length) return null;

    // Filter to only interventions with actual data (tier2/tier3)
    const escalated = interventions.filter(
        (entry) => entry.hasData && (entry.tierCode === "tier2" || entry.tierCode === "tier3")
    );

    if (!escalated.length) {
        // No escalated interventions, return null (will show "Universal")
        return null;
    }

    // Sort by:
    // 1. Tier priority (tier3 > tier2 > tier1) - descending
    // 2. Current value (lower = needs more attention) - ascending
    const sorted = escalated.sort((a, b) => {
        // First compare by tier (higher tier = more critical)
        const tierDiff = TIER_PRIORITY[b.tierCode] - TIER_PRIORITY[a.tierCode];
        if (tierDiff !== 0) return tierDiff;

        // If same tier, compare by current value (lower = needs more attention)
        // We need to get current values from somewhere - check if available
        const aValue = a.currentValue ?? profile?.current ?? 100;
        const bValue = b.currentValue ?? profile?.current ?? 100;
        return aValue - bValue; // Lower value first
    });

    return sorted[0];
};

/**
 * Get the most critical intervention for table display
 * Returns both the intervention and display info
 */
export const getMostCriticalForDisplay = (interventions = [], profile = {}, fallback = {}) => {
    const critical = pickMostCriticalIntervention(interventions, profile);
    const fallbackTier = fallback?.tier || profile?.tier || "";
    const fallbackType = fallback?.type || profile?.type || "";
    const fallbackTierCode = normalizeTierCode(fallbackTier);
    const fallbackTypeKey = resolveTypeKey(fallbackType);
    const hasFallback = fallbackTierCode !== "tier1" && (fallbackTypeKey || fallbackType);

    const fallbackResult = hasFallback
        ? (() => {
            const meta = fallbackTypeKey ? TYPE_LOOKUP.get(fallbackTypeKey) : null;
            const label = meta?.label || fallbackType || "Focused Support";
            return {
                mode: "focused",
                intervention: {
                    type: fallbackTypeKey || "SEL",
                    label,
                    tierCode: fallbackTierCode,
                    tier: TIER_LABELS[fallbackTierCode],
                },
                tier: TIER_LABELS[fallbackTierCode],
                tierCode: fallbackTierCode,
                label,
                strategy: fallback?.profile?.strategy || profile?.strategy || null,
            };
        })()
        : null;

    if (critical) {
        if (fallbackResult) {
            const criticalScore = TIER_PRIORITY[critical.tierCode] || 0;
            const fallbackScore = TIER_PRIORITY[fallbackTierCode] || 0;
            if (fallbackScore > criticalScore) {
                return fallbackResult;
            }
        }
        return {
            mode: "focused",
            intervention: critical,
            tier: critical.tier,
            tierCode: critical.tierCode,
            label: critical.label,
            strategy: critical.strategies?.[0] || null,
        };
    }

    if (fallbackResult) {
        return fallbackResult;
    }

    return {
        mode: "universal",
        intervention: null,
        tier: "Tier 1",
        tierCode: "tier1",
        label: "Universal",
    };
};

export const getStatusLabel = (status) => STATUS_LABELS[status] || STATUS_LABELS.monitoring;
