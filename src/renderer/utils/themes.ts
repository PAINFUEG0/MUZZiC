/** @format */

export type Theme = {
  blur: `${string}px`;
  color: `#${string}`;
  type: "dark" | "light";
  backgrground: string;
  tint: { black: { overall: number; bars: number }; white: { overall: number; bars: number } };
};

export const themes: Theme[] = [
  {
    blur: "10px",
    type: "light",
    color: "#799999",
    tint: { black: { overall: 0, bars: 0 }, white: { overall: 0.1, bars: 0.15 } },
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
    tint: { black: { overall: 0.6, bars: 0.4 }, white: { overall: 0, bars: 0 } },
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
];
