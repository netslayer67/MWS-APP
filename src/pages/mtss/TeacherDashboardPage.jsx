import { memo, useCallback, useEffect, useRef, useState } from "react";
import { fieldClasses, tabs } from "./data/teacherDashboardContent";
import { useTeacherDashboardState } from "./hooks/useTeacherDashboardState";
import useTeacherDashboardData from "./hooks/useTeacherDashboardData";
import TeacherHeroSection from "./teacher/TeacherHeroSection";
import { useToast } from "@/components/ui/use-toast";
import PageLoader from "@/components/PageLoader";
import { useNavigate } from "react-router-dom";
import QuickUpdateModal from "./components/QuickUpdateModal";
import TeacherDashboardPanels from "./components/TeacherDashboardPanels";
import TeacherDashboardStatus from "./components/TeacherDashboardStatus";
import useTeacherDashboardActions from "./hooks/useTeacherDashboardActions";
import gsap from "gsap";
import { animate, stagger } from "animejs";
import "@/pages/styles/teacher-dashboard-collage.css";

const CLD = "https://res.cloudinary.com/deldcwiji/image/upload";
const cldCard = (id, w = 220, h = 300) => `${CLD}/c_fill,w_${w},h_${h},g_auto,f_auto,q_auto/${id}.jpg`;
const cldCutout = (id, w = 360) => `${CLD}/c_scale,w_${w},f_auto,q_auto/${id}.png`;

const TD_DEFAULT_COLLAGE_VARIANT = "studio-grid";
const TD_COLLAGE_VARIANTS = ["studio-grid", "ribbon-flow", "spotlight-bands", "true-body-cutout"];

const resolveTeacherCollageVariant = () => {
    if (typeof window === "undefined") return TD_DEFAULT_COLLAGE_VARIANT;
    const queryVariant = new URLSearchParams(window.location.search).get("collage");
    if (queryVariant && TD_COLLAGE_VARIANTS.includes(queryVariant)) return queryVariant;
    return TD_DEFAULT_COLLAGE_VARIANT;
};

const TD_PHOTOS = {
    p1: cldCard("_DSC6511_o5ixax", 236, 168),
    p2: cldCard("DSC01262_ecrqjo", 176, 242),
    p3: cldCard("DSC01600_1_shhpvm", 236, 168),
    p4: cldCard("_DSC1913_nrykxi", 176, 242),
    p5: cldCard("_DSC4119_q2zwxm", 236, 168),
    p6: cldCard("_DSC5013_hdy4hk", 236, 168),
    p7: cldCard("DSC02855_itlyr4", 176, 242),
    p8: cldCard("DSC02265_qur57o", 176, 242),
    p9: cldCard("DSC02257_yfifgc", 238, 170),
    p10: cldCard("DSC05858_mlpmrb", 176, 242),
    p11: cldCard("DSC03183_1_if84ty", 236, 168),
    p12: cldCard("DSC04089_ijnjja", 176, 242),
    p13: cldCard("DSC05813_hulxbk", 176, 242),
    p14: cldCard("DSC02856_dg3r2k", 238, 170),
    p15: cldCard("DSC02434_ecaltk", 238, 170),
    p16: cldCard("DSC02322_kzw3p2", 176, 242),
    p17: cldCard("DSC05532_nbwmhd", 176, 242),
    p18: cldCard("DSC05021_jl4aso", 176, 242),
    p19: cldCard("DSC05832_bxaydm", 238, 170),
    p20: cldCard("DSC04921_1_ijabca", 238, 170),
    p21: cldCard("DSC05455_egjtik", 238, 170),
    p22: cldCard("DSC05892_hwmy6h", 176, 242),
    p23: cldCard("DSC05740_woedp5", 176, 242),
    p24: cldCard("DSC00264_1_c7rbu1", 238, 170),
};

const TD_SILHOUETTES = {
    b1: cldCutout("FOTO_11_o1l32q", 320),
    b2: cldCutout("FOTO_2_lbcull", 360),
    b3: cldCutout("FOTO_10_noxm2x", 360),
    b4: cldCutout("FOTO_12_q1wuf4", 340),
};

const slotStyleVars = (slot) => ({
    "--tdc-left": slot.left ?? "auto",
    "--tdc-right": slot.right ?? "auto",
    "--tdc-top": slot.top ?? "auto",
    "--tdc-bottom": slot.bottom ?? "auto",
    "--tdc-width": slot.width ?? "auto",
    "--tdc-height": slot.height ?? "auto",
    "--tdc-rotate": slot.rotate ?? "0deg",
    "--tdc-opacity": slot.opacity ?? 0.66,
    "--tdc-float-x": slot.floatX ?? "6px",
    "--tdc-float-y": slot.floatY ?? "10px",
    "--tdc-duration": slot.duration ?? "9.2s",
    "--tdc-delay": slot.floatDelay ?? "0s",
});

const slotVisibilityClasses = (slot) => (
    `${slot.hideTablet ? " tdc-hide-tablet" : ""}${slot.hideMobile ? " tdc-hide-mobile" : ""}`
);

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
    return Number.isFinite(parsed) ? parsed : 10;
};

const TD_COLLAGE_LAYOUTS = {
    "studio-grid": {
        cards: [
            { id: "c1", src: TD_PHOTOS.p2, left: "1.8%", top: "8%", width: "clamp(82px, 6.2vw, 118px)", height: "clamp(108px, 8.2vw, 156px)", rotate: "-6deg", opacity: 0.72, floatX: "5px", floatY: "8px", duration: "9.4s", floatDelay: "0.2s", frameClass: "tdc-frame-soft", depth: 11, aos: "tdc-left", delay: 120, durationAos: 760 },
            { id: "c2", src: TD_PHOTOS.p4, left: "1.6%", top: "24%", width: "clamp(80px, 6vw, 114px)", height: "clamp(104px, 7.8vw, 150px)", rotate: "5deg", opacity: 0.68, floatX: "6px", floatY: "10px", duration: "10s", floatDelay: "0.35s", frameClass: "tdc-frame-arch", depth: 10, aos: "tdc-left", delay: 170, durationAos: 760 },
            { id: "c3", src: TD_PHOTOS.p10, left: "2.2%", top: "42%", width: "clamp(78px, 5.8vw, 110px)", height: "clamp(100px, 7.4vw, 144px)", rotate: "-4deg", opacity: 0.66, floatX: "4px", floatY: "8px", duration: "8.8s", floatDelay: "0.1s", frameClass: "tdc-frame-post", depth: 9, aos: "tdc-left", delay: 220, durationAos: 740 },
            { id: "c4", src: TD_PHOTOS.p12, left: "2.3%", top: "60%", width: "clamp(78px, 5.8vw, 110px)", height: "clamp(100px, 7.4vw, 144px)", rotate: "3deg", opacity: 0.64, floatX: "4px", floatY: "7px", duration: "9.6s", floatDelay: "0.5s", frameClass: "tdc-frame-soft", depth: 8, aos: "tdc-up", delay: 270, durationAos: 730, hideTablet: true },
            { id: "c5", src: TD_PHOTOS.p22, left: "2.6%", top: "76%", width: "clamp(76px, 5.6vw, 106px)", height: "clamp(96px, 7vw, 138px)", rotate: "-2deg", opacity: 0.62, floatX: "4px", floatY: "7px", duration: "8.9s", floatDelay: "0.4s", frameClass: "tdc-frame-pill", depth: 8, aos: "tdc-up", delay: 310, durationAos: 720, hideTablet: true },

            { id: "c6", src: TD_PHOTOS.p7, right: "1.8%", top: "8%", width: "clamp(82px, 6.2vw, 118px)", height: "clamp(108px, 8.2vw, 156px)", rotate: "6deg", opacity: 0.72, floatX: "-5px", floatY: "8px", duration: "9.4s", floatDelay: "0.2s", frameClass: "tdc-frame-soft", depth: 11, aos: "tdc-right", delay: 120, durationAos: 760 },
            { id: "c7", src: TD_PHOTOS.p8, right: "1.6%", top: "24%", width: "clamp(80px, 6vw, 114px)", height: "clamp(104px, 7.8vw, 150px)", rotate: "-5deg", opacity: 0.68, floatX: "-6px", floatY: "10px", duration: "10s", floatDelay: "0.35s", frameClass: "tdc-frame-arch", depth: 10, aos: "tdc-right", delay: 170, durationAos: 760 },
            { id: "c8", src: TD_PHOTOS.p13, right: "2.2%", top: "42%", width: "clamp(78px, 5.8vw, 110px)", height: "clamp(100px, 7.4vw, 144px)", rotate: "4deg", opacity: 0.66, floatX: "-4px", floatY: "8px", duration: "8.8s", floatDelay: "0.1s", frameClass: "tdc-frame-post", depth: 9, aos: "tdc-right", delay: 220, durationAos: 740 },
            { id: "c9", src: TD_PHOTOS.p16, right: "2.3%", top: "60%", width: "clamp(78px, 5.8vw, 110px)", height: "clamp(100px, 7.4vw, 144px)", rotate: "-3deg", opacity: 0.64, floatX: "-4px", floatY: "7px", duration: "9.6s", floatDelay: "0.5s", frameClass: "tdc-frame-soft", depth: 8, aos: "tdc-up", delay: 270, durationAos: 730, hideTablet: true },
            { id: "c10", src: TD_PHOTOS.p23, right: "2.6%", top: "76%", width: "clamp(76px, 5.6vw, 106px)", height: "clamp(96px, 7vw, 138px)", rotate: "2deg", opacity: 0.62, floatX: "-4px", floatY: "7px", duration: "8.9s", floatDelay: "0.4s", frameClass: "tdc-frame-pill", depth: 8, aos: "tdc-up", delay: 310, durationAos: 720, hideTablet: true },

            { id: "c11", src: TD_PHOTOS.p1, left: "14%", top: "2.6%", width: "clamp(110px, 8.6vw, 156px)", height: "clamp(76px, 5.8vw, 110px)", rotate: "-4deg", opacity: 0.64, floatX: "4px", floatY: "6px", duration: "10.5s", frameClass: "tdc-frame-post", depth: 8, aos: "tdc-up", delay: 190, durationAos: 700, hideMobile: true },
            { id: "c12", src: TD_PHOTOS.p5, right: "14%", top: "2.6%", width: "clamp(110px, 8.6vw, 156px)", height: "clamp(76px, 5.8vw, 110px)", rotate: "4deg", opacity: 0.64, floatX: "-4px", floatY: "6px", duration: "10.5s", frameClass: "tdc-frame-post", depth: 8, aos: "tdc-up", delay: 190, durationAos: 700, hideMobile: true },
            { id: "c13", src: TD_PHOTOS.p24, left: "18%", bottom: "3.2%", width: "clamp(116px, 9vw, 164px)", height: "clamp(80px, 6vw, 116px)", rotate: "3deg", opacity: 0.62, floatX: "4px", floatY: "7px", duration: "9.8s", frameClass: "tdc-frame-soft", depth: 7, aos: "tdc-up", delay: 260, durationAos: 700, hideMobile: true },
            { id: "c14", src: TD_PHOTOS.p21, right: "18%", bottom: "3.2%", width: "clamp(116px, 9vw, 164px)", height: "clamp(80px, 6vw, 116px)", rotate: "-3deg", opacity: 0.62, floatX: "-4px", floatY: "7px", duration: "9.8s", frameClass: "tdc-frame-soft", depth: 7, aos: "tdc-up", delay: 260, durationAos: 700, hideMobile: true },

            /* Extra side rails: richer left/right collage so center content stays clear */
            { id: "c15", src: TD_PHOTOS.p17, left: "0.7%", top: "14%", width: "clamp(74px, 5.4vw, 102px)", height: "clamp(96px, 7vw, 136px)", rotate: "-7deg", opacity: 0.7, floatX: "4px", floatY: "8px", duration: "9.1s", frameClass: "tdc-frame-arch", styleType: "cutout", cutoutShape: "organic-a", depth: 12, aos: "tdc-flip-pop", delay: 120, durationAos: 820 },
            { id: "c16", src: TD_PHOTOS.p18, left: "0.6%", top: "33%", width: "clamp(72px, 5.2vw, 98px)", height: "clamp(92px, 6.8vw, 132px)", rotate: "5deg", opacity: 0.68, floatX: "4px", floatY: "7px", duration: "8.8s", frameClass: "tdc-frame-post", styleType: "cutout", cutoutShape: "organic-b", depth: 11, aos: "tdc-flip-pop", delay: 170, durationAos: 820 },
            { id: "c17", src: TD_PHOTOS.p3, left: "0.8%", top: "52%", width: "clamp(98px, 7.2vw, 138px)", height: "clamp(68px, 5.2vw, 100px)", rotate: "-4deg", opacity: 0.66, floatX: "4px", floatY: "6px", duration: "9.4s", frameClass: "tdc-frame-soft", depth: 10, aos: "tdc-left", delay: 210, durationAos: 740, hideMobile: true },
            { id: "c18", src: TD_PHOTOS.p14, left: "0.7%", top: "69%", width: "clamp(96px, 7vw, 134px)", height: "clamp(66px, 5vw, 96px)", rotate: "3deg", opacity: 0.64, floatX: "4px", floatY: "6px", duration: "8.7s", frameClass: "tdc-frame-pill", depth: 10, aos: "tdc-up", delay: 250, durationAos: 720, hideMobile: true },
            { id: "c19", src: TD_PHOTOS.p19, left: "0.8%", bottom: "3.8%", width: "clamp(104px, 7.8vw, 146px)", height: "clamp(70px, 5.4vw, 104px)", rotate: "-2deg", opacity: 0.62, floatX: "4px", floatY: "6px", duration: "9.2s", frameClass: "tdc-frame-soft", depth: 10, aos: "tdc-up", delay: 290, durationAos: 710, hideTablet: true },

            { id: "c20", src: TD_PHOTOS.p2, right: "0.7%", top: "14%", width: "clamp(74px, 5.4vw, 102px)", height: "clamp(96px, 7vw, 136px)", rotate: "7deg", opacity: 0.7, floatX: "-4px", floatY: "8px", duration: "9.1s", frameClass: "tdc-frame-arch", styleType: "cutout", cutoutShape: "organic-c", depth: 12, aos: "tdc-flip-pop", delay: 120, durationAos: 820 },
            { id: "c21", src: TD_PHOTOS.p4, right: "0.6%", top: "33%", width: "clamp(72px, 5.2vw, 98px)", height: "clamp(92px, 6.8vw, 132px)", rotate: "-5deg", opacity: 0.68, floatX: "-4px", floatY: "7px", duration: "8.8s", frameClass: "tdc-frame-post", styleType: "cutout", cutoutShape: "organic-d", depth: 11, aos: "tdc-flip-pop", delay: 170, durationAos: 820 },
            { id: "c22", src: TD_PHOTOS.p6, right: "0.8%", top: "52%", width: "clamp(98px, 7.2vw, 138px)", height: "clamp(68px, 5.2vw, 100px)", rotate: "4deg", opacity: 0.66, floatX: "-4px", floatY: "6px", duration: "9.4s", frameClass: "tdc-frame-soft", depth: 10, aos: "tdc-right", delay: 210, durationAos: 740, hideMobile: true },
            { id: "c23", src: TD_PHOTOS.p15, right: "0.7%", top: "69%", width: "clamp(96px, 7vw, 134px)", height: "clamp(66px, 5vw, 96px)", rotate: "-3deg", opacity: 0.64, floatX: "-4px", floatY: "6px", duration: "8.7s", frameClass: "tdc-frame-pill", depth: 10, aos: "tdc-up", delay: 250, durationAos: 720, hideMobile: true },
            { id: "c24", src: TD_PHOTOS.p20, right: "0.8%", bottom: "3.8%", width: "clamp(104px, 7.8vw, 146px)", height: "clamp(70px, 5.4vw, 104px)", rotate: "2deg", opacity: 0.62, floatX: "-4px", floatY: "6px", duration: "9.2s", frameClass: "tdc-frame-soft", depth: 10, aos: "tdc-up", delay: 290, durationAos: 710, hideTablet: true },

            /* True body silhouette cutouts (main humanistic highlights, lightweight set) */
            { id: "c25", src: TD_SILHOUETTES.b1, left: "2.2%", top: "9%", width: "clamp(128px, 9vw, 184px)", height: "clamp(170px, 12.6vw, 252px)", rotate: "-5deg", opacity: 0.8, styleType: "silhouette", depth: 14, aos: "tdc-body-rise", delay: 130, durationAos: 860 },
            { id: "c26", src: TD_SILHOUETTES.b2, left: "1.6%", bottom: "6.2%", width: "clamp(146px, 10.2vw, 210px)", height: "clamp(110px, 7.8vw, 164px)", rotate: "-6deg", opacity: 0.78, styleType: "silhouette", depth: 13, aos: "tdc-body-drift", delay: 190, durationAos: 880, hideMobile: true },
            { id: "c27", src: TD_SILHOUETTES.b3, right: "2.2%", top: "10%", width: "clamp(138px, 9.8vw, 206px)", height: "clamp(124px, 8.8vw, 182px)", rotate: "6deg", opacity: 0.82, styleType: "silhouette", depth: 14, aos: "tdc-body-rise", delay: 140, durationAos: 860 },
            { id: "c28", src: TD_SILHOUETTES.b4, right: "1.5%", bottom: "6.5%", width: "clamp(154px, 10.8vw, 224px)", height: "clamp(128px, 9vw, 190px)", rotate: "4deg", opacity: 0.78, styleType: "silhouette", depth: 13, aos: "tdc-body-drift", delay: 210, durationAos: 890, hideMobile: true },
        ],
        accents: [
            { id: "a1", accentClass: "tdc-accent-lilac", left: "9%", top: "16%", width: "clamp(92px, 7.2vw, 134px)", height: "clamp(92px, 7.2vw, 134px)", opacity: 0.32, depth: 6, aos: "tdc-orb", delay: 170, durationAos: 740, hideMobile: true },
            { id: "a2", accentClass: "tdc-accent-sky", right: "10%", top: "20%", width: "clamp(96px, 7.4vw, 140px)", height: "clamp(96px, 7.4vw, 140px)", opacity: 0.3, depth: 6, aos: "tdc-orb", delay: 220, durationAos: 760, hideMobile: true },
            { id: "a3", accentClass: "tdc-accent-gold", left: "13%", bottom: "17%", width: "clamp(84px, 6.4vw, 122px)", height: "clamp(84px, 6.4vw, 122px)", opacity: 0.28, depth: 5, aos: "tdc-orb", delay: 260, durationAos: 720, hideTablet: true },
            { id: "a4", accentClass: "tdc-accent-mint", right: "14%", bottom: "15%", width: "clamp(82px, 6.2vw, 118px)", height: "clamp(82px, 6.2vw, 118px)", opacity: 0.26, depth: 5, aos: "tdc-orb", delay: 300, durationAos: 720, hideTablet: true },
            { id: "a5", accentClass: "tdc-accent-lilac", left: "3.8%", top: "48%", width: "clamp(66px, 5.2vw, 98px)", height: "clamp(66px, 5.2vw, 98px)", opacity: 0.3, depth: 7, aos: "tdc-orb", delay: 220, durationAos: 700 },
            { id: "a6", accentClass: "tdc-accent-sky", right: "3.8%", top: "50%", width: "clamp(66px, 5.2vw, 98px)", height: "clamp(66px, 5.2vw, 98px)", opacity: 0.3, depth: 7, aos: "tdc-orb", delay: 240, durationAos: 700 },
        ],
    },
    "ribbon-flow": {
        cards: [
            { id: "c1", src: TD_PHOTOS.p3, left: "4.5%", top: "7%", width: "clamp(106px, 8.2vw, 150px)", height: "clamp(74px, 5.6vw, 108px)", rotate: "-8deg", opacity: 0.68, floatX: "5px", floatY: "8px", duration: "10.2s", frameClass: "tdc-frame-post", depth: 10, aos: "tdc-left", delay: 120, durationAos: 760 },
            { id: "c2", src: TD_PHOTOS.p6, left: "12%", top: "18%", width: "clamp(104px, 8vw, 148px)", height: "clamp(72px, 5.4vw, 106px)", rotate: "-5deg", opacity: 0.66, floatX: "5px", floatY: "7px", duration: "9.6s", frameClass: "tdc-frame-soft", depth: 9, aos: "tdc-left", delay: 170, durationAos: 740 },
            { id: "c3", src: TD_PHOTOS.p9, left: "20%", top: "30%", width: "clamp(106px, 8.2vw, 150px)", height: "clamp(74px, 5.6vw, 108px)", rotate: "-3deg", opacity: 0.64, floatX: "4px", floatY: "7px", duration: "9.1s", frameClass: "tdc-frame-post", depth: 8, aos: "tdc-up", delay: 220, durationAos: 730 },
            { id: "c4", src: TD_PHOTOS.p11, left: "28%", top: "43%", width: "clamp(106px, 8.2vw, 150px)", height: "clamp(74px, 5.6vw, 108px)", rotate: "0deg", opacity: 0.62, floatX: "4px", floatY: "7px", duration: "9.8s", frameClass: "tdc-frame-arch", depth: 8, aos: "tdc-up", delay: 260, durationAos: 720 },
            { id: "c5", src: TD_PHOTOS.p14, left: "37%", top: "55%", width: "clamp(106px, 8.2vw, 150px)", height: "clamp(74px, 5.6vw, 108px)", rotate: "3deg", opacity: 0.62, floatX: "4px", floatY: "7px", duration: "9.6s", frameClass: "tdc-frame-soft", depth: 8, aos: "tdc-up", delay: 300, durationAos: 720, hideTablet: true },
            { id: "c6", src: TD_PHOTOS.p15, left: "46%", top: "66%", width: "clamp(106px, 8.2vw, 150px)", height: "clamp(74px, 5.6vw, 108px)", rotate: "6deg", opacity: 0.6, floatX: "4px", floatY: "7px", duration: "9.2s", frameClass: "tdc-frame-pill", depth: 7, aos: "tdc-up", delay: 340, durationAos: 700, hideTablet: true },
            { id: "c7", src: TD_PHOTOS.p17, right: "6.5%", top: "13%", width: "clamp(80px, 6vw, 114px)", height: "clamp(104px, 7.8vw, 150px)", rotate: "7deg", opacity: 0.68, floatX: "-5px", floatY: "9px", duration: "9.9s", frameClass: "tdc-frame-soft", depth: 10, aos: "tdc-right", delay: 150, durationAos: 760 },
            { id: "c8", src: TD_PHOTOS.p18, right: "8.4%", top: "33%", width: "clamp(80px, 6vw, 114px)", height: "clamp(104px, 7.8vw, 150px)", rotate: "4deg", opacity: 0.66, floatX: "-5px", floatY: "8px", duration: "9.1s", frameClass: "tdc-frame-arch", depth: 9, aos: "tdc-right", delay: 210, durationAos: 740 },
            { id: "c9", src: TD_PHOTOS.p23, right: "10.2%", top: "52%", width: "clamp(78px, 5.8vw, 110px)", height: "clamp(100px, 7.4vw, 144px)", rotate: "1deg", opacity: 0.64, floatX: "-4px", floatY: "7px", duration: "8.9s", frameClass: "tdc-frame-post", depth: 8, aos: "tdc-right", delay: 260, durationAos: 730 },
            { id: "c10", src: TD_PHOTOS.p22, right: "12%", top: "70%", width: "clamp(76px, 5.6vw, 106px)", height: "clamp(96px, 7vw, 138px)", rotate: "-2deg", opacity: 0.62, floatX: "-4px", floatY: "7px", duration: "8.8s", frameClass: "tdc-frame-pill", depth: 7, aos: "tdc-up", delay: 300, durationAos: 710, hideTablet: true },
        ],
        accents: [
            { id: "a1", accentClass: "tdc-accent-lilac", left: "20%", top: "17%", width: "clamp(98px, 7.6vw, 142px)", height: "clamp(98px, 7.6vw, 142px)", opacity: 0.28, depth: 6, aos: "tdc-orb", delay: 180, durationAos: 760, hideMobile: true },
            { id: "a2", accentClass: "tdc-accent-sky", right: "16%", top: "47%", width: "clamp(90px, 7vw, 130px)", height: "clamp(90px, 7vw, 130px)", opacity: 0.28, depth: 5, aos: "tdc-orb", delay: 230, durationAos: 740, hideMobile: true },
            { id: "a3", accentClass: "tdc-accent-gold", left: "42%", bottom: "17%", width: "clamp(84px, 6.2vw, 120px)", height: "clamp(84px, 6.2vw, 120px)", opacity: 0.24, depth: 5, aos: "tdc-orb", delay: 280, durationAos: 720, hideTablet: true },
        ],
    },
    "spotlight-bands": {
        cards: [
            { id: "c1", src: TD_PHOTOS.p19, left: "8%", top: "5%", width: "clamp(108px, 8.4vw, 154px)", height: "clamp(76px, 5.8vw, 110px)", rotate: "-5deg", opacity: 0.66, frameClass: "tdc-frame-soft", depth: 9, aos: "tdc-left", delay: 120, durationAos: 740 },
            { id: "c2", src: TD_PHOTOS.p20, left: "24%", top: "5.4%", width: "clamp(108px, 8.4vw, 154px)", height: "clamp(76px, 5.8vw, 110px)", rotate: "-2deg", opacity: 0.64, frameClass: "tdc-frame-post", depth: 8, aos: "tdc-up", delay: 160, durationAos: 730 },
            { id: "c3", src: TD_PHOTOS.p24, right: "24%", top: "5.4%", width: "clamp(108px, 8.4vw, 154px)", height: "clamp(76px, 5.8vw, 110px)", rotate: "2deg", opacity: 0.64, frameClass: "tdc-frame-post", depth: 8, aos: "tdc-up", delay: 160, durationAos: 730 },
            { id: "c4", src: TD_PHOTOS.p21, right: "8%", top: "5%", width: "clamp(108px, 8.4vw, 154px)", height: "clamp(76px, 5.8vw, 110px)", rotate: "5deg", opacity: 0.66, frameClass: "tdc-frame-soft", depth: 9, aos: "tdc-right", delay: 120, durationAos: 740 },
            { id: "c5", src: TD_PHOTOS.p2, left: "4%", top: "26%", width: "clamp(82px, 6.1vw, 116px)", height: "clamp(106px, 7.9vw, 152px)", rotate: "-4deg", opacity: 0.68, frameClass: "tdc-frame-arch", depth: 10, aos: "tdc-left", delay: 210, durationAos: 740 },
            { id: "c6", src: TD_PHOTOS.p4, left: "4.5%", top: "49%", width: "clamp(80px, 5.9vw, 112px)", height: "clamp(102px, 7.5vw, 146px)", rotate: "3deg", opacity: 0.64, frameClass: "tdc-frame-soft", depth: 8, aos: "tdc-left", delay: 250, durationAos: 720 },
            { id: "c7", src: TD_PHOTOS.p10, right: "4%", top: "26%", width: "clamp(82px, 6.1vw, 116px)", height: "clamp(106px, 7.9vw, 152px)", rotate: "4deg", opacity: 0.68, frameClass: "tdc-frame-arch", depth: 10, aos: "tdc-right", delay: 210, durationAos: 740 },
            { id: "c8", src: TD_PHOTOS.p12, right: "4.5%", top: "49%", width: "clamp(80px, 5.9vw, 112px)", height: "clamp(102px, 7.5vw, 146px)", rotate: "-3deg", opacity: 0.64, frameClass: "tdc-frame-soft", depth: 8, aos: "tdc-right", delay: 250, durationAos: 720 },
            { id: "c9", src: TD_PHOTOS.p3, left: "14%", bottom: "2.4%", width: "clamp(108px, 8.4vw, 154px)", height: "clamp(76px, 5.8vw, 110px)", rotate: "4deg", opacity: 0.62, frameClass: "tdc-frame-pill", depth: 7, aos: "tdc-up", delay: 280, durationAos: 700, hideMobile: true },
            { id: "c10", src: TD_PHOTOS.p6, right: "14%", bottom: "2.4%", width: "clamp(108px, 8.4vw, 154px)", height: "clamp(76px, 5.8vw, 110px)", rotate: "-4deg", opacity: 0.62, frameClass: "tdc-frame-pill", depth: 7, aos: "tdc-up", delay: 280, durationAos: 700, hideMobile: true },
        ],
        accents: [
            { id: "a1", accentClass: "tdc-accent-lilac", left: "34%", top: "18%", width: "clamp(98px, 7.5vw, 140px)", height: "clamp(98px, 7.5vw, 140px)", opacity: 0.26, depth: 5, aos: "tdc-orb", delay: 200, durationAos: 740, hideMobile: true },
            { id: "a2", accentClass: "tdc-accent-sky", right: "34%", top: "20%", width: "clamp(96px, 7.3vw, 136px)", height: "clamp(96px, 7.3vw, 136px)", opacity: 0.26, depth: 5, aos: "tdc-orb", delay: 240, durationAos: 740, hideMobile: true },
            { id: "a3", accentClass: "tdc-accent-mint", left: "40%", bottom: "16%", width: "clamp(86px, 6.4vw, 122px)", height: "clamp(86px, 6.4vw, 122px)", opacity: 0.24, depth: 5, aos: "tdc-orb", delay: 280, durationAos: 720, hideTablet: true },
        ],
    },
};

/* Lightweight dedicated mode: keep focus on 2-4 main body silhouettes */
const TD_BODY_CUTOUT_LAYOUT = {
    cards: TD_COLLAGE_LAYOUTS["studio-grid"].cards.filter((item) => (
        item.styleType === "silhouette"
        || ["c3", "c8", "c13", "c14", "c17", "c22"].includes(item.id)
    )),
    accents: TD_COLLAGE_LAYOUTS["studio-grid"].accents.filter((_, index) => index < 4),
};

TD_COLLAGE_LAYOUTS["true-body-cutout"] = TD_BODY_CUTOUT_LAYOUT;

const TeacherDashboardCollageLayer = memo(() => {
    const variant = resolveTeacherCollageVariant();
    const layout = TD_COLLAGE_LAYOUTS[variant] || TD_COLLAGE_LAYOUTS[TD_DEFAULT_COLLAGE_VARIANT];

    return (
        <div className={`tdc-layer tdc--${variant}`} aria-hidden="true">
            {layout.cards.map((item) => (
                <div
                    key={item.id}
                    className={`tdc-card ${item.frameClass || "tdc-frame-soft"}${item.styleType === "cutout" ? ` tdc-cutout tdc-cutout--${item.cutoutShape || "organic-a"}` : ""}${item.styleType === "silhouette" ? " tdc-silhouette" : ""}${item.left !== undefined ? " tdc-rail-left" : ""}${item.right !== undefined ? " tdc-rail-right" : ""}${slotVisibilityClasses(item)}`}
                    style={slotStyleVars(item)}
                    data-tdc-depth={item.depth ?? 8}
                    data-aos={item.aos || "tdc-up"}
                    data-aos-delay={item.delay ?? 120}
                    data-aos-duration={item.durationAos ?? 720}
                    data-aos-easing="ease-out-cubic"
                >
                    <img src={item.src} alt="" className="tdc-card-img" loading="lazy" decoding="async" />
                </div>
            ))}

            {(layout.accents || []).map((item) => (
                <div
                    key={item.id}
                    className={`tdc-accent ${item.accentClass || "tdc-accent-lilac"}${item.left !== undefined ? " tdc-rail-left" : ""}${item.right !== undefined ? " tdc-rail-right" : ""}${slotVisibilityClasses(item)}`}
                    style={slotStyleVars(item)}
                    data-tdc-depth={item.depth ?? 6}
                    data-aos={item.aos || "tdc-orb"}
                    data-aos-delay={item.delay ?? 140}
                    data-aos-duration={item.durationAos ?? 740}
                    data-aos-easing="ease-out-cubic"
                />
            ))}
        </div>
    );
});
TeacherDashboardCollageLayer.displayName = "TeacherDashboardCollageLayer";

const TeacherDashboardPage = memo(() => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const pageRef = useRef(null);
    const {
        statCards,
        students,
        progressData,
        heroBadge,
        loading: dataLoading,
        error: dataError,
        refresh,
    } = useTeacherDashboardData();
    const {
        activeTab,
        setActiveTab,
        interventionForm,
        progressForm,
        handleInterventionChange,
        handleProgressChange,
        handleSavePlan,
        resetProgressForm,
        submittingPlan,
        setSubmittingProgress,
        submittingProgress,
    } = useTeacherDashboardState(tabs, { onSaveSuccess: refresh });
    const [quickUpdateStudent, setQuickUpdateStudent] = useState(null);
    const [savingQuickUpdate, setSavingQuickUpdate] = useState(false);

    const { base: baseFieldClass, textarea: textareaClass, notes: notesTextareaClass } = fieldClasses;
    const handleViewStudent = useCallback(
        (student) => {
            if (!student?.slug) return;
            navigate(`/mtss/student/${student.slug}`);
        },
        [navigate],
    );

    const handleOpenQuickUpdate = useCallback((student) => setQuickUpdateStudent(student), []);
    const handleCloseQuickUpdate = useCallback(() => setQuickUpdateStudent(null), []);
    const { handleProgressSubmitForm, handleQuickUpdateSubmit } = useTeacherDashboardActions({
        students,
        progressForm,
        resetProgressForm,
        refresh,
        setSubmittingProgress,
        toast,
        setSavingQuickUpdate,
        onCloseQuickUpdate: handleCloseQuickUpdate,
    });

    useEffect(() => {
        const root = pageRef.current;
        if (!root) return undefined;

        const reduceMotion = prefersReducedMotion();
        const ctx = gsap.context(() => {
            if (reduceMotion) return;

            gsap.to(".tdc-card.tdc-rail-left", {
                rotation: "-=1.6",
                duration: 6.8,
                stagger: 0.1,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
            });

            gsap.to(".tdc-card.tdc-rail-right", {
                rotation: "+=1.6",
                duration: 7.1,
                stagger: 0.1,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
            });

            gsap.to(".tdc-accent", {
                scale: 1.06,
                opacity: "+=0.08",
                duration: 3.2,
                stagger: 0.12,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
            });
        }, root);

        let disposeParallax = () => {};
        if (!reduceMotion && supportsFinePointer()) {
            const layers = Array.from(root.querySelectorAll("[data-tdc-depth]"));
            if (layers.length > 0) {
                const setX = layers.map((layer) => gsap.quickTo(layer, "x", { duration: 0.58, ease: "power3.out", overwrite: "auto" }));
                const setY = layers.map((layer) => gsap.quickTo(layer, "y", { duration: 0.58, ease: "power3.out", overwrite: "auto" }));

                const onPointerMove = (event) => {
                    const rect = root.getBoundingClientRect();
                    const relX = (event.clientX - rect.left) / rect.width - 0.5;
                    const relY = (event.clientY - rect.top) / rect.height - 0.5;

                    layers.forEach((layer, index) => {
                        const depth = resolveDepth(layer.dataset.tdcDepth);
                        const sideWeight = layer.classList.contains("tdc-rail-left") || layer.classList.contains("tdc-rail-right") ? 1.25 : 0.86;
                        setX[index](relX * depth * sideWeight * 1.6);
                        setY[index](relY * depth * sideWeight * 1.2);
                    });
                };

                const onPointerLeave = () => {
                    layers.forEach((_, index) => {
                        setX[index](0);
                        setY[index](0);
                    });
                };

                root.addEventListener("pointermove", onPointerMove, { passive: true });
                root.addEventListener("pointerleave", onPointerLeave, { passive: true });

                disposeParallax = () => {
                    root.removeEventListener("pointermove", onPointerMove);
                    root.removeEventListener("pointerleave", onPointerLeave);
                };
            }
        }

        return () => {
            disposeParallax();
            ctx.revert();
        };
    }, []);

    useEffect(() => {
        const root = pageRef.current;
        if (!root || prefersReducedMotion()) return undefined;

        const loops = [];
        const cardImages = root.querySelectorAll(".tdc-card:not(.tdc-silhouette) .tdc-card-img");
        if (cardImages.length > 0) {
            loops.push(
                animate(cardImages, {
                    scale: [1, 1.07, 1],
                    translateY: [0, -4, 0]
                }, {
                    duration: 2800,
                    delay: stagger(85),
                    ease: "inOutSine",
                    loop: true
                })
            );
        }

        const silhouettes = root.querySelectorAll(".tdc-silhouette");
        if (silhouettes.length > 0) {
            loops.push(
                animate(silhouettes, {
                    rotate: ["-0.8deg", "0.9deg", "-0.8deg"],
                    translateY: [0, -8, 0],
                    scale: [1, 1.03, 1]
                }, {
                    duration: 3600,
                    delay: stagger(170, { start: 60 }),
                    ease: "inOutSine",
                    loop: true
                })
            );
        }

        const accentNodes = root.querySelectorAll(".tdc-accent");
        if (accentNodes.length > 0) {
            loops.push(
                animate(accentNodes, {
                    opacity: [0.2, 0.34, 0.2]
                }, {
                    duration: 2400,
                    delay: stagger(110, { start: 60 }),
                    ease: "inOutQuad",
                    loop: true
                })
            );
        }

        const cutoutNodes = root.querySelectorAll(".tdc-cutout");
        if (cutoutNodes.length > 0) {
            loops.push(
                animate(cutoutNodes, {
                    rotate: ["-1deg", "1deg", "-1deg"],
                    scale: [1, 1.04, 1],
                    translateY: [0, -5, 0]
                }, {
                    duration: 3200,
                    delay: stagger(130, { start: 80 }),
                    ease: "inOutSine",
                    loop: true
                })
            );
        }

        return () => {
            loops.forEach((loop) => loop?.pause?.());
        };
    }, []);

    return (
        <div ref={pageRef} className="mtss-theme mtss-animated-bg min-h-screen relative overflow-hidden text-foreground dark:text-white transition-colors">
            {(submittingPlan || submittingProgress || savingQuickUpdate) && <PageLoader />}
            <div className="mtss-bg-overlay" />
            <TeacherDashboardCollageLayer />
            {/* Soft color blobs (background layer) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
                <div className="absolute -top-20 left-[10%] w-[26rem] h-[26rem] rounded-full bg-[#6366f1] opacity-[0.22] dark:opacity-[0.14] blur-[90px]" />
                <div className="absolute -top-32 right-[5%] w-[30rem] h-[30rem] rounded-full bg-[#c084fc] opacity-[0.20] dark:opacity-[0.13] blur-[100px]" />
                <div className="absolute top-[15%] right-[30%] w-[22rem] h-[22rem] rounded-full bg-[#22d3ee] opacity-[0.18] dark:opacity-[0.10] blur-[80px]" />
                <div className="absolute top-[40%] left-[45%] w-[28rem] h-[28rem] rounded-full bg-[#fbbf24] opacity-[0.14] dark:opacity-[0.08] blur-[120px]" />
                <div className="absolute -bottom-32 -left-20 w-[30rem] h-[30rem] rounded-full bg-[#22d3ee] opacity-[0.20] dark:opacity-[0.12] blur-[100px]" />
                <div className="absolute -bottom-20 right-[15%] w-[24rem] h-[24rem] rounded-full bg-[#f472b6] opacity-[0.18] dark:opacity-[0.11] blur-[100px]" />
                <div className="absolute top-[60%] left-[5%] w-[20rem] h-[20rem] rounded-full bg-[#10b981] opacity-[0.14] dark:opacity-[0.09] blur-[90px]" />
            </div>
            {/* Floating gradient orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
                <div className="mtss-orb mtss-orb-1" />
                <div className="mtss-orb mtss-orb-2" />
                <div className="mtss-orb mtss-orb-3" />
                <div className="mtss-orb mtss-orb-4" />
                <div className="mtss-orb mtss-orb-5" />
                <div className="mtss-orb mtss-orb-6" />
                <div className="mtss-orb mtss-orb-7" />
            </div>

            <div className="relative z-20 container-tight px-4 sm:px-6 py-8 lg:py-14 space-y-8 lg:space-y-10">
                <section
                    className="mtss-gradient-border overflow-hidden rounded-3xl border border-white/40 dark:border-white/10 shadow-[0_25px_60px_rgba(148,163,184,0.25)]"
                    data-aos="fade-up"
                    data-aos-duration="700"
                >
                    <TeacherHeroSection heroBadge={heroBadge} tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                </section>

                <TeacherDashboardStatus loading={dataLoading} error={dataError} onRetry={refresh} />

                <TeacherDashboardPanels
                    activeTab={activeTab}
                    statCards={statCards}
                    students={students}
                    progressData={progressData}
                    interventionForm={interventionForm}
                    progressForm={progressForm}
                    handleInterventionChange={handleInterventionChange}
                    handleProgressChange={handleProgressChange}
                    handleSavePlan={handleSavePlan}
                    handleProgressSubmitForm={handleProgressSubmitForm}
                    baseFieldClass={baseFieldClass}
                    textareaClass={textareaClass}
                    notesTextareaClass={notesTextareaClass}
                    submittingPlan={submittingPlan}
                    submittingProgress={submittingProgress}
                    onViewStudent={handleViewStudent}
                    onQuickUpdate={handleOpenQuickUpdate}
                    refresh={refresh}
                />
            </div>
            {quickUpdateStudent && (
                <QuickUpdateModal
                    student={quickUpdateStudent}
                    onClose={handleCloseQuickUpdate}
                    onSubmit={handleQuickUpdateSubmit}
                    submitting={savingQuickUpdate}
                />
            )}
        </div>
    );
});

TeacherDashboardPage.displayName = "TeacherDashboardPage";
export default TeacherDashboardPage;
