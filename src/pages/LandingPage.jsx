import { memo, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DecorativeBlob from "../components/ui/DecorativeBlob";
import GridPattern from "../components/ui/GridPattern";
import HeroSection from "../components/ui/HeroSection";
import Footer from "../components/ui/Footer";
import InstallButton from "../components/ui/InstallButton";
import kidsGroupPhoto from "@/assets/landing/kids-group.jpg";
import useLandingAnimations from "@/hooks/useLandingAnimations";
import "@/pages/styles/landing-humanistic.css";

const PHOTO_LAYOUT_VARIANT = "clean";

const PHOTO_CUTOUTS = [
  { id: "peek-right", className: "landing-photo-cutout--peek-right", position: "88% 56%", depth: 24 },
  { id: "top-card", className: "landing-photo-cutout--top-card", position: "74% 34%", depth: 19 },
  { id: "left-bubble", className: "landing-photo-cutout--left-bubble", position: "20% 52%", depth: 16 },
  { id: "bottom-bubble", className: "landing-photo-cutout--bottom-bubble", position: "64% 64%", depth: 18 },
  { id: "edge-slice", className: "landing-photo-cutout--edge-slice", position: "86% 40%", depth: 14 },
  { id: "left-pill", className: "landing-photo-cutout--left-pill", position: "12% 58%", depth: 11 },
  { id: "top-badge", className: "landing-photo-cutout--top-badge", position: "46% 26%", depth: 12 },
  { id: "mid-card", className: "landing-photo-cutout--mid-card", position: "60% 48%", depth: 15 },
  { id: "bottom-strip", className: "landing-photo-cutout--bottom-strip", position: "46% 74%", depth: 10 },
  { id: "right-chip", className: "landing-photo-cutout--right-chip", position: "82% 28%", depth: 12 },
];

const PHOTO_ACCENTS = [
  { id: "accent-a", className: "landing-photo-accent--a", depth: 8 },
  { id: "accent-b", className: "landing-photo-accent--b", depth: 12 },
  { id: "accent-c", className: "landing-photo-accent--c", depth: 10 },
];

const HumanisticPhotoLayer = memo(() => (
  <div className="landing-photo-layer landing-gsap-photo-layer" aria-hidden="true">
    <div
      className="landing-photo-bg"
      style={{ backgroundImage: `url(${kidsGroupPhoto})` }}
    />
    <div className="landing-photo-veil" />

    {PHOTO_ACCENTS.map((item) => (
      <div
        key={item.id}
        className={`landing-photo-accent landing-anime-orb ${item.className}`}
        data-landing-depth={item.depth}
      />
    ))}

    {PHOTO_CUTOUTS.map((item) => (
      <div
        key={item.id}
        className={`landing-photo-cutout ${item.className}`}
        data-landing-depth={item.depth}
        style={{ backgroundImage: `url(${kidsGroupPhoto})`, backgroundPosition: item.position }}
      />
    ))}
  </div>
));
HumanisticPhotoLayer.displayName = "HumanisticPhotoLayer";

const FloatingParticles = memo(() => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {Array.from({ length: 12 }, (_, i) => (
      <div
        key={i}
        className="fp-dot landing-anime-dot absolute rounded-full"
        style={{
          width: 4 + (i % 3) * 3,
          height: 4 + (i % 3) * 3,
          left: `${6 + (i * 7.5) % 88}%`,
          top: `${8 + (i * 8.3) % 84}%`,
          background: i % 3 === 0 ? "hsl(var(--primary))" : i % 3 === 1 ? "hsl(var(--gold))" : "hsl(var(--emerald))",
          opacity: 0.2,
        }}
      />
    ))}
  </div>
));
FloatingParticles.displayName = "FloatingParticles";

const LandingPage = memo(function LandingPage() {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useLandingAnimations({ containerRef, variant: PHOTO_LAYOUT_VARIANT });

  useEffect(() => {
    if (!isAuthenticated) return;
    const role = (user?.role || "").toLowerCase();
    if (role === "student") {
      navigate("/profile", { replace: true });
      return;
    }
    navigate("/support-hub", { replace: true });
  }, [isAuthenticated, user, navigate]);

  return (
    <div
      ref={containerRef}
      className={`landing-humanistic-shell landing-variant-${PHOTO_LAYOUT_VARIANT} min-h-screen relative overflow-hidden`}
    >
      <title>MWS IntegraLearn - Premium Education Platform</title>

      <DecorativeBlob variant="primary" className="-top-32 -left-32 md:-top-40 md:-left-40" size="lg" />
      <DecorativeBlob variant="gold" className="top-1/4 -right-24 md:right-1/4" size="md" />
      <DecorativeBlob variant="emerald" className="-bottom-32 left-1/4 md:bottom-1/4 md:left-1/3" size="md" />
      <GridPattern />
      <HumanisticPhotoLayer />
      <FloatingParticles />

      <div className="relative z-20">
        <HeroSection />
        <div data-aos="fade-up" data-aos-delay="120">
          <InstallButton />
        </div>
        <div data-aos="fade-up" data-aos-delay="160">
          <Footer />
        </div>
      </div>
    </div>
  );
});

LandingPage.displayName = "LandingPage";
export default LandingPage;
