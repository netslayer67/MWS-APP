// src/pages/WalletPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
    ArrowLeft,
    Download,
    Plus,
    ArrowUpRight,
    ArrowDownLeft,
    Wallet,
    Receipt,
    Shuffle,
    ScanLine,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import KYCStatusBanner from "@/components/Banners/KYCStatusBanner";
import EmptyState from "@/components/feedback/EmptyState";
import TxDetailSheet from "@/components/Sheets/TxDetailSheet";

const fmtIDR = (n) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(n);

const seedTx = [
    { id: 1, type: "in", title: "Pembayaran Budi", amount: 150000, date: "2025-08-30" },
    { id: 2, type: "out", title: "Biaya Platform", amount: 16500, date: "2025-08-30" },
];

const TRANS_MS = 320;

export default function WalletPage() {
    const [activeTab, setActiveTab] = useState("semua");
    const [isLoading, setIsLoading] = useState(true);
    const [prefPay, setPrefPay] = useState("wallet");
    const [kycTier, setKycTier] = useState("L1"); // demo: L0 | L1 | L2
    const { toast } = useToast();
    const reduceMotion = useReducedMotion();

    // Tx detail sheet state
    const [txOpen, setTxOpen] = useState(false);
    const [selectedTx, setSelectedTx] = useState(null);

    useEffect(() => {
        const t = setTimeout(() => setIsLoading(false), 700);
        return () => clearTimeout(t);
    }, []);

    const balance = useMemo(() => 583500, []);
    const filtered = useMemo(() => {
        if (activeTab === "masuk") return seedTx.filter((t) => t.type === "in");
        if (activeTab === "keluar") return seedTx.filter((t) => t.type === "out");
        return seedTx;
    }, [activeTab]);

    const handleToast = (msg) =>
        toast({ title: msg, duration: 1800 });

    const onTopUp = useCallback(() => handleToast("Top Up berhasil (dummy)"), []);
    const onWithdraw = useCallback(() => handleToast("Tarik Dana berhasil (dummy)"), []);

    const downloadCSV = () => {
        const header = "Judul,Nominal,Tanggal\n";
        const rows = filtered.map((tx) => `${tx.title},${tx.amount},${tx.date}`).join("\n");
        const blob = new Blob([header + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "riwayat_transaksi.csv";
        a.click();
        URL.revokeObjectURL(url);
        handleToast("Download CSV dummy");
    };

    const balanceMotion = reduceMotion
        ? {}
        : {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: TRANS_MS / 1000, ease: "easeOut" },
        };

    return (
        <div className="relative min-h-screen text-foreground">
            <div className="relative mx-auto max-w-lg px-4 pb-24 pt-6">
                {/* HEADER */}
                <div className="mb-4 flex items-center gap-3">
                    <Link
                        to={-1}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-card/40 backdrop-blur-xl ring-1 ring-border text-muted-foreground hover:text-accent transition-colors duration-300"
                        aria-label="Back"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-accent" />
                        <h1 className="text-base font-semibold">Wallet</h1>
                    </div>
                </div>

                {/* KYC Banner */}
                <div className="mb-3">
                    <KYCStatusBanner tier={kycTier} onVerify={() => setKycTier("L2")} />
                </div>

                {/* PROFILE INFO (Dummy Bank) */}
                <div className="mb-3 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-3 text-xs">
                    Bank Dummy: BCA 123456789 a/n Nama Pengguna
                </div>

                {/* Preferred Payment
                <div className="mb-3">
                    <PaymentMethodPills value={prefPay} onChange={setPrefPay} size="sm" />
                </div> */}

                {/* BALANCE */}
                <motion.div {...balanceMotion}>
                    <BalanceCard isLoading={isLoading} balance={balance} onTopUp={onTopUp} onWithdraw={onWithdraw} />
                </motion.div>

                {/* Quick Actions */}
                <div className="mt-4">
                    <QuickActions handleToast={handleToast} />
                </div>

                {/* Tabs & Transactions */}
                <div className="mt-5 space-y-3">
                    <div className="inline-flex w-full justify-center rounded-xl bg-card/40 backdrop-blur-xl p-1 ring-1 ring-border transition-colors duration-300">
                        {[
                            { key: "semua", label: "All" },
                            { key: "masuk", label: "In" },
                            { key: "keluar", label: "Out" },
                        ].map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 ${activeTab === t.key
                                    ? "bg-accent text-accent-foreground shadow"
                                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                                    }`}
                                aria-pressed={activeTab === t.key}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <GlassCard>
                        <div className="flex items-center justify-between pb-2">
                            <div className="flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-accent" />
                                <h2 className="text-sm font-semibold">History</h2>
                            </div>
                            <button
                                onClick={downloadCSV}
                                className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-accent transition-colors duration-300"
                            >
                                <Download className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="divide-y divide-border">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => <TxSkeleton key={i} />)
                            ) : filtered.length === 0 ? (
                                <div className="py-4">
                                    <EmptyState
                                        title="No transactions yet"
                                        subtitle="Your transactions will appear here."
                                    />
                                </div>
                            ) : (
                                filtered.map((tx) => (
                                    <TransactionItem
                                        key={tx.id}
                                        tx={tx}
                                        onClick={() => {
                                            setSelectedTx(tx);
                                            setTxOpen(true);
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Tx Detail Sheet */}
            <TxDetailSheet
                open={txOpen}
                onOpenChange={setTxOpen}
                tx={selectedTx || undefined}
            />
        </div>
    );
}

/* ---------- Subcomponents ---------- */

function GlassCard({ children }) {
    return (
        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xl p-4 shadow-sm transition-all duration-300 hover:border-accent/50">
            {children}
        </div>
    );
}

function BalanceCard({ isLoading, balance, onTopUp, onWithdraw }) {
    return (
        <div
            className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/90 to-primary backdrop-blur-xl p-4 text-primary-foreground shadow-md"
            style={{ transition: `all ${TRANS_MS}ms ease-out` }}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[10px] uppercase tracking-wide opacity-80">Saldo</p>
                    {isLoading ? (
                        <div className="mt-1 h-6 w-28 animate-pulse rounded bg-primary-foreground/30" />
                    ) : (
                        <div className="mt-1 flex items-end gap-1">
                            <h2 className="text-xl font-bold">{fmtIDR(balance)}</h2>
                            <span className="mb-0.5 text-[10px] opacity-90">tersedia</span>
                        </div>
                    )}
                </div>

                <div className="flex w-full flex-col gap-1 sm:w-auto sm:flex-row">
                    <button
                        onClick={onTopUp}
                        className="inline-flex items-center justify-center gap-1 rounded-xl bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                    >
                        <Plus className="h-3 w-3" /> Top Up
                    </button>

                    <button
                        onClick={onWithdraw}
                        className="inline-flex items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-primary-foreground ring-1 ring-inset ring-primary-foreground/40 hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                    >
                        <Download className="h-3 w-3" /> Tarik
                    </button>
                </div>
            </div>
        </div>
    );
}

function QuickActions({ handleToast }) {
    const actions = [
        { icon: <Shuffle className="h-4 w-4" />, title: "Transfer", desc: "Kirim cepat", onClick: () => handleToast("Transfer") },
        { icon: <ScanLine className="h-4 w-4" />, title: "Scan & Pay", desc: "Bayar QR", onClick: () => handleToast("Scan & Pay") },
    ];

    return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {actions.map((a, i) => (
                <button
                    key={i}
                    onClick={a.onClick}
                    className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xl p-3 text-left transition-all duration-300 hover:border-accent/50"
                    aria-label={a.title}
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/30 text-secondary-foreground">
                        {a.icon}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-semibold">{a.title}</span>
                            <span className="opacity-0 transition-opacity group-hover:opacity-100 text-accent">→</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{a.desc}</p>
                    </div>
                </button>
            ))}
        </div>
    );
}

const TransactionItem = React.memo(function TransactionItem({ tx, onClick }) {
    const isIn = tx.type === "in";
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full text-left cursor-pointer flex items-center justify-between gap-2 py-3 transition-colors hover:bg-card/30 rounded-xl px-2"
        >
            <div className="flex items-center gap-3">
                <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${isIn ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                        }`}
                >
                    {isIn ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </div>
                <div>
                    <p className="text-xs font-medium">{tx.title}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(tx.date).toLocaleDateString("id-ID")}</p>
                </div>
            </div>
            <p className={`text-xs font-semibold ${isIn ? "text-emerald-400" : "text-rose-400"}`}>
                {isIn ? "+" : "-"} {fmtIDR(tx.amount)}
            </p>
        </button>
    );
});

function TxSkeleton() {
    return (
        <div className="flex items-center justify-between gap-2 py-3">
            <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-muted animate-pulse" />
                <div>
                    <div className="mb-0.5 h-2 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-2 w-16 animate-pulse rounded bg-muted/70" />
                </div>
            </div>
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
    );
}
