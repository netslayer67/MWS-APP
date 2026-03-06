import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DecorativeBlob from "../components/ui/DecorativeBlob";
import GridPattern from "../components/ui/GridPattern";
import HeroSection from "../components/ui/HeroSection";
import Footer from "../components/ui/Footer";
import InstallButton from "../components/ui/InstallButton";
import kidsGroupPhoto from "@/assets/landing/kids-group.jpg";
import {
  MWS_STUDENT_CARD_ASSET_IDS,
  MWS_STUDENT_CUTOUT_ASSET_IDS,
} from "@/data/mwsStudentsDesignAssets";
import useLandingAnimations from "@/hooks/useLandingAnimations";
import "@/pages/styles/landing-humanistic.css";

const CLD_BASE = "https://res.cloudinary.com/deldcwiji/image/upload";
const cardPhoto = (id, w = 280, h = 190) => `${CLD_BASE}/c_fill,w_${w},h_${h},g_auto,f_auto,q_auto/${id}`;
const cutoutPhoto = (id, w = 340) => `${CLD_BASE}/c_scale,w_${w},f_auto,q_auto/${id}`;

const PHOTO_LAYOUT_VARIANT = "hybrid";

const CARD_SIZE_PRESETS = {
  landscape: { w: 360, h: 236 },
  portrait: { w: 300, h: 410 },
  square: { w: 320, h: 320 },
};

const PHOTO_FRAME_SLOTS = [
  { id: "portrait-left", type: "cutout", className: "landing-photo-frame--portrait-left", depth: 15, width: 380 },
  { id: "portrait-right", type: "cutout", className: "landing-photo-frame--portrait-right", depth: 15, width: 380 },
  { id: "top-left", type: "card", className: "landing-photo-frame--top-left", depth: 10, preset: "landscape" },
  { id: "top-center", type: "card", className: "landing-photo-frame--top-center", depth: 8, preset: "landscape" },
  { id: "top-right", type: "card", className: "landing-photo-frame--top-right", depth: 10, preset: "landscape" },
  { id: "left-mid", type: "card", className: "landing-photo-frame--left-mid", depth: 11, preset: "portrait" },
  { id: "left-bottom", type: "card", className: "landing-photo-frame--left-bottom", depth: 8, preset: "square" },
  { id: "right-mid", type: "card", className: "landing-photo-frame--right-mid", depth: 11, preset: "portrait" },
  { id: "right-low", type: "card", className: "landing-photo-frame--right-low", depth: 8, preset: "square" },
  { id: "bottom-left", type: "card", className: "landing-photo-frame--bottom-left", depth: 7, preset: "landscape" },
  { id: "bottom-right", type: "card", className: "landing-photo-frame--bottom-right", depth: 7, preset: "landscape" },
];

const hashString = (value = "") => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const seededShuffle = (items, seedBase = 1) => {
  const next = [...items];
  let seed = (Math.abs(seedBase) % 2147483647) || 1;
  const random = () => {
    seed = (seed * 48271) % 2147483647;
    return seed / 2147483647;
  };

  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }

  return next;
};

const HumanisticPhotoLayer = memo(() => {
  const dayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const daySeed = useMemo(() => hashString(`landing-hybrid-gallery:${dayKey}`), [dayKey]);

  const cardDeck = useMemo(
    () => seededShuffle(MWS_STUDENT_CARD_ASSET_IDS, daySeed + 29),
    [daySeed],
  );
  const cutoutDeck = useMemo(
    () => seededShuffle(MWS_STUDENT_CUTOUT_ASSET_IDS, daySeed + 79),
    [daySeed],
  );

  const frameDeck = useMemo(() => {
    let cardCursor = 2;
    let cutoutCursor = 0;
    return PHOTO_FRAME_SLOTS.map((slot) => {
      if (slot.type === "cutout") {
        const assetId = cutoutDeck[cutoutCursor % cutoutDeck.length];
        cutoutCursor += 1;
        return {
          ...slot,
          src: cutoutPhoto(assetId, slot.width || 340),
        };
      }

      const assetId = cardDeck[cardCursor % cardDeck.length];
      cardCursor += 1;
      const preset = CARD_SIZE_PRESETS[slot.preset] || CARD_SIZE_PRESETS.landscape;
      return {
        ...slot,
        src: cardPhoto(assetId, preset.w, preset.h),
      };
    });
  }, [cardDeck, cutoutDeck]);

  const backgroundPrimary = useMemo(
    () => cardPhoto(cardDeck[0] || MWS_STUDENT_CARD_ASSET_IDS[0], 2048, 1260),
    [cardDeck],
  );
  const backgroundSecondary = useMemo(
    () => cardPhoto(cardDeck[1] || MWS_STUDENT_CARD_ASSET_IDS[1], 1920, 1220),
    [cardDeck],
  );

  const applyFallback = useCallback((event) => {
    if (event.currentTarget.dataset.fallback === "1") return;
    event.currentTarget.dataset.fallback = "1";
    event.currentTarget.src = kidsGroupPhoto;
  }, []);

  return (
    <div className="landing-photo-layer landing-gsap-photo-layer" aria-hidden="true">
      <div className="landing-photo-bg landing-photo-bg--primary" style={{ backgroundImage: `url(${backgroundPrimary})` }} />
      <div className="landing-photo-bg landing-photo-bg--secondary" style={{ backgroundImage: `url(${backgroundSecondary})` }} />
      <div className="landing-photo-veil" />
      <div className="landing-photo-mesh" />

      {frameDeck.map((slot, index) => (
        <figure
          key={slot.id}
          className={`landing-photo-cutout landing-photo-frame landing-anime-frame ${slot.className} ${slot.type === "cutout" ? "landing-photo-frame--cutout" : "landing-photo-frame--card"}`}
          data-landing-depth={slot.depth}
          data-aos={["fade-up-right", "zoom-in-up", "fade-up-left", "zoom-in"][index % 4]}
          data-aos-delay={70 + (index * 26)}
          data-aos-duration={640 + ((index % 4) * 70)}
          data-aos-easing="ease-out-cubic"
          data-aos-anchor-placement="top-bottom"
        >
          <img className="landing-anime-frame-media" src={slot.src} alt="" loading="lazy" decoding="async" onError={applyFallback} />
        </figure>
      ))}

      <div
        className="landing-photo-halo landing-photo-halo--left landing-anime-orb"
        data-landing-depth={8}
        data-aos="zoom-in"
        data-aos-delay="120"
        data-aos-duration="700"
      />
      <div
        className="landing-photo-halo landing-photo-halo--right landing-anime-orb"
        data-landing-depth={9}
        data-aos="zoom-in"
        data-aos-delay="180"
        data-aos-duration="760"
      />
      <div
        className="landing-photo-halo landing-photo-halo--bottom landing-anime-orb"
        data-landing-depth={7}
        data-aos="zoom-in"
        data-aos-delay="220"
        data-aos-duration="720"
      />
    </div>
  );
});
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
