import { OBSERVER_EMAILS } from "../hooks/useMtssObserver";

export const PILOT_PROGRESS_STORAGE_KEY = "mtss:pilot-testing:progress";

export const principalBriefingChecklist = [
    {
        id: "explain-pages",
        title: "Explain the main MTSS pages to teachers",
        points: [
            "Create interventions in /mtss/teacher?tab=create.",
            "Edit plans and submit progress updates from /mtss/teacher?tab=students.",
            "Principal oversight happens in /mtss/admin.",
            "Test the AI Assistant in /ai-assistant.",
        ],
    },
    {
        id: "explain-minimum-fields",
        title: "Emphasize the core fields teachers must understand",
        points: [
            "When creating an intervention: student, type, tier, strategy, goal, baseline, target, start date, monitoring frequency, and monitoring method.",
            "When updating progress: date, performed or not, score or status, notes, and evidence when available.",
            "When editing an intervention: revise the target, frequency, method, strategy, or notes without removing past progress history.",
        ],
    },
    {
        id: "explain-when-to-use",
        title: "Clarify when teachers should use each feature",
        points: [
            "Use Create Intervention to build a new support plan.",
            "Use Edit Intervention to revise an active plan when the strategy or target needs adjustment.",
            "Use Quick Update for fast daily logging.",
            "Use the Full Progress Form for more complete and formal updates.",
        ],
    },
];

export const pilotSteps = [
    {
        id: "start-context",
        order: 0,
        title: "Start & Context",
        duration: "3 min",
        routeKey: "hub",
        goal: "Understand the pilot flow, time box, and what success looks like before testing begins.",
        principalTask:
            "Approach this as both a reviewer and a future trainer for teachers. The principal should not only try the features, but also judge whether the workflow is clear enough to explain back to teachers without help from the product team.",
        pageHints: ["/mtss/pilot-testing"],
        actions: [
            "Read the testing objective, total duration, and submission rules.",
            "Confirm you will complete each step in order and submit short feedback after each section.",
            "Open the MTSS workspace only after the briefing is clear.",
        ],
        technicalFocus: [
            "Make sure the principal knows which page is used for create, edit, update, admin review, and the AI Assistant.",
            "Make sure the principal understands that feedback is submitted after each step, with final feedback at the end.",
        ],
        teacherTalkingPoints: [
            "Teachers will work mainly in the Teacher Dashboard, not the Admin Dashboard.",
            "All units, including Kindergarten, now use the same quantitative workflow.",
            "Every intervention must be monitored with a baseline, target, and progress updates.",
        ],
        expectedOutcome:
            "The principal understands the pilot structure, knows that the full test should take 50–60 minutes, and is ready to continue without extra assistance.",
        featureKeys: ["guided-pilot-briefing", "testing-flow-clarity"],
    },
    {
        id: "dashboard-overview",
        order: 1,
        title: "Admin Dashboard Overview",
        duration: "5 min",
        routeKey: "overview",
        goal: "Check whether the principal can quickly interpret the MTSS overview and identify priority signals.",
        principalTask:
            "Test whether the principal can use this dashboard to answer a teacher lead's basic questions: how many students are active, which tier is most common, and which area needs the most follow-up.",
        pageHints: ["/mtss/admin?tab=overview"],
        actions: [
            "Open the MTSS Admin Dashboard → System Overview tab.",
            "Review summary cards: total students, active interventions, tier breakdown.",
            "Scan the recent activity feed and mentor spotlight cards.",
            "Decide which area or student appears most urgent from the overview alone.",
        ],
        technicalFocus: [
            "Check whether the summary cards are readable without opening students one by one.",
            "Check whether the recent activity feed clearly explains the latest teacher activity.",
        ],
        teacherTalkingPoints: [
            "The overview is for principal-level system monitoring, not for entering interventions.",
            "Teachers need to keep updates clean and consistent because the overview pulls insight from teacher activity.",
        ],
        expectedOutcome:
            "The principal can understand the system summary quickly and identify at least one clear priority area without guessing.",
        featureKeys: ["overview-cards", "tier-summary", "recent-activity", "system-snapshot", "mentor-spotlight"],
    },
    {
        id: "mentor-assignment",
        order: 2,
        title: "Mentor Assignment & Management",
        duration: "6 min",
        routeKey: "mentors",
        goal: "Test the full mentor assignment workflow — viewing mentors, assigning students, and confirming ownership.",
        principalTask:
            "Make sure the principal can explain the ownership model to teachers: who handles which students, and how workload distribution stays reasonable.",
        pageHints: ["/mtss/admin?tab=mentors", "/mtss/admin/assign/:mentorId"],
        actions: [
            "Open the Manage Mentors tab from the Admin Dashboard.",
            "Browse the mentor roster — review each mentor card showing assigned students and workload.",
            "Click Assign Students on one mentor to open the assignment page.",
            "Select one or more students from the available list and confirm the assignment.",
            "Return to the mentor roster and verify the assignment count has updated.",
        ],
        technicalFocus: [
            "Check whether the assign-students flow is clear without extra instructions.",
            "Check whether assignment changes become visible on the mentor roster immediately.",
        ],
        teacherTalkingPoints: [
            "Clear ownership matters so progress updates are not entered by the wrong person.",
            "Principals can use this page to review student distribution across teachers or mentors.",
        ],
        expectedOutcome:
            "The principal can assign students to a mentor, confirm the assignment is reflected in the roster, and understand who is responsible for which students.",
        featureKeys: ["mentor-roster", "mentor-assignment", "student-selection", "assignment-confirmation", "workload-visibility"],
    },
    {
        id: "students-filters",
        order: 3,
        title: "Students List & Filters",
        duration: "5 min",
        routeKey: "students",
        goal: "Validate whether the roster, search, and filters help principals narrow down students efficiently.",
        principalTask:
            "Test whether the principal can show a teacher coordinator how to find specific students quickly by grade, tier, type, and mentor.",
        pageHints: ["/mtss/admin?tab=students"],
        actions: [
            "Open the All Students tab from the Admin Dashboard.",
            "Filter by grade, tier, intervention type, and assigned mentor — try at least two filter combinations.",
            "Use the search bar to find a specific student by name.",
            "Load more students if the list supports pagination and confirm the list stays usable.",
        ],
        technicalFocus: [
            "Check whether filter combinations remain consistent as they are changed.",
            "Check whether search and pagination preserve the selected filter context.",
        ],
        teacherTalkingPoints: [
            "Filters and search help principals during coaching conversations with teachers.",
            "Teacher leads can use this roster to review all students currently in Tier 2 or Tier 3.",
        ],
        expectedOutcome:
            "The principal can narrow the roster confidently and the list behaves predictably without duplicate or confusing filter values.",
        featureKeys: ["students-roster", "grade-filter", "tier-filter", "type-filter", "mentor-filter", "search", "pagination"],
    },
    {
        id: "create-intervention",
        order: 4,
        title: "Create Intervention Plan",
        duration: "8 min",
        routeKey: "teacher-create",
        goal: "Test the full intervention creation flow — from student selection to plan submission, including AI-assisted drafting.",
        principalTask:
            "Practice explaining the intervention creation order to teachers in technical terms: choose the student, choose the type and tier, fill in the strategy, goal, baseline, target, and monitoring setup, then save.",
        pageHints: ["/mtss/teacher?tab=create"],
        actions: [
            "Switch to the Teacher Dashboard → Create Intervention tab.",
            "Select a student from the dropdown and confirm the form stays consistent across Kindergarten, Elementary, and Junior High.",
            "Select intervention type (SEL, English, Math, Behavior), tier, strategy, and set baseline/target scores.",
            "Fill in the goal, monitoring frequency (Daily/Weekly/Bi-weekly), and monitoring method.",
            "Set the start date and duration, then submit the plan.",
            "Confirm the same quantitative workflow works for Kindergarten without any special mode or extra qualitative fields.",
        ],
        technicalFocus: [
            "Mandatory understanding: student, type, tier, goal, start date, monitoring frequency, monitoring method.",
            "Recommended field discipline: baseline and target should be quantitative and realistic.",
            "The strategy field explains the teacher's approach; it does not replace the goal.",
        ],
        teacherTalkingPoints: [
            "The goal explains the gap being addressed, the baseline shows the starting point, and the target defines the expected outcome.",
            "Monitoring frequency explains how often progress is checked; monitoring method explains how the teacher measures it.",
            "Teachers should create new interventions from the Create tab, not from the Admin page.",
        ],
        expectedOutcome:
            "The intervention plan is created successfully and the principal sees one consistent quantitative workflow across all units.",
        featureKeys: [
            "intervention-creation",
            "student-selection",
            "type-selection",
            "tier-configuration",
            "strategy-bank",
            "goal-setting",
            "monitoring-setup",
            "cross-unit-consistency",
        ],
    },
    {
        id: "edit-intervention",
        order: 5,
        title: "Edit Intervention Plan",
        duration: "5 min",
        routeKey: "teacher-students",
        goal: "Verify that existing intervention plans can be modified — change settings, update goals, and review the change log.",
        principalTask:
            "Make sure the principal can clearly explain to teachers when to edit an active plan instead of creating a new plan or jumping straight to a progress update.",
        pageHints: ["/mtss/teacher?tab=students", "/mtss/teacher?tab=edit"],
        actions: [
            "From the Teacher Dashboard → My Students tab, find a student with an active intervention.",
            "Click Edit Plan on the student card to open the Edit Intervention panel.",
            "Change one setting — for example, update the monitoring frequency from Weekly to Bi-weekly, or adjust the target score.",
            "Add or modify a note in the plan description.",
            "Save the changes and confirm a success message appears.",
            "Tip: The system keeps a change log of all plan modifications — useful for audit and review.",
        ],
        technicalFocus: [
            "Commonly edited fields: target, strategy, monitoring frequency, monitoring method, and notes.",
            "Progress history should remain intact even after the plan is edited.",
        ],
        teacherTalkingPoints: [
            "Use Edit Plan when the target or strategy needs adjustment after review.",
            "Do not create a new intervention when only the active plan needs revision.",
            "The change log helps principals see who changed the plan and when.",
        ],
        expectedOutcome:
            "The intervention plan is updated successfully. The principal can see that changes are tracked and the modified values appear correctly.",
        featureKeys: ["intervention-editing", "plan-modification", "change-log", "edit-confirmation", "audit-trail"],
    },
    {
        id: "submit-progress",
        order: 6,
        title: "Submit Progress & Quick Update",
        duration: "6 min",
        routeKey: "teacher-students",
        goal: "Test both the full progress submission flow and the quick update shortcut for rapid day-to-day logging.",
        principalTask:
            "Try both update modes directly so the principal can teach teachers when to use Quick Update and when to use the full progress form.",
        pageHints: ["/mtss/teacher?tab=students"],
        actions: [
            "From My Students, select a student and open their detail view.",
            "Use the Quick Update button on the student card to open the Quick Update Modal.",
            "In the Quick Update Modal: enter a score value, select a celebration badge, add brief notes, and submit.",
            "Alternatively, use the full progress form: select date, mark whether the session was performed, enter score, and add detailed notes.",
            "Repeat the same score-based quick update flow for a Kindergarten student and confirm no special qualitative fields appear.",
            "Tip: Quick Update is designed for busy teachers who need to log progress in under 30 seconds between classes.",
        ],
        technicalFocus: [
            "Quick Update focuses on fast input: assignment, date, score, notes, celebration, and evidence.",
            "The full progress form is better when a teacher needs to explain whether the session was performed, include a skip reason, or provide more formal notes.",
            "Make sure each progress update is saved to the correct intervention history.",
        ],
        teacherTalkingPoints: [
            "Use Quick Update for fast daily logging or right after a short session.",
            "Use the full progress form for more complete updates or when cleaner documentation is needed.",
            "The score entered should still align with the goal, baseline, and target that were set earlier.",
        ],
        expectedOutcome:
            "Progress is submitted successfully via both methods. The principal understands when to use Quick Update (fast, daily) vs. Full Progress Form (detailed, weekly review).",
        featureKeys: [
            "progress-submission",
            "quick-update-modal",
            "score-entry",
            "celebration-badge",
            "cross-unit-consistency",
        ],
    },
    {
        id: "evidence-growth",
        order: 7,
        title: "Evidence Upload & Growth Journey",
        duration: "5 min",
        routeKey: "teacher-students",
        goal: "Test evidence attachment and review the student's growth journey timeline to track intervention progress over time.",
        principalTask:
            "Test whether the principal can explain to teachers that progress is not only about numbers, but also about evidence and a timeline of change that can be reviewed together.",
        pageHints: ["/mtss/teacher?tab=students", "/mtss/student/:slug"],
        actions: [
            "From My Students, open a student who has at least one check-in recorded.",
            "Upload an evidence file (image) to the most recent check-in entry using the Evidence Uploader.",
            "After upload, verify the evidence appears in the Evidence Viewer — try clicking to open the lightbox view.",
            "Open the Growth Journey section to review the student's progress timeline.",
            "Scroll through the Growth Journey History to see how check-in values have changed over time.",
            "Tip: Evidence uploads support images (photos of student work, observation notes). Use this to build a visual portfolio of student progress.",
        ],
        technicalFocus: [
            "Evidence should attach to the relevant check-in entry.",
            "The Growth Journey should show the relationship between baseline, current value, target, and update history.",
        ],
        teacherTalkingPoints: [
            "Teachers can use evidence to strengthen discussions with principals or parents.",
            "The Growth Journey helps show whether the gap is actually narrowing over time.",
        ],
        expectedOutcome:
            "Evidence is attached successfully and visible in the timeline. The Growth Journey shows a clear picture of how the student's intervention is progressing.",
        featureKeys: [
            "evidence-upload",
            "evidence-viewer",
            "evidence-lightbox",
            "growth-journey",
            "growth-history",
            "progress-timeline",
        ],
    },
    {
        id: "student-detail",
        order: 8,
        title: "Student Profile & Detail View",
        duration: "5 min",
        routeKey: "students",
        goal: "Check whether the student profile provides enough context to understand one student's full MTSS situation.",
        principalTask:
            "Review whether a single student profile page provides enough context for principal coaching or follow-up with a teacher.",
        pageHints: ["/mtss/admin?tab=students", "/mtss/student/:slug"],
        actions: [
            "Open one student from the Admin Dashboard → All Students list.",
            "Review the student profile header: name, grade, tier, status, and assigned mentor.",
            "Examine the intervention summary — current plan, strategy, progress status.",
            "Check the last update timestamp and next update indicator.",
            "Assess whether the student's story is understandable without needing to ask a technical teammate.",
        ],
        technicalFocus: [
            "Check whether the student's status, current support, latest update, and next action are easy to find.",
            "Check whether moving from the student list to the student detail page preserves context well.",
        ],
        teacherTalkingPoints: [
            "The student profile is the best place to explain one student's full story.",
            "Teachers need to keep plans and progress updates tidy so this profile stays useful for principal review.",
        ],
        expectedOutcome:
            "The principal can describe the student's current condition, current support plan, and what should happen next — all from the profile view.",
        featureKeys: ["student-profile", "intervention-summary", "progress-visibility", "last-update", "next-update", "profile-completeness"],
    },
    {
        id: "ai-assistant-insights",
        order: 9,
        title: "AI Assistant & Smart Insights",
        duration: "7 min",
        routeKey: "teacher-dashboard",
        goal: "Explore the AI-powered features: smart alerts, student insights, pattern detection, and the AI chat assistant.",
        principalTask:
            "Try the AI Assistant from a trainer's perspective: are the prompts and answers clear enough to teach to teachers, and do the results help with the real workflow?",
        pageHints: ["/mtss/teacher?tab=dashboard", "/ai-assistant"],
        actions: [
            "From the Teacher Dashboard, check the notification area for any AI-generated alerts.",
            "Review an AI alert — note the alert type (academic_struggle, emotional_pattern, progress_decline, etc.), severity, and recommended actions.",
            "Click on a student with AI insights available to see detected patterns: learning style, academic struggles, emotional trends.",
            "Open the AI Chat Assistant (/ai-assistant) and try asking a question about a student's progress or strategy recommendation.",
            "Tip: Ask the AI specific questions like 'What intervention strategy works best for this student's learning style?' or 'Show me the emotional trend for the past 2 weeks'.",
            "Tip: The AI learns from conversation history — follow-up questions give better, more contextual answers.",
        ],
        technicalFocus: [
            "Check whether the AI gives output that can be used to create a plan, revise a plan, or support student follow-up.",
            "Check whether the prompts are teacher-friendly and do not require excessive technical terms.",
        ],
        teacherTalkingPoints: [
            "The AI Assistant is most useful when the question is specific and tied to a particular student.",
            "AI does not replace teacher judgment, but it can speed up analysis and next-step recommendations.",
        ],
        expectedOutcome:
            "The principal understands how AI alerts flag at-risk students proactively, how pattern detection reveals learning styles and emotional trends, and how the chat assistant provides on-demand guidance.",
        featureKeys: [
            "ai-alerts",
            "alert-severity",
            "pattern-detection",
            "learning-style",
            "emotional-trends",
            "ai-chat-assistant",
            "ai-recommendations",
            "student-insights",
        ],
    },
    {
        id: "mentor-visibility",
        order: 10,
        title: "Mentor Visibility & Coverage",
        duration: "4 min",
        routeKey: "mentors",
        goal: "Check whether ownership and mentor coverage are visible enough for principal decision making.",
        principalTask:
            "Make sure the principal can explain who is doing what, and how to check teacher workload as MTSS implementation expands.",
        pageHints: ["/mtss/admin?tab=mentors"],
        actions: [
            "Return to Admin Dashboard → Manage Mentors tab.",
            "Review the overall mentor coverage — identify any gaps where students may not have assigned mentors.",
            "Check mentor workload distribution — are some mentors handling too many students?",
            "Identify who appears responsible for follow-up and whether the ownership model feels clear.",
        ],
        technicalFocus: [
            "The roster should be clear enough to show ownership and potential overload.",
            "Principals should be able to detect coverage gaps without opening student data one by one.",
        ],
        teacherTalkingPoints: [
            "Unclear ownership will lead to inconsistent progress updates.",
            "Principals can use this page to redistribute workload during a broader rollout.",
        ],
        expectedOutcome:
            "The principal can understand who is handling which support area, spot any coverage gaps, and identify where escalation or redistribution may be needed.",
        featureKeys: ["mentor-roster", "ownership-visibility", "coverage-gaps", "workload-balance", "follow-up-clarity"],
    },
    {
        id: "analytics-trends",
        order: 11,
        title: "Analytics & Trends",
        duration: "5 min",
        routeKey: "analytics",
        goal: "Evaluate whether trends and analytics are useful for strategic leadership decisions.",
        principalTask:
            "Test whether the principal can use these analytics in strategic conversations with teacher leads, such as reviewing intervention effectiveness or tier movement.",
        pageHints: ["/mtss/admin?tab=analytics"],
        actions: [
            "Open Analytics Lab from the Admin Dashboard.",
            "Review success rates by intervention type — which types show the best outcomes?",
            "Check tier movement trends — how many students improved, remained stable, or need more support?",
            "Look at strategy effectiveness highlights to identify which approaches work best.",
            "Confirm Kindergarten data appears in the same quantitative analytics patterns as other units.",
            "Note which insight is most useful and which part is hardest to interpret.",
        ],
        technicalFocus: [
            "Check whether the charts and labels are clear enough to read without technical help.",
            "Check whether the analytics produce actionable insight rather than just visuals.",
        ],
        teacherTalkingPoints: [
            "Principals use analytics to read broader patterns, not to replace student-by-student case review.",
            "Teachers are still responsible for entering consistent data so analytics remain accurate.",
        ],
        expectedOutcome:
            "The principal can identify at least one actionable insight from analytics, understand tier movement trends, and clearly describe any confusing area.",
        featureKeys: ["analytics-lab", "intervention-success-rate", "tier-movement", "strategy-effectiveness", "trend-insights", "chart-clarity"],
    },
    {
        id: "decision-simulation",
        order: 12,
        title: "Decision Simulation & Wrap-Up",
        duration: "5 min",
        routeKey: "students",
        goal: "Test whether MTSS gives enough information to support a real follow-up decision — the ultimate readiness test.",
        principalTask:
            "Conclude whether the principal feels confident enough to teach teachers how to use MTSS and make follow-up decisions based on system data.",
        pageHints: ["/mtss/admin?tab=students", "/mtss/pilot-testing"],
        actions: [
            "Choose one student who seems most in need of follow-up based on everything you have seen.",
            "State what action you would take next (e.g. escalate tier, change strategy, assign additional mentor, schedule parent meeting).",
            "Assess whether the system gave enough information to support that decision confidently.",
            "Consider: Would you be able to explain this decision to a parent or colleague using only the information in MTSS?",
        ],
        technicalFocus: [
            "The final decision should be explainable using plan data, progress, ownership, and analytics from the system.",
            "If it is not, there is likely a gap in clarity or completeness that should be captured in feedback.",
        ],
        teacherTalkingPoints: [
            "Teachers need to enter plans and progress consistently because that data is what principals use for real decisions.",
            "MTSS is not just data entry; its purpose is better follow-up decisions.",
        ],
        expectedOutcome:
            "The principal feels confident enough to propose a concrete follow-up action using the information in MTSS, and can articulate the reasoning behind the decision.",
        featureKeys: ["decision-support", "actionability", "leadership-readiness", "data-driven-decisions"],
    },
];

export const pilotFeatureCoverage = [
    { feature: "Guided pilot briefing", steps: ["Start & Context"] },
    { feature: "Overview cards / system snapshot", steps: ["Admin Dashboard Overview"] },
    { feature: "Tier summary / recent activity", steps: ["Admin Dashboard Overview"] },
    { feature: "Mentor spotlight", steps: ["Admin Dashboard Overview"] },
    { feature: "Mentor roster & assignment", steps: ["Mentor Assignment & Management", "Mentor Visibility & Coverage"] },
    { feature: "Student-to-mentor assignment flow", steps: ["Mentor Assignment & Management"] },
    { feature: "Workload & coverage visibility", steps: ["Mentor Assignment & Management", "Mentor Visibility & Coverage"] },
    { feature: "Students roster & filters", steps: ["Students List & Filters"] },
    { feature: "Search and pagination", steps: ["Students List & Filters"] },
    { feature: "Intervention creation (quantitative)", steps: ["Create Intervention Plan"] },
    { feature: "Cross-unit intervention consistency", steps: ["Create Intervention Plan", "Submit Progress & Quick Update", "Analytics & Trends"] },
    { feature: "Strategy bank & tier configuration", steps: ["Create Intervention Plan"] },
    { feature: "Intervention editing & change log", steps: ["Edit Intervention Plan"] },
    { feature: "Progress submission (full form)", steps: ["Submit Progress & Quick Update"] },
    { feature: "Quick Update Modal (rapid logging)", steps: ["Submit Progress & Quick Update"] },
    { feature: "Evidence upload & viewer", steps: ["Evidence Upload & Growth Journey"] },
    { feature: "Growth Journey timeline", steps: ["Evidence Upload & Growth Journey"] },
    { feature: "Student profile & detail view", steps: ["Student Profile & Detail View"] },
    { feature: "Last Update / Next Update clarity", steps: ["Student Profile & Detail View"] },
    { feature: "AI-generated alerts & severity", steps: ["AI Assistant & Smart Insights"] },
    { feature: "Pattern detection & learning styles", steps: ["AI Assistant & Smart Insights"] },
    { feature: "AI Chat Assistant", steps: ["AI Assistant & Smart Insights"] },
    { feature: "Analytics Lab & trend charts", steps: ["Analytics & Trends"] },
    { feature: "Tier movement & strategy effectiveness", steps: ["Analytics & Trends"] },
    { feature: "Decision support / actionability", steps: ["Decision Simulation & Wrap-Up"] },
    { feature: "Overall usability / readiness", steps: ["Final Feedback"] },
];

export const aiTipsAndTricks = [
    {
        id: "ai-alerts-priority",
        title: "Prioritize AI Alerts by Severity",
        description:
            "AI alerts come in four severity levels: low, medium, high, and urgent. Focus on urgent and high alerts first. Each alert includes a confidence score — higher confidence means the pattern is more reliable. Use the Acknowledge → In Progress → Resolve workflow to track your response.",
        applicableTo: "Teacher Dashboard, AI Alerts",
    },
    {
        id: "ai-chat-specific-questions",
        title: "Ask Specific Questions in AI Chat",
        description:
            "Instead of vague questions, ask the AI specific ones: 'What learning style does Ahmad show based on recent check-ins?' or 'Suggest a Tier 2 strategy for emotional regulation in Grade 3.' The AI uses conversation history for context, so follow-up questions build on previous answers.",
        applicableTo: "AI Chat Assistant (/ai-assistant)",
    },
    {
        id: "ai-learning-style",
        title: "Leverage Learning Style Detection",
        description:
            "The AI analyzes student interaction patterns to detect learning styles (Visual, Auditory, Kinesthetic, Reading/Writing). Use this insight when choosing intervention strategies — match the strategy to the student's preferred learning modality for better outcomes.",
        applicableTo: "Student AI Insights, Create Intervention",
    },
    {
        id: "ai-emotional-patterns",
        title: "Monitor Emotional Trend Analysis",
        description:
            "The AI tracks emotional check-in patterns over time and flags concerning trends (declining mood, anxiety spikes). When an emotional_pattern alert appears, review the student's recent check-in history before deciding on intervention adjustments.",
        applicableTo: "AI Alerts, Emotional Check-in Dashboard",
    },
    {
        id: "ai-batch-alerts",
        title: "Generate Alerts in Batch (Admin Only)",
        description:
            "As an admin, you can trigger batch alert generation for all students at once. This is useful before weekly review meetings — it surfaces all at-risk students across the school in one view. Use the batch-generate endpoint or the admin alert dashboard.",
        applicableTo: "Admin Dashboard, Weekly Review Prep",
    },
];

export const stepCompletionOptions = [
    { value: "yes", label: "Yes — completed fully" },
    { value: "partial", label: "Partial — some parts skipped" },
    { value: "no", label: "No — could not complete" },
];

export const severityOptions = [
    { value: "low", label: "Low — cosmetic or minor" },
    { value: "medium", label: "Medium — usability issue" },
    { value: "high", label: "High — blocks workflow" },
];

export const readinessOptions = [
    { value: "yes", label: "Yes — ready for wider rollout" },
    { value: "almost", label: "Almost — minor fixes needed first" },
    { value: "not-yet", label: "Not yet — significant issues to address" },
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
        case "teacher-dashboard":
            return "/mtss/teacher?tab=dashboard";
        case "teacher-students":
            return "/mtss/teacher?tab=students";
        case "teacher-create":
            return "/mtss/teacher?tab=create";
        case "teacher-edit":
            return "/mtss/teacher?tab=edit";
        case "ai-assistant":
            return "/ai-assistant";
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
    partialReason: "",
    bugFound: false,
    bugSummary: "",
    expectedResult: "",
    reproductionSteps: "",
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
