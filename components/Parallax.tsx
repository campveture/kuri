"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ParallaxProps {
  children: ReactNode;
  /** Pixels the element drifts upward across its viewport traversal. */
  strength?: number;
  className?: string;
}

/** Scroll-linked vertical drift, driven by requestAnimationFrame. */
export function Parallax({ children, strength = 60, className = "" }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let ticking = false;

    const update = () => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) return;
      // progress: 0 when the element enters at the bottom, 1 when it leaves at the top
      const progress = 1 - (rect.top + rect.height / 2) / (vh + rect.height);
      const offset = (progress - 0.5) * 2 * strength;
      el.style.transform = `translateY(${offset.toFixed(2)}px)`;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [strength]);

  return (
    <div ref={ref} className={`parallax-slow ${className}`}>
      {children}
    </div>
  );
}
