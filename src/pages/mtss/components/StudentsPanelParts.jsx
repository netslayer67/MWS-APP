import { Search, Filter } from "lucide-react";

export const tierFilters = ["All", "Tier 1", "Tier 2", "Tier 3"];
export const STUDENTS_PANEL_BATCH = 10;

export const FilterBar = ({ activeTier, setActiveTier, query, setQuery }) => (
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

export const RosterHeader = ({ visible, total }) => (
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

export const LoadMore = ({ visible, total, onLoadMore }) => (
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
