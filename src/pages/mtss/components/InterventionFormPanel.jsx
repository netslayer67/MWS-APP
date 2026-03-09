import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { fetchStrategies, fetchKindergartenInterventionBank, generateKindergartenAiDraft } from "@/services/mtssService";
import { FALLBACK_INTERVENTION_BANK } from "../data/kindergartenInterventionBank";
import { filterStrategiesByType, validateInterventionForm } from "../config/interventionFormConfig";
import InterventionFormFields from "./InterventionFormFields";

const KINDERGARTEN_PATTERN = /(kindergarten|pre[-\s]?k|\bk\s*1\b|\bk\s*2\b|kindy)/i;
const KINDERGARTEN_TAGS = new Set(["emotional_regulation", "language", "social", "motor", "independence"]);
const VALID_TIERS = new Set(["tier1", "tier2", "tier3"]);
const VALID_WEEKLY_FOCUS = new Set(["continue", "try", "support_needed"]);
const VALID_SIGNALS = new Set(["emerging", "developing", "consistent"]);
const DOMAIN_LABELS = {
    emotional_regulation: "Emotional Regulation",
    language: "Language",
    social: "Social",
    motor: "Motor",
    independence: "Independence",
};
const WEEKLY_FOCUS_LABELS = {
    continue: "Continue",
    try: "Try",
    support_needed: "Support Needed",
};
const SIGNAL_LABELS = {
    emerging: "Emerging",
    developing: "Developing",
    consistent: "Consistent",
};
const TIER_LABELS = {
    tier1: "Tier 1",
    tier2: "Tier 2",
    tier3: "Tier 3",
};

const isKindergartenText = (value = "") => KINDERGARTEN_PATTERN.test(String(value || "").trim());

const normalizeDomainTag = (value = "") => {
    const normalized = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
    if (KINDERGARTEN_TAGS.has(normalized)) return normalized;
    if (normalized.includes("emotion")) return "emotional_regulation";
    if (normalized.includes("language") || normalized.includes("communication")) return "language";
    if (normalized.includes("social")) return "social";
    if (normalized.includes("motor")) return "motor";
    if (normalized.includes("independ")) return "independence";
    return "";
};

const normalizeTokenLabel = (value = "") =>
    String(value || "")
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeDraftForComparison = (draft = {}) =>
    JSON.stringify({
        domainTags: Array.isArray(draft.domainTags) ? [...draft.domainTags].sort() : [],
        tier: String(draft.tier || ""),
        strategyName: String(draft.strategyName || ""),
        goal: String(draft.goal || ""),
        notes: String(draft.notes || ""),
        monitorFrequency: String(draft.monitorFrequency || ""),
        monitorMethod: String(draft.monitorMethod || ""),
        weeklyFocus: String(draft.weeklyFocus || ""),
        initialSignal: String(draft.initialSignal || ""),
        context: String(draft.context || ""),
        observation: String(draft.observation || ""),
        response: String(draft.response || ""),
        nextStep: String(draft.nextStep || ""),
    });

const sameStringArray = (left = [], right = []) => {
    if (!Array.isArray(left) || !Array.isArray(right)) return false;
    if (left.length !== right.length) return false;
    const leftSorted = [...left].map((item) => String(item || "").trim()).sort();
    const rightSorted = [...right].map((item) => String(item || "").trim()).sort();
    return leftSorted.every((value, index) => value === rightSorted[index]);
};

const sanitizeKindergartenAiDraft = (payload = {}) => {
    const domainTags = Array.isArray(payload.domainTags)
        ? payload.domainTags.map(normalizeDomainTag).filter(Boolean)
        : [];
    const tier = VALID_TIERS.has(String(payload.tier || "").toLowerCase()) ? String(payload.tier).toLowerCase() : "";
    const weeklyFocus = VALID_WEEKLY_FOCUS.has(String(payload.weeklyFocus || "").toLowerCase())
        ? String(payload.weeklyFocus).toLowerCase()
        : "";
    const initialSignal = VALID_SIGNALS.has(String(payload.initialSignal || payload.signal || "").toLowerCase())
        ? String(payload.initialSignal || payload.signal).toLowerCase()
        : "";

    return {
        domainTags: Array.from(new Set(domainTags)),
        tier,
        strategyName: typeof payload.strategyName === "string" ? payload.strategyName.trim() : "",
        goal: typeof payload.goal === "string" ? payload.goal.trim() : "",
        notes: typeof payload.notes === "string" ? payload.notes.trim() : "",
        monitorFrequency: typeof payload.monitorFrequency === "string" ? payload.monitorFrequency.trim() : "",
        monitorMethod: typeof payload.monitorMethod === "string" ? payload.monitorMethod.trim() : "",
        weeklyFocus,
        initialSignal,
        context: typeof payload.context === "string" ? payload.context.trim() : "",
        observation: typeof payload.observation === "string" ? payload.observation.trim() : "",
        response: typeof payload.response === "string" ? payload.response.trim() : "",
        nextStep: typeof payload.nextStep === "string" ? payload.nextStep.trim() : "",
    };
};

const KindergartenDraftLoader = () => (
    <span className="inline-flex items-center gap-2">
        <span className="relative flex h-4 w-4 items-center justify-center">
            <span className="absolute h-4 w-4 rounded-full border border-white/45 animate-ping" />
            <span className="h-2 w-2 rounded-full bg-white" />
        </span>
        <span className="inline-flex items-end gap-1">
            {[0, 120, 240].map((delay) => (
                <span
                    key={delay}
                    className="h-1.5 w-1.5 rounded-full bg-white/95 animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                />
            ))}
        </span>
    </span>
);

const InterventionFormPanel = memo(({
    formState,
    onChange,
    onSubmit,
    baseFieldClass,
    textareaClass,
    students = [],
    submitting = false,
    isEditing = false,
    editingPlan = null,
    onCancelEdit,
}) => {
    const authUser = useSelector((state) => state.auth?.user);
    const [strategies, setStrategies] = useState([]);
    const [loadingStrategies, setLoadingStrategies] = useState(false);
    const [kindergartenBank, setKindergartenBank] = useState(FALLBACK_INTERVENTION_BANK);
    const [loadingKindergartenBank, setLoadingKindergartenBank] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiDraftPreview, setAiDraftPreview] = useState("");
    const [aiDraftData, setAiDraftData] = useState(null);
    const [showRawPreview, setShowRawPreview] = useState(false);
    const [aiError, setAiError] = useState("");

    useEffect(() => {
        let mounted = true;
        setLoadingStrategies(true);
        fetchStrategies()
            .then((response) => {
                if (!mounted) return;
                setStrategies(response?.strategies || []);
            })
            .catch(() => {
                if (!mounted) return;
                setStrategies([]);
            })
            .finally(() => {
                if (mounted) setLoadingStrategies(false);
            });
        return () => { mounted = false; };
    }, []);

    const strategyMatchesType = useMemo(
        () => filterStrategiesByType(strategies, formState.type),
        [formState.type, strategies],
    );

    const strategyFallbackActive = Boolean(formState.type && strategies.length && strategyMatchesType.length === 0);
    const filteredStrategies = strategyFallbackActive ? strategies : strategyMatchesType;

    const selectedStudent = useMemo(
        () => students.find((student) => student.id === formState.studentId || student._id === formState.studentId),
        [students, formState.studentId]
    );

    const isKindergartenFlow = useMemo(() => {
        const pool = [
            selectedStudent?.grade,
            selectedStudent?.currentGrade,
            selectedStudent?.className,
            formState.grade,
            formState.className,
            authUser?.unit,
            authUser?.department,
        ]
            .filter(Boolean)
            .join(" ");
        return isKindergartenText(pool);
    }, [authUser?.department, authUser?.unit, formState.className, formState.grade, selectedStudent]);

    useEffect(() => {
        if (!isKindergartenFlow) return;
        let mounted = true;
        setLoadingKindergartenBank(true);
        fetchKindergartenInterventionBank()
            .then((response = {}) => {
                if (!mounted) return;
                setKindergartenBank(response?.interventionBank || FALLBACK_INTERVENTION_BANK);
            })
            .catch(() => {
                if (!mounted) return;
                setKindergartenBank(FALLBACK_INTERVENTION_BANK);
            })
            .finally(() => {
                if (mounted) setLoadingKindergartenBank(false);
            });
        return () => { mounted = false; };
    }, [isKindergartenFlow]);

    useEffect(() => {
        if (isKindergartenFlow && formState.mode !== "qualitative") {
            onChange("mode", "qualitative");
        }
        if (!isKindergartenFlow && formState.mode !== "quantitative") {
            onChange("mode", "quantitative");
        }
        if (isKindergartenFlow && !formState.monitorFrequency) {
            onChange("monitorFrequency", "Weekly");
        }
    }, [formState.mode, formState.monitorFrequency, isKindergartenFlow, onChange]);

    useEffect(() => {
        if (!isKindergartenFlow) {
            setAiDraftData(null);
            setAiDraftPreview("");
            setShowRawPreview(false);
            setAiError("");
        }
    }, [isKindergartenFlow]);

    const kindergartenStrategies = useMemo(() => {
        if (!isKindergartenFlow) return [];
        const selectedTags = Array.isArray(formState.domainTags)
            ? formState.domainTags.filter((tag) => KINDERGARTEN_TAGS.has(tag))
            : [];
        const selectedSignal = VALID_SIGNALS.has(formState.initialSignal) ? formState.initialSignal : "";
        const domainKeys = selectedTags.length ? selectedTags : Object.keys(kindergartenBank || {});

        return domainKeys.flatMap((tag) => {
            const domain = kindergartenBank?.[tag];
            const domainLabel = domain?.label || tag;
            const strategiesList = Array.isArray(domain?.strategies) ? domain.strategies : [];
            return strategiesList
                .filter((entry) => !selectedSignal || !Array.isArray(entry.signals) || entry.signals.includes(selectedSignal))
                .map((entry) => ({
                    ...entry,
                    domainTag: tag,
                    domainLabel,
                }));
        });
    }, [formState.domainTags, formState.initialSignal, isKindergartenFlow, kindergartenBank]);

    const handleStudentChange = (event) => {
        const value = event.target.value;
        const student = students.find((candidate) => candidate.id === value || candidate._id === value);
        const gradeValue = student?.grade || student?.currentGrade || "";
        const classNameValue = student?.className || "";
        const kindergartenStudent = isKindergartenText(`${gradeValue} ${classNameValue}`);

        onChange("studentId", value);
        onChange("studentName", student?.name || "");
        onChange("grade", gradeValue);
        onChange("className", classNameValue);
        onChange("mode", kindergartenStudent ? "qualitative" : "quantitative");
        if (kindergartenStudent && !formState.monitorFrequency) {
            onChange("monitorFrequency", "Weekly");
        }
    };

    const handleStrategyChange = (event) => {
        const strategyId = event.target.value;
        const strategy = strategies.find((item) => item._id === strategyId);
        onChange("strategyId", strategyId);
        onChange("strategyName", strategy?.name || "");
        if (strategy?.name && !formState.goal) {
            onChange("goal", strategy.overview || "");
        }
    };

    const handleUseKindergartenStrategy = useCallback((strategy = {}) => {
        onChange("strategyName", strategy.title || "");
        if (!formState.notes?.trim()) {
            onChange("notes", `Primary classroom strategy: ${strategy.title || "Kindergarten support strategy"}.`);
        }
    }, [formState.notes, onChange]);

    const handleGenerateKindergartenDraft = useCallback(async () => {
        if (!isKindergartenFlow || aiLoading) return;
        if (!selectedStudent?.name) {
            setAiError("Select a student first to generate a Kindergarten AI draft.");
            return;
        }

        setAiError("");
        setShowRawPreview(false);
        setAiLoading(true);
        try {
            const previousDraft = aiDraftData;
            const clearIfAutoFilled = (value, previousValue) => {
                const current = String(value || "").trim();
                if (!current) return "";
                if (!previousDraft) return current;
                const previous = String(previousValue || "").trim();
                return current === previous ? "" : current;
            };
            const selectedTags = Array.isArray(formState.domainTags) ? formState.domainTags : [];
            const previousTags = Array.isArray(previousDraft?.domainTags) ? previousDraft.domainTags : [];
            const tagsWereAutoFilled = previousDraft && sameStringArray(selectedTags, previousTags);

            let finalResponse = null;
            let finalPayload = null;
            let finalDraft = null;

            for (let attempt = 0; attempt < 3; attempt += 1) {
                const regenerationKey = `${Date.now()}-${attempt}-${Math.random().toString(36).slice(2, 8)}`;
                const response = await generateKindergartenAiDraft({
                    studentId: selectedStudent.id || selectedStudent._id,
                    regenerationKey,
                    previousDraftFingerprint: previousDraft ? normalizeDraftForComparison(previousDraft) : "",
                    objective: formState.aiPrompt || "",
                    domainTags: tagsWereAutoFilled ? [] : selectedTags,
                    strategyName: clearIfAutoFilled(formState.strategyName, previousDraft?.strategyName),
                    goal: clearIfAutoFilled(formState.goal, previousDraft?.goal),
                    notes: clearIfAutoFilled(formState.notes, previousDraft?.notes),
                    context: clearIfAutoFilled(formState.context, previousDraft?.context),
                    observation: clearIfAutoFilled(formState.observation, previousDraft?.observation),
                    response: clearIfAutoFilled(formState.response, previousDraft?.response),
                    nextStep: clearIfAutoFilled(formState.nextStep, previousDraft?.nextStep),
                    tier: formState.tier || "tier1",
                    weeklyFocus: clearIfAutoFilled(formState.weeklyFocus, previousDraft?.weeklyFocus),
                    signal: clearIfAutoFilled(formState.initialSignal, previousDraft?.initialSignal),
                });

                const draftPayload = response?.draft || {};
                if (!draftPayload || typeof draftPayload !== "object") {
                    finalResponse = response;
                    finalPayload = null;
                    finalDraft = null;
                    break;
                }

                const draft = sanitizeKindergartenAiDraft(draftPayload);
                const isSameAsPrevious = previousDraft
                    ? normalizeDraftForComparison(draft) === normalizeDraftForComparison(previousDraft)
                    : false;

                finalResponse = response;
                finalPayload = draftPayload;
                finalDraft = draft;

                if (!isSameAsPrevious) break;
            }

            if (!finalPayload || !finalDraft) {
                setAiDraftData(null);
                setAiDraftPreview(finalResponse?.preview || "");
                setAiError("AI draft could not be generated. Please try again.");
                return;
            }

            setAiDraftData(finalDraft);
            setAiDraftPreview(finalResponse?.preview || JSON.stringify(finalPayload, null, 2));
            if (finalDraft.domainTags.length) onChange("domainTags", finalDraft.domainTags);
            if (finalDraft.tier) onChange("tier", finalDraft.tier);
            if (finalDraft.strategyName) onChange("strategyName", finalDraft.strategyName);
            if (finalDraft.goal) onChange("goal", finalDraft.goal);
            if (finalDraft.notes) onChange("notes", finalDraft.notes);
            if (finalDraft.monitorFrequency) onChange("monitorFrequency", finalDraft.monitorFrequency);
            if (finalDraft.monitorMethod) onChange("monitorMethod", finalDraft.monitorMethod);
            if (finalDraft.weeklyFocus) onChange("weeklyFocus", finalDraft.weeklyFocus);
            if (finalDraft.initialSignal) onChange("initialSignal", finalDraft.initialSignal);
            if (finalDraft.context) onChange("context", finalDraft.context);
            if (finalDraft.observation) onChange("observation", finalDraft.observation);
            if (finalDraft.response) onChange("response", finalDraft.response);
            if (finalDraft.nextStep) onChange("nextStep", finalDraft.nextStep);
        } catch (error) {
            setAiError(error?.response?.data?.message || error?.message || "Failed to generate AI draft.");
        } finally {
            setAiLoading(false);
        }
    }, [
        aiLoading,
        formState.aiPrompt,
        formState.context,
        formState.domainTags,
        formState.goal,
        formState.initialSignal,
        formState.nextStep,
        formState.notes,
        formState.observation,
        formState.response,
        formState.strategyName,
        formState.tier,
        formState.weeklyFocus,
        isKindergartenFlow,
        onChange,
        selectedStudent,
        aiDraftData
    ]);

    const isValid = validateInterventionForm(formState, { isKindergarten: isKindergartenFlow });

    return (
        <section
            className="mtss-theme relative overflow-hidden rounded-[36px] border border-white/50 dark:border-white/10 bg-white/75 dark:bg-slate-900/50 shadow-[0_30px_90px_rgba(15,23,42,0.18)] p-6 sm:p-8 space-y-6 backdrop-blur-2xl"
            data-aos="fade-up"
            data-aos-duration="700"
        >
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 -left-10 h-56 w-56 bg-gradient-to-br from-[#f472b6]/25 via-[#60a5fa]/20 to-transparent blur-[120px]" />
                <div className="absolute -bottom-16 right-0 h-64 w-64 bg-gradient-to-br from-[#22d3ee]/20 via-[#a855f7]/15 to-transparent blur-[140px]" />
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_transparent_60%)] dark:opacity-20" />
            </div>
            <div className="relative space-y-6">
                <header className="space-y-2" data-aos="fade-up" data-aos-delay="60">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-white/10 border border-white/60 dark:border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-slate-600 dark:text-slate-200">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Plan Builder
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black leading-tight bg-gradient-to-r from-[#0f172a] via-[#334155] to-[#2563eb] dark:from-white dark:via-[#c7d2fe] dark:to-[#f472b6] text-transparent bg-clip-text">
                        {isEditing
                            ? "Adjust the active intervention"
                            : isKindergartenFlow
                                ? "Create Kindergarten Qualitative Plan"
                                : "Set up a focused MTSS intervention"}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-200 max-w-2xl">
                        {isEditing
                            ? "Refine method, frequency, strategy, and notes when the current plan needs a better fit."
                            : isKindergartenFlow
                                ? "Build a Learning Story + Signal plan with CORN-aligned support steps, domain tags, and optional AI draft."
                                : "Create a structured intervention with measurable baseline, target, and monitoring cadence."}
                    </p>
                    {isEditing && (
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/60 bg-cyan-50/70 px-3 py-1 text-xs font-semibold text-cyan-700 dark:border-cyan-500/40 dark:bg-cyan-900/30 dark:text-cyan-200">
                            Editing: {editingPlan?.studentName || "Student"} {editingPlan?.focusLabel ? `(${editingPlan.focusLabel})` : ""}
                        </div>
                    )}
                </header>

                {isKindergartenFlow && (
                    <div className="rounded-3xl border border-violet-200/70 dark:border-violet-500/30 bg-violet-50/70 dark:bg-violet-900/15 p-4 space-y-3" data-aos="fade-up" data-aos-delay="80">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-violet-700 dark:text-violet-200">Kindergarten AI Draft</p>
                                <p className="text-xs text-violet-700/80 dark:text-violet-200/80">Use the Kindergarten AI model to prefill a qualitative intervention plan.</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleGenerateKindergartenDraft}
                                disabled={aiLoading || submitting}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-semibold disabled:opacity-60"
                            >
                                {aiLoading ? <KindergartenDraftLoader /> : <Wand2 className="w-4 h-4" />}
                                {aiLoading ? "Drafting..." : "Generate AI Draft"}
                            </button>
                        </div>
                        <textarea
                            value={formState.aiPrompt || ""}
                            onChange={(event) => onChange("aiPrompt", event.target.value)}
                            className={`${textareaClass} min-h-[72px] bg-white/90 dark:bg-slate-900/60 border border-violet-200/60 dark:border-violet-500/30`}
                            placeholder="Optional: describe classroom challenge or weekly objective for AI draft..."
                        />
                        {aiLoading && (
                            <div className="rounded-2xl border border-violet-200/60 dark:border-violet-500/20 bg-white/80 dark:bg-slate-900/35 p-3">
                                <p className="text-xs font-semibold text-violet-700 dark:text-violet-200">Building a classroom-ready Kindergarten draft...</p>
                                <div className="mt-2 space-y-2">
                                    <div className="h-2.5 rounded-full bg-gradient-to-r from-violet-200/80 via-fuchsia-200/80 to-violet-200/80 dark:from-violet-700/40 dark:via-fuchsia-700/40 dark:to-violet-700/40 animate-pulse" />
                                    <div className="h-2.5 rounded-full bg-gradient-to-r from-violet-200/70 via-fuchsia-200/70 to-violet-200/70 dark:from-violet-700/35 dark:via-fuchsia-700/35 dark:to-violet-700/35 animate-pulse" style={{ animationDelay: "120ms" }} />
                                    <div className="h-2.5 w-2/3 rounded-full bg-gradient-to-r from-violet-200/60 via-fuchsia-200/60 to-violet-200/60 dark:from-violet-700/30 dark:via-fuchsia-700/30 dark:to-violet-700/30 animate-pulse" style={{ animationDelay: "220ms" }} />
                                </div>
                            </div>
                        )}
                        {aiError && (
                            <p className="text-xs text-rose-600 dark:text-rose-300">{aiError}</p>
                        )}
                        {aiDraftPreview && (
                            <div className="rounded-2xl bg-white/80 dark:bg-white/5 border border-violet-200/50 dark:border-violet-500/20 p-3 space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">AI Preview</p>
                                    {/* <button
                                        type="button"
                                        onClick={() => setShowRawPreview((prev) => !prev)}
                                        className="text-[11px] font-semibold text-violet-700 dark:text-violet-200 hover:underline"
                                    >
                                        {showRawPreview ? "Hide Raw Output" : "Show Raw Output"}
                                    </button> */}
                                </div>

                                {aiDraftData ? (
                                    <div className="rounded-2xl border border-violet-200/60 dark:border-violet-500/20 bg-white/90 dark:bg-slate-900/40 p-3 space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {(aiDraftData.domainTags || []).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200"
                                                >
                                                    {DOMAIN_LABELS[tag] || normalizeTokenLabel(tag)}
                                                </span>
                                            ))}
                                            {aiDraftData.tier && (
                                                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                                                    {TIER_LABELS[aiDraftData.tier] || normalizeTokenLabel(aiDraftData.tier)}
                                                </span>
                                            )}
                                            {aiDraftData.initialSignal && (
                                                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                                                    Signal: {SIGNAL_LABELS[aiDraftData.initialSignal] || normalizeTokenLabel(aiDraftData.initialSignal)}
                                                </span>
                                            )}
                                            {aiDraftData.weeklyFocus && (
                                                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                                                    Weekly Focus: {WEEKLY_FOCUS_LABELS[aiDraftData.weeklyFocus] || normalizeTokenLabel(aiDraftData.weeklyFocus)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <div className="rounded-xl border border-violet-200/50 dark:border-violet-500/20 bg-white/80 dark:bg-slate-900/35 p-2.5">
                                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Strategy</p>
                                                <p className="text-xs text-slate-700 dark:text-slate-200">{aiDraftData.strategyName || "Not provided"}</p>
                                            </div>
                                            <div className="rounded-xl border border-violet-200/50 dark:border-violet-500/20 bg-white/80 dark:bg-slate-900/35 p-2.5">
                                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Goal</p>
                                                <p className="text-xs text-slate-700 dark:text-slate-200">{aiDraftData.goal || "Not provided"}</p>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-violet-200/50 dark:border-violet-500/20 bg-white/80 dark:bg-slate-900/35 p-2.5">
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Plan Notes</p>
                                            <p className="text-xs text-slate-700 dark:text-slate-200">{aiDraftData.notes || "Not provided"}</p>
                                        </div>

                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <div className="rounded-xl border border-violet-200/50 dark:border-violet-500/20 bg-white/80 dark:bg-slate-900/35 p-2.5">
                                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Monitoring Frequency</p>
                                                <p className="text-xs text-slate-700 dark:text-slate-200">{aiDraftData.monitorFrequency || "Weekly"}</p>
                                            </div>
                                            <div className="rounded-xl border border-violet-200/50 dark:border-violet-500/20 bg-white/80 dark:bg-slate-900/35 p-2.5">
                                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Monitoring Method</p>
                                                <p className="text-xs text-slate-700 dark:text-slate-200">{aiDraftData.monitorMethod || "Option 1 - Direct Observation"}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">CORN Observation Seed</p>
                                            <div className="grid gap-2 sm:grid-cols-2">
                                                {[
                                                    { key: "context", label: "Context" },
                                                    { key: "observation", label: "Observation" },
                                                    { key: "response", label: "Response" },
                                                    { key: "nextStep", label: "Next Step" },
                                                ].map((entry) => (
                                                    <div
                                                        key={entry.key}
                                                        className="rounded-xl border border-violet-200/50 dark:border-violet-500/20 bg-white/80 dark:bg-slate-900/35 p-2.5"
                                                    >
                                                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">{entry.label}</p>
                                                        <p className="text-xs text-slate-700 dark:text-slate-200">
                                                            {aiDraftData[entry.key] || "Not provided"}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-700 dark:text-slate-200">
                                        AI output is available, but no structured draft was applied.
                                    </p>
                                )}

                                {showRawPreview && (
                                    <pre className="text-xs whitespace-pre-wrap text-slate-700 dark:text-slate-200 max-h-44 overflow-y-auto rounded-xl border border-violet-200/50 dark:border-violet-500/20 bg-white/80 dark:bg-slate-900/35 p-2.5">
                                        {aiDraftPreview}
                                    </pre>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <form className="space-y-5" onSubmit={onSubmit}>
                    <InterventionFormFields
                        formState={formState}
                        onChange={onChange}
                        students={students}
                        selectedStudent={selectedStudent}
                        filteredStrategies={filteredStrategies}
                        strategyFallbackActive={strategyFallbackActive}
                        loadingStrategies={loadingStrategies}
                        baseFieldClass={baseFieldClass}
                        textareaClass={textareaClass}
                        onStudentChange={handleStudentChange}
                        onStrategyChange={handleStrategyChange}
                        isEditing={isEditing}
                        isKindergartenFlow={isKindergartenFlow}
                        kindergartenStrategies={kindergartenStrategies}
                        onUseKindergartenStrategy={handleUseKindergartenStrategy}
                        loadingKindergartenStrategies={loadingKindergartenBank}
                    />

                    <div className="flex flex-wrap gap-3 pt-3" data-aos="fade-up" data-aos-delay="260">
                        <button
                            type="submit"
                            disabled={!isValid || submitting}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-[#22d3ee] via-[#3b82f6] to-[#a855f7] text-white font-semibold shadow-[0_18px_45px_rgba(59,130,246,0.3)] transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {submitting
                                ? "Saving..."
                                : isEditing
                                    ? "Update Intervention Plan"
                                    : isKindergartenFlow
                                        ? "Save Kindergarten Plan"
                                        : "Save Intervention Plan"}
                        </button>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={onCancelEdit}
                                disabled={submitting}
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/80 dark:bg-white/10 border border-white/60 dark:border-white/15 text-slate-700 dark:text-slate-200 font-semibold transition hover:-translate-y-0.5 disabled:opacity-60"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </section>
    );
});

InterventionFormPanel.displayName = "InterventionFormPanel";
export default InterventionFormPanel;
