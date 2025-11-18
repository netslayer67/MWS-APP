import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Users, GraduationCap, Building2, Handshake, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const roles = [
    {
        key: "teacher",
        title: "Teacher / Mentor",
        icon: GraduationCap,
        description: "Craft playful tiered boosts, log sparks, and ping families with cheerful wins.",
        gradient: "var(--mtss-role-card-teacher)",
        titleGradient: "var(--mtss-role-title-teacher)",
        buttonGradient: "var(--mtss-role-pill-teacher)",
        textColor: "var(--mtss-role-ink-teacher)",
        badge: "Active Journey",
    },
    {
        key: "admin",
        title: "Admin / Principal",
        icon: Building2,
        description: "Map campus-wide momentum, assign mentors, and peek at vibrant analytics.",
        gradient: "var(--mtss-role-card-admin)",
        titleGradient: "var(--mtss-role-title-admin)",
        buttonGradient: "var(--mtss-role-pill-admin)",
        textColor: "var(--mtss-role-ink-admin)",
        badge: "Preview Access",
    },
    {
        key: "family",
        title: "Student / Parent",
        icon: Handshake,
        description: "Glance at schedules, celebrate streaks, and nudge mentors in seconds.",
        gradient: "var(--mtss-role-card-family)",
        titleGradient: "var(--mtss-role-title-family)",
        buttonGradient: "var(--mtss-role-pill-family)",
        textColor: "var(--mtss-role-ink-family)",
        badge: "Coming Soon",
    },
];

const RoleCard = memo(({ role, onClick, delay = 0 }) => (
    <motion.button
        key={role.key}
        className="group relative p-[1px] rounded-[38px] transition-transform duration-300 hover:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 mtss-card-pop"
        onClick={() => onClick(role.key)}
        whileTap={{ scale: 0.98 }}
        data-aos="zoom-in-up"
        data-aos-delay={delay}
    >
        <div
            className="relative rounded-[38px] p-7 md:p-8 min-h-[240px] flex flex-col mtss-liquid"
            style={{ background: role.gradient, color: role.textColor || "var(--mtss-text-ink)" }}
        >
            <div className="absolute inset-0 bg-white/35 dark:bg-black/25 rounded-[38px] pointer-events-none" />
            <span className="mtss-liquid-hover-blob" />
            <div className="relative z-10 flex flex-col gap-5 h-full">
                <div className="flex items-start justify-between gap-3">
                    <div className="w-14 h-14 rounded-[30px] bg-white/40 dark:bg-white/10 flex items-center justify-center shadow-inner text-foreground dark:text-white">
                        <role.icon className="w-7 h-7" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[0.65rem] font-black uppercase tracking-[0.4em]" style={{ color: role.textColor || "var(--mtss-text-ink)", background: "var(--mtss-chip-gradient)" }}>
                        {role.badge}
                    </span>
                </div>
                <div className="space-y-2 text-left">
                    <h3 className="text-2xl font-black leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                        <span className="mtss-gradient-text" style={{ backgroundImage: role.titleGradient, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))" }}>
                            {role.title}
                        </span>
                    </h3>
                    <p className="text-base md:text-[1rem] leading-relaxed" style={{ color: role.textColor || "var(--mtss-text-ink-soft)" }}>
                        {role.description}
                    </p>
                </div>
                <div className="mt-auto">
                    <span
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full border text-sm font-semibold shadow-[0_18px_30px_rgba(15,23,42,0.15)]"
                        style={{ backgroundImage: role.buttonGradient, borderColor: "rgba(255,255,255,0.6)", color: role.textColor || "var(--mtss-text-ink)" }}
                    >
                        Explore
                        <motion.span className="font-black" animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>
                            →
                        </motion.span>
                    </span>
                </div>
            </div>
        </div>
        <div className="absolute inset-0 rounded-[38px] border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.button>
));

RoleCard.displayName = "RoleCard";

const MTSSRoleSelectionPage = memo(() => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSelect = (key) => {
        if (key === "teacher") {
            navigate("/mtss/teacher");
            return;
        }
        if (key === "admin") {
            navigate("/mtss/admin");
            return;
        }
        if (key === "family") {
            navigate("/mtss/student-portal");
            return;
        }
        toast({
            title: "Coming soon",
            description: "This role is currently in design. Please use the main dashboard for now.",
        });
    };

    return (
        <div className="mtss-theme mtss-animated-bg min-h-screen relative overflow-hidden text-foreground dark:text-white transition-colors">
            <div className="mtss-bg-overlay" />
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-30%] left-[-10%] w-[60vmin] h-[60vmin] bg-primary/20 blur-[200px]" />
                <div className="absolute top-[10%] right-[-10%] w-[45vmin] h-[45vmin] bg-gold/25 blur-[200px]" />
                <div className="absolute bottom-[-20%] left-1/3 w-[50vmin] h-[50vmin] bg-emerald/20 blur-[200px]" />
            </div>

            <div className="relative z-20 container-tight py-12 md:py-16">
                <div className="text-center max-w-3xl mx-auto mb-12 space-y-4" data-aos="fade-down">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full shadow-lg" style={{ background: "var(--mtss-chip-gradient)" }}>
                        <Shield className="w-4 h-4 text-white drop-shadow" />
                        <span className="text-xs font-black tracking-[0.5em] text-white uppercase">Roles Playground</span>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black mb-2 drop-shadow-lg tracking-tight">
                            <span className="mtss-gradient-text" style={{ backgroundImage: "var(--mtss-heading-gradient-primary)" }}>
                                Multi-Tiered System
                            </span>{" "}
                            <span className="mtss-gradient-text" style={{ backgroundImage: "var(--mtss-heading-gradient-secondary)" }}>
                                of Support
                            </span>
                        </h1>
                        <p className="text-base md:text-lg leading-relaxed">
                            <span className="mtss-gradient-text" style={{ backgroundImage: "var(--mtss-heading-gradient-secondary)" }}>
                                Pick your lane
                            </span>{" "}
                            <span className="mtss-ink-soft">and jump right into bright dashboards built for joyful interventions.</span>
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:gap-8 md:grid-cols-3 max-w-6xl mx-auto">
                    {roles.map((role, index) => (
                        <RoleCard key={role.key} role={role} onClick={handleSelect} delay={index * 120} />
                    ))}
                </div>

                <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 glass glass-card mtss-card-surface p-6 text-foreground dark:text-white/90" data-aos="fade-up">
                    <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-gold animate-pulse drop-shadow" />
                        <div>
                            <p className="text-sm uppercase tracking-[0.4em] mtss-gradient-text" style={{ backgroundImage: "var(--mtss-team-spark-gradient)" }}>
                                Team Spark
                            </p>
                            <p className="text-base font-semibold mtss-ink">
                                Connect counselors, homeroom squads, and families in one tap.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-emerald animate-bounce drop-shadow" />
                        <div>
                            <p className="text-sm uppercase tracking-[0.4em] mtss-gradient-text" style={{ backgroundImage: "var(--mtss-team-clarity-gradient)" }}>
                                Clarity
                            </p>
                            <p className="text-base font-semibold mtss-ink">
                                Every plan, note, and celebration in a single playful view.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

MTSSRoleSelectionPage.displayName = "MTSSRoleSelectionPage";
export default MTSSRoleSelectionPage;
