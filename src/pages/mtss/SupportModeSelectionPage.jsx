import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Brain, Handshake } from "lucide-react";
import { motion } from "framer-motion";

const OptionCard = memo(({ title, description, icon: Icon, accent, onClick, delay = 0, badge }) => (
    <motion.button
        onClick={onClick}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5, ease: "easeOut" }}
        className="group relative w-full glass glass-card overflow-hidden px-6 py-8 rounded-3xl text-left hover:-translate-y-1 hover:shadow-glass-lg transition-all duration-300"
        data-aos="fade-up"
        data-aos-delay={delay * 100}
    >
        <div className="glass__refract" />
        <div className="glass__noise" />

        <div className="relative z-10 space-y-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-sm ${accent}`}>
                <Icon className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-widest">{badge}</span>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                Start now
                <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </div>
        </div>

        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full" />
            <div className="absolute top-3 left-3 w-16 h-16 border border-white/50 rounded-3xl rotate-6 opacity-60" />
            <div className="absolute bottom-6 left-8 w-8 h-8 rounded-full bg-white/40 animate-pulse" />
        </div>
    </motion.button>
));

OptionCard.displayName = "OptionCard";

const SupportModeSelectionPage = memo(() => {
    const navigate = useNavigate();

    return (
        <div
            className="min-h-screen relative overflow-hidden text-foreground dark:text-white transition-colors dark:bg-[var(--mtss-hero-bg)]"
            style={{ background: "linear-gradient(180deg,#fff4f3 0%,#ffe3ef 35%,#f4e6ff 70%,#eff5ff 100%)" }}
        >
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] bg-primary/10 blur-[160px]" />
                <div className="absolute bottom-10 right-10 w-72 h-72 bg-gold/25 blur-[120px]" />
                <div className="absolute top-16 left-10 w-32 h-32 bg-emerald/20 blur-[90px]" />
                <div className="absolute bottom-24 left-1/4 w-48 h-48 bg-[#ff8da5]/18 blur-[110px]" />
                <motion.div
                    className="absolute top-20 right-1/3 w-10 h-10 rounded-full bg-white/40"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                />
            </div>

            <div className="relative z-10 container-tight py-16 lg:py-24">
                <div className="max-w-3xl mx-auto text-center space-y-6 mb-14" data-aos="fade-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-white/70 text-primary text-xs uppercase tracking-[0.3em] dark:border-white/10 dark:bg-white/5 dark:text-primary-foreground">
                        <Sparkles className="w-4 h-4 text-gold" />
                        MTSS & Emotional Care
                    </div>
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground dark:text-white drop-shadow-md">
                            Choose a Support Journey for{" "}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff7ad9] via-[#f6b37f] to-primary">
                                Our Kids
                            </span>
                        </h1>
                        <p className="text-base text-foreground/80 dark:text-white/80 leading-relaxed mt-4">
                            Pick the pathway that matches your role&mdash;daily emotional check-ins or tiered academic boosts&mdash;all inside one playful, lightweight workspace.
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    <OptionCard
                        title="MTSS Journey"
                        description="Create joyful intervention plans, team up with mentors, and watch every learner's growth story in real time."
                        icon={Brain}
                        accent="bg-gradient-to-r from-[#ff87c5]/80 via-primary/70 to-[#a855f7]/80 text-white border border-white/30 shadow-sm"
                        badge="For Teachers & Mentors"
                        onClick={() => navigate("/mtss")}
                        delay={0.1}
                    />
                    <OptionCard
                        title="Emotional Check-in"
                        description="Check in on feelings, send instant encouragement, and loop in counselors or families whenever extra care is needed—open to every user."
                        icon={Handshake}
                        accent="bg-gradient-to-r from-[#34d399]/80 via-[#22d3ee]/80 to-[#60a5fa]/80 text-white border border-white/30 shadow-sm"
                        badge="For Students, Staff & Families"
                        onClick={() => navigate("/select-role")}
                        delay={0.2}
                    />
                </div>
            </div>
        </div>
    );
});

SupportModeSelectionPage.displayName = "SupportModeSelectionPage";
export default SupportModeSelectionPage;
