import React, { useMemo, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
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
    UserCog,
    Rss,
} from "lucide-react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";

/* ---------------------- Helpers ---------------------- */
const fmtShort = (v) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(v || 0);
const fmtCurrency = (n) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

const sanitizeText = (s = "") => String(s).replace(/[<>]/g, "").replace(/(http|https|script|javascript)/gi, "").slice(0, 300);

const getTier = (completed) => {
    if (completed >= 200) return { label: "Gold", from: "from-yellow-400", to: "to-amber-500" };
    if (completed >= 100) return { label: "Silver", from: "from-slate-300", to: "to-slate-400" };
    return { label: "Bronze", from: "from-amber-600", to: "to-amber-700" };
};

/* ---------------------- Presentational / Small ---------------------- */
const Glass = ({ children, className = "" }) => (
    <div className={`rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-4 shadow-sm transition-all duration-350 ${className}`}>
        {children}
    </div>
);

const IconBox = React.memo(({ children }) => (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/30">{children}</div>
));

const MenuRow = React.memo(function MenuRow({ icon: Icon, title, to }) {
    return (
        <Link to={to} className="block">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/40 px-4 py-3 backdrop-blur-xl transition-colors duration-350 hover:border-accent/50 hover:bg-accent/8">
                <div className="flex items-center gap-3">
                    <IconBox>
                        <Icon className="h-4 w-4 text-foreground/90" />
                    </IconBox>
                    <div className="text-sm font-medium text-foreground truncate">{title}</div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
        </Link>
    );
});

const QuickAction = React.memo(function QuickAction({ icon: Icon, label, hint, to }) {
    return (
        <Link to={to} className="block">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/40 px-4 py-3 backdrop-blur-xl transition-transform duration-350 hover:scale-[1.01] hover:border-accent/50">
                <div className="flex items-center gap-2">
                    <div className="h-9 w-9 grid place-items-center rounded-lg bg-secondary/30">
                        <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <div className="text-sm font-medium text-foreground">{label}</div>
                </div>
                <div className="text-xs text-muted-foreground">{hint}</div>
            </div>
        </Link>
    );
});

/* ---------------------- Main ---------------------- */
export default function ProfilePage() {
    const navigate = useNavigate();
    const reduce = useReducedMotion();

    // demo user — integrate with real auth/context later
    const [role, setRole] = useState("worker");
    const user = useMemo(
        () => ({ name: "User Name", email: "user@example.com", initials: "U", completed: 128, rating: 4.8, phone: "+62 812-3456-7890", balance: 583500 }),
        []
    );

    const tier = useMemo(() => getTier(user.completed), [user.completed]);

    const container = useMemo(
        () => ({ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { staggerChildren: reduce ? 0 : 0.04 } } }),
        [reduce]
    );
    const item = useMemo(() => ({ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.32 } } }), []);

    const toggleRole = useCallback(() => setRole((r) => (r === "worker" ? "client" : "worker")), []);

    const MENU = useMemo(
        () => [
            { key: "edit", icon: User, title: "Edit Profil", to: "/profile/edit" },
            { key: "security", icon: Shield, title: "Keamanan", to: "/profile/security" },
            { key: "notif", icon: Bell, title: "Notifikasi", to: "/notifications" },
            { key: "help", icon: HelpCircle, title: "Bantuan", to: "/help" },
        ],
        []
    );

    const quick = useMemo(
        () => (
            role === "worker"
                ? [
                    { title: "Tugas Saya", hint: "Aktif & menunggu", icon: UserCog, to: "/worker/jobs" },
                    { title: "Dompet", hint: fmtCurrency(user.balance), icon: Wallet, to: "/wallet" },
                ]
                : [
                    { title: "Posting Job", hint: "Buat pekerjaan baru", icon: Rss, to: "/post-job" },
                    { title: "Dompet", hint: fmtCurrency(user.balance), icon: Wallet, to: "/wallet" },
                ]
        ),
        [role, user.balance]
    );

    return (
        <>
            <Helmet>
                <title>Profil — Kerjain</title>
            </Helmet>

            <motion.main initial="hidden" animate="show" variants={container} className="relative min-h-dvh w-full px-4 pb-12 pt-6">
                <div className="mx-auto max-w-md">
                    {/* header */}
                    <motion.header variants={item} className="mb-6 flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            aria-label="Kembali"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/40 backdrop-blur-md hover:bg-accent/8 transition-colors duration-300"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>

                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-semibold text-foreground">Profil</h1>
                            <p className="mt-0.5 text-xs text-muted-foreground">Ringkasan akun</p>
                        </div>
                    </motion.header>

                    {/* profile card */}
                    <motion.section variants={item}>
                        <Glass>
                            <div className="flex items-start gap-4">
                                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-semibold text-primary-foreground ring-1 ring-accent/30 shadow-sm">
                                    {sanitizeText(user.initials)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-base font-semibold text-foreground truncate">{sanitizeText(user.name)}</p>

                                        <Link
                                            to="/gamification"
                                            className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] uppercase tracking-wide font-medium text-accent shadow-sm bg-gradient-to-r ${tier.from} ${tier.to} hover:ring-2 hover:ring-accent/40 transition duration-300`}
                                            aria-label="Lihat halaman gamification"
                                        >
                                            <Award className="h-3.5 w-3.5" /> {tier.label}
                                        </Link>
                                    </div>

                                    <p className="text-xs text-muted-foreground truncate">{sanitizeText(user.email)}</p>

                                    <div className="mt-3 flex gap-3">
                                        <div className="flex items-center gap-1.5 rounded-lg bg-secondary/30 px-2.5 py-1">
                                            <Star className="h-4 w-4 text-yellow-400" />
                                            <span className="text-sm font-medium">{user.rating}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 rounded-lg bg-secondary/30 px-2.5 py-1">
                                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                                            <span className="text-xs">{fmtShort(user.completed)} <span className="text-muted-foreground">Selesai</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Glass>
                    </motion.section>

                    {/* menu */}
                    <motion.nav variants={item} className="mt-6 space-y-3" aria-label="Profil menu">
                        {MENU.map((m) => (
                            <MenuRow key={m.key} icon={m.icon} title={m.title} to={m.to} />
                        ))}

                        {/* role switch */}
                        <div className="pt-1">
                            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/40 px-4 py-3 backdrop-blur-xl transition-colors duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/30">
                                        <UserCog className="h-4 w-4 text-foreground/80" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Peran</p>
                                        <p className="text-xs text-muted-foreground">Pilih peran aktif</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-muted-foreground">{role === "worker" ? "Worker" : "Client"}</span>

                                    <button
                                        role="switch"
                                        aria-checked={role === "worker"}
                                        onClick={toggleRole}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${role === "worker" ? "bg-accent" : "bg-muted/30"} ring-1 ring-border`}
                                        aria-label="Toggle role"
                                    >
                                        <span className={`inline-block h-5 w-5 transform rounded-full bg-card-foreground shadow-sm transition-transform duration-300 ${role === "worker" ? "translate-x-5" : "translate-x-0"}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.nav>

                    {/* Theme section */}
                    <motion.section variants={item} className="mt-6">
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/40 px-4 py-3 backdrop-blur-xl transition-colors duration-300">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/30">
                                    <Star className="h-4 w-4 text-foreground/80" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Tema</p>
                                    <p className="text-xs text-muted-foreground">Pilih Light atau Dark mode</p>
                                </div>
                            </div>
                            <ThemeToggle />
                        </div>
                    </motion.section>

                    {/* quick actions */}
                    <motion.div variants={item} className="mt-6 grid gap-3">
                        {quick.map((q) => (
                            <QuickAction key={q.title} icon={q.icon} label={q.title} hint={q.hint} to={q.to} />
                        ))}

                        <Link to="/referral" className="block">
                            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/40 px-4 py-3 backdrop-blur-xl transition-colors duration-350 hover:border-primary hover:bg-primary/8">
                                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <Gift className="h-4 w-4 text-primary" /> Undang Teman
                                </div>
                                <Button className="ml-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors duration-300 hover:bg-accent">Ajak</Button>
                            </div>
                        </Link>
                    </motion.div>

                    {/* logout */}
                    <motion.div variants={item} className="mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                if (confirm("Keluar dari Kerjain?")) navigate("/login");
                            }}
                            className="w-full rounded-xl bg-destructive/90 px-4 py-3 text-sm font-semibold text-destructive-foreground shadow-sm transition-all duration-300 hover:bg-destructive/100 focus:ring-2 focus:ring-offset-2 focus:ring-destructive"
                        >
                            <span className="inline-flex items-center gap-2 justify-center">
                                <LogOut className="h-4 w-4" /> Keluar
                            </span>
                        </button>
                    </motion.div>

                    <motion.footer variants={item} className="mt-6 text-center text-xs text-muted-foreground" aria-hidden>
                        Kerjain • © {new Date().getFullYear()}
                    </motion.footer>
                </div>
            </motion.main>
        </>
    );
}
