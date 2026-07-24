/** @format */

import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  min: number;
  max: number;
  step: number;
  value: number;
  disabled?: boolean;
  className?: string;
  vertical?: boolean;
  focussable?: boolean;
  track?: { height?: string; color?: `#${string}` };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  thumb?: { height?: string; width?: string; color?: `#${string}` };
};

const component = forwardRef<HTMLInputElement, Props>(
  ({ disabled, min, max, step, value, track, thumb, focussable, onChange, className, vertical }, ref) => {
    return (
      <input
        min={min}
        max={max}
        ref={ref}
        step={step}
        type="range"
        value={value}
        disabled={disabled}
        onChange={onChange}
        onFocus={(e) => !focussable && e.target.blur()}
        style={
          {
            "--track-h": track?.height || "3px",
            "--track-color": track?.color || "#505050",

            "--thumb-w": thumb?.width || "10px",
            "--thumb-h": thumb?.height || "10px",
            "--thumb-color": thumb?.color || "var(--accent-color)",

            "--progress": `${(value / max) * 100 || 0}%`,
          } as React.CSSProperties
        }
        className={twMerge(
          (vertical ? "h-full w-(--track-h) [direction:rtl] [writing-mode:vertical-lr] " : "h-(--track-h) w-full ") +
            "cursor-pointer appearance-none rounded-full " +
            "[&::-moz-range-thumb]:opacity-0 [&::-webkit-slider-thumb]:opacity-0 " +
            "[&::-moz-range-thumb]:border-0 [&::-webkit-slider-thumb]:appearance-none " +
            "[&::-moz-range-thumb]:rounded-full [&::-webkit-slider-thumb]:rounded-full " +
            "[&::-moz-range-thumb]:h-(--thumb-h) [&::-webkit-slider-thumb]:h-(--thumb-h) " +
            "[&::-moz-range-thumb]:w-(--thumb-w) [&::-webkit-slider-thumb]:w-(--thumb-w) " +
            "[&::-moz-range-thumb]:cursor-pointer [&::-webkit-slider-thumb]:cursor-pointer " +
            "[&:hover::-moz-range-thumb]:opacity-100 [&:hover::-webkit-slider-thumb]:opacity-100 " +
            "[&::-moz-range-thumb]:transition-opacity [&::-webkit-slider-thumb]:transition-opacity " +
            "[&::-moz-range-thumb]:bg-(--thumb-color) [&::-webkit-slider-thumb]:bg-(--thumb-color) " +
            (vertical
              ? "bg-[linear-gradient(to_top,var(--thumb-color)_var(--progress),var(--track-color)_var(--progress))]"
              : "bg-[linear-gradient(to_right,var(--thumb-color)_var(--progress),var(--track-color)_var(--progress))]"),
          className,
        )}
      />
    );
  },
);

export default component;
