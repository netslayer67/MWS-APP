import React, { memo } from "react";
import ThemeToggle from "@/components/ThemeToggle";

const UtilityDock = memo(() => (
    <div className="utility-dock fixed bottom-16 right-5 z-50 flex items-center gap-2 transition-all duration-300">
        <ThemeToggle />
    </div>
));

UtilityDock.displayName = 'UtilityDock';
export default UtilityDock;
