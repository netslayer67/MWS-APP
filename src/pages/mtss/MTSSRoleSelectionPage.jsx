import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Users, GraduationCap, Building2, Handshake } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const roles = [
    {
        key: "teacher",
        title: "Teacher / Mentor",
        icon: GraduationCap,
        description: "Craft playful tiered boosts, log sparks, and ping families with cheerful wins.",
        gradient: "from-[#ff7ad9] via-primary/70 to-[#845ef4]",
        accent: "text-foreground dark:text-white",
        badge: "Active Journey",
    },
    {
        key: "admin",
        title: "Admin / Principal",
        icon: Building2,
        description: "Map campus-wide momentum, assign mentors, and peek at vibrant analytics.",
        gradient: "from-[#fbd786] via-[#f7797d] to-[#c779d0]",
        accent: "text-foreground dark:text-white",
        badge: "Preview Access",
    },
    {
        key: "family",
        title: "Student / Parent",
        icon: Handshake,
        description: "Glance at schedules, celebrate streaks, and nudge mentors in seconds.",
        gradient: "from-[#5efce8] via-[#52d6ff] to-[#ff9472]",
        accent: "text-foreground dark:text-white",
        badge: "Coming Soon",
    },
];

const RoleCard = memo(({ role, onClick, delay = 0 }) => (
    <motion.button
        key={role.key}
        className="group relative p-[1px] rounded-[34px] transition-transform duration-300 hover:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 mtss-card-pop"
        onClick={() => onClick(role.key)}
        whileTap={{ scale: 0.98 }}
        data-aos="zoom-in-up"
        data-aos-delay={delay}
    >
        <div className={`relative rounded-[34px] bg-gradient-to-br ${role.gradient} p-8 md:p-10 min-h-[260px] flex flex-col justify-between mtss-liquid text-foreground dark:text-white`}>
            <div className="absolute inset-0 bg-white/45 dark:bg-black/35 rounded-[34px] pointer-events-none" />
            <span className="mtss-liquid-hover-blob" />
            <div className="relative space-y-5 text-left">
                <div className="w-16 h-16 rounded-2xl bg-white/30 flex items-center justify-center text-foreground dark:text-white">
                    <role.icon className="w-7 h-7" />
                </div>
                <div>
                    <h3 className={`text-2xl font-bold leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.2)] ${role.accent}`}>{role.title}</h3>
                    <p className={`text-base mt-2 opacity-90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)] ${role.accent}`}>{role.description}</p>
                </div>
            </div>
            <div className="relative flex items-center justify-between text-sm font-semibold uppercase tracking-[0.3em] text-foreground dark:text-white">
                <span className="px-3 py-1 text-[0.70rem] rounded-full bg-white/40 dark:bg-white/10">{role.badge}</span>
                <span className="inline-flex items-center gap-1 text-primary dark:text-white">
                    Explore
                    <motion.span
                        className="font-black"
                        animate={{ x: [0, 6, 0] }}
                        transition={{ repeat: Infinity, duration: 1.6 }}
                    >
                        &rarr;
                    </motion.span>
                </span>
            </div>
        </div>
        <div className="absolute inset-0 rounded-[34px] border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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

        toast({
            title: "Coming soon",
            description: "This role is currently in design. Please use the main dashboard for now.",
        });
    };

    return (
        <div className="mtss-theme mtss-animated-bg min-h-screen relative overflow-hidden text-foreground dark:text-white transition-colors">
            <div className="mtss-bg-overlay" />
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-30%] left-[-10%] w-[60vmin] h-[60vmin] bg-primary/30 blur-[180px]" />
                <div className="absolute top-[10%] right-[-10%] w-[45vmin] h-[45vmin] bg-gold/20 blur-[140px]" />
                <div className="absolute bottom-[-20%] left-1/3 w-[50vmin] h-[50vmin] bg-emerald/20 blur-[160px]" />
            </div>

            <div className="relative z-20 container-tight py-12 md:py-16">
                <div className="text-center max-w-3xl mx-auto mb-12 space-y-4 text-foreground dark:text-white" data-aos="fade-down">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 text-rose-500 text-xs font-black tracking-[0.4em] dark:bg-white/10">
                        <Shield className="w-4 h-4 text-rose-500" />
                        Roles Playground
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black mb-3 drop-shadow-lg tracking-tight">Multi-Tiered System of Support</h1>
                        <p className="text-base md:text-lg text-muted-foreground dark:text-white/80 leading-relaxed">
                            Pick your lane and jump right into bright dashboards built for joyful interventions.
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
                        <Users className="w-6 h-6 text-gold animate-pulse" />
                        <div>
                            <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground dark:text-white/70">Team Spark</p>
                            <p className="text-base font-semibold text-foreground dark:text-white">Connect counselors, homeroom squads, and families in one tap.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <GraduationCap className="w-6 h-6 text-emerald animate-bounce" />
                        <div>
                            <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground dark:text-white/70">Clarity</p>
                            <p className="text-base font-semibold text-foreground dark:text-white">Every plan, note, and celebration in a single playful view.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

MTSSRoleSelectionPage.displayName = "MTSSRoleSelectionPage";
export default MTSSRoleSelectionPage;


