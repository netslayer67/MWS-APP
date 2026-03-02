import { memo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Brain, Sparkles, ArrowRight, BarChart3, ArrowLeft, Shield } from "lucide-react";
import { useSelector } from "react-redux";
import {
  hasEmotionalDashboardAccess,
  getEmotionalDashboardRole,
  hasDelegatedDashboardAccess,
  getDelegatedDashboardDetails
} from "@/utils/accessControl";
import { prefetchStaffFaceScanOnIntent } from "@/utils/faceScanPrefetch";
import gsap from "gsap";
import kidsGroupPhoto from "@/assets/landing/kids-group.jpg";
import kidsCutoutNatural2 from "@/assets/landing/kids-cutout-natural-2.svg";
import "@/pages/styles/role-selection-humanistic.css";

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

const RS_PHOTO_CUTOUTS = [
  {
    id: "northwest-card",
    className: "rs-photo-cutout--northwest-card",
    position: "24% 44%",
    depth: 14,
    aos: "rs-pop-tilt",
    delay: 60,
    duration: 760
  },
  {
    id: "east-strip",
    className: "rs-photo-cutout--east-strip",
    position: "84% 48%",
    depth: 16,
    aos: "rs-slice-rise",
    delay: 120,
    duration: 780
  },
  {
    id: "top-circle",
    className: "rs-photo-cutout--top-circle",
    position: "66% 22%",
    depth: 12,
    aos: "rs-orb-drop",
    delay: 180,
    duration: 760
  },
  {
    id: "left-chip",
    className: "rs-photo-cutout--left-chip",
    position: "12% 60%",
    depth: 9,
    aos: "rs-side-glide",
    delay: 220,
    duration: 760
  },
  {
    id: "bottom-bubble",
    className: "rs-photo-cutout--bottom-bubble",
    position: "70% 80%",
    depth: 8,
    aos: "rs-bubble-bounce",
    delay: 260,
    duration: 780
  },
  {
    id: "southeast-chip",
    className: "rs-photo-cutout--southeast-chip",
    position: "72% 68%",
    depth: 10,
    aos: "rs-ticket-spin",
    delay: 300,
    duration: 820
  },
  {
    id: "south-circle",
    className: "rs-photo-cutout--south-circle",
    position: "50% 72%",
    depth: 8,
    aos: "rs-bubble-bounce",
    delay: 350,
    duration: 820
  },
];

const RS_NATURAL_CUTOUTS = [
  {
    id: "natural-left",
    className: "rs-natural-cutout--left",
    src: kidsCutoutNatural2,
    depth: 13,
    aos: "rs-natural-rise",
    delay: 90,
    duration: 860
  },
  {
    id: "natural-right",
    className: "rs-natural-cutout--right",
    src: kidsCutoutNatural2,
    depth: 12,
    aos: "rs-natural-drift",
    delay: 160,
    duration: 880
  },
  {
    id: "natural-bottom",
    className: "rs-natural-cutout--bottom",
    src: kidsCutoutNatural2,
    depth: 9,
    aos: "rs-natural-rise",
    delay: 240,
    duration: 860
  },
];

const RS_PHOTO_ACCENTS = [
  { id: "a", className: "rs-photo-accent--a", depth: 8, aos: "rs-orb-pop", delay: 80, duration: 680 },
  { id: "b", className: "rs-photo-accent--b", depth: 10, aos: "rs-orb-pop", delay: 140, duration: 700 },
  { id: "c", className: "rs-photo-accent--c", depth: 9, aos: "rs-orb-pop", delay: 200, duration: 720 },
  { id: "d", className: "rs-photo-accent--d", depth: 7, aos: "rs-orb-pop", delay: 260, duration: 730 },
  { id: "e", className: "rs-photo-accent--e", depth: 6, aos: "rs-orb-pop", delay: 320, duration: 720 },
];

const RoleSelectionPhotoLayer = memo(() => (
  <div className="rs-photo-layer" aria-hidden="true">
    <div className="rs-white-canvas" />

    {RS_NATURAL_CUTOUTS.map((item) => (
      <div
        key={item.id}
        className={`rs-natural-cutout ${item.className}`}
        data-rs-depth={item.depth}
        data-aos={item.aos}
        data-aos-delay={item.delay}
        data-aos-duration={item.duration}
        data-aos-easing="ease-out-cubic"
      >
        <img
          src={item.src}
          alt=""
          className="rs-natural-cutout-image"
          loading="lazy"
          decoding="async"
        />
      </div>
    ))}

    {RS_PHOTO_ACCENTS.map((item) => (
      <div
        key={item.id}
        className={`rs-photo-accent ${item.className}`}
        data-rs-depth={item.depth}
        data-aos={item.aos}
        data-aos-delay={item.delay}
        data-aos-duration={item.duration || 700}
        data-aos-easing="ease-out-cubic"
      />
    ))}

    {RS_PHOTO_CUTOUTS.map((item) => (
      <div
        key={item.id}
        className={`rs-photo-cutout ${item.className}`}
        data-rs-depth={item.depth}
        style={{ backgroundImage: `url(${kidsGroupPhoto})`, backgroundPosition: item.position }}
        data-aos={item.aos}
        data-aos-delay={item.delay}
        data-aos-duration={item.duration || 780}
        data-aos-easing="ease-out-cubic"
      />
    ))}
  </div>
));
RoleSelectionPhotoLayer.displayName = "RoleSelectionPhotoLayer";

/* ── MethodCard ─────────────────────────────────────────── */
const MethodCard = memo(({ icon: Icon, title, desc, features, isPremium, onClick, onIntent, delay = 0 }) => (
  <button
    onMouseEnter={onIntent}
    onFocus={onIntent}
    onTouchStart={onIntent}
    onClick={onClick}
    className="rs-card group relative w-full text-left rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden hover:border-primary/30 active:scale-[0.985] transition-all duration-300"
    style={{ animation: `rs-card-in 0.5s cubic-bezier(.21,1.02,.73,1) ${delay}s both` }}
  >
    {/* Hover glow */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/[0.04] group-hover:to-transparent transition-all duration-500 pointer-events-none" />
    {/* Accent line */}
    {isPremium && <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-primary via-gold to-primary" />}

    <div className="relative z-10 p-4 sm:p-5 space-y-3">
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className={`p-2 sm:p-2.5 rounded-xl flex-shrink-0 ${isPremium ? 'bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20' : 'bg-surface border border-border/50'}`}>
          <Icon className={`w-5 h-5 ${isPremium ? 'text-white' : 'text-primary'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-foreground">{title}</h3>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug mt-0.5">{desc}</p>
        </div>
        {isPremium && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 flex-shrink-0">
            <Sparkles className="w-2.5 h-2.5 text-primary" />
            <span className="text-[8px] font-bold text-primary uppercase tracking-wider">AI</span>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {features.map((feature, i) => (
          <div key={i} className="flex items-start gap-2 text-[10px] sm:text-[11px]">
            <div className="w-1 h-1 rounded-full bg-primary/60 mt-1.5 flex-shrink-0" />
            <span className="text-foreground/80 leading-snug">{feature}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/20">
        <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium">
          {isPremium ? 'Advanced analysis' : 'Traditional method'}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </div>
  </button>
));

/* ── Main Component ─────────────────────────────────────── */
const RoleSelection = memo(() => {
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);
  const pageRef = useRef(null);

  const canAccessDashboard = user && hasEmotionalDashboardAccess(user);
  const effectiveDashboardRole = getEmotionalDashboardRole(user);
  const delegatedDashboardAccess = hasDelegatedDashboardAccess(user);
  const delegatedDashboardDetails = getDelegatedDashboardDetails(user);

  /* GSAP entrance */
  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo('.rs-back-btn', { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4 })
        .fromTo('.rs-icon-box', { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5 }, '-=0.2')
        .fromTo('.rs-heading', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, '-=0.2')
        .fromTo('.rs-subtext', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 }, '-=0.15')
        .fromTo('.rs-trust', { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.06 }, '-=0.1');
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
    const ambientEntryDelay = isCompactViewport ? 0.72 : 0.94;

    const ctx = gsap.context(() => {
      if (reduceMotion) return;

      gsap.to(".rs-white-canvas", {
        scale: 1.02,
        duration: 10.4,
        delay: ambientEntryDelay,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      const cutouts = gsap.utils.toArray(".rs-photo-cutout");
      const animatedCutouts = isCompactViewport ? cutouts.slice(0, 4) : cutouts;

      animatedCutouts.forEach((node, index) => {
        gsap.to(node, {
          y: index % 2 === 0 ? -7 : -5,
          x: index % 2 === 0 ? 4 : -3,
          duration: 5.4 + index * 0.45,
          delay: ambientEntryDelay + 0.18 + index * 0.08,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          force3D: true
        });
      });

      const accents = gsap.utils.toArray(".rs-photo-accent");
      const animatedAccents = isCompactViewport ? accents.slice(0, 2) : accents;

      animatedAccents.forEach((node, index) => {
        gsap.to(node, {
          scale: 1.08,
          opacity: 0.72,
          duration: 4.8 + index * 0.4,
          delay: ambientEntryDelay + 0.26 + index * 0.06,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          force3D: true
        });
      });

      const naturalCutouts = gsap.utils.toArray(".rs-natural-cutout");
      const animatedNatural = isCompactViewport ? naturalCutouts.slice(0, 2) : naturalCutouts;

      animatedNatural.forEach((node, index) => {
        gsap.to(node, {
          y: index % 2 === 0 ? -7 : -5,
          x: index % 2 === 0 ? 4 : -4,
          duration: 7.1 + index * 0.6,
          delay: ambientEntryDelay + 0.16 + index * 0.08,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          force3D: true
        });
      });
    }, el);

    let removeParallax = () => {};
    if (!reduceMotion && supportsFinePointer()) {
      const shell = el.querySelector(".rs-pointer-shell") || el;
      const layers = Array.from(el.querySelectorAll("[data-rs-depth]"));

      if (shell && layers.length > 0) {
        const onMove = (event) => {
          const rect = shell.getBoundingClientRect();
          const ratioX = (event.clientX - rect.left) / rect.width - 0.5;
          const ratioY = (event.clientY - rect.top) / rect.height - 0.5;

          layers.forEach((layer) => {
            const depth = resolveDepth(layer.dataset.rsDepth);
            gsap.to(layer, {
              x: ratioX * depth,
              y: ratioY * depth,
              duration: 0.56,
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

  const headUnitFeatures = [
    "Monitor unit staff wellness", "Handle support requests from your team",
    "Unit-specific emotional analytics", "Real-time team support tracking"
  ];
  const directorateFeatures = [
    "All employees emotional wellness overview", "Comprehensive staff analytics & insights",
    "Organization-wide support tracking", "Cross-department mood & weather patterns",
    "Individual employee deep-dive analysis", "Period-based reporting (daily/weekly/monthly/semesterly)"
  ];
  if (delegatedDashboardAccess && delegatedDashboardDetails) {
    directorateFeatures.unshift(
      `Mirrors ${delegatedDashboardDetails.delegatedFromName || delegatedDashboardDetails.delegatedFromEmail || 'directorate'} dashboard access`
    );
  }

  const dashboardDescription = effectiveDashboardRole === 'head_unit'
    ? "Monitor your team's emotional wellness and support requests"
    : delegatedDashboardAccess && delegatedDashboardDetails
      ? `Access the organization-wide dashboard entrusted to ${delegatedDashboardDetails.delegatedFromName || delegatedDashboardDetails.delegatedFromEmail}`
      : "Access comprehensive emotional wellness data for all employees";

  const dashboardFeatures = effectiveDashboardRole === 'head_unit' ? headUnitFeatures : directorateFeatures;

  const isTeacherRole = user && ['teacher', 'se_teacher'].includes(user.role);
  const isPrincipalRole = user && ['head_unit', 'directorate', 'admin', 'superadmin'].includes(user.role);
  const studentDashboardFeatures = isPrincipalRole
    ? ["Student emotional overview by grade and class", "Needs-support spotlight for faster follow up", "Unit-aligned scope for each principal", "Quick search and daily refresh monitoring"]
    : ["Class-scoped student check-ins", "Daily submission tracking", "Needs support highlights", "Quick search by student"];

  const selectMethod = (method) => {
    if (method === 'manual') navigate('/emotional-checkin/staff');
    else if (method === 'ai') navigate('/emotional-checkin/face-scan');
    else if (method === 'dashboard') navigate('/emotional-checkin/dashboard');
    else if (method === 'teacher-dashboard') navigate('/emotional-checkin/teacher-dashboard');
  };

  return (
    <div ref={pageRef} className="rs-humanistic-shell rs-white-collage relative min-h-screen text-foreground overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <RoleSelectionPhotoLayer />
        <div className="absolute top-0 left-0 w-80 h-80 bg-primary/[0.06] rounded-full blur-3xl" style={{ animation: 'rs-blob 8s ease-in-out infinite' }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/[0.04] rounded-full blur-3xl" style={{ animation: 'rs-blob 10s ease-in-out 1s infinite' }} />
        <div className="rs-grid-overlay" />
      </div>

      {/* Back button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30">
        <button onClick={() => navigate('/support-hub')}
          className="rs-back-btn inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-primary bg-card/80 border border-border/40 shadow-md backdrop-blur-xl hover:shadow-lg hover:border-primary/30 active:scale-95 transition-all duration-200">
          <ArrowLeft className="w-3.5 h-3.5" /> Support Hub
        </button>
      </div>

      {/* Content */}
      <div className="rs-pointer-shell relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl">

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="rs-icon-box w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 mb-3 sm:mb-4" style={{ animation: 'rs-float 3s ease-in-out 1s infinite alternate' }}>
              <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h1 className="rs-heading text-xl sm:text-2xl font-bold text-foreground mb-1.5">
              Choose Check-in Method
            </h1>
            <p className="rs-subtext text-[10px] sm:text-xs text-muted-foreground max-w-md mx-auto leading-relaxed px-2">
              Select your preferred emotional check-in method. Both are confidential and support your wellbeing.
            </p>

            {/* Trust row */}
            <div className="flex justify-center gap-4 mt-3">
              {[{ icon: Shield, text: 'Confidential' }, { icon: Sparkles, text: 'AI-Powered' }].map(t => (
                <div key={t.text} className="rs-trust flex items-center gap-1 text-muted-foreground/60 text-[10px]">
                  <t.icon className="w-3 h-3" />
                  <span className="font-medium">{t.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-3">
            <MethodCard icon={Heart} title="Manual Check-in"
              desc="Traditional form-based assessment with weather metaphors and detailed reflection"
              features={["Weather-based mood selection", "Detailed emotional reflection", "Presence & capacity ratings", "Support contact selection"]}
              isPremium={false} onClick={() => selectMethod('manual')} delay={0.35} />

            <MethodCard icon={Brain} title="AI Emotional Analysis"
              desc="Face scan technology detects authentic micro-expressions beyond conscious control"
              features={["Real-time facial expression analysis", "43 landmark micro-expression detection", "AI psychologist insights & recommendations", "Detects concealed emotions accurately"]}
              isPremium={true} onIntent={prefetchStaffFaceScanOnIntent} onClick={() => selectMethod('ai')} delay={0.45} />

            {(isTeacherRole || isPrincipalRole) && (
              <MethodCard icon={BarChart3}
                title={isPrincipalRole ? "Student Emotional Dashboard" : "Student Daily Check-in Dashboard"}
                desc={isPrincipalRole ? "Monitor emotional wellbeing for students in your unit with grade-aware filtering." : "Review daily check-ins for your assigned class and track support needs."}
                features={studentDashboardFeatures} isPremium={false}
                onClick={() => selectMethod('teacher-dashboard')} delay={0.55} />
            )}

            {canAccessDashboard && (
              <MethodCard icon={BarChart3}
                title={effectiveDashboardRole === 'head_unit' ? "Unit Dashboard" : "Emotional Checkin Dashboard"}
                desc={dashboardDescription} features={dashboardFeatures}
                isPremium={false} onClick={() => selectMethod('dashboard')} delay={0.6} />
            )}

            {user && user.role && !canAccessDashboard && (
              <div className="rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm p-3 text-center" style={{ animation: 'rs-card-in 0.5s ease-out 0.65s both' }}>
                <p className="text-[10px] text-muted-foreground">Role: <span className="font-semibold text-foreground">{user.role}</span></p>
                <p className="text-[9px] text-muted-foreground/60 mt-0.5">Dashboard access is available for Directorate, Head Unit, or approved delegated accounts.</p>
              </div>
            )}

            {(user && ['directorate', 'admin', 'superadmin'].includes(user.role)) && (
              <MethodCard icon={BarChart3} title="User Management"
                desc="Manage users, roles, and organizational structure"
                features={["User account management", "Role and permission settings", "Organizational hierarchy", "Advanced user analytics"]}
                isPremium={false} onClick={() => navigate('/user-management')} delay={0.65} />
            )}

            {loading && (
              <div className="rounded-xl border border-border/30 bg-card/40 p-4 text-center">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-[10px] text-muted-foreground">Loading user data...</p>
              </div>
            )}

            {!loading && !user && (
              <div className="rounded-xl border border-border/30 bg-card/40 p-4 text-center">
                <p className="text-[10px] text-muted-foreground">No user data available. Please try logging in again.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 rounded-xl border border-border/20 bg-card/30 backdrop-blur-sm p-3" style={{ animation: 'rs-card-in 0.5s ease-out 0.8s both' }}>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-relaxed text-center">
              Your emotional wellbeing is our priority. All check-ins are confidential, processed securely, and designed to support your mental health journey.
            </p>
          </div>
          <p className="mt-3 text-center text-[8px] text-muted-foreground/50" style={{ animation: 'rs-card-in 0.4s ease-out 0.9s both' }}>
            Millennia World School • Emotional wellness platform
          </p>
        </div>
      </div>

      <style>{`
        @keyframes rs-card-in {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes rs-blob {
          0%, 100% { transform: scale(1); opacity: 0.04; }
          50% { transform: scale(1.06); opacity: 0.07; }
        }
        @keyframes rs-float {
          from { transform: translateY(0); }
          to { transform: translateY(-6px); }
        }
        .rs-card { transition: transform 0.25s ease, border-color 0.3s ease, box-shadow 0.3s ease; }
        .rs-card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.06); }
      `}</style>
    </div>
  );
});

RoleSelection.displayName = 'RoleSelection';
export default RoleSelection;
