// src/pages/JobTrackingPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
    MapPin,
    MessageSquare,
    Phone,
    AlertTriangle,
    Star,
    Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import SafetyTipsSheet from "@/components/Sheets/SafetyTipsSheet";
import ReportUserModal from "@/components/Modals/ReportUserModal";

const safeText = (v = "") =>
    String(v)
        .replace(/<[^>]*>/g, "")
        .replace(/https?:\/\/[^\s]+/gi, "")
        .trim()
        .slice(0, 1600);

// Dummy job
const DUMMY_JOB = {
    id: "1",
    title: "Perbaikan AC Rumah",
    description: "Servis rutin + pengecekan kebocoran.",
    statusSteps: [
        { name: "Diterima", completed: true, time: new Date().toISOString() },
        { name: "Pekerja Bergerak", completed: true, time: new Date().toISOString() },
        { name: "On Progress", completed: false },
        { name: "Selesai", completed: false },
    ],
    currentStepIndex: 1,
    worker: { name: "Budi Santoso", phone: "08123456789", rating: 4.8, initial: "B" },
    price: 250000,
    locationLabel: "Jl. Merdeka No. 45, Jakarta",
    duration: "2 jam",
};

export default function JobTrackingPage({ job = null, role = "client" }) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const data = job || DUMMY_JOB;

    const [mapLoaded, setMapLoaded] = useState(true);
    const [slidePercent, setSlidePercent] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [openSafety, setOpenSafety] = useState(false);
    const [openReport, setOpenReport] = useState(false);
    const sliderRef = useRef(null);
    const knobRef = useRef(null);

    // auto redirect kalau selesai
    useEffect(() => {
        if (completed) {
            toast({
                title: "Pekerjaan selesai",
                description: "Mengalihkan ke halaman penilaian...",
            });
            const t = setTimeout(() => navigate(`/job/${data.id}/rate`), 800);
            return () => clearTimeout(t);
        }
    }, [completed]);

    // slide logic
    const SLIDE_THRESHOLD = 78;
    const MAX_DRAG_PX = 260;
    const onDrag = (clientX) => {
        const slider = sliderRef.current;
        if (!slider || !knobRef.current) return;
        const rect = slider.getBoundingClientRect();
        const px = Math.min(Math.max(0, clientX - rect.left - 8), rect.width - 40);
        const percent = Math.round((px / (rect.width - 40)) * 100);
        setSlidePercent(percent);
    };
    const onDragEnd = () => {
        if (slidePercent >= SLIDE_THRESHOLD) {
            setSlidePercent(100);
            setCompleted(true);
        } else {
            setSlidePercent(0);
        }
    };

    return (
        <div className="min-h-dvh p-3 sm:p-4 text-foreground">
            <Helmet>
                <title>Lacak Pekerjaan — {safeText(data.title)}</title>
            </Helmet>

            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="max-w-3xl mx-auto space-y-3 sm:space-y-4"
            >
                {/* Title */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-base sm:text-lg font-bold">
                            {safeText(data.title)}
                        </h1>
                        <p className="text-xs text-muted-foreground">Lacak progres pekerjaan</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-3">
                        <div className="rounded-full p-2 bg-card/60 backdrop-blur-md border">
                            <span className="text-sm font-medium">
                                {safeText(data.worker.initial || "?")}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Map (react-leaflet) */}
                <div className="relative rounded-2xl overflow-hidden border bg-card/50 backdrop-blur-xl">
                    <MapContainer
                        center={[-7.81423, 110.36949]}
                        zoom={13}
                        scrollWheelZoom={false}
                        className="w-full aspect-[4/3] md:aspect-video"
                        whenReady={() => setMapLoaded(true)}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[-7.81423, 110.36949]}>
                            <Popup>
                                {safeText(data.title)} • {safeText(data.locationLabel)}
                            </Popup>
                        </Marker>
                    </MapContainer>
                    {!mapLoaded && (
                        <div className="absolute inset-0 grid place-items-center">
                            <p className="text-sm text-muted-foreground">Memuat peta…</p>
                        </div>
                    )}
                    <div className="absolute left-3 top-3 rounded-full bg-card/80 px-2.5 py-1 text-xs border">
                        ETA: {safeText(data.duration || "—")}
                    </div>
                    <div className="absolute right-3 top-3 flex gap-2">
                        <button
                            onClick={() => setOpenSafety(true)}
                            className="rounded-lg border px-2.5 py-1 text-xs bg-background/60 hover:bg-accent/10 transition-colors duration-300"
                            title="Tips Keamanan"
                        >
                            Tips
                        </button>
                        <button
                            onClick={() => setOpenReport(true)}
                            className="rounded-lg border px-2.5 py-1 text-xs bg-background/60 hover:bg-destructive/10 hover:text-destructive transition-colors duration-300"
                            title="Laporkan Pengguna"
                        >
                            Laporkan
                        </button>
                    </div>
                </div>

                {/* Compact details */}
                <div className="rounded-2xl bg-card/50 backdrop-blur-xl border p-2 sm:p-3 grid gap-1.5 sm:flex sm:justify-between transition-all">
                    <div className="min-w-0">
                        <p className="text-sm sm:text-base font-semibold line-clamp-2">
                            {safeText(data.title)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {safeText(data.locationLabel)}
                        </p>
                        <div className="flex gap-1.5 mt-1 sm:mt-2 text-xs">
                            <span className="inline-flex items-center gap-1 rounded-md bg-secondary/20 px-2 py-0.5">
                                <Star className="w-3.5 h-3.5 text-yellow-400" /> {data.worker.rating ?? "—"}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5">
                                {Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    maximumFractionDigits: 0,
                                }).format(data.price)}
                            </span>
                        </div>
                    </div>

                    <div className="mt-2 sm:mt-0 flex items-center gap-1.5 sm:gap-2">
                        <button
                            onClick={() => toast({ title: "Chat demo" })}
                            className="rounded-lg border px-2.5 py-1 text-xs sm:text-sm hover:bg-accent/10 transition-colors duration-300"
                        >
                            <MessageSquare className="w-4 h-4 inline-block mr-1" /> Chat
                        </button>
                        <a
                            href={`tel:${data.worker.phone || ""}`}
                            className="rounded-lg border px-2.5 py-1 text-xs sm:text-sm hover:bg-accent/10 transition-colors duration-300"
                        >
                            <Phone className="w-4 h-4 inline-block mr-1" /> Call
                        </a>
                        <button
                            onClick={() => setOpenSafety(true)}
                            className="rounded-lg border px-2.5 py-1 text-xs sm:text-sm hover:bg-accent/10 transition-colors duration-300"
                        >
                            Tips
                        </button>
                        <button
                            onClick={() => setOpenReport(true)}
                            className="rounded-lg border px-2.5 py-1 text-xs sm:text-sm hover:bg-destructive/10 hover:text-destructive transition-colors duration-300"
                        >
                            Laporkan
                        </button>
                    </div>
                </div>

                {/* Progress */}
                <div className="rounded-2xl bg-card/50 backdrop-blur-xl border p-2 sm:p-3">
                    <div className="flex justify-between mb-2">
                        <p className="text-sm font-medium">Progres</p>
                        <p className="text-xs text-muted-foreground">
                            {Math.round(((data.currentStepIndex + 1) / data.statusSteps.length) * 100)}%
                        </p>
                    </div>
                    <div className="space-y-2.5">
                        {data.statusSteps.map((s, i) => {
                            const done = Boolean(s.completed) || i <= data.currentStepIndex;
                            return (
                                <div key={s.name} className="flex items-center gap-2.5">
                                    <div
                                        className={`h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-full text-sm transition-colors duration-300 ${done ? "bg-primary text-primary-foreground" : "bg-card/50 text-muted-foreground"
                                            }`}
                                    >
                                        {done ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <span>{i + 1}</span>}
                                    </div>
                                    <div>
                                        <div className={done ? "text-xs sm:text-sm text-foreground" : "text-xs sm:text-sm text-foreground/80"}>
                                            {safeText(s.name)}
                                        </div>
                                        {s.time && <div className="text-[10px] sm:text-xs text-muted-foreground">{new Date(s.time).toLocaleString()}</div>}
                                    </div>
                                </div>
                            );
                        })}
                        <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                                style={{
                                    width: `${Math.min(100, ((data.currentStepIndex + 1) / data.statusSteps.length) * 100)}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {role === "client" ? (
                    <div className="sticky bottom-3 z-20">
                        <div className="flex gap-2">
                            <Button
                                variant="destructive"
                                className="flex-1 rounded-xl text-xs sm:text-sm"
                                onClick={() => navigate(`/dispute?jobId=${data.id}`)}
                            >
                                <AlertTriangle className="w-4 h-4 mr-1.5" /> Laporkan
                            </Button>
                            <Button
                                className="flex-1 rounded-xl bg-gradient-to-r from-primary to-accent text-xs sm:text-sm"
                                onClick={() => navigate(`/job/${data.id}/rate`)}
                            >
                                Selesaikan & Rating
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl bg-card/50 backdrop-blur-xl border p-2 sm:p-3">
                        <p className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Geser untuk menandai selesai</p>
                        <div ref={sliderRef} className="relative h-10 sm:h-12 rounded-full bg-muted/60 overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                                style={{ width: `${slidePercent}%` }}
                            />
                            <motion.div
                                ref={knobRef}
                                drag="x"
                                dragConstraints={{ left: 0, right: MAX_DRAG_PX }}
                                dragElastic={0.05}
                                className="absolute left-0 top-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-accent/90 text-white flex items-center justify-center shadow cursor-grab"
                                onDrag={(e, info) => onDrag(info.point.x)}
                                onDragEnd={onDragEnd}
                                whileTap={{ scale: 0.98 }}
                                style={{ touchAction: "pan-y" }}
                            >
                                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.div>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-xs sm:text-sm text-muted-foreground">Geser untuk Selesai</span>
                            </div>
                        </div>
                    </div>
                )}
                {/* Safety and Report */}
                <SafetyTipsSheet open={openSafety} onOpenChange={setOpenSafety} />
                <ReportUserModal
                    open={openReport}
                    onOpenChange={setOpenReport}
                    onSubmit={({ reason, detail }) => {
                        toast({ title: "Laporan terkirim", description: `${reason} • ${detail.slice(0, 60)}...` });
                    }}
                />
            </motion.div>
        </div>
    );
}
