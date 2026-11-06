"use client";

import { RiVolumeMuteLine, RiVolumeUpLine } from "@remixicon/react";
import { useEffect, useRef } from "react";
import {
  SensoryUIProvider,
  useSensoryUI,
} from "@/components/ui/sensory-ui/config/provider";
import type { SoundRole } from "@/components/ui/sensory-ui/config/sound-roles";

const MUTE_KEY = "brunex:muted";

/**
 * One delegated listener instead of wiring `playSound` into every link.
 * Any <a>/<button> taps on click (keyboard Enter/Space fire click too);
 * `data-sound="role"` picks a different role, `data-sound="off"` opts out.
 * `data-sound-hover` adds a whisper on mouse hover (never on touch).
 */
function SoundDelegate() {
  const { playSound, setMuted } = useSensoryUI();

  // The provider keeps mute in plain state; restore the visitor's choice.
  useEffect(() => {
    try {
      setMuted(localStorage.getItem(MUTE_KEY) === "1");
    } catch {}
  }, [setMuted]);

  useEffect(() => {
    let lastHover: Element | null = null;

    function onClick(e: MouseEvent) {
      const el = (e.target as Element).closest<HTMLElement>(
        "a, button, [data-sound]",
      );
      if (!el || el.matches(":disabled")) return;
      const role = el.dataset.sound ?? "interaction.tap";
      if (role !== "off") void playSound(role as SoundRole);
    }

    function onOver(e: PointerEvent) {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element).closest("[data-sound-hover]");
      if (el === lastHover) return;
      lastHover = el;
      if (el) void playSound("interaction.subtle", { volume: 0.5 });
    }

    document.addEventListener("click", onClick, true);
    document.addEventListener("pointerover", onOver);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("pointerover", onOver);
    };
  }, [playSound]);

  return null;
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  return (
    <SensoryUIProvider config={{ theme: "soft", volume: 0.3 }}>
      <SoundDelegate />
      {children}
    </SensoryUIProvider>
  );
}

export function SoundToggle() {
  const { muted, setMuted, playSound, reducedMotion } = useSensoryUI();
  // Turning sound on can't play through the stale (muted) playSound, so the
  // confirming pop fires once the provider has re-rendered unmuted.
  const justUnmuted = useRef(false);

  useEffect(() => {
    if (!muted && justUnmuted.current) {
      justUnmuted.current = false;
      void playSound("interaction.toggle");
    }
  }, [muted, playSound]);

  const Icon = muted ? RiVolumeMuteLine : RiVolumeUpLine;
  return (
    <button
      type="button"
      data-sound={muted ? "off" : "interaction.toggle"}
      aria-pressed={!muted}
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      title={
        reducedMotion
          ? "Sound is off because your system prefers reduced motion"
          : muted
            ? "Sound on"
            : "Sound off"
      }
      onClick={() => {
        const next = !muted;
        justUnmuted.current = !next;
        try {
          localStorage.setItem(MUTE_KEY, next ? "1" : "0");
        } catch {}
        // Let the delegate's click sound play before muting.
        queueMicrotask(() => setMuted(next));
      }}
      className="icon-btn"
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}
