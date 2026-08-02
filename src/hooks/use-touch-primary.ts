"use client";

import { useEffect, useState } from "react";

/**
 * True when the device is touch-primary (coarse pointer *and* real touch
 * points), re-evaluated whenever the pointer mode changes — a 2-in-1 laptop
 * switches between modes at runtime, so this can't be read once at mount.
 *
 * Both signals are required. `maxTouchPoints > 0` alone is true on touch-screen
 * laptops that are still mouse-driven, and `(pointer: coarse)` alone can match
 * some pen and TV inputs.
 *
 * Returns `false` on the server and on the first client render so the non-touch
 * branch is the hydration-stable default; the real value lands in an effect.
 */
export function useTouchPrimary() {
  const [isTouchPrimary, setIsTouchPrimary] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // One controller cleans up every listener at once — no per-listener
    // removal to keep in sync.
    const controller = new AbortController();
    const { signal } = controller;

    const check = () => {
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      setIsTouchPrimary(hasTouch && coarse);
    };

    window
      .matchMedia("(pointer: coarse)")
      .addEventListener("change", check, { signal });
    window.addEventListener("pointerdown", check, { signal });
    check();

    return () => controller.abort();
  }, []);

  return isTouchPrimary;
}
