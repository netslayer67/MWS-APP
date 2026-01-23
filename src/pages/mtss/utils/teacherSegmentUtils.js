/**
 * Teacher segment derivation utilities
 */

import {
    normalizeGradeLabel,
    normalizeClassLabel,
    shouldStrictClassFilter,
    KINDERGARTEN_CLASSES,
    KINDERGARTEN_GRADES,
} from "./teacherGradeUtils";
import { FALLBACK_GRADE_MAP, UNIT_GRADE_MAP } from "./teacherSegmentConstants";

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

const resolveFallbackGrades = (user = {}) => {
    const candidates = [];
    if (user.username) candidates.push(user.username.toLowerCase());
    if (user.name) {
        candidates.push(user.name.toLowerCase());
        const firstToken = user.name.split(/[\s,]+/)[0];
        if (firstToken) candidates.push(firstToken.toLowerCase());
    }
    if (user.email) {
        const localPart = user.email.split("@")[0];
        if (localPart) candidates.push(localPart.toLowerCase());
    }
    for (const candidate of candidates) {
        if (FALLBACK_GRADE_MAP[candidate]) return FALLBACK_GRADE_MAP[candidate];
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
    }

    let allowedGrades = Array.from(new Set(candidates.map(normalizeGradeLabel).filter(Boolean)));
    const hasSpecificGrade = allowedGrades.some(
        (grade) => /^grade\s*\d+/i.test(grade) || grade.toLowerCase().startsWith("kindergarten") || grade.toLowerCase().startsWith("kindy")
    );

    if (!hasSpecificGrade && unitGrades.length) {
        allowedGrades = unitGrades.slice();
    }

    const classNameSet = new Set(collectClassNames(user));
    const lowerUnit = (user?.unit || "").toLowerCase();

    if ((lowerUnit === "kindergarten" || lowerUnit === "pelangi") && !allowedGrades.some((grade) => grade.toLowerCase() === "kindergarten")) {
        allowedGrades.push("Kindergarten");
    }

    if ((lowerUnit === "kindergarten" || lowerUnit === "pelangi") && !classNameSet.size) {
        KINDERGARTEN_CLASSES.forEach((className) => classNameSet.add(className));
    }

    const allowedClasses = Array.from(classNameSet);
    const strictClassFilter = shouldStrictClassFilter(user?.unit || "", allowedGrades);
    const normalizedClasses = strictClassFilter ? allowedClasses : [];
    const shouldFilterServer = Boolean(normalizedClasses.length) || Boolean(allowedGrades.length && (source === "classes" || source === "job"));

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

export { FALLBACK_GRADE_MAP };
