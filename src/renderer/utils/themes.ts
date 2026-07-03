/** @format */

export type Theme = {
  blur: `${string}px`;
  color: `#${string}`;
  backgrground: string;
  type: "dark" | "light";
  tint: { black: { overall: number; bars: number }; white: { overall: number; bars: number } };
};

export const themes: Theme[] = [
  {
    blur: "15px",
    type: "dark",
    color: "#82B4C9",
    tint: { black: { overall: 0.5, bars: 0.3 }, white: { overall: 0, bars: 0 } },
    backgrground: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMfzh8dZMx6TbHewU4Y0NHu7nusR0EOTFxSg&s",
  },
  {
    blur: "16px",
    type: "dark",
    color: "#FFAA33",
    tint: { black: { overall: 0.5, bars: 0.3 }, white: { overall: 0, bars: 0 } },
    backgrground:
      "https://images.unsplash.com/photo-1572971916307-8cf6b4f5200d?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    // "https://images.unsplash.com/photo-1603174373801-9f4695294f07?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    blur: "15px",
    type: "light",
    color: "#588888",
    tint: { black: { overall: 0, bars: 0 }, white: { overall: 0.3, bars: 0.15 } },
    backgrground:
      "https://images.unsplash.com/photo-1520227403038-be195e6e2a91?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    blur: "10px",
    type: "dark",
    color: "#FF88BB",
    tint: { black: { overall: 0.5, bars: 0.2 }, white: { overall: 0, bars: 0 } },
    backgrground:
      "https://images.unsplash.com/photo-1773746685112-647c4f81344c?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    blur: "10px",
    type: "dark",
    color: "#99cc22",
    tint: { black: { overall: 0.6, bars: 0.2 }, white: { overall: 0, bars: 0 } },
    backgrground:
      "https://images.unsplash.com/photo-1520121401995-928cd50d4e27?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    blur: "10px",
    type: "dark",
    color: "#AA53BB",
    tint: { black: { overall: 0.65, bars: 0.5 }, white: { overall: 0.1, bars: 0.02 } },
    backgrground:
      "https://images.unsplash.com/photo-1655039448514-833b60a552e1?q=80&w=859&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    blur: "12px",
    type: "dark",
    color: "#AA53BB",
    tint: { black: { overall: 0.82, bars: 0.025 }, white: { overall: 0.3, bars: 0.03 } },
    backgrground:
      "https://images.unsplash.com/photo-1655039448514-833b60a552e1?q=80&w=859&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    blur: "12px",
    type: "dark",
    color: "#AA88CC",
    tint: { black: { overall: 0.5, bars: 0.3 }, white: { overall: 0, bars: 0 } },
    backgrground: "https://cdn.hentaigifz.com/82570/anime-boobs.gif",
  },
];
