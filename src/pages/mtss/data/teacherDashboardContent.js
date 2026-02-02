import {
    LineChart as LineChartIcon,
    PlusCircle,
    Users2,
} from "lucide-react";

export const tabs = [
    { key: "dashboard", label: "Dashboard", icon: LineChartIcon },
    { key: "students", label: "My Students", icon: Users2 },
    { key: "create", label: "Create Intervention", icon: PlusCircle },
];

export const fieldClasses = {
    base: "px-4 py-3 rounded-2xl bg-white/80 dark:bg-white/10 border border-primary/20 text-sm text-foreground dark:text-white placeholder:text-muted-foreground/70 dark:placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all",
};

fieldClasses.textarea = `${fieldClasses.base} min-h-[80px]`;
fieldClasses.notes = `${fieldClasses.base} min-h-[120px]`;

export const createDefaultInterventionForm = () => ({
    studentId: "",
    studentName: "",
    grade: "",
    className: "",
    type: "",
    strategyId: "",
    strategyName: "",
    tier: "tier2",
    goal: "",
    notes: "",
    startDate: "",
    duration: "",
    monitorFrequency: "",
    monitorMethod: "",
    baselineValue: "",
    baselineUnit: "score",
    targetValue: "",
    targetUnit: "score",
});

export const createDefaultProgressForm = () => ({
    studentId: "",
    assignmentId: "",
    studentName: "",
    date: "",
    performed: "yes",
    scoreValue: "",
    scoreUnit: "score",
     badge: "🎉 Progress Party",
    notes: "",
});
