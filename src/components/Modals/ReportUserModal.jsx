// src/components/Modals/ReportUserModal.jsx
import React, { useState, useCallback } from "react";
import * as Dialog from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Image as ImageIcon } from "lucide-react";

/**
 * ReportUserModal
 * - Compact report form with sanitized input and optional image
 *
 * Props:
 * - open: boolean
 * - onOpenChange: (open: boolean) => void
 * - onSubmit: (payload: { reason: string; detail: string; file?: File | null }) => void
 */
export default function ReportUserModal({ open, onOpenChange, onSubmit }) {
    const [reason, setReason] = useState("Perilaku tidak sopan");
    const [detail, setDetail] = useState("");
    const [file, setFile] = useState(null);

    const handleFile = useCallback((e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        // accept small images/pdf only
        const ok =
            ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(f.type) &&
            f.size <= 3 * 1024 * 1024;
        if (!ok) {
            alert("File tidak didukung atau terlalu besar (maks 3MB).");
            e.target.value = "";
            return;
        }
        setFile(f);
    }, []);

    const submit = useCallback(() => {
        if (!reason || !detail.trim()) {
            alert("Lengkapi alasan dan detail laporan.");
            return;
        }
        onSubmit?.({ reason, detail, file });
        onOpenChange(false);
        // reset after submit
        setTimeout(() => {
            setReason("Perilaku tidak sopan");
            setDetail("");
            setFile(null);
        }, 50);
    }, [reason, detail, file, onOpenChange, onSubmit]);

    return (
        <Dialog.Dialog open={open} onOpenChange={onOpenChange}>
            <Dialog.DialogContent className="max-w-lg rounded-3xl glass-strong p-0 overflow-hidden">
                <Dialog.DialogHeader className="p-4 sm:p-5 border-b border-border/50 bg-card/40 backdrop-blur-xl">
                    <Dialog.DialogTitle className="text-base sm:text-lg font-semibold inline-flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Laporkan Pengguna
                    </Dialog.DialogTitle>
                    <Dialog.DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                        Jelaskan masalah secara singkat dan lampirkan bukti bila perlu.
                    </Dialog.DialogDescription>
                </Dialog.DialogHeader>

                <div className="p-4 sm:p-5 space-y-3">
                    <div>
                        <Label className="text-xs text-muted-foreground">Alasan</Label>
                        <div className="mt-1 inline-flex w-full rounded-xl bg-card/40 p-1 ring-1 ring-border backdrop-blur-md">
                            {[
                                "Perilaku tidak sopan",
                                "Penipuan",
                                "Pembayaran bermasalah",
                                "Konten berbahaya",
                            ].map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    aria-pressed={reason === r}
                                    onClick={() => setReason(r)}
                                    className={`flex-1 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors duration-300 ${reason === r ? "bg-accent text-accent-foreground shadow" : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                                        }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs text-muted-foreground">Detail</Label>
                        <Textarea
                            rows={4}
                            sanitize="strong"
                            value={detail}
                            onChange={(e) => setDetail(e.target.value)}
                            placeholder="Tuliskan detail kejadian..."
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label className="text-xs text-muted-foreground">Lampiran (opsional)</Label>
                        <div className="mt-1 flex items-center gap-2">
                            <input type="file" accept="image/*,application/pdf" onChange={handleFile} className="hidden" id="report-file" />
                            <label
                                htmlFor="report-file"
                                className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-border/50 bg-card/40 px-3 py-1.5 text-xs sm:text-sm backdrop-blur-md hover:bg-accent/10 transition-colors duration-300"
                            >
                                <ImageIcon className="h-4 w-4" />
                                {file ? "Ganti File" : "Pilih File"}
                            </label>
                            <span className="text-xs text-muted-foreground truncate max-w-[10rem]">{file?.name || "Tidak ada file"}</span>
                        </div>
                    </div>
                </div>

                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-2 flex items-center justify-end gap-2 border-t border-border/50 bg-card/40 backdrop-blur-xl">
                    <Dialog.DialogClose asChild>
                        <Button variant="outline" size="sm" className="rounded-xl">
                            Batal
                        </Button>
                    </Dialog.DialogClose>
                    <Button size="sm" className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={submit}>
                        Kirim Laporan
                    </Button>
                </div>
            </Dialog.DialogContent>
        </Dialog.Dialog>
    );
}