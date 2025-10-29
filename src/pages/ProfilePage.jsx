import React, { useMemo, useState, useCallback, useEffect, memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
    ArrowLeft,
    User,
    Shield,
    Bell,
    HelpCircle,
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
    Heart
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
import { getCheckinHistory } from "../store/slices/checkinSlice";
import { logoutUser } from "../store/slices/authSlice";

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

const getTier = (completed) => {
    if (completed >= 200) return { label: "Gold", icon: Award, color: "text-gold" };
    if (completed >= 100) return { label: "Silver", icon: Star, color: "text-slate-400" };
    return { label: "Bronze", icon: CheckCircle, color: "text-amber-600" };
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

const MenuItem = memo(function MenuItem({ icon: Icon, title, to, compact = false }) {
    return (
        <Link to={to} className="block group">
            <div className={`flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3 backdrop-blur-xl transition-all duration-300 hover:border-primary/30 hover:bg-primary/5 hover:shadow-glass-sm ${compact ? 'px-3 py-2.5' : ''}`}>
                <div className="flex items-center gap-3">
                    <IconContainer size={compact ? "sm" : "md"}>
                        <Icon className={`text-foreground/80 transition-colors duration-300 group-hover:text-primary ${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
                    </IconContainer>
                    <div className={`font-medium text-foreground truncate transition-colors duration-300 group-hover:text-primary ${compact ? 'text-sm' : 'text-sm'}`}>
                        {title}
                    </div>
                </div>
                <ChevronRight className={`text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </div>
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

    // Redux state
    const { user: currentUser } = useSelector((state) => state.auth);
    const { checkinHistory } = useSelector((state) => state.checkin);

    // Local state
    const [isCompact, setIsCompact] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    // Load data on mount
    useEffect(() => {
        if (currentUser) {
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

        return {
            name: getUserTitle(currentUser),
            email: sanitizeInput(currentUser.email) || "user@example.com",
            initials: sanitizeInput(currentUser.name || currentUser.username || "U").charAt(0).toUpperCase(),
            completed: checkinHistory?.length || 0,
            rating: 4.8,
            department: sanitizeInput(currentUser.unit || currentUser.department) || "Not specified",
            role: currentUser.role || "staff",
            position: sanitizeInput(currentUser.jobPosition) || "Junior Full Stack Web Developer",
            level: sanitizeInput(currentUser.jobLevel) || "Staff"
        };
    }, [currentUser, checkinHistory]);

    const tier = useMemo(() => getTier(user.completed), [user.completed]);

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
            { key: "help", icon: HelpCircle, title: "Help", to: "/help" },
        ];

        if (currentUser && !['directorate', 'admin', 'superadmin'].includes(currentUser.role)) {
            baseItems.splice(2, 0,
                { key: "stats", icon: TrendingUp, title: "Personal Stats", to: "/profile/personal-stats" },
                { key: "history", icon: Calendar, title: "Emotional History", to: "/profile/emotional-history" },
                { key: "insights", icon: Activity, title: "Emotional Insights", to: "/profile/emotional-patterns" }
            );
        } else if (currentUser && ['directorate', 'admin', 'superadmin'].includes(currentUser.role)) {
            baseItems.splice(2, 0,
                { key: "dashboard", icon: BarChart3, title: "Emotional Dashboard", to: "/emotional-checkin/dashboard" },
                { key: "user-mgmt", icon: UserCog, title: "User Management", to: "/user-management" }
            );
        }

        return baseItems;
    }, [currentUser]);

    // Quick actions
    const quickActions = useMemo(() => {
        const isDirectorate = currentUser && ['directorate', 'admin', 'superadmin'].includes(currentUser.role);

        if (isDirectorate) {
            return [
                { title: "Emotional Dashboard", hint: "Monitor & analyze", icon: BarChart3, to: "/emotional-checkin/dashboard" },
                { title: "User Management", hint: "Manage users", icon: UserCog, to: "/user-management" },
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
                                <h1 className="text-lg font-semibold text-foreground">Profile</h1>
                                <p className="mt-0.5 text-xs text-muted-foreground">Account overview</p>
                            </div>
                        </motion.header>

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

                        {/* Menu */}
                        <motion.nav variants={item} className={`mt-6 space-y-3 ${isCompact ? 'space-y-2' : ''}`} aria-label="Profile menu">
                            {menuItems.map((item) => (
                                <MenuItem
                                    key={item.key}
                                    icon={item.icon}
                                    title={item.title}
                                    to={item.to}
                                    compact={isCompact}
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
