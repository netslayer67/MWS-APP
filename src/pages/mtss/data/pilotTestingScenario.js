import { OBSERVER_EMAILS } from "../hooks/useMtssObserver";

export const PILOT_PROGRESS_STORAGE_KEY = "mtss:pilot-testing:progress";

export const pilotSteps = [
    {
        id: "start-context",
        order: 0,
        title: "Start & Context",
        duration: "3 min",
        routeKey: "hub",
        goal: "Understand the pilot flow, time box, and what success looks like before testing begins.",
        actions: [
            "Read the testing objective, total duration, and submission rules.",
            "Confirm you will complete each step in order and submit short feedback after each section.",
            "Open the MTSS workspace only after the briefing is clear.",
        ],
        expectedOutcome:
            "The principal understands the pilot structure, knows that the full test should take 35–50 minutes, and is ready to continue without extra assistance.",
        featureKeys: ["guided-pilot-briefing", "testing-flow-clarity"],
    },
    {
        id: "dashboard-overview",
        order: 1,
        title: "Dashboard Overview",
        duration: "5 min",
        routeKey: "overview",
        goal: "Check whether the principal can quickly interpret the MTSS overview and identify priority signals.",
        actions: [
            "Open the MTSS dashboard overview.",
            "Review summary cards, tier breakdown, and recent activity.",
            "Decide which area or student appears most urgent from the overview alone.",
        ],
        expectedOutcome:
            "The principal can understand the system summary quickly and identify at least one clear priority area without guessing.",
        featureKeys: ["overview-cards", "tier-summary", "recent-activity", "system-readability"],
    },
    {
        id: "students-filters",
        order: 2,
        title: "Students List & Filters",
        duration: "7 min",
        routeKey: "students",
        goal: "Validate whether the roster, search, and filters help principals narrow down students efficiently.",
        actions: [
            "Open All Students.",
            "Filter by grade, tier, type, and mentor at least once.",
            "Use search to find a student or keyword.",
            "Load more students if needed and confirm the list still feels easy to control.",
        ],
        expectedOutcome:
            "The principal can narrow the roster confidently and the list behaves predictably without duplicate or confusing filter values.",
        featureKeys: ["students-roster", "grade-filter", "tier-filter", "type-filter", "mentor-filter", "search", "pagination"],
    },
    {
        id: "student-detail",
        order: 3,
        title: "Student Detail",
        duration: "6 min",
        routeKey: "students",
        goal: "Check whether the detail page provides enough context to understand one student's MTSS situation.",
        actions: [
            "Open one student from the filtered list.",
            "Review intervention summary, progress, last update, and next update.",
            "Assess whether the student story is understandable without needing to ask a technical teammate.",
        ],
        expectedOutcome:
            "The principal can describe the student's current condition, current support, and what should happen next.",
        featureKeys: ["student-profile", "intervention-summary", "progress-visibility", "last-update", "next-update"],
    },
    {
        id: "navigation-context",
        order: 4,
        title: "Navigation & Context Retention",
        duration: "4 min",
        routeKey: "students",
        goal: "Verify that moving back from detail to roster preserves the user's context.",
        actions: [
            "Return to Students using the back button or browser back.",
            "Confirm that the previous filters, search, and list state are still active.",
            "Check whether resuming the task feels seamless.",
        ],
        expectedOutcome:
            "The principal returns to the same student list context without needing to re-apply filters or search.",
        featureKeys: ["back-navigation", "filter-state-retention", "search-state-retention", "list-continuity"],
    },
    {
        id: "mentor-visibility",
        order: 5,
        title: "Mentor Visibility",
        duration: "4 min",
        routeKey: "mentors",
        goal: "Check whether ownership and mentor coverage are visible enough for decision making.",
        actions: [
            "Open the Mentors area.",
            "Review available mentor cards or mentor roster information.",
            "Identify who appears responsible for follow-up and whether the ownership model feels clear.",
        ],
        expectedOutcome:
            "The principal can understand who is handling which support area and where escalation may be needed.",
        featureKeys: ["mentor-roster", "ownership-visibility", "follow-up-clarity"],
    },
    {
        id: "analytics-trends",
        order: 6,
        title: "Analytics & Trends",
        duration: "5 min",
        routeKey: "analytics",
        goal: "Evaluate whether trends and analytics are useful for strategic leadership decisions.",
        actions: [
            "Open Analytics Lab.",
            "Review charts, trends, and movement indicators.",
            "Note which insight is most useful and which part is hardest to interpret.",
        ],
        expectedOutcome:
            "The principal can identify at least one useful insight from analytics and clearly describe any confusing area.",
        featureKeys: ["analytics-lab", "trend-insights", "tier-movement", "chart-clarity"],
    },
    {
        id: "decision-simulation",
        order: 7,
        title: "Decision Simulation",
        duration: "6 min",
        routeKey: "students",
        goal: "Test whether MTSS gives enough information to support a real follow-up decision.",
        actions: [
            "Choose one student who seems most in need of follow-up.",
            "State what action you would take next and why.",
            "Assess whether the system gave enough information to support that decision.",
        ],
        expectedOutcome:
            "The principal feels confident enough to propose a concrete follow-up action using the information in MTSS.",
        featureKeys: ["decision-support", "actionability", "leadership-readiness"],
    },
];

export const pilotFeatureCoverage = [
    { feature: "Guided pilot briefing", steps: ["Start & Context"] },
    { feature: "Overview cards / system snapshot", steps: ["Dashboard Overview"] },
    { feature: "Tier summary / recent activity", steps: ["Dashboard Overview"] },
    { feature: "Students roster", steps: ["Students List & Filters"] },
    { feature: "Filter by grade / tier / type / mentor", steps: ["Students List & Filters"] },
    { feature: "Search and list usability", steps: ["Students List & Filters"] },
    { feature: "Student profile detail", steps: ["Student Detail"] },
    { feature: "Intervention and progress visibility", steps: ["Student Detail"] },
    { feature: "Last Update / Next Update clarity", steps: ["Student Detail"] },
    { feature: "Back navigation / state retention", steps: ["Navigation & Context Retention"] },
    { feature: "Mentor visibility / ownership", steps: ["Mentor Visibility"] },
    { feature: "Analytics / trend interpretation", steps: ["Analytics & Trends"] },
    { feature: "Decision support / actionability", steps: ["Decision Simulation"] },
    { feature: "Overall usability / readiness", steps: ["Final Feedback"] },
];

export const stepCompletionOptions = [
    { value: "yes", label: "Yes" },
    { value: "partial", label: "Partial" },
    { value: "no", label: "No" },
];

export const severityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
];

export const readinessOptions = [
    { value: "yes", label: "Yes" },
    { value: "not-yet", label: "Not yet" },
];

export const ratingOptions = [1, 2, 3, 4, 5];

export const buildPilotBaseRoute = (user) => {
    const role = String(user?.role || "").toLowerCase();
    const email = String(user?.email || "").toLowerCase().trim();

    if (OBSERVER_EMAILS.has(email)) {
        return "/mtss/observer";
    }

    if (["admin", "superadmin", "directorate", "head_unit"].includes(role)) {
        return "/mtss/admin";
    }

    return "/mtss/teacher";
};

export const buildPilotStepRoute = (step, user) => {
    const baseRoute = buildPilotBaseRoute(user);

    switch (step.routeKey) {
        case "overview":
            return `${baseRoute}?tab=overview`;
        case "students":
            return `${baseRoute}?tab=students`;
        case "mentors":
            return `${baseRoute}?tab=mentors`;
        case "analytics":
            return `${baseRoute}?tab=analytics`;
        default:
            return "/mtss/pilot-testing";
    }
};

export const createEmptyStepFeedback = () => ({
    completionStatus: "yes",
    easeOfUse: 4,
    clarity: 4,
    performance: 4,
    helpfulNotes: "",
    confusingNotes: "",
    bugFound: false,
    bugSummary: "",
    bugSeverity: "medium",
    screenshotLink: "",
});

export const createEmptyFinalFeedback = () => ({
    overallConfidence: 4,
    mostUsefulFeature: "",
    mostConfusingFeature: "",
    slowestPart: "",
    missingFeature: "",
    readiness: "not-yet",
    topImprovements: "",
    additionalComments: "",
});
