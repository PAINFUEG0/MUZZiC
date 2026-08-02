/** @format */

import { dbfsToLevel } from "../../../shared/helpers";

const R = dbfsToLevel(-5);
const O = dbfsToLevel(-8);

const STATIC_BACKGROUND = `linear-gradient(
  to right,
  var(--accent-color) 0%,
  var(--accent-color) ${O}%,
  var(--warning-color, #fd974e) ${O}%,
  var(--warning-color, #fd974e) ${R}%,
  var(--danger-color, #ef4444) ${R}%,
  var(--danger-color, #ef4444) 100%
)`;

const DIM_BACKGROUND = `linear-gradient(
  to right,
  color-mix(in srgb, var(--accent-color) 25%, transparent) 0%,
  color-mix(in srgb, var(--accent-color) 25%, transparent) ${O}%,
  color-mix(in srgb, var(--warning-color, #fd974e) 25%, transparent) ${O}%,
  color-mix(in srgb, var(--warning-color, #fd974e) 25%, transparent) ${R}%,
  color-mix(in srgb, var(--danger-color, #ef4444) 25%, transparent) ${R}%,
  color-mix(in srgb, var(--danger-color, #ef4444) 25%, transparent) 100%
)`;

export function VUMeter({ dbfs }: { dbfs: number }) {
  const level = Math.round(dbfsToLevel(dbfs) * 10) / 10;
  return (
    <div
      className="relative h-2 w-full"
      style={{
        background: DIM_BACKGROUND,
        maskImage: "repeating-linear-gradient(90deg, #000 0 2px, transparent 2px 3px)",
        WebkitMaskImage: "repeating-linear-gradient(90deg, #000 0 2px, transparent 2px 3px)",
      }}
    >
      <div className="absolute inset-0 h-full" style={{ background: STATIC_BACKGROUND, clipPath: `inset(0 ${100 - level}% 0 0)` }} />
    </div>
  );
}
