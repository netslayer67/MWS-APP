import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Handshake } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "../../components/ui/Millennia.webp";

const OptionCard = memo(({
    title,
    description,
    icon: Icon,
    onClick,
    delay = 0,
    badge,
    gradient,
    accent = "text-slate-900",
    chipColor = "bg-white/50 text-rose-500",
    emoji,
    ctaTextClass = "text-rose-600",
    className = "",
    radius = "4.5rem",
}) => (
    <motion.button
        onClick={onClick}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -10, scale: 1.015 }}
        whileTap={{ scale: 0.99 }}
        transition={{ delay, duration: 0.6, ease: "easeOut" }}
        className={`group relative w-full overflow-hidden text-left mtss-card-pop mtss-liquid border border-white/50 dark:border-white/10 shadow-[0_30px_90px_rgba(255,92,141,0.28)] dark:shadow-[0_35px_80px_rgba(10,14,32,0.65)] backdrop-blur-[18px] ${className}`.trim()}
        style={{ background: gradient, borderRadius: radius }}
    >
        <div className="absolute inset-0 bg-white/35 dark:bg-black/30 pointer-events-none" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute -right-14 -bottom-10 w-56 h-56 bg-white/45 dark:bg-white/15 blur-[150px]" />
            <div className="absolute -left-10 -top-10 w-36 h-36 bg-white/35 dark:bg-white/10 blur-3xl" />
        </div>

        <span className="mtss-liquid-hover-blob" />
        <div className="relative z-10 px-8 py-10 space-y-6 text-foreground dark:text-white">
            <div className={`mtss-chip ${chipColor} backdrop-blur-xl shadow-[0_12px_45px_rgba(255,255,255,0.4)] dark:shadow-none`}>
                {emoji && <span className="text-lg">{emoji}</span>}
                <Icon className="w-4 h-4" />
                <span className="tracking-[0.3em]">{badge}</span>
            </div>
            <div>
                <h3 className={`text-3xl font-extrabold tracking-tight drop-shadow-[0_12px_45px_rgba(255,255,255,0.55)] ${accent}`}>{title}</h3>
                <p className="text-base text-foreground/95 dark:text-white/90 leading-snug mt-2 max-w-sm drop-shadow-[0_10px_40px_rgba(15,23,42,0.4)]">{description}</p>
            </div>
            <div className="pt-4">
                <div className={`inline-flex items-center gap-3 rounded-full px-6 py-2 text-sm font-black uppercase tracking-wider bg-white/95 border border-white/70 dark:bg-white/90 shadow-[0_15px_40px_rgba(255,255,255,0.45)] dark:shadow-[0_15px_35px_rgba(15,23,42,0.6)] ${ctaTextClass}`}>
                    Start now
                    <motion.span
                        animate={{ x: [0, 6, 0] }}
                        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                        className="text-base"
                    >
                        &rarr;
                    </motion.span>
                </div>
            </div>
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
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-xl shadow-[0_15px_60px_rgba(255,255,255,0.45)] dark:shadow-none">
                        <span className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#ff80b5] via-[#ffb553] to-[#7dd3fc] p-[2px] flex items-center justify-center">
                            <span className="w-full h-full rounded-2xl bg-white/90 dark:bg-white/5 flex items-center justify-center">
                                <img src={Logo} alt="MWS Logo" className="w-7 h-7 object-contain" loading="lazy" />
                            </span>
                        </span>
                        <div className="text-left">
                            <span className="text-[0.6rem] font-black tracking-[0.5em] uppercase text-rose-500 block">MWS</span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-white/80">Support Playlab</span>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#f97316] via-[#ec4899] to-[#7c3aed] dark:bg-none dark:text-white drop-shadow-lg">
                            Choose a Support Journey <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff58c2] via-[#ffb347] to-[#7dd3fc]">for Our Kids</span>
                        </h1>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    <OptionCard
                        title="MTSS"
                        // description="Tiered boosts, playful data, and mentor collabs that keep every learner glowing."
                        icon={Brain}
                        badge="For Teachers & Mentors"
                        emoji="🎯"
                        chipColor="bg-white/40 text-rose-600 border border-white/60 backdrop-blur-xl dark:bg-white/10 dark:text-rose-200 dark:border-white/15"
                        accent="text-white drop-shadow-[0_12px_35px_rgba(225,29,72,0.45)]"
                        ctaTextClass="text-rose-600"
                        onClick={() => navigate("/mtss")}
                        gradient="linear-gradient(135deg,#ff4ec6 0%,#ff7ad9 35%,#ffb347 100%)"
                        delay={0.1}
                        radius="4rem"
                    />
                    <OptionCard
                        title="Emotional Check-in"
                        // description="Lightning-fast mood check, confetti encouragement, and instant nudges to caregivers."
                        icon={Handshake}
                        // badge="For Students, Staff & Families"
                        // emoji="💌"
                        chipColor="bg-white/35 text-sky-700 border border-white/60 backdrop-blur-xl dark:bg-white/10 dark:text-sky-200 dark:border-white/15"
                        accent="text-white drop-shadow-[0_12px_35px_rgba(59,130,246,0.45)]"
                        ctaTextClass="text-sky-500"
                        onClick={() => navigate("/select-role")}
                        gradient="linear-gradient(135deg,#7dd3fc 0%,#60a5fa 30%,#a7f3d0 100%)"
                        delay={0.2}
                        radius="4rem"
                    />
                </div>
            </div>
        </div>
    );
});

SupportModeSelectionPage.displayName = "SupportModeSelectionPage";
export default SupportModeSelectionPage;
