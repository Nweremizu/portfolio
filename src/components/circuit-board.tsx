"use client";

import { useEffect, useRef, useState } from "react";
import { useSensoryUI } from "@/components/ui/sensory-ui/config/provider";

/*
 * A toy PCB drawn in SVG. SW1 is a real <button> laid over the switch
 * footprint: each press sends a pulse down the trace into U1, then out to the
 * LEDs, which show a 4-bit binary counter. Coordinates live in a 600×240
 * viewBox; the overlay button is positioned in the same units as percentages.
 */

const W = 600;
const H = 240;

const LED_Y = [60, 100, 140, 180];
/** Pin on U1 → resistor → LED anode, one per bit. */
const BIT_TRACES = [
  "M376 80 H395 L415 60 H508",
  "M376 100 H508",
  "M376 120 H395 L415 140 H508",
  "M376 140 H380 L420 180 H508",
];
const INPUT_TRACE = "M110 105 H160 L165 100 H214";
const POWER_TRACE = "M48 181 H150 L171 160 H214";

const PARTS = {
  J1: "J1 · USB-C · 5 V in",
  SW1: "SW1 · tactile switch · press it",
  U1: "U1 · ESP32-S3 · dual-core, 240 MHz, Wi-Fi",
  R: "R1–R4 · 220 Ω current limiters",
  D: "D1–D4 · LEDs · bits 0 to 3",
} as const;
type Part = keyof typeof PARTS;

const IN_MS = 380; // input pulse reaches U1
const OUT_MS = 420; // output pulse reaches the LEDs

export default function CircuitBoard() {
  const { playSound } = useSensoryUI();
  const [count, setCount] = useState(0); // what U1 "computed"
  const [shown, setShown] = useState(0); // what the LEDs show (lags the pulse)
  const [shot, setShot] = useState(0); // remount key that restarts the pulses
  const [pressed, setPressed] = useState(false);
  const [hover, setHover] = useState<Part | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function press() {
    const next = (count + 1) % 16;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setCount(next);
    setShot((s) => s + 1);
    setPressed(true);
    void playSound("interaction.toggle");
    timers.current.push(
      window.setTimeout(() => setPressed(false), 140),
      window.setTimeout(
        () => {
          setShown(next);
          if (next === 0) void playSound("notification.success");
        },
        reduced ? 0 : IN_MS + OUT_MS,
      ),
    );
  }

  const enter = (p: Part) => () => setHover(p);
  const leave = () => setHover(null);

  return (
    <div className="pcb">
      <div className="relative overflow-hidden rounded-2xl bg-card shadow-[inset_0_0_0_1px_var(--border)]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full font-mono"
          role="img"
          aria-label="A small circuit board: a switch wired to an ESP32-S3, which drives four LEDs through resistors."
        >
          <defs>
            <filter
              id="led-glow"
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          {/* Mounting holes */}
          {[
            [18, 18],
            [582, 18],
            [18, 222],
            [582, 222],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r={7} className="pcb-pad-fill" />
              <circle cx={x} cy={y} r={3.5} className="pcb-hole" />
            </g>
          ))}

          {/* Static copper */}
          <g className="pcb-trace">
            <path d={POWER_TRACE} />
            <path d={INPUT_TRACE} />
            {BIT_TRACES.map((d) => (
              <path key={d} d={d} />
            ))}
            {/* LED cathodes to the ground rail */}
            <path d="M529 60 H560 M529 100 H560 M529 140 H560 M529 180 H560 M560 48 V206" />
            {/* SW1 return and U1 bottom breakout to vias */}
            <path d="M85 130 V160 L95 170 H124" />
            <path d="M250 190 V206 M268 190 V214 M286 190 V206 M304 190 V214 M322 190 V206 M340 190 V214" />
          </g>
          <g className="pcb-via">
            {[
              [124, 170],
              [250, 206],
              [268, 214],
              [286, 206],
              [304, 214],
              [322, 206],
              [340, 214],
              [560, 206],
            ].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={3.2} />
            ))}
          </g>

          {/* Idle heartbeat on the 5 V line */}
          <path
            d={POWER_TRACE}
            pathLength={1}
            className="pcb-pulse pcb-pulse-idle"
          />

          {/* Pulses for the latest press */}
          {shot > 0 && (
            <g key={shot}>
              <path d={INPUT_TRACE} pathLength={1} className="pcb-pulse" />
              {BIT_TRACES.map((d, bit) =>
                count & (1 << bit) ? (
                  <path
                    key={d}
                    d={d}
                    pathLength={1}
                    className="pcb-pulse"
                    style={{ "--d": `${IN_MS}ms` } as React.CSSProperties}
                  />
                ) : null,
              )}
            </g>
          )}

          {/* J1: USB-C */}
          <g onPointerEnter={enter("J1")} onPointerLeave={leave}>
            <rect
              x={14}
              y={170}
              width={34}
              height={22}
              rx={7}
              className="pcb-part"
            />
            <rect
              x={21}
              y={177}
              width={20}
              height={8}
              rx={4}
              className="pcb-hole"
            />
            <text x={14} y={162} className="pcb-silk">
              J1 5V
            </text>
          </g>

          {/* SW1: tactile switch (the button overlay sits on top) */}
          <g>
            <rect
              x={60}
              y={80}
              width={50}
              height={50}
              rx={7}
              className="pcb-part"
            />
            {[
              [64, 84],
              [106, 84],
              [64, 126],
              [106, 126],
            ].map(([x, y]) => (
              <circle
                key={`${x}-${y}`}
                cx={x}
                cy={y}
                r={2}
                className="pcb-pad-fill"
              />
            ))}
            <circle
              cx={85}
              cy={105}
              r={14}
              className="pcb-cap"
              data-pressed={pressed || undefined}
            />
            <text x={60} y={72} className="pcb-silk">
              SW1
            </text>
          </g>

          {/* U1: ESP32-S3 module */}
          <g onPointerEnter={enter("U1")} onPointerLeave={leave}>
            {[80, 100, 120, 140, 160].map((y) => (
              <g key={y}>
                <rect
                  x={212}
                  y={y - 3}
                  width={10}
                  height={6}
                  rx={1.5}
                  className="pcb-pad-fill"
                />
                <rect
                  x={368}
                  y={y - 3}
                  width={10}
                  height={6}
                  rx={1.5}
                  className="pcb-pad-fill"
                />
              </g>
            ))}
            {[250, 268, 286, 304, 322, 340].map((x) => (
              <rect
                key={x}
                x={x - 3}
                y={186}
                width={6}
                height={8}
                rx={1.5}
                className="pcb-pad-fill"
              />
            ))}
            <rect
              x={220}
              y={50}
              width={150}
              height={140}
              rx={9}
              className="pcb-part"
            />
            {/* PCB antenna meander */}
            <path
              d="M234 84 V64 H246 V80 H258 V64 H270 V80 H282 V64 H294 V80 H306 V64 H318 V80 H330 V64 H342 V80 H356"
              className="pcb-antenna"
            />
            <rect
              x={232}
              y={96}
              width={126}
              height={82}
              rx={5}
              className="pcb-shield"
            />
            <text
              x={295}
              y={135}
              textAnchor="middle"
              className="pcb-chip-label"
            >
              ESP32-S3
            </text>
            <text x={295} y={150} textAnchor="middle" className="pcb-silk">
              {`0b${count.toString(2).padStart(4, "0")}`}
            </text>
            <circle cx={346} cy={166} r={3} className="pcb-status" />
            <text x={220} y={42} className="pcb-silk">
              U1
            </text>
          </g>

          {/* R1–R4 with colour bands */}
          <g onPointerEnter={enter("R")} onPointerLeave={leave}>
            {LED_Y.map((y, i) => (
              <g key={y}>
                <rect
                  x={428}
                  y={y - 6}
                  width={30}
                  height={12}
                  rx={4}
                  className="pcb-part"
                />
                <rect
                  x={434}
                  y={y - 6}
                  width={2.5}
                  height={12}
                  className="pcb-band-1"
                />
                <rect
                  x={440}
                  y={y - 6}
                  width={2.5}
                  height={12}
                  className="pcb-band-1"
                />
                <rect
                  x={446}
                  y={y - 6}
                  width={2.5}
                  height={12}
                  className="pcb-band-2"
                />
                <text x={428} y={y - 10} className="pcb-silk">
                  {`R${i + 1}`}
                </text>
              </g>
            ))}
          </g>

          {/* D1–D4 */}
          <g onPointerEnter={enter("D")} onPointerLeave={leave}>
            {LED_Y.map((y, bit) => {
              const on = Boolean(shown & (1 << bit));
              return (
                <g key={y} data-on={on || undefined} className="pcb-led">
                  <circle
                    cx={520}
                    cy={y}
                    r={16}
                    className="pcb-led-glow"
                    filter="url(#led-glow)"
                  />
                  <circle cx={520} cy={y} r={9} className="pcb-led-body" />
                  <text x={496} y={y - 11} className="pcb-silk">
                    {`D${bit + 1}`}
                  </text>
                </g>
              );
            })}
            <text x={548} y={232} className="pcb-silk">
              GND
            </text>
          </g>

          <text x={W - 34} y={232} textAnchor="end" className="pcb-silk">
            NB-01 REV A
          </text>
        </svg>

        <button
          type="button"
          data-sound="off"
          onClick={press}
          onPointerEnter={enter("SW1")}
          onPointerLeave={leave}
          onFocus={enter("SW1")}
          onBlur={leave}
          aria-label={`Press SW1. The LEDs show ${shown} in binary.`}
          className="absolute cursor-pointer rounded-xl"
          style={{
            left: `${(45 / W) * 100}%`,
            top: `${(65 / H) * 100}%`,
            width: `${(80 / W) * 100}%`,
            height: `${(80 / H) * 100}%`,
          }}
        />
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-4 font-mono text-xs text-secondary">
        <span className="min-w-0 truncate">
          {hover ? PARTS[hover] : "Press SW1 to count in binary"}
        </span>
        <span className="shrink-0 tabular-nums">
          {[3, 2, 1, 0].map((bit) => (
            <span
              key={bit}
              className={shown & (1 << bit) ? "text-foreground" : undefined}
            >
              {shown & (1 << bit) ? 1 : 0}
            </span>
          ))}
          <span> = {String(shown).padStart(2, "0")}</span>
        </span>
      </div>
    </div>
  );
}
