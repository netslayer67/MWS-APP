// src/pages/NotificationPage.jsx
import React, { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
    motion,
    AnimatePresence,
    MotionConfig,
    useReducedMotion,
} from "framer-motion";
import {
    ArrowLeft,
    Wallet,
    Star,
    Bell,
    Check,
    Trash2,
    X,
    BellRing,
    Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedPage from "@/components/AnimatedPage";
import EmptyState from "@/components/feedback/EmptyState";

/* ---------------- sample data ---------------- */
const SAMPLE_NOTIFS = [
    { id: 1, icon: Wallet, title: "Pembayaran berhasil", text: "Rp 150.000 dari Budi", time: "1 jam lalu", read: false },
    { id: 2, icon: Star, title: "Rating baru", text: "Budi memberi Anda ★★★★★", time: "2 jam lalu", read: false },
    { id: 3, icon: Bell, title: "Promo spesial", text: "Diskon 20% pakai kode HEMAT", time: "1 hari lalu", read: true },
    { id: 4, icon: Wallet, title: "Penarikan diproses", text: "Rp 200.000 sedang diproses", time: "2 hari lalu", read: true },
];

/* ---------------- utils ---------------- */
const sanitizeText = (v = "") =>
    String(v)
        .replace(/<[^>]*>/g, "")
        .replace(/https?:\/\/[^\s]+/gi, "")
        .trim();

const DURATION = 0.32;

const listVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemMotion = (reduced) => ({
    hidden: { opacity: 0, y: reduced ? 0 : 8 },
    enter: { opacity: 1, y: 0, transition: { duration: DURATION, ease: "easeOut" } },
    exit: { opacity: 0, x: -60, transition: { duration: 0.28 } },
});

/* ---------------- NotificationItem ---------------- */
const NotificationItem = React.memo(function NotificationItem({ n, onMarkRead, onDismiss, reduceMotion }) {
    const Icon = n.icon || BellRing;
    const read = !!n.read;

    return (
        <motion.div
            layout
            variants={itemMotion(reduceMotion)}
            initial="hidden"
            animate="enter"
            exit="exit"
            className="relative"
        >
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                onDragEnd={(_, info) => {
                    const dx = info.offset.x;
                    if (dx > 120) onMarkRead(n.id);
                    else if (dx < -120) onDismiss(n.id);
                }}
            >
                <Card
                    role="article"
                    aria-live={read ? "polite" : "assertive"}
                    className={`rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl transition-all duration-350 ease-[cubic-bezier(.2,.9,.2,1)]
            ${read ? "opacity-90 hover:opacity-95" : "ring-1 ring-primary/20 shadow-sm hover:shadow-md"}
          `}
                >
                    <CardContent className="flex items-start gap-3 p-3 sm:p-4">
                        <div
                            aria-hidden
                            className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-350
                ${read ? "bg-secondary/20 text-muted-foreground" : "bg-accent/10 text-accent"}
              `}
                        >
                            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 sm:gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-foreground">
                                        {sanitizeText(n.title)}
                                    </p>
                                    <p className="mt-0.5 sm:mt-1 truncate text-xs text-muted-foreground">
                                        {sanitizeText(n.text)}
                                    </p>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <time className="text-[10px] sm:text-[11px] text-muted-foreground" aria-hidden>
                                        {n.time}
                                    </time>
                                    {!read && (
                                        <span className="inline-flex h-2 w-2 rounded-full bg-accent ring-2 ring-card/40" aria-hidden />
                                    )}
                                </div>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                {!read ? (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2 text-xs rounded-full transition-colors duration-320 hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => onMarkRead(n.id)}
                                        aria-label={`Tandai notifikasi ${n.title} sebagai dibaca`}
                                    >
                                        <Check className="mr-1 h-3.5 w-3.5" /> Dibaca
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 px-2 text-xs rounded-full transition-colors duration-320 hover:text-destructive"
                                        onClick={() => onDismiss(n.id)}
                                        aria-label={`Hapus notifikasi ${n.title}`}
                                    >
                                        <X className="mr-1 h-3.5 w-3.5" /> Hapus
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
});

/* ---------------- NotificationPage ---------------- */
export default function NotificationPage() {
    const [notifications, setNotifications] = useState(SAMPLE_NOTIFS);
    const reduceMotion = useReducedMotion();

    const dismiss = useCallback((id) => {
        setNotifications((s) => s.filter((n) => n.id !== id));
    }, []);

    const markRead = useCallback((id) => {
        setNotifications((s) => s.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }, []);

    const markAllRead = useCallback(() => {
        setNotifications((s) => s.map((n) => ({ ...n, read: true })));
    }, []);

    const clearAll = useCallback(() => {
        if (notifications.length === 0) return;
        const ok = window.confirm("Hapus semua notifikasi? Tindakan ini tidak bisa dibatalkan.");
        if (!ok) return;
        setNotifications([]);
    }, [notifications.length]);

    const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

    return (
        <AnimatedPage>
            <Helmet>
                <title>Notifikasi — Kerjain</title>
            </Helmet>

            <MotionConfig reducedMotion="user">
                <div className="relative mx-auto max-w-lg px-3 sm:px-4 pb-16 pt-4 sm:pt-6">
                    {/* header */}
                    <header className="relative z-10 mb-4 sm:mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Link to={-1} aria-label="Kembali">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full bg-card/30 backdrop-blur-md hover:bg-card/50 transition-colors duration-300"
                                >
                                    <ArrowLeft className="h-5 w-5 text-foreground" />
                                </Button>
                            </Link>

                            <div>
                                <h1 className="text-base sm:text-lg font-semibold text-foreground">Notifikasi</h1>
                                <p className="text-[11px] sm:text-xs text-muted-foreground">
                                    Geser kartu untuk aksi cepat
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors duration-320 hover:bg-accent/10 hover:text-accent"
                                onClick={markAllRead}
                                aria-label="Tandai semua notifikasi sebagai dibaca"
                            >
                                <Check className="h-4 w-4" />
                                <span className="text-xs">Semua</span>
                            </Button>

                            <Link to="/notifications/settings" aria-label="Pengaturan notifikasi">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full bg-card/30 backdrop-blur-md hover:bg-card/50 transition-colors duration-300"
                                >
                                    <Settings className="h-4 w-4 text-foreground" />
                                </Button>
                            </Link>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full bg-card/30 backdrop-blur-md hover:bg-card/50 transition-colors duration-300"
                                onClick={clearAll}
                                aria-label="Bersihkan semua notifikasi"
                            >
                                <Trash2 className="h-4 w-4 text-foreground" />
                            </Button>
                        </div>
                    </header>

                    {/* list */}
                    <motion.section initial="hidden" animate="show" variants={listVariants} className="space-y-2 sm:space-y-3">
                        <AnimatePresence>
                            {notifications.length > 0 ? (
                                notifications.map((n) => (
                                    <NotificationItem
                                        key={n.id}
                                        n={n}
                                        onMarkRead={markRead}
                                        onDismiss={dismiss}
                                        reduceMotion={reduceMotion}
                                    />
                                ))
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="mt-8"
                                >
                                    <EmptyState
                                        icon={<BellRing className="h-6 w-6" />}
                                        title="Semua notifikasi sudah dibersihkan 🎉"
                                        subtitle="Tidak ada notifikasi terbaru."
                                        action={
                                            <Link to="/client/dashboard">
                                                <Button
                                                    size="sm"
                                                    className="rounded-full bg-primary px-3 sm:px-4 py-1.5 sm:py-2 text-primary-foreground hover:bg-primary/90 transition-colors duration-300"
                                                >
                                                    Beranda
                                                </Button>
                                            </Link>
                                        }
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.section>
                </div>
            </MotionConfig>
        </AnimatedPage>
    );
}
