import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Brain, Handshake } from "lucide-react";
import { motion } from "framer-motion";

const OptionCard = memo(({ title, description, icon: Icon, onClick, delay = 0, badge, gradient, accent = "text-slate-900", chipColor = "bg-white/40 text-rose-500", emoji }) => (
    <motion.button
        onClick={onClick}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ delay, duration: 0.6, ease: "easeOut" }}
        className="group relative w-full overflow-hidden rounded-[32px] text-left mtss-card-pop mtss-liquid"
        style={{ background: gradient }}
    >
        <div className="absolute inset-0 bg-white/25 dark:bg-black/35 pointer-events-none" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute -right-16 -bottom-8 w-56 h-56 bg-white/25 blur-[120px]" />
            <div className="absolute -left-10 -top-10 w-36 h-36 bg-white/25 blur-3xl" />
        </div>

        <span className="mtss-liquid-hover-blob" />
        <div className="relative z-10 px-7 py-8 space-y-5 text-foreground dark:text-white">
            <div className={`mtss-chip ${chipColor}`}>
                {emoji && <span className="text-lg">{emoji}</span>}
                <Icon className="w-4 h-4" />
                <span className="tracking-[0.3em]">{badge}</span>
            </div>
            <div>
                <h3 className={`text-3xl font-extrabold tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)] ${accent}`}>{title}</h3>
                <p className="text-base text-foreground/85 dark:text-white/90 leading-snug mt-2 max-w-sm drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)]">{description}</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-rose-600 dark:text-white">
                Start now
                <motion.span
                    animate={{ x: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                >
                    →
                </motion.span>
            </div>
        </div>

        <div className="absolute inset-x-7 bottom-4 flex justify-between text-[10px] font-semibold uppercase tracking-[0.3em] text-foreground/60 dark:text-white/80 opacity-80">
            <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-foreground/50 dark:bg-white/80" />
                Playful UI
            </span>
            <span className="flex items-center gap-2">
                Quick Wins
                <span className="h-2 w-2 rounded-full bg-foreground/50 dark:bg-white/80" />
            </span>
        </div>
    </motion.button>
));

OptionCard.displayName = "OptionCard";

const SupportModeSelectionPage = memo(() => {
    const navigate = useNavigate();

    return (
        <div className="mtss-theme mtss-animated-bg min-h-screen relative overflow-hidden text-foreground dark:text-white transition-colors">
            <div className="mtss-bg-overlay" />
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 left-0 w-72 h-72 bg-[#ffaae4]/45 blur-[160px] animate-blob-left" />
                <div className="absolute top-16 right-4 w-72 h-72 bg-[#8be8ff]/45 blur-[150px] animate-blob-right" />
                <div className="absolute bottom-16 left-1/3 w-80 h-80 bg-[#c4f1be]/40 blur-[150px]" />
                <motion.div
                    className="absolute top-12 right-1/3 w-10 h-10 rounded-full bg-white/60"
                    animate={{ y: [0, -14, 0], rotate: [0, 20, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                />
            </div>

            <div className="relative z-20 container-tight py-16 lg:py-24">
                <div className="max-w-3xl mx-auto text-center space-y-6 mb-14" data-aos="fade-up">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/75 backdrop-blur text-rose-500 text-xs font-black tracking-[0.4em] dark:bg-white/10">
                        <Sparkles className="w-4 h-4" />
                        Playful Support
                    </div>
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#f97316] via-[#ec4899] to-[#7c3aed] dark:bg-none dark:text-white drop-shadow-lg">
                            Choose a Support Journey <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff58c2] via-[#ffb347] to-[#7dd3fc]">for Our Kids</span>
                        </h1>
                        <p className="text-base text-slate-700 dark:text-white/80 leading-relaxed mt-3">
                            Pick a lane, spark a plan. MTSS boosts or emotional check-ins&mdash;everything playful, bold, and fast.
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    <OptionCard
                        title="MTSS Journey"
                        description="Sprint into tiered boosts, playful data, and mentor collabs that keep every learner glowing."
                        icon={Brain}
                        badge="For Teachers & Mentors"
                        emoji="🧠"
                        chipColor="bg-white/70 text-rose-600"
                        accent="text-rose-700"
                        onClick={() => navigate("/mtss")}
                        gradient="linear-gradient(135deg,#ff58c2 0%,#ff7ad9 35%,#ffb347 100%)"
                        delay={0.1}
                    />
                    <OptionCard
                        title="Emotional Check-in"
                        description="Lightning-fast mood check, confetti encouragement, and instant nudges to caregivers."
                        icon={Handshake}
                        badge="For Students, Staff & Families"
                        emoji="✨"
                        chipColor="bg-white/70 text-sky-600"
                        accent="text-sky-700"
                        onClick={() => navigate("/select-role")}
                        gradient="linear-gradient(135deg,#7dd3fc 0%,#60a5fa 30%,#a7f3d0 100%)"
                        delay={0.2}
                    />
                </div>
            </div>
        </div>
    );
});

SupportModeSelectionPage.displayName = "SupportModeSelectionPage";
export default SupportModeSelectionPage;
