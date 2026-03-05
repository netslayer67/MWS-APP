import { memo, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import gsap from "gsap";
import { animate, stagger } from "animejs";
import usePreferLowMotion from "@/hooks/usePreferLowMotion";
import {
    MWS_STUDENT_CARD_ASSET_IDS,
    MWS_STUDENT_CUTOUT_ASSET_IDS,
} from "@/data/mwsStudentsDesignAssets";
import "@/pages/styles/workforce-humanistic.css";

const CLD_BASE = "https://res.cloudinary.com/deldcwiji/image/upload";
const cardPhoto = (id, w = 252, h = 324) => `${CLD_BASE}/c_fill,w_${w},h_${h},g_auto,f_auto,q_auto/${id}`;
const cutoutPhoto = (id, w = 380) => `${CLD_BASE}/c_scale,w_${w},f_auto,q_auto/${id}`;

const WORKFORCE_ROLES = new Set([
    "teacher",
    "se_teacher",
    "staff",
    "support_staff",
    "nurse",
    "head_unit",
    "principal",
    "directorate",
    "admin",
    "superadmin",
]);

const DENSE_LAYOUT = [
    { id: "l-cutout-top", type: "cutout", left: "-2.3%", top: "7%", width: "clamp(112px, 11vw, 188px)", height: "clamp(160px, 18vw, 286px)", rotate: "-4deg", opacity: 0.66, depth: 14, aos: "fade-right", delay: 80, hideMobile: true },
    { id: "l-card-1", type: "card", left: "1.2%", top: "18%", width: "clamp(78px, 6vw, 116px)", height: "clamp(102px, 8vw, 166px)", rotate: "-6deg", opacity: 0.6, depth: 10, aos: "fade-right", delay: 110 },
    { id: "l-card-2", type: "card", left: "1.4%", top: "38%", width: "clamp(76px, 5.9vw, 112px)", height: "clamp(98px, 7.6vw, 160px)", rotate: "4deg", opacity: 0.58, depth: 9, aos: "fade-right", delay: 150 },
    { id: "l-card-3", type: "card", left: "1.6%", top: "60%", width: "clamp(74px, 5.7vw, 108px)", height: "clamp(96px, 7.2vw, 154px)", rotate: "-3deg", opacity: 0.56, depth: 8, aos: "fade-right", delay: 180, hideTablet: true },
    { id: "l-cutout-bottom", type: "cutout", left: "-2%", bottom: "5%", width: "clamp(108px, 10.6vw, 180px)", height: "clamp(150px, 16vw, 260px)", rotate: "-2deg", opacity: 0.62, depth: 13, aos: "fade-right", delay: 220, hideMobile: true },
    { id: "r-cutout-top", type: "cutout", right: "-2.4%", top: "8%", width: "clamp(118px, 11.2vw, 194px)", height: "clamp(162px, 18.2vw, 290px)", rotate: "4deg", opacity: 0.66, depth: 14, aos: "fade-left", delay: 90, hideMobile: true },
    { id: "r-card-1", type: "card", right: "1.2%", top: "18%", width: "clamp(78px, 6vw, 116px)", height: "clamp(102px, 8vw, 166px)", rotate: "6deg", opacity: 0.6, depth: 10, aos: "fade-left", delay: 120 },
    { id: "r-card-2", type: "card", right: "1.4%", top: "38%", width: "clamp(76px, 5.9vw, 112px)", height: "clamp(98px, 7.6vw, 160px)", rotate: "-4deg", opacity: 0.58, depth: 9, aos: "fade-left", delay: 160 },
    { id: "r-card-3", type: "card", right: "1.6%", top: "60%", width: "clamp(74px, 5.7vw, 108px)", height: "clamp(96px, 7.2vw, 154px)", rotate: "3deg", opacity: 0.56, depth: 8, aos: "fade-left", delay: 190, hideTablet: true },
    { id: "r-cutout-bottom", type: "cutout", right: "-1.9%", bottom: "5%", width: "clamp(108px, 10.6vw, 180px)", height: "clamp(150px, 16vw, 260px)", rotate: "2deg", opacity: 0.62, depth: 13, aos: "fade-left", delay: 230, hideMobile: true },
    { id: "top-card-left", type: "card", left: "13%", top: "2.8%", width: "clamp(74px, 5.5vw, 106px)", height: "clamp(96px, 7.2vw, 150px)", rotate: "-2deg", opacity: 0.5, depth: 7, aos: "fade-down", delay: 210, hideMobile: true },
    { id: "top-card-right", type: "card", right: "13%", top: "2.8%", width: "clamp(74px, 5.5vw, 106px)", height: "clamp(96px, 7.2vw, 150px)", rotate: "2deg", opacity: 0.5, depth: 7, aos: "fade-down", delay: 210, hideMobile: true },
];

const MEDIUM_LAYOUT = DENSE_LAYOUT.filter((item) => (
    !["l-card-3", "r-card-3", "top-card-left", "top-card-right"].includes(item.id)
));

const LIGHT_LAYOUT = DENSE_LAYOUT.filter((item) => (
    ["l-cutout-top", "l-card-1", "l-cutout-bottom", "r-cutout-top", "r-card-1", "r-cutout-bottom"].includes(item.id)
));

const SCENARIO_LAYOUTS = {
    dense: DENSE_LAYOUT,
    medium: MEDIUM_LAYOUT,
    light: LIGHT_LAYOUT,
};

const routeMatches = (pathname, prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`);

const resolveScenario = (pathname) => {
    if (
        routeMatches(pathname, "/emotional-checkin/dashboard")
        || routeMatches(pathname, "/emotional-checkin/teacher-dashboard")
        || routeMatches(pathname, "/user-management")
        || routeMatches(pathname, "/mtss/admin")
    ) {
        return "dense";
    }

    if (
        routeMatches(pathname, "/emotional-checkin/staff")
        || routeMatches(pathname, "/profile")
        || routeMatches(pathname, "/notifications")
        || routeMatches(pathname, "/mtss/student")
    ) {
        return "medium";
    }

    return "light";
};

const hashString = (value = "") => {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
        hash = ((hash << 5) - hash) + value.charCodeAt(index);
        hash |= 0;
    }
    return Math.abs(hash);
};

const seededShuffle = (items, seedBase = 0) => {
    const next = [...items];
    let seed = (seedBase % 2147483647) || 1;
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

const slotStyleVars = (slot) => ({
    "--whl-left": slot.left ?? "auto",
    "--whl-right": slot.right ?? "auto",
    "--whl-top": slot.top ?? "auto",
    "--whl-bottom": slot.bottom ?? "auto",
    "--whl-width": slot.width ?? "auto",
    "--whl-height": slot.height ?? "auto",
    "--whl-rotate": slot.rotate ?? "0deg",
    "--whl-opacity": slot.opacity ?? 0.56,
});

const slotVisibilityClasses = (slot) => (
    `${slot.hideTablet ? " whl-hide-tablet" : ""}${slot.hideMobile ? " whl-hide-mobile" : ""}`
);

const WorkforceHumanisticLayer = memo(() => {
    const layerRef = useRef(null);
    const loopsRef = useRef([]);
    const location = useLocation();
    const user = useSelector((state) => state.auth?.user);
    const lowMotion = usePreferLowMotion();
    const pathname = location.pathname || "";
    const normalizedRole = String(user?.role || "").trim().toLowerCase();

    const shouldRender = useMemo(() => {
        if (!WORKFORCE_ROLES.has(normalizedRole)) return false;
        if (routeMatches(pathname, "/student")) return false;
        if (routeMatches(pathname, "/mtss/student-portal")) return false;
        if (pathname === "/support-hub" || pathname === "/mtss/teacher") return false;
        return true;
    }, [normalizedRole, pathname]);

    const scenario = useMemo(() => resolveScenario(pathname), [pathname]);
    const slots = useMemo(() => SCENARIO_LAYOUTS[scenario] || SCENARIO_LAYOUTS.light, [scenario]);

    const deviceTier = useMemo(() => {
        if (typeof window === "undefined") return "desktop";
        if (window.innerWidth <= 768) return "mobile";
        if (window.innerWidth <= 1024) return "tablet";
        return "desktop";
    }, []);

    const visibleSlots = useMemo(() => slots.filter((slot) => {
        if (deviceTier === "mobile" && slot.hideMobile) return false;
        if ((deviceTier === "mobile" || deviceTier === "tablet") && slot.hideTablet) return false;
        return true;
    }), [deviceTier, slots]);

    const resolvedSlots = useMemo(() => {
        const cycleStamp = `${new Date().toISOString().slice(0, 10)}-${Math.floor(new Date().getHours() / 6)}`;
        const seed = hashString(`${pathname}|${normalizedRole}|${scenario}|${cycleStamp}`);
        const cardPool = seededShuffle(MWS_STUDENT_CARD_ASSET_IDS, seed + 17);
        const cutoutPool = seededShuffle(MWS_STUDENT_CUTOUT_ASSET_IDS, seed + 97);
        let cardCursor = 0;
        let cutoutCursor = 0;

        return visibleSlots.map((slot) => {
            if (slot.type === "card") {
                const id = cardPool[cardCursor % cardPool.length];
                cardCursor += 1;
                return { ...slot, src: cardPhoto(id) };
            }

            const id = cutoutPool[cutoutCursor % cutoutPool.length];
            cutoutCursor += 1;
            return { ...slot, src: cutoutPhoto(id) };
        });
    }, [normalizedRole, pathname, scenario, visibleSlots]);

    useEffect(() => {
        if (!shouldRender || lowMotion || typeof window === "undefined") return undefined;

        const root = layerRef.current;
        if (!root) return undefined;
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;

        const nodes = root.querySelectorAll("[data-whl-depth]");
        if (nodes.length === 0) return undefined;

        const movers = Array.from(nodes).map((node) => {
            const depth = Number(node.getAttribute("data-whl-depth")) || 8;
            return {
                depth,
                x: gsap.quickTo(node, "x", { duration: 0.8, ease: "power2.out" }),
                y: gsap.quickTo(node, "y", { duration: 0.8, ease: "power2.out" }),
            };
        });

        const handlePointerMove = (event) => {
            const offsetX = (event.clientX / window.innerWidth) - 0.5;
            const offsetY = (event.clientY / window.innerHeight) - 0.5;
            movers.forEach((item) => {
                item.x(offsetX * item.depth * 3.4);
                item.y(offsetY * item.depth * 2.6);
            });
        };

        const handlePointerLeave = () => {
            movers.forEach((item) => {
                item.x(0);
                item.y(0);
            });
        };

        window.addEventListener("pointermove", handlePointerMove, { passive: true });
        window.addEventListener("pointerleave", handlePointerLeave, { passive: true });

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerleave", handlePointerLeave);
        };
    }, [lowMotion, pathname, resolvedSlots, shouldRender]);

    useEffect(() => {
        loopsRef.current.forEach((loop) => loop?.pause?.());
        loopsRef.current = [];

        if (!shouldRender || lowMotion) return undefined;
        const root = layerRef.current;
        if (!root) return undefined;

        const loops = [];
        const cardImages = root.querySelectorAll(".whl-card .whl-item-img");
        if (cardImages.length > 0) {
            loops.push(
                animate(cardImages, {
                    scale: [1, 1.035, 1],
                    translateY: [0, -4, 0],
                }, {
                    duration: 3400,
                    delay: stagger(120),
                    ease: "inOutSine",
                    loop: true,
                })
            );
        }

        const cutouts = root.querySelectorAll(".whl-cutout .whl-item-img");
        if (cutouts.length > 0) {
            loops.push(
                animate(cutouts, {
                    translateY: [0, -6, 0],
                    rotate: ["-1deg", "1deg", "-1deg"],
                }, {
                    duration: 3800,
                    delay: stagger(140, { start: 100 }),
                    ease: "inOutSine",
                    loop: true,
                })
            );
        }

        const glows = root.querySelectorAll(".whl-glow");
        if (glows.length > 0) {
            loops.push(
                animate(glows, {
                    opacity: [0.12, 0.26, 0.12],
                    scale: [0.96, 1.04, 0.96],
                }, {
                    duration: 2800,
                    delay: stagger(90),
                    ease: "inOutQuad",
                    loop: true,
                })
            );
        }

        loopsRef.current = loops;

        const handleVisibility = () => {
            loopsRef.current.forEach((loop) => {
                if (document.hidden) {
                    loop?.pause?.();
                } else {
                    loop?.play?.();
                }
            });
        };

        document.addEventListener("visibilitychange", handleVisibility);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
            loops.forEach((loop) => loop?.pause?.());
            loopsRef.current = [];
        };
    }, [lowMotion, pathname, resolvedSlots, shouldRender]);

    if (!shouldRender) return null;

    return (
        <div ref={layerRef} className={`workforce-humanistic-layer whl--${scenario}`} aria-hidden="true">
            <div className="whl-shell" />
            <div className="whl-content-veil" />
            <div className="whl-rail whl-rail-left" />
            <div className="whl-rail whl-rail-right" />

            <div className="whl-glow whl-glow-left" />
            <div className="whl-glow whl-glow-right" />

            {resolvedSlots.map((slot) => (
                <div
                    key={slot.id}
                    className={`whl-item whl-${slot.type}${slotVisibilityClasses(slot)}`}
                    style={slotStyleVars(slot)}
                    data-whl-depth={slot.depth ?? 8}
                    data-aos={slot.aos || "fade-up"}
                    data-aos-delay={slot.delay ?? 100}
                    data-aos-duration={700}
                    data-aos-easing="ease-out-cubic"
                >
                    <img src={slot.src} alt="" className="whl-item-img" loading="lazy" decoding="async" />
                </div>
            ))}
        </div>
    );
});

WorkforceHumanisticLayer.displayName = "WorkforceHumanisticLayer";
export default WorkforceHumanisticLayer;
