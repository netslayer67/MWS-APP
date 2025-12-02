import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Search, Sparkles } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { createMentorAssignment, fetchMtssMentors, fetchMtssStudents } from "@/services/mtssService";
import { useToast } from "@/components/ui/use-toast";
import { deriveTeacherSegments, normalizeGradeLabel } from "@/pages/mtss/utils/teacherDashboardUtils";

const STUDENT_LIMIT = 650;
const tierOptions = [
    { label: "Tier 2 - Targeted", value: "tier2" },
    { label: "Tier 3 - Intensive", value: "tier3" },
];

const AdminMentorAssignPage = () => {
    const { mentorId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [mentor, setMentor] = useState(() => location.state?.mentor || null);
    const [students, setStudents] = useState([]);
    const [tier, setTier] = useState("tier2");
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [focusInput, setFocusInput] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [visibleCount, setVisibleCount] = useState(10);

    useEffect(() => {
        setSelectedIds([]);
        setSearch("");
        setFocusInput("");
        setNotes("");
        setTier("tier2");
        setVisibleCount(10);
    }, [mentorId]);

    useEffect(() => {
        if (location.state?.mentor) {
            setMentor(location.state.mentor);
        }
    }, [location.state]);

    useEffect(() => {
        let ignore = false;
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [mentorResponse, studentResponse] = await Promise.all([
                    fetchMtssMentors(),
                    fetchMtssStudents({ limit: STUDENT_LIMIT }),
                ]);

                if (ignore) return;

                const resolvedMentor =
                    (mentorResponse?.mentors || []).find((item) => {
                        const key = (item._id || item.id || "").toString();
                        return key === mentorId;
                    }) || location.state?.mentor || null;

                if (!resolvedMentor) {
                    setError("Mentor not found or not registered.");
                } else {
                    setMentor(resolvedMentor);
                }

                const roster = (studentResponse?.students || [])
                    .slice()
                    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                setStudents(roster);
            } catch (err) {
                if (ignore) return;
                setError(err?.response?.data?.message || err.message || "Failed to load MTSS data.");
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            ignore = true;
        };
    }, [mentorId, location.state]);

    const mentorSegments = useMemo(() => deriveTeacherSegments(mentor || {}), [mentor]);

    const filteredStudents = useMemo(() => {
        const query = search.trim().toLowerCase();
        return students.filter((student) => {
            const gradeLabel = normalizeGradeLabel(
                student.grade || student.currentGrade || student.className || student.type || "",
            );
            const matchesGrade =
                !mentorSegments.allowedGrades.length || mentorSegments.allowedGrades.includes(gradeLabel);

            if (!matchesGrade) return false;
            if (!query) return true;

            const name = student.name?.toLowerCase() || "";
            const grade = gradeLabel.toLowerCase();
            const cls = (student.className || "").toLowerCase();
            return name.includes(query) || grade.includes(query) || cls.includes(query);
        });
    }, [students, search, mentorSegments.allowedGrades]);

    const visibleStudents = useMemo(() => filteredStudents.slice(0, visibleCount), [filteredStudents, visibleCount]);

    const selectedStudents = useMemo(
        () => students.filter((student) => selectedIds.includes(student.id || student._id)),
        [students, selectedIds],
    );

    const toggleSelection = (studentId) => {
        setSelectedIds((prev) => (prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!mentor?._id) {
            toast({
                title: "Mentor not ready",
                description: "We could not find mentor data for this assignment.",
                variant: "destructive",
            });
            return;
        }
        if (selectedIds.length < 2) {
            toast({
                title: "Select at least two students",
                description: "MTSS Tier 2 thrives on tight-knit groups, so add another student to keep it collaborative.",
                variant: "destructive",
            });
            return;
        }

        setSubmitting(true);
        try {
            const focusAreas = focusInput
                ? focusInput
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean)
                : [];
            await createMentorAssignment({
                mentorId: mentor._id,
                studentIds: selectedIds,
                tier,
                focusAreas,
                notes: notes.trim(),
            });
            toast({
                title: "New caseload created",
                description: `Paired ${mentor.name} with ${selectedIds.length} students.`,
            });
            navigate("/mtss/admin");
        } catch (err) {
            toast({
                title: "Failed to save assignment",
                description: err?.response?.data?.message || err.message || "A server error occurred.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const renderContent = () => (
        <div className="max-w-5xl mx-auto space-y-8" data-aos="fade-up" data-aos-delay="120">
            <button
                type="button"
                onClick={() => navigate("/mtss/admin")}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#d8b4fe]/90 via-[#fbcfe8]/90 to-[#fde68a]/90 dark:from-[#312e81]/80 dark:via-[#4c1d95]/80 dark:to-[#083344]/80 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-white shadow-lg shadow-rose-200/40 dark:shadow-none hover:-translate-y-0.5 transition duration-300"
                data-aos="fade-right"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Mentor Squad
            </button>

            <div className="relative overflow-hidden rounded-[34px] border border-white/40 dark:border-white/10 bg-gradient-to-br from-white/95 via-white/70 to-white/40 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-slate-900/45 shadow-[0_35px_120px_rgba(15,23,42,0.35)] backdrop-blur-3xl p-6 sm:p-10 space-y-8">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-16 -right-12 w-56 h-56 bg-gradient-to-br from-[#f472b6]/40 via-[#fcd34d]/30 to-transparent blur-3xl" />
                    <div className="absolute -bottom-10 left-8 w-48 h-48 bg-gradient-to-br from-[#22d3ee]/35 via-transparent to-transparent blur-3xl" />
                </div>
                <div className="relative space-y-4" data-aos="fade-up" data-aos-delay="200">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#c7d2fe] via-[#fbcfe8] to-[#fecdd3] text-xs font-semibold text-slate-700 dark:text-white shadow-inner">
                        <Sparkles className="w-4 h-4 text-rose-500" />
                        Assign Students
                    </div>
                    <div className="flex flex-wrap items-start gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-3xl bg-white/80 text-slate-900 font-black flex items-center justify-center shadow-inner shadow-white/40">
                                {mentor?.name
                                    ?.split(" ")
                                    .map((part) => part[0])
                                    .slice(0, 2)
                                    .join("") || "??"}
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white">{mentor?.name || "Mentor"}</h1>
                                <p className="text-sm font-semibold text-slate-600 dark:text-white/70">{mentor?.jobPosition || mentor?.role || "Teacher"}</p>
                            </div>
                        </div>
                        <div className="ml-auto text-right text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-white/60">
                            <p>Tier focus</p>
                            <p className="text-base font-black tracking-normal text-slate-900 dark:text-white">{tierOptions.find((option) => option.value === tier)?.label}</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-white/70 max-w-2xl">
                        Select at least two students to keep the small-group energy collaborative. Focus areas and notes stay optional so the flow remains light but intentional.
                    </p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-white/60">
                        Caseload scope: {mentorSegments.allowedGrades.length ? mentorSegments.allowedGrades.join(", ") : mentor?.unit || "All Grades"}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3" data-aos="fade-up" data-aos-delay="240">
                        <div className="rounded-2xl bg-white/80 dark:bg-white/5 border border-white/60 dark:border-white/10 px-4 py-3 shadow-inner">
                            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-slate-500 dark:text-white/60">Selected</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedIds.length}</p>
                        </div>
                        <div className="rounded-2xl bg-gradient-to-r from-[#e0f2fe] via-[#ecfeff] to-[#fef3c7] dark:from-[#0d2538] dark:via-[#13213c] dark:to-[#2a1a3f] border border-white/60 dark:border-white/10 px-4 py-3 shadow-inner">
                            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-slate-500 dark:text-white/60">Tier</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white">
                                {tierOptions.find((option) => option.value === tier)?.label}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white/80 dark:bg-white/10 border border-white/60 dark:border-white/10 px-4 py-3 shadow-inner">
                            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-slate-500 dark:text-white/60">Focus Area</p>
                            <p className="text-xs font-bold text-slate-700 dark:text-white line-clamp-1">
                                {focusInput || "Fluency boost, SEL routines"}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" data-aos="fade-up" data-aos-delay="260">
                    <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
                        <label className="space-y-2 text-sm font-semibold text-foreground dark:text-white">
                            <span className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                                Tier <span className="text-[10px] text-rose-500">Required</span>
                            </span>
                            <select
                                value={tier}
                                onChange={(event) => setTier(event.target.value)}
                                className="w-full rounded-2xl border border-border/50 bg-white/95 dark:bg-white/10 px-4 py-3 focus:ring-2 focus:ring-primary/40 shadow-inner"
                            >
                                {tierOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="space-y-2 text-sm font-semibold text-foreground dark:text-white">
                            <span className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                                Focus areas <span className="text-[10px] px-2 py-0.5 rounded-full border border-border/40 text-muted-foreground">Optional</span>
                            </span>
                            <input
                                value={focusInput}
                                onChange={(event) => setFocusInput(event.target.value)}
                                placeholder="Fluency boost, SEL routines"
                                className="w-full rounded-2xl border border-border/50 bg-white/95 dark:bg-white/10 px-4 py-3 focus:ring-2 focus:ring-primary/40 shadow-inner"
                            />
                        </label>
                    </div>

                    <label className="space-y-2 text-sm font-semibold text-foreground dark:text-white">
                        <span className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                            Notes <span className="text-[10px] px-2 py-0.5 rounded-full border border-border/40 text-muted-foreground">Optional</span>
                        </span>
                        <textarea
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            placeholder="Add optional context, routines, or student highlights..."
                            className="w-full h-28 rounded-2xl border border-border/50 bg-white/95 dark:bg-white/10 px-4 py-3 resize-none focus:ring-2 focus:ring-primary/40 shadow-inner"
                        />
                    </label>

                    {selectedStudents.length > 0 && (
                        <div
                            className="rounded-[24px] bg-gradient-to-r from-[#ecfeff]/90 via-[#fef9c3]/80 to-[#fce7f3]/80 dark:from-white/10 dark:via-white/5 dark:to-white/5 border border-white/60 dark:border-white/10 p-4 flex flex-wrap gap-2 text-sm"
                            data-aos="fade-up"
                            data-aos-delay="320"
                        >
                            {selectedStudents.slice(0, 6).map((student) => (
                                <span key={student.id || student._id} className="px-3 py-1 rounded-full bg-white/80 dark:bg-white/10 border border-white/60 dark:border-white/20 text-foreground dark:text-white">
                                    {student.name}
                                </span>
                            ))}
                            {selectedStudents.length > 6 && (
                                <span className="px-3 py-1 rounded-full bg-white/70 dark:bg-white/10 border border-white/40 dark:border-white/20 text-muted-foreground">
                                    +{selectedStudents.length - 6} more
                                </span>
                            )}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-foreground dark:text-white">Select at least two students for this caseload</p>
                <p className="text-xs text-muted-foreground">
                    Scroll gently — students load 10 at a time for smoother performance.
                </p>
                            </div>
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search name, grade, or class..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border/60 bg-white/95 dark:bg-white/10 text-sm focus:ring-2 focus:ring-primary/40"
                                />
                            </div>
                        </div>

                        <div
                            className="max-h-[360px] overflow-y-auto rounded-[28px] border border-white/60 dark:border-white/10 bg-gradient-to-br from-white/95 via-[#fdf2f8]/80 to-[#ecfeff]/80 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-slate-900/40 p-5 space-y-3 custom-scroll backdrop-blur-xl"
                            data-aos="fade-up"
                            data-aos-delay="360"
                        >
                            {!students.length ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3 text-sm font-semibold text-muted-foreground">
                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                    <p>Fetching roster...</p>
                                    <p className="text-xs text-muted-foreground/80">
                                        Scroll softly - students load in micro-batches.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {visibleStudents.map((student, index) => (
                                        <label
                                            key={student.id || student._id}
                                            className="flex items-start gap-3 text-sm text-foreground dark:text-white cursor-pointer rounded-2xl border border-white/60 dark:border-white/10 bg-white/85 dark:bg-white/5 px-3 py-2 shadow-sm hover:border-primary/40 transition"
                                            data-aos="fade-up"
                                            data-aos-delay={380 + index * 20}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(student.id || student._id)}
                                                onChange={() => toggleSelection(student.id || student._id)}
                                                className="mt-1 rounded border-border/60 accent-primary w-4 h-4"
                                            />
                                            <div>
                                                <p className="font-semibold">{student.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {student.grade || "No grade"} &middot; {student.className || student.type || "MTSS"}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                    {!visibleStudents.length && (
                                        <p className="text-sm text-muted-foreground text-center py-6">
                                            No students match the search.
                                        </p>
                                    )}
                                    {visibleStudents.length < filteredStudents.length && (
                                        <button
                                            type="button"
                                            onClick={() => setVisibleCount((prev) => prev + 10)}
                                            className="w-full text-sm font-semibold text-primary px-4 py-3 rounded-2xl border border-primary/30 bg-white/70 dark:bg-white/10 hover:bg-white transition"
                                        >
                                            Load 10 more students
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() => navigate("/mtss/admin")}
                            className="px-4 py-2 rounded-full border border-border/60 text-sm font-semibold text-foreground dark:text-white bg-white/80 dark:bg-white/5 hover:shadow"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || selectedIds.length < 2}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold text-white transition ${
                                submitting || selectedIds.length < 2
                                    ? "bg-muted cursor-not-allowed opacity-60"
                                    : "bg-gradient-to-r from-[#22d3ee] via-[#3b82f6] to-[#a855f7] shadow-xl hover:-translate-y-0.5"
                            }`}
                        >
                            {submitting ? "Assigning..." : "Assign Selected"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0f2fe] via-[#fdf2f8] to-[#fefce8]">
                <div className="flex flex-col items-center gap-3 text-sm font-semibold text-slate-600">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span>Loading mentor & student data...</span>
                </div>
            </div>
        );
    }

    if (error || !mentor) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0f2fe] via-[#fdf2f8] to-[#fefce8] p-4">
                <div className="max-w-md w-full rounded-3xl border border-white/40 bg-white/90 shadow-xl p-6 text-center space-y-4">
                    <p className="text-lg font-semibold text-destructive">{error || "Mentor not found."}</p>
                    <p className="text-sm text-muted-foreground">Please head back to the dashboard and try another mentor.</p>
                    <button
                        type="button"
                        onClick={() => navigate("/mtss/admin")}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#22d3ee] via-[#3b82f6] to-[#a855f7] text-white font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden px-4 py-8 sm:px-6 lg:px-10 bg-gradient-to-br from-[#dbeafe] via-[#fdf2f8] to-[#fef9c3] dark:from-[#0f172a] dark:via-[#111827] dark:to-[#1e1b4b]">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-32 left-4 w-64 h-64 bg-[#a5b4fc]/30 blur-[160px]" />
                <div className="absolute top-10 right-10 w-72 h-72 bg-[#f472b6]/25 blur-[180px]" />
                <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#fde68a]/30 blur-[180px]" />
            </div>
            <div className="relative z-10">{renderContent()}</div>
        </div>
    );
};

AdminMentorAssignPage.displayName = "AdminMentorAssignPage";
export default AdminMentorAssignPage;
