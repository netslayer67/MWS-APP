import { ensureStudentInterventions, pickPrimaryIntervention } from "./interventionUtils";

const buildMergedInterventions = (student) => {
    const { interventionDetails = [] } = student;
    const allInterventions = ensureStudentInterventions(student.interventions);

    return allInterventions.map((intervention) => {
        const detail = interventionDetails.find((item) =>
            item.type?.toUpperCase() === intervention.type?.toUpperCase(),
        );

        if (detail) {
            return { ...detail, hasRealData: true, type: intervention.type };
        }

        return {
            id: `default-${intervention.type}`,
            type: intervention.type,
            label: intervention.label,
            tier: intervention.tierCode || "tier1",
            tierLabel: intervention.tier || "Tier 1",
            status: intervention.status || "monitoring",
            strategyName: intervention.strategies?.[0] || null,
            baseline: null,
            current: null,
            target: null,
            progressUnit: "pts",
            progress: 0,
            checkInsCount: 0,
            chart: [],
            history: [],
            hasRealData: false,
        };
    });
};

export const buildStudentProfileView = (student, selectedIntervention) => {
    if (!student) {
        return {
            profile: {},
            highlight: null,
            sortedInterventions: [],
            currentIntervention: null,
            strategyLabel: "Core supports",
            durationLabel: "Ongoing",
            frequencyLabel: "Weekly",
            mentorLabel: "TBD",
        };
    }

    const { profile = {} } = student;
    const mergedInterventions = buildMergedInterventions(student);
    const allInterventions = ensureStudentInterventions(student.interventions);
    const highlight = pickPrimaryIntervention(allInterventions);

    const sortedInterventions = [...mergedInterventions].sort((a, b) => {
        const tierOrder = { tier3: 0, tier2: 1, tier1: 2 };
        const aTier = a.tier?.toLowerCase() || "tier1";
        const bTier = b.tier?.toLowerCase() || "tier1";
        return (tierOrder[aTier] ?? 2) - (tierOrder[bTier] ?? 2);
    });

    const escalatedInterventions = sortedInterventions.filter((item) => item.tier === "tier2" || item.tier === "tier3");
    const defaultSelected = escalatedInterventions[0] || sortedInterventions[0] || null;
    const currentIntervention = selectedIntervention || defaultSelected;

    const strategyLabel = currentIntervention?.strategyName || currentIntervention?.focusArea || "Core supports";
    const durationLabel = currentIntervention?.duration || "Ongoing";
    const frequencyLabel = currentIntervention?.monitoringFrequency || currentIntervention?.monitoringMethod || "Weekly";
    const mentorLabel = currentIntervention?.mentor || profile?.mentor || student.mentor || "TBD";

    return {
        profile,
        highlight,
        sortedInterventions,
        currentIntervention,
        strategyLabel,
        durationLabel,
        frequencyLabel,
        mentorLabel,
    };
};
