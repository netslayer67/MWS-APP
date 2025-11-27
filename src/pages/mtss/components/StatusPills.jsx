import React, { memo } from "react";

export const TierPill = memo(({ tier, compact = false }) => {
    const styles = {
        "Tier 1": "bg-gradient-to-r from-[#a7f3d0] to-[#34d399] text-emerald-900 border border-emerald/20 shadow-[0_6px_15px_rgba(52,211,153,0.35)] dark:from-[#065f46] dark:to-[#22c55e] dark:text-white",
        "Tier 2": "bg-gradient-to-r from-[#fb7185] to-[#f97316] text-white border border-rose-200/40 shadow-[0_6px_15px_rgba(249,115,22,0.35)] dark:from-[#be185d] dark:to-[#ea580c]",
        "Tier 3": "bg-gradient-to-r from-[#fde68a] to-[#fbbf24] text-[#7a3c00] border border-amber-200/50 shadow-[0_6px_15px_rgba(251,191,36,0.35)] dark:text-white dark:from-[#b45309] dark:to-[#fbbf24]",
    };

    const sizing = compact ? "text-[10px] px-2.5 py-0.5" : "text-xs px-3 py-1";

    return (
        <span className={`font-semibold rounded-full ${sizing} ${styles[tier] || "bg-muted/50 text-foreground"}`}>
            {tier}
        </span>
    );
});
TierPill.displayName = "TierPill";

export const ProgressBadge = memo(({ status, compact = false }) => {
    let style = "bg-gradient-to-r from-[#bbf7d0] to-[#34d399] text-emerald-900 border border-emerald/30 dark:text-white";
    if (status === "Needs Attention") {
        style = "bg-gradient-to-r from-[#f87171] to-[#fb7185] text-white border border-rose-200/50 shadow-[0_6px_12px_rgba(248,113,113,0.35)]";
    } else if (status === "Improving") {
        style = "bg-gradient-to-r from-[#fde68a] to-[#facc15] text-[#7a3c00] border border-amber-200/40 dark:text-white";
    }

    const sizing = compact ? "text-[10px] px-2.5 py-0.5" : "text-xs px-3 py-1";

    return (
        <span className={`font-semibold rounded-full ${sizing} ${style}`}>
            {status}
        </span>
    );
});
ProgressBadge.displayName = "ProgressBadge";
