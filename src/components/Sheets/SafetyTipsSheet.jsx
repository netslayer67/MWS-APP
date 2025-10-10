// src/components/Sheets/SafetyTipsSheet.jsx
import React from "react";
import * as Dialog from "@/components/ui/dialog";
import { ShieldCheck, Info, Wallet, Phone, MessageSquare } from "lucide-react";

/**
 * SafetyTipsSheet
 * - Lightweight sheet with safety guidelines for jobs
 *
 * Props:
 * - open: boolean
 * - onOpenChange: (open: boolean) => void
 */
export default function SafetyTipsSheet({ open, onOpenChange }) {
    return (
        <Dialog.Dialog open={open} onOpenChange={onOpenChange}>
            <Dialog.DialogContent className="max-w-lg rounded-3xl glass-strong p-0 overflow-hidden">
                <Dialog.DialogHeader className="p-4 sm:p-5 border-b border-border/50 bg-card/40 backdrop-blur-xl">
                    <Dialog.DialogTitle className="text-base sm:text-lg font-semibold inline-flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-emerald-400" /> Tips Keamanan
                    </Dialog.DialogTitle>
                    <Dialog.DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                        Ikuti panduan ini untuk pengalaman yang aman dan nyaman.
                    </Dialog.DialogDescription>
                </Dialog.DialogHeader>

                <div className="p-4 sm:p-5 space-y-3">
                    <Tip
                        icon={<MessageSquare className="h-4 w-4 text-accent" />}
                        title="Gunakan chat di dalam aplikasi"
                        desc="Simpan percakapan agar mudah ditinjau saat terjadi sengketa."
                    />
                    <Tip
                        icon={<Wallet className="h-4 w-4 text-primary" />}
                        title="Utamakan pembayaran terlindungi"
                        desc="Pilih metode online/escrow untuk nilai pekerjaan tinggi."
                    />
                    <Tip
                        icon={<Phone className="h-4 w-4 text-foreground/80" />}
                        title="Verifikasi kontak"
                        desc="Pastikan nomor telepon dan detail lokasi sesuai."
                    />
                    <Tip
                        icon={<Info className="h-4 w-4 text-amber-400" />}
                        title="Laporkan masalah"
                        desc="Jika terjadi kecurigaan, segera gunakan form 'Laporkan' atau ajukan sengketa."
                    />
                </div>

                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-2 flex items-center justify-end gap-2 border-t border-border/50 bg-card/40 backdrop-blur-xl">
                    <Dialog.DialogClose asChild>
                        <button className="rounded-xl bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:bg-primary/90 transition-colors duration-300">
                            Mengerti
                        </button>
                    </Dialog.DialogClose>
                </div>
            </Dialog.DialogContent>
        </Dialog.Dialog>
    );
}

function Tip({ icon, title, desc }) {
    return (
        <div className="rounded-xl border border-border/50 bg-card/40 p-3">
            <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary/30">{icon}</div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
            </div>
        </div>
    );
}