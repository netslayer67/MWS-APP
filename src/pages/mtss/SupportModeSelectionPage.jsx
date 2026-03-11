import { memo, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Brain, Handshake, ArrowRight, Sparkles, Shield, Users } from "lucide-react";
import Logo from "../../components/ui/Millennia.webp";
import gsap from "gsap";
import kidsGroupPhoto from "@/assets/landing/kids-group.jpg";
import "@/pages/styles/support-hub-humanistic.css";

/* Cloudinary base with auto-format & quality */
const CLD = "https://res.cloudinary.com/deldcwiji/image/upload";
const cld = (id, w = 320) => `${CLD}/c_scale,w_${w},f_auto,q_auto/${id}.png`;
const cldJpg = (id, w = 260) => `${CLD}/c_fill,w_${w},h_${Math.round(w * 1.25)},g_face,f_auto,q_auto/${id}.jpg`;
const SHP_ENABLE_FRAMED_CARDS = true;
const SHP_DEFAULT_COLLAGE_VARIANT = "gallery-grid";
const SHP_COLLAGE_VARIANTS_KEYS = ["gallery-grid", "story-arc", "split-columns"];

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

const resolveSupportHubCollageVariant = () => {
  if (typeof window === "undefined") return SHP_DEFAULT_COLLAGE_VARIANT;
  const queryVariant = new URLSearchParams(window.location.search).get("collage");
  if (queryVariant && SHP_COLLAGE_VARIANTS_KEYS.includes(queryVariant)) return queryVariant;
  return SHP_DEFAULT_COLLAGE_VARIANT;
};

const toSlotStyleVars = (slot) => ({
  "--shp-slot-left": slot.left ?? "auto",
  "--shp-slot-right": slot.right ?? "auto",
  "--shp-slot-top": slot.top ?? "auto",
  "--shp-slot-bottom": slot.bottom ?? "auto",
  "--shp-slot-width": slot.width ?? "auto",
  "--shp-slot-height": slot.height ?? "auto",
  "--shp-slot-rotate": slot.rotate ?? "0deg",
  "--shp-slot-opacity": slot.opacity ?? 0.72
});

const slotVisibilityClasses = (slot) => (
  `${slot.hideTablet ? " shp-hide-tablet" : ""}${slot.hideMobile ? " shp-hide-mobile" : ""}`
);

const SHP_COLLAGE_VARIANTS = {
  "gallery-grid": {
    bodyCutouts: [
      { id: "b1", src: cld("FOTO_BG_REMOVE_13_rcunr0", 290), left: "-2.8%", top: "9%", width: "clamp(150px, 12vw, 224px)", height: "clamp(224px, 18vw, 330px)", rotate: "-4deg", opacity: 0.84, depth: 14, aos: "shp-natural-rise", delay: 70, duration: 840, hideMobile: true },
      { id: "b2", src: cld("FOTO_BG_REMOVE_12_yf67be", 255), left: "-2.4%", bottom: "8%", width: "clamp(136px, 11vw, 204px)", height: "clamp(204px, 16vw, 296px)", rotate: "-2deg", opacity: 0.8, depth: 12, aos: "shp-natural-rise", delay: 140, duration: 820, hideMobile: true },
      { id: "b3", src: cld("FOTO_BG_REMOVE_16_jkk3az", 300), right: "-2.8%", top: "9%", width: "clamp(154px, 12vw, 228px)", height: "clamp(228px, 18vw, 336px)", rotate: "3deg", opacity: 0.84, depth: 14, aos: "shp-natural-drift", delay: 100, duration: 860, hideMobile: true },
      { id: "b4", src: cld("FOTO_BG_REMOVE_14_z4vqhb", 250), right: "-2.2%", bottom: "9%", width: "clamp(130px, 10.5vw, 196px)", height: "clamp(196px, 15vw, 286px)", rotate: "2deg", opacity: 0.78, depth: 11, aos: "shp-natural-drift", delay: 180, duration: 820, hideMobile: true },
      { id: "b5", src: cld("FOTO_BG_REMOVE_3_dddiho", 210), left: "calc(50% - 72px)", top: "-1.5%", width: "clamp(110px, 9vw, 152px)", height: "clamp(110px, 9vw, 152px)", rotate: "-1deg", opacity: 0.74, depth: 10, aos: "shp-natural-rise", delay: 120, duration: 780, hideTablet: true, hideMobile: true },
      { id: "b6", src: cld("Group_fqb7b0", 560), left: "calc(50% - 190px)", bottom: "-3.5%", width: "clamp(280px, 28vw, 420px)", height: "clamp(176px, 14vw, 260px)", rotate: "0deg", opacity: 0.72, depth: 8, aos: "shp-natural-rise", delay: 260, duration: 800, hideMobile: true },
    ],
    photoCards: [
      { id: "c1", src: cldJpg("DSC00003_tvepts", 190), left: "2.4%", top: "10%", width: "clamp(88px, 6.8vw, 128px)", height: "clamp(112px, 8.6vw, 168px)", rotate: "-6deg", opacity: 0.74, frameClass: "shp-frame-soft", depth: 10, aos: "shp-card-left", delay: 90, duration: 710 },
      { id: "c2", src: cldJpg("_DSC2984_mxs3ek", 180), left: "2.8%", top: "27%", width: "clamp(86px, 6.6vw, 124px)", height: "clamp(108px, 8.2vw, 162px)", rotate: "4deg", opacity: 0.7, frameClass: "shp-frame-arch", depth: 9, aos: "shp-card-left", delay: 140, duration: 730 },
      { id: "c3", src: cldJpg("DSC02960_vxhqyf", 184), left: "3.3%", top: "45%", width: "clamp(86px, 6.6vw, 124px)", height: "clamp(108px, 8.2vw, 162px)", rotate: "-4deg", opacity: 0.68, frameClass: "shp-frame-post", depth: 10, aos: "shp-card-left", delay: 190, duration: 740 },
      { id: "c4", src: cldJpg("DSC02742_hydsle", 174), left: "4.2%", top: "63%", width: "clamp(82px, 6.2vw, 118px)", height: "clamp(102px, 7.7vw, 150px)", rotate: "3deg", opacity: 0.66, frameClass: "shp-frame-pill", depth: 8, aos: "shp-card-up", delay: 230, duration: 700, hideTablet: true },
      { id: "c5", src: cldJpg("_DSC2191_e25zxe", 188), right: "2.4%", top: "10%", width: "clamp(88px, 6.8vw, 128px)", height: "clamp(112px, 8.6vw, 168px)", rotate: "6deg", opacity: 0.74, frameClass: "shp-frame-soft", depth: 10, aos: "shp-card-right", delay: 90, duration: 710 },
      { id: "c6", src: cldJpg("_DSC0771_r2qevu", 176), right: "2.8%", top: "28%", width: "clamp(84px, 6.4vw, 120px)", height: "clamp(106px, 8vw, 156px)", rotate: "-4deg", opacity: 0.68, frameClass: "shp-frame-arch", depth: 9, aos: "shp-card-right", delay: 150, duration: 740 },
      { id: "c7", src: cldJpg("DSC02918_zzyukf", 182), right: "3.2%", top: "47%", width: "clamp(86px, 6.6vw, 124px)", height: "clamp(108px, 8.2vw, 162px)", rotate: "5deg", opacity: 0.7, frameClass: "shp-frame-post", depth: 10, aos: "shp-card-right", delay: 210, duration: 750 },
      { id: "c8", src: cldJpg("_DSC6357_ualwee", 170), right: "4.2%", top: "65%", width: "clamp(80px, 6vw, 114px)", height: "clamp(100px, 7.4vw, 146px)", rotate: "-2deg", opacity: 0.64, frameClass: "shp-frame-pill", depth: 8, aos: "shp-card-up", delay: 260, duration: 700, hideTablet: true },
      { id: "c9", src: cldJpg("_DSC2637_hx6sl5", 178), left: "14%", top: "3%", width: "clamp(84px, 6.4vw, 120px)", height: "clamp(106px, 8vw, 156px)", rotate: "-3deg", opacity: 0.66, frameClass: "shp-frame-post", depth: 8, aos: "shp-card-left", delay: 180, duration: 720, hideMobile: true },
      { id: "c10", src: cldJpg("_DSC3194_j38tid", 178), right: "14%", top: "4%", width: "clamp(84px, 6.4vw, 120px)", height: "clamp(106px, 8vw, 156px)", rotate: "3deg", opacity: 0.66, frameClass: "shp-frame-post", depth: 8, aos: "shp-card-right", delay: 180, duration: 720, hideMobile: true },
      { id: "c11", src: cldJpg("_DSC5112_yfimk2", 186), left: "16%", bottom: "2%", width: "clamp(88px, 6.8vw, 126px)", height: "clamp(110px, 8.4vw, 164px)", rotate: "3deg", opacity: 0.68, frameClass: "shp-frame-soft", depth: 9, aos: "shp-card-up", delay: 250, duration: 730, hideMobile: true },
      { id: "c12", src: cldJpg("_DSC6037_ghubii", 186), right: "16%", bottom: "2.5%", width: "clamp(88px, 6.8vw, 126px)", height: "clamp(110px, 8.4vw, 164px)", rotate: "-3deg", opacity: 0.68, frameClass: "shp-frame-soft", depth: 9, aos: "shp-card-up", delay: 250, duration: 730, hideMobile: true },
      { id: "c13", src: cldJpg("_DSC5228_kpezcs", 168), left: "34%", top: "2.2%", width: "clamp(78px, 6vw, 112px)", height: "clamp(98px, 7.4vw, 144px)", rotate: "-2deg", opacity: 0.62, frameClass: "shp-frame-pill", depth: 7, aos: "shp-card-left", delay: 300, duration: 690, hideTablet: true },
      { id: "c14", src: cldJpg("DSC02235_1_ez6vbw", 168), right: "34%", top: "2.6%", width: "clamp(78px, 6vw, 112px)", height: "clamp(98px, 7.4vw, 144px)", rotate: "2deg", opacity: 0.62, frameClass: "shp-frame-pill", depth: 7, aos: "shp-card-right", delay: 300, duration: 690, hideTablet: true },
    ],
    accents: [
      { id: "a1", accentClass: "shp-accent-lilac", left: "19%", top: "26%", width: "clamp(96px, 7vw, 136px)", height: "clamp(96px, 7vw, 136px)", opacity: 0.4, depth: 7, aos: "shp-orb-pop", delay: 120, duration: 700 },
      { id: "a2", accentClass: "shp-accent-sky", right: "20%", top: "31%", width: "clamp(104px, 8vw, 144px)", height: "clamp(104px, 8vw, 144px)", opacity: 0.38, depth: 6, aos: "shp-orb-pop", delay: 170, duration: 720 },
      { id: "a3", accentClass: "shp-accent-gold", left: "24%", bottom: "17%", width: "clamp(92px, 7vw, 132px)", height: "clamp(92px, 7vw, 132px)", opacity: 0.34, depth: 6, aos: "shp-orb-pop", delay: 220, duration: 710 },
      { id: "a4", accentClass: "shp-accent-mint", right: "24%", bottom: "14%", width: "clamp(90px, 7vw, 126px)", height: "clamp(90px, 7vw, 126px)", opacity: 0.32, depth: 6, aos: "shp-orb-pop", delay: 260, duration: 740 },
    ]
  },
  "story-arc": {
    bodyCutouts: [
      { id: "b1", src: cld("FOTO_BG_REMOVE_13_rcunr0", 280), left: "-3.2%", top: "14%", width: "clamp(144px, 11.4vw, 214px)", height: "clamp(214px, 17vw, 314px)", rotate: "-5deg", opacity: 0.82, depth: 14, aos: "shp-natural-rise", delay: 70, duration: 830, hideMobile: true },
      { id: "b2", src: cld("FOTO_POTRAIT_1_eom2a8", 246), left: "-2.6%", bottom: "12%", width: "clamp(128px, 10.5vw, 190px)", height: "clamp(190px, 15vw, 278px)", rotate: "-3deg", opacity: 0.76, depth: 11, aos: "shp-natural-rise", delay: 150, duration: 800, hideMobile: true },
      { id: "b3", src: cld("FOTO_BG_REMOVE_16_jkk3az", 292), right: "-3.2%", top: "14%", width: "clamp(146px, 11.8vw, 220px)", height: "clamp(220px, 17.4vw, 324px)", rotate: "4deg", opacity: 0.82, depth: 14, aos: "shp-natural-drift", delay: 90, duration: 850, hideMobile: true },
      { id: "b4", src: cld("FOTO_POTRAIT_krwzwv", 248), right: "-2.4%", bottom: "12%", width: "clamp(128px, 10.3vw, 190px)", height: "clamp(190px, 15vw, 278px)", rotate: "3deg", opacity: 0.76, depth: 11, aos: "shp-natural-drift", delay: 170, duration: 820, hideMobile: true },
      { id: "b5", src: cld("FOTO_BG_REMOVE_3_dddiho", 210), left: "calc(50% - 70px)", top: "-1.2%", width: "clamp(104px, 8.8vw, 146px)", height: "clamp(104px, 8.8vw, 146px)", rotate: "-1deg", opacity: 0.72, depth: 9, aos: "shp-natural-rise", delay: 110, duration: 760, hideTablet: true, hideMobile: true },
      { id: "b6", src: cld("Group_fqb7b0", 520), left: "calc(50% - 176px)", bottom: "-2.8%", width: "clamp(264px, 26vw, 396px)", height: "clamp(168px, 13vw, 244px)", rotate: "0deg", opacity: 0.68, depth: 8, aos: "shp-natural-rise", delay: 250, duration: 780, hideMobile: true },
    ],
    photoCards: [
      { id: "c1", src: cldJpg("DSC01089_dyjmdl", 186), left: "6%", top: "11%", width: "clamp(86px, 6.6vw, 124px)", height: "clamp(108px, 8.2vw, 160px)", rotate: "-7deg", opacity: 0.74, frameClass: "shp-frame-soft", depth: 10, aos: "shp-card-left", delay: 90, duration: 720 },
      { id: "c2", src: cldJpg("DSC01077_uj06xl", 184), left: "20%", top: "6.3%", width: "clamp(84px, 6.4vw, 122px)", height: "clamp(106px, 8vw, 156px)", rotate: "-4deg", opacity: 0.7, frameClass: "shp-frame-arch", depth: 9, aos: "shp-card-left", delay: 130, duration: 730 },
      { id: "c3", src: cldJpg("_DSC5101_ytaseb", 176), left: "34%", top: "4.1%", width: "clamp(80px, 6vw, 116px)", height: "clamp(100px, 7.6vw, 146px)", rotate: "-2deg", opacity: 0.64, frameClass: "shp-frame-pill", depth: 8, aos: "shp-card-up", delay: 170, duration: 700, hideTablet: true },
      { id: "c4", src: cldJpg("DSC02824_f4lypu", 176), right: "34%", top: "4.1%", width: "clamp(80px, 6vw, 116px)", height: "clamp(100px, 7.6vw, 146px)", rotate: "2deg", opacity: 0.64, frameClass: "shp-frame-pill", depth: 8, aos: "shp-card-up", delay: 170, duration: 700, hideTablet: true },
      { id: "c5", src: cldJpg("_DSC5004_exu8ls", 184), right: "20%", top: "6.3%", width: "clamp(84px, 6.4vw, 122px)", height: "clamp(106px, 8vw, 156px)", rotate: "4deg", opacity: 0.7, frameClass: "shp-frame-arch", depth: 9, aos: "shp-card-right", delay: 130, duration: 730 },
      { id: "c6", src: cldJpg("_DSC0930_god7hb", 186), right: "6%", top: "11%", width: "clamp(86px, 6.6vw, 124px)", height: "clamp(108px, 8.2vw, 160px)", rotate: "7deg", opacity: 0.74, frameClass: "shp-frame-soft", depth: 10, aos: "shp-card-right", delay: 90, duration: 720 },
      { id: "c7", src: cldJpg("DSC00809_zo3pu3", 186), left: "8%", bottom: "10.4%", width: "clamp(86px, 6.6vw, 124px)", height: "clamp(108px, 8.2vw, 160px)", rotate: "6deg", opacity: 0.7, frameClass: "shp-frame-soft", depth: 9, aos: "shp-card-left", delay: 210, duration: 730 },
      { id: "c8", src: cldJpg("_DSC9108_bahiwx", 182), left: "22%", bottom: "6.1%", width: "clamp(84px, 6.3vw, 120px)", height: "clamp(104px, 7.8vw, 154px)", rotate: "3deg", opacity: 0.66, frameClass: "shp-frame-post", depth: 8, aos: "shp-card-up", delay: 250, duration: 710 },
      { id: "c9", src: cldJpg("_DSC2703_axyuui", 172), left: "36%", bottom: "3.8%", width: "clamp(78px, 5.8vw, 112px)", height: "clamp(98px, 7.2vw, 142px)", rotate: "1deg", opacity: 0.6, frameClass: "shp-frame-pill", depth: 7, aos: "shp-card-up", delay: 290, duration: 690, hideTablet: true },
      { id: "c10", src: cldJpg("_DSC5047_u4ap4y", 172), right: "36%", bottom: "3.8%", width: "clamp(78px, 5.8vw, 112px)", height: "clamp(98px, 7.2vw, 142px)", rotate: "-1deg", opacity: 0.6, frameClass: "shp-frame-pill", depth: 7, aos: "shp-card-up", delay: 290, duration: 690, hideTablet: true },
      { id: "c11", src: cldJpg("DSC02836_i6uxxk", 182), right: "22%", bottom: "6.1%", width: "clamp(84px, 6.3vw, 120px)", height: "clamp(104px, 7.8vw, 154px)", rotate: "-3deg", opacity: 0.66, frameClass: "shp-frame-post", depth: 8, aos: "shp-card-up", delay: 250, duration: 710 },
      { id: "c12", src: cldJpg("DSC00827_j61n5u", 186), right: "8%", bottom: "10.4%", width: "clamp(86px, 6.6vw, 124px)", height: "clamp(108px, 8.2vw, 160px)", rotate: "-6deg", opacity: 0.7, frameClass: "shp-frame-soft", depth: 9, aos: "shp-card-right", delay: 210, duration: 730 },
    ],
    accents: [
      { id: "a1", accentClass: "shp-accent-lilac", left: "28%", top: "20%", width: "clamp(96px, 7.2vw, 140px)", height: "clamp(96px, 7.2vw, 140px)", opacity: 0.34, depth: 6, aos: "shp-orb-pop", delay: 150, duration: 700 },
      { id: "a2", accentClass: "shp-accent-sky", right: "28%", top: "22%", width: "clamp(98px, 7.4vw, 142px)", height: "clamp(98px, 7.4vw, 142px)", opacity: 0.34, depth: 6, aos: "shp-orb-pop", delay: 190, duration: 720 },
      { id: "a3", accentClass: "shp-accent-gold", left: "30%", bottom: "15%", width: "clamp(92px, 6.8vw, 130px)", height: "clamp(92px, 6.8vw, 130px)", opacity: 0.3, depth: 5, aos: "shp-orb-pop", delay: 220, duration: 710 },
      { id: "a4", accentClass: "shp-accent-mint", right: "30%", bottom: "14%", width: "clamp(90px, 6.6vw, 126px)", height: "clamp(90px, 6.6vw, 126px)", opacity: 0.3, depth: 5, aos: "shp-orb-pop", delay: 260, duration: 740 },
    ]
  },
  "split-columns": {
    bodyCutouts: [
      { id: "b1", src: cld("FOTO_BG_REMOVE_13_rcunr0", 280), left: "-3%", top: "8%", width: "clamp(146px, 11.8vw, 220px)", height: "clamp(220px, 17.8vw, 322px)", rotate: "-3deg", opacity: 0.82, depth: 13, aos: "shp-natural-rise", delay: 70, duration: 830, hideMobile: true },
      { id: "b2", src: cld("FOTO_BG_REMOVE_12_yf67be", 250), left: "-2.2%", bottom: "10%", width: "clamp(130px, 10.4vw, 194px)", height: "clamp(194px, 15.4vw, 286px)", rotate: "-2deg", opacity: 0.78, depth: 11, aos: "shp-natural-rise", delay: 150, duration: 810, hideMobile: true },
      { id: "b3", src: cld("FOTO_BG_REMOVE_16_jkk3az", 296), right: "-3%", top: "8%", width: "clamp(148px, 12vw, 224px)", height: "clamp(224px, 18vw, 330px)", rotate: "3deg", opacity: 0.82, depth: 13, aos: "shp-natural-drift", delay: 90, duration: 850, hideMobile: true },
      { id: "b4", src: cld("FOTO_BG_REMOVE_14_z4vqhb", 248), right: "-2.1%", bottom: "10%", width: "clamp(128px, 10.2vw, 190px)", height: "clamp(190px, 15vw, 278px)", rotate: "2deg", opacity: 0.78, depth: 11, aos: "shp-natural-drift", delay: 170, duration: 820, hideMobile: true },
      { id: "b5", src: cld("FOTO_POTRAIT_krwzwv", 218), left: "calc(50% - 72px)", top: "-1.2%", width: "clamp(108px, 8.8vw, 150px)", height: "clamp(150px, 12vw, 220px)", rotate: "-1deg", opacity: 0.72, depth: 9, aos: "shp-natural-rise", delay: 120, duration: 780, hideTablet: true, hideMobile: true },
      { id: "b6", src: cld("Group_fqb7b0", 520), left: "calc(50% - 176px)", bottom: "-3%", width: "clamp(268px, 26.5vw, 404px)", height: "clamp(170px, 13.5vw, 248px)", rotate: "0deg", opacity: 0.68, depth: 8, aos: "shp-natural-rise", delay: 250, duration: 790, hideMobile: true },
    ],
    photoCards: [
      { id: "c1", src: cldJpg("DSC02438_xmrpss", 188), left: "4.8%", top: "13%", width: "clamp(88px, 6.7vw, 126px)", height: "clamp(110px, 8.4vw, 164px)", rotate: "-4deg", opacity: 0.72, frameClass: "shp-frame-soft", depth: 10, aos: "shp-card-left", delay: 90, duration: 720 },
      { id: "c2", src: cldJpg("DSC02591_zhj4wl", 186), left: "4.8%", top: "27%", width: "clamp(86px, 6.5vw, 124px)", height: "clamp(108px, 8.2vw, 160px)", rotate: "3deg", opacity: 0.7, frameClass: "shp-frame-post", depth: 9, aos: "shp-card-left", delay: 130, duration: 730 },
      { id: "c3", src: cldJpg("DSC02885_tp5c20", 184), left: "4.8%", top: "41%", width: "clamp(84px, 6.4vw, 122px)", height: "clamp(106px, 8vw, 156px)", rotate: "-3deg", opacity: 0.68, frameClass: "shp-frame-arch", depth: 9, aos: "shp-card-left", delay: 170, duration: 740 },
      { id: "c4", src: cldJpg("_DSC0946_gkrc6j", 182), left: "4.8%", top: "55%", width: "clamp(82px, 6.2vw, 118px)", height: "clamp(104px, 7.8vw, 152px)", rotate: "2deg", opacity: 0.66, frameClass: "shp-frame-soft", depth: 8, aos: "shp-card-left", delay: 210, duration: 730 },
      { id: "c5", src: cldJpg("_DSC0866_bug4yo", 178), left: "4.8%", top: "69%", width: "clamp(80px, 6vw, 114px)", height: "clamp(100px, 7.4vw, 146px)", rotate: "-2deg", opacity: 0.64, frameClass: "shp-frame-pill", depth: 8, aos: "shp-card-left", delay: 250, duration: 710, hideTablet: true },
      { id: "c6", src: cldJpg("_DSC6223_hyxdhc", 188), right: "4.8%", top: "13%", width: "clamp(88px, 6.7vw, 126px)", height: "clamp(110px, 8.4vw, 164px)", rotate: "4deg", opacity: 0.72, frameClass: "shp-frame-soft", depth: 10, aos: "shp-card-right", delay: 90, duration: 720 },
      { id: "c7", src: cldJpg("_DSC3895_nh1xco", 186), right: "4.8%", top: "27%", width: "clamp(86px, 6.5vw, 124px)", height: "clamp(108px, 8.2vw, 160px)", rotate: "-3deg", opacity: 0.7, frameClass: "shp-frame-post", depth: 9, aos: "shp-card-right", delay: 130, duration: 730 },
      { id: "c8", src: cldJpg("_DSC1918_oesznt", 184), right: "4.8%", top: "41%", width: "clamp(84px, 6.4vw, 122px)", height: "clamp(106px, 8vw, 156px)", rotate: "3deg", opacity: 0.68, frameClass: "shp-frame-arch", depth: 9, aos: "shp-card-right", delay: 170, duration: 740 },
      { id: "c9", src: cldJpg("_DSC1004_aq9sh4", 182), right: "4.8%", top: "55%", width: "clamp(82px, 6.2vw, 118px)", height: "clamp(104px, 7.8vw, 152px)", rotate: "-2deg", opacity: 0.66, frameClass: "shp-frame-soft", depth: 8, aos: "shp-card-right", delay: 210, duration: 730 },
      { id: "c10", src: cldJpg("_DSC2188_zsxqpn", 178), right: "4.8%", top: "69%", width: "clamp(80px, 6vw, 114px)", height: "clamp(100px, 7.4vw, 146px)", rotate: "2deg", opacity: 0.64, frameClass: "shp-frame-pill", depth: 8, aos: "shp-card-right", delay: 250, duration: 710, hideTablet: true },
      { id: "c11", src: cldJpg("_DSC2186_v7wled", 176), left: "17%", top: "4%", width: "clamp(80px, 6.1vw, 116px)", height: "clamp(100px, 7.6vw, 148px)", rotate: "-3deg", opacity: 0.64, frameClass: "shp-frame-pill", depth: 8, aos: "shp-card-up", delay: 200, duration: 700, hideMobile: true },
      { id: "c12", src: cldJpg("_DSC6547_q6tmgx", 176), right: "17%", top: "4%", width: "clamp(80px, 6.1vw, 116px)", height: "clamp(100px, 7.6vw, 148px)", rotate: "3deg", opacity: 0.64, frameClass: "shp-frame-pill", depth: 8, aos: "shp-card-up", delay: 200, duration: 700, hideMobile: true },
      { id: "c13", src: cldJpg("DSC03249_pzpri4", 176), left: "17%", bottom: "3.2%", width: "clamp(80px, 6.1vw, 116px)", height: "clamp(100px, 7.6vw, 148px)", rotate: "3deg", opacity: 0.64, frameClass: "shp-frame-pill", depth: 8, aos: "shp-card-up", delay: 250, duration: 710, hideMobile: true },
      { id: "c14", src: cldJpg("_DSC2102_thdsq3", 176), right: "17%", bottom: "3.2%", width: "clamp(80px, 6.1vw, 116px)", height: "clamp(100px, 7.6vw, 148px)", rotate: "-3deg", opacity: 0.64, frameClass: "shp-frame-pill", depth: 8, aos: "shp-card-up", delay: 250, duration: 710, hideMobile: true },
    ],
    accents: [
      { id: "a1", accentClass: "shp-accent-lilac", left: "24%", top: "28%", width: "clamp(96px, 7vw, 136px)", height: "clamp(96px, 7vw, 136px)", opacity: 0.34, depth: 6, aos: "shp-orb-pop", delay: 150, duration: 700 },
      { id: "a2", accentClass: "shp-accent-sky", right: "24%", top: "28%", width: "clamp(98px, 7.2vw, 140px)", height: "clamp(98px, 7.2vw, 140px)", opacity: 0.34, depth: 6, aos: "shp-orb-pop", delay: 190, duration: 720 },
      { id: "a3", accentClass: "shp-accent-gold", left: "26%", bottom: "17%", width: "clamp(90px, 6.8vw, 128px)", height: "clamp(90px, 6.8vw, 128px)", opacity: 0.3, depth: 5, aos: "shp-orb-pop", delay: 230, duration: 710 },
      { id: "a4", accentClass: "shp-accent-mint", right: "26%", bottom: "16%", width: "clamp(90px, 6.8vw, 128px)", height: "clamp(90px, 6.8vw, 128px)", opacity: 0.3, depth: 5, aos: "shp-orb-pop", delay: 270, duration: 740 },
    ]
  }
};

const SupportHubPhotoLayer = memo(() => {
  const collageVariant = resolveSupportHubCollageVariant();
  const collage = SHP_COLLAGE_VARIANTS[collageVariant] || SHP_COLLAGE_VARIANTS[SHP_DEFAULT_COLLAGE_VARIANT];

  return (
  <div className={`shp-photo-layer shp-collage--${collageVariant}`} aria-hidden="true">
    <div className="shp-photo-bg" style={{ backgroundImage: `url(${kidsGroupPhoto})` }} />
    <div className="shp-photo-veil" />

    {collage.bodyCutouts.map((item) => (
      <div
        key={item.id}
        className={`shp-body-cutout shp-body-slot${slotVisibilityClasses(item)}`}
        style={toSlotStyleVars(item)}
        data-shp-depth={item.depth}
        data-aos={item.aos}
        data-aos-delay={item.delay}
        data-aos-duration={item.duration}
        data-aos-easing="ease-out-cubic"
      >
        <img
          src={item.src}
          alt=""
          className="shp-body-cutout-img"
          loading="lazy"
          decoding="async"
        />
      </div>
    ))}

    {SHP_ENABLE_FRAMED_CARDS && collage.photoCards.map((item) => (
      <div
        key={item.id}
        className={`shp-photo-card shp-photo-card-slot ${item.frameClass || "shp-frame-soft"}${slotVisibilityClasses(item)}`}
        style={toSlotStyleVars(item)}
        data-shp-depth={item.depth}
        data-aos={item.aos}
        data-aos-delay={item.delay}
        data-aos-duration={item.duration}
        data-aos-easing="ease-out-cubic"
      >
        <img
          src={item.src}
          alt=""
          className="shp-photo-card-img"
          loading="lazy"
          decoding="async"
        />
      </div>
    ))}

    {collage.accents.map((item) => (
      <div
        key={item.id}
        className={`shp-photo-accent shp-photo-accent-slot ${item.accentClass || "shp-accent-lilac"}${slotVisibilityClasses(item)}`}
        style={toSlotStyleVars(item)}
        data-shp-depth={item.depth}
        data-aos={item.aos}
        data-aos-delay={item.delay}
        data-aos-duration={item.duration}
        data-aos-easing="ease-out-cubic"
      />
    ))}
  </div>
  );
});
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

      const bodyCutouts = gsap.utils.toArray(".shp-body-cutout");
      const animatedBody = isCompactViewport ? bodyCutouts.slice(0, 4) : bodyCutouts;

      animatedBody.forEach((node, index) => {
        gsap.to(node, {
          y: index % 2 === 0 ? -8 : -6,
          x: index % 2 === 0 ? 4 : -4,
          duration: 6.5 + index * 0.5,
          delay: ambientEntryDelay + 0.12 + index * 0.08,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          force3D: true
        });
      });

      if (SHP_ENABLE_FRAMED_CARDS) {
        const photoCards = gsap.utils.toArray(".shp-photo-card");
        const animatedCards = isCompactViewport ? photoCards.slice(0, 4) : photoCards.slice(0, 8);

        animatedCards.forEach((node, index) => {
          gsap.to(node, {
            y: index % 2 === 0 ? -5 : -4,
            x: index % 2 === 0 ? 3 : -3,
            rotation: index % 2 === 0 ? 1.5 : -1.5,
            duration: 5.8 + index * 0.4,
            delay: ambientEntryDelay + 0.2 + index * 0.06,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            force3D: true
          });
        });
      }

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

  const OBSERVER_EMAILS = new Set(["mahrukh@millennia21.id", "faisal@millennia21.id"]);
  const ADMIN_ROLES = new Set(['admin', 'superadmin', 'directorate', 'head_unit']);
  const TEACHER_ROLES = new Set(['teacher', 'se_teacher', 'staff', 'support_staff', 'nurse']);

  const handleMtssClick = useCallback(() => {
    const normalizedRole = (user?.role || '').toLowerCase();
    const userEmail = (user?.email || '').toLowerCase().trim();

    if (OBSERVER_EMAILS.has(userEmail) || ADMIN_ROLES.has(normalizedRole)) {
      navigate('/mtss/admin');
      return;
    }
    if (TEACHER_ROLES.has(normalizedRole)) {
      navigate('/mtss/teacher');
      return;
    }
    // fallback — admin dashboard is safer than a 404
    navigate('/mtss/admin');
  }, [navigate, user?.role, user?.email]);

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
