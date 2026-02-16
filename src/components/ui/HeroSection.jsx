import { memo, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../store/slices/authSlice";
import { useToast } from "../ui/use-toast";
import HeroAuthCard from "@/components/ui/HeroAuthCard";
import Logo from "./Millennia.webp";

const HeroSection = memo(() => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.auth);
    const { toast } = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleGoogleSignIn = useCallback(() => {
        const apiBase = import.meta.env.VITE_API_BASE || "/api/v1";
        const backendUrl = apiBase.replace(/\/api(?:\/v\d+)?\/?$/, "");
        window.location.href = `${backendUrl}/auth/google`;
    }, []);

    const handleEmailLogin = useCallback(async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast({
                title: "Validation Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        try {
            const resultAction = await dispatch(loginUser({ email, password }));
            if (loginUser.fulfilled.match(resultAction)) {
                // Role-based redirect logic
                const userRole = (resultAction.payload?.user?.role || '').toLowerCase();
                let redirectPath;

                if (userRole === 'student') {
                    redirectPath = '/student/support-hub';
                } else if (['teacher', 'se_teacher', 'head_unit', 'admin', 'superadmin'].includes(userRole)) {
                    redirectPath = '/support-hub';
                } else {
                    // staff, support_staff, nurse, etc. → redirect to /select-role
                    redirectPath = '/select-role';
                }

                toast({
                    title: "Login Successful! 🎉",
                    description: "Welcome back! Redirecting...",
                    duration: 3000,
                });
                setEmail("");
                setPassword("");
                setTimeout(() => navigate(redirectPath), 1000);
                return;
            }

            toast({
                title: "Login Failed",
                description: resultAction.payload || "Invalid credentials. Please try again.",
                variant: "destructive",
            });
        } catch {
            toast({
                title: "Login Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
        }
    }, [dispatch, email, navigate, password, toast]);

    return (
        <section className="relative min-h-screen flex items-center justify-center px-4 py-12 md:py-20">
            <div className="w-full max-w-5xl mx-auto">
                <div className="text-center space-y-4 md:space-y-8 mb-10 md:mb-14">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
                        className="inline-flex"
                    >
                        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary via-gold to-gold p-[2px] shadow-glass-lg">
                            <div className="w-full h-full rounded-2xl md:rounded-3xl bg-card flex items-center justify-center">
                                <img src={Logo} alt="Millennia Logo" className="w-28 h-28 md:w-32 md:h-32 object-contain" />
                            </div>
                        </div>
                    </motion.div>

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
                        <p className="text-sm md:text-base lg:text-lg text-foreground/70 max-w-xl mx-auto leading-relaxed px-4">
                            Your gateway to world-class integrated education. Join Millennia World School's premium learning experience.
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="max-w-md mx-auto"
                >
                    <HeroAuthCard
                        email={email}
                        password={password}
                        loading={loading}
                        onEmailChange={setEmail}
                        onPasswordChange={setPassword}
                        showPassword={showPassword}
                        onToggleShowPassword={() => setShowPassword((prev) => !prev)}
                        onSubmitEmail={handleEmailLogin}
                        onGoogleSignIn={handleGoogleSignIn}
                    />
                </motion.div>
            </div>
        </section>
    );
});

HeroSection.displayName = "HeroSection";

export default HeroSection;
