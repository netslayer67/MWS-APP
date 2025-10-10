// src/pages/RatingPage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedPage from "@/components/AnimatedPage";
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from "react-helmet";

/* -------- Utils: sanitize input -------- */
const safeInput = (v) =>
    String(v || "")
        .replace(/<[^>]*>/g, "") // block script tags
        .replace(/https?:\/\/[^\s]+/gi, "") // block links
        .slice(0, 500); // limit length

export default function RatingPage() {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const { toast } = useToast();
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const role = location.state?.role || "client";
    const target = location.state?.target || {
        name: "User",
        jobTitle: "Tugas Anda",
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast({
                title: "Belum ada rating",
                description: "Silakan pilih bintang dulu ya.",
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "Terima kasih!",
            description: "Ulasan berhasil dikirim.",
        });

        setTimeout(() => {
            navigate(role === "client" ? "/client/dashboard" : "/worker/dashboard");
        }, 1200);
    };

    return (
        <AnimatedPage>
            <Helmet>
                <title>Beri Ulasan — Kerjain</title>
            </Helmet>

            <div className="relative min-h-dvh w-full px-4 py-6 md:px-6 text-foreground">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="mb-6 flex items-center gap-3"
                >
                    <Link to={-1}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full bg-card/40 hover:bg-accent/20 transition-colors duration-300"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-lg font-semibold">Beri Ulasan</h1>
                </motion.div>

                {/* Rating Card */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                >
                    <Card className="rounded-3xl border border-border/30 bg-background/50 shadow-lg backdrop-blur-xl">
                        <CardContent className="p-6 text-center space-y-6">
                            <h2 className="text-base font-medium">
                                Nilai {role === "client" ? "Kinerja" : "Klien"}{" "}
                                <span className="text-primary font-semibold">{target.name}</span>
                            </h2>
                            <p className="text-xs text-muted-foreground">{target.jobTitle}</p>

                            {/* Stars */}
                            <div className="flex justify-center gap-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <motion.div
                                        key={star}
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="transition-transform duration-300"
                                    >
                                        <Star
                                            className={`h-9 w-9 cursor-pointer transition-colors duration-300 ${(hoverRating || rating) >= star
                                                    ? "text-accent fill-accent"
                                                    : "text-muted-foreground"
                                                }`}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <textarea
                                    placeholder="Tulis komentar singkat (opsional)..."
                                    rows="3"
                                    value={comment}
                                    onChange={(e) => setComment(safeInput(e.target.value))}
                                    className="w-full rounded-2xl border border-border/40 bg-background/40 px-3 py-2 text-sm resize-none transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                />

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium shadow transition-all duration-350 hover:opacity-90 group"
                                >
                                    Kirim
                                    <Send className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </AnimatedPage>
    );
}
