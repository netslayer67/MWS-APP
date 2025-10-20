import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Brain, Sparkles, ChevronRight, BarChart3 } from "lucide-react";
import { useSelector } from "react-redux";

/* ==================== DECORATIVE ELEMENTS ==================== */
const Blob = memo(({ className, delay = 0 }) => (
    <motion.div
        className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{
            scale: [1, 1.05, 1],
            opacity: [0.03, 0.06, 0.03]
        }}
        transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay
        }}
    />
));

const Grid = memo(() => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.01]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.3" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" className="text-foreground" />
        </svg>
    </div>
));

/* ==================== METHOD CARD ==================== */
const MethodCard = memo(({ icon: Icon, title, desc, features, isPremium, onClick }) => (
    <motion.button
        onClick={onClick}
        className="group relative w-full text-left glass glass--frosted p-4 md:p-5 rounded-xl md:rounded-2xl transition-all duration-300"
        whileHover={{ scale: 1.008, y: -2 }}
        whileTap={{ scale: 0.995 }}
    >
        <div className="glass__refract" />
        <div className="glass__noise" />

        <div className="relative space-y-3">
            {/* Header */}
            <div className="flex items-start gap-3">
                <div className={`p-2 md:p-2.5 rounded-lg md:rounded-xl flex-shrink-0 ${isPremium
                    ? 'bg-primary shadow-md shadow-primary/15'
                    : 'bg-surface border border-border'
                    }`}>
                    <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isPremium ? 'text-primary-foreground' : 'text-primary'
                        }`} />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-bold text-foreground mb-0.5">
                        {title}
                    </h3>
                    <p className="text-[11px] md:text-xs text-muted-foreground leading-snug">
                        {desc}
                    </p>
                </div>

                {isPremium && (
                    <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/25 flex-shrink-0">
                        <Sparkles className="w-2.5 h-2.5 text-primary" />
                        <span className="text-[9px] font-semibold text-primary uppercase tracking-wide">AI</span>
                    </div>
                )}
            </div>

            {/* Features */}
            <div className="space-y-1.5">
                {features.map((feature, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-start gap-2 text-[10px] md:text-[11px]"
                    >
                        <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <span className="text-foreground leading-snug">{feature}</span>
                    </motion.div>
                ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <span className="text-[9px] md:text-[10px] text-muted-foreground">
                    {isPremium ? 'Advanced analysis' : 'Traditional method'}
                </span>
                <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary transition-transform duration-300 group-hover:translate-x-1" />
            </div>
        </div>

        {/* Hover glow */}
        <div className="absolute inset-0 rounded-xl md:rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
            <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/4 to-transparent" />
        </div>
    </motion.button>
));

/* ==================== MAIN COMPONENT ==================== */
const RoleSelection = memo(() => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const selectMethod = (method) => {
        if (method === 'manual') {
            navigate('/emotional-checkin/staff');
        } else if (method === 'ai') {
            navigate('/emotional-checkin/face-scan');
        } else if (method === 'dashboard') {
            navigate('/emotional-checkin/dashboard');
        }
    };

    return (
        <div className="relative min-h-screen text-foreground overflow-hidden">
            <Blob className="top-0 left-0 w-80 h-80 md:w-96 md:h-96 bg-primary/8" delay={0} />
            <Blob className="bottom-0 right-0 w-72 h-72 md:w-80 md:h-80 bg-primary/6" delay={0.8} />
            <Grid />

            <div className="relative z-10 min-h-screen flex items-center justify-center p-3 md:p-5">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-2xl"
                >
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-center mb-6 md:mb-8"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.15 }}
                            className="w-12 h-12 md:w-14 md:h-14 mx-auto rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/15 mb-4"
                        >
                            <Heart className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground" />
                        </motion.div>

                        <h1 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                            Choose Check-in Method
                        </h1>
                        <p className="text-[11px] md:text-xs text-muted-foreground max-w-md mx-auto leading-relaxed px-4">
                            Select your preferred emotional check-in method. Both are confidential and support your wellbeing.
                        </p>
                    </motion.div>

                    {/* Method Cards */}
                    <div className="space-y-3 md:space-y-4">
                        <MethodCard
                            icon={Heart}
                            title="Manual Check-in"
                            desc="Traditional form-based assessment with weather metaphors and detailed reflection"
                            features={[
                                "Weather-based mood selection",
                                "Detailed emotional reflection",
                                "Presence & capacity ratings",
                                "Support contact selection"
                            ]}
                            isPremium={false}
                            onClick={() => selectMethod('manual')}
                        />

                        <MethodCard
                            icon={Brain}
                            title="AI Emotional Analysis"
                            desc="Face scan technology detects authentic micro-expressions beyond conscious control"
                            features={[
                                "Real-time facial expression analysis",
                                "43 landmark micro-expression detection",
                                "AI psychologist insights & recommendations",
                                "Detects concealed emotions accurately"
                            ]}
                            isPremium={true}
                            onClick={() => selectMethod('ai')}
                        />

                        {/* Dashboard Access for Directorate Academic */}
                        {user && user.role === 'directorate' && user.department === 'Academic' && (
                            <MethodCard
                                icon={BarChart3}
                                title="Go to Dashboard"
                                desc="Access comprehensive emotional wellness dashboard and analytics"
                                features={[
                                    "Real-time staff wellness monitoring",
                                    "Emotional check-in analytics",
                                    "Support tracking and interventions",
                                    "Period-based reporting (daily/weekly/monthly/semesterly)"
                                ]}
                                isPremium={false}
                                onClick={() => selectMethod('dashboard')}
                            />
                        )}
                    </div>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="mt-6 md:mt-8"
                    >
                        <div className="glass rounded-lg md:rounded-xl p-3 md:p-4">
                            <p className="text-[9px] md:text-[10px] text-muted-foreground leading-relaxed text-center">
                                Your emotional wellbeing is our priority. All check-ins are confidential, processed securely, and designed to support your mental health journey.
                            </p>
                        </div>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="mt-3 text-center text-[8px] md:text-[9px] text-muted-foreground/70"
                    >
                        Millennia World School • Emotional wellness platform
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
});

RoleSelection.displayName = 'RoleSelection';

export default RoleSelection;