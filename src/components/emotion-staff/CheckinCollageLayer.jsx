import { memo, useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import {
    MWS_STUDENT_CARD_ASSET_IDS,
} from "@/data/mwsStudentsDesignAssets";
import "@/pages/styles/checkin-dashboard-collage.css";

const CLD = "https://res.cloudinary.com/deldcwiji/image/upload";
const photo = (id, w = 160, h = 200) =>
    `${CLD}/c_fill,w_${w},h_${h},g_auto,f_auto,q_auto/${id}`;

/*
   Pick photos for strips + mosaic.
   Deterministic selection based on date so photos rotate daily.
   `extraSeed` lets different pages get different photo selections.
*/
const pickPhotos = (count, extraSeed = 0) => {
    const dayKey = new Date().toISOString().slice(0, 10);
    let seed = extraSeed;
    for (let i = 0; i < dayKey.length; i += 1) {
        seed = ((seed << 5) - seed) + dayKey.charCodeAt(i);
        seed |= 0;
    }
    seed = Math.abs(seed);

    const pool = [...MWS_STUDENT_CARD_ASSET_IDS];
    /* Simple deterministic shuffle */
    let s = (seed % 2147483647) || 1;
    const rng = () => { s = (s * 48271) % 2147483647; return s / 2147483647; };
    for (let i = pool.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rng() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    return pool.slice(0, count);
};

const prefersReducedMotion = () => {
    if (typeof window === "undefined") return true;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? true;
};

/*
   PhotoMosaicBg: subtle grid of student photos behind content.
   Very low opacity + warm overlay so text remains readable.
*/
const PhotoMosaicBg = ({ ids }) => {
    const bgPhotos = ids.map((id) => photo(id, 280, 350));
    /* Repeat photos 5× so the grid covers full scrollable page height */
    const repeatedPhotos = [...bgPhotos, ...bgPhotos, ...bgPhotos, ...bgPhotos, ...bgPhotos];

    return (
        <div className="ecd-mosaic-bg" aria-hidden="true">
            <div className="ecd-mosaic-grid">
                {repeatedPhotos.map((src, i) => (
                    <div key={`mosaic-${i}`} className="ecd-mosaic-cell">
                        <img src={src} alt="" loading="lazy" decoding="async" />
                    </div>
                ))}
            </div>
            {/* Warm color overlay for readability */}
            <div className="ecd-mosaic-overlay" />
        </div>
    );
};

/*
   Filmstrip: a vertical column of photos that scrolls infinitely.
   Photos are duplicated so the loop is seamless.
*/
const Filmstrip = ({ ids, side, className }) => {
    const photos = ids.map((id) => photo(id, 160, 200));

    return (
        <div className={`ecd-filmstrip ecd-filmstrip--${side} ${className || ""}`}>
            {/* Duplicate the strip for seamless loop */}
            <div className="ecd-filmstrip__track" data-ecd-track={side}>
                {[...photos, ...photos].map((src, i) => (
                    <div key={`${side}-${i}`} className="ecd-filmstrip__frame">
                        <img src={src} alt="" loading="lazy" decoding="async" />
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Reusable collage layer: filmstrip on left/right + photo mosaic background.
 * Pass `pageSeed` (number) so different pages get different photo selections.
 */
const CheckinCollageLayer = memo(({ pageSeed = 0 }) => {
    const ref = useRef(null);

    const { leftIds, rightIds, bgIds } = useMemo(() => {
        const ids = pickPhotos(50, pageSeed);
        return {
            leftIds: ids.slice(0, 8),
            rightIds: ids.slice(8, 16),
            bgIds: ids.slice(16, 50),
        };
    }, [pageSeed]);

    useEffect(() => {
        const root = ref.current;
        if (!root || prefersReducedMotion()) return undefined;

        /* GSAP infinite scroll — left strip scrolls up, right scrolls down */
        const leftTrack = root.querySelector('[data-ecd-track="left"]');
        const rightTrack = root.querySelector('[data-ecd-track="right"]');

        const tweens = [];

        if (leftTrack) {
            /* Measure half the track (original photos, not duplicates) */
            const halfH = leftTrack.scrollHeight / 2;
            gsap.set(leftTrack, { y: 0 });
            tweens.push(
                gsap.to(leftTrack, {
                    y: -halfH,
                    duration: 60,
                    ease: "none",
                    repeat: -1,
                })
            );
        }

        if (rightTrack) {
            const halfH = rightTrack.scrollHeight / 2;
            gsap.set(rightTrack, { y: -halfH });
            tweens.push(
                gsap.to(rightTrack, {
                    y: 0,
                    duration: 65,
                    ease: "none",
                    repeat: -1,
                })
            );
        }

        /* Pause when tab not visible */
        const onVisibility = () => {
            tweens.forEach((t) => {
                if (document.hidden) t.pause();
                else t.play();
            });
        };
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            tweens.forEach((t) => t.kill());
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, []);

    return (
        <div ref={ref} className="ecd-collage-layer" aria-hidden="true">
            <PhotoMosaicBg ids={bgIds} />
            <Filmstrip ids={leftIds} side="left" />
            <Filmstrip ids={rightIds} side="right" />
        </div>
    );
});

CheckinCollageLayer.displayName = "CheckinCollageLayer";
export default CheckinCollageLayer;
