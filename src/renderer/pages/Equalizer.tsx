/** @format */

import { playerEffects } from "../stores";
import { presets } from "../utils/presets";
import { FaCaretDown } from "react-icons/fa6";
import Slider from "../components/utils/Slider";
import { frequencies } from "../player/equalizer";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { LuPower, LuRotateCw, LuSlidersVertical } from "react-icons/lu";

// I don't like the way this is done, but I'm too fcuked to change it

export const Equalizer = memo(() => {
  const lim = 12;
  const [lastX, setLastX] = useState(0);
  const [firstX, setFirstX] = useState(0);
  const [points, setPoints] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const sliderRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [fx, setFX] = playerEffects.use();

  const updatePoints = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    setContainerHeight(containerRect.height);

    const pts = sliderRefs.current
      .map((slider, i) => {
        if (!slider) return null;
        const rect = slider.getBoundingClientRect();
        const percent = (fx.EQ[i]! + lim) / (lim * 2);
        const x = rect.left + rect.width / 2 - containerRect.left;
        const y = rect.bottom - percent * rect.height - containerRect.top;
        return { x, y };
      })
      .filter(Boolean) as { x: number; y: number }[];

    if (!pts.length) return;
    setFirstX(pts[0]!.x);
    setLastX(pts[pts.length - 1]!.x);
    setPoints(pts.map((p) => `${p.x},${p.y}`).join(" "));
  };

  useEffect(() => {
    updatePoints();

    const observer = new ResizeObserver(updatePoints);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [fx.EQ]);

  const flat = useMemo(() => presets.find((p) => p.name === "Flat")!, [presets]);

  const [show, setShow] = useState(false);
  const [preset, setPreset] = useState(presets.find((p) => p.name === localStorage.getItem("EQN")) ?? flat);

  useEffect(() => setFX((_) => ({ ..._, EQ: [...preset!.EQ] })), []);

  return (
    <div className="flex h-full w-full flex-col gap-10 overflow-hidden p-10 pb-5">
      <div className="flex h-fit items-center justify-between">
        <div className="flex h-fit w-fit items-center gap-3">
          <button children={<LuSlidersVertical />} className="flex cursor-pointer items-center justify-center rounded-full border-2 p-1 text-sm text-(--accent-color) active:scale-95" />
          <div className="flex w-full flex-row gap-1 text-base font-medium">Equalizer</div>
        </div>

        <div className="relative flex h-fit w-fit items-center gap-3 pr-5">
          <div
            onClick={() => setShow(!show)}
            className="relative flex h-fit w-50 flex-row items-center gap-1.5 rounded-md border-2 border-(--border-color)/20 bg-transparent px-2 pt-0.75 pb-1.25 text-xs font-medium backdrop-blur-sm"
          >
            <div className="text-sm" children={preset?.icon} />
            <div>{preset?.name}</div>
            <FaCaretDown className={"pointer-events-none absolute right-3 opacity-70 transition-all duration-100 " + (show ? "-rotate-180" : "")} />
          </div>

          {show && (
            <div className="absolute top-8 z-50 flex h-fit max-h-[20dvh] w-50 scrollbar-none flex-col overflow-y-auto rounded-md border-2 border-(--border-color)/20 bg-transparent backdrop-blur-sm">
              {presets.map((preset, i, arr) => (
                <div
                  key={preset.name}
                  onClick={() => (setFX((_) => ({ ..._, EQ: preset.EQ })), setPreset(preset), setShow(false), localStorage.setItem("EQN", preset.name))}
                  className={
                    "flex w-full cursor-pointer items-center gap-1.5 border-(--border-color)/20 bg-(--hover-color)/5 px-2 py-0.5 text-sm hover:bg-(--hover-color)/20 " +
                    (i === arr.length - 1 ? "" : "border-b")
                  }
                >
                  <div>{preset.icon}</div>
                  <div>{preset.name}</div>
                </div>
              ))}
            </div>
          )}

          <button
            children={<LuPower />}
            style={{ opacity: fx.EQenabled ? 1 : 0.5 }}
            onClick={() => setFX((_) => ({ ..._, EQenabled: !fx.EQenabled }))}
            className="flex cursor-pointer items-center justify-center rounded-full border-2 p-1 text-sm text-(--accent-color) active:scale-95"
          />

          <button
            children={<LuRotateCw />}
            onClick={() => {
              if (preset?.name === "Custom") localStorage.setItem("CEQ", JSON.stringify(flat.EQ));
              else (localStorage.setItem("EQN", "Flat"), setPreset(flat));
              setFX((_) => ({ ..._, EQ: flat.EQ }));
            }}
            className="flex cursor-pointer items-center justify-center rounded-full border-2 p-1 text-sm text-(--accent-color) active:scale-95"
          />
        </div>
      </div>

      <div className="flex h-full w-full flex-col items-center justify-center gap-5" style={{ opacity: fx.EQenabled ? 1 : 0.5 }}>
        <div className="grid w-full grid-cols-15">
          {frequencies.map((_, i) => (
            <div className="text-center text-xs font-bold text-nowrap opacity-70" children={`${fx.EQ[i]!.toFixed(1)} dB`} />
          ))}
        </div>

        <div className="relative flex h-fit w-full" ref={containerRef}>
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="var(--hover-color)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={`${points} ${lastX},${containerHeight} ${firstX},${containerHeight}`} fill="url(#fillGradient)" />
            <polyline points={points} fill="none" stroke="var(--accent-color)" strokeWidth="2" />
          </svg>

          <div className="pointer-events-none absolute top-0 left-0 text-start text-[10px]" children="+12" />
          <div className="pointer-events-none absolute bottom-[50%] left-0 text-start text-[10px]" children="0" />
          <div className="pointer-events-none absolute bottom-0 left-0 text-start text-[10px]" children="-12" />
          <div className="pointer-events-none absolute bottom-[0%] left-0 w-full border opacity-4" />
          <div className="pointer-events-none absolute bottom-[10%] left-0 w-full border opacity-4" />
          <div className="pointer-events-none absolute bottom-[20%] left-0 w-full border opacity-4" />
          <div className="pointer-events-none absolute bottom-[30%] left-0 w-full border opacity-4" />
          <div className="pointer-events-none absolute bottom-[40%] left-0 w-full border opacity-4" />
          <div className="pointer-events-none absolute bottom-[50%] left-0 w-full border opacity-4" />
          <div className="pointer-events-none absolute bottom-[60%] left-0 w-full border opacity-4" />
          <div className="pointer-events-none absolute bottom-[70%] left-0 w-full border opacity-4" />
          <div className="pointer-events-none absolute bottom-[80%] left-0 w-full border opacity-4" />
          <div className="pointer-events-none absolute bottom-[90%] left-0 w-full border opacity-4" />
          <div className="pointer-events-none absolute bottom-full left-0 w-full border opacity-4" />

          <div className="grid h-fit w-full grid-cols-15">
            {frequencies.map((_, i) => (
              <div className="z-10 flex h-fit flex-col items-center">
                <Slider
                  min={0}
                  vertical
                  step={0.1}
                  max={lim * 2}
                  value={fx.EQ[i]! + lim}
                  disabled={!fx.EQenabled}
                  ref={(el) => void (sliderRefs.current[i] = el)}
                  className="h-[42dvh] [&::-webkit-slider-thumb]:opacity-100"
                  onChange={(e) => {
                    setFX((_) => {
                      _.EQ[i] = Number(e.target.value) - lim;
                      localStorage.setItem("CEQ", JSON.stringify(_.EQ));
                      if (preset?.name !== "Custom") {
                        localStorage.setItem("EQN", "Custom");
                        setPreset(presets.find((p) => p.name === "Custom")!);
                      }
                      return { ..._, EQ: [..._.EQ] };
                    });
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid w-full grid-cols-15">
          {frequencies.map((f) => (
            <div className="text-center text-xs font-bold text-nowrap opacity-70" children={`${f < 1000 ? `${f} ` : `${f / 1000} k`}Hz`} />
          ))}
        </div>
      </div>
    </div>
  );
});
