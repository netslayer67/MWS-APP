import { useMemo } from "react";
import { useSelector } from "react-redux";

/**
 * Emails that have read-only "observer" access to all MTSS units.
 * They can view any dashboard/student but cannot create, edit, or
 * submit any intervention data.
 */
const OBSERVER_EMAILS = new Set([
    "mahrukh@millennia21.id",
    "faisal@millennia21.id",
]);

/**
 * Returns whether the current logged-in user is an MTSS observer
 * (view-only access across all units).
 */
const useMtssObserver = () => {
    const user = useSelector((state) => state.auth?.user);
    const isObserver = useMemo(() => {
        const email = (user?.email || "").toLowerCase().trim();
        return OBSERVER_EMAILS.has(email);
    }, [user?.email]);
    return { isObserver };
};

export default useMtssObserver;
