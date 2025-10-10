import React, { useMemo, useState, useCallback } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import AnimatedPage from "@/components/AnimatedPage";
import { ArrowLeft, ShieldCheck, LockKeyhole, Smartphone, Activity, Eye, EyeOff, LogOut } from "lucide-react";

/**
 * SecurityPage
 * - Minimal yet practical security/privacy page for V1.0
 * - Sections: Change Password (demo), Sessions (demo), 2FA toggle (stub), Profile visibility toggle
 * - Compact layout; token-driven; 320ms motion
 */

function SectionCard({ title, icon: Icon, children, desc }) {
    return (
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-4 shadow-sm transition-all duration-320 hover:border-accent/40">
            <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">
                    <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                    </div>
                    {desc ? <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p> : null}
                    <div className="mt-3">{children}</div>
                </div>
            </div>
        </div>
    );
}

export default function SecurityPage() {
    const reduce = useReducedMotion();
    const { toast } = useToast();

    // Change password (demo)
    const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
    const onChangePwdField = (k, v) => setPwd((s) => ({ ...s, [k]: v }));
    const canChange = useMemo(() => {
        return pwd.current.trim().length >= 6 && pwd.next.trim().length >= 6 && pwd.next === pwd.confirm;
    }, [pwd]);

    // Sessions (demo list)
    const [sessions, setSessions] = useState([
        { id: 1, device: "Chrome • Windows", last: "Baru saja", current: true },
        { id: 2, device: "Safari • iPhone", last: "Kemarin 19:12", current: false },
    ]);
    const revoke = useCallback((id) => {
        setSessions((s) => s.filter((x) => x.id !== id || x.current));
        toast({ title: "Sesi dicabut", description: "Perangkat berhasil dikeluarkan." });
    }, [toast]);

    // 2FA and privacy (stub toggles)
    const [twoFA, setTwoFA] = useState(false);
    const [visible, setVisible] = useState(true);

    const variants = useMemo(
        () => ({
            initial: reduce ? {} : { opacity: 0, y: 10 },
            animate: reduce ? {} : { opacity: 1, y: 0, transition: { duration: 0.32 } },
        }),
        [reduce]
    );

    const savePwd = () => {
        if (!canChange) {
            toast({ title: "Cek input", description: "Pastikan password valid dan cocok.", variant: "destructive" });
            return;
        }
        toast({ title: "Password diperbarui", description: "Perubahan disimpan (demo)." });
        setPwd({ current: "", next: "", confirm: "" });
    };

    const onToggle2FA = () => {
        setTwoFA((v) => !v);
        toast({ title: "Pengaturan diperbarui", description: `2FA ${!twoFA ? "diaktifkan" : "dinonaktifkan"} (demo).` });
    };

    const onToggleVisible = () => {
        setVisible((v) => !v);
        toast({ title: "Privasi diperbarui", description: `Profil ${!visible ? "terlihat" : "disembunyikan"} (demo).` });
    };

    return (
        <AnimatedPage>
            <Helmet>
                <title>Keamanan & Privasi — Kerjain</title>
            </Helmet>

            <motion.div
                variants={variants}
                initial="initial"
                animate="animate"
                className="relative mx-auto max-w-lg px-3 sm:px-4 pb-16 pt-4 sm:pt-6"
            >
                {/* Header */}
                <header className="mb-4 sm:mb-6 flex items-center justify-between">
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
                            <h1 className="text-base sm:text-lg font-semibold text-foreground">Keamanan & Privasi</h1>
                            <p className="text-[11px] sm:text-xs text-muted-foreground">Atur perlindungan akun Anda</p>
                        </div>
                    </div>
                </header>

                <div className="grid gap-3 sm:gap-4">
                    {/* Password */}
                    <SectionCard
                        title="Ubah Password"
                        icon={LockKeyhole}
                        desc="Gunakan kombinasi huruf, angka, dan simbol."
                    >
                        <div className="grid gap-2 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="mb-1 block text-[11px] text-foreground/85">Password Saat Ini</label>
                                <Input
                                    type="password"
                                    value={pwd.current}
                                    onChange={(e) => onChangePwdField("current", e.target.value)}
                                    sanitize="strong"
                                    placeholder="••••••••"
                                    className="rounded-xl bg-background/50"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-[11px] text-foreground/85">Password Baru</label>
                                <Input
                                    type="password"
                                    value={pwd.next}
                                    onChange={(e) => onChangePwdField("next", e.target.value)}
                                    sanitize="strong"
                                    placeholder="Minimal 6 karakter"
                                    className="rounded-xl bg-background/50"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-[11px] text-foreground/85">Konfirmasi</label>
                                <Input
                                    type="password"
                                    value={pwd.confirm}
                                    onChange={(e) => onChangePwdField("confirm", e.target.value)}
                                    sanitize="strong"
                                    placeholder="Ulangi password"
                                    className="rounded-xl bg-background/50"
                                />
                            </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                            <Button
                                size="sm"
                                onClick={savePwd}
                                disabled={!canChange}
                                className="rounded-full bg-primary px-4 py-1.5 text-xs text-primary-foreground hover:bg-primary/90 transition-colors duration-320"
                            >
                                Simpan
                            </Button>
                        </div>
                    </SectionCard>

                    {/* Sessions */}
                    <SectionCard
                        title="Sesi Perangkat"
                        icon={Activity}
                        desc="Kelola perangkat yang login ke akun Anda."
                    >
                        <div className="divide-y divide-border">
                            {sessions.map((s) => (
                                <div key={s.id} className="flex items-center justify-between py-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium">{s.device}</p>
                                        <p className="text-[11px] text-muted-foreground">{s.current ? "Perangkat ini" : `Terakhir: ${s.last}`}</p>
                                    </div>
                                    {!s.current ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => revoke(s.id)}
                                            className="rounded-full px-3 py-1 text-xs hover:border-destructive hover:text-destructive transition-colors duration-320"
                                        >
                                            Cabut
                                        </Button>
                                    ) : (
                                        <span className="text-[11px] text-muted-foreground">Aktif</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    {/* 2FA */}
                    <SectionCard
                        title="Autentikasi Dua Langkah"
                        icon={Smartphone}
                        desc="Tambahkan lapisan keamanan tambahan (demo)."
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">Kode via aplikasi autentikator</p>
                            <button
                                role="switch"
                                aria-checked={twoFA}
                                onClick={onToggle2FA}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full ring-1 ring-border transition-colors duration-320 ${twoFA ? "bg-accent" : "bg-muted/30"}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-card-foreground shadow-sm transition-transform duration-320 ${twoFA ? "translate-x-5" : "translate-x-0"}`} />
                            </button>
                        </div>
                    </SectionCard>

                    {/* Privacy */}
                    <SectionCard
                        title="Visibilitas Profil"
                        icon={visible ? Eye : EyeOff}
                        desc="Atur apakah profil Anda terlihat publik."
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                                {visible ? "Profil dapat ditemukan publik." : "Profil tersembunyi dari publik."}
                            </p>
                            <button
                                role="switch"
                                aria-checked={visible}
                                onClick={onToggleVisible}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full ring-1 ring-border transition-colors duration-320 ${visible ? "bg-accent" : "bg-muted/30"}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-card-foreground shadow-sm transition-transform duration-320 ${visible ? "translate-x-5" : "translate-x-0"}`} />
                            </button>
                        </div>
                    </SectionCard>

                    {/* Danger area (logout all) */}
                    <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-destructive shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" />
                                <span className="text-sm font-semibold">Keluar dari semua perangkat</span>
                            </div>
                            <Button
                                size="sm"
                                variant="destructive"
                                className="rounded-full px-3 py-1 text-xs"
                                onClick={() => {
                                    // demo only
                                    setSessions((s) => s.filter((x) => x.current));
                                }}
                            >
                                <LogOut className="mr-1 h-4 w-4" /> Keluar
                            </Button>
                        </div>
                        <p className="mt-1 text-[11px]">Tindakan ini akan mengeluarkan semua sesi selain perangkat ini.</p>
                    </div>
                </div>
            </motion.div>
        </AnimatedPage>
    );
}