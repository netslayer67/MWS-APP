import React, { useMemo, useState, useCallback, useEffect, memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
    ArrowLeft,
    User,
    Shield,
    Bell,
    LogOut,
    ChevronRight,
    Star,
    CheckCircle,
    Award,
    Wallet,
    Gift,
    TrendingUp,
    Calendar,
    Activity,
    BarChart3,
    UserCog,
    Heart,
    Flame,
    Gauge,
    PieChart,
    Sparkles
} from "lucide-react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import ThemeToggle from "@/components/ThemeToggle";
import { getCheckinHistory, getPersonalDashboard } from "../store/slices/checkinSlice";
import { logoutUser } from "../store/slices/authSlice";
import { useToast } from "@/components/ui/use-toast";

/* ---------------------- Helpers ---------------------- */
const fmtShort = (v) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v || 0);

const sanitizeInput = (value) => {
    return String(value || "")
        .replace(/[<>]/g, "")
        .replace(/https?:\/\/\S+/g, "")
        .replace(/(script|onerror|onload|data:|vbscript:)/gi, "")
        .trim()
        .slice(0, 300);
};

const formatMetricValue = (value, fractionDigits = 1) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return '–';
    const fixed = value.toFixed(fractionDigits);
    return fixed.includes('.') ? fixed.replace(/\.0+$/, '') : fixed;
};

const formatDateLabel = (value, options = { day: 'numeric', month: 'short' }) => {
    if (!value) return '-';
    try {
        return new Intl.DateTimeFormat('id-ID', options).format(new Date(value));
    } catch {
        return '-';
    }
};

const formatWeekdayLabel = (value) => {
    if (!value) return '';
    try {
        return new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(new Date(value));
    } catch {
        return '';
    }
};

const getTier = (completed) => {
    if (completed >= 200) return { label: "Gold", icon: Award, color: "text-gold" };
    if (completed >= 100) return { label: "Silver", icon: Star, color: "text-slate-400" };
    return { label: "Bronze", icon: CheckCircle, color: "text-amber-600" };
};

// Time-aware, varied greeting builders
const getTimeOfDay = (date = new Date()) => {
    const h = date.getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    if (h < 21) return 'evening';
    return 'night';
};

const pickVariant = (key, variants) => {
    // Deterministic-ish selection per day without flicker
    const seed = (typeof key === 'string' ? key : JSON.stringify(key)) + new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    return variants[hash % variants.length];
};

export const getDynamicGreeting = (user, titledName) => {
    const tod = getTimeOfDay();
    const base = {
        morning: [
            `Good morning, ${titledName}`,
            `Morning, ${titledName}`,
            `A bright start, ${titledName}`
        ],
        afternoon: [
            `Good afternoon, ${titledName}`,
            `Hope your afternoon’s going well, ${titledName}`,
            `Great to see you, ${titledName}`
        ],
        evening: [
            `Good evening, ${titledName}`,
            `Wishing you a calm evening, ${titledName}`,
            `Nice to have you here, ${titledName}`
        ],
        night: [
            `Good evening, ${titledName}`,
            `Late session, ${titledName}?` ,
            `Hello, ${titledName}`
        ]
    };
    return pickVariant(user?.email || titledName, base[tod]);
};

const CHECKIN_USAGE_KEY = "mws_emotional_checkin_usage";
const MAX_DAILY_EMOTIONAL_CHECKINS = 2;
const WINDOW_DURATION_MS = 24 * 60 * 60 * 1000;

const getWindowStartTimestamp = () => {
    const now = new Date();
    const windowStart = new Date(now);
    windowStart.setHours(6, 0, 0, 0);
    if (now < windowStart) {
        windowStart.setDate(windowStart.getDate() - 1);
    }
    return windowStart.getTime();
};

const getNextResetTimestamp = (windowStart) => windowStart + WINDOW_DURATION_MS;

const readCheckinUsageSnapshot = () => {
    const windowStart = getWindowStartTimestamp();
    const nextReset = getNextResetTimestamp(windowStart);

    if (typeof window === "undefined") {
        return { windowStart, nextReset, count: 0 };
    }

    try {
        const stored = JSON.parse(localStorage.getItem(CHECKIN_USAGE_KEY) || "{}");
        if (stored?.windowStart === windowStart) {
            return {
                windowStart,
                nextReset,
                count: Number(stored.count) || 0
            };
        }
    } catch {
        // ignore parsing errors
    }

    return { windowStart, nextReset, count: 0 };
};

const persistCheckinUsageSnapshot = (snapshot) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
        CHECKIN_USAGE_KEY,
        JSON.stringify({
            windowStart: snapshot.windowStart,
            count: snapshot.count
        })
    );
};

const formatResetTimeLabel = (timestamp) => {
    try {
        return new Intl.DateTimeFormat("id-ID", {
            hour: "2-digit",
            minute: "2-digit"
        }).format(new Date(timestamp));
    } catch {
        return "06:00";
    }
};

export const getDynamicSubGreeting = () => {
    const variants = [
        'Your wellness overview is ready',
        'Here are your latest insights',
        'Wishing you a productive day',
        'Stay present and take a breath'
    ];
    return pickVariant('sub'+new Date().toDateString(), variants);
};

/* ---------------------- Decorative Elements ---------------------- */
const DecorativeBlob = memo(({ className, delay = 0 }) => (
    <motion.div
        className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
            scale: [1, 1.12, 1],
            opacity: [0.08, 0.15, 0.08]
        }}
        transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay
        }}
    />
));

const GridPattern = memo(() => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.015]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="profile-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#profile-grid)" className="text-foreground" />
        </svg>
    </div>
));

/* ---------------------- Optimized Components ---------------------- */
const GlassCard = memo(({ children, className = "", variant = "default" }) => {
    const baseClasses = "glass glass-card transition-all duration-300";
    const variants = {
        default: "",
        elevated: "glass--deep hover-lift",
        compact: "p-3"
    };

    return (
        <div className={`${baseClasses} ${variants[variant]} ${className}`}>
            <div className="glass__noise" />
            <div className="glass__refract" />
            {children}
        </div>
    );
});

const IconContainer = memo(({ children, size = "md", variant = "default" }) => {
    const sizes = {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12"
    };

    const variants = {
        default: "bg-secondary/20 border border-border/50",
        accent: "bg-primary/10 border border-primary/20",
        muted: "bg-muted/30 border border-muted"
    };

    return (
        <div className={`flex items-center justify-center rounded-xl ${sizes[size]} ${variants[variant]} transition-colors duration-300`}>
            {children}
        </div>
    );
});

const MenuItem = memo(function MenuItem({ icon: Icon, title, to, compact = false, onClick, disabled = false, description }) {
    const contentClasses = `flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3 backdrop-blur-xl transition-all duration-300 hover:border-primary/30 hover:bg-primary/5 hover:shadow-glass-sm ${compact ? 'px-3 py-2.5' : ''} ${disabled ? 'opacity-60 hover:border-border/60 hover:bg-card/40 cursor-not-allowed' : ''}`;

    const content = (
        <div className={contentClasses}>
            <div className="flex items-center gap-3">
                <IconContainer size={compact ? "sm" : "md"}>
                    <Icon className={`text-foreground/80 transition-colors duration-300 group-hover:text-primary ${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
                </IconContainer>
                <div className="flex flex-col min-w-0">
                    <div className={`font-medium text-foreground truncate transition-colors duration-300 group-hover:text-primary ${compact ? 'text-sm' : 'text-sm'}`}>
                        {title}
                    </div>
                    {description && (
                        <p className="text-xs text-muted-foreground truncate">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            <ChevronRight className={`text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
        </div>
    );

    if (onClick) {
        return (
            <button
                type="button"
                onClick={disabled ? undefined : onClick}
                disabled={disabled}
                aria-disabled={disabled}
                className={`block w-full text-left group ${disabled ? 'cursor-not-allowed' : ''}`}
            >
                {content}
            </button>
        );
    }

    return (
        <Link to={to} className={`block group ${disabled ? 'pointer-events-none opacity-60' : ''}`}>
            {content}
        </Link>
    );
});

const ActionCard = memo(function ActionCard({ icon: Icon, label, hint, to, compact = false }) {
    return (
        <Link to={to} className="block group">
            <div className={`flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-primary/30 hover:bg-primary/5 hover:shadow-glass-sm ${compact ? 'px-3 py-2.5 gap-2' : ''}`}>
                <div className="flex items-center gap-2">
                    <IconContainer size={compact ? "sm" : "md"} variant="accent">
                        <Icon className={`text-primary transition-colors duration-300 ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
                    </IconContainer>
                    <div className="text-sm font-medium text-foreground transition-colors duration-300 group-hover:text-primary">
                        {label}
                    </div>
                </div>
                <div className={`text-muted-foreground transition-colors duration-300 group-hover:text-primary/70 ${compact ? 'text-xs' : 'text-xs'}`}>
                    {hint}
                </div>
            </div>
        </Link>
    );
});

/* ---------------------- Main Component ---------------------- */
const ProfilePage = memo(function ProfilePage() {
    const navigate = useNavigate();
    const reduce = useReducedMotion();
    const dispatch = useDispatch();
    const { toast } = useToast();

    // Redux state
    const { user: currentUser } = useSelector((state) => state.auth);
    const {
        todayCheckin,
        checkinHistory,
        personalDashboard,
        personalLoading
    } = useSelector((state) => state.checkin);

    // Local state
    const [isCompact, setIsCompact] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [checkinUsage, setCheckinUsage] = useState(() => {
        const snapshot = readCheckinUsageSnapshot();
        return { ...snapshot, ready: typeof window !== "undefined" };
    });

    // Load data on mount
    useEffect(() => {
        if (currentUser) {
            dispatch(getPersonalDashboard());
            dispatch(getCheckinHistory({ page: 1, limit: 50 }));
        }
    }, [dispatch, currentUser]);

    // Check for mobile compact mode
    useEffect(() => {
        const checkMobile = () => {
            setIsCompact(window.innerWidth < 640);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        setCheckinUsage({ ...readCheckinUsageSnapshot(), ready: true });
    }, []);

    // Processed user data
    const user = useMemo(() => {
        if (!currentUser) {
            return {
                name: "Loading...",
                email: "loading@example.com",
                initials: "L",
                completed: 0,
                rating: 0,
                department: "",
                role: "",
                position: "",
                level: ""
            };
        }

        const getUserTitle = (user) => {
            if (!user?.gender) return sanitizeInput(user?.name) || 'User';
            const title = user.gender === 'male' ? 'Mr.' : user.gender === 'female' ? 'Ms.' : '';
            const displayName = sanitizeInput(user.username || user.name || 'User');
            return title ? `${title} ${displayName}` : displayName;
        };

        const fallbackHistoryLength = Array.isArray(checkinHistory)
            ? checkinHistory.length
            : checkinHistory?.data?.checkins?.length
                || checkinHistory?.checkins?.length
                || 0;

        return {
            name: getUserTitle(currentUser),
            email: sanitizeInput(currentUser.email) || "user@example.com",
            initials: sanitizeInput(currentUser.name || currentUser.username || "U").charAt(0).toUpperCase(),
            completed: personalDashboard?.overall?.totalCheckins ?? fallbackHistoryLength,
            rating: 4.8,
            department: sanitizeInput(currentUser.unit || currentUser.department) || "Not specified",
            role: currentUser.role || "staff",
            position: sanitizeInput(currentUser.jobPosition) || "Junior Full Stack Web Developer",
            level: sanitizeInput(currentUser.jobLevel) || "Staff"
        };
    }, [currentUser, checkinHistory, personalDashboard]);

    const tier = useMemo(() => getTier(user.completed), [user.completed]);

    const remainingCheckins = checkinUsage.ready
        ? Math.max(MAX_DAILY_EMOTIONAL_CHECKINS - checkinUsage.count, 0)
        : MAX_DAILY_EMOTIONAL_CHECKINS;
    const checkinLimitReached = checkinUsage.ready && remainingCheckins === 0;
    const checkinDescription = checkinUsage.ready
        ? checkinLimitReached
            ? `Available again at ${formatResetTimeLabel(checkinUsage.nextReset)}`
            : `${remainingCheckins} check-in chance${remainingCheckins === 1 ? '' : 's'} left today`
        : "Checking quota...";

    const handleEmotionalCheckin = useCallback(() => {
        if (typeof window === "undefined") return;
        const snapshot = readCheckinUsageSnapshot();

        if (snapshot.count >= MAX_DAILY_EMOTIONAL_CHECKINS) {
            setCheckinUsage({ ...snapshot, ready: true });
            toast({
                title: "Daily limit reached",
                description: `You can try again after ${formatResetTimeLabel(snapshot.nextReset)}.`,
                variant: "destructive"
            });
            return;
        }

        const updated = { ...snapshot, count: snapshot.count + 1 };
        persistCheckinUsageSnapshot(updated);
        setCheckinUsage({ ...updated, ready: true });
        navigate("/select-role");
    }, [navigate, toast]);

    // Derived info for today's check-in
    const todayCard = useMemo(() => {
        const source = personalDashboard?.today?.checkin || todayCheckin;
        if (!source) return null;
        const moodCount = Array.isArray(source.selectedMoods) ? source.selectedMoods.length : 0;
        const moods = moodCount > 0 ? source.selectedMoods.slice(0, 3).join(', ') + (moodCount > 3 ? '.' : '') : null;
        const weather = source.weatherType || null;
        const presence = typeof source.presenceLevel === 'number' ? source.presenceLevel : null;
        const capacity = typeof source.capacityLevel === 'number' ? source.capacityLevel : null;
        const id = source._id || source.id || null;
        const needsSupport = !!source.aiAnalysis?.needsSupport;
        const hasAI = !!source.aiAnalysis;
        const confidence = typeof source.aiAnalysis?.confidence === 'number' ? source.aiAnalysis.confidence : null;
        return { id, moods, weather, presence, capacity, needsSupport, hasAI, confidence, moodCount };
    }, [personalDashboard, todayCheckin]);

    const overallCard = useMemo(() => {
        if (!personalDashboard?.overall) return null;
        const overall = personalDashboard.overall;
        return {
            totalCheckins: overall.totalCheckins ?? 0,
            avgPresence: typeof overall.averages?.presence === 'number' ? overall.averages.presence : null,
            avgCapacity: typeof overall.averages?.capacity === 'number' ? overall.averages.capacity : null,
            streaks: overall.streaks || { current: 0, longest: 0 },
            moodHighlights: overall.moodHighlights || [],
            aiHighlights: overall.aiHighlights || { supportNeededDays: 0, stableDays: 0 },
            periodSummary: overall.periodSummary,
            firstCheckinDate: overall.firstCheckinDate,
            lastCheckinDate: overall.lastCheckinDate
        };
    }, [personalDashboard]);

    const insights = useMemo(() => personalDashboard?.insights || [], [personalDashboard]);
    const recentSnapshots = useMemo(() => personalDashboard?.recentCheckins || [], [personalDashboard]);

    // Animation variants
    const container = useMemo(
        () => ({
            hidden: { opacity: 0, y: 8 },
            show: {
                opacity: 1,
                y: 0,
                transition: {
                    staggerChildren: reduce ? 0 : 0.06,
                    duration: 0.4,
                    ease: "easeOut"
                }
            }
        }),
        [reduce]
    );

    const item = useMemo(() => ({
        hidden: { opacity: 0, y: 6 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.32, ease: "easeOut" }
        }
    }), []);

    // Menu configuration
    const menuItems = useMemo(() => {
        const baseItems = [
            { key: "edit", icon: User, title: "Edit Profile", to: "/profile/edit" },
            { key: "notif", icon: Bell, title: "Notifications", to: "/notifications" },
            {
                key: "emotional-checkin",
                icon: Sparkles,
                title: "Emotional Check-in",
                to: "/select-role",
                onClick: handleEmotionalCheckin,
                disabled: checkinLimitReached,
                description: checkinDescription
            },
        ];

        if (currentUser && !['directorate', 'admin', 'superadmin'].includes(currentUser.role)) {
            baseItems.splice(2, 0,
                { key: "stats", icon: TrendingUp, title: "Personal Stats", to: "/profile/personal-stats" },
                { key: "history", icon: Calendar, title: "Emotional History", to: "/profile/emotional-history" },
                { key: "insights", icon: Activity, title: "Emotional Insights", to: "/profile/emotional-patterns" }
            );
        } else if (currentUser && ['directorate', 'admin', 'superadmin', 'head_unit'].includes(currentUser.role)) {
            baseItems.splice(2, 0,
                { key: "dashboard", icon: BarChart3, title: currentUser.role === 'head_unit' ? "Unit Dashboard" : "Emotional Dashboard", to: "/emotional-checkin/dashboard" },
                { key: "user-mgmt", icon: UserCog, title: "User Management", to: "/user-management" }
            );
        }

        return baseItems;
    }, [currentUser, handleEmotionalCheckin, checkinDescription, checkinLimitReached]);

    // Quick actions
    const quickActions = useMemo(() => {
        const isDirectorate = currentUser && ['directorate', 'admin', 'superadmin'].includes(currentUser.role);
        const isHeadUnit = currentUser && currentUser.role === 'head_unit';

        if (isDirectorate) {
            return [
                { title: "Emotional Dashboard", hint: "Monitor & analyze", icon: BarChart3, to: "/emotional-checkin/dashboard" },
                { title: "User Management", hint: "Manage users", icon: UserCog, to: "/user-management" },
            ];
        }

        if (isHeadUnit) {
            return [
                { title: "Unit Dashboard", hint: "Monitor team wellness", icon: BarChart3, to: "/emotional-checkin/dashboard" },
                { title: "My Stats", hint: `${user.completed} check-ins`, icon: TrendingUp, to: "/profile/personal-stats" },
            ];
        }

        return [
            { title: "My Stats", hint: `${user.completed} check-ins`, icon: TrendingUp, to: "/profile/personal-stats" },
            { title: "Emotional History", hint: "Reflection & thoughts", icon: Calendar, to: "/profile/emotional-history" },
            { title: "Emotional Patterns", hint: "Insights & patterns", icon: Activity, to: "/profile/emotional-patterns" },
        ];
    }, [user.completed, currentUser]);

    // Logout handler
    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            navigate("/");
        } catch (error) {
            console.error('Logout failed:', error);
            // Still navigate to landing page even if logout API fails
            navigate("/");
        }
    };

    return (
        <>
            <Helmet>
                <title>Profile — MWS APP</title>
            </Helmet>

            <div className="relative min-h-dvh w-full overflow-hidden">
                {/* Decorative Elements */}
                <GridPattern />
                <DecorativeBlob className="bg-primary/10 -top-20 -right-20 w-80 h-80" delay={0} />
                <DecorativeBlob className="bg-gold/8 -bottom-32 -left-32 w-96 h-96" delay={2} />

                <motion.main
                    initial="hidden"
                    animate="show"
                    variants={container}
                    className="relative z-10 px-4 pb-12 pt-6"
                >
                    <div className={`mx-auto ${isCompact ? 'max-w-sm' : 'max-w-md'}`}>
                        {/* Header */}
                        <motion.header variants={item} className="mb-6 flex items-center gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                aria-label="Go back"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/40 backdrop-blur-xl transition-all duration-300 hover:border-primary/30 hover:bg-primary/5 hover:shadow-glass-sm"
                            >
                                <ArrowLeft className="h-5 w-5 text-foreground/80" />
                            </button>

                            <div className="flex-1 min-w-0">
                                <h1 className="text-lg font-semibold text-foreground">{getDynamicGreeting(currentUser, user.name)}</h1>
                                <p className="mt-0.5 text-xs text-muted-foreground">{getDynamicSubGreeting()}</p>
                            </div>
                        </motion.header>

                        {/* Today's Check-in */}
                        <motion.section variants={item}>
                            <GlassCard>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h2 className="text-sm font-semibold text-foreground">Today's Check-in</h2>
                                        {todayCard ? (
                                            <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                {todayCard.presence !== null && (
                                                    <div>
                                                        <span className="text-foreground/80">Presence:</span> {todayCard.presence}
                                                    </div>
                                                )}
                                                {todayCard.capacity !== null && (
                                                    <div>
                                                        <span className="text-foreground/80">Capacity:</span> {todayCard.capacity}
                                                    </div>
                                                )}
                                                {todayCard.weather && (
                                                    <div className="col-span-2 truncate">
                                                        <span className="text-foreground/80">Weather:</span> {todayCard.weather}
                                                    </div>
                                                )}
                                                {todayCard.moods && todayCard.moodCount > 0 && (
                                                    <div className="col-span-2 truncate">
                                                        <span className="text-foreground/80">Moods:</span> {todayCard.moods}
                                                    </div>
                                                )}
                                                {todayCard.hasAI && (
                                                    <div className="col-span-2 mt-1 flex items-center gap-2">
                                                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${todayCard.needsSupport ? 'bg-rose-500/10 text-rose-400 ring-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'}`}>
                                                            {todayCard.needsSupport ? 'AI: Needs Support' : 'AI: Stable'}
                                                        </span>
                                                        {todayCard.confidence !== null && (
                                                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 bg-secondary/10 text-foreground/80 ring-border/30">
                                                                Confidence: {Math.round(todayCard.confidence)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="mt-1 text-xs text-muted-foreground">No check-in recorded today.</p>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {todayCard && todayCard.id ? (
                                            <Link to={`/emotional-checkin/rate/${todayCard.id}`} className="inline-flex items-center gap-2 rounded-md border border-border/50 px-3 py-1.5 text-xs hover:border-primary/40 hover:bg-primary/5 transition-colors">
                                                View Details <ChevronRight className="h-3.5 w-3.5" />
                                            </Link>
                                        ) : null}
                                        {todayCard ? (
                                            <Link to="/profile/emotional-history" className="inline-flex items-center gap-2 rounded-md border border-border/50 px-3 py-1.5 text-xs hover:border-primary/40 hover:bg-primary/5 transition-colors">
                                                View History <ChevronRight className="h-3.5 w-3.5" />
                                            </Link>
                                        ) : (
                                            <Link to={(currentUser?.role === 'staff' || currentUser?.role === 'teacher') ? '/emotional-checkin/staff' : '/emotional-checkin'} className="inline-flex items-center gap-2 rounded-md border border-border/50 px-3 py-1.5 text-xs hover:border-primary/40 hover:bg-primary/5 transition-colors">
                                                Start Check-in <ChevronRight className="h-3.5 w-3.5" />
                                            </Link>
                                        )}
                                        <Link to="/profile/personal-stats" className="inline-flex items-center gap-2 rounded-md border border-border/50 px-3 py-1.5 text-xs hover:border-primary/40 hover:bg-primary/5 transition-colors">
                                            Overall Stats <ChevronRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.section>

                        {/* Profile Card */}
                        <motion.section variants={item}>
                            <GlassCard variant="elevated">
                                <div className="flex items-start gap-4">
                                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary via-gold to-emerald text-2xl font-semibold text-primary-foreground ring-2 ring-primary/20 shadow-lg">
                                        {user.initials}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-base font-semibold text-foreground truncate">{user.name}</p>
                                            <tier.icon className={`h-4 w-4 ${tier.color}`} />
                                        </div>

                                        <p className="text-xs text-muted-foreground truncate mb-2">{user.email}</p>

                                        <div className="flex items-center gap-2 text-xs text-foreground/70 mb-3">
                                            <User className="h-3 w-3" />
                                            <span>{user.department} • {user.level} • {user.position}</span>
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="flex items-center gap-1.5 rounded-lg bg-secondary/20 px-2.5 py-1 border border-border/50">
                                                <Star className="h-4 w-4 text-gold" />
                                                <span className="text-sm font-medium text-foreground">{user.rating}</span>
                                            </div>

                                            <div className="flex items-center gap-1.5 rounded-lg bg-secondary/20 px-2.5 py-1 border border-border/50">
                                                <CheckCircle className="h-4 w-4 text-emerald" />
                                                <span className="text-xs text-foreground/80">{fmtShort(user.completed)} Check-ins</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.section>

                        {personalLoading && !overallCard && (
                            <motion.section variants={item} className="mt-4">
                                <GlassCard>
                                    <p className="text-xs text-muted-foreground">Memuat ringkasan personal...</p>
                                </GlassCard>
                            </motion.section>
                        )}

                        {overallCard && (
                            <motion.section variants={item} className="mt-4">
                                <GlassCard>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h2 className="text-sm font-semibold text-foreground">Overall Snapshot</h2>
                                            <p className="text-xs text-muted-foreground">
                                                {overallCard.firstCheckinDate
                                                    ? `Tracking since ${formatDateLabel(overallCard.firstCheckinDate, { month: 'short', year: 'numeric' })}`
                                                    : 'Mulai check-in rutin agar AI belajar pola emosimu'}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-secondary/30 px-3 py-1 text-[11px] font-medium text-foreground/80">
                                            {overallCard.totalCheckins} check-ins
                                        </span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                                        <div className="rounded-xl border border-border/60 bg-card/40 px-3 py-2">
                                            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                                                <IconContainer size="sm" variant="accent">
                                                    <Gauge className="h-3.5 w-3.5" />
                                                </IconContainer>
                                                Presence
                                            </div>
                                            <p className="mt-1 text-lg font-semibold text-foreground">
                                                {formatMetricValue(overallCard.avgPresence)}
                                                <span className="text-xs text-muted-foreground"> /10</span>
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-border/60 bg-card/40 px-3 py-2">
                                            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                                                <IconContainer size="sm" variant="accent">
                                                    <Gauge className="h-3.5 w-3.5" />
                                                </IconContainer>
                                                Capacity
                                            </div>
                                            <p className="mt-1 text-lg font-semibold text-foreground">
                                                {formatMetricValue(overallCard.avgCapacity)}
                                                <span className="text-xs text-muted-foreground"> /10</span>
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-border/60 bg-card/40 px-3 py-2 sm:col-span-1 col-span-2">
                                            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                                                <IconContainer size="sm" variant="accent">
                                                    <Flame className="h-3.5 w-3.5" />
                                                </IconContainer>
                                                Streak
                                            </div>
                                            <p className="mt-1 text-lg font-semibold text-foreground">
                                                {overallCard.streaks?.current || 0} days
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">Longest {overallCard.streaks?.longest || 0} days</p>
                                        </div>
                                    </div>

                                    {overallCard.moodHighlights?.length > 0 && (
                                        <div className="mt-4">
                                            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                                                <IconContainer size="sm" variant="muted">
                                                    <PieChart className="h-3.5 w-3.5" />
                                                </IconContainer>
                                                Top moods
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {overallCard.moodHighlights.slice(0, 3).map((mood) => (
                                                    <span key={mood.mood} className="rounded-full bg-secondary/30 px-3 py-1 text-[11px] font-medium text-foreground/80">
                                                        {sanitizeInput(mood.mood)} · {mood.percentage}%
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                                        <div className="rounded-xl border border-border/60 bg-card/40 p-3">
                                            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                                                <IconContainer size="sm" variant="accent">
                                                    <Shield className="h-3.5 w-3.5" />
                                                </IconContainer>
                                                AI highlights
                                            </div>
                                            <p className="mt-2 text-sm text-foreground">
                                                Support days: <span className="font-semibold">{overallCard.aiHighlights.supportNeededDays}</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground">Stable days: {overallCard.aiHighlights.stableDays}</p>
                                        </div>
                                        {overallCard.periodSummary?.count > 0 && (
                                            <div className="rounded-xl border border-border/60 bg-card/40 p-3">
                                                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                                                    <IconContainer size="sm" variant="accent">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                    </IconContainer>
                                                    30 day trends
                                                </div>
                                                <p className="mt-2 text-sm text-foreground">
                                                    Avg presence: <span className="font-semibold">{formatMetricValue(overallCard.periodSummary.averagePresence)}</span>
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Positive {overallCard.periodSummary.positiveDays} · Challenging {overallCard.periodSummary.challengingDays}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </GlassCard>
                            </motion.section>
                        )}

                        {insights.length > 0 && (
                            <motion.section variants={item} className="mt-4">
                                <GlassCard>
                                    <div className="flex items-center gap-3">
                                        <IconContainer variant="accent">
                                            <Sparkles className="h-4 w-4" />
                                        </IconContainer>
                                        <div>
                                            <h2 className="text-sm font-semibold text-foreground">AI Insights</h2>
                                            <p className="text-xs text-muted-foreground">Rekomendasi singkat untukmu</p>
                                        </div>
                                    </div>
                                    <ul className="mt-4 space-y-2 text-xs">
                                        {insights.map((insight, index) => (
                                            <li key={`${index}-${insight}`} className="flex gap-3">
                                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/70" aria-hidden="true" />
                                                <span className="text-foreground">{sanitizeInput(insight)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </GlassCard>
                            </motion.section>
                        )}

                        {recentSnapshots.length > 0 && (
                            <motion.section variants={item} className="mt-4">
                                <GlassCard>
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h2 className="text-sm font-semibold text-foreground">Recent Check-ins</h2>
                                            <p className="text-xs text-muted-foreground">Ringkasan 5 aktivitas terakhir</p>
                                        </div>
                                        <Link to="/profile/emotional-history" className="text-xs font-semibold text-primary hover:underline">
                                            View all
                                        </Link>
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {recentSnapshots.map((entry) => (
                                            <div key={entry.id || entry.date} className="rounded-xl border border-border/60 bg-card/30 px-3 py-3">
                                                <div className="flex items-center justify-between text-xs">
                                                    <div>
                                                        <p className="text-foreground font-medium">{formatWeekdayLabel(entry.date)}</p>
                                                        <p className="text-muted-foreground">{formatDateLabel(entry.date)}</p>
                                                    </div>
                                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${entry.aiAnalysis?.needsSupport ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                        {entry.aiAnalysis?.needsSupport ? 'Needs support' : 'Stable'}
                                                    </span>
                                                </div>
                                                <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-muted-foreground">
                                                    <div><span className="text-foreground/80">Presence</span>: {entry.presenceLevel ?? '–'}</div>
                                                    <div><span className="text-foreground/80">Capacity</span>: {entry.capacityLevel ?? '–'}</div>
                                                    {entry.selectedMoods?.length > 0 && (
                                                        <div className="col-span-2 truncate">
                                                            <span className="text-foreground/80">Moods</span>: {entry.selectedMoods.slice(0, 3).map((mood) => sanitizeInput(mood)).join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>
                            </motion.section>
                        )}

                        {/* Menu */}
                        <motion.nav variants={item} className={`mt-6 space-y-3 ${isCompact ? 'space-y-2' : ''}`} aria-label="Profile menu">
                            {menuItems.map((item) => (
                                <MenuItem
                                    key={item.key}
                                    icon={item.icon}
                                    title={item.title}
                                    to={item.to}
                                    compact={isCompact}
                                    onClick={item.onClick}
                                    disabled={item.disabled}
                                    description={item.description}
                                />
                            ))}
                        </motion.nav>

                        {/* Theme Section */}
                        <motion.section variants={item} className="mt-6">
                            <GlassCard>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <IconContainer variant="accent">
                                            <Heart className="h-4 w-4" />
                                        </IconContainer>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Theme</p>
                                            <p className="text-xs text-muted-foreground">Choose light or dark mode</p>
                                        </div>
                                    </div>
                                    <ThemeToggle />
                                </div>
                            </GlassCard>
                        </motion.section>

                        {/* Quick Actions */}
                        <motion.div variants={item} className={`mt-6 grid gap-3 ${isCompact ? 'gap-2' : ''}`}>
                            {quickActions.map((action) => (
                                <ActionCard
                                    key={action.title}
                                    icon={action.icon}
                                    label={action.title}
                                    hint={action.hint}
                                    to={action.to}
                                    compact={isCompact}
                                />
                            ))}
                        </motion.div>

                        {/* Logout */}
                        <motion.div variants={item} className="mt-6">
                            <button
                                type="button"
                                onClick={() => setShowLogoutDialog(true)}
                                className="w-full rounded-xl bg-destructive/90 px-4 py-3 text-sm font-semibold text-destructive-foreground shadow-sm transition-all duration-300 hover:bg-destructive hover:shadow-glass-sm focus:ring-2 focus:ring-destructive/50"
                            >
                                <span className="inline-flex items-center gap-2 justify-center">
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </span>
                            </button>
                        </motion.div>

                        {/* Footer */}
                        <motion.footer variants={item} className="mt-6 text-center text-xs text-muted-foreground">
                            MWS APP • © {new Date().getFullYear()}
                        </motion.footer>
                    </div>
                </motion.main>
            </div>

            {/* Logout Confirmation Dialog */}
            <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <DialogContent className="sm:max-w-[425px] border-0 bg-transparent shadow-none">
                    <GlassCard variant="elevated" className="p-6 border-0 shadow-glass-lg">
                        <DialogHeader className="space-y-3">
                            <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <LogOut className="h-5 w-5 text-destructive" />
                                Sign Out
                            </DialogTitle>
                            <DialogDescription className="text-foreground/70 leading-relaxed">
                                Are you sure you want to sign out of MWS APP? You'll need to sign in again to access your account.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-3 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setShowLogoutDialog(false)}
                                className="flex-1 border-border/60 bg-card/40 hover:bg-card/60 text-foreground"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleLogout}
                                className="flex-1 bg-destructive hover:bg-destructive/90 text-primary"
                            >
                                Sign Out
                            </Button>
                        </DialogFooter>
                    </GlassCard>
                </DialogContent>
            </Dialog>
        </>
    );
});

ProfilePage.displayName = 'ProfilePage';

export default ProfilePage;
