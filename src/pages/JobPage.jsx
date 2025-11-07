// src/pages/JobPage.jsx
import React, { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Helmet } from "react-helmet";
import { ArrowLeft, Search, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import EmptyState from "@/components/feedback/EmptyState";
import AnimatedPage from "@/components/AnimatedPage";

/* -------------------------
   Sample data (replace with API)
   ------------------------- */
const SAMPLE_TASKS = [
    {
        id: "JOB-1001",
        title: "Antar kopi & pulsa",
        description: "Ambil 2 kopi di KopiKita, kirim ke kantor. Beli pulsa 20k.",
        status: "waiting",
        deadline: "2025-09-10T11:00:00Z",
        progress: 0,
        client: { name: "Budi S.", id: "U-200" },
        attachments: [],
        requiresDelivery: false,
        type: "micro",
    },
    {
        id: "JOB-1002",
        title: "Desain poster A3",
        description: "Desain poster promo 1 halaman A3. Sertakan 2 konsep.",
        status: "in_progress",
        deadline: "2025-09-12T18:00:00Z",
        progress: 45,
        client: { name: "Citra L.", id: "U-201" },
        attachments: ["brand-guideline.pdf"],
        requiresDelivery: true,
        type: "project",
    },
    {
        id: "JOB-1003",
        title: "Bersih gudang kecil",
        description: "Butuh 2 orang, estimasi 3 jam. Bawa alat pembersih sendiri.",
        status: "completed",
        deadline: "2025-09-05T09:00:00Z",
        progress: 100,
        client: { name: "Andi", id: "U-202" },
        attachments: [],
        requiresDelivery: false,
        type: "onsite",
    },
];

/* -------------------------
   Utils & sanitization
   ------------------------- */
const sanitizeText = (v = "") =>
    String(v)
        .replace(/<[^>]*>/g, "")
        .replace(/\b(?:javascript:|data:|vbscript:)[^\s]*/gi, "")
        .replace(/https?:\/\/[^\s]+/gi, "")
        .trim()
        .slice(0, 1000);

const fmtDate = (iso) =>
    new Date(iso).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
    });

/* -------------------------
   StatusPill
   ------------------------- */
function StatusPill({ status }) {
    const map = {
        waiting: "Waiting",
        in_progress: "In Progress",
        completed: "Completed",
    };
    const classes =
        status === "waiting"
            ? "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20"
            : status === "in_progress"
                ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                : "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20";

    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${classes}`}
        >
            {map[status]}
        </span>
    );
}

/* -------------------------
   Main Page
   ------------------------- */
export default function JobPage() {
    const reduceMotion = useReducedMotion();
    const [tasks, setTasks] = useState(SAMPLE_TASKS);
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [selected, setSelected] = useState(null);

    // derived list
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return tasks
            .filter((t) => (filter === "all" ? true : t.status === filter))
            .filter((t) =>
                q
                    ? `${t.title} ${t.description} ${t.client.name} ${t.id}`
                        .toLowerCase()
                        .includes(q)
                    : true
            );
    }, [tasks, query, filter]);

    const updateStatus = useCallback((jobId, newStatus) => {
        setTasks((prev) =>
            prev.map((t) =>
                t.id === jobId
                    ? {
                        ...t,
                        status: newStatus,
                        progress: newStatus === "completed" ? 100 : t.progress,
                    }
                    : t
            )
        );
    }, []);

    const listAnim = reduceMotion
        ? {}
        : {
            initial: { opacity: 0, y: 6 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.32, ease: "easeOut" },
        };

    return (
        <AnimatedPage>
            <Helmet>
                <title>My Tasks — MWS IntegraLearn</title>
            </Helmet>

            <div className="min-h-dvh px-4 py-5">
                <div className="mx-auto max-w-3xl">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <Link
                            to={-1}
                            className="inline-flex items-center rounded-full p-2 bg-card/40 border border-border hover:bg-accent/10 transition-colors duration-300 backdrop-blur-xl"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-lg font-semibold">My Tasks</h1>
                            <p className="text-xs text-muted-foreground">
                                List of active jobs
                            </p>
                        </div>
                    </div>

                    {/* Search + Filter */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-1 rounded-full border border-border bg-card/50 px-3 py-2 backdrop-blur-md">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                sanitize="strong"
                                placeholder="Search title, ID, or client..."
                                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-accent/40"
                            />
                        </div>

                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="rounded-full border border-border bg-card/50 px-3 py-2 text-sm backdrop-blur-md transition-colors duration-300 hover:border-accent"
                        >
                            <option value="all">Semua</option>
                            <option value="waiting">Waiting</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {/* Task List */}
                    <div className="space-y-3">
                        {filtered.length === 0 ? (
                            <EmptyState
                                title="Tidak ada tugas"
                                subtitle="Tugas akan muncul di sini."
                                action={
                                    <Button
                                        size="sm"
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 transition duration-300"
                                        onClick={() => setTasks(SAMPLE_TASKS)}
                                    >
                                        Reset Demo
                                    </Button>
                                }
                            />
                        ) : (
                            filtered.map((t) => (
                                <motion.div key={t.id} {...listAnim}>
                                    <Card className="rounded-xl border border-border/40 bg-card/60 p-4 backdrop-blur-xl hover:shadow-lg transition duration-300">
                                        <CardHeader className="p-0">
                                            <div className="flex items-start justify-between">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <CardTitle className="text-sm font-semibold truncate">
                                                            {sanitizeText(t.title)}
                                                        </CardTitle>
                                                        <StatusPill status={t.status} />
                                                    </div>
                                                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                                        {sanitizeText(t.description)}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        <span>{fmtDate(t.deadline)}</span>
                                                        <span>• {t.client?.name}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="text-sm font-semibold text-foreground">
                                                        {t.progress}%
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="rounded-full px-3 py-1 hover:bg-accent/10 transition duration-300"
                                                        onClick={() => setSelected(t)}
                                                    >
                                                        Detail
                                                    </Button>
                                                    {t.status === "waiting" && (
                                                        <Button
                                                            size="sm"
                                                            className="bg-primary text-primary-foreground hover:bg-primary/90 transition duration-300"
                                                            onClick={() => updateStatus(t.id, "in_progress")}
                                                        >
                                                            Mulai
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>

                                        {/* Progress bar */}
                                        <CardContent className="p-0 mt-3">
                                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${t.progress}%` }}
                                                    transition={{ duration: 0.6 }}
                                                    className="h-2 bg-gradient-to-r from-primary to-accent"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Detail modal */}
                <AnimatePresence>
                    {selected && (
                        <motion.div
                            key="detail"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            role="dialog"
                        >
                            <div
                                className="absolute inset-0 bg-black/40"
                                onClick={() => setSelected(null)}
                            />
                            <motion.div
                                initial={{ y: 20 }}
                                animate={{ y: 0 }}
                                exit={{ y: 20 }}
                                transition={{ duration: 0.32 }}
                                className="relative w-full max-w-lg rounded-xl bg-card/95 border border-border p-5 z-10 backdrop-blur-xl"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            {sanitizeText(selected.title)}
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            {selected.client?.name} • {fmtDate(selected.deadline)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusPill status={selected.status} />
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setSelected(null)}
                                            className="hover:text-accent transition"
                                        >
                                            Tutup
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <p className="text-sm text-foreground/90 mb-3">
                                        {sanitizeText(selected.description)}
                                    </p>
                                    <Link to={`/chat/${selected.client.id}`} className="block">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full hover:border-accent transition-colors"
                                        >
                                            <MessageSquare className="mr-2 h-4 w-4" /> Chat Client
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AnimatedPage>
    );
}
