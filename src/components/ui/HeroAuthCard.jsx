import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

const HeroAuthCard = memo(({
    email,
    password,
    loading,
    onEmailChange,
    onPasswordChange,
    showPassword,
    onToggleShowPassword,
    onSubmitEmail,
    onGoogleSignIn,
}) => (
    <div className="glass hover-lift glass--frosted p-6 md:p-8 rounded-3xl border border-border/50 backdrop-blur-xl relative overflow-hidden group">
        <div className="glass__refract" />
        <div className="glass__refract--soft" />
        <div className="glass__noise" />

        <div className="relative z-10 space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">Get Started</h2>
                <p className="text-xs md:text-sm text-foreground/70">Sign in to access emotional wellness features</p>
            </div>

            <form onSubmit={onSubmitEmail} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => onEmailChange(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border/60 bg-card text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => onPasswordChange(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-border/60 bg-card text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                        />
                        <button
                            type="button"
                            onClick={onToggleShowPassword}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full group/btn relative overflow-hidden rounded-2xl bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-glass-sm hover:shadow-glass-md transition-all duration-300"
                >
                    <div className="relative z-10 flex items-center justify-center gap-3 px-5 py-3">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        <span className="text-sm font-semibold">{loading ? "Signing in..." : "Sign In"}</span>
                    </div>
                </motion.button>
            </form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/30" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-foreground/60">Or</span></div>
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onGoogleSignIn}
                className="w-full group/btn relative overflow-hidden rounded-2xl bg-card border border-border/60 hover:border-primary/30 shadow-glass-sm hover:shadow-glass-md transition-all duration-300"
            >
                <div className="relative z-10 flex items-center justify-center gap-3 px-5 py-4">
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="text-sm md:text-base font-semibold text-foreground">Continue with Google</span>
                    <ArrowRight className="w-4 h-4 text-foreground/60 group-hover/btn:translate-x-1 group-hover/btn:text-primary transition-all duration-300" />
                </div>
                <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
            </motion.button>

            <p className="text-[10px] md:text-xs text-center text-foreground/60 leading-relaxed">
                Secure authentication powered by Google OAuth and JWT.
                <br className="hidden md:block" />
                By continuing, you agree to our Terms & Privacy Policy.
            </p>
        </div>
    </div>
));

HeroAuthCard.displayName = "HeroAuthCard";

export default HeroAuthCard;
