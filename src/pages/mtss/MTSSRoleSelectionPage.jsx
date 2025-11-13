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
        description: "Design tiered intervention plans, track every student’s story, and share happy updates with families.",
        gradient: "from-[#ff7ad9] via-primary/70 to-[#845ef4]",
        accent: "text-white",
        badge: "Active Journey",
    },
    {
        key: "admin",
        title: "Admin / Principal",
        icon: Building2,
        description: "Coordinate campus-wide support, assign mentors, and peek at playful analytics in one hub.",
        gradient: "from-[#fbd786] via-[#f7797d] to-[#c779d0]",
        accent: "text-foreground",
        badge: "Coming Soon",
    },
    {
        key: "family",
        title: "Student / Parent",
        icon: Handshake,
        description: "View colorful schedules, celebrate daily progress, and chat with mentors anytime.",
        gradient: "from-[#5efce8] via-[#52d6ff] to-[#ff9472]",
        accent: "text-foreground",
        badge: "Coming Soon",
    },
];

const RoleCard = memo(({ role, onClick, delay = 0 }) => (
    <motion.button
        key={role.key}
        className="group relative p-[1px] rounded-[30px] transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        onClick={() => onClick(role.key)}
        whileTap={{ scale: 0.99 }}
        data-aos="zoom-in-up"
        data-aos-delay={delay}
    >
        <div className={`rounded-[30px] bg-gradient-to-br ${role.gradient} p-8 md:p-10 min-h-[260px] flex flex-col justify-between shadow-[0_20px_60px_rgba(0,0,0,0.15)]`}>
            <div className="space-y-5 text-left">
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-white">
                    <role.icon className="w-7 h-7" />
                </div>
                <div>
                    <h3 className={`text-2xl font-bold leading-tight ${role.accent}`}>{role.title}</h3>
                    <p className={`text-sm mt-2 opacity-90 ${role.accent}`}>{role.description}</p>
                </div>
            </div>
            <div className="flex items-center justify-between text-sm font-semibold text-white/90">
                <span className="px-3 py-1 rounded-full bg-white/15">{role.badge}</span>
                <span className="inline-flex items-center gap-1">
                    Explore
                    <motion.span
                        className="font-black"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.6 }}
                    >
                        &rarr;
                    </motion.span>
                </span>
            </div>
        </div>
        <div className="absolute inset-0 rounded-[30px] border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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

        toast({
            title: "Coming soon",
            description: "This role is currently in design. Please use the main dashboard for now.",
        });
    };

    return (
        <div
            className="min-h-screen relative overflow-hidden text-foreground dark:text-white transition-colors"
            style={{ background: "var(--mtss-hero-bg)" }}
        >
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-30%] left-[-10%] w-[60vmin] h-[60vmin] bg-primary/30 blur-[180px]" />
                <div className="absolute top-[10%] right-[-10%] w-[45vmin] h-[45vmin] bg-gold/20 blur-[140px]" />
                <div className="absolute bottom-[-20%] left-1/3 w-[50vmin] h-[50vmin] bg-emerald/20 blur-[160px]" />
            </div>

            <div className="relative z-10 container-tight py-12 md:py-16">
                <div className="text-center max-w-3xl mx-auto mb-12 space-y-4 text-foreground dark:text-white" data-aos="fade-down">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-white/80 text-primary text-xs uppercase tracking-[0.3em] dark:border-white/20 dark:bg-white/10 dark:text-primary-foreground">
                        <Shield className="w-4 h-4 text-gold" />
                        MTSS Journey
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 drop-shadow-lg">Multi-Tiered System of Support</h1>
                        <p className="text-base md:text-lg text-muted-foreground dark:text-white/80">
                            Choose your role to continue. Every pathway unlocks cheerful, structured tools so keeping tabs on character growth always feels fun.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:gap-8 md:grid-cols-3 max-w-6xl mx-auto">
                    {roles.map((role, index) => (
                        <RoleCard key={role.key} role={role} onClick={handleSelect} delay={index * 120} />
                    ))}
                </div>

                <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 glass glass-card p-6 text-foreground dark:text-white/90" data-aos="fade-up">
                    <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-gold" />
                        <div>
                            <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground dark:text-white/70">Collaboration</p>
                            <p className="text-base font-semibold text-foreground dark:text-white">Connect counselors, homeroom teams, and families</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <GraduationCap className="w-6 h-6 text-emerald" />
                        <div>
                            <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground dark:text-white/70">Consistency</p>
                            <p className="text-base font-semibold text-foreground dark:text-white">Centralized plans keep MTSS journeys bright and clear</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

MTSSRoleSelectionPage.displayName = "MTSSRoleSelectionPage";
export default MTSSRoleSelectionPage;




