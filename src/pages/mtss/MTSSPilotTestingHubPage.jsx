import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    ArrowRight,
    Bot,
    CheckCircle2,
    ClipboardCheck,
    Copy,
    Download,
    Flag,
    Gauge,
    Lightbulb,
    ListChecks,
    MessageSquareText,
    RotateCcw,
    Sparkles,
    Target,
    TimerReset,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { cn, sanitizeLight } from "@/lib/utils";
import { upsertPilotFeedbackSession } from "@/services/mtssService";
import {
    PILOT_PROGRESS_STORAGE_KEY,
    aiTipsAndTricks,
    buildPilotStepRoute,
    createEmptyFinalFeedback,
    createEmptyStepFeedback,
    pilotFeatureCoverage,
    principalBriefingChecklist,
    pilotSteps,
    ratingOptions,
    readinessOptions,
    severityOptions,
    stepCompletionOptions,
} from "./data/pilotTestingScenario";

const buildPilotStorageKey = (user) => {
    const email = String(user?.email || "anonymous").trim().toLowerCase();
    return `${PILOT_PROGRESS_STORAGE_KEY}:${email || "anonymous"}`;
};

const createPilotSessionKey = (user) => {
    const emailSeed = String(user?.email || "principal")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
        .slice(0, 40) || "principal";

    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return `${emailSeed}-${crypto.randomUUID()}`;
    }

    return `${emailSeed}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const readStoredPilotState = (user) => {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const scopedRaw = window.localStorage.getItem(buildPilotStorageKey(user));
        if (scopedRaw) {
            return JSON.parse(scopedRaw);
        }

        const legacyRaw = window.localStorage.getItem(PILOT_PROGRESS_STORAGE_KEY);
        if (!legacyRaw) {
            return null;
        }

        const parsedLegacy = JSON.parse(legacyRaw);
        const legacyEmail = String(parsedLegacy?.tester?.email || "").trim().toLowerCase();
        const currentEmail = String(user?.email || "").trim().toLowerCase();
        if (!legacyEmail || !currentEmail || legacyEmail === currentEmail) {
            return parsedLegacy;
        }
        return null;
    } catch {
        return null;
    }
};

const clampRating = (value, fallback = 4) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(1, Math.min(5, parsed)) : fallback;
};

const sanitizeFeedbackDraft = (draft = {}) => ({
    completionStatus: stepCompletionOptions.some((option) => option.value === draft.completionStatus)
        ? draft.completionStatus
        : "yes",
    easeOfUse: clampRating(draft.easeOfUse, 4),
    clarity: clampRating(draft.clarity, 4),
    performance: clampRating(draft.performance, 4),
    helpfulNotes: sanitizeLight(draft.helpfulNotes || "", 1200),
    confusingNotes: sanitizeLight(draft.confusingNotes || "", 1200),
    partialReason: sanitizeLight(draft.partialReason || "", 1200),
    bugFound: Boolean(draft.bugFound),
    bugSummary: sanitizeLight(draft.bugSummary || "", 1200),
    expectedResult: sanitizeLight(draft.expectedResult || "", 1200),
    reproductionSteps: sanitizeLight(draft.reproductionSteps || "", 1200),
    bugSeverity: severityOptions.some((option) => option.value === draft.bugSeverity) ? draft.bugSeverity : "medium",
    screenshotLink: sanitizeLight(draft.screenshotLink || "", 800),
});

const sanitizeFinalDraft = (draft = {}) => ({
    overallConfidence: clampRating(draft.overallConfidence, 4),
    mostUsefulFeature: sanitizeLight(draft.mostUsefulFeature || "", 1200),
    mostConfusingFeature: sanitizeLight(draft.mostConfusingFeature || "", 1200),
    slowestPart: sanitizeLight(draft.slowestPart || "", 1200),
    missingFeature: sanitizeLight(draft.missingFeature || "", 1200),
    readiness: readinessOptions.some((option) => option.value === draft.readiness) ? draft.readiness : "not-yet",
    topImprovements: sanitizeLight(draft.topImprovements || "", 1600),
    additionalComments: sanitizeLight(draft.additionalComments || "", 1600),
});

const hydratePilotState = (user) => {
    const stored = readStoredPilotState(user);
    const feedbackByStep = Object.fromEntries(
        pilotSteps.map((step) => [
            step.id,
            sanitizeFeedbackDraft(stored?.feedbackByStep?.[step.id] || createEmptyStepFeedback()),
        ]),
    );

    return {
        sessionKey: stored?.sessionKey || createPilotSessionKey(user),
        completedSteps: stored?.completedSteps || {},
        feedbackByStep,
        finalFeedback: sanitizeFinalDraft(stored?.finalFeedback || createEmptyFinalFeedback()),
        finalFeedbackSavedAt: stored?.finalFeedbackSavedAt || null,
        tester: {
            name: user?.name || user?.nickname || "",
            email: user?.email || "",
            role: user?.role || "",
            unit: user?.unit || user?.department || "",
        },
        lastUpdatedAt: stored?.lastUpdatedAt || null,
    };
};

const savePilotState = (user, state) => {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(
            buildPilotStorageKey(user),
            JSON.stringify(state),
        );
    } catch {
        // Ignore storage errors for lightweight pilot tracking.
    }
};

const withTimestamp = (state) => ({
    ...state,
    lastUpdatedAt: new Date().toISOString(),
});

const hasMeaningfulPilotState = (state = {}) => {
    const hasCompletedSteps = Object.values(state.completedSteps || {}).some(Boolean);
    const hasStepNotes = Object.values(state.feedbackByStep || {}).some((entry) =>
        Boolean(entry?.helpfulNotes || entry?.confusingNotes || entry?.partialReason || entry?.bugFound),
    );
    const hasFinalNotes = Boolean(
        state.finalFeedback?.mostUsefulFeature
        || state.finalFeedback?.mostConfusingFeature
        || state.finalFeedback?.slowestPart
        || state.finalFeedback?.missingFeature
        || state.finalFeedback?.topImprovements
        || state.finalFeedback?.additionalComments
        || state.finalFeedbackSavedAt,
    );

    return Boolean(state.lastUpdatedAt || hasCompletedSteps || hasStepNotes || hasFinalNotes);
};

const formatRole = (value = "") =>
    value
        .toString()
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

const formatFeatureKey = (value = "") =>
    value
        .toString()
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

const ratingLabels = {
    1: "Very hard",
    2: "Needs work",
    3: "Okay",
    4: "Clear",
    5: "Excellent",
};

const readinessLabels = {
    yes: "Yes",
    almost: "Almost",
    "not-yet": "Not yet",
};

const StepRatingField = ({ label, value, onChange }) => (
    <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700 dark:text-white">{label}</Label>
        <div className="grid grid-cols-5 gap-2">
            {ratingOptions.map((option) => {
                const selected = option === value;
                return (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onChange(option)}
                        className={cn(
                            "rounded-2xl border px-3 py-2 text-sm font-semibold transition",
                            selected
                                ? "border-transparent bg-gradient-to-r from-[#fb7185] via-[#f59e0b] to-[#22c55e] text-white shadow-lg"
                                : "border-white/40 bg-white/80 text-slate-700 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
                        )}
                    >
                        {option}
                    </button>
                );
            })}
        </div>
        <p className="text-xs text-slate-500 dark:text-white/60">{ratingLabels[value] || "Select a rating"}</p>
    </div>
);

const StepFeedbackDialog = ({
    open,
    onOpenChange,
    step,
    value,
    onChange,
    onSave,
}) => {
    if (!step) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto rounded-[28px] border-white/20 bg-white/95 dark:bg-slate-950/95">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
                        Step {step.order} Feedback
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-600 dark:text-white/70">
                        {step.title} — share clarity, usability, speed, and any bug you noticed in this step.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="rounded-[24px] border border-white/40 bg-gradient-to-br from-[#fff7ed]/90 via-white to-[#eff6ff]/90 p-5 dark:border-white/10 dark:from-white/5 dark:via-white/10 dark:to-white/5">
                        <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500 dark:text-white/55">Expected outcome</p>
                        <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-white/80">{step.expectedOutcome}</p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor={`completion-status-${step.id}`} className="text-sm font-semibold text-slate-700 dark:text-white">
                                Step completed
                            </Label>
                            <select
                                id={`completion-status-${step.id}`}
                                className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                value={value.completionStatus}
                                onChange={(event) => onChange({ ...value, completionStatus: event.target.value })}
                            >
                                {stepCompletionOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={`bug-severity-${step.id}`} className="text-sm font-semibold text-slate-700 dark:text-white">
                                Bug severity
                            </Label>
                            <select
                                id={`bug-severity-${step.id}`}
                                className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                value={value.bugSeverity}
                                onChange={(event) => onChange({ ...value, bugSeverity: event.target.value })}
                                disabled={!value.bugFound}
                            >
                                {severityOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                        <StepRatingField
                            label="Ease of use"
                            value={value.easeOfUse}
                            onChange={(nextValue) => onChange({ ...value, easeOfUse: nextValue })}
                        />
                        <StepRatingField
                            label="Clarity"
                            value={value.clarity}
                            onChange={(nextValue) => onChange({ ...value, clarity: nextValue })}
                        />
                        <StepRatingField
                            label="Speed / performance"
                            value={value.performance}
                            onChange={(nextValue) => onChange({ ...value, performance: nextValue })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`helpful-${step.id}`} className="text-sm font-semibold text-slate-700 dark:text-white">
                            What was most helpful in this step?
                        </Label>
                        <Textarea
                            id={`helpful-${step.id}`}
                            value={value.helpfulNotes}
                            onChange={(event) => onChange({ ...value, helpfulNotes: event.target.value })}
                            className="min-h-[108px] rounded-2xl border-white/40 bg-white/80 dark:border-white/10 dark:bg-white/5"
                            placeholder="Example: The tier summary made it easy to spot which area needed attention first."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`confusing-${step.id}`} className="text-sm font-semibold text-slate-700 dark:text-white">
                            What felt confusing, unclear, or missing?
                        </Label>
                        <Textarea
                            id={`confusing-${step.id}`}
                            value={value.confusingNotes}
                            onChange={(event) => onChange({ ...value, confusingNotes: event.target.value })}
                            className="min-h-[108px] rounded-2xl border-white/40 bg-white/80 dark:border-white/10 dark:bg-white/5"
                            placeholder="Example: I was not sure what the metric means or what action should happen next."
                        />
                    </div>

                    {(value.completionStatus === "partial" || value.completionStatus === "no") && (
                        <div className="space-y-2">
                            <Label htmlFor={`partial-reason-${step.id}`} className="text-sm font-semibold text-slate-700 dark:text-white">
                                If this step failed or was partial, why?
                            </Label>
                            <Textarea
                                id={`partial-reason-${step.id}`}
                                value={value.partialReason}
                                onChange={(event) => onChange({ ...value, partialReason: event.target.value })}
                                className="min-h-[96px] rounded-2xl border-white/40 bg-white/80 dark:border-white/10 dark:bg-white/5"
                                placeholder="Explain what blocked completion: permission, data, unclear flow, bug, or time."
                            />
                        </div>
                    )}

                    <div className="rounded-[24px] border border-dashed border-rose-200 bg-rose-50/80 p-4 dark:border-rose-400/30 dark:bg-rose-500/10">
                        <label className="flex items-center gap-3 text-sm font-semibold text-slate-800 dark:text-white">
                            <input
                                type="checkbox"
                                checked={value.bugFound}
                                onChange={(event) =>
                                    onChange({
                                        ...value,
                                        bugFound: event.target.checked,
                                    })
                                }
                                className="h-4 w-4 rounded border-slate-300"
                            />
                            I found a bug or broken behavior in this step
                        </label>

                        {value.bugFound && (
                            <div className="mt-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`bug-summary-${step.id}`} className="text-sm font-semibold text-slate-700 dark:text-white">
                                        Bug summary
                                    </Label>
                                    <Textarea
                                        id={`bug-summary-${step.id}`}
                                        value={value.bugSummary}
                                        onChange={(event) => onChange({ ...value, bugSummary: event.target.value })}
                                        className="min-h-[96px] rounded-2xl border-white/40 bg-white/80 dark:border-white/10 dark:bg-white/5"
                                        placeholder="Describe what happened, what you expected, and how to reproduce it."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`expected-result-${step.id}`} className="text-sm font-semibold text-slate-700 dark:text-white">
                                        Expected result
                                    </Label>
                                    <Textarea
                                        id={`expected-result-${step.id}`}
                                        value={value.expectedResult}
                                        onChange={(event) => onChange({ ...value, expectedResult: event.target.value })}
                                        className="min-h-[84px] rounded-2xl border-white/40 bg-white/80 dark:border-white/10 dark:bg-white/5"
                                        placeholder="What should have happened if the flow worked correctly?"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`reproduction-${step.id}`} className="text-sm font-semibold text-slate-700 dark:text-white">
                                        Reproduction steps
                                    </Label>
                                    <Textarea
                                        id={`reproduction-${step.id}`}
                                        value={value.reproductionSteps}
                                        onChange={(event) => onChange({ ...value, reproductionSteps: event.target.value })}
                                        className="min-h-[84px] rounded-2xl border-white/40 bg-white/80 dark:border-white/10 dark:bg-white/5"
                                        placeholder="List short steps so the MTSS team can reproduce the issue."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`bug-shot-${step.id}`} className="text-sm font-semibold text-slate-700 dark:text-white">
                                        Screenshot / video link
                                    </Label>
                                    <Input
                                        id={`bug-shot-${step.id}`}
                                        value={value.screenshotLink}
                                        onChange={(event) => onChange({ ...value, screenshotLink: event.target.value })}
                                        className="rounded-2xl border-white/40 bg-white/80 dark:border-white/10 dark:bg-white/5"
                                        placeholder="Paste a drive link or screenshot URL if available"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2 pt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button variant="gradient" onClick={onSave}>
                        Save step feedback
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const FinalFeedbackDialog = ({ open, onOpenChange, value, onChange, onSave }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto rounded-[28px] border-white/20 bg-white/95 dark:bg-slate-950/95">
            <DialogHeader>
                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">Final Feedback</DialogTitle>
                <DialogDescription className="text-sm text-slate-600 dark:text-white/70">
                    Capture the overall readiness, biggest usability insights, and top priorities before the pilot closes.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
                <StepRatingField
                    label="Overall confidence using MTSS"
                    value={value.overallConfidence}
                    onChange={(nextValue) => onChange({ ...value, overallConfidence: nextValue })}
                />

                <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="most-useful-feature" className="text-sm font-semibold text-slate-700 dark:text-white">
                            Most useful feature
                        </Label>
                        <Textarea
                            id="most-useful-feature"
                            value={value.mostUsefulFeature}
                            onChange={(event) => onChange({ ...value, mostUsefulFeature: event.target.value })}
                            className="min-h-[108px] rounded-2xl border-white/40 bg-white/80 dark:border-white/10 dark:bg-white/5"
                            placeholder="What helped you most during the pilot?"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="most-confusing-feature" className="text-sm font-semibold text-slate-700 dark:text-white">
                            Most confusing feature
                        </Label>
                        <Textarea
                            id="most-confusing-feature"
                            value={value.mostConfusingFeature}
                            onChange={(event) => onChange({ ...value, mostConfusingFeature: event.target.value })}
                            className="min-h-[108px] rounded-2xl border-white/40 bg-white/80 dark:border-white/10 dark:bg-white/5"
                            placeholder="What still feels unclear or needs simplification?"
                        />
                    </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="slowest-part" className="text-sm font-semibold text-slate-700 dark:text-white">
                            Slowest or heaviest part
                        </Label>
                        <Textarea
                            id="slowest-part"
                            value={value.slowestPart}
                            onChange={(event) => onChange({ ...value, slowestPart: event.target.value })}
                            className="min-h-[108px] rounded-2xl border-white/40 bg-white/80 dark:border-white/10 dark:bg-white/5"
                            placeholder="Which part felt slow or interrupted your flow?"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="missing-feature" className="text-sm font-semibold text-slate-700 dark:text-white">
                            Missing feature
                        </Label>
                        <Textarea
                            id="missing-feature"
                            value={value.missingFeature}
                            onChange={(event) => onChange({ ...value, missingFeature: event.target.value })}
                            className="min-h-[108px] rounded-2xl border-white/40 bg-white/80 dark:border-white/10 dark:bg-white/5"
                            placeholder="What capability would make MTSS more useful for principals?"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="readiness-select" className="text-sm font-semibold text-slate-700 dark:text-white">
                        Is MTSS ready for wider principal usage next week?
                    </Label>
                    <select
                        id="readiness-select"
                        className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        value={value.readiness}
                        onChange={(event) => onChange({ ...value, readiness: event.target.value })}
                    >
                        {readinessOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="top-improvements" className="text-sm font-semibold text-slate-700 dark:text-white">
                        Top 3 improvement priorities
                    </Label>
                    <Textarea
                        id="top-improvements"
                        value={value.topImprovements}
                        onChange={(event) => onChange({ ...value, topImprovements: event.target.value })}
                        className="min-h-[120px] rounded-2xl border-white/40 bg-white/80 dark:border-white/10 dark:bg-white/5"
                        placeholder={"1. ...\n2. ...\n3. ..."}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="additional-comments" className="text-sm font-semibold text-slate-700 dark:text-white">
                        Additional comments
                    </Label>
                    <Textarea
                        id="additional-comments"
                        value={value.additionalComments}
                        onChange={(event) => onChange({ ...value, additionalComments: event.target.value })}
                        className="min-h-[120px] rounded-2xl border-white/40 bg-white/80 dark:border-white/10 dark:bg-white/5"
                        placeholder="Anything else the MTSS team should know before broader rollout?"
                    />
                </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Close
                </Button>
                <Button variant="gradient" onClick={onSave}>
                    Save final feedback
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

const buildFeedbackExport = ({
    user,
    sessionKey,
    stepFeedback,
    finalFeedback,
    completedSteps,
    updatedAt,
    finalFeedbackSavedAt,
    lastViewedRoute,
    source,
}) => ({
    exportedAt: new Date().toISOString(),
    sessionKey,
    scenarioKey: "mtss-principal-pilot",
    lastUpdatedAt: updatedAt,
    finalFeedbackSavedAt: finalFeedbackSavedAt || null,
    tester: {
        name: user?.name || user?.nickname || "",
        email: user?.email || "",
        role: user?.role || "",
        unit: user?.unit || user?.department || "",
    },
    completedSteps,
    stepFeedback: pilotSteps.map((step) => ({
        id: step.id,
        title: step.title,
        order: step.order,
        duration: step.duration,
        completed: Boolean(completedSteps?.[step.id]),
        feedback: stepFeedback[step.id],
    })),
    finalFeedback,
    lastViewedRoute: lastViewedRoute || (typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/mtss/pilot-testing"),
    source: source || {
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    },
});

const buildMarkdownSummary = ({ user, sessionKey, stepFeedback, finalFeedback, completedSteps, updatedAt, finalFeedbackSavedAt }) => {
    const lines = [
        "# MTSS Principal Pilot Feedback Summary",
        "",
        `- Session key: ${sessionKey || "-"}`,
        `- Exported at: ${new Date().toLocaleString()}`,
        `- Last updated: ${updatedAt ? new Date(updatedAt).toLocaleString() : "Not saved yet"}`,
        `- Final feedback saved at: ${finalFeedbackSavedAt ? new Date(finalFeedbackSavedAt).toLocaleString() : "Not submitted yet"}`,
        `- Tester: ${user?.name || user?.nickname || "-"}`,
        `- Email: ${user?.email || "-"}`,
        `- Role: ${formatRole(user?.role || "-")}`,
        `- Unit: ${user?.unit || user?.department || "-"}`,
        "",
        "## Step Feedback",
        "",
    ];

    pilotSteps.forEach((step) => {
        const feedback = stepFeedback[step.id];
        lines.push(`### Step ${step.order} — ${step.title}`);
        lines.push(`- Completed in hub: ${completedSteps?.[step.id] ? "Yes" : "No"}`);
        lines.push(`- Completion status: ${feedback.completionStatus}`);
        lines.push(`- Ease of use: ${feedback.easeOfUse}/5`);
        lines.push(`- Clarity: ${feedback.clarity}/5`);
        lines.push(`- Performance: ${feedback.performance}/5`);
        lines.push(`- Helpful notes: ${feedback.helpfulNotes || "-"}`);
        lines.push(`- Confusing notes: ${feedback.confusingNotes || "-"}`);
        lines.push(`- Partial or failed reason: ${feedback.partialReason || "-"}`);
        lines.push(`- Bug found: ${feedback.bugFound ? "Yes" : "No"}`);
        if (feedback.bugFound) {
            lines.push(`- Bug severity: ${feedback.bugSeverity}`);
            lines.push(`- Bug summary: ${feedback.bugSummary || "-"}`);
            lines.push(`- Expected result: ${feedback.expectedResult || "-"}`);
            lines.push(`- Reproduction steps: ${feedback.reproductionSteps || "-"}`);
            lines.push(`- Screenshot link: ${feedback.screenshotLink || "-"}`);
        }
        lines.push("");
    });

    lines.push("## Final Feedback");
    lines.push("");
    lines.push(`- Overall confidence: ${finalFeedback.overallConfidence}/5`);
    lines.push(`- Most useful feature: ${finalFeedback.mostUsefulFeature || "-"}`);
    lines.push(`- Most confusing feature: ${finalFeedback.mostConfusingFeature || "-"}`);
    lines.push(`- Slowest part: ${finalFeedback.slowestPart || "-"}`);
    lines.push(`- Missing feature: ${finalFeedback.missingFeature || "-"}`);
    lines.push(`- Readiness: ${readinessLabels[finalFeedback.readiness] || finalFeedback.readiness}`);
    lines.push(`- Top improvements: ${finalFeedback.topImprovements || "-"}`);
    lines.push(`- Additional comments: ${finalFeedback.additionalComments || "-"}`);

    return lines.join("\n");
};

const MTSSPilotTestingHubPage = memo(() => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const user = useSelector((state) => state.auth?.user);
    const [pilotState, setPilotState] = useState(() => hydratePilotState(user));
    const [activeStepId, setActiveStepId] = useState(null);
    const [finalFeedbackOpen, setFinalFeedbackOpen] = useState(false);
    const [syncState, setSyncState] = useState({
        status: "idle",
        lastSyncedAt: null,
        error: null,
    });

    useEffect(() => {
        setPilotState((previous) => {
            const nextState = hydratePilotState(user);
            const previousTesterEmail = String(previous?.tester?.email || "").trim().toLowerCase();
            const currentTesterEmail = String(user?.email || "").trim().toLowerCase();
            if (previousTesterEmail && currentTesterEmail && previousTesterEmail !== currentTesterEmail) {
                return nextState;
            }
            return {
                ...nextState,
                completedSteps: previous?.completedSteps || nextState.completedSteps,
                feedbackByStep: previous?.feedbackByStep || nextState.feedbackByStep,
                finalFeedback: previous?.finalFeedback || nextState.finalFeedback,
                finalFeedbackSavedAt: previous?.finalFeedbackSavedAt || nextState.finalFeedbackSavedAt,
                lastUpdatedAt: previous?.lastUpdatedAt || nextState.lastUpdatedAt,
            };
        });
        setSyncState({
            status: "idle",
            lastSyncedAt: null,
            error: null,
        });
    }, [user]);

    useEffect(() => {
        savePilotState(user, pilotState);
    }, [pilotState, user]);

    const completedCount = useMemo(
        () => pilotSteps.filter((step) => pilotState.completedSteps?.[step.id]).length,
        [pilotState.completedSteps],
    );
    const completionRate = Math.round((completedCount / pilotSteps.length) * 100);
    const activeStep = activeStepId ? pilotSteps.find((step) => step.id === activeStepId) : null;
    const feedbackCount = useMemo(
        () => pilotSteps.filter((step) => {
            const draft = pilotState.feedbackByStep?.[step.id];
            return Boolean(draft?.helpfulNotes || draft?.confusingNotes || draft?.bugFound || pilotState.completedSteps?.[step.id]);
        }).length,
        [pilotState.completedSteps, pilotState.feedbackByStep],
    );

    useEffect(() => {
        if (!user?.email || !pilotState?.sessionKey || !hasMeaningfulPilotState(pilotState)) {
            return undefined;
        }

        setSyncState((prev) => ({
            ...prev,
            status: prev.status === "synced" ? "synced" : "pending",
            error: null,
        }));

        const timeoutId = window.setTimeout(async () => {
            try {
                setSyncState((prev) => ({
                    ...prev,
                    status: "syncing",
                    error: null,
                }));

                const response = await upsertPilotFeedbackSession(
                    buildFeedbackExport({
                        user,
                        sessionKey: pilotState.sessionKey,
                        stepFeedback: pilotState.feedbackByStep,
                        finalFeedback: pilotState.finalFeedback,
                        completedSteps: pilotState.completedSteps,
                        updatedAt: pilotState.lastUpdatedAt,
                        finalFeedbackSavedAt: pilotState.finalFeedbackSavedAt,
                    }),
                );

                const lastSyncedAt = response?.session?.updatedAt
                    || response?.session?.clientUpdatedAt
                    || new Date().toISOString();

                setSyncState({
                    status: "synced",
                    lastSyncedAt,
                    error: null,
                });
            } catch (error) {
                setSyncState((prev) => ({
                    status: "error",
                    lastSyncedAt: prev.lastSyncedAt,
                    error: error?.response?.data?.message || error?.message || "Failed to sync pilot feedback.",
                }));
            }
        }, 900);

        return () => window.clearTimeout(timeoutId);
    }, [pilotState, user]);

    const updateStepFeedback = useCallback((stepId, nextValue) => {
        setPilotState((prev) =>
            withTimestamp({
                ...prev,
                feedbackByStep: {
                    ...prev.feedbackByStep,
                    [stepId]: nextValue,
                },
            }),
        );
    }, []);

    const handleStartStep = useCallback((step) => {
        const route = buildPilotStepRoute(step, user);
        if (route === "/mtss/pilot-testing") {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        navigate(route);
    }, [navigate, user]);

    const handleMarkComplete = useCallback((stepId) => {
        setPilotState((prev) =>
            withTimestamp({
                ...prev,
                completedSteps: {
                    ...prev.completedSteps,
                    [stepId]: !prev.completedSteps?.[stepId],
                },
            }),
        );
    }, []);

    const handleSaveStepFeedback = useCallback(() => {
        if (!activeStep) return;

        setPilotState((prev) => {
            const draft = sanitizeFeedbackDraft(prev.feedbackByStep?.[activeStep.id]);
            return withTimestamp({
                ...prev,
                feedbackByStep: {
                    ...prev.feedbackByStep,
                    [activeStep.id]: draft,
                },
                completedSteps: {
                    ...prev.completedSteps,
                    [activeStep.id]: draft.completionStatus !== "no" || prev.completedSteps?.[activeStep.id],
                },
            });
        });
        setActiveStepId(null);
        toast({
            title: "Step feedback saved",
            description: `${activeStep.title} is now recorded in the pilot hub.`,
        });
    }, [activeStep, toast]);

    const handleSaveFinalFeedback = useCallback(() => {
        const savedAt = new Date().toISOString();
        setPilotState((prev) =>
            ({
                ...prev,
                finalFeedback: sanitizeFinalDraft(prev.finalFeedback),
                finalFeedbackSavedAt: savedAt,
                lastUpdatedAt: savedAt,
            }),
        );
        setFinalFeedbackOpen(false);
        toast({
            title: "Final feedback saved",
            description: "Your pilot summary is saved and will sync to the review dashboard automatically.",
        });
    }, [toast]);

    const handleCopySummary = useCallback(async () => {
        const summary = buildMarkdownSummary({
            user,
            sessionKey: pilotState.sessionKey,
            stepFeedback: pilotState.feedbackByStep,
            finalFeedback: pilotState.finalFeedback,
            completedSteps: pilotState.completedSteps,
            updatedAt: pilotState.lastUpdatedAt,
            finalFeedbackSavedAt: pilotState.finalFeedbackSavedAt,
        });

        try {
            await navigator.clipboard.writeText(summary);
            toast({
                title: "Summary copied",
                description: "The pilot feedback summary is now in your clipboard.",
            });
        } catch {
            toast({
                title: "Copy failed",
                description: "Please try again or use the JSON download instead.",
                variant: "destructive",
            });
        }
    }, [
        pilotState.completedSteps,
        pilotState.feedbackByStep,
        pilotState.finalFeedback,
        pilotState.lastUpdatedAt,
        pilotState.finalFeedbackSavedAt,
        pilotState.sessionKey,
        toast,
        user,
    ]);

    const handleDownloadJson = useCallback(() => {
        const payload = buildFeedbackExport({
            user,
            sessionKey: pilotState.sessionKey,
            stepFeedback: pilotState.feedbackByStep,
            finalFeedback: pilotState.finalFeedback,
            completedSteps: pilotState.completedSteps,
            updatedAt: pilotState.lastUpdatedAt,
            finalFeedbackSavedAt: pilotState.finalFeedbackSavedAt,
        });

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `mtss-pilot-feedback-${new Date().toISOString().slice(0, 10)}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
        toast({
            title: "JSON downloaded",
            description: "Pilot feedback export is ready to share with the MTSS team.",
        });
    }, [pilotState.completedSteps, pilotState.feedbackByStep, pilotState.finalFeedback, pilotState.lastUpdatedAt, pilotState.finalFeedbackSavedAt, pilotState.sessionKey, toast, user]);

    const handleResetPilot = useCallback(() => {
        if (typeof window !== "undefined") {
            window.localStorage.removeItem(buildPilotStorageKey(user));
            window.localStorage.removeItem(PILOT_PROGRESS_STORAGE_KEY);
        }
        const nextState = hydratePilotState(user);
        setPilotState(nextState);
        setSyncState({
            status: "idle",
            lastSyncedAt: null,
            error: null,
        });
        toast({
            title: "Pilot progress reset",
            description: "All saved step feedback and completion markers have been cleared.",
        });
    }, [toast, user]);

    return (
        <div className="mtss-theme mtss-animated-bg min-h-screen relative overflow-hidden text-foreground dark:text-white">
            <div className="mtss-bg-overlay" />
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 left-[5%] h-[26rem] w-[26rem] rounded-full bg-[#f472b6]/25 blur-[120px]" />
                <div className="absolute top-[10%] right-[8%] h-[24rem] w-[24rem] rounded-full bg-[#7c3aed]/25 blur-[120px]" />
                <div className="absolute bottom-[0%] left-[30%] h-[22rem] w-[22rem] rounded-full bg-[#22d3ee]/20 blur-[110px]" />
            </div>

            <div className="relative z-20 container-tight px-4 sm:px-6 py-8 lg:py-12 space-y-8">
                <section className="rounded-[36px] border border-white/35 bg-gradient-to-br from-[#fff7ed]/92 via-[#fdf4ff]/90 to-[#eff6ff]/92 p-6 shadow-[0_35px_120px_rgba(15,23,42,0.22)] dark:border-white/10 dark:from-[#180d2f]/92 dark:via-[#0f1730]/90 dark:to-[#08243b]/90">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-3xl space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-slate-700 shadow-lg dark:border-white/15 dark:bg-white/10 dark:text-white/85">
                                <ClipboardCheck className="h-4 w-4 text-rose-500" />
                                MTSS Pilot Testing Hub
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                                    Guided testing for principals,
                                    <span className="block bg-gradient-to-r from-[#ec4899] via-[#f59e0b] to-[#22c55e] bg-clip-text text-transparent">
                                        with structured feedback built in
                                    </span>
                                </h1>
                                <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-white/70 sm:text-base">
                                    Use this hub to run a comprehensive 50–60 minute MTSS pilot covering the full workflow — from mentor
                                    assignment and intervention creation to AI-powered insights and analytics. Each step tells principals
                                    what to test, where to go, what success looks like, and how to submit feedback.
                                </p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-[24px] border border-white/50 bg-white/80 p-4 shadow-lg dark:border-white/10 dark:bg-white/5">
                                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500 dark:text-white/55">Time box</p>
                                    <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">50–60 min</p>
                                </div>
                                <div className="rounded-[24px] border border-white/50 bg-white/80 p-4 shadow-lg dark:border-white/10 dark:bg-white/5">
                                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500 dark:text-white/55">Guided steps</p>
                                    <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{pilotSteps.length} checkpoints</p>
                                </div>
                                <div className="rounded-[24px] border border-white/50 bg-white/80 p-4 shadow-lg dark:border-white/10 dark:bg-white/5">
                                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500 dark:text-white/55">Feedback mode</p>
                                    <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">In-app and exportable</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full max-w-md rounded-[32px] border border-white/55 bg-white/85 p-5 shadow-[0_25px_80px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-white/5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500 dark:text-white/55">
                                        Pilot progress
                                    </p>
                                    <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                                        {completedCount} / {pilotSteps.length} steps completed
                                    </p>
                                </div>
                                <Badge className="rounded-full border-0 bg-gradient-to-r from-[#fb7185] via-[#f59e0b] to-[#22c55e] px-3 py-1 text-white">
                                    {completionRate}%
                                </Badge>
                            </div>

                            <Progress value={completionRate} className="mt-4 h-3 rounded-full bg-slate-200/70 dark:bg-white/10" />

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-white/50 bg-white/75 p-4 dark:border-white/10 dark:bg-white/5">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-white/55">Feedback saved</p>
                                    <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">{feedbackCount}</p>
                                </div>
                                <div className="rounded-2xl border border-white/50 bg-white/75 p-4 dark:border-white/10 dark:bg-white/5">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-white/55">Tester</p>
                                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{user?.name || user?.nickname || "Current user"}</p>
                                    <p className="text-xs text-slate-500 dark:text-white/55">{formatRole(user?.role || "principal")}</p>
                                </div>
                            </div>

                            <div className="mt-4 rounded-2xl border border-white/50 bg-white/75 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                                    <div>
                                        <p className="font-semibold text-slate-700 dark:text-white">
                                            Review sync:{" "}
                                            <span
                                                className={cn(
                                                    syncState.status === "error"
                                                        ? "text-rose-600 dark:text-rose-300"
                                                        : syncState.status === "synced"
                                                            ? "text-emerald-600 dark:text-emerald-300"
                                                            : "text-amber-600 dark:text-amber-300",
                                                )}
                                            >
                                                {syncState.status === "syncing"
                                                    ? "syncing now"
                                                    : syncState.status === "synced"
                                                        ? "live in admin review"
                                                        : syncState.status === "error"
                                                            ? "sync issue"
                                                            : "waiting for first change"}
                                            </span>
                                        </p>
                                        <p className="mt-1 text-slate-500 dark:text-white/55">
                                            {syncState.lastSyncedAt
                                                ? `Last synced: ${new Date(syncState.lastSyncedAt).toLocaleString()}`
                                                : "Your testing notes stay in this browser and sync automatically after changes."}
                                        </p>
                                    </div>
                                    {syncState.error ? (
                                        <span className="max-w-[18rem] text-right text-rose-600 dark:text-rose-300">{syncState.error}</span>
                                    ) : null}
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <Button variant="gradient" onClick={() => setFinalFeedbackOpen(true)}>
                                    <MessageSquareText className="mr-2 h-4 w-4" />
                                    Final feedback
                                </Button>
                                <Button variant="glass" onClick={handleCopySummary}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy summary
                                </Button>
                                <Button variant="glass" onClick={handleDownloadJson}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download JSON
                                </Button>
                                <Button variant="outline" onClick={handleResetPilot}>
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
                    <div className="rounded-[32px] border border-white/35 bg-white/85 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.15)] dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-gradient-to-br from-[#f97316] via-[#ec4899] to-[#6366f1] p-3 text-white shadow-lg">
                                <ListChecks className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500 dark:text-white/55">How principals should run the pilot</p>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Simple, guided, and hard to miss features</h2>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            {[
                                {
                                    icon: Target,
                                    title: "Follow the order",
                                    text: "Complete each step in sequence so no feature is skipped and the feedback stays comparable across principals.",
                                },
                                {
                                    icon: Gauge,
                                    title: "Submit micro feedback after each step",
                                    text: "Capture fresh impressions on usability, clarity, and speed while the experience is still recent.",
                                },
                                {
                                    icon: Sparkles,
                                    title: "Use the expected outcome as a success check",
                                    text: "If the outcome feels unclear, that itself is valuable feedback for the rollout team.",
                                },
                                {
                                    icon: TimerReset,
                                    title: "Finish with one final summary",
                                    text: "The final feedback should highlight readiness, biggest blockers, and top improvement priorities.",
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="rounded-[24px] border border-white/45 bg-gradient-to-br from-[#fff7ed]/70 via-white to-[#eff6ff]/70 p-5 dark:border-white/10 dark:from-white/5 dark:via-white/10 dark:to-white/5"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-slate-900 p-2 text-white dark:bg-white/10">
                                            <item.icon className="h-4 w-4" />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-700 dark:text-white/85">{item.title}</h3>
                                    </div>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-white/70">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[32px] border border-white/35 bg-white/85 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.15)] dark:border-white/10 dark:bg-white/5">
                        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500 dark:text-white/55">Feedback flow</p>
                        <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">When and how feedback should be submitted</h2>
                        <div className="mt-5 space-y-4">
                            {[
                                "Open a step from the Testing Hub using Start Step.",
                                "Complete the activity in MTSS, then return to this hub.",
                                "Save short step feedback before moving to the next checkpoint.",
                                "Submit final feedback after all guided steps are done.",
                                "Copy or download the summary to share with the MTSS rollout team.",
                            ].map((text, index) => (
                                <div key={text} className="flex gap-3 rounded-2xl border border-white/45 bg-white/75 p-4 dark:border-white/10 dark:bg-white/5">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#fb7185] to-[#22c55e] text-sm font-black text-white">
                                        {index + 1}
                                    </div>
                                    <p className="text-sm leading-relaxed text-slate-600 dark:text-white/70">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="rounded-[32px] border border-white/35 bg-white/85 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.15)] dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-gradient-to-br from-[#0ea5e9] via-[#6366f1] to-[#ec4899] p-3 text-white shadow-lg">
                            <ClipboardCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500 dark:text-white/55">Principal briefing notes</p>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">What principals should be able to explain to teachers after this pilot</h2>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-3">
                        {principalBriefingChecklist.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-[24px] border border-white/45 bg-gradient-to-br from-[#eff6ff]/80 via-white to-[#fff7ed]/70 p-5 dark:border-white/10 dark:from-white/5 dark:via-white/10 dark:to-white/5"
                            >
                                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-800 dark:text-white">
                                    {item.title}
                                </h3>
                                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-white/75">
                                    {item.points.map((point) => (
                                        <li key={point} className="flex gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900 dark:bg-white" />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500 dark:text-white/55">Guided scenario document</p>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{pilotSteps.length}-step pilot checklist</h2>
                        </div>
                        <p className="max-w-2xl text-sm text-slate-600 dark:text-white/70">
                            Each card gives the test goal, the principal task, the action to perform, the expected outcome, and the coaching notes that principal can reuse when explaining the feature to teachers.
                        </p>
                    </div>

                    <div className="grid gap-5">
                        {pilotSteps.map((step) => {
                            const feedback = pilotState.feedbackByStep?.[step.id] || createEmptyStepFeedback();
                            const isCompleted = Boolean(pilotState.completedSteps?.[step.id]);

                            return (
                                <article
                                    key={step.id}
                                    className={cn(
                                        "rounded-[32px] border p-6 shadow-[0_24px_80px_rgba(15,23,42,0.14)] transition",
                                        isCompleted
                                            ? "border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-white to-sky-50/70 dark:border-emerald-400/30 dark:from-emerald-500/10 dark:via-white/5 dark:to-sky-500/10"
                                            : "border-white/35 bg-white/85 dark:border-white/10 dark:bg-white/5",
                                    )}
                                >
                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f97316] via-[#ec4899] to-[#6366f1] text-sm font-black text-white shadow-lg">
                                                    {step.order}
                                                </span>
                                                <div>
                                                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500 dark:text-white/55">{step.duration}</p>
                                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{step.title}</h3>
                                                </div>

                                                {isCompleted && (
                                                    <Badge className="rounded-full border-0 bg-emerald-500/90 px-3 py-1 text-white">
                                                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                                        Completed
                                                    </Badge>
                                                )}
                                                {(feedback.helpfulNotes || feedback.confusingNotes || feedback.bugFound) && (
                                                    <Badge variant="outline" className="rounded-full border-slate-300 bg-white/85 px-3 py-1 text-slate-700 dark:border-white/15 dark:bg-white/5 dark:text-white/75">
                                                        Feedback saved
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr_1fr]">
                                                <div className="space-y-2">
                                                    <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-white/55">Goal</p>
                                                    <p className="text-sm leading-relaxed text-slate-700 dark:text-white/75">{step.goal}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-white/55">Actions</p>
                                                    <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-white/75">
                                                        {step.actions.map((action) => (
                                                            <li key={action} className="flex gap-2">
                                                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900 dark:bg-white" />
                                                                <span>{action}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-white/55">Expected outcome</p>
                                                    <p className="text-sm leading-relaxed text-slate-700 dark:text-white/75">{step.expectedOutcome}</p>
                                                </div>
                                            </div>

                                            <div className="grid gap-5 lg:grid-cols-[0.9fr_1fr_1fr]">
                                                <div className="space-y-2">
                                                    <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-white/55">Principal task</p>
                                                    <p className="text-sm leading-relaxed text-slate-700 dark:text-white/75">{step.principalTask}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-white/55">Technical focus</p>
                                                    <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-white/75">
                                                        {(step.technicalFocus || []).map((item) => (
                                                            <li key={item} className="flex gap-2">
                                                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900 dark:bg-white" />
                                                                <span>{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-white/55">How to explain this to teachers</p>
                                                    <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-white/75">
                                                        {(step.teacherTalkingPoints || []).map((item) => (
                                                            <li key={item} className="flex gap-2">
                                                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900 dark:bg-white" />
                                                                <span>{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            {Array.isArray(step.pageHints) && step.pageHints.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-white/55">Pages to open in this step</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {step.pageHints.map((page) => (
                                                            <span
                                                                key={page}
                                                                className="rounded-full border border-sky-200 bg-sky-50/90 px-3 py-1 text-[11px] font-semibold text-sky-700 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-200"
                                                            >
                                                                {page}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-2">
                                                {step.featureKeys.map((feature) => (
                                                    <span
                                                        key={feature}
                                                        className="rounded-full border border-white/50 bg-white/85 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70"
                                                    >
                                                        {formatFeatureKey(feature)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="w-full max-w-xs space-y-3 rounded-[28px] border border-white/45 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-500 dark:text-white/55">Feedback snapshot</p>
                                                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                                                        Ease {feedback.easeOfUse}/5 · Clarity {feedback.clarity}/5
                                                    </p>
                                                </div>
                                                <Flag className={cn("h-5 w-5", feedback.bugFound ? "text-rose-500" : "text-slate-300 dark:text-white/20")} />
                                            </div>
                                            <p className="text-xs leading-relaxed text-slate-500 dark:text-white/55">
                                                Completion: <span className="font-semibold text-slate-800 dark:text-white">{feedback.completionStatus}</span>
                                            </p>
                                            <p className="text-xs leading-relaxed text-slate-500 dark:text-white/55">
                                                Explainability to teachers: <span className="font-semibold text-slate-800 dark:text-white">{feedback.clarity}/5 clarity</span>
                                            </p>

                                            <div className="grid gap-2">
                                                <Button variant="gradient" onClick={() => handleStartStep(step)}>
                                                    <ArrowRight className="mr-2 h-4 w-4" />
                                                    Start step
                                                </Button>
                                                <Button variant="glass" onClick={() => setActiveStepId(step.id)}>
                                                    <MessageSquareText className="mr-2 h-4 w-4" />
                                                    Submit feedback
                                                </Button>
                                                <Button variant="outline" onClick={() => handleMarkComplete(step.id)}>
                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                    {isCompleted ? "Mark incomplete" : "Mark complete"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <section className="rounded-[32px] border border-white/35 bg-gradient-to-br from-[#eff6ff]/90 via-[#fdf4ff]/90 to-[#fff7ed]/90 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.15)] dark:border-white/10 dark:from-[#0f1730]/90 dark:via-[#180d2f]/90 dark:to-[#08243b]/90">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-gradient-to-br from-[#6366f1] via-[#ec4899] to-[#f97316] p-3 text-white shadow-lg">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500 dark:text-white/55">AI Assistant</p>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Tips & Tricks for Using the AI Assistant</h2>
                        </div>
                    </div>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-white/70">
                        The MTSS system includes AI-powered features designed to save time and surface insights that might be missed manually.
                        These tips will help you get the most out of each AI capability during the pilot and beyond.
                    </p>
                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {aiTipsAndTricks.map((tip) => (
                            <div
                                key={tip.id}
                                className="rounded-[24px] border border-white/45 bg-white/85 p-5 shadow-lg transition hover:shadow-xl dark:border-white/10 dark:bg-white/5"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#ec4899] p-2 text-white">
                                        <Lightbulb className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <h3 className="text-sm font-black text-slate-800 dark:text-white">{tip.title}</h3>
                                        <p className="text-xs leading-relaxed text-slate-600 dark:text-white/70">{tip.description}</p>
                                        <span className="inline-block rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-[10px] font-semibold text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                                            {tip.applicableTo}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[32px] border border-white/35 bg-white/85 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.15)] dark:border-white/10 dark:bg-white/5">
                        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500 dark:text-white/55">Feature coverage mapping</p>
                        <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Feature ↔ step traceability</h2>
                        <div className="mt-5 overflow-hidden rounded-[24px] border border-white/45 dark:border-white/10">
                            <div className="grid grid-cols-[1.1fr_1fr] bg-slate-900 px-4 py-3 text-xs font-black uppercase tracking-[0.22em] text-white">
                                <span>Feature</span>
                                <span>Validated in step</span>
                            </div>
                            <div className="divide-y divide-white/40 dark:divide-white/10">
                                {pilotFeatureCoverage.map((entry) => (
                                    <div key={entry.feature} className="grid grid-cols-[1.1fr_1fr] gap-4 bg-white/75 px-4 py-4 text-sm dark:bg-white/5">
                                        <p className="font-semibold text-slate-800 dark:text-white">{entry.feature}</p>
                                        <p className="text-slate-600 dark:text-white/70">{entry.steps.join(", ")}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[32px] border border-white/35 bg-white/85 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.15)] dark:border-white/10 dark:bg-white/5">
                        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500 dark:text-white/55">Final wrap-up</p>
                        <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Close the pilot with structured insight</h2>
                        <div className="mt-5 space-y-4">
                            <div className="rounded-[24px] border border-white/45 bg-gradient-to-br from-[#eff6ff]/85 via-white to-[#fff7ed]/80 p-5 dark:border-white/10 dark:from-white/5 dark:via-white/10 dark:to-white/5">
                                <p className="text-sm leading-relaxed text-slate-700 dark:text-white/75">
                                    Submit final feedback after all guided steps are finished. This section focuses on rollout readiness,
                                    most useful feature, confusing parts, performance concerns, missing capabilities, and the top three improvement priorities.
                                </p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-white/45 bg-white/75 p-4 dark:border-white/10 dark:bg-white/5">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-white/55">Overall confidence</p>
                                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                                        {pilotState.finalFeedback.overallConfidence}/5
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white/45 bg-white/75 p-4 dark:border-white/10 dark:bg-white/5">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-white/55">Rollout readiness</p>
                                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                                        {readinessLabels[pilotState.finalFeedback.readiness]}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button variant="gradient" onClick={() => setFinalFeedbackOpen(true)}>
                                    <MessageSquareText className="mr-2 h-4 w-4" />
                                    Open final feedback
                                </Button>
                                <Button variant="glass" onClick={handleCopySummary}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy final summary
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <StepFeedbackDialog
                open={Boolean(activeStepId)}
                onOpenChange={(open) => {
                    if (!open) setActiveStepId(null);
                }}
                step={activeStep}
                value={activeStep ? pilotState.feedbackByStep?.[activeStep.id] || createEmptyStepFeedback() : createEmptyStepFeedback()}
                onChange={(nextValue) => activeStep && updateStepFeedback(activeStep.id, nextValue)}
                onSave={handleSaveStepFeedback}
            />

            <FinalFeedbackDialog
                open={finalFeedbackOpen}
                onOpenChange={setFinalFeedbackOpen}
                value={pilotState.finalFeedback}
                onChange={(nextValue) =>
                    setPilotState((prev) =>
                        withTimestamp({
                            ...prev,
                            finalFeedback: nextValue,
                        }),
                    )
                }
                onSave={handleSaveFinalFeedback}
            />
        </div>
    );
});

MTSSPilotTestingHubPage.displayName = "MTSSPilotTestingHubPage";

export default MTSSPilotTestingHubPage;
