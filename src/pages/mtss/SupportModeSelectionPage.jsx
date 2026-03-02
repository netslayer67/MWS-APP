import { memo, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Brain, Handshake, ArrowRight, Sparkles, Shield, Users } from "lucide-react";
import Logo from "../../components/ui/Millennia.webp";
import gsap from "gsap";
import kidsGroupPhoto from "@/assets/landing/kids-group.jpg";
import kidsCutoutNatural2 from "@/assets/landing/kids-cutout-natural-2.svg";
import "@/pages/styles/support-hub-humanistic.css";

const supportsFinePointer = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
};

const prefersReducedMotion = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const resolveDepth = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 12;
};

const SHP_COLLAGE_CUTOUTS = [
  {
    id: "stamp-left",
    className: "shp-photo-cutout--stamp-left shp-frame--stamp",
    position: "26% 40%",
    depth: 14,
    aos: "shp-tilt-pop",
    delay: 60,
    duration: 760
  },
  {
    id: "pill-left",
    className: "shp-photo-cutout--pill-left shp-frame--pill",
    position: "20% 67%",
    depth: 11,
    aos: "shp-slide-grow",
    delay: 120,
    duration: 760
  },
  {
    id: "ticket-right",
    className: "shp-photo-cutout--ticket-right shp-frame--ticket",
    position: "74% 58%",
    depth: 12,
    aos: "shp-ticket-swing",
    delay: 170,
    duration: 820
  },
  {
    id: "ribbon-top",
    className: "shp-photo-cutout--ribbon-top shp-frame--ribbon",
    position: "66% 22%",
    depth: 10,
    aos: "shp-slice-drop",
    delay: 230,
    duration: 790
  },
  {
    id: "wave-bottom-right",
    className: "shp-photo-cutout--wave-bottom-right shp-frame--wave",
    position: "58% 83%",
    depth: 9,
    aos: "shp-orb-rise",
    delay: 290,
    duration: 760
  },
];

const SHP_NATURAL_CUTOUTS = [
  {
    id: "natural-left",
    className: "shp-natural-cutout--left",
    src: kidsCutoutNatural2,
    depth: 15,
    aos: "shp-natural-rise",
    delay: 80,
    duration: 820
  },
  {
    id: "natural-right-top",
    className: "shp-natural-cutout--right-top",
    src: kidsCutoutNatural2,
    depth: 13,
    aos: "shp-natural-drift",
    delay: 140,
    duration: 860
  },
  {
    id: "natural-right-bottom",
    className: "shp-natural-cutout--right-bottom",
    src: kidsCutoutNatural2,
    depth: 10,
    aos: "shp-natural-rise",
    delay: 220,
    duration: 860
  },
];

const SHP_COLLAGE_ACCENTS = [
  { id: "a", className: "shp-photo-accent--a", depth: 8, aos: "shp-orb-pop", delay: 80, duration: 690 },
  { id: "b", className: "shp-photo-accent--b", depth: 7, aos: "shp-orb-pop", delay: 140, duration: 720 },
  { id: "c", className: "shp-photo-accent--c", depth: 6, aos: "shp-orb-pop", delay: 210, duration: 700 },
  { id: "d", className: "shp-photo-accent--d", depth: 7, aos: "shp-orb-pop", delay: 260, duration: 740 },
];

const SupportHubPhotoLayer = memo(() => (
  <div className="shp-photo-layer" aria-hidden="true">
    <div className="shp-photo-bg" style={{ backgroundImage: `url(${kidsGroupPhoto})` }} />
    <div className="shp-photo-veil" />

    {SHP_NATURAL_CUTOUTS.map((item) => (
      <div
        key={item.id}
        className={`shp-natural-cutout ${item.className}`}
        data-shp-depth={item.depth}
        data-aos={item.aos}
        data-aos-delay={item.delay}
        data-aos-duration={item.duration}
        data-aos-easing="ease-out-cubic"
      >
        <img
          src={item.src}
          alt=""
          className="shp-natural-cutout-image"
          loading="lazy"
          decoding="async"
        />
      </div>
    ))}

    {SHP_COLLAGE_ACCENTS.map((item) => (
      <div
        key={item.id}
        className={`shp-photo-accent ${item.className}`}
        data-shp-depth={item.depth}
        data-aos={item.aos}
        data-aos-delay={item.delay}
        data-aos-duration={item.duration}
        data-aos-easing="ease-out-cubic"
      />
    ))}

    {SHP_COLLAGE_CUTOUTS.map((item) => (
      <div
        key={item.id}
        className={`shp-photo-cutout ${item.className}`}
        data-shp-depth={item.depth}
        style={{ backgroundImage: `url(${kidsGroupPhoto})`, backgroundPosition: item.position }}
        data-aos={item.aos}
        data-aos-delay={item.delay}
        data-aos-duration={item.duration}
        data-aos-easing="ease-out-cubic"
      />
    ))}
  </div>
));
SupportHubPhotoLayer.displayName = "SupportHubPhotoLayer";

/* ── Card config ────────────────────────────────────────── */
const CARDS = [
  {
    id: "mtss",
    title: "MTSS",
    subtitle: "Multi-Tiered System of Support",
    desc: "Tiered interventions, data-driven insights, and mentor collaboration — keeping every learner on track.",
    icon: Brain,
    badge: "For Teachers & Mentors",
    emoji: "🎯",
    gradient: "linear-gradient(135deg, #ff4ec6 0%, #ff7ad9 35%, #ffb347 100%)",
    glowColor: "rgba(255,78,198,0.25)",
    ctaColor: "text-rose-600",
    features: ["Tier tracking", "Mentor tools", "Data dashboards"],
  },
  {
    id: "checkin",
    title: "Emotional Check-in",
    subtitle: "Wellness & Mood Monitoring",
    desc: "Quick mood checks, AI facial analysis, and real-time alerts to caregivers — because feelings matter.",
    icon: Handshake,
    badge: "For Everyone",
    emoji: "💌",
    gradient: "linear-gradient(135deg, #7dd3fc 0%, #60a5fa 30%, #a7f3d0 100%)",
    glowColor: "rgba(96,165,250,0.25)",
    ctaColor: "text-sky-600",
    features: ["Mood tracking", "AI analysis", "Instant alerts"],
  },
];

const TRUST_ITEMS = [
  { icon: Shield, text: "Safe & Secure" },
  { icon: Sparkles, text: "AI-Powered" },
  { icon: Users, text: "Built for Schools" },
];

/* ── OptionCard ─────────────────────────────────────────── */
const OptionCard = memo(({ card, onClick, index }) => (
  <button
    onClick={onClick}
    className="smsp-card group relative w-full overflow-hidden text-left border border-white/40 dark:border-white/10 backdrop-blur-[18px] shadow-2xl hover:shadow-3xl rounded-2xl sm:rounded-[2rem]"
    style={{
      background: card.gradient,
      animation: `smsp-card-in 0.6s cubic-bezier(.21,1.02,.73,1) ${0.4 + index * 0.15}s both`,
    }}
  >
    {/* Glass overlay */}
    <div className="absolute inset-0 bg-white/30 dark:bg-black/25 pointer-events-none" />
    {/* Hover glow */}
    <div className="absolute -right-14 -bottom-10 w-56 h-56 bg-white/0 group-hover:bg-white/40 dark:group-hover:bg-white/10 blur-[120px] transition-all duration-700 pointer-events-none" />

    <div className="relative z-10 p-5 sm:p-9 space-y-3 sm:space-y-5">
      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:gap-2 sm:px-3 sm:py-1.5 rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/50 dark:border-white/15 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em]">
        {card.emoji && <span className="text-sm sm:text-base">{card.emoji}</span>}
        <card.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span>{card.badge}</span>
      </div>

      {/* Title */}
      <div>
        <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-lg">{card.title}</h3>
        <p className="text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider mt-0.5 sm:mt-1">{card.subtitle}</p>
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-sm">{card.desc}</p>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {card.features.map(f => (
          <span key={f} className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-white/25 dark:bg-white/10 text-white/90 backdrop-blur-sm border border-white/20">{f}</span>
        ))}
      </div>

      {/* CTA */}
      <div className="pt-1 sm:pt-2">
        <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider bg-white/95 dark:bg-white/90 border border-white/70 shadow-lg group-hover:shadow-xl ${card.ctaColor} transition-all duration-300`}>
          Start now
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </div>

    {/* Card hover scale */}
    <style>{`
      .smsp-card { transition: transform 0.35s cubic-bezier(.21,1.02,.73,1), box-shadow 0.35s ease; }
      .smsp-card:hover { transform: translateY(-6px) scale(1.01); }
      .smsp-card:active { transform: scale(0.985); }
    `}</style>
  </button>
));
OptionCard.displayName = "OptionCard";

/* ── Main Page ──────────────────────────────────────────── */
const SupportModeSelectionPage = memo(() => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const pageRef = useRef(null);

  /* GSAP entrance timeline */
  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo('.smsp-logo-wrap', { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6 })
        .fromTo('.smsp-heading', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.2')
        .fromTo('.smsp-sub', { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, '-=0.2')
        .fromTo('.smsp-trust', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.08 }, '-=0.1');
    }, el);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return undefined;
    const reduceMotion = prefersReducedMotion();
    const isCompactViewport = typeof window !== "undefined"
      && typeof window.matchMedia === "function"
      && window.matchMedia("(max-width: 767px)").matches;
    const ambientEntryDelay = isCompactViewport ? 0.68 : 0.9;

    const ctx = gsap.context(() => {
      if (reduceMotion) return;

      gsap.to(".shp-photo-bg", {
        scale: 1.07,
        duration: 11,
        delay: ambientEntryDelay,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      const cutouts = gsap.utils.toArray(".shp-photo-cutout");
      const animatedCutouts = isCompactViewport ? cutouts.slice(0, 4) : cutouts;

      animatedCutouts.forEach((node, index) => {
        gsap.to(node, {
          y: index % 2 === 0 ? -7 : -5,
          x: index % 2 === 0 ? 4 : -3,
          duration: 6 + index * 0.45,
          delay: ambientEntryDelay + 0.12 + index * 0.07,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          force3D: true
        });
      });

      const accents = gsap.utils.toArray(".shp-photo-accent");
      const animatedAccents = isCompactViewport ? accents.slice(0, 2) : accents;

      animatedAccents.forEach((node, index) => {
        gsap.to(node, {
          scale: 1.1,
          opacity: 0.78,
          duration: 5 + index * 0.35,
          delay: ambientEntryDelay + 0.2 + index * 0.05,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          force3D: true
        });
      });

      const naturalCutouts = gsap.utils.toArray(".shp-natural-cutout");
      const animatedNatural = isCompactViewport ? naturalCutouts.slice(0, 2) : naturalCutouts;

      animatedNatural.forEach((node, index) => {
        gsap.to(node, {
          y: index % 2 === 0 ? -8 : -6,
          x: index % 2 === 0 ? 4 : -4,
          duration: 7.2 + index * 0.6,
          delay: ambientEntryDelay + 0.14 + index * 0.08,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          force3D: true
        });
      });
    }, el);

    let removeParallax = () => {};
    if (!reduceMotion && supportsFinePointer()) {
      const shell = el.querySelector(".shp-parallax-shell") || el;
      const layers = Array.from(el.querySelectorAll("[data-shp-depth]"));

      if (shell && layers.length > 0) {
        const onMove = (event) => {
          const rect = shell.getBoundingClientRect();
          const ratioX = (event.clientX - rect.left) / rect.width - 0.5;
          const ratioY = (event.clientY - rect.top) / rect.height - 0.5;

          layers.forEach((layer) => {
            const depth = resolveDepth(layer.dataset.shpDepth);
            gsap.to(layer, {
              x: ratioX * depth,
              y: ratioY * depth,
              duration: 0.52,
              ease: "power2.out",
              overwrite: "auto"
            });
          });
        };

        const onLeave = () => {
          layers.forEach((layer) => {
            gsap.to(layer, {
              x: 0,
              y: 0,
              duration: 0.72,
              ease: "power3.out",
              overwrite: "auto"
            });
          });
        };

        shell.addEventListener("pointermove", onMove, { passive: true });
        shell.addEventListener("pointerleave", onLeave, { passive: true });
        removeParallax = () => {
          shell.removeEventListener("pointermove", onMove);
          shell.removeEventListener("pointerleave", onLeave);
        };
      }
    }

    return () => {
      removeParallax();
      ctx.revert();
    };
  }, []);

  const handleMtssClick = useCallback(() => {
    const normalizedRole = (user?.role || '').toLowerCase();
    if (['teacher', 'se_teacher'].includes(normalizedRole)) {
      navigate('/mtss/teacher');
      return;
    }
    navigate('/mtss');
  }, [navigate, user?.role]);

  return (
    <div ref={pageRef} className="shp-parallax-shell mtss-theme mtss-animated-bg min-h-screen relative overflow-hidden text-foreground dark:text-white transition-colors">
      <SupportHubPhotoLayer />
      <div className="mtss-bg-overlay" />

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 left-0 w-72 h-72 bg-[#ffaae4]/40 blur-[160px] animate-blob-left" />
        <div className="absolute top-16 right-4 w-72 h-72 bg-[#8be8ff]/40 blur-[150px] animate-blob-right" />
        <div className="absolute bottom-16 left-1/3 w-80 h-80 bg-[#c4f1be]/35 blur-[150px]" />
        {/* Floating orb */}
        <div className="absolute top-12 right-1/3 w-10 h-10 rounded-full bg-white/50 dark:bg-white/20" style={{ animation: 'smsp-orb 6s ease-in-out infinite' }} />
      </div>

      <div className="relative z-20 container-tight py-10 sm:py-14 lg:py-20">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 sm:space-y-5 mb-8 sm:mb-12">
          {/* Logo badge */}
          <div className="smsp-logo-wrap inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-xl shadow-lg">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#ff80b5] via-[#ffb553] to-[#7dd3fc] p-[2px] flex items-center justify-center">
              <span className="w-full h-full rounded-2xl bg-white/90 dark:bg-white/5 flex items-center justify-center">
                <img src={Logo} alt="MWS Logo" className="w-7 h-7 object-contain" loading="lazy" />
              </span>
            </span>
            <div className="text-left">
              <span className="text-[0.6rem] font-black tracking-[0.5em] uppercase text-rose-500 block">MWS</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-white/80">Support Playlab</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="smsp-heading text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f97316] via-[#ec4899] to-[#7c3aed] dark:from-[#fdba74] dark:via-[#f9a8d4] dark:to-[#c4b5fd]">
              Choose a Support Journey
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff58c2] via-[#ffb347] to-[#7dd3fc]">
              for Our Kids
            </span>
          </h1>
          {/* Trust indicators */}
          <div className="smsp-sub flex flex-wrap justify-center gap-4 pt-1">
            {TRUST_ITEMS.map(t => (
              <div key={t.text} className="smsp-trust flex items-center gap-1.5 text-foreground/45 dark:text-white/40 text-xs">
                <t.icon className="w-3.5 h-3.5" />
                <span className="font-medium">{t.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto px-1 sm:px-0">
          {CARDS.map((card, i) => (
            <OptionCard
              key={card.id}
              card={card}
              index={i}
              onClick={card.id === 'mtss' ? handleMtssClick : () => navigate('/select-role')}
            />
          ))}
        </div>

        {/* Footer hint */}
        <p className="text-center text-[10px] text-foreground/30 dark:text-white/20 mt-10 font-medium" style={{ animation: 'smsp-fade-in 0.5s ease-out 1.2s both' }}>
          Millennia World School — Empowering every learner
        </p>
      </div>

      <style>{`
        @keyframes smsp-card-in {
          from { transform: translateY(40px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes smsp-orb {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(20deg); }
        }
        @keyframes smsp-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
});

SupportModeSelectionPage.displayName = "SupportModeSelectionPage";
export default SupportModeSelectionPage;
