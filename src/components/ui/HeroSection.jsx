import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Sparkles } from "lucide-react";
import Logo from "./Millennia.webp";
import TrustBadge from "./TrustBadge";

const HeroSection = memo(() => {
    const handleGoogleSignIn = useCallback(() => {
        // Simulate Google OAuth flow
        console.log("Initiating Google Sign-in...");
        // In production: window.location.href = '/api/auth/google';
    }, []);

    return (
        <section className="relative min-h-screen flex items-center justify-center px-4 py-12 md:py-20">
            <div className="w-full max-w-5xl mx-auto">
                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-8 md:mb-12"
                >
                    <TrustBadge icon={Shield} text="Secure Platform" />
                    <TrustBadge icon={Sparkles} text="Premium Education" />
                </motion.div>

                {/* Hero Content */}
                <div className="text-center space-y-4 md:space-y-8 mb-10 md:mb-14">
                    {/* Logo/Icon */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
                        className="inline-flex"
                    >
                        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary via-gold to-gold-foreground p-[2px] shadow-glass-lg">
                            <div className="w-full h-full rounded-2xl md:rounded-3xl bg-card flex items-center justify-center">
                                <img src={Logo} alt="Millennia Logo" className="w-28 h-28 md:w-32 md:h-32 object-contain" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Heading */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="space-y-3 md:space-y-4"
                    >
                        <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground leading-tight">
                            Welcome to
                            <br />
                            <span className="bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
                                MWS IntegraLearn
                            </span>
                        </h1>
                        <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed px-4">
                            Your gateway to world-class integrated education. Join Millennia World School's premium learning experience.
                        </p>
                    </motion.div>
                </div>

                {/* Sign-in Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="max-w-md mx-auto"
                >
                    <div className="glass hover-lift glass--frosted p-6 md:p-8 rounded-3xl border border-border/50 backdrop-blur-xl relative overflow-hidden group">
                        {/* Refraction layers */}
                        <div className="glass__refract" />
                        <div className="glass__refract--soft" />
                        <div className="glass__noise" />

                        <div className="relative z-10 space-y-6">
                            {/* Card Header */}
                            <div className="text-center space-y-2">
                                <h2 className="text-xl md:text-2xl font-bold text-foreground">Get Started</h2>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    Sign in securely with Google
                                </p>
                            </div>

                            {/* Google Sign-in Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleGoogleSignIn}
                                className="w-full group/btn relative overflow-hidden rounded-2xl bg-card border border-border/60 hover:border-primary/30 shadow-glass-sm hover:shadow-glass-md transition-all duration-300"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-3 px-5 py-4">
                                    {/* Google Icon */}
                                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span className="text-sm md:text-base font-semibold text-foreground">Continue with Google</span>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover/btn:translate-x-1 group-hover/btn:text-primary transition-all duration-300" />
                                </div>

                                {/* Shimmer effect */}
                                <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
                            </motion.button>

                            {/* Privacy Note */}
                            <p className="text-[10px] md:text-xs text-center text-muted-foreground leading-relaxed">
                                Secure authentication powered by Google OAuth.
                                <br className="hidden md:block" />
                                By continuing, you agree to our Terms & Privacy Policy.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;