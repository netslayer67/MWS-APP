import { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

// Combines OS-level reduced motion with mobile/touch heuristics
export default function usePreferLowMotion() {
  const prefersReducedMotion = useReducedMotion();
  const [isTouchOrCoarse, setIsTouchOrCoarse] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(hover: none), (pointer: coarse)');
    const update = () => setIsTouchOrCoarse(!!mq.matches);
    update();
    // Support older browsers
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    } else if (typeof mq.addListener === 'function') {
      mq.addListener(update);
      return () => mq.removeListener(update);
    }
  }, []);

  return useMemo(() => prefersReducedMotion || isTouchOrCoarse, [prefersReducedMotion, isTouchOrCoarse]);
}

