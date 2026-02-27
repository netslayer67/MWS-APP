import { useEffect } from "react";

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
  return Number.isFinite(parsed) ? parsed : 14;
};

const useLandingAnimations = ({ containerRef, variant = "clean" }) => {
  useEffect(() => {
    const container = containerRef?.current;
    if (!container || typeof window === "undefined") return undefined;

    let disposed = false;
    let cleanup = () => {};
    const motionIntensity = variant === "bold" ? 1.16 : 0.88;

    const init = async () => {
      const shouldReduceMotion = prefersReducedMotion();

      const [gsapModule, animeModule] = await Promise.all([
        import("gsap"),
        import("animejs")
      ]);

      if (disposed) return;

      const gsap = gsapModule?.default || gsapModule?.gsap || gsapModule;
      const animate = animeModule?.animate || animeModule?.default?.animate;
      const stagger = animeModule?.stagger || animeModule?.default?.stagger;
      const animeLoops = [];
      let removeParallax = () => {};

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.55 } });

        tl.fromTo(".landing-gsap-logo",
          { autoAlpha: 0, y: 26 * motionIntensity, scale: 0.84 },
          { autoAlpha: 1, y: 0, scale: 1, duration: variant === "bold" ? 0.72 : 0.62 }
        );
        tl.fromTo(".landing-gsap-title",
          { autoAlpha: 0, y: 22 * motionIntensity },
          { autoAlpha: 1, y: 0, duration: variant === "bold" ? 0.58 : 0.52 },
          "-=0.42"
        );
        tl.fromTo(".landing-gsap-copy",
          { autoAlpha: 0, y: 18 * motionIntensity },
          { autoAlpha: 1, y: 0, duration: variant === "bold" ? 0.48 : 0.42 },
          "-=0.35"
        );
        tl.fromTo(".landing-gsap-card",
          { autoAlpha: 0, x: 30, scale: 0.97 },
          { autoAlpha: 1, x: 0, scale: 1, duration: variant === "bold" ? 0.64 : 0.55 },
          "-=0.42"
        );

        if (!shouldReduceMotion) {
          gsap.to(".landing-photo-bg", {
            scale: variant === "bold" ? 1.11 : 1.08,
            duration: variant === "bold" ? 7.6 : 8.8,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });

          const cutouts = gsap.utils.toArray(".landing-photo-cutout");
          cutouts.forEach((cutout, index) => {
            gsap.to(cutout, {
              y: (index % 2 === 0 ? -8 : -6) * motionIntensity,
              x: (index % 2 === 0 ? 4 : -3) * motionIntensity,
              duration: 5.1 + index * 0.45,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut"
            });
          });
        }
      }, container);

      if (!shouldReduceMotion && supportsFinePointer()) {
        const shell = container.querySelector(".landing-pointer-shell") || container;
        const layers = Array.from(container.querySelectorAll("[data-landing-depth]"));

        if (layers.length > 0 && shell) {
          const onPointerMove = (event) => {
            const rect = shell.getBoundingClientRect();
            const xRatio = (event.clientX - rect.left) / rect.width - 0.5;
            const yRatio = (event.clientY - rect.top) / rect.height - 0.5;

            layers.forEach((layer) => {
              const depth = resolveDepth(layer.dataset.landingDepth);
              gsap.to(layer, {
                x: xRatio * depth * motionIntensity,
                y: yRatio * depth * motionIntensity,
                duration: 0.55,
                ease: "power2.out",
                overwrite: "auto"
              });
            });
          };

          const onPointerLeave = () => {
            layers.forEach((layer) => {
              gsap.to(layer, {
                x: 0,
                y: 0,
                duration: 0.75,
                ease: "power3.out",
                overwrite: "auto"
              });
            });
          };

          shell.addEventListener("pointermove", onPointerMove, { passive: true });
          shell.addEventListener("pointerleave", onPointerLeave, { passive: true });
          removeParallax = () => {
            shell.removeEventListener("pointermove", onPointerMove);
            shell.removeEventListener("pointerleave", onPointerLeave);
          };
        }
      }

      if (!shouldReduceMotion && typeof animate === "function" && typeof stagger === "function") {
        const chips = container.querySelectorAll(".landing-anime-chip");
        const dots = container.querySelectorAll(".landing-anime-dot");
        const orbs = container.querySelectorAll(".landing-anime-orb");

        if (chips.length > 0) {
          animeLoops.push(
            animate(chips, {
              translateY: [0, -4, 0],
              scale: variant === "bold" ? [1, 1.06, 1] : [1, 1.03, 1]
            }, {
              duration: variant === "bold" ? 2400 : 2800,
              delay: stagger(90),
              ease: "inOutSine",
              loop: true
            })
          );
        }

        if (dots.length > 0) {
          animeLoops.push(
            animate(dots, {
              translateY: [0, -12 * motionIntensity, 8 * motionIntensity, 0],
              translateX: [0, 8 * motionIntensity, -6 * motionIntensity, 0],
              opacity: variant === "bold" ? [0.16, 0.42, 0.2] : [0.12, 0.32, 0.15],
              scale: variant === "bold" ? [0.86, 1.2, 0.94] : [0.85, 1.12, 0.9]
            }, {
              duration: variant === "bold" ? 4200 : 5000,
              delay: stagger(140, { start: 120 }),
              ease: "inOutSine",
              loop: true
            })
          );
        }

        if (orbs.length > 0) {
          animeLoops.push(
            animate(orbs, {
              translateY: [0, -8 * motionIntensity, 0],
              scale: variant === "bold" ? [1, 1.14, 1] : [1, 1.08, 1],
              opacity: variant === "bold" ? [0.5, 0.78, 0.5] : [0.4, 0.62, 0.4]
            }, {
              duration: variant === "bold" ? 4700 : 5400,
              delay: stagger(200, { start: 140 }),
              ease: "inOutSine",
              loop: true
            })
          );
        }
      }

      cleanup = () => {
        removeParallax();
        animeLoops.forEach((loop) => loop?.pause?.());
        ctx.revert();
      };
    };

    let cancelInit = () => {};
    const run = () => {
      init().catch(() => {});
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(run, { timeout: 1200 });
      cancelInit = () => window.cancelIdleCallback?.(idleId);
    } else {
      const timeoutId = window.setTimeout(run, 140);
      cancelInit = () => window.clearTimeout(timeoutId);
    }

    return () => {
      disposed = true;
      cancelInit();
      cleanup();
    };
  }, [containerRef, variant]);
};

export default useLandingAnimations;
