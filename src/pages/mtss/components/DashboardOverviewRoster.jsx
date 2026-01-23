import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import StudentsTable from "./StudentsTable";

const BATCH = 10;

const DashboardOverviewRoster = ({ students, TierPill, ProgressBadge, onView, onUpdate }) => {
    const [visibleCount, setVisibleCount] = useState(BATCH);

    useEffect(() => {
        setVisibleCount(BATCH);
    }, [students.length]);

    const visibleStudents = useMemo(
        () => (students || []).slice(0, Math.min(visibleCount, students.length)),
        [students, visibleCount],
    );

    return (
        <section className="glass glass-card mtss-card-surface mtss-rainbow-shell p-6 md:p-8 space-y-6 border border-primary/10">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <p className="uppercase text-xs text-muted-foreground tracking-[0.4em]">Fresh Updates</p>
                    <h2 className="text-2xl font-bold text-foreground dark:text-white">Kids on your radar today</h2>
                </div>
                <motion.button
                    className="mtss-rainbow-chip px-5 py-2 text-sm font-semibold"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                >
                    Quick Add
                </motion.button>
            </header>
            <div data-aos="fade-up" data-aos-delay="120">
                <StudentsTable
                    students={visibleStudents}
                    TierPill={TierPill}
                    ProgressBadge={ProgressBadge}
                    dense
                    showActions
                    onView={onView}
                    onUpdate={onUpdate}
                />
            </div>
            <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground" data-aos="fade-up" data-aos-delay="180">
                {visibleStudents.length < students.length ? (
                    <button
                        type="button"
                        onClick={() => setVisibleCount((prev) => Math.min(students.length, prev + BATCH))}
                        className="px-4 py-2 rounded-full bg-white/80 dark:bg-white/10 border border-primary/30 text-sm font-semibold text-primary shadow-sm hover:-translate-y-0.5 transition"
                    >
                        Load 10 more kids ({visibleStudents.length}/{students.length})
                    </button>
                ) : (
                    <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-200 border border-emerald-200/70 dark:border-emerald-500/30">
                        All kids loaded
                    </span>
                )}
            </div>
        </section>
    );
};

export default DashboardOverviewRoster;
