import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import { createDefaultInterventionForm, createDefaultProgressForm } from "../data/teacherDashboardContent";
import { createMentorAssignment, updateMentorAssignment } from "@/services/mtssService";
import { resolveEditableAssignmentOption } from "../utils/editPlanAccess";

const TYPE_ALIAS_MAP = {
    english: ["english", "bahasa inggris", "ela", "reading", "literacy"],
    math: ["math", "mathematics", "numeracy"],
    behavior: ["behavior", "behaviour", "conduct"],
    sel: ["sel", "social emotional", "social-emotional"],
    attendance: ["attendance", "present", "absence", "absent"],
    indonesian: ["indonesian", "bahasa", "bahasa indonesia", "bi"],
    universal: ["universal", "all", "schoolwide", "tier 1"],
};

const normalizeText = (value = "") =>
    value
        .toString()
        .trim()
        .toLowerCase();

const KINDERGARTEN_TAGS = new Set(["emotional_regulation", "language", "social", "motor", "independence"]);
const KINDERGARTEN_FOCUS_OPTIONS = new Set(["continue", "try", "support_needed"]);
const KINDERGARTEN_SIGNAL_OPTIONS = new Set(["emerging", "developing", "consistent"]);
const KINDERGARTEN_PATTERN = /(kindergarten|pre[-\s]?k|\bk\s*1\b|\bk\s*2\b|kindy)/i;

const resolveTypeValue = (option = {}) => {
    const candidates = [
        option?.focus,
        option?.focusAreas?.[0],
        option?.strategyName,
    ].filter(Boolean);

    for (const raw of candidates) {
        const normalized = normalizeText(raw);
        if (!normalized) continue;
        const direct = Object.keys(TYPE_ALIAS_MAP).find((key) => key === normalized);
        if (direct) return direct;

        for (const [type, aliases] of Object.entries(TYPE_ALIAS_MAP)) {
            if (aliases.some((alias) => normalized === alias || normalized.includes(alias) || alias.includes(normalized))) {
                return type;
            }
        }
    }

    return "universal";
};

const resolveTierValue = (value = "tier2") => {
    const normalized = normalizeText(value).replace(/\s+/g, "");
    if (!normalized) return "tier2";
    if (normalized.includes("tier3") || normalized === "3") return "tier3";
    if (normalized.includes("tier1") || normalized === "1") return "tier1";
    return "tier2";
};

const resolveDurationValue = (value = "") => {
    const normalized = normalizeText(value);
    return /^\d+\s+weeks?$/.test(normalized) ? normalized.replace(/weeks?$/, "weeks") : "";
};

const toDateInputValue = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
};

const resolveScoreValue = (score) => {
    if (score == null) return "";
    if (typeof score === "number" || typeof score === "string") {
        return `${score}`.trim();
    }
    if (score?.value == null) return "";
    return `${score.value}`.trim();
};

const resolveScoreUnit = (score, fallback = "score") => {
    if (typeof score === "string") return score || fallback;
    return score?.unit || fallback;
};

const resolveGoalValue = (option = {}) => {
    if (typeof option.goal === "string" && option.goal.trim()) return option.goal.trim();
    if (typeof option.goals === "string" && option.goals.trim()) return option.goals.trim();
    if (Array.isArray(option.goals) && option.goals.length) {
        const goalEntry = option.goals.find(Boolean);
        if (typeof goalEntry === "string") return goalEntry.trim();
        if (goalEntry?.description) return goalEntry.description.trim();
    }
    return "";
};

const buildInterventionFormFromAssignment = (student, option = {}) => {
    const isQualitative = option?.mode === "qualitative";
    const fallbackUnit = option.metricLabel || "score";
    const baselineUnit = resolveScoreUnit(option.baselineScore, fallbackUnit);
    const focusAreas = Array.isArray(option?.focusAreas) ? option.focusAreas.filter(Boolean) : [];
    const domainTags = focusAreas.filter((tag) => KINDERGARTEN_TAGS.has(tag));
    const latestWeeklyFocus = option?.weeklyFocusOverview?.latest?.value || "";
    const latestSignal = option?.weeklyFocusOverview?.latest?.signal || option?.weeklyFocusOverview?.latestSignal?.value || "";

    return {
        ...createDefaultInterventionForm(),
        studentId: student?.id || student?._id || "",
        studentName: student?.name || "",
        grade: student?.grade || student?.currentGrade || "",
        className: student?.className || "",
        mode: isQualitative ? "qualitative" : "quantitative",
        type: isQualitative ? "" : resolveTypeValue(option),
        domainTags,
        strategyId: option?.strategyId || "",
        strategyName: option?.strategyName || "",
        tier: resolveTierValue(option?.tierValue || option?.tierCode || option?.tier),
        goal: resolveGoalValue(option),
        notes: option?.notes || "",
        startDate: toDateInputValue(option?.startDate),
        duration: resolveDurationValue(option?.duration),
        monitorFrequency: option?.monitoringFrequency || "",
        customFrequencyDays: Array.isArray(option?.customFrequencyDays) ? option.customFrequencyDays : [],
        customFrequencyNote: option?.customFrequencyNote || "",
        monitorMethod: option?.monitoringMethod || "",
        baselineValue: isQualitative ? "" : resolveScoreValue(option?.baselineScore),
        baselineUnit: isQualitative ? "score" : baselineUnit,
        targetValue: isQualitative ? "" : resolveScoreValue(option?.targetScore),
        targetUnit: isQualitative ? "score" : resolveScoreUnit(option?.targetScore, baselineUnit),
        weeklyFocus: KINDERGARTEN_FOCUS_OPTIONS.has(latestWeeklyFocus) ? latestWeeklyFocus : "",
        initialSignal: KINDERGARTEN_SIGNAL_OPTIONS.has(latestSignal) ? latestSignal : "",
    };
};

const isKindergartenInterventionForm = (form = {}, user = {}) => {
    const gradePool = [form.grade, form.className, user?.unit, user?.department]
        .filter(Boolean)
        .join(" ");
    return KINDERGARTEN_PATTERN.test(gradePool);
};

const buildScorePayload = (value, unit = "score", allowClear = false) => {
    if (value === "" || value === null || value === undefined) {
        return allowClear ? { value: null, unit } : undefined;
    }

    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue)) {
        return allowClear ? { value: null, unit } : undefined;
    }

    return {
        value: parsedValue,
        unit,
    };
};

export const useTeacherDashboardState = (tabs, { onSaveSuccess } = {}) => {
    const { toast } = useToast();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [interventionForm, setInterventionForm] = useState(() => createDefaultInterventionForm());
    const [progressForm, setProgressForm] = useState(() => createDefaultProgressForm());
    const [editingPlan, setEditingPlan] = useState(null);
    const [submittingPlan, setSubmittingPlan] = useState(false);
    const [submittingProgress, setSubmittingProgress] = useState(false);

    const user = useSelector((state) => state.auth?.user);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const requestedTab = params.get("tab");
        if (requestedTab && tabs.some((tab) => tab.key === requestedTab)) {
            setActiveTab(requestedTab);
        }
    }, [location.search, tabs]);

    const handleInterventionChange = useCallback((field, value) => {
        setInterventionForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleProgressChange = useCallback((field, value) => {
        setProgressForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const startEditingPlan = useCallback((student, assignmentOption) => {
        const selectedOption = assignmentOption || resolveEditableAssignmentOption(student);
        if (!selectedOption?.assignmentId) return false;

        setEditingPlan({
            assignmentId: selectedOption.assignmentId,
            studentName: student?.name || "Student",
            focusLabel: selectedOption.focus || selectedOption.strategyName || "Intervention",
        });
        setInterventionForm(buildInterventionFormFromAssignment(student, selectedOption));
        setActiveTab("edit");
        return true;
    }, []);

    const cancelEditingPlan = useCallback(() => {
        setEditingPlan(null);
        setInterventionForm(createDefaultInterventionForm());
    }, []);

    const handleSavePlan = useCallback(
        async (event, form) => {
            event.preventDefault();
            if (submittingPlan) return;

            const currentForm = form || interventionForm;
            const isKindergartenFlow = isKindergartenInterventionForm(currentForm, user);
            const requiredKeys = isKindergartenFlow
                ? ["studentId", "tier", "startDate"]
                : ["studentId", "type", "tier", "startDate", "monitorFrequency", "monitorMethod"];
            const missing = requiredKeys.filter((key) => !currentForm[key]);
            if (missing.length) {
                toast({
                    title: "Complete the required fields",
                    description: isKindergartenFlow
                        ? "Student, tier, and start date are required for Kindergarten qualitative planning."
                        : "Student, type, tier, start date, frequency, and method are required.",
                    variant: "destructive",
                });
                return;
            }
            if (isKindergartenFlow) {
                const hasDomainSelection = Array.isArray(currentForm.domainTags) && currentForm.domainTags.length > 0;
                const hasActionablePlan = Boolean(
                    hasDomainSelection ||
                    currentForm.strategyName?.trim() ||
                    currentForm.goal?.trim() ||
                    currentForm.notes?.trim()
                );
                if (!hasActionablePlan) {
                    toast({
                        title: "Add qualitative planning details",
                        description: "For Kindergarten, include at least a domain tag, strategy, goal, or note.",
                        variant: "destructive",
                    });
                    return;
                }
            }

            try {
                setSubmittingPlan(true);

                const isEditing = Boolean(editingPlan?.assignmentId);
                const goalText = currentForm.goal?.trim() || "";
                let payload;

                if (isKindergartenFlow) {
                    const domainTags = Array.isArray(currentForm.domainTags)
                        ? currentForm.domainTags.filter((tag) => KINDERGARTEN_TAGS.has(tag))
                        : [];
                    const initialCheckInSeed = {
                        context: currentForm.context?.trim() || undefined,
                        observation: currentForm.observation?.trim() || undefined,
                        response: currentForm.response?.trim() || undefined,
                        nextStep: currentForm.nextStep?.trim() || undefined,
                        signal: KINDERGARTEN_SIGNAL_OPTIONS.has(currentForm.initialSignal) ? currentForm.initialSignal : undefined,
                        weeklyFocus: KINDERGARTEN_FOCUS_OPTIONS.has(currentForm.weeklyFocus) ? currentForm.weeklyFocus : undefined,
                        tags: domainTags.length ? domainTags : undefined,
                        summary: currentForm.notes?.trim() || undefined,
                        performed: true
                    };
                    const hasInitialCheckIn = Boolean(
                        initialCheckInSeed.context ||
                        initialCheckInSeed.observation ||
                        initialCheckInSeed.response ||
                        initialCheckInSeed.nextStep ||
                        initialCheckInSeed.signal ||
                        initialCheckInSeed.weeklyFocus ||
                        (Array.isArray(initialCheckInSeed.tags) && initialCheckInSeed.tags.length)
                    );

                    payload = {
                        mode: "qualitative",
                        tier: currentForm.tier,
                        focusAreas: domainTags,
                        startDate: currentForm.startDate || undefined,
                        duration: currentForm.duration || undefined,
                        strategyId: currentForm.strategyId || undefined,
                        strategyName: currentForm.strategyName || undefined,
                        monitoringMethod: currentForm.monitorMethod || "Option 1 - Direct Observation",
                        monitoringFrequency: currentForm.monitorFrequency || "Weekly",
                        notes: isEditing ? (currentForm.notes || "") : (currentForm.notes || undefined),
                        goals: goalText
                            ? [{ description: goalText }]
                            : (isEditing ? [] : undefined),
                        ...(!isEditing && hasInitialCheckIn ? { initialCheckIn: initialCheckInSeed } : {}),
                    };

                    if (payload.monitoringFrequency === "Custom") {
                        payload.customFrequencyDays = currentForm.customFrequencyDays?.length ? currentForm.customFrequencyDays : [];
                        payload.customFrequencyNote = currentForm.customFrequencyNote || "";
                    } else if (isEditing) {
                        payload.customFrequencyDays = [];
                        payload.customFrequencyNote = "";
                    }
                } else {
                    const metricUnit = currentForm.baselineUnit || currentForm.targetUnit || "score";
                    const baselineScore = buildScorePayload(currentForm.baselineValue, metricUnit, isEditing);
                    const targetScore = buildScorePayload(currentForm.targetValue, metricUnit, isEditing);

                    payload = {
                        tier: currentForm.tier,
                        focusAreas: currentForm.type ? [currentForm.type] : ["Universal Supports"],
                        startDate: currentForm.startDate || undefined,
                        duration: currentForm.duration || undefined,
                        strategyId: currentForm.strategyId || undefined,
                        strategyName: currentForm.strategyName || undefined,
                        monitoringMethod: currentForm.monitorMethod || undefined,
                        monitoringFrequency: currentForm.monitorFrequency || undefined,
                        metricLabel: metricUnit,
                        ...(baselineScore !== undefined ? { baselineScore } : {}),
                        ...(targetScore !== undefined ? { targetScore } : {}),
                        notes: isEditing ? (currentForm.notes || "") : (currentForm.notes || undefined),
                        goals: goalText
                            ? [{ description: goalText }]
                            : (isEditing ? [] : undefined),
                    };

                    if (currentForm.monitorFrequency === "Custom") {
                        payload.customFrequencyDays = currentForm.customFrequencyDays?.length ? currentForm.customFrequencyDays : [];
                        payload.customFrequencyNote = currentForm.customFrequencyNote || "";
                    } else if (isEditing) {
                        payload.customFrequencyDays = [];
                        payload.customFrequencyNote = "";
                    }
                }

                if (isEditing) {
                    await updateMentorAssignment(editingPlan.assignmentId, payload);
                } else {
                    const mentorId = user?.id || user?._id;
                    await createMentorAssignment({
                        ...payload,
                        mentorId,
                        studentIds: [currentForm.studentId],
                    });
                }

                toast({
                    title: isEditing ? "Intervention updated" : "Intervention saved",
                    description: isEditing
                        ? "Plan changes are now live on the MTSS dashboard."
                        : "Student plan created successfully. Track their progress!",
                });

                setInterventionForm(createDefaultInterventionForm());
                setEditingPlan(null);
                setActiveTab("students");
                onSaveSuccess?.();
            } catch (error) {
                console.error("Failed to save intervention plan:", error);
                toast({
                    title: "Failed to save plan",
                    description: error?.response?.data?.message || error?.message || "Please try again.",
                    variant: "destructive",
                });
            } finally {
                setSubmittingPlan(false);
            }
        },
        [editingPlan, interventionForm, onSaveSuccess, submittingPlan, toast, user],
    );

    const handleSubmitProgress = useCallback(
        async (event) => {
            event.preventDefault();
            if (submittingProgress) return;

            if (!progressForm.assignmentId || !progressForm.notes) {
                toast({
                    title: "Complete the required fields",
                    description: "Please select a student and provide progress notes.",
                    variant: "destructive",
                });
                return;
            }

            try {
                setSubmittingProgress(true);

                const payload = {
                    checkIns: [{
                        date: progressForm.date || new Date().toISOString(),
                        summary: progressForm.notes || "Progress update",
                        value: progressForm.scoreValue ? Number(progressForm.scoreValue) : undefined,
                        unit: progressForm.scoreUnit || "score",
                        performed: progressForm.performed === "yes" || progressForm.performed === true,
                        skipReason: progressForm.performed === "no" ? (progressForm.skipReason || undefined) : undefined,
                        skipReasonNote: progressForm.performed === "no" && progressForm.skipReason === "other" ? (progressForm.skipReasonNote || undefined) : undefined,
                        celebration: progressForm.badge || undefined,
                    }],
                };

                await updateMentorAssignment(progressForm.assignmentId, payload);

                toast({
                    title: "Progress submitted",
                    description: "Your monitoring update is live on the MTSS dashboard.",
                });

                setProgressForm(createDefaultProgressForm());
            } catch (error) {
                console.error("Failed to submit progress:", error);
                toast({
                    title: "Failed to submit progress",
                    description: error?.response?.data?.message || error?.message || "Please try again.",
                    variant: "destructive",
                });
            } finally {
                setSubmittingProgress(false);
            }
        },
        [progressForm, submittingProgress, toast],
    );

    const resetInterventionForm = useCallback(() => {
        setEditingPlan(null);
        setInterventionForm(createDefaultInterventionForm());
    }, []);

    const resetProgressForm = useCallback(() => {
        setProgressForm(createDefaultProgressForm());
    }, []);

    return {
        activeTab,
        setActiveTab,
        interventionForm,
        progressForm,
        editingPlan,
        isEditingPlan: Boolean(editingPlan?.assignmentId),
        handleInterventionChange,
        handleProgressChange,
        handleSavePlan,
        handleSubmitProgress,
        startEditingPlan,
        cancelEditingPlan,
        resetInterventionForm,
        resetProgressForm,
        submittingPlan,
        setSubmittingPlan,
        submittingProgress,
        setSubmittingProgress,
    };
};
