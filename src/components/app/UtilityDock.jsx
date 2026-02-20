import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, BellRing, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import usePreferLowMotion from "@/hooks/usePreferLowMotion";
import { loadAssistantProfile } from "@/store/slices/aiChatSlice";

const NUDGE_STORAGE_KEY = "ai_dock_nudge_v2";
const NUDGE_DAILY_LIMIT = 3;
const NUDGE_COOLDOWN_MS = 25 * 60 * 1000;
const NUDGE_INITIAL_DELAY_MS = 15000;
const NUDGE_SNOOZE_MS = 2 * 60 * 60 * 1000;

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const readNudgeState = () => {
    if (typeof window === "undefined") {
        return { day: getTodayKey(), count: 0, lastAt: 0, lastPath: "", snoozeUntil: 0 };
    }

    try {
        const raw = window.localStorage.getItem(NUDGE_STORAGE_KEY);
        if (!raw) return { day: getTodayKey(), count: 0, lastAt: 0, lastPath: "", snoozeUntil: 0 };
        const parsed = JSON.parse(raw);
        return {
            day: String(parsed?.day || getTodayKey()),
            count: Number(parsed?.count || 0),
            lastAt: Number(parsed?.lastAt || 0),
            lastPath: String(parsed?.lastPath || ""),
            snoozeUntil: Number(parsed?.snoozeUntil || 0)
        };
    } catch {
        return { day: getTodayKey(), count: 0, lastAt: 0, lastPath: "", snoozeUntil: 0 };
    }
};

const writeNudgeState = (nextState) => {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(NUDGE_STORAGE_KEY, JSON.stringify(nextState));
    } catch {
        // no-op
    }
};

const normalizeNudgeState = (state) => {
    const today = getTodayKey();
    if (String(state?.day || "") === today) {
        return {
            day: today,
            count: Number(state?.count || 0),
            lastAt: Number(state?.lastAt || 0),
            lastPath: String(state?.lastPath || ""),
            snoozeUntil: Number(state?.snoozeUntil || 0)
        };
    }

    return {
        day: today,
        count: 0,
        lastAt: 0,
        lastPath: "",
        snoozeUntil: Number(state?.snoozeUntil || 0)
    };
};

const getTimeGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 11) return "Good morning";
    if (hours < 16) return "Good afternoon";
    return "Good evening";
};

const normalizeRole = (role = "") => String(role || "").trim().toLowerCase();
const isStudentRole = (role = "") => normalizeRole(role) === "student";
const getAssistantChatPath = (role = "") => (isStudentRole(role) ? "/student/ai-chat" : "/ai-assistant");

const pickAdaptiveNudge = ({
    pathname = "",
    role = "student",
    assistantName = "Jarvis",
    studentCallName = "there",
    focusItems = [],
    quickActions = []
} = {}) => {
    const greeting = getTimeGreeting();
    const primaryFocus = String(focusItems?.[0] || "").trim();
    const primaryQuickAction = String(quickActions?.[0] || "").trim();

    if (isStudentRole(role) && pathname.startsWith("/student/emotional-checkin")) {
        return {
            title: `${assistantName} is here`,
            text: `${greeting}, ${studentCallName}. Want a quick emotional reset before continuing your day?`,
            primaryAction: {
                label: "Guide me now",
                type: "chat",
                message: "Guide me through a quick emotional check-in and suggest my best next step today."
            },
            secondaryAction: {
                label: "Open manual check-in",
                type: "navigate",
                navigateTo: "/student/emotional-checkin/manual"
            }
        };
    }

    if (isStudentRole(role) && pathname.startsWith("/student/support-hub")) {
        return {
            title: `${assistantName} quick nudge`,
            text: primaryFocus
                ? `Your focus right now: ${primaryFocus}. Want me to break it into simple action steps?`
                : `${greeting}, ${studentCallName}. I can help you pick the best next action in under 1 minute.`,
            primaryAction: {
                label: "Build my next steps",
                type: "chat",
                message: "Help me choose my next best action from support hub context and make it actionable."
            },
            secondaryAction: {
                label: "Open AI chat",
                type: "navigate",
                navigateTo: getAssistantChatPath(role)
            }
        };
    }

    if (!isStudentRole(role) && pathname.startsWith("/support-hub")) {
        return {
            title: `${assistantName} quick nudge`,
            text: primaryFocus
                ? `Top focus detected: ${primaryFocus}. Want me to turn it into 3 concrete actions?`
                : `${greeting}, ${studentCallName}. I can help prioritize your next best action in under 1 minute.`,
            primaryAction: {
                label: "Prioritize now",
                type: "chat",
                message: "Help me prioritize my top work actions right now with one first step."
            },
            secondaryAction: {
                label: "Open AI assistant",
                type: "navigate",
                navigateTo: getAssistantChatPath(role)
            }
        };
    }

    if (primaryQuickAction) {
        return {
            title: `${assistantName} check-in`,
            text: `${greeting}, ${studentCallName}. Want to continue with: "${primaryQuickAction}"?`,
            primaryAction: {
                label: "Yes, let's do it",
                type: "chat",
                message: primaryQuickAction
            },
            secondaryAction: {
                label: "Open AI chat",
                type: "navigate",
                navigateTo: getAssistantChatPath(role)
            }
        };
    }

    return {
        title: `${assistantName} check-in`,
        text: `${greeting}, ${studentCallName}. I can help you plan your day in 3 simple steps whenever you're ready.`,
        primaryAction: {
            label: "Plan my day",
            type: "chat",
            message: isStudentRole(role)
                ? "Help me make a practical study plan for today with clear time blocks."
                : "Help me make a practical work plan for today with clear priorities and time blocks."
        },
        secondaryAction: {
            label: "Open AI assistant",
            type: "navigate",
            navigateTo: getAssistantChatPath(role)
        }
    };
};

const getQuickActions = (role = "student") => {
    if (isStudentRole(role)) {
        return [
            {
                label: "Support Hub",
                description: "Go to your student home hub",
                navigateTo: "/student/support-hub"
            },
            {
                label: "Open AI Chat",
                description: "Continue your personal conversation",
                navigateTo: "/student/ai-chat"
            },
            {
                label: "My Profile",
                description: "Open profile, stats, and journey",
                navigateTo: "/profile"
            },
            {
                label: "Manual Check-in",
                description: "Write your emotion check-in manually",
                navigateTo: "/student/emotional-checkin/manual"
            },
            {
                label: "AI Check-in",
                description: "Use AI emotional reflection",
                navigateTo: "/student/emotional-checkin/ai"
            }
        ];
    }

    return [
        {
            label: "Support Hub",
            description: "Open your staff/teacher support workspace",
            navigateTo: "/support-hub"
        },
        {
            label: "Open AI Assistant",
            description: "Continue your personal assistant conversation",
            navigateTo: "/ai-assistant"
        },
        {
            label: "My Profile",
            description: "Open profile, stats, and journey",
            navigateTo: "/profile"
        },
        {
            label: "Staff Check-in",
            description: "Log a quick emotional check-in",
            navigateTo: "/emotional-checkin/staff"
        },
        {
            label: "MTSS",
            description: "Open MTSS role workspace",
            navigateTo: "/mtss"
        }
    ];
};

const UtilityDock = memo(() => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const lowMotion = usePreferLowMotion();
    const [isOpen, setIsOpen] = useState(false);
    const [quickMessage, setQuickMessage] = useState("");
    const [activeNudge, setActiveNudge] = useState(null);
    const [isNudgeVisible, setIsNudgeVisible] = useState(false);
    const hasLoadedProfileRef = useRef(false);

    const { user, isAuthenticated } = useSelector((state) => state.auth || {});
    const assistantProfile = useSelector((state) => state.aiChat?.assistantProfile);
    const assistantName =
        assistantProfile?.assistant?.assistantName || "Jarvis";
    const focusItems = assistantProfile?.assistant?.daily?.focusItems || [];
    const quickActions = assistantProfile?.assistant?.daily?.quickActions || [];

    const normalizedRole = normalizeRole(user?.role);
    const assistantChatPath = getAssistantChatPath(normalizedRole);
    const isStudent = isStudentRole(normalizedRole);
    const quickActionItems = useMemo(
        () => getQuickActions(normalizedRole),
        [normalizedRole]
    );
    const studentCallName = useMemo(() => {
        const nickname = String(user?.nickname || "").trim();
        if (nickname) return nickname;
        const name = String(user?.name || "").trim();
        if (!name) return "there";
        return name.split(/\s+/)[0] || "there";
    }, [user?.name, user?.nickname]);

    const buttonLabel = useMemo(
        () => `${assistantName} Assistant`,
        [assistantName]
    );

    useEffect(() => {
        if (!isOpen) return;
        setIsOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!isAuthenticated) {
            hasLoadedProfileRef.current = false;
            return;
        }
        if (hasLoadedProfileRef.current) return;
        hasLoadedProfileRef.current = true;
        dispatch(loadAssistantProfile()).catch(() => {
            // keep silent; dock still works with fallback prompts
        });
    }, [dispatch, isAuthenticated]);

    const openAssistant = useCallback((message = "", autoSend = false) => {
        const trimmed = String(message || "").trim();
        navigate(assistantChatPath, {
            state: {
                fromUtilityDock: true,
                prefillMessage: trimmed || undefined,
                autoSendFromDock: Boolean(autoSend && trimmed),
                dockNonce: Date.now()
            }
        });
    }, [assistantChatPath, navigate]);

    const handleQuickAction = useCallback((path) => {
        if (!path) return;
        setIsOpen(false);
        setIsNudgeVisible(false);
        navigate(path);
    }, [navigate]);

    const handleSendQuickMessage = useCallback((event) => {
        event.preventDefault();
        const trimmed = String(quickMessage || "").trim();
        if (!trimmed) return;
        setQuickMessage("");
        setIsOpen(false);
        setIsNudgeVisible(false);
        openAssistant(trimmed, true);
    }, [openAssistant, quickMessage]);

    const handleNudgePrimaryAction = useCallback((action) => {
        if (!action || typeof action !== "object") return;
        setIsNudgeVisible(false);

        const actionType = String(action.type || "").toLowerCase();
        if (actionType === "navigate") {
            const targetPath = String(action.navigateTo || "").trim();
            if (targetPath) {
                navigate(targetPath);
            }
            return;
        }

        const message = String(action.message || "").trim();
        openAssistant(message, false);
    }, [navigate, openAssistant]);

    const dismissNudge = useCallback((snooze = false) => {
        setIsNudgeVisible(false);
        if (!snooze) return;

        const state = normalizeNudgeState(readNudgeState());
        writeNudgeState({
            ...state,
            snoozeUntil: Date.now() + NUDGE_SNOOZE_MS
        });
    }, []);

    useEffect(() => {
        if (!isAuthenticated || isOpen) return;
        if (location.pathname.startsWith(assistantChatPath) || location.pathname.startsWith("/ai-assistant")) return;
        if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

        const state = normalizeNudgeState(readNudgeState());
        const now = Date.now();
        if (state.snoozeUntil > now) return;
        if (state.count >= NUDGE_DAILY_LIMIT) return;
        if (state.lastAt && (now - state.lastAt) < NUDGE_COOLDOWN_MS) return;

        const nudgePayload = pickAdaptiveNudge({
            pathname: location.pathname,
            role: normalizedRole,
            assistantName,
            studentCallName,
            focusItems,
            quickActions
        });

        const timer = window.setTimeout(() => {
            const latest = normalizeNudgeState(readNudgeState());
            const latestNow = Date.now();
            if (latest.snoozeUntil > latestNow) return;
            if (latest.count >= NUDGE_DAILY_LIMIT) return;
            if (latest.lastAt && (latestNow - latest.lastAt) < NUDGE_COOLDOWN_MS) return;

            setActiveNudge(nudgePayload);
            setIsNudgeVisible(true);
            writeNudgeState({
                ...latest,
                count: latest.count + 1,
                lastAt: latestNow,
                lastPath: location.pathname
            });
        }, NUDGE_INITIAL_DELAY_MS);

        return () => window.clearTimeout(timer);
    }, [assistantChatPath, assistantName, focusItems, isAuthenticated, isOpen, location.pathname, normalizedRole, quickActions, studentCallName]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="utility-dock fixed bottom-16 right-5 z-50 flex items-end gap-2 transition-all duration-300">
            <AnimatePresence>
                {isNudgeVisible && !isOpen && activeNudge && (
                    <motion.div
                        key="assistant-nudge"
                        initial={lowMotion ? { opacity: 1 } : { opacity: 0, y: 12, scale: 0.97 }}
                        animate={lowMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                        exit={lowMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
                        transition={lowMotion ? { duration: 0.12 } : { duration: 0.2, ease: "easeOut" }}
                        className="w-[288px] rounded-3xl border border-violet-200/55 dark:border-violet-200/25 bg-[linear-gradient(150deg,rgba(255,255,255,0.95),rgba(236,250,255,0.9),rgba(244,236,255,0.9))] dark:bg-[linear-gradient(150deg,rgba(15,20,42,0.94),rgba(18,34,60,0.92),rgba(36,22,58,0.9))] shadow-[0_20px_46px_rgba(56,189,248,0.23)] backdrop-blur-xl p-3"
                    >
                        <div className="flex items-start gap-2">
                            <div className="mt-0.5 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 text-white flex items-center justify-center shadow-sm">
                                <BellRing className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-violet-700 dark:text-violet-200">{activeNudge.title}</p>
                                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{activeNudge.text}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => dismissNudge(false)}
                                className="p-1 rounded-md text-slate-500 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                aria-label="Dismiss assistant nudge"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="mt-2.5 flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => handleNudgePrimaryAction(activeNudge.primaryAction)}
                                className="px-2.5 py-1.5 rounded-full text-[11px] font-semibold text-white bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 hover:brightness-105 transition-all"
                            >
                                {activeNudge.primaryAction?.label || "Open assistant"}
                            </button>
                            {activeNudge.secondaryAction?.label && (
                                <button
                                    type="button"
                                    onClick={() => handleNudgePrimaryAction(activeNudge.secondaryAction)}
                                    className="px-2.5 py-1.5 rounded-full text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-white/85 dark:bg-white/12 border border-slate-200/80 dark:border-white/15 hover:brightness-105 transition-all"
                                >
                                    {activeNudge.secondaryAction.label}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => dismissNudge(true)}
                                className="px-2 py-1.5 rounded-full text-[10px] font-semibold text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                            >
                                Snooze
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="assistant-panel"
                        initial={lowMotion ? { opacity: 1 } : { opacity: 0, y: 12, scale: 0.96 }}
                        animate={lowMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                        exit={lowMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
                        transition={lowMotion ? { duration: 0.12 } : { duration: 0.22, ease: "easeOut" }}
                        className="w-[290px] rounded-3xl border border-cyan-200/55 dark:border-cyan-200/25 bg-[linear-gradient(155deg,rgba(255,255,255,0.94),rgba(241,249,255,0.9),rgba(252,239,251,0.9))] dark:bg-[linear-gradient(155deg,rgba(9,20,38,0.94),rgba(14,26,52,0.92),rgba(38,20,48,0.9))] shadow-[0_26px_60px_rgba(14,116,144,0.22)] backdrop-blur-xl p-3"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-sm font-extrabold text-cyan-700 dark:text-cyan-200 flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4" />
                                    {buttonLabel}
                                </p>
                                <p className="text-[11px] mt-0.5 text-slate-500 dark:text-slate-300">
                                    {isStudent ? "Personal helper on every student page." : "Personal helper across your workspace."}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close assistant dock"
                                className="p-1.5 rounded-lg bg-white/70 dark:bg-white/10 border border-cyan-200/45 dark:border-cyan-200/20 text-slate-700 dark:text-slate-200 hover:brightness-105 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="mt-2.5 space-y-2">
                            {quickActionItems.map((entry) => (
                                <button
                                    key={entry.label}
                                    type="button"
                                    onClick={() => handleQuickAction(entry.navigateTo)}
                                    className="w-full rounded-2xl px-3 py-2 text-left bg-white/78 dark:bg-white/8 border border-cyan-100/70 dark:border-cyan-200/15 hover:bg-cyan-50/90 dark:hover:bg-cyan-400/12 transition-all"
                                >
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-between gap-2">
                                        <span>{entry.label}</span>
                                        <ArrowUpRight className="w-3.5 h-3.5 text-cyan-500" />
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-300 mt-0.5">{entry.description}</p>
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSendQuickMessage} className="mt-3 flex gap-2">
                            <input
                                type="text"
                                value={quickMessage}
                                onChange={(event) => setQuickMessage(event.target.value)}
                                placeholder={`Message ${assistantName}...`}
                                className="flex-1 px-3 py-2 rounded-xl bg-white/88 dark:bg-white/8 border border-cyan-200/45 dark:border-cyan-200/20 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/70"
                            />
                            <button
                                type="submit"
                                className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 text-white hover:brightness-105 transition-all disabled:opacity-50"
                                disabled={!quickMessage.trim()}
                                aria-label="Send quick message to assistant"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                type="button"
                aria-label={isOpen ? "Close AI Assistant launcher" : "Open AI Assistant launcher"}
                aria-expanded={isOpen}
                onClick={() => {
                    setIsOpen((prev) => !prev);
                    setIsNudgeVisible(false);
                }}
                whileTap={lowMotion ? {} : { scale: 0.94 }}
                whileHover={lowMotion ? {} : { scale: 1.05 }}
                animate={lowMotion ? {} : { y: [0, -2, 0] }}
                transition={lowMotion ? { duration: 0.12 } : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                className="relative h-14 w-14 rounded-full border border-cyan-200/60 dark:border-cyan-200/25 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(230,247,255,0.88),rgba(253,236,252,0.86))] dark:bg-[linear-gradient(145deg,rgba(11,26,48,0.94),rgba(20,38,66,0.92),rgba(44,22,52,0.9))] shadow-[0_18px_40px_rgba(6,182,212,0.24)] text-cyan-700 dark:text-cyan-200 backdrop-blur-xl"
            >
                <motion.span
                    className="pointer-events-none absolute -inset-1 rounded-full border border-cyan-300/50 dark:border-cyan-300/35"
                    animate={lowMotion ? {} : { scale: [1, 1.12, 1], opacity: [0.65, 0.25, 0.65] }}
                    transition={lowMotion ? {} : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="absolute inset-0 rounded-full bg-grid-small/[0.08] dark:bg-grid-small-dark/[0.16] pointer-events-none" />
                <div className="relative flex items-center justify-center">
                    <MessageCircle className="w-6 h-6" />
                    <span className="absolute -top-2.5 -right-3 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-sm">
                        AI
                    </span>
                </div>
            </motion.button>
        </div>
    );
});

UtilityDock.displayName = "UtilityDock";
export default UtilityDock;
