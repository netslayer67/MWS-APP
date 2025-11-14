import React, { memo } from "react";

export const TierPill = memo(({ tier }) => {
    const styles = {
        "Tier 1": "bg-gradient-to-r from-[#a7f3d0]/60 to-[#6ee7b7]/60 text-emerald-900 border border-white/40 shadow-[0_6px_15px_rgba(167,243,208,0.45)]",
        "Tier 2": "bg-gradient-to-r from-[#ff58c2]/30 to-[#ffb347]/40 text-primary-foreground border border-white/30 shadow-[0_6px_15px_rgba(255,88,194,0.35)]",
        "Tier 3": "bg-gradient-to-r from-[#fde68a]/60 to-[#fbbf24]/50 text-[#7a3c00] border border-white/30 shadow-[0_6px_15px_rgba(251,191,36,0.35)]",
    };

    return (
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[tier] || "bg-muted/50 text-foreground"}`}>
            {tier}
        </span>
    );
});
TierPill.displayName = "TierPill";

export const ProgressBadge = memo(({ status }) => {
    let style = "bg-emerald/10 text-emerald border border-emerald/40";
    if (status === "Needs Attention") {
        style = "bg-gradient-to-r from-[#fca5a5]/50 to-[#f87171]/60 text-[#7f1d1d] border border-white/30";
    } else if (status === "Improving") {
        style = "bg-gradient-to-r from-[#fde68a]/60 to-[#fbbf24]/60 text-[#7a3c00] border border-white/30";
    } else {
        style = "bg-gradient-to-r from-[#bbf7d0]/60 to-[#6ee7b7]/60 text-emerald-900 border border-white/30";
    }

    return (
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${style}`}>
            {status}
        </span>
    );
});
ProgressBadge.displayName = "ProgressBadge";
