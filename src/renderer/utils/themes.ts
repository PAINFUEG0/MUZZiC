/** @format */

export type Theme = {
  name: "";
  preview: "";
  blur: `${string}px`;
  color: `#${string}`;
  background: string;
  type: "dark" | "light";
  tint: { black: { overall: number; bars: number }; white: { overall: number; bars: number } };
};

export const themes: Theme[] = [
  {
    name: "",
    preview: "",
    blur: "15px",
    type: "dark",
    color: "#82B4C9",
    tint: { black: { overall: 0.5, bars: 0.3 }, white: { overall: 0, bars: 0 } },
    background: "brook.jpg",
  },
  {
    name: "",
    preview: "",
    blur: "16px",
    type: "dark",
    color: "#FF7722",
    tint: { black: { overall: 0.5, bars: 0.3 }, white: { overall: 0, bars: 0 } },
    background: "pumpkin-orange.jpg",
  },
  {
    name: "",
    preview: "",
    blur: "16px",
    type: "dark",
    color: "#FF9922",
    tint: { black: { overall: 0.5, bars: 0.3 }, white: { overall: 0, bars: 0 } },
    background: "pumpkin-yellow.jpg",
  },
  {
    name: "",
    preview: "",
    blur: "15px",
    type: "light",
    color: "#588888",
    tint: { black: { overall: 0, bars: 0 }, white: { overall: 0.3, bars: 0.15 } },
    background: "white-flowers.jpg",
  },
  {
    name: "",
    preview: "",
    blur: "10px",
    type: "dark",
    color: "#FF88BB",
    tint: { black: { overall: 0.5, bars: 0.2 }, white: { overall: 0, bars: 0 } },
    background: "cherry-blossom.jpg",
  },
  {
    name: "",
    preview: "",
    blur: "10px",
    type: "dark",
    color: "#99cc22",
    tint: { black: { overall: 0.6, bars: 0.2 }, white: { overall: 0, bars: 0 } },
    background: "green-leaves.jpg",
  },
  {
    name: "",
    preview: "",
    blur: "10px",
    type: "dark",
    color: "#AA53BB",
    tint: { black: { overall: 0.65, bars: 0.5 }, white: { overall: 0.1, bars: 0.02 } },
    background: "violet-flowers.jpg",
  },
  {
    name: "",
    preview: "",
    blur: "12px",
    type: "dark",
    color: "#AA53BB",
    tint: { black: { overall: 0.82, bars: 0.025 }, white: { overall: 0.3, bars: 0.03 } },
    background: "violet-flowers.jpg",
  },
  {
    name: "",
    preview: "",
    blur: "5px",
    type: "dark",
    color: "#82FFC9",
    tint: { black: { overall: 0.5, bars: 0.3 }, white: { overall: 0, bars: 0 } },
    background: "kuroshitsuji.png",
  },
  {
    name: "",
    preview: "",
    blur: "8px",
    type: "dark",
    color: "#9988FF",
    tint: { black: { overall: 0.5, bars: 0.3 }, white: { overall: 0, bars: 0 } },
    background: "purple-blue-leaves.png",
  },
  {
    name: "",
    preview: "",
    blur: "10px",
    type: "dark",
    color: "#FF2222",
    tint: { black: { overall: 0.5, bars: 0.4 }, white: { overall: 0.05, bars: 0 } },
    background: "red-guitarist.png",
  },
  // {
  //   name:"",
  // preview:"",
  // blur: "12px",
  //   type: "dark",
  //   color: "#AA88CC",
  //   tint: { black: { overall: 0.5, bars: 0.3 }, white: { overall: 0, bars: 0 } },
  //   backgrground: "https://cdn.hentaigifz.com/82570/anime-boobs.gif",
  // },
];
