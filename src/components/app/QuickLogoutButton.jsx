import { memo, useState, useCallback } from "react";
import { LogOut } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "@/store/slices/authSlice";

const QuickLogoutButton = memo(() => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleClick = useCallback(() => {
        if (!confirming) {
            setConfirming(true);
            // Auto-reset after 3s if not confirmed
            setTimeout(() => setConfirming(false), 3000);
            return;
        }
        setLoading(true);
        dispatch(logoutUser())
            .unwrap()
            .catch(() => {})
            .finally(() => {
                navigate("/");
            });
    }, [confirming, dispatch, navigate]);

    if (!isAuthenticated) return null;

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`
                fixed top-4 left-4 z-50
                inline-flex items-center gap-1.5 px-3 py-1.5
                rounded-full border text-xs font-semibold
                backdrop-blur-md shadow-lg
                active:scale-95 transition-all duration-200
                ${confirming
                    ? "bg-rose-500/90 dark:bg-rose-600/90 text-white border-rose-400/50 dark:border-rose-500/50 shadow-rose-500/20"
                    : "bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/50 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200/60 dark:hover:border-rose-700/40"
                }
            `}
            title={confirming ? "Tap again to confirm" : "Sign Out"}
        >
            <LogOut className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {confirming ? "Tap to confirm" : "Log Out"}
        </button>
    );
});

QuickLogoutButton.displayName = "QuickLogoutButton";
export default QuickLogoutButton;
