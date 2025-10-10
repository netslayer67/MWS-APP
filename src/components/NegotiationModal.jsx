import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, ShieldCheck, AlertCircle } from "lucide-react";

// Sanitizer input (angka only)
const safeInput = (val = "") =>
    String(val || "")
        .replace(/[^0-9]/g, "")
        .slice(0, 9);

const NegotiationModalCompact = ({
    isOpen,
    onClose,
    jobFee = 100000,
    role = "worker", // "worker" | "client"
    initialOffers = [],
    onSendOffer, // optional: (amount:number) => void
    onAccept,    // optional: (offer) => void
    onReject,    // optional: (offer) => void
    onAcceptedFinal, // optional: (offer) => void (finalize & close)
}) => {
    const [offers, setOffers] = useState(initialOffers);
    const [inputValue, setInputValue] = useState("");
    const [notification, setNotification] = useState(null);
    const prevOpen = useRef(false);

    useEffect(() => {
        if (isOpen && !prevOpen.current) {
            setOffers(initialOffers || []);
            setNotification(null);
        }
        prevOpen.current = isOpen;
    }, [isOpen, initialOffers]);

    const addOffer = (amount, byRole) => {
        const amt = Number(amount);
        if (!amt || isNaN(amt)) return;
        const newOffer = {
            id: Date.now(),
            amount: amt,
            by: byRole,
            status: "pending",
            createdAt: Date.now(),
            expiresAt: Date.now() + 60000,
        };
        setOffers((prev) => [...prev, newOffer]);
        setNotification(
            `Rp${amt.toLocaleString("id-ID")} dikirim oleh ${byRole === "worker" ? "Pekerja" : "Klien"}`
        );
        try {
            onSendOffer?.(amt);
        } catch {
            /* noop */
        }
    };

    // auto expire
    useEffect(() => {
        const interval = setInterval(() => {
            setOffers((prev) =>
                prev.map((o) =>
                    o.status === "pending" && o.expiresAt < Date.now()
                        ? { ...o, status: "expired" }
                        : o
                )
            );
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const acceptOffer = (id) => {
        const accepted = offers.find((o) => o.id === id);
        setOffers((prev) =>
            prev.map((o) => (o.id === id ? { ...o, status: "accepted" } : o))
        );
        setNotification("Penawaran diterima ✔️");
        try {
            if (accepted) {
                onAccept?.(accepted);
                onAcceptedFinal?.(accepted);
            }
        } catch {
            /* noop */
        }
    };

    const rejectOffer = (id) => {
        const rej = offers.find((o) => o.id === id);
        setOffers((prev) =>
            prev.map((o) => (o.id === id ? { ...o, status: "rejected" } : o))
        );
        setNotification("Penawaran ditolak ✖️");
        try {
            if (rej) onReject?.(rej);
        } catch {
            /* noop */
        }
    };

    const quickOffers = [0.8, 1.0, 1.2];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-md px-2 sm:px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="relative w-full max-w-md rounded-2xl bg-background/80 dark:bg-zinc-900/70 backdrop-blur-2xl p-4 sm:p-6 shadow-xl border border-border"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                        {/* Close */}
                        <button
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors duration-300"
                            onClick={onClose}
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-base sm:text-lg font-semibold mb-3 text-foreground">
                            Negosiasi
                        </h2>

                        {notification && (
                            <div className="mb-3 flex items-center gap-1.5 text-xs sm:text-sm text-accent">
                                <AlertCircle size={14} /> {notification}
                            </div>
                        )}

                        {/* List Offers */}
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                            {offers.map((offer) => {
                                const isOpponent =
                                    (role === "client" && offer.by === "worker") ||
                                    (role === "worker" && offer.by === "client");

                                return (
                                    <motion.div
                                        key={offer.id}
                                        className={`p-2 sm:p-3 rounded-xl border flex justify-between items-center text-xs sm:text-sm transition-colors duration-300 ${offer.status === "accepted"
                                            ? "bg-green-500/20 border-green-500/40"
                                            : offer.status === "rejected"
                                                ? "bg-red-500/20 border-red-500/40"
                                                : offer.status === "expired"
                                                    ? "bg-muted/30 border-muted/40"
                                                    : "bg-secondary/20 border-secondary/40"
                                            }`}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <div>
                                            <p className="font-medium">
                                                Rp{(Number(offer.amount) || 0).toLocaleString("id-ID")}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {offer.by === "worker" ? "Pekerja" : "Klien"}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            {offer.status === "pending" && isOpponent && (
                                                <>
                                                    <button
                                                        className="px-2 py-1 rounded-lg bg-accent text-[11px] text-secondary hover:bg-accent/90 transition-colors duration-300"
                                                        onClick={() => acceptOffer(offer.id)}
                                                    >
                                                        Terima
                                                    </button>
                                                    <button
                                                        className="px-2 py-1 rounded-lg bg-red-500 text-[11px] text-secondary hover:bg-red-600 transition-colors duration-300"
                                                        onClick={() => rejectOffer(offer.id)}
                                                    >
                                                        Tolak
                                                    </button>
                                                </>
                                            )}
                                            {offer.status === "pending" && (
                                                <Clock size={13} className="text-muted-foreground" />
                                            )}
                                            {offer.status === "accepted" && (
                                                <ShieldCheck size={14} className="text-green-500" />
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                            {offers.length === 0 && (
                                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                                    Belum ada penawaran.
                                </p>
                            )}
                        </div>

                        {/* Input + QuickOffer */}
                        <div className="mt-4 space-y-2">
                            <div className="flex gap-2">
                                {quickOffers.map((mult) => (
                                    <button
                                        key={mult}
                                        onClick={() => addOffer(Math.round(jobFee * mult), role)}
                                        className="flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs sm:text-sm hover:bg-primary/90 transition-colors duration-300"
                                    >
                                        Rp{Math.round(jobFee * mult).toLocaleString("id-ID")}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(safeInput(e.target.value))}
                                    placeholder="Nominal"
                                    className="flex-1 px-2 sm:px-3 py-1.5 rounded-lg bg-muted/40 border border-border text-xs sm:text-sm focus:ring-2 focus:ring-accent outline-none transition-colors duration-300"
                                />
                                <button
                                    onClick={() => {
                                        if (inputValue) {
                                            addOffer(Number(inputValue), role);
                                            setInputValue("");
                                        }
                                    }}
                                    className="px-3 sm:px-4 py-1.5 rounded-lg bg-accent text-secondary text-xs sm:text-sm hover:bg-accent/90 transition-colors duration-300"
                                >
                                    Kirim
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NegotiationModalCompact;
