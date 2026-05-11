import React, { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import {
    ArrowLeft, Bell, BellOff, CalendarClock, CheckCircle2, Clock,
    Mail, MailCheck, MailX, Moon,
} from "lucide-react";
import AnimatedPage from "@/components/AnimatedPage";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import api from "@/services/authService";

// ─── constants ────────────────────────────────────────────────────────────────

const DELIVERY_MODES = [
    {
        value: "digest_daily",
        label: "Daily Digest",
        desc: "One summary email per day at your chosen time. Recommended — no spam.",
        icon: MailCheck,
        accent: "emerald",
    },
    {
        value: "immediate",
        label: "Immediate",
        desc: "Email sent right away for every MTSS update. Up to 5 per 2-hour window.",
        icon: Bell,
        accent: "sky",
    },
    {
        value: "dashboard_only",
        label: "Dashboard Only",
        desc: "No emails at all. View updates only inside the app.",
        icon: BellOff,
        accent: "slate",
    },
];

const ACCENT_CLASSES = {
    emerald: {
        ring: "ring-emerald-500 dark:ring-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        icon: "text-emerald-600 dark:text-emerald-400",
        badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    },
    sky: {
        ring: "ring-sky-500 dark:ring-sky-400",
        bg: "bg-sky-50 dark:bg-sky-900/20",
        icon: "text-sky-600 dark:text-sky-400",
        badge: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
    },
    slate: {
        ring: "ring-slate-400 dark:ring-slate-500",
        bg: "bg-slate-50 dark:bg-slate-800/30",
        icon: "text-slate-500 dark:text-slate-400",
        badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    },
};

const SAVE_DEBOUNCE_MS = 900;

// ─── sub-components ───────────────────────────────────────────────────────────

function Toggle({ checked, onChange, ariaLabel }) {
    return (
        <button
            role="switch"
            aria-checked={checked}
            aria-label={ariaLabel}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ring-1 ring-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                checked ? "bg-primary" : "bg-muted/40"
            }`}
        >
            <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    checked ? "translate-x-5" : "translate-x-0.5"
                }`}
            />
        </button>
    );
}

function SectionLabel({ children }) {
    return (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {children}
        </p>
    );
}

function Card({ children, className = "" }) {
    return (
        <div className={`rounded-2xl border border-border bg-card/60 backdrop-blur-sm px-4 py-3.5 ${className}`}>
            {children}
        </div>
    );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function NotificationSettingsPage() {
    const reduce = useReducedMotion();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState("idle"); // "idle" | "saving" | "saved" | "error"

    // prefs state
    const [deliveryMode, setDeliveryMode] = useState("digest_daily");
    const [dailyTime, setDailyTime] = useState("08:00");
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [quietEnabled, setQuietEnabled] = useState(true);
    const [quietStart, setQuietStart] = useState("18:00");
    const [quietEnd, setQuietEnd] = useState("07:00");
    const [quietWeekendsOnly, setQuietWeekendsOnly] = useState(false);

    const initializedRef = useRef(false);
    const debounceRef = useRef(null);

    // ── load preferences ──────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        api.get("/notifications/preferences")
            .then((res) => {
                if (cancelled) return;
                const d = res.data?.data || res.data || {};
                setDeliveryMode(d.deliveryMode || "digest_daily");
                setDailyTime(d.digestSchedule?.dailyTime || "08:00");
                setEmailEnabled(d.emailNotifications?.enabled !== false);
                setQuietEnabled(d.quietHours?.enabled !== false);
                setQuietStart(d.quietHours?.start || "18:00");
                setQuietEnd(d.quietHours?.end || "07:00");
                setQuietWeekendsOnly(d.quietHours?.weekendsOnly || false);
            })
            .catch(() => {
                if (!cancelled)
                    toast({ title: "Could not load preferences", variant: "destructive", duration: 3000 });
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                    // Mark as ready after a tick so the state above settles first
                    setTimeout(() => { initializedRef.current = true; }, 0);
                }
            });
        return () => { cancelled = true; };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── auto-save (debounced) ─────────────────────────────────────────────
    const doSave = useCallback(async (payload) => {
        setSaveStatus("saving");
        try {
            await api.put("/notifications/preferences", payload);
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
            setSaveStatus("error");
            toast({ title: "Could not save", description: "Please try again.", variant: "destructive", duration: 3000 });
            setTimeout(() => setSaveStatus("idle"), 3000);
        }
    }, [toast]);

    useEffect(() => {
        if (!initializedRef.current) return;

        const payload = {
            deliveryMode,
            digestSchedule: { dailyTime },
            emailNotifications: { enabled: emailEnabled },
            quietHours: {
                enabled: quietEnabled,
                start: quietStart,
                end: quietEnd,
                weekendsOnly: quietWeekendsOnly,
            },
        };

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSave(payload), SAVE_DEBOUNCE_MS);
    }, [deliveryMode, dailyTime, emailEnabled, quietEnabled, quietStart, quietEnd, quietWeekendsOnly, doSave]); // eslint-disable-line react-hooks/exhaustive-deps

    // cleanup debounce on unmount
    useEffect(() => () => clearTimeout(debounceRef.current), []);

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: reduce ? 0 : 0.06 } },
    };
    const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.28 } } };

    return (
        <AnimatedPage>
            <Helmet>
                <title>Notification Settings — MWS IntegraLearn</title>
            </Helmet>

            <MotionConfig reducedMotion="user">
                <motion.main
                    initial="hidden"
                    animate={loading ? "hidden" : "show"}
                    variants={container}
                    className="relative mx-auto max-w-lg px-3 sm:px-4 pb-10 pt-4 sm:pt-6"
                >
                    {/* ── Header ──────────────────────────────────────────── */}
                    <motion.header variants={item} className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="rounded-full bg-card/40 backdrop-blur-md hover:bg-card/60"
                                aria-label="Back"
                            >
                                <Link to={-1}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-base font-semibold text-foreground">Notification Settings</h1>
                                <p className="text-[11px] text-muted-foreground">
                                    Changes save automatically
                                </p>
                            </div>
                        </div>

                        {/* save status indicator */}
                        <div className="min-w-[64px] flex justify-end">
                            {loading && (
                                <span className="text-xs text-muted-foreground animate-pulse">Loading…</span>
                            )}
                            {!loading && saveStatus === "saving" && (
                                <span className="text-xs text-muted-foreground animate-pulse">Saving…</span>
                            )}
                            {!loading && saveStatus === "saved" && (
                                <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Saved
                                </span>
                            )}
                            {!loading && saveStatus === "error" && (
                                <span className="text-xs text-destructive">Error</span>
                            )}
                        </div>
                    </motion.header>

                    {/* ── Delivery mode ────────────────────────────────────── */}
                    <motion.section variants={item} className="mb-6">
                        <SectionLabel>Email Delivery Mode</SectionLabel>
                        <div className="space-y-2.5">
                            {DELIVERY_MODES.map((mode) => {
                                const active = deliveryMode === mode.value;
                                const ac = ACCENT_CLASSES[mode.accent];
                                const Icon = mode.icon;
                                return (
                                    <button
                                        key={mode.value}
                                        onClick={() => setDeliveryMode(mode.value)}
                                        className={`w-full text-left rounded-2xl border px-4 py-3.5 transition-all duration-200 flex items-start gap-3 ${
                                            active
                                                ? `ring-2 ${ac.ring} ${ac.bg} border-transparent`
                                                : "border-border bg-card/50 hover:bg-card/80"
                                        }`}
                                    >
                                        <div className={`mt-0.5 rounded-lg p-1.5 ${active ? ac.bg : "bg-muted/30"}`}>
                                            <Icon className={`h-4 w-4 ${active ? ac.icon : "text-muted-foreground"}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-medium ${active ? "text-foreground" : "text-foreground/80"}`}>
                                                    {mode.label}
                                                </span>
                                                {active && (
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ac.badge}`}>
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                                {mode.desc}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.section>

                    {/* ── Digest time (shown only for digest modes) ─────────── */}
                    {(deliveryMode === "digest_daily" || deliveryMode === "digest_weekly") && (
                        <motion.section variants={item} className="mb-6">
                            <SectionLabel>Digest Send Time</SectionLabel>
                            <Card className="flex items-center gap-3">
                                <CalendarClock className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm text-foreground">
                                        {deliveryMode === "digest_daily" ? "Daily" : "Weekly"} digest sent at
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        All MTSS updates from the day compiled into one email
                                    </p>
                                </div>
                                <input
                                    type="time"
                                    value={dailyTime}
                                    onChange={(e) => setDailyTime(e.target.value)}
                                    className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </Card>
                        </motion.section>
                    )}

                    {/* ── Email channel toggle ─────────────────────────────── */}
                    <motion.section variants={item} className="mb-6">
                        <SectionLabel>Email Channel</SectionLabel>
                        <Card className="flex items-center gap-3">
                            {emailEnabled
                                ? <Mail className="h-4 w-4 text-primary shrink-0" />
                                : <MailX className="h-4 w-4 text-muted-foreground shrink-0" />
                            }
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">Email Notifications</p>
                                <p className="text-xs text-muted-foreground">
                                    {emailEnabled
                                        ? "Emails will be delivered per your delivery mode above."
                                        : "No emails will be sent for any MTSS activity."}
                                </p>
                            </div>
                            <Toggle
                                checked={emailEnabled}
                                onChange={setEmailEnabled}
                                ariaLabel="Toggle email notifications"
                            />
                        </Card>
                    </motion.section>

                    {/* ── Quiet hours ───────────────────────────────────────── */}
                    <motion.section variants={item} className="mb-6">
                        <SectionLabel>Quiet Hours</SectionLabel>
                        <div className="space-y-2.5">
                            <Card className="flex items-center gap-3">
                                <Moon className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">Enable quiet hours</p>
                                    <p className="text-xs text-muted-foreground">No emails sent during this window</p>
                                </div>
                                <Toggle
                                    checked={quietEnabled}
                                    onChange={setQuietEnabled}
                                    ariaLabel="Toggle quiet hours"
                                />
                            </Card>

                            {quietEnabled && (
                                <>
                                    <Card className="flex items-center gap-3">
                                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <p className="text-sm text-foreground flex-1">Start</p>
                                        <input
                                            type="time"
                                            value={quietStart}
                                            onChange={(e) => setQuietStart(e.target.value)}
                                            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        />
                                    </Card>
                                    <Card className="flex items-center gap-3">
                                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <p className="text-sm text-foreground flex-1">End</p>
                                        <input
                                            type="time"
                                            value={quietEnd}
                                            onChange={(e) => setQuietEnd(e.target.value)}
                                            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        />
                                    </Card>
                                    <Card className="flex items-center gap-3">
                                        <span className="text-sm shrink-0">🏖️</span>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-foreground">Weekends only</p>
                                            <p className="text-xs text-muted-foreground">
                                                Apply quiet hours only on Saturday &amp; Sunday
                                            </p>
                                        </div>
                                        <Toggle
                                            checked={quietWeekendsOnly}
                                            onChange={setQuietWeekendsOnly}
                                            ariaLabel="Quiet hours weekends only"
                                        />
                                    </Card>
                                </>
                            )}
                        </div>
                    </motion.section>

                    {/* ── Info banner ───────────────────────────────────────── */}
                    <motion.section variants={item} className="mb-8">
                        <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 dark:border-amber-800/40 dark:bg-amber-900/10 px-4 py-3 flex gap-2.5">
                            <span className="text-base shrink-0 mt-0.5">💡</span>
                            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                                <strong>Tip:</strong> "Daily Digest" is recommended for most teachers — all MTSS
                                updates arrive in one tidy email each morning instead of separate notifications
                                for each action.
                            </p>
                        </div>
                    </motion.section>
                </motion.main>
            </MotionConfig>
        </AnimatedPage>
    );
}
