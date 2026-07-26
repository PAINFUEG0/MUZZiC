/** @format */

const dbfsToLevel = (dbfs: number) => Math.min(100, Math.max(0, ((60 + dbfs) * 3) / 1.8));

export function VUMeter({ dbfs }: { dbfs: number }) {
  const level = dbfsToLevel(dbfs);

  const ORANGEZONE_START = dbfsToLevel(-8);
  const REDZONE_START = dbfsToLevel(-5);

  const litNormal = Math.min(level, ORANGEZONE_START);
  const litOrangeEnd = Math.max(Math.min(level, REDZONE_START), ORANGEZONE_START);
  const litRedEnd = Math.max(level, REDZONE_START);

  const orangeLit = level > ORANGEZONE_START;
  const redLit = level > REDZONE_START;

  const accentLit = "var(--accent-color)";
  const accentDim = "color-mix(in srgb, var(--accent-color) 25%, transparent)";
  const orangeLitColor = "var(--warning-color, #fd974e)";
  const orangeDimColor = "color-mix(in srgb, var(--warning-color, #fd974e) 25%, transparent)";
  const redLitColor = "var(--danger-color, #ef4444)";
  const redDimColor = "color-mix(in srgb, var(--danger-color, #ef4444) 25%, transparent)";

  return (
    <div
      className="flex h-2 w-full"
      style={
        {
          "--level": `${level}%`,
          background: `linear-gradient(
            to right,
            ${accentLit} 0%,
            ${accentLit} ${litNormal}%,
            ${accentDim} ${litNormal}%,
            ${accentDim} ${ORANGEZONE_START}%,
            ${orangeLit ? orangeLitColor : orangeDimColor} ${ORANGEZONE_START}%,
            ${orangeLit ? orangeLitColor : orangeDimColor} ${litOrangeEnd}%,
            ${orangeDimColor} ${litOrangeEnd}%,
            ${orangeDimColor} ${REDZONE_START}%,
            ${redLit ? redLitColor : redDimColor} ${REDZONE_START}%,
            ${redLit ? redLitColor : redDimColor} ${litRedEnd}%,
            ${redDimColor} ${litRedEnd}%,
            ${redDimColor} 100%
          )`,
          maskImage: "repeating-linear-gradient(90deg, #000 0 2px, transparent 2px 3px)",
          WebkitMaskImage: "repeating-linear-gradient(90deg, #000 0 2px, transparent 2px 3px)",
        } as React.CSSProperties
      }
    />
  );
}
