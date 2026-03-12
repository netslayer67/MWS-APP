import { memo, useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { animate, stagger } from "animejs";

/* ── Tier visual config ─────────────────────────────────────── */
const CHIP = {
    tier3: {
        bg: "bg-rose-50/90 dark:bg-rose-950/35",
        border: "border-rose-200/70 dark:border-rose-700/35",
        text: "text-rose-800 dark:text-rose-200",
        badge: "bg-gradient-to-r from-rose-500 to-pink-500",
        pulse: true,
    },
    tier2: {
        bg: "bg-amber-50/90 dark:bg-amber-950/35",
        border: "border-amber-200/70 dark:border-amber-700/35",
        text: "text-amber-800 dark:text-amber-200",
        badge: "bg-gradient-to-r from-amber-500 to-orange-500",
        pulse: false,
    },
    tier1: {
        bg: "bg-emerald-50/90 dark:bg-emerald-950/35",
        border: "border-emerald-200/70 dark:border-emerald-700/35",
        text: "text-emerald-800 dark:text-emerald-200",
        badge: "bg-gradient-to-r from-emerald-500 to-teal-500",
        pulse: false,
    },
};

const ICONS = {
    SEL: "\uD83D\uDC96",
    ENGLISH: "\uD83D\uDCDA",
    MATH: "\uD83D\uDD22",
    BEHAVIOR: "\u2B50",
    ATTENDANCE: "\uD83D\uDCDD",
    INDONESIAN: "\uD83C\uDDEE\uD83C\uDDE9",
};
const UNIVERSAL_ICON = "\uD83C\uDF1F";
const PRIORITY = { tier3: 3, tier2: 2, tier1: 1 };

/* ── Accent bar helpers (exported for row components) ──────── */
const TIER_ACCENT = {
    tier3: "from-rose-500 to-pink-500",
    tier2: "from-amber-500 to-orange-500",
};
const FALLBACK_ACCENT = [
    "from-indigo-500 to-purple-500",
    "from-cyan-500 to-blue-500",
    "from-emerald-500 to-teal-500",
    "from-sky-500 to-indigo-500",
    "from-violet-500 to-purple-500",
];

export const getMaxTierCode = (interventions = []) => {
    const active = interventions.filter(
        (e) => e.hasData || e.tierCode === "tier2" || e.tierCode === "tier3",
    );
    if (!active.length) return "tier1";
    if (active.some((e) => e.tierCode === "tier3")) return "tier3";
    if (active.some((e) => e.tierCode === "tier2")) return "tier2";
    return "tier1";
};

export const getAccentColor = (interventions = [], index = 0) => {
    const max = getMaxTierCode(interventions);
    return TIER_ACCENT[max] || FALLBACK_ACCENT[index % FALLBACK_ACCENT.length];
};

export const getActiveList = (interventions = []) =>
    interventions.filter(
        (e) => e.hasData || e.tierCode === "tier2" || e.tierCode === "tier3",
    );

/* ── Reduced-motion check ───────────────────────────────────── */
const prefersReducedMotion = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Single Chip ────────────────────────────────────────────── */
const SingleChip = ({ iv, compact, extra = false }) => {
    const s = CHIP[iv.tierCode] || CHIP.tier1;
    const icon = ICONS[iv.type] || "\uD83D\uDCCB";
    const tierNum = iv.tierCode?.replace("tier", "") || "1";

    return (
        <span
            data-chip={extra ? undefined : ""}
            data-chip-extra={extra ? "" : undefined}
            className={`inline-flex items-center gap-1 ${compact ? "px-1.5 py-[3px]" : "px-2 py-1"} rounded-xl border ${s.bg} ${s.border} hover:scale-[1.04] hover:shadow-md transition-all duration-200 cursor-default`}
            title={`${iv.label} — ${iv.tier}${iv.strategies?.[0] ? ` · ${iv.strategies[0]}` : ""}`}
        >
            <span className={`${compact ? "text-[10px]" : "text-xs"} leading-none`}>{icon}</span>
            <span className={`font-semibold ${s.text} ${compact ? "text-[9px]" : "text-[10px]"} truncate max-w-[62px]`}>
                {iv.label}
            </span>
            <span className={`${compact ? "px-1 text-[7px]" : "px-1.5 text-[8px]"} py-px rounded-lg font-bold text-white shadow-sm ${s.badge} ${s.pulse ? "animate-pulse" : ""}`}>
                T{tierNum}
            </span>
        </span>
    );
};

/* ── Chevron SVG (shared, flippable) ────────────────────────── */
const Chevron = ({ up = false, className = "" }) => (
    <svg className={className} viewBox="0 0 16 16" fill="none">
        <path
            d={up ? "M4.5 10L8 6.5 11.5 10" : "M4.5 6L8 9.5 11.5 6"}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

/* ── Overflow "+N" pill ─────────────────────────────────────── */
const OverflowPill = ({ count, onClick, compact, innerRef }) => (
    <button
        ref={innerRef}
        type="button"
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`
            inline-flex items-center gap-0.5
            ${compact ? "px-1.5 py-[3px] text-[8px]" : "px-2 py-1 text-[10px]"}
            rounded-xl border font-semibold
            bg-slate-100/80 dark:bg-slate-800/40
            border-slate-200/60 dark:border-slate-700/40
            text-slate-600 dark:text-slate-300
            hover:bg-slate-200/90 dark:hover:bg-slate-700/50
            active:scale-95
            transition-colors duration-200 cursor-pointer
        `}
    >
        +{count}
        <Chevron className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
    </button>
);

/* ── Collapse "▴" pill ──────────────────────────────────────── */
const CollapsePill = ({ onClick, compact, innerRef }) => (
    <button
        ref={innerRef}
        type="button"
        data-collapse=""
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`
            inline-flex items-center gap-0.5
            ${compact ? "px-1.5 py-[3px] text-[8px]" : "px-2 py-1 text-[10px]"}
            rounded-xl border font-semibold
            bg-slate-100/60 dark:bg-slate-800/30
            border-slate-200/50 dark:border-slate-700/30
            text-slate-400 dark:text-slate-500
            hover:text-slate-600 dark:hover:text-slate-300
            hover:bg-slate-200/70 dark:hover:bg-slate-700/40
            active:scale-95 transition-colors duration-200 cursor-pointer
        `}
    >
        <Chevron up className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
    </button>
);

/* ── Universal summary pill (all T1) ───────────────────────── */
const UniversalSummary = ({ count, onClick, compact, innerRef }) => (
    <button
        ref={innerRef}
        type="button"
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`
            inline-flex items-center gap-1.5
            ${compact ? "px-2 py-[3px]" : "px-2.5 py-1"}
            rounded-xl border
            bg-emerald-50/90 dark:bg-emerald-950/30
            border-emerald-200/60 dark:border-emerald-700/30
            hover:bg-emerald-100/90 dark:hover:bg-emerald-900/40
            hover:shadow-sm
            active:scale-[0.98]
            transition-colors duration-200 cursor-pointer
        `}
    >
        <span className={compact ? "text-[10px]" : "text-xs"}>{UNIVERSAL_ICON}</span>
        <span className={`font-semibold text-emerald-700 dark:text-emerald-300 ${compact ? "text-[9px]" : "text-[10px]"}`}>
            Universal
        </span>
        <span className={`${compact ? "px-1 text-[7px]" : "px-1.5 text-[8px]"} py-px rounded-lg font-bold text-white shadow-sm bg-gradient-to-r from-emerald-500 to-teal-500`}>
            T1
        </span>
        <span className={`${compact ? "text-[8px]" : "text-[9px]"} text-emerald-500/70 dark:text-emerald-400/50 font-medium`}>
            · {count} subj
        </span>
        <Chevron className={`${compact ? "w-2.5 h-2.5" : "w-3 h-3"} text-emerald-400`} />
    </button>
);

/* ════════════════════════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════════════════════════ */
const InterventionChips = memo(({ interventions = [], compact = false, scroll = false }) => {
    const [showExtra, setShowExtra] = useState(false);
    const containerRef = useRef(null);
    const overflowRef = useRef(null);
    const collapseRef = useRef(null);
    const universalRef = useRef(null);
    const mountAnimated = useRef(false);
    const busy = useRef(false);

    /* ── anime.js spring entrance on first mount ──────────── */
    useEffect(() => {
        if (mountAnimated.current || !containerRef.current || prefersReducedMotion()) return;
        mountAnimated.current = true;
        const chips = containerRef.current.querySelectorAll("[data-chip]");
        if (!chips.length) return;

        // Set initial invisible state instantly
        gsap.set(chips, { opacity: 0, y: 8, scale: 0.88 });

        // anime.js spring stagger entrance — organic & bouncy
        animate(chips, {
            opacity: [0, 1],
            translateY: [8, 0],
            scale: [0.88, 1],
            delay: stagger(55, { start: 30 }),
            duration: 420,
            ease: "out(3)",
        });
    }, []);

    /* ── GSAP expand: stagger extra chips in ──────────────── */
    useEffect(() => {
        if (!showExtra || !containerRef.current || prefersReducedMotion()) {
            if (showExtra) busy.current = false;
            return;
        }

        const extras = containerRef.current.querySelectorAll("[data-chip-extra]");
        const collapseEl = collapseRef.current;
        if (!extras.length && !collapseEl) { busy.current = false; return; }

        const tl = gsap.timeline({
            onComplete: () => { busy.current = false; },
        });

        if (extras.length) {
            tl.fromTo(
                extras,
                { opacity: 0, y: 10, scale: 0.82, rotateX: -15 },
                {
                    opacity: 1, y: 0, scale: 1, rotateX: 0,
                    duration: 0.38,
                    stagger: 0.065,
                    ease: "back.out(2.2)",
                },
            );
        }

        if (collapseEl) {
            tl.fromTo(
                collapseEl,
                { opacity: 0, scale: 0.6, rotate: -90 },
                { opacity: 1, scale: 1, rotate: 0, duration: 0.3, ease: "back.out(2)" },
                extras.length ? "-=0.18" : 0,
            );
        }
    }, [showExtra]);

    /* ── GSAP collapse: reverse stagger out, then hide ────── */
    const handleCollapse = useCallback(() => {
        if (busy.current || !containerRef.current) return;
        if (prefersReducedMotion()) { setShowExtra(false); return; }
        busy.current = true;

        const extras = containerRef.current.querySelectorAll("[data-chip-extra]");
        const collapseEl = collapseRef.current;

        const tl = gsap.timeline({
            onComplete: () => {
                setShowExtra(false);
                busy.current = false;

                // Pop the overflow pill back in
                requestAnimationFrame(() => {
                    const pill = overflowRef.current || universalRef.current;
                    if (pill) {
                        gsap.fromTo(
                            pill,
                            { opacity: 0, scale: 0.7, y: 4 },
                            { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(2)" },
                        );
                    }
                });
            },
        });

        // Collapse button spins out
        if (collapseEl) {
            tl.to(collapseEl, {
                opacity: 0, scale: 0.5, rotate: 90,
                duration: 0.18, ease: "power2.in",
            });
        }

        // Chips reverse-stagger out (last → first)
        if (extras.length) {
            tl.to(extras, {
                opacity: 0, y: -8, scale: 0.82, rotateX: 12,
                stagger: { each: 0.04, from: "end" },
                duration: 0.22, ease: "power3.in",
            }, collapseEl ? "-=0.08" : 0);
        }
    }, []);

    /* ── Expand handler ───────────────────────────────────── */
    const handleExpand = useCallback(() => {
        if (busy.current) return;
        busy.current = true;

        // Animate the trigger pill out before expanding
        const pill = overflowRef.current || universalRef.current;
        if (pill && !prefersReducedMotion()) {
            gsap.to(pill, {
                opacity: 0, scale: 0.75, y: -4,
                duration: 0.18, ease: "power2.in",
                onComplete: () => setShowExtra(true),
            });
        } else {
            setShowExtra(true);
        }
    }, []);

    const active = getActiveList(interventions);

    /* ── Scroll mode: single horizontal strip, no expand/collapse ── */
    if (scroll) {
        const sorted = [...active].sort(
            (a, b) => (PRIORITY[b.tierCode] || 0) - (PRIORITY[a.tierCode] || 0),
        );
        if (!sorted.length) {
            const s = CHIP.tier1;
            return (
                <div className="flex gap-1 overflow-x-auto scrollbar-slim pb-0.5">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-[2px] rounded-lg border flex-shrink-0 ${s.bg} ${s.border}`}>
                        <span className="text-[10px] leading-none">{UNIVERSAL_ICON}</span>
                        <span className={`font-semibold ${s.text} text-[9px]`}>Universal</span>
                        <span className="px-1 text-[7px] py-px rounded-md font-bold text-white shadow-sm bg-gradient-to-r from-emerald-500 to-teal-500">T1</span>
                    </span>
                </div>
            );
        }
        return (
            <div ref={containerRef} className="flex gap-1 overflow-x-auto scrollbar-slim pb-0.5">
                {sorted.map((iv) => {
                    const s = CHIP[iv.tierCode] || CHIP.tier1;
                    const icon = ICONS[iv.type] || "\uD83D\uDCCB";
                    const tierNum = iv.tierCode?.replace("tier", "") || "1";
                    return (
                        <span
                            key={iv.type}
                            data-chip
                            className={`inline-flex items-center gap-0.5 px-1.5 py-[2px] rounded-lg border flex-shrink-0 ${s.bg} ${s.border} transition-all duration-200`}
                            title={`${iv.label} — ${iv.tier}`}
                        >
                            <span className="text-[10px] leading-none">{icon}</span>
                            <span className={`font-semibold ${s.text} text-[9px] whitespace-nowrap`}>{iv.label}</span>
                            <span className={`px-1 text-[7px] py-px rounded-md font-bold text-white shadow-sm ${s.badge}`}>T{tierNum}</span>
                        </span>
                    );
                })}
            </div>
        );
    }

    /* ── No active interventions → single Universal chip ──── */
    if (!active.length) {
        const s = CHIP.tier1;
        return (
            <div ref={containerRef} className="flex flex-wrap gap-1">
                <span
                    data-chip
                    className={`inline-flex items-center gap-1 ${compact ? "px-1.5 py-[3px]" : "px-2 py-1"} rounded-xl border ${s.bg} ${s.border} transition-all duration-200 hover:shadow-sm`}
                >
                    <span className={compact ? "text-[10px]" : "text-xs"}>{UNIVERSAL_ICON}</span>
                    <span className={`font-semibold ${s.text} ${compact ? "text-[9px]" : "text-[10px]"}`}>Universal</span>
                    <span className={`${compact ? "px-1 text-[7px]" : "px-1.5 text-[8px]"} py-px rounded-lg font-bold ${s.badge} text-white shadow-sm`}>
                        T1
                    </span>
                </span>
            </div>
        );
    }

    /* ── Separate & sort by priority ──────────────────────── */
    const sorted = [...active].sort(
        (a, b) => (PRIORITY[b.tierCode] || 0) - (PRIORITY[a.tierCode] || 0),
    );
    const isAllBaseline = sorted.every((e) => e.tierCode === "tier1");

    /* ── All T1 → Universal summary with expandable detail ── */
    if (isAllBaseline) {
        return (
            <div ref={containerRef} className={`flex flex-wrap ${compact ? "gap-1" : "gap-1.5"}`}>
                {showExtra ? (
                    <>
                        {active.map((iv) => (
                            <SingleChip key={iv.type} iv={iv} compact={compact} extra />
                        ))}
                        <CollapsePill onClick={handleCollapse} compact={compact} innerRef={collapseRef} />
                    </>
                ) : (
                    <UniversalSummary
                        count={active.length}
                        onClick={handleExpand}
                        compact={compact}
                        innerRef={universalRef}
                    />
                )}
            </div>
        );
    }

    /* ── Mixed/escalated: show top 2 inline, rest collapsed ── */
    const MAX_INLINE = 2;
    const visible = sorted.slice(0, MAX_INLINE);
    const hidden = sorted.slice(MAX_INLINE);

    return (
        <div ref={containerRef} className={`flex flex-wrap items-center ${compact ? "gap-1" : "gap-1.5"}`}>
            {visible.map((iv) => (
                <SingleChip key={iv.type} iv={iv} compact={compact} />
            ))}

            {hidden.length > 0 && !showExtra && (
                <OverflowPill
                    count={hidden.length}
                    onClick={handleExpand}
                    compact={compact}
                    innerRef={overflowRef}
                />
            )}

            {showExtra && (
                <>
                    {hidden.map((iv) => (
                        <SingleChip key={iv.type} iv={iv} compact={compact} extra />
                    ))}
                    <CollapsePill onClick={handleCollapse} compact={compact} innerRef={collapseRef} />
                </>
            )}
        </div>
    );
});

InterventionChips.displayName = "InterventionChips";
export default InterventionChips;
