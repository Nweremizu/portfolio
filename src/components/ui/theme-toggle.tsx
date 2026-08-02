"use client";

import { RiMoonLine, RiSunLine } from "@remixicon/react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import type { Vibration } from "web-haptics";
import { useWebHaptics } from "web-haptics/react";
import { cn } from "@/lib/cn";

// A soft tap that settles into a fading echo, matching the theme toggle's
// gentle circular reveal rather than a sharp mechanical click.
const THEME_TOGGLE_HAPTIC: Vibration[] = [
  { duration: 25, intensity: 0.35 },
  { delay: 50, duration: 40, intensity: 0.16 },
];

export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "brunex:theme";
export const THEME_CHANGE_EVENT = "brunex:theme-change";

const THEME_TRANSITION_DURATION = 820;
const THEME_TRANSITION_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";
const THEME_TRANSITION_STYLE_ID = "brunex-theme-transition-style";

type ThemeTransitionOrigin = { x: number; y: number };

type ViewTransition = {
  ready: Promise<void>;
  finished: Promise<void>;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => ViewTransition;
};

let themeTransitionRunning = false;

function createBlurCircleMask() {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">',
    '<defs><filter id="blur" x="-50%" y="-50%" width="200%" height="200%">',
    '<feGaussianBlur stdDeviation="2" /></filter></defs>',
    '<circle cx="50" cy="50" r="42" fill="white" filter="url(#blur)" />',
    "</svg>",
  ].join("");

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function createThemeTransitionStyle(
  { x, y }: ThemeTransitionOrigin,
  radius: number,
  duration: number,
) {
  document.getElementById(THEME_TRANSITION_STYLE_ID)?.remove();

  const mask = createBlurCircleMask();
  const finalMaskSize = radius * 2.5;
  const finalMaskX = x - finalMaskSize / 2;
  const finalMaskY = y - finalMaskSize / 2;
  const style = document.createElement("style");
  style.id = THEME_TRANSITION_STYLE_ID;
  style.textContent = `
    ::view-transition-new(root) {
      -webkit-mask-image: ${mask};
      mask-image: ${mask};
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      animation: boardui-theme-mask-reveal ${duration}ms ${THEME_TRANSITION_EASING} both;
      transform-origin: ${x}px ${y}px;
      will-change: -webkit-mask-size, -webkit-mask-position, mask-size, mask-position;
    }

    @keyframes boardui-theme-mask-reveal {
      from {
        -webkit-mask-position: ${x}px ${y}px;
        mask-position: ${x}px ${y}px;
        -webkit-mask-size: 0px 0px;
        mask-size: 0px 0px;
      }
      to {
        -webkit-mask-position: ${finalMaskX}px ${finalMaskY}px;
        mask-position: ${finalMaskX}px ${finalMaskY}px;
        -webkit-mask-size: ${finalMaskSize}px ${finalMaskSize}px;
        mask-size: ${finalMaskSize}px ${finalMaskSize}px;
      }
    }
  `;
  document.head.appendChild(style);
  return style;
}

// Retrieves the current theme from localStorage, defaulting to "light" if not set or if an error occurs. This function is safe to call in both server and client environments.
function getThemeFromStorage(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    return (
      (window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) || "light"
    );
  } catch {
    return "light";
  }
}

// Applies the theme to the document and optionally persists it in localStorage. It also dispatches a custom event to notify other parts of the application about the theme change.
export function applyTheme(
  theme: ThemeMode,
  { persist = true }: { persist?: boolean } = {},
) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  if (persist) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // The control remains usable when storage is blocked or unavailable.
    }
  }
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }));
}

/*
 * Calculates the center point of a given HTML element.
 * If the element is null, it defaults to the center of the viewport.
 * This function is used to determine the origin point for theme transition animations.
 */
function elementCenter(element: HTMLElement | null): ThemeTransitionOrigin {
  if (!element) {
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/*
 * Normalizes the origin point for the theme transition animation.
 * If the provided origin is null, it calculates the center of the given element.
 * It also ensures that the origin point is clamped within the bounds of the viewport.
 */
function normalizedOrigin(
  origin: ThemeTransitionOrigin | null,
  element: HTMLElement | null,
): ThemeTransitionOrigin {
  const fallback = elementCenter(element);
  const x = origin?.x ?? fallback.x;
  const y = origin?.y ?? fallback.y;
  return {
    x: Math.min(Math.max(x, 0), window.innerWidth),
    y: Math.min(Math.max(y, 0), window.innerHeight),
  };
}

/**
 * Reveals the next theme from the interaction point using the View Transition
 * API. Keyboard activation starts at the control's center. Unsupported
 * browsers and reduced-motion users receive the same immediate theme change.
 */
export async function applyThemeWithTransition(
  theme: ThemeMode,
  {
    origin = null,
    element = null,
    duration = THEME_TRANSITION_DURATION,
  }: {
    origin?: ThemeTransitionOrigin | null;
    element?: HTMLElement | null;
    duration?: number;
  } = {},
) {
  if (typeof document === "undefined" || currentTheme() === theme) return;

  const transitionDocument = document as ViewTransitionDocument;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (!transitionDocument.startViewTransition || reduceMotion) {
    applyTheme(theme);
    return;
  }
  if (themeTransitionRunning) return;

  const { x, y } = normalizedOrigin(origin, element);
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  themeTransitionRunning = true;
  document.documentElement.classList.add("theme-transitioning");
  const transitionStyle = createThemeTransitionStyle(
    { x, y },
    radius,
    duration,
  );
  try {
    const transition = transitionDocument.startViewTransition(() => {
      flushSync(() => applyTheme(theme));
    });

    await transition.ready;
    await transition.finished;
  } catch {
    // If the browser aborts a transition mid-flight, the theme still changes.
    if (currentTheme() !== theme) applyTheme(theme);
  } finally {
    transitionStyle.remove();
    document.documentElement.classList.remove("theme-transitioning");
    themeTransitionRunning = false;
  }
}

function currentTheme(): ThemeMode {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function subscribe(onStoreChange: () => void) {
  const onThemeChange = () => onStoreChange();
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    applyTheme(event.newValue === "dark" ? "dark" : "light", {
      persist: false,
    });
  };
  window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useThemeMode(): ThemeMode {
  return useSyncExternalStore(subscribe, currentTheme, () => "light");
}

export interface ThemetoggleProps {
  className?: string;
  transitionDuration?: number;
}

export function ThemeToggle({
  className,
  transitionDuration = THEME_TRANSITION_DURATION,
}: ThemetoggleProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const theme = useThemeMode();
  const dark = theme === "dark";
  const switchRef = useRef<HTMLDivElement | null>(null);
  const pointerOriginRef = useRef<ThemeTransitionOrigin | null>(null);
  const haptic = useWebHaptics({
    debug: process.env.NODE_ENV !== "production",
  });

  useEffect(() => {
    applyTheme(getThemeFromStorage(), { persist: false });
  }, []);

  const Icon = dark ? RiSunLine : RiMoonLine;
  return (
    <button
      type="button"
      aria-label={dark ? "Use light mode" : "Use dark mode"}
      aria-pressed={dark}
      title={dark ? "Light mode" : "Dark mode"}
      onClick={(event) => {
        haptic.trigger(THEME_TOGGLE_HAPTIC);
        const pointerOrigin =
          event.clientX === 0 && event.clientY === 0
            ? null
            : { x: event.clientX, y: event.clientY };
        void applyThemeWithTransition(dark ? "light" : "dark", {
          origin: pointerOrigin,
          element: event.currentTarget,
          duration: transitionDuration,
        });
      }}
      className={cn(
        "flex size-9 cursor-pointer items-center justify-center rounded-2lg",
        "text-foreground-icon-secondary transition-[color,background-color,transform] duration-150 ease active:scale-[0.97]",
        "hover:bg-background-secondary-hover hover:text-foreground-icon-primary",
        "outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring",
        className,
      )}
    >
      <Icon className="theme-toggle-icon size-5" aria-hidden />
    </button>
  );
}
