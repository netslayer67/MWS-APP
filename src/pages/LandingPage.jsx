import { memo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AnimatedPage from "@/components/AnimatedPage";
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from "react-helmet";

/* --- Decorative Blob --- */
const DecorativeBlob = memo(({ className, animate }) => (
    <motion.div
        className={`absolute rounded-full blur-3xl ${className}`}
        animate={animate ? {
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
        } : {}}
        transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
        }}
    />
));

const LandingPage = memo(function LandingPage() {
    const navigate = useNavigate();
    const { toast } = useToast();

    return (
        <AnimatedPage>
            <Helmet>
                <title>MWS IntegraLearn — Welcome</title>
                <meta
                    name="description"
                    content="Welcome to Millennia World School IntegraLearn. Experience the future of education with our integrated learning platform."
                />
            </Helmet>


            {/* Welcome Hero */}
            <section className="min-h-screen relative flex items-center justify-center overflow-hidden">
                {/* Background elements */}
                <DecorativeBlob className="-top-40 -left-40 w-96 h-96 bg-primary/8" animate />
                <DecorativeBlob className="-bottom-40 -right-40 w-80 h-80 bg-accent/8" animate />
                <DecorativeBlob className="top-1/4 right-1/4 w-72 h-72 bg-gold/10" animate />
                <DecorativeBlob className="bottom-1/4 left-1/4 w-64 h-64 bg-emerald/10" animate />
                <div className="absolute inset-0 bg-grid-small opacity-5 dark:opacity-10" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Welcome Message */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="space-y-6"
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-3xl bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/20"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="text-4xl md:text-5xl"
                                >
                                    🎓
                                </motion.div>
                            </motion.div>

                            <div className="space-y-4">
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground"
                                >
                                    WELCOME TO
                                </motion.h1>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8, delay: 0.6 }}
                                    className="bg-gradient-to-r from-primary via-accent to-gold bg-clip-text text-transparent"
                                >
                                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-wide">
                                        MWS IntegraLearn
                                    </h2>
                                </motion.div>
                            </div>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.8 }}
                                className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                            >
                                Experience the future of education with our integrated learning platform.
                                Where innovation meets excellence in personalized education.
                            </motion.p>
                        </motion.div>

                        {/* Google Login */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 1.0 }}
                            className="mt-12"
                        >
                            <div className="glass-strong rounded-3xl p-8 md:p-10 max-w-md mx-auto">
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                                            Get Started
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Sign in with your Google account to access the platform
                                        </p>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            // Dummy Google login
                                            toast({
                                                title: "Google Sign-in",
                                                description: "Redirecting to Google authentication..."
                                            });
                                            setTimeout(() => {
                                                toast({
                                                    title: "Welcome!",
                                                    description: "Successfully signed in with Google."
                                                });
                                                navigate("/select-role");
                                            }, 2000);
                                        }}
                                        className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        <span>Continue with Google</span>
                                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </motion.button>

                                    <div className="text-center">
                                        <p className="text-xs text-muted-foreground">
                                            By signing in, you agree to our Terms of Service and Privacy Policy
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>


            {/* Footer */}
            <footer className="border-t border-border bg-background/80 backdrop-blur-lg">
                <div className="container mx-auto px-4 py-6 text-center">
                    <p className="text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} Kerjain. All rights reserved.
                    </p>
                </div>
            </footer>
        </AnimatedPage>
    );
});

LandingPage.displayName = 'LandingPage';

export default LandingPage;
