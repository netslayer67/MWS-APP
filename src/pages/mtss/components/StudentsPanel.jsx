import React, { memo, useMemo, useState, useCallback, useDeferredValue } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import StudentsTable from "./StudentsTable";
import QuickUpdateModal from "./QuickUpdateModal";

const tierFilters = ["All", "Tier 1", "Tier 2", "Tier 3"];

const StudentsPanel = memo(({ students, TierPill, ProgressBadge }) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [activeTier, setActiveTier] = useState("All");
    const [query, setQuery] = useState("");
    const [modalState, setModalState] = useState({ type: null, student: null });

    const deferredQuery = useDeferredValue(query.trim().toLowerCase());

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const matchesTier = activeTier === "All" || student.tier === activeTier;
            if (!deferredQuery) return matchesTier;
            const searchPool = `${student.name} ${student.type}`.toLowerCase();
            return matchesTier && searchPool.includes(deferredQuery);
        });
    }, [students, activeTier, deferredQuery]);

    const handleView = useCallback(
        (student) => {
            navigate(`/mtss/student/${student.slug}`);
        },
        [navigate],
    );

    const handleOpen = useCallback((type, student) => setModalState({ type, student }), []);
    const handleClose = useCallback(() => setModalState({ type: null, student: null }), []);

    const handleQuickSubmit = useCallback(
        (student, formState) => {
            toast({
                title: "Progress update saved",
                description: `${student.name}'s update was recorded!`,
            });
            handleClose();
        },
        [toast, handleClose],
    );

    return (
        <div className="space-y-6 mtss-theme">
            <motion.div className="glass glass-card mtss-card-surface mtss-rainbow-shell p-5 flex flex-col gap-4 border border-primary/10" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
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
                        >
                            {tier}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search kids or boost type..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/70 dark:bg-white/10 border border-primary/20 focus:ring-2 focus:ring-primary/40 focus:outline-none placeholder:text-muted-foreground/70 dark:placeholder:text-white/40"
                    />
                </div>
            </motion.div>

            <motion.section
                className="glass glass-card mtss-card-surface mtss-rainbow-shell p-6 space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <p className="uppercase text-xs text-muted-foreground tracking-[0.4em]">Crew Roster</p>
                        <h2 className="text-2xl font-bold text-foreground dark:text-white">Active boosts in motion</h2>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Showing <strong>{filteredStudents.length}</strong> of {students.length} students
                    </div>
                </div>
                <StudentsTable
                    students={filteredStudents}
                    TierPill={TierPill}
                    ProgressBadge={ProgressBadge}
                    showActions
                    onView={handleView}
                    onUpdate={(student) => handleOpen("update", student)}
                />
            </motion.section>

            {modalState.type === "update" && (
                <QuickUpdateModal
                    student={modalState.student}
                    onClose={handleClose}
                    onSubmit={handleQuickSubmit}
                />
            )}
        </div>
    );
});

StudentsPanel.displayName = "StudentsPanel";
export default StudentsPanel;
