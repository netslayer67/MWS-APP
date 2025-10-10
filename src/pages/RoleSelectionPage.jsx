import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Briefcase } from "lucide-react";
import AnimatedPage from "@/components/AnimatedPage";
import { Helmet } from "react-helmet";
import { useToast } from "@/components/ui/use-toast";

const springy = {
    whileHover: { scale: 1.04, y: -2 },
    whileTap: { scale: 0.96 },
    transition: { type: "spring", stiffness: 240, damping: 20 },
};

const RoleCard = ({ icon: Icon, title, subtitle, onClick, ariaLabel }) => (
    <motion.button
        type="button"
        aria-label={ariaLabel}
        onClick={onClick}
        className="group relative flex w-full flex-col items-center justify-center 
               rounded-2xl border border-border/50 bg-background/40 
               px-6 py-8 text-foreground shadow-lg backdrop-blur-xl 
               transition-all duration-300 focus-visible:outline-none 
               focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 
               focus-visible:ring-offset-background hover:border-accent hover:bg-accent/5 hover:shadow-xl"
        {...springy}
    >
        {/* gradient glass overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br 
                    from-accent/15 via-transparent to-transparent opacity-70 mix-blend-overlay" />
        <div className="pointer-events-none absolute -inset-px rounded-2xl ring-1 ring-inset ring-border/50" />

        <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="rounded-xl bg-secondary/30 p-4 shadow-inner backdrop-blur-xl 
                      transition-colors duration-300 group-hover:bg-secondary/50">
                <Icon className="h-12 w-12 text-accent transition-colors duration-300 group-hover:text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground max-w-[26ch]">{subtitle}</p>
        </div>

        {/* subtle hover glow */}
        <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 blur-2xl 
                 transition-opacity duration-300 group-hover:opacity-100"
            style={{
                background:
                    "radial-gradient(45% 40% at 50% 0%, hsl(var(--accent)/0.22) 0%, transparent 70%)",
            }}
        />
    </motion.button>
);

const RoleSelectionPage = () => {
    const navigate = useNavigate();
    const prefersReducedMotion = useReducedMotion();
    const { toast } = useToast();

    const selectRole = (role) => {
        const message =
            role === "client"
                ? "Anda memilih peran Klien"
                : "Anda memilih peran Pekerja";

        // trigger toast visual
        toast({
            title: "Peran dipilih",
            description: message,
            duration: 2500,
        });

        // navigate setelah sedikit delay
        setTimeout(() => {
            if (role === "client") navigate("/client/dashboard");
            else navigate("/worker/dashboard");
        }, 600);
    };

    return (
        <AnimatedPage>
            <Helmet>
                <title>Pilih Peran — Kerjain</title>
                <meta
                    name="description"
                    content="Pilih peran pertama Anda di Kerjain: posting pekerjaan atau mencari pekerjaan."
                />
            </Helmet>

            <div className="relative flex min-h-svh items-center justify-center px-4 py-16 sm:py-20">
                <motion.div
                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 w-full max-w-3xl text-center"
                >
                    {/* Title */}
                    <div className="mx-auto mb-10 max-w-xl">
                        <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
                            Pilih Peran Anda
                        </h1>
                        <p className="text-sm text-muted-foreground md:text-base">
                            Tentukan cara Anda menggunakan{" "}
                            <span className="text-accent font-medium">Kerjain</span>.
                        </p>
                    </div>

                    {/* Options */}
                    <div className="grid gap-5 md:grid-cols-2">
                        <RoleCard
                            icon={User}
                            title="Saya Butuh Bantuan"
                            subtitle="Posting pekerjaan & temukan pekerja yang tepat"
                            ariaLabel="Pilih peran sebagai klien"
                            onClick={() => selectRole("client")}
                        />

                        <RoleCard
                            icon={Briefcase}
                            title="Saya Ingin Bekerja"
                            subtitle="Cari pekerjaan & bangun reputasi Anda"
                            ariaLabel="Pilih peran sebagai pekerja"
                            onClick={() => selectRole("worker")}
                        />
                    </div>

                    {/* Note */}
                    <p className="mt-6 text-xs text-muted-foreground">
                        Tenang, Anda bisa mengganti peran kapan saja di halaman{" "}
                        <span className="text-accent font-medium">Profil</span>.
                    </p>
                </motion.div>
            </div>
        </AnimatedPage>
    );
};

export default RoleSelectionPage;
