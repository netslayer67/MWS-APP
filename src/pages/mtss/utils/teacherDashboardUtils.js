import { ClipboardCheck, ShieldCheck, Star } from "lucide-react";

export const STAT_TEMPLATE = [
    { key: "active", label: "Active Interventions", sub: "Kids in a boost bubble", icon: ShieldCheck, accent: "from-[#0ea5e9]/90 via-[#818cf8]/85 to-[#34d399]/80" },
    { key: "due", label: "Updates Due", sub: "Check-ins waiting today", icon: ClipboardCheck, accent: "from-[#fcd34d]/90 via-[#fb923c]/85 to-[#38bdf8]/80" },
    { key: "success", label: "Success Rate", sub: "Kids hitting targets", icon: Star, accent: "from-[#22d3ee]/90 via-[#a855f7]/85 to-[#f472b6]/80" },
];

export const STATUS_LABELS = {
    active: "On Track",
    paused: "Needs Attention",
    completed: "Completed",
    closed: "Closed",
};

export const STATUS_PRIORITY = { active: 4, paused: 3, completed: 2, closed: 1 };

const UNIT_GRADE_MAP = {
    "Junior High": ["Grade 7", "Grade 8", "Grade 9"],
    "Elementary": ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"],
    "Kindergarten": ["Kindergarten Pre-K", "Kindergarten K1", "Kindergarten K2"],
    Pelangi: ["Kindergarten Pre-K", "Kindergarten K1", "Kindergarten K2"],
};

const GRADE_VARIANTS = {
    "Grade 7": ["Grade 7", "Grade 7 - Helix"],
    "Grade 8": ["Grade 8", "Grade 8 - Cartwheel"],
    "Grade 9": ["Grade 9", "Grade 9 - Messier 87"],
};

const KINDERGARTEN_GRADES = ["Kindergarten Pre-K", "Kindergarten K1", "Kindergarten K2", "Kindergarten"];

const KINDERGARTEN_CLASSES = [
    "Kindergarten - Milky Way",
    "Kindergarten - Bear Paw",
    "Kindergarten - Starlight",
];

const STRICT_CLASS_GRADES = new Set(["Grade 1", "Grade 2", "Grade 3", "Grade 4"]);

const shouldStrictClassFilter = (unit = "", grades = []) => {
    const normalizedUnit = (unit || "").toLowerCase();
    if (normalizedUnit === "kindergarten" || normalizedUnit === "pelangi") return true;
    if (grades.some((grade) => grade.toLowerCase().startsWith("kindergarten"))) return true;
    return grades.some((grade) => STRICT_CLASS_GRADES.has(normalizeGradeLabel(grade)));
};

export const normalizeClassLabel = (value = "") => {
    if (!value) return "";
    const cleaned = value.toString().replace(/\s+/g, " ").trim();
    if (!cleaned) return "";
    const kindergartenMatch = cleaned.match(/^kind(?:ergarten)?(?:\s*-\s*(.*))?$/i);
    if (kindergartenMatch) {
        const suffix = kindergartenMatch[1]?.trim();
        if (!suffix) return "Kindergarten";
        const formatted = suffix
            .split(/\s+/)
            .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
            .join(" ");
        return `Kindergarten - ${formatted}`;
    }
    return cleaned;
};

// Fallback mapping for teachers/principals whose jobPosition/classes do not list grade explicitly.
// Keys are lowercased username or name tokens.
const FALLBACK_GRADE_MAP = {
    // Junior High homerooms / specialists
    abu: ["Grade 7"],
    yosa: ["Grade 7"],
    nadia: ["Grade 7"],
    novan: ["Grade 7"],
    "rifqi": ["Grade 8"],
    "rizki nurul hayati": ["Grade 8"],
    anggie: ["Grade 8"],
    dhaffa: ["Grade 9"],
    tyas: ["Grade 9"],
    vicki: ["Grade 9"],
    zolla: ["Grade 9"],
    hasan: ["Grade 7", "Grade 8", "Grade 9"],
    hadi: ["Grade 7", "Grade 8", "Grade 9"],
    himawan: ["Grade 7", "Grade 8", "Grade 9"],
    "aria wisnuwardana": ["Grade 7", "Grade 8", "Grade 9"],

    // Elementary homerooms & SE teachers
    gundah: ["Grade 1"],
    "krisalyssa esna rehulina tarigan": ["Grade 1"],
    almia: ["Grade 1"],
    romasta: ["Grade 1"],
    "zavier cloudya mashareen": ["Grade 1"],
    novia: ["Grade 1"],

    alin: ["Grade 2"],
    bela: ["Grade 2"],
    maria: ["Grade 2"],
    tria: ["Grade 2"],
    laras: ["Grade 2"],
    dini: ["Grade 2"],
    restia: ["Grade 2"],
    reza: ["Grade 2"],

    berliana: ["Grade 3"],
    raisa: ["Grade 3"],
    cecil: ["Grade 3"],
    putri: ["Grade 3"],
    galen: ["Grade 3"],
    salsabila: ["Grade 3"],
    dien: ["Grade 3"],
    ika: ["Grade 3"],

    eva: ["Grade 4"],
    nathasya: ["Grade 4"],
    rike: ["Grade 4"],
    prisy: ["Grade 4"],
    risma: ["Grade 4"],
    galuh: ["Grade 4"],
    annisa: ["Grade 4"],
    iis: ["Grade 4"],

    tri: ["Grade 5"],
    robby: ["Grade 5"],
    nazmi: ["Grade 5"],
    fadholi: ["Grade 5"],

    devi: ["Grade 6"],
    pipiet: ["Grade 6"],

    // Kindergarten homerooms / SE
    afi: ["Kindergarten Pre-K", "Kindergarten K1", "Kindergarten K2"],
    ayunda: ["Kindergarten Pre-K", "Kindergarten K1", "Kindergarten K2"],
    diya: ["Kindergarten Pre-K", "Kindergarten K1", "Kindergarten K2"],
    nanda: ["Kindergarten Pre-K", "Kindergarten K1", "Kindergarten K2"],
    widya: ["Kindergarten Pre-K", "Kindergarten K1", "Kindergarten K2"],
    yohana: ["Kindergarten Pre-K", "Kindergarten K1", "Kindergarten K2"],
    ferlyna: ["Kindergarten Pre-K", "Kindergarten K1", "Kindergarten K2"],
    vinka: ["Kindergarten Pre-K", "Kindergarten K1", "Kindergarten K2"],

    // Principals by unit (fallback)
    kholi: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"],
    latifah: ["Kindergarten Pre-K", "Kindergarten K1", "Kindergarten K2"],
};

export const normalizeGradeLabel = (value) => {
    if (!value) return "";
    const raw = value.toString().trim();
    const lower = raw.toLowerCase();

    const gradeMatch = raw.match(/grade\s*\d+/i);
    if (gradeMatch) {
        return gradeMatch[0].replace(/grade/i, "Grade").replace(/\s+/g, " ").trim();
    }
    if (lower.includes("kindergarten") || lower.includes("kindy")) {
        if (/(pre[-\s]?k|prekind)/i.test(raw)) {
            return "Kindergarten Pre-K";
        }
        if (/\bk\s*1\b/i.test(raw)) {
            return "Kindergarten K1";
        }
        if (/\bk\s*2\b/i.test(raw)) {
            return "Kindergarten K2";
        }
        return "Kindergarten";
    }
    return raw.split("-")[0].trim();
};

const collectClassNames = (user = {}) => {
    const classes = new Set();
    (user.classes || []).forEach((cls) => {
        if (cls?.className) {
            const normalized = normalizeClassLabel(cls.className);
            const lower = cls.className.toLowerCase();
            const mentionsKindyBand = /kindy|kindergarten|pre[-\s]?k|k\s*1|k\s*2/.test(lower);
            const isGenericKindy = normalized.toLowerCase() === "kindergarten" || !normalized.startsWith("Kindergarten -");
            if (mentionsKindyBand && isGenericKindy) {
                KINDERGARTEN_CLASSES.forEach((className) => classes.add(className));
            } else if (normalized) {
                classes.add(normalized);
            }
        }
    });

    const unit = (user.unit || "").toLowerCase();
    if (!classes.size && (unit === "kindergarten" || unit === "pelangi")) {
        KINDERGARTEN_CLASSES.forEach((className) => classes.add(className));
    }

    return Array.from(classes).filter(Boolean);
};

export const buildClassQueryValues = (segments = {}) =>
    segments.strictClassFilter
        ? Array.from(new Set((segments.allowedClasses || []).map(normalizeClassLabel).filter(Boolean)))
        : [];

const resolveFallbackGrades = (user = {}) => {
    const candidates = [];
    if (user.username) {
        candidates.push(user.username.toLowerCase());
    }
    if (user.name) {
        candidates.push(user.name.toLowerCase());
        const firstToken = user.name.split(/[\s,]+/)[0];
        if (firstToken) {
            candidates.push(firstToken.toLowerCase());
        }
    }
    if (user.email) {
        const localPart = user.email.split("@")[0];
        if (localPart) {
            candidates.push(localPart.toLowerCase());
        }
    }
    for (const candidate of candidates) {
        if (FALLBACK_GRADE_MAP[candidate]) {
            return FALLBACK_GRADE_MAP[candidate];
        }
    }
    return [];
};

const parseJobPositionGrades = (jobPosition = "") => {
    if (!jobPosition) return [];
    const matches = [];
    const gradeMatches = jobPosition.match(/grade\s*\d+/gi);
    if (gradeMatches) {
        gradeMatches.forEach((g) => matches.push(g.trim().replace(/\s+/g, " ").replace(/grade/i, "Grade").trim()));
    }
    if (/kindy|kindergarten/i.test(jobPosition)) {
        const kindyMatch = jobPosition.match(/kindy\s*[a-z0-9'\-\s]+/i);
        if (kindyMatch) {
            matches.push(kindyMatch[0].trim());
        } else {
            matches.push("Kindergarten Pre-K", "Kindergarten K1", "Kindergarten K2");
        }
    }
    return matches;
};

export const deriveTeacherSegments = (user = {}) => {
    const classGrades = Array.isArray(user?.classes) ? user.classes : [];
    const fromClasses = classGrades.map((cls) => normalizeGradeLabel(cls.grade)).filter(Boolean);
    const fromJob = parseJobPositionGrades(user?.jobPosition).map(normalizeGradeLabel).filter(Boolean);
    const unitGrades = UNIT_GRADE_MAP[user?.unit] || [];
    const key = (user?.username || user?.name || "").toLowerCase();
    const fallbackGradesExplicit = FALLBACK_GRADE_MAP[key] || [];
    const fallbackGrades = fallbackGradesExplicit.length ? fallbackGradesExplicit : resolveFallbackGrades(user);
    let source = "all";
    let candidates = [];

    if (fromClasses.length) {
        source = "classes";
        candidates = fromClasses;
    } else if (fromJob.length) {
        source = "job";
        candidates = fromJob;
    } else if (fallbackGrades.length) {
        source = "fallback";
        candidates = fallbackGrades;
    } else if (unitGrades.length) {
        source = "unit";
        candidates = unitGrades;
    } else {
        candidates = [];
    }

    let allowedGrades = Array.from(new Set(candidates.map(normalizeGradeLabel).filter(Boolean)));
    const hasSpecificGrade = allowedGrades.some((grade) =>
        /^grade\s*\d+/i.test(grade) || grade.toLowerCase().startsWith("kindergarten") || grade.toLowerCase().startsWith("kindy"),
    );

    if (!hasSpecificGrade && unitGrades.length) {
        allowedGrades = unitGrades.slice();
    }

    const classNameSet = new Set(collectClassNames(user));
    const lowerUnit = (user?.unit || "").toLowerCase();

    if (
        (lowerUnit === "kindergarten" || lowerUnit === "pelangi") &&
        !allowedGrades.some((grade) => grade.toLowerCase() === "kindergarten")
    ) {
        allowedGrades.push("Kindergarten");
    }

    if ((lowerUnit === "kindergarten" || lowerUnit === "pelangi") && !classNameSet.size) {
        KINDERGARTEN_CLASSES.forEach((className) => classNameSet.add(className));
    }

    const allowedClasses = Array.from(classNameSet);
    const strictClassFilter = shouldStrictClassFilter(user?.unit || "", allowedGrades);
    const normalizedClasses = strictClassFilter ? allowedClasses : [];
    const shouldFilterServer =
        Boolean(normalizedClasses.length) || Boolean(allowedGrades.length && (source === "classes" || source === "job"));

    return {
        allowedGrades,
        allowedClasses: normalizedClasses,
        strictClassFilter,
        source,
        shouldFilterServer,
        unit: user?.unit || "",
        label: allowedGrades.length ? allowedGrades.join(", ") : user?.unit || "All Grades",
    };
};

export const buildGradeQueryValues = (segments = {}) => {
    const values = new Set();
    const addVariants = (grade) => {
        if (!grade) return;
        const normalized = normalizeGradeLabel(grade);
        if (!normalized) return;
        values.add(normalized);
        if (normalized.toLowerCase() === "kindergarten") {
            KINDERGARTEN_GRADES.forEach((entry) => values.add(entry));
            return;
        }
        const variants = GRADE_VARIANTS[normalized];
        if (variants?.length) {
            variants.forEach((variant) => values.add(variant));
        }
    };

    (segments.allowedGrades || []).forEach(addVariants);

    if (!values.size && segments.unit === "Junior High") {
        ["Grade 7", "Grade 8", "Grade 9"].forEach(addVariants);
    }

    return Array.from(values);
};

export const formatDate = (value, options = { month: "short", day: "numeric" }) => {
    if (!value) return "—";
    try {
        return new Intl.DateTimeFormat("en-US", options).format(new Date(value));
    } catch {
        return "—";
    }
};

export const slugify = (value) =>
    value
        ? value
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)+/g, "")
        : `student-${Math.random().toString(36).slice(2, 6)}`;

const formatDuration = (start, end) => {
    if (!start) return "Ongoing";
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diffWeeks = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 7)));
    return `${diffWeeks} wk${diffWeeks > 1 ? "s" : ""}`;
};

const mapTierLabel = (tier) => {
    if (!tier) return "Tier 2";
    const code = tier.toString().toLowerCase();
    if (code.includes("3")) return "Tier 3";
    if (code.includes("1")) return "Tier 1";
    return "Tier 2";
};

const TIER_PRIORITY = { tier1: 1, tier2: 2, tier3: 3 };

const normalizeTierCode = (value) => {
    if (!value) return null;
    const normalized = value.toString().toLowerCase();
    if (normalized.includes("3")) return "tier3";
    if (normalized.includes("2")) return "tier2";
    if (normalized.includes("1")) return "tier1";
    return null;
};

const deriveFocus = (assignment) => {
    if (assignment?.focusAreas?.length) return assignment.focusAreas[0];
    if (assignment?.tier === "tier3") return "Intensive Support";
    return "Literacy & SEL";
};

const inferProgressUnit = (assignment, student) => {
    const pool = [
        assignment?.metricLabel,
        assignment?.notes,
        assignment?.focusAreas?.join(" "),
        student?.type,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    if (/attendance|present|absen/.test(pool)) return "%";
    if (/reading|fluency|literacy|wpm/.test(pool)) return "wpm";
    if (/math|numeracy|accuracy|score/.test(pool)) return "score";
    if (/behavior|sel|conduct|check-in|checkin/.test(pool)) return "pts";
    return "score";
};

const isUpdateDue = (assignment) => {
    if (assignment?.status !== "active") return false;
    const lastCheckIn = assignment?.checkIns?.slice(-1)[0]?.date;
    if (!lastCheckIn) return true;
    const diffDays = (Date.now() - new Date(lastCheckIn).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 7;
};

const buildChartSeries = (assignment = {}) => {
    const checkIns = assignment.checkIns || [];
    if (checkIns.length) {
        const total = checkIns.length;
        return checkIns.map((entry, index) => {
            const value = Math.round(((index + 1) / total) * 100);
            const label = formatDate(entry.date);
            return { label, date: label, reading: value, goal: 100, value };
        });
    }
    const goals = assignment.goals || [];
    if (goals.length) {
        const total = goals.length;
        let completed = 0;
        return goals.map((goal, index) => {
            if (goal.completed) completed += 1;
            const value = Math.round((completed / total) * 100);
            const label = goal.description || `Goal ${index + 1}`;
            return { label, date: label, reading: value, goal: 100, value };
        });
    }
    const value = assignment.status === "completed" ? 100 : 0;
    const label = formatDate(assignment.startDate);
    return [{ label, date: label, reading: value, goal: 100, value }];
};

const buildHistory = (assignment = {}) =>
    (assignment.checkIns || []).slice(-6).reverse().map((entry) => ({
        date: formatDate(entry.date, { month: "short", day: "numeric", year: "numeric" }),
        score: "—",
        notes: entry.summary || entry.nextSteps || "Check-in recorded",
    }));

const inferNextUpdate = (assignment) => {
    const sourceDate = assignment?.checkIns?.slice(-1)[0]?.date || assignment?.startDate;
    if (!sourceDate) return "Awaiting update";
    const date = new Date(sourceDate);
    date.setDate(date.getDate() + 7);
    return formatDate(date);
};

export const buildStatCards = (assignments = []) => {
    const active = assignments.filter((assignment) => assignment.status === "active").length;
    const due = assignments.filter(isUpdateDue).length;
    const totalGoals = assignments.reduce((sum, assignment) => sum + (assignment.goals?.length || 0), 0);
    const completedGoals = assignments.reduce(
        (sum, assignment) => sum + (assignment.goals?.filter((goal) => goal.completed).length || 0),
        0,
    );
    const successBase = totalGoals || assignments.length || 1;
    const successfulAssignments = assignments.filter((item) => item.status === "completed").length;
    const successRate = Math.round(((completedGoals || successfulAssignments) / successBase) * 100);

    return [
        { ...STAT_TEMPLATE[0], value: active },
        { ...STAT_TEMPLATE[1], value: due },
        { ...STAT_TEMPLATE[2], value: `${Number.isFinite(successRate) ? successRate : 0}%` },
    ];
};

export const mapAssignmentsToStudents = (assignments = [], teacherName = "MTSS Mentor") => {
    const map = new Map();
    assignments.forEach((assignment) => {
        const focus = deriveFocus(assignment);
        const tier = mapTierLabel(assignment.tier);
        const statusKey = assignment.status || "active";
        const nextUpdate = inferNextUpdate(assignment);
        const chart = buildChartSeries(assignment);
        const history = buildHistory(assignment);
        const goals = assignment.goals || [];
        const completedGoals = goals.filter((goal) => goal.completed).length;

        (assignment.studentIds || []).forEach((student) => {
            const id = student?._id?.toString?.() || student?.id || student;
            if (!id) return;
            const grade = normalizeGradeLabel(
                student?.currentGrade || student?.classes?.[0]?.grade || student?.unit || student?.class || "-",
            );
            const progressUnit = inferProgressUnit(assignment, student);
            const record = {
                id,
                assignmentId: assignment._id?.toString?.() || null,
                slug: student?.slug || slugify(student?.name),
                name: student?.name || "Student",
                grade,
                type: focus,
                tier,
                progress: STATUS_LABELS[statusKey] || "On Track",
                nextUpdate,
                statusKey,
                profile: {
                    teacher: teacherName,
                    mentor: assignment.mentorId?.name || teacherName,
                    type: focus,
                    strategy: assignment.focusAreas?.join(", ") || `Support focus - ${tier}`,
                    started: formatDate(assignment.startDate),
                    duration: formatDuration(assignment.startDate, assignment.endDate),
                    baseline: goals.length ? 0 : null,
                    current: goals.length ? completedGoals : assignment.checkIns?.length || (statusKey === "completed" ? 1 : 0),
                    target: goals.length || Math.max(assignment.checkIns?.length || 1, 1),
                    progressUnit,
                    chart,
                    history,
                },
            };

            const current = map.get(id);
            if (!current || STATUS_PRIORITY[statusKey] > STATUS_PRIORITY[current.statusKey]) {
                map.set(id, record);
            }
        });
    });

    const students = Array.from(map.values());
    const sorted = students.sort((a, b) => STATUS_PRIORITY[b.statusKey] - STATUS_PRIORITY[a.statusKey]);
    const spotlightChart = sorted[0]?.profile?.chart || [];
    const focusLabel = sorted[0] ? `${sorted[0].tier} ${sorted[0].type}` : null;

    return {
        students: sorted.map(({ statusKey, ...rest }) => rest),
        spotlightChart,
        focusLabel,
    };
};

export const mergeRosterWithAssignments = (
    rosterStudents = [],
    assignmentStudents = [],
    segments = { allowedGrades: [] },
) => {
    const assignmentMap = new Map(
        assignmentStudents.map((student) => [student.id?.toString?.() || student.slug || student.name, student]),
    );
    const allowedGrades = segments.allowedGrades || [];
    const allowedClasses = segments.allowedClasses || [];
    const strictClassFilter = segments.strictClassFilter;
    const matchesGrade = (grade) => !allowedGrades.length || allowedGrades.includes(normalizeGradeLabel(grade));
    const matchesClass = (className) => {
        if (!strictClassFilter || !allowedClasses.length) return true;
        const normalized = normalizeClassLabel(className);
        if (!normalized) return false;
        return allowedClasses.includes(normalized);
    };

    const merged = rosterStudents
        .map((student) => {
            const id = student.id?.toString?.() || student._id?.toString?.() || student.slug || student.name;
            const gradeLabel = normalizeGradeLabel(student.grade || student.currentGrade || student.className || "-");
            const classLabel = normalizeClassLabel(student.className || student.currentGrade || student.unit);
            if (!matchesGrade(gradeLabel)) {
                return null;
            }
            if (!matchesClass(classLabel)) {
                return null;
            }
            const assignment = assignmentMap.get(id);
            const rosterTierCode = normalizeTierCode(
                student.tier || student.primaryIntervention?.tier || student.profile?.tier,
            );
            const assignmentTierCode = normalizeTierCode(assignment?.tier);
            const rosterScore = TIER_PRIORITY[rosterTierCode] || 0;
            const assignmentScore = TIER_PRIORITY[assignmentTierCode] || 0;
            const useAssignment = assignment && (!rosterScore || assignmentScore > rosterScore);
            const displaySource = useAssignment ? assignment : student;
            return {
                id,
                slug: student.slug || slugify(student.name),
                name: student.name,
                grade: gradeLabel,
                className: classLabel || student.className,
                type: displaySource?.type || student.type || "Universal Supports",
                tier: displaySource?.tier || student.tier || "Tier 1",
                progress: displaySource?.progress || student.progress || "Not Assigned",
                nextUpdate: displaySource?.nextUpdate || student.nextUpdate || "Not scheduled",
                assignmentId: assignment?.assignmentId || null,
                profile: displaySource?.profile || assignment?.profile || student.profile,
                interventions: student.interventions,
                primaryIntervention: student.primaryIntervention,
            };
        })
        .filter(Boolean);

    if (!merged.length && assignmentStudents.length) {
        return assignmentStudents;
    }
    return merged;
};

export const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem("auth_user") || "null");
    } catch {
        return null;
    }
};
