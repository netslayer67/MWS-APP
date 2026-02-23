import React, { memo, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Heart, BookOpen, Sparkles, ArrowRight, Star, Zap } from "lucide-react";
import AnimatedPage from "@/components/AnimatedPage";
import gsap from "gsap";
import { animate, stagger, utils } from "animejs";

/* ── Card data ── */
const hubOptions = [
    {
        id: "emotional-checkin",
        title: "Emotional Check-in",
        description: "Quick mood check or AI facial analysis",
        icon: Heart,
        path: "/student/emotional-checkin",
        tag: "Wellness",
        iconBg: "from-rose-400 to-orange-400",
        cardAccent: "from-rose-400/25 via-pink-300/15 to-transparent",
        tagStyle: "text-rose-600 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/15",
        iconShadow: "shadow-rose-400/30",
    },
    {
        id: "ai-study-buddy",
        title: "AI Study Buddy",
        description: "24/7 homework help & learning companion",
        icon: Sparkles,
        path: "/student/ai-chat",
        tag: "AI Helper",
        iconBg: "from-fuchsia-400 to-violet-500",
        cardAccent: "from-fuchsia-400/25 via-violet-300/15 to-transparent",
        tagStyle: "text-fuchsia-600 bg-fuchsia-500/10 dark:text-fuchsia-400 dark:bg-fuchsia-500/15",
        iconShadow: "shadow-fuchsia-400/30",
    },
    {
        id: "mtss-portal",
        title: "MTSS Student Portal",
        description: "Progress tracking & mentor connections",
        icon: BookOpen,
        path: "/mtss/student-portal",
        tag: "Learning",
        iconBg: "from-violet-400 to-blue-400",
        cardAccent: "from-violet-400/25 via-blue-300/15 to-transparent",
        tagStyle: "text-violet-600 bg-violet-500/10 dark:text-violet-400 dark:bg-violet-500/15",
        iconShadow: "shadow-violet-400/30",
    }
];

const moods = [
    { emoji: '😊', label: 'Happy', bg: 'hover:bg-amber-50 dark:hover:bg-amber-500/10', hue: '#fbbf24' },
    { emoji: '😌', label: 'Calm', bg: 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10', hue: '#34d399' },
    { emoji: '🤔', label: 'Thinking', bg: 'hover:bg-violet-50 dark:hover:bg-violet-500/10', hue: '#a78bfa' },
    { emoji: '💪', label: 'Strong', bg: 'hover:bg-rose-50 dark:hover:bg-rose-500/10', hue: '#fb7185' },
];

/*
 * All CSS animations — GPU-composited (transform/opacity/background-position).
 */
const ScopedStyles = memo(() => (
    <style>{`
        @keyframes shubBgShift{
            0%{background-position:0% 0%}
            25%{background-position:50% 100%}
            50%{background-position:100% 50%}
            75%{background-position:50% 0%}
            100%{background-position:0% 0%}
        }
        .shub-bg{
            background-size:300% 300%;
            animation:shubBgShift 16s ease infinite;
        }
        :is(.dark) .shub-bg{ animation:none }

        .shub-grid{
            background-image:radial-gradient(circle,rgba(0,0,0,.04) 1px,transparent 1px);
            background-size:24px 24px;
        }
        :is(.dark) .shub-grid{
            background-image:radial-gradient(circle,rgba(255,255,255,.035) 1px,transparent 1px);
        }

        @keyframes shubTextShimmer{
            0%{background-position:0% 50%}
            50%{background-position:100% 50%}
            100%{background-position:0% 50%}
        }
        .shub-title{
            font-family:'Nunito','Inter',system-ui,sans-serif;
            background-size:200% 200%;
            animation:shubTextShimmer 4s ease infinite;
            -webkit-background-clip:text;
            -webkit-text-fill-color:transparent;
            background-clip:text;
        }

        .shub-font{
            font-family:'Nunito','Inter',system-ui,-apple-system,sans-serif;
            letter-spacing:-0.01em;
        }

        @keyframes shubBlob{
            0%,100%{transform:translate(0,0) scale(1) rotate(0deg)}
            25%{transform:translate(12px,-8px) scale(1.04) rotate(1deg)}
            50%{transform:translate(-4px,10px) scale(.97) rotate(-1deg)}
            75%{transform:translate(-10px,-4px) scale(1.02) rotate(.5deg)}
        }

        @keyframes shubFloat{
            0%,100%{transform:translateY(0) scale(1);opacity:.55}
            50%{transform:translateY(-10px) scale(1.12);opacity:.85}
        }
        @keyframes shubSpin{
            from{transform:rotate(0deg)}to{transform:rotate(360deg)}
        }
        @keyframes shubPulse{
            0%,100%{transform:scale(1);opacity:.4}
            50%{transform:scale(1.25);opacity:.7}
        }
        @keyframes shubDrift{
            0%,100%{transform:translateX(0) translateY(0)}
            33%{transform:translateX(6px) translateY(-4px)}
            66%{transform:translateX(-4px) translateY(6px)}
        }

        .shub-card{
            transition:transform .3s cubic-bezier(.22,.68,0,1.1),box-shadow .3s ease;
        }
        .shub-card:active{transform:scale(.97)}
        @media(hover:hover){.shub-card:hover{transform:translateY(-4px)}}

        /* Mood button jelly press */
        @keyframes shubJelly{
            0%{transform:scale(1)}
            30%{transform:scale(1.25,0.75)}
            40%{transform:scale(0.75,1.25)}
            50%{transform:scale(1.15,0.85)}
            65%{transform:scale(0.95,1.05)}
            75%{transform:scale(1.05,0.95)}
            100%{transform:scale(1)}
        }
        .shub-jelly{animation:shubJelly .6s ease}

        /* Mood emoji wobble on hover */
        @keyframes shubWobble{
            0%{transform:rotate(0deg)}
            15%{transform:rotate(12deg)}
            30%{transform:rotate(-10deg)}
            45%{transform:rotate(8deg)}
            60%{transform:rotate(-5deg)}
            75%{transform:rotate(3deg)}
            100%{transform:rotate(0deg)}
        }
        .shub-mood-btn:hover .shub-emoji{
            animation:shubWobble .6s ease-in-out;
        }

        /* Card icon bounce on hover */
        @keyframes shubIconBounce{
            0%,100%{transform:scale(1) translateY(0)}
            40%{transform:scale(1.15) translateY(-3px)}
            60%{transform:scale(0.95) translateY(1px)}
        }
        .shub-card:hover .shub-card-icon{
            animation:shubIconBounce .5s ease;
        }

        /* Glow ring pulse on cards */
        @keyframes shubGlowPulse{
            0%,100%{box-shadow:0 0 0 0 rgba(251,113,133,0)}
            50%{box-shadow:0 0 0 6px rgba(251,113,133,.12)}
        }
        .shub-card:hover{
            animation:shubGlowPulse 1.5s ease-in-out infinite;
        }

        /* Arrow slide right on card hover */
        .shub-card:hover .shub-arrow{
            transform:translateX(3px);
            transition:transform .25s ease;
        }

        /* Sparkle on badge */
        @keyframes shubBadgeSparkle{
            0%,100%{filter:brightness(1)}
            50%{filter:brightness(1.3)}
        }
        .shub-badge-sparkle{
            animation:shubBadgeSparkle 2.5s ease-in-out infinite;
        }

        /* Tip card subtle float */
        @keyframes shubTipFloat{
            0%,100%{transform:translateY(0)}
            50%{transform:translateY(-3px)}
        }
        .shub-tip{
            animation:shubTipFloat 4s ease-in-out infinite;
        }

        /* Confetti piece */
        @keyframes shubConfetti{
            0%{transform:translateY(0) rotate(0deg) scale(1);opacity:1}
            100%{transform:translateY(var(--cf-y,40px)) rotate(var(--cf-r,360deg)) scale(0);opacity:0}
        }
        .shub-confetti{
            position:absolute;pointer-events:none;border-radius:2px;
            animation:shubConfetti var(--cf-dur,0.8s) ease-out forwards;
        }

        @media(prefers-reduced-motion:reduce){
            .shub-bg,.shub-title,.shub-tip,.shub-badge-sparkle,
            .shub-jelly,.shub-mood-btn:hover .shub-emoji,
            .shub-card:hover .shub-card-icon{animation:none!important}
            .shub-card,.shub-card:hover,.shub-card:active{transform:none!important;transition:none!important}
        }
    `}</style>
));
ScopedStyles.displayName = "ScopedStyles";

/* Decorative particles */
const particles = [
    { t: 'dot', top: '6%', left: '7%', sz: 8, cl: 'bg-rose-300 dark:bg-rose-500/25', anim: 'shubFloat', dur: 4, del: 0 },
    { t: 'dot', top: '14%', right: '10%', sz: 6, cl: 'bg-amber-300 dark:bg-amber-500/25', anim: 'shubFloat', dur: 5, del: 1 },
    { t: 'dot', top: '38%', left: '4%', sz: 7, cl: 'bg-violet-300 dark:bg-violet-500/25', anim: 'shubFloat', dur: 4.5, del: 0.5 },
    { t: 'dot', top: '60%', right: '6%', sz: 9, cl: 'bg-sky-300 dark:bg-sky-500/25', anim: 'shubFloat', dur: 5.5, del: 2 },
    { t: 'dot', top: '80%', left: '12%', sz: 5, cl: 'bg-emerald-300 dark:bg-emerald-500/25', anim: 'shubFloat', dur: 3.8, del: 1.5 },
    { t: 'dot', top: '75%', right: '15%', sz: 6, cl: 'bg-orange-300 dark:bg-orange-500/25', anim: 'shubFloat', dur: 4.2, del: 0.8 },
    { t: 'dot', top: '48%', right: '3%', sz: 5, cl: 'bg-pink-300 dark:bg-pink-500/25', anim: 'shubFloat', dur: 5, del: 2.5 },
    { t: 'dot', top: '92%', left: '30%', sz: 7, cl: 'bg-teal-300 dark:bg-teal-500/25', anim: 'shubFloat', dur: 4.8, del: 1.2 },
    { t: 'ring', top: '10%', left: '20%', sz: 14, cl: 'border-rose-300/50 dark:border-rose-500/20', anim: 'shubPulse', dur: 5, del: 0.3 },
    { t: 'ring', top: '50%', right: '10%', sz: 12, cl: 'border-violet-300/50 dark:border-violet-500/20', anim: 'shubPulse', dur: 6, del: 1.8 },
    { t: 'ring', top: '85%', left: '8%', sz: 10, cl: 'border-amber-300/50 dark:border-amber-500/20', anim: 'shubPulse', dur: 4.5, del: 2.5 },
    { t: 'ring', top: '30%', right: '5%', sz: 16, cl: 'border-sky-300/40 dark:border-sky-500/15', anim: 'shubPulse', dur: 7, del: 0.8 },
    { t: 'cross', top: '22%', left: '6%', sz: 10, cl: 'bg-fuchsia-300/60 dark:bg-fuchsia-500/20', anim: 'shubSpin', dur: 12, del: 0 },
    { t: 'cross', top: '65%', right: '8%', sz: 8, cl: 'bg-emerald-300/60 dark:bg-emerald-500/20', anim: 'shubSpin', dur: 15, del: 2 },
    { t: 'cross', top: '45%', left: '10%', sz: 9, cl: 'bg-amber-300/60 dark:bg-amber-500/20', anim: 'shubSpin', dur: 18, del: 4 },
    { t: 'diamond', top: '16%', right: '18%', sz: 8, cl: 'bg-orange-300/50 dark:bg-orange-500/20', anim: 'shubDrift', dur: 6, del: 1 },
    { t: 'diamond', top: '70%', left: '18%', sz: 7, cl: 'bg-sky-300/50 dark:bg-sky-500/20', anim: 'shubDrift', dur: 7, del: 2.5 },
    { t: 'diamond', top: '55%', left: '25%', sz: 6, cl: 'bg-rose-300/50 dark:bg-rose-500/20', anim: 'shubDrift', dur: 5.5, del: 0.5 },
    { t: 'diamond', top: '35%', right: '15%', sz: 5, cl: 'bg-yellow-300/60 dark:bg-yellow-500/20', anim: 'shubPulse', dur: 4, del: 1.5 },
    { t: 'diamond', top: '88%', right: '25%', sz: 6, cl: 'bg-violet-300/50 dark:bg-violet-500/20', anim: 'shubDrift', dur: 6, del: 3 },
];

const Particle = memo(({ p }) => {
    const pos = { top: p.top, bottom: p.bottom, left: p.left, right: p.right };
    const base = 'absolute pointer-events-none';
    const anim = { animation: `${p.anim} ${p.dur}s ease-in-out infinite`, animationDelay: `${p.del}s` };
    if (p.t === 'ring') return <div className={`${base} rounded-full border-[1.5px] ${p.cl}`} style={{ ...pos, width: p.sz, height: p.sz, ...anim }} />;
    if (p.t === 'cross') return (
        <div className={base} style={{ ...pos, width: p.sz, height: p.sz, ...anim }}>
            <div className={`absolute top-1/2 left-0 w-full h-[1.5px] -translate-y-1/2 rounded-full ${p.cl}`} />
            <div className={`absolute left-1/2 top-0 h-full w-[1.5px] -translate-x-1/2 rounded-full ${p.cl}`} />
        </div>
    );
    if (p.t === 'diamond') return <div className={`${base} ${p.cl} rounded-[1px]`} style={{ ...pos, width: p.sz, height: p.sz, transform: 'rotate(45deg)', ...anim }} />;
    return <div className={`${base} rounded-full ${p.cl}`} style={{ ...pos, width: p.sz, height: p.sz, ...anim }} />;
});
Particle.displayName = "Particle";

/* ── Mini confetti burst helper (fires on mood click) ── */
const CONFETTI_COLORS = ['#fbbf24', '#fb7185', '#a78bfa', '#34d399', '#f97316', '#38bdf8'];
function spawnConfetti(container, originX, originY, count = 12) {
    if (!container) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'shub-confetti';
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const dist = 24 + Math.random() * 28;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist - 10;
        const size = 4 + Math.random() * 4;
        Object.assign(el.style, {
            left: `${originX - size / 2}px`,
            top: `${originY - size / 2}px`,
            width: `${size}px`,
            height: `${size}px`,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            '--cf-y': `${ty}px`,
            '--cf-r': `${180 + Math.random() * 360}deg`,
            '--cf-dur': `${0.5 + Math.random() * 0.4}s`,
        });
        el.style.transform = `translate(${tx}px, 0)`;
        frag.appendChild(el);
        setTimeout(() => el.remove(), 900);
    }
    container.appendChild(frag);
}

/* ── GSAP: orchestrate the page-enter timeline ── */
function usePageEnterTimeline(containerRef) {
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'back.out(1.7)', duration: 0.55 } });

            // Badge flies in with scale
            tl.fromTo('.shub-badge', { opacity: 0, y: -20, scale: 0.6 }, { opacity: 1, y: 0, scale: 1, duration: 0.4 }, 0);

            // Heading words stagger in
            tl.fromTo('.shub-heading-line', { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.12 }, 0.1);

            // Subtitle fades in
            tl.fromTo('.shub-subtitle', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4 }, 0.35);

            // Mood buttons pop in with elastic stagger
            tl.fromTo('.shub-mood-btn',
                { opacity: 0, scale: 0, rotate: -15 },
                { opacity: 1, scale: 1, rotate: 0, stagger: 0.08, ease: 'elastic.out(1,0.5)', duration: 0.7 },
                0.3
            );

            // Feature cards slide up staggered
            tl.fromTo('.shub-feature-card',
                { opacity: 0, y: 40, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, stagger: 0.12, duration: 0.5 },
                0.5
            );

            // Daily tip slides in
            tl.fromTo('.shub-daily-tip',
                { opacity: 0, x: -30 },
                { opacity: 1, x: 0, duration: 0.4 },
                0.8
            );

            // Footer
            tl.fromTo('.shub-footer',
                { opacity: 0 },
                { opacity: 1, duration: 0.3 },
                0.9
            );
        }, containerRef);

        return () => ctx.revert();
    }, [containerRef]);
}

/* ── anime.js: looping ambient icon animations ── */
function useAmbientAnimations(containerRef) {
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Emoji idle float — uses anime.js for smooth looping
        const emojiEls = container.querySelectorAll('.shub-emoji');
        const emojiAnims = [];
        emojiEls.forEach((el, i) => {
            emojiAnims.push(
                animate(el, {
                    translateY: [-3, 3, -3],
                    rotate: [-3, 3, -3],
                }, {
                    duration: 2800 + i * 300,
                    loop: true,
                    ease: 'inOutSine',
                    delay: i * 200,
                })
            );
        });

        // Badge sparkle icon gentle rotate
        const sparkleIcon = container.querySelector('.shub-badge-icon');
        let sparkleAnim;
        if (sparkleIcon) {
            sparkleAnim = animate(sparkleIcon, {
                rotate: [0, 360],
                scale: [1, 1.15, 1],
            }, {
                duration: 4000,
                loop: true,
                ease: 'linear',
            });
        }

        // Card icons subtle breathing
        const cardIcons = container.querySelectorAll('.shub-card-icon');
        const iconAnims = [];
        cardIcons.forEach((el, i) => {
            iconAnims.push(
                animate(el, {
                    scale: [1, 1.06, 1],
                }, {
                    duration: 3000 + i * 500,
                    loop: true,
                    ease: 'inOutSine',
                    delay: i * 400,
                })
            );
        });

        // Zap icon in daily tip — pulse
        const zapIcon = container.querySelector('.shub-zap-icon');
        let zapAnim;
        if (zapIcon) {
            zapAnim = animate(zapIcon, {
                scale: [1, 1.2, 1],
                rotate: [0, 15, 0],
            }, {
                duration: 2000,
                loop: true,
                ease: 'inOutQuad',
            });
        }

        return () => {
            emojiAnims.forEach(a => a?.pause?.());
            sparkleAnim?.pause?.();
            iconAnims.forEach(a => a?.pause?.());
            zapAnim?.pause?.();
        };
    }, [containerRef]);
}

/* ── GSAP: card hover magnetic tilt ── */
function useCardTilt(containerRef) {
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        // Only on pointer devices
        if (!window.matchMedia('(hover: hover)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const cards = container.querySelectorAll('.shub-feature-card');
        const handlers = [];

        cards.forEach((card) => {
            const handleMove = (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
                const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
                gsap.to(card, {
                    rotateY: x * 4,
                    rotateX: -y * 3,
                    duration: 0.3,
                    ease: 'power2.out',
                    overwrite: 'auto',
                });
            };
            const handleLeave = () => {
                gsap.to(card, {
                    rotateY: 0,
                    rotateX: 0,
                    duration: 0.5,
                    ease: 'elastic.out(1,0.4)',
                    overwrite: 'auto',
                });
            };
            card.addEventListener('mousemove', handleMove);
            card.addEventListener('mouseleave', handleLeave);
            handlers.push({ el: card, move: handleMove, leave: handleLeave });
        });

        return () => {
            handlers.forEach(({ el, move, leave }) => {
                el.removeEventListener('mousemove', move);
                el.removeEventListener('mouseleave', leave);
            });
        };
    }, [containerRef]);
}

const StudentSupportHubPage = memo(() => {
    const navigate = useNavigate();
    const go = useCallback((p) => navigate(p), [navigate]);
    const containerRef = useRef(null);
    const confettiRef = useRef(null);

    usePageEnterTimeline(containerRef);
    useAmbientAnimations(containerRef);
    useCardTilt(containerRef);

    // Mood button click handler with jelly + confetti
    const handleMoodClick = useCallback((e) => {
        const btn = e.currentTarget;
        // Trigger jelly CSS class
        btn.classList.remove('shub-jelly');
        // Force reflow to restart animation
        void btn.offsetWidth;
        btn.classList.add('shub-jelly');

        // Mini confetti burst from center of button
        const rect = btn.getBoundingClientRect();
        const containerRect = confettiRef.current?.getBoundingClientRect();
        if (containerRect) {
            const cx = rect.left + rect.width / 2 - containerRect.left;
            const cy = rect.top + rect.height / 2 - containerRect.top;
            spawnConfetti(confettiRef.current, cx, cy, 10);
        }

        // Navigate after a brief joyful moment
        setTimeout(() => go('/student/emotional-checkin'), 350);
    }, [go]);

    // Card click with ripple-like scale punch
    const handleCardClick = useCallback((path, e) => {
        const card = e.currentTarget;
        gsap.fromTo(card,
            { scale: 1 },
            { scale: 0.96, duration: 0.1, ease: 'power2.in', yoyo: true, repeat: 1, onComplete: () => go(path) }
        );
    }, [go]);

    return (
        <AnimatedPage>
            <Helmet><title>Student Support Hub - Millennia World School</title></Helmet>
            <ScopedStyles />

            <div ref={containerRef} className="shub-bg shub-font min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-50 via-rose-50 via-50% to-violet-50 dark:from-background dark:via-background dark:to-background">

                {/* Dot-grid */}
                <div className="shub-grid absolute inset-0 pointer-events-none" />

                {/* ── Blobs ── */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-20 -right-16 w-80 sm:w-[420px] h-80 sm:h-[420px] rounded-full blur-3xl bg-gradient-to-br from-rose-200/50 via-orange-200/35 to-amber-100/25 dark:from-rose-500/8 dark:via-orange-500/4 dark:to-transparent" style={{ animation: 'shubBlob 10s ease-in-out infinite' }} />
                    <div className="absolute -bottom-16 -left-16 w-72 sm:w-[380px] h-72 sm:h-[380px] rounded-full blur-3xl bg-gradient-to-br from-violet-200/50 via-blue-200/35 to-sky-100/25 dark:from-violet-500/8 dark:via-blue-500/4 dark:to-transparent" style={{ animation: 'shubBlob 12s ease-in-out infinite', animationDelay: '3s' }} />
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 sm:w-80 h-64 sm:h-80 rounded-full blur-3xl bg-gradient-to-br from-amber-100/45 via-yellow-100/25 to-transparent dark:from-amber-500/5 dark:to-transparent" style={{ animation: 'shubBlob 9s ease-in-out infinite', animationDelay: '1.5s' }} />
                    <div className="absolute bottom-[10%] right-[5%] w-60 sm:w-72 h-60 sm:h-72 rounded-full blur-3xl bg-gradient-to-br from-emerald-100/40 via-teal-100/25 to-transparent dark:from-emerald-500/5 dark:to-transparent" style={{ animation: 'shubBlob 11s ease-in-out infinite', animationDelay: '5s' }} />
                    <div className="absolute top-[5%] -left-10 w-52 sm:w-64 h-52 sm:h-64 rounded-full blur-3xl bg-gradient-to-br from-pink-100/40 via-fuchsia-100/20 to-transparent dark:from-pink-500/5 dark:to-transparent" style={{ animation: 'shubBlob 8s ease-in-out infinite', animationDelay: '2s' }} />
                    <div className="absolute top-[55%] -right-8 w-48 sm:w-60 h-48 sm:h-60 rounded-full blur-3xl bg-gradient-to-br from-indigo-100/35 via-violet-100/20 to-transparent dark:from-indigo-500/5 dark:to-transparent" style={{ animation: 'shubBlob 13s ease-in-out infinite', animationDelay: '4s' }} />
                    {particles.map((p, i) => <Particle key={i} p={p} />)}
                </div>

                {/* Confetti container (positioned over content) */}
                <div ref={confettiRef} className="absolute inset-0 pointer-events-none z-50 overflow-hidden" />

                {/* ── Content ── */}
                <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-12 pb-10 sm:pt-20 sm:pb-16 min-h-screen">

                    {/* Header */}
                    <div className="text-center mb-5 sm:mb-7 max-w-lg">
                        {/* Pill badge */}
                        <div className="shub-badge inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/70 dark:bg-white/8 border border-gray-200/40 dark:border-white/10 backdrop-blur-sm mb-4 shadow-sm shub-badge-sparkle" style={{ opacity: 0 }}>
                            <Sparkles className="shub-badge-icon w-3 h-3 text-amber-500" />
                            <span className="text-[11px] font-extrabold tracking-wide text-gray-500 dark:text-gray-400 uppercase">Student Hub</span>
                        </div>

                        {/* Main heading */}
                        <h1 className="text-[1.65rem] sm:text-4xl font-black leading-tight mb-2">
                            <span className="shub-heading-line inline-block text-gray-700 dark:text-white" style={{ opacity: 0 }}>
                                Hey there{' '}
                                <motion.span
                                    className="inline-block origin-bottom-right"
                                    animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                                    role="img" aria-label="wave"
                                >👋</motion.span>
                            </span>
                            <br />
                            <span className="shub-heading-line inline-block shub-title bg-gradient-to-r from-rose-500 via-amber-500 via-40% to-violet-500 dark:from-rose-400 dark:via-amber-400 dark:to-violet-400" style={{ opacity: 0 }}>
                                Ready to shine today?
                            </span>
                        </h1>

                        <p className="shub-subtitle text-[13px] sm:text-sm text-gray-400 dark:text-gray-500 font-medium leading-relaxed" style={{ opacity: 0 }}>
                            Pick how you want to start — we've got your back!
                        </p>
                    </div>

                    {/* Mood emoji row */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-7 sm:mb-9">
                        {moods.map((m) => (
                            <button
                                key={m.emoji}
                                onClick={handleMoodClick}
                                className={`shub-mood-btn flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/8 ${m.bg} hover:shadow-md hover:-translate-y-1 active:scale-95 transition-all duration-200 cursor-pointer backdrop-blur-sm`}
                                style={{ opacity: 0, perspective: '600px' }}
                                title={m.label}
                            >
                                <span className="shub-emoji text-xl sm:text-2xl select-none inline-block">{m.emoji}</span>
                                <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 tracking-wide uppercase">{m.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* ── Feature cards ── */}
                    <div className="w-full max-w-md space-y-3 sm:space-y-4">
                        {hubOptions.map((opt) => {
                            const Icon = opt.icon;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={(e) => handleCardClick(opt.path, e)}
                                    className="shub-feature-card shub-card w-full relative overflow-hidden rounded-2xl sm:rounded-3xl text-left bg-white/65 dark:bg-white/[0.04] backdrop-blur-xl border border-white/90 dark:border-white/8 shadow-sm hover:shadow-xl p-4 sm:p-5 group"
                                    style={{ opacity: 0, perspective: '800px', transformStyle: 'preserve-3d' }}
                                >
                                    <div className={`absolute -top-10 -left-10 w-36 h-36 rounded-full bg-gradient-to-br ${opt.cardAccent} blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700`} />
                                    <div className={`absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-tl ${opt.cardAccent} blur-2xl pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity duration-500`} />

                                    <div className="relative z-10 flex items-center gap-3.5 sm:gap-4">
                                        <div className={`shub-card-icon flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${opt.iconBg} flex items-center justify-center shadow-lg ${opt.iconShadow} group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="text-sm sm:text-base font-extrabold text-gray-800 dark:text-white truncate">{opt.title}</h3>
                                                <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${opt.tagStyle}`}>{opt.tag}</span>
                                            </div>
                                            <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 leading-snug font-medium">{opt.description}</p>
                                        </div>
                                        <div className="shub-arrow flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-50/80 dark:bg-white/8 flex items-center justify-center group-hover:bg-gray-100 dark:group-hover:bg-white/12 transition-all duration-200">
                                            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 transition-colors" />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Daily tip ── */}
                    <div className="shub-daily-tip shub-tip mt-8 sm:mt-10 w-full max-w-md" style={{ opacity: 0 }}>
                        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-yellow-50/40 dark:from-amber-900/10 dark:via-orange-900/5 dark:to-transparent border border-amber-100/60 dark:border-amber-800/20 backdrop-blur-sm">
                            <div className="shub-zap-icon flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center shadow-sm">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-extrabold text-amber-700/80 dark:text-amber-400/80">Daily Tip</p>
                                <p className="text-[10px] text-amber-600/60 dark:text-amber-500/50 leading-snug font-medium">Take a moment to check in with yourself. Your feelings matter!</p>
                            </div>
                            <Star className="w-4 h-4 text-amber-300 flex-shrink-0" />
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="shub-footer mt-6 text-[10px] text-gray-300 dark:text-gray-600 tracking-wide font-semibold" style={{ opacity: 0 }}>
                        Millennia World School
                    </p>
                </div>
            </div>
        </AnimatedPage>
    );
});

StudentSupportHubPage.displayName = "StudentSupportHubPage";
export default StudentSupportHubPage;
