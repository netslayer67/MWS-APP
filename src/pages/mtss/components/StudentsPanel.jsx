import React, { memo, useMemo, useState, useCallback, useDeferredValue, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import StudentsTable from "./StudentsTable";
import QuickUpdateModal from "./QuickUpdateModal";
import { updateMentorAssignment } from "@/services/mtssService";

const tierFilters = ["All", "Tier 1", "Tier 2", "Tier 3"];
const BATCH = 10;

const FilterBar = ({ activeTier, setActiveTier, query, setQuery }) => (
    <div
        className="rounded-[28px] border border-white/40 bg-white/90 dark:bg-white/5 p-5 flex flex-col gap-4 shadow-[0_10px_32px_rgba(15,23,42,0.12)]"
        data-aos="fade-up"
        data-aos-delay="40"
    >
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Filter className="w-4 h-4" />
            Quick filters
        </div>
        <div className="flex flex-wrap gap-2">
            {tierFilters.map((tier) => (
                <button
                    key={tier}
                    onClick={() => setActiveTier(tier)}
                    className={`mtss-filter-chip ${activeTier === tier ? "mtss-filter-chip--active" : ""}`}
                    data-aos="zoom-in"
                    data-aos-delay="80"
                >
                    {tier}
                </button>
            ))}
        </div>
        <div className="relative" data-aos="fade-up" data-aos-delay="100">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
                type="text"
                placeholder="Search kids or boost type..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/70 dark:bg-white/10 border border-primary/20 focus:ring-2 focus:ring-primary/40 focus:outline-none placeholder:text-muted-foreground/70 dark:placeholder:text-white/40"
            />
        </div>
    </div>
);

const RosterHeader = ({ visible, total }) => (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3" data-aos="fade-up" data-aos-delay="60">
        <div>
            <p className="uppercase text-xs text-muted-foreground tracking-[0.4em]">Crew Roster</p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Kids on your radar today</h2>
        </div>
        <div className="text-sm text-muted-foreground">
            Showing <strong>{visible}</strong> of {total} filtered students
        </div>
    </div>
);

const LoadMore = ({ visible, total, onLoadMore }) => (
    <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground py-3" data-aos="fade-up" data-aos-delay="160">
        {visible < total ? (
            <button
                type="button"
                onClick={onLoadMore}
                className="px-4 py-2 rounded-full bg-white/80 dark:bg-white/10 border border-primary/30 text-sm font-semibold text-primary shadow-sm hover:-translate-y-0.5 transition"
            >
                Load 10 more kids ({visible}/{total})
            </button>
        ) : (
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-200 border border-emerald-200/70 dark:border-emerald-500/30">
                All kids loaded
            </span>
        )}
    </div>
);

const StudentsPanel = memo(({ students, TierPill, ProgressBadge, onRefresh }) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [activeTier, setActiveTier] = useState("All");
    const [query, setQuery] = useState("");
    const [modalState, setModalState] = useState({ type: null, student: null });
    const [savingUpdate, setSavingUpdate] = useState(false);
    const [visibleCount, setVisibleCount] = useState(BATCH);

    const deferredQuery = useDeferredValue(query.trim().toLowerCase());

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const matchesTier = activeTier === "All" || student.tier === activeTier;
            if (!deferredQuery) return matchesTier;
            const searchPool = `${student.name} ${student.type}`.toLowerCase();
            return matchesTier && searchPool.includes(deferredQuery);
        });
    }, [students, activeTier, deferredQuery]);

    const visibleStudents = useMemo(
        () => filteredStudents.slice(0, Math.min(visibleCount, filteredStudents.length)),
        [filteredStudents, visibleCount],
    );

    useEffect(() => {
        setVisibleCount(BATCH);
    }, [activeTier, deferredQuery, students.length]);

    const handleView = useCallback(
        (student) => {
            navigate(`/mtss/student/${student.slug}`);
        },
        [navigate],
    );

    const handleOpen = useCallback((type, student) => setModalState({ type, student }), []);
    const handleClose = useCallback(() => setModalState({ type: null, student: null }), []);

    const handleQuickSubmit = useCallback(
        async (student, formState) => {
            if (!student?.assignmentId) {
                toast({
                    title: "No active intervention",
                    description: `${student?.name || "Student"} isn't linked to an active intervention yet.`,
                    variant: "destructive",
                });
                return;
            }
            setSavingUpdate(true);
            try {
                await updateMentorAssignment(student.assignmentId, {
                    checkIns: [
                        {
                            date: formState.date,
                            summary: formState.notes || "Quick update",
                            nextSteps: formState.notes,
                            value: formState.scoreValue ? Number(formState.scoreValue) : undefined,
                            unit: formState.scoreUnit,
                            performed: formState.performed === "yes",
                            celebration: formState.badge,
                        },
                    ],
                });
                toast({
                    title: "Progress update saved",
                    description: `${student.name}'s update was recorded!`,
                });
                handleClose();
                onRefresh?.();
            } catch (error) {
                toast({
                    title: "Failed to save update",
                    description: error?.response?.data?.message || error.message || "Please try again in a moment.",
                    variant: "destructive",
                });
            } finally {
                setSavingUpdate(false);
            }
        },
        [toast, handleClose, onRefresh],
    );

    return (
        <div className="space-y-6 mtss-theme">
            <FilterBar activeTier={activeTier} setActiveTier={setActiveTier} query={query} setQuery={setQuery} />

            <section
                className="rounded-[32px] border border-white/40 bg-white/95 dark:bg-slate-900/40 p-6 space-y-4 shadow-[0_14px_48px_rgba(15,23,42,0.14)]"
                data-aos="fade-up"
                data-aos-delay="80"
            >
                <RosterHeader visible={visibleStudents.length} total={filteredStudents.length} />

                <div data-aos="fade-up" data-aos-delay="120">
                    <StudentsTable
                        students={visibleStudents}
                        TierPill={TierPill}
                        ProgressBadge={ProgressBadge}
                        showActions
                        onView={handleView}
                        onUpdate={(student) => handleOpen("update", student)}
                    />
                </div>

                <LoadMore
                    visible={visibleStudents.length}
                    total={filteredStudents.length}
                    onLoadMore={() => setVisibleCount((prev) => Math.min(filteredStudents.length, prev + BATCH))}
                />
            </section>

            {modalState.type === "update" && (
                <QuickUpdateModal
                    student={modalState.student}
                    onClose={handleClose}
                    onSubmit={handleQuickSubmit}
                    submitting={savingUpdate}
                />
            )}
        </div>
    );
});

StudentsPanel.displayName = "StudentsPanel";
export default StudentsPanel;
