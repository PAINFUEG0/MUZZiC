/** @format */

import { useEffect, useRef } from "react";

const LAYER_COUNT = 3;
const FRAME_INTERVAL = 1000 / 15;
const BASE_LAYER_SCALES = [1, 1.26, 0.6];

const randomAngle = () => Math.random() * Math.PI * 2;
const randomRange = (min: number, max: number) => min + Math.random() * (max - min);
const jitter = (base: number, pct: number) => base * (1 + (Math.random() * 2 - 1) * pct);

function createWander(min: number, max: number, ease: number, initialValue?: number) {
  const minInterval = 500;
  const maxInterval = 1500;
  return {
    min,
    max,
    ease,
    minInterval,
    maxInterval,
    target: randomRange(min, max),
    timer: randomRange(0, maxInterval),
    value: initialValue ?? randomRange(min, max),
  };
}

function updateWander(w: ReturnType<typeof createWander>, dt: number) {
  w.timer -= dt;
  if (w.timer <= 0) {
    w.timer = randomRange(w.minInterval, w.maxInterval);
    w.target = randomRange(w.min, w.max);
  }
  return (w.value += (w.target - w.value) * Math.min(1, w.ease * dt));
}

function createLayerState(i: number) {
  return {
    rotAngleDeg: randomRange(0, 360),
    rotSpeed: createWander(-40, 40, 0.4),

    orbitAngleDeg: randomRange(0, 360),
    orbitSpeed: createWander(-25, 25, 0.35),
    orbitRadius: randomRange(0.15, 0.55),

    driftX: createWander(-0.35, 0.35, 0.5, 0),
    driftY: createWander(-0.35, 0.35, 0.5, 0),

    scale: jitter(BASE_LAYER_SCALES[i] ?? 1.3, 0.1),
    stretchX: randomRange(0.85, 1.25),
    stretchY: randomRange(0.85, 1.25),

    skewXBase: randomRange(-12, 12),
    skewYBase: randomRange(-12, 12),
    skewSpeed: randomRange(0.05, 0.13),
    skewPhase: randomAngle(),
  };
}

type LayerRef = { wrapper: HTMLDivElement | null; state: ReturnType<typeof createLayerState> };

const STAGE_STYLE: React.CSSProperties = {
  inset: "-25%",
  width: "150%",
  height: "150%",
  position: "absolute",
  filter: "var(--webgl-post-process, brightness(0.7) saturate(1.25) contrast(0.95))",
};

export default function DynamicBackground({ artworkUrl, alt }: { artworkUrl: string; alt: string }) {
  const layerRefs = useRef<LayerRef[]>(Array.from({ length: LAYER_COUNT }, (_, i) => ({ wrapper: null, state: createLayerState(i) })));

  const lastDrawTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Respect reduced-motion: skip the animation loop entirely (no GPU cost,
    // no battery drain) and just leave the layers at their random starting pose.
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    function tick(timestamp: number) {
      const elapsed = timestamp - lastDrawTimeRef.current;
      if (elapsed < FRAME_INTERVAL) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const dt = Math.min(elapsed / 1000, 0.1);
      lastDrawTimeRef.current = timestamp - (elapsed % FRAME_INTERVAL);
      const nowSec = lastDrawTimeRef.current / 1000;

      for (const layer of layerRefs.current) {
        const s = layer.state;

        s.rotAngleDeg += updateWander(s.rotSpeed, dt) * dt;

        s.orbitAngleDeg += updateWander(s.orbitSpeed, dt) * dt;
        const orbitRad = s.orbitAngleDeg * (Math.PI / 180);

        const driftX = updateWander(s.driftX, dt);
        const driftY = updateWander(s.driftY, dt);

        const xPct = (s.orbitRadius * Math.cos(orbitRad) + driftX) * 50;
        const yPct = (s.orbitRadius * Math.sin(orbitRad) + driftY) * 50;

        const scaleX = s.scale * s.stretchX;
        const scaleY = s.scale * s.stretchY;

        const skewX = s.skewXBase * Math.sin(nowSec * s.skewSpeed + s.skewPhase);
        const skewY = s.skewYBase * Math.sin(nowSec * s.skewSpeed * 0.8 + s.skewPhase + 1.7);

        if (layer.wrapper) {
          layer.wrapper.style.transform = `translate3d(${xPct}%, ${yPct}%, 0) rotate(${s.rotAngleDeg}deg) skew(${skewX}deg, ${skewY}deg) scale(${scaleX}, ${scaleY})`;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    // Stop rendering while the tab/window isn't visible — the animation is purely
    // decorative, so there's no reason to keep the compositor busy in the background.
    function handleVisibilityChange() {
      if (document.hidden) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden contain-[layout_paint_size]">
      <div style={STAGE_STYLE}>
        {layerRefs.current.map((layer, i) => (
          <div
            key={i}
            ref={(el) => {
              layer.wrapper = el;
            }}
            style={{ width: "60%", height: "60%", margin: "-30% 0 0 -30%" }}
            className="absolute top-1/2 left-1/2 origin-[50%_50%] will-change-transform"
          >
            <img src={artworkUrl} onError={(e) => (e.currentTarget.src = alt)} className="absolute inset-0 h-full w-full object-cover opacity-50" />
          </div>
        ))}
      </div>
    </div>
  );
}
