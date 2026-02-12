import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Calendar, Search, Users, AlertTriangle, CheckCircle2, Filter } from "lucide-react";
import { getTeacherDailyCheckins } from "@/services/checkinService";

const toTitleCase = (value = "") =>
    value
        .toString()
        .replace(/_/g, " ")
        .trim()
        .replace(/\s+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

const formatClassLabels = (classes = []) => {
    if (!Array.isArray(classes)) return [];
    const labels = classes
        .map((assignment) => {
            const grade = assignment?.grade || "";
            const className = assignment?.className || "";
            if (grade && className) return `${grade} - ${className}`;
            return grade || className || "";
        })
        .filter(Boolean);
    return Array.from(new Set(labels));
};

const gradeSortKey = (grade = "") => {
    const normalized = grade.toLowerCase();
    if (!normalized) return 9999;
    if (normalized.includes("kindergarten") || normalized.includes("kindy")) return 0;
    const match = normalized.match(/grade\s*(\d+)/);
    if (match) return Number(match[1]);
    return 9999;
};

const EmotionalCheckinTeacherDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const todayISO = useMemo(() => new Date().toISOString().split("T")[0], []);
    const [selectedDate, setSelectedDate] = useState(todayISO);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGrade, setSelectedGrade] = useState("");
    const [selectedClassName, setSelectedClassName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [payload, setPayload] = useState(null);

    const userRole = user?.role || "";
    const isPrincipalView = ["head_unit", "directorate", "admin", "superadmin"].includes(userRole);
    const classLabels = useMemo(() => formatClassLabels(user?.classes), [user?.classes]);
    const scope = payload?.scope || {};
    const scopeUnit = scope.unit || user?.unit || user?.department || "";

    const honorific = useMemo(() => {
        const gender = (user?.gender || "").toLowerCase();
        if (gender === "male" || gender === "m") return "Mr.";
        if (gender === "female" || gender === "f") return "Ms.";
        return "";
    }, [user?.gender]);

    const displayName = useMemo(() => {
        const username = (user?.username || "").trim();
        if (username) return username;
        const firstName = (user?.name || "").split(",")[0]?.trim();
        return firstName || "Team";
    }, [user?.name, user?.username]);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await getTeacherDailyCheckins(selectedDate, {
                grade: selectedGrade || undefined,
                className: selectedClassName || undefined
            });
            const data = response?.data?.data || response?.data || null;
            setPayload(data);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load student check-ins.");
        } finally {
            setLoading(false);
        }
    }, [selectedDate, selectedGrade, selectedClassName]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const stats = payload?.stats || {
        totalStudents: 0,
        submittedToday: 0,
        notSubmitted: 0,
        needsSupport: 0
    };

    const students = useMemo(
        () => (Array.isArray(payload?.students) ? payload.students : []),
        [payload?.students]
    );

    const gradeOptions = useMemo(() => {
        const options = Array.from(new Set(students.map((student) => student?.currentGrade).filter(Boolean)));
        return options.sort((a, b) => {
            const aKey = gradeSortKey(a);
            const bKey = gradeSortKey(b);
            if (aKey !== bKey) return aKey - bKey;
            return a.localeCompare(b);
        });
    }, [students]);

    const classOptions = useMemo(() => {
        const source = selectedGrade
            ? students.filter((student) => student?.currentGrade === selectedGrade)
            : students;
        return Array.from(new Set(source.map((student) => student?.className).filter(Boolean)))
            .sort((a, b) => a.localeCompare(b));
    }, [selectedGrade, students]);

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            if (selectedGrade && student?.currentGrade !== selectedGrade) return false;
            if (selectedClassName && student?.className !== selectedClassName) return false;
            if (!normalizedQuery) return true;

            return [
                student?.name,
                student?.email,
                student?.currentGrade,
                student?.className,
                student?.nickname
            ]
                .filter(Boolean)
                .some((field) => field.toLowerCase().includes(normalizedQuery));
        });
    }, [normalizedQuery, selectedClassName, selectedGrade, students]);

    const subtitle = isPrincipalView
        ? "Track student emotional wellbeing by grade, class, and support urgency."
        : "Showing check-ins for your assigned class scope.";

    const roleHeading = isPrincipalView ? "Student Emotional Dashboard" : "Student Daily Check-in Dashboard";
    const greetingLabel = isPrincipalView
        ? `Hi ${honorific ? `${honorific} ${displayName}` : displayName}, here is your student wellbeing pulse.`
        : `Hi ${honorific ? `${honorific} ${displayName}` : displayName}, here is today's class pulse.`;

    return (
        <div className="min-h-screen text-foreground relative overflow-hidden">
            <div className="relative z-10 container-tight py-6">
                <div className="glass glass-card p-5 md:p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">{roleHeading}</p>
                            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">{greetingLabel}</h1>
                            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{selectedDate}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {isPrincipalView && scopeUnit && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                Unit: {scopeUnit}
                            </span>
                        )}
                        {isPrincipalView && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                Scope: {scope.gradeBand || "All Grades"}
                            </span>
                        )}
                        {!isPrincipalView && classLabels.map((label) => (
                            <span
                                key={label}
                                className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                            >
                                {label}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3 mb-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                        <div className="relative w-full lg:max-w-xs">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search students, class, or email"
                                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(event) => setSelectedDate(event.target.value)}
                                className="rounded-lg border border-border bg-background/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                            <button
                                type="button"
                                onClick={fetchDashboard}
                                className="rounded-lg bg-primary/90 text-white px-4 py-2 text-sm font-medium hover:bg-primary transition-colors"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>

                    {isPrincipalView && (
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                                <Filter className="w-3.5 h-3.5" />
                                Student filters
                            </div>
                            <select
                                value={selectedGrade}
                                onChange={(event) => {
                                    setSelectedGrade(event.target.value);
                                    setSelectedClassName("");
                                }}
                                className="rounded-lg border border-border bg-background/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                            >
                                <option value="">All Grades</option>
                                {gradeOptions.map((grade) => (
                                    <option key={grade} value={grade}>{grade}</option>
                                ))}
                            </select>
                            <select
                                value={selectedClassName}
                                onChange={(event) => setSelectedClassName(event.target.value)}
                                className="rounded-lg border border-border bg-background/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                            >
                                <option value="">All Classes</option>
                                {classOptions.map((className) => (
                                    <option key={className} value={className}>{className}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Total Students", value: stats.totalStudents, icon: Users },
                        { label: "Submitted Today", value: stats.submittedToday, icon: CheckCircle2 },
                        { label: "Needs Support", value: stats.needsSupport, icon: AlertTriangle },
                        { label: "Not Submitted", value: stats.notSubmitted, icon: Users }
                    ].map((card) => (
                        <div key={card.label} className="glass glass-card p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <card.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
                                <p className="text-2xl font-semibold text-foreground">{card.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="glass glass-card p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                        <div>
                            <h2 className="text-lg font-semibold">Student check-ins</h2>
                            <p className="text-sm text-muted-foreground">
                                Showing {filteredStudents.length} of {students.length} students.
                            </p>
                        </div>
                        {loading && <p className="text-xs text-muted-foreground">Loading latest check-ins...</p>}
                    </div>

                    {error && (
                        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive mb-4">
                            {error}
                        </div>
                    )}

                    {!loading && filteredStudents.length === 0 && (
                        <div className="p-6 rounded-lg border border-dashed border-muted text-center text-sm text-muted-foreground">
                            No students found for this scope.
                        </div>
                    )}

                    <div className="space-y-3">
                        {filteredStudents.map((student) => {
                            const checkin = student.checkin;
                            const moods = Array.isArray(checkin?.selectedMoods) ? checkin.selectedMoods : [];
                            const needsSupport = checkin?.aiAnalysis?.needsSupport;

                            return (
                                <div
                                    key={student.id}
                                    className="p-4 rounded-xl border border-border/70 bg-card/40 backdrop-blur-sm"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                                        <div>
                                            <p className="text-base font-semibold text-foreground">
                                                {student.nickname || student.name || "Unnamed student"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {student.currentGrade || "Grade"} - {student.className || "Class"}
                                            </p>
                                            {student.email && (
                                                <p className="text-xs text-muted-foreground">{student.email}</p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {checkin ? (
                                                <>
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                        {toTitleCase(checkin.weatherType || "Check-in")}
                                                    </span>
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                                                        P {checkin.presenceLevel ?? "-"} / C {checkin.capacityLevel ?? "-"}
                                                    </span>
                                                    {needsSupport && (
                                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                                                            Needs support
                                                        </span>
                                                    )}
                                                    {moods.slice(0, 3).map((mood) => (
                                                        <span
                                                            key={mood}
                                                            className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                                                        >
                                                            {toTitleCase(mood)}
                                                        </span>
                                                    ))}
                                                    {moods.length > 3 && (
                                                        <span className="text-xs text-muted-foreground">
                                                            +{moods.length - 3} more
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                    Not submitted
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmotionalCheckinTeacherDashboard;
