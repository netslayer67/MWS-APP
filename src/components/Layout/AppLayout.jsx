import React, { useMemo } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import {
    Home,
    Briefcase,
    Wallet,
    Bell,
    MessageSquare,
    ListChecks,
} from "lucide-react";
import { motion } from "framer-motion";

/* ================= Role-based nav ================= */
const navItemsClient = [
    { path: "/client/dashboard", icon: Home, label: "Beranda" },
    { path: "/post-job", icon: Briefcase, label: "Posting" },
    { path: "/client/wallet", icon: Wallet, label: "Dompet" },
    { path: "/worker/chat", icon: MessageSquare, label: "Obrolan" },
];

const navItemsWorker = [
    { path: "/worker/dashboard", icon: Home, label: "Beranda" },
    { path: "/worker/jobs", icon: ListChecks, label: "Tugas" },
    { path: "/worker/wallet", icon: Wallet, label: "Dompet" },
    { path: "/worker/chat", icon: MessageSquare, label: "Obrolan" },
];

const AppLayout = () => {
    const location = useLocation();
    const isWorker = location.pathname.startsWith("/worker");

    const navItems = useMemo(() => (isWorker ? navItemsWorker : navItemsClient), [isWorker]);

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            {/* ======= HEADER (liquid glass) ======= */}
            <header className="sticky top-0 z-40">
                <div className="relative border-b border-border/50 glass-strong">
                    {/* decorative subtle grid */}
                    <div className="pointer-events-none absolute inset-0 bg-grid-small opacity-10 dark:opacity-15" aria-hidden />
                    <div className="container mx-auto flex h-16 items-center justify-between px-4">
                        {/* Logo */}
                        <Link
                            to={isWorker ? "/worker/dashboard" : "/client/dashboard"}
                            className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent"
                            aria-label="Ke beranda"
                        >
                            Kerjain
                        </Link>

                        {/* Desktop nav */}
                        <nav className="hidden md:flex items-center gap-2">
                            {navItems.map((item) => {
                                const active = location.pathname.startsWith(item.path);
                                const ActiveIcon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`nav-item hover-card flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${active
                                                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm ring-1 ring-accent/20"
                                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                                            }`}
                                        aria-current={active ? "page" : undefined}
                                    >
                                        <ActiveIcon className="h-5 w-5" aria-hidden />
                                        <span className="text-compact">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right actions */}
                        <div className="flex items-center gap-3">
                            <Link
                                to="/notifications"
                                className="relative rounded-full p-2 hover-card"
                                aria-label="Notifikasi"
                            >
                                <Bell className="h-6 w-6 text-muted-foreground hover:text-accent" />
                                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
                            </Link>

                            <Link to="/profile" aria-label="Profil">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-bold text-primary-foreground hover:opacity-90">
                                    U
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* ======= MAIN ======= */}
            <main className="container mx-auto flex-grow px-4 py-6 md:py-10">
                <Outlet />
            </main>

            {/* ======= MOBILE NAV (liquid glass) ======= */}
            <footer className="sticky bottom-0 z-40 md:hidden">
                <nav className="mx-2 mb-2 glass-strong rounded-2xl px-3 py-2 shadow-lg">
                    <ul className="flex items-center justify-around">
                        {navItems.map((item) => {
                            const active = location.pathname.startsWith(item.path);
                            const ActiveIcon = item.icon;
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`nav-item hover-card flex flex-col items-center gap-1 rounded-lg p-2 ${active ? "text-accent" : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                                            }`}
                                        aria-current={active ? "page" : undefined}
                                    >
                                        <ActiveIcon
                                            className={`h-6 w-6 ${active ? "text-primary" : "text-muted-foreground"}`}
                                            aria-hidden
                                        />
                                        {active && (
                                            <motion.div
                                                layoutId="active-nav-indicator"
                                                className="mt-1 h-1.5 w-1.5 rounded-full bg-primary"
                                                aria-hidden
                                            />
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </footer>
        </div>
    );
};

export default AppLayout;
