import React, { memo } from "react";

export const TierPill = memo(({ tier }) => {
    const styles = {
        "Tier 1": "bg-emerald/10 text-emerald border border-emerald/40",
        "Tier 2": "bg-primary/10 text-primary border border-primary/30",
        "Tier 3": "bg-amber-100/40 text-[#a34f00] border border-[#fbbf24]/40",
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
        style = "bg-destructive/10 text-destructive border border-destructive/30";
    } else if (status === "Improving") {
        style = "bg-gold/10 text-gold border border-gold/40";
    }

    return (
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${style}`}>
            {status}
        </span>
    );
});
ProgressBadge.displayName = "ProgressBadge";

