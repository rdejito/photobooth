/**
 * Palettes for the Pop family (pop, blush, noir, mint).
 *
 * The renderer is parameterized: the template is identical, only these colours
 * and the background `pattern` kind change between themes.
 */
export const POP_PALETTES = {
  pop: {
    frame: "#2B3FE0",
    accent: "#FFE24A",
    accentText: "#141414",
    pop: "#FF5CA8",
    text: "#FFFFFF",
    shadow: "#141414",
    slotBorder: "#FFFFFF",
    pattern: "dots",
    dotColor: "rgba(255,255,255,0.9)",
    gridColor: null,
  },
  blush: {
    frame: "#F9D5DF",
    accent: "#B0245A",
    accentText: "#FDF0F4",
    pop: "#FFE08A",
    text: "#5A1A33",
    shadow: "#5A1A33",
    slotBorder: "#FFFFFF",
    pattern: "dots",
    dotColor: "rgba(255,255,255,0.95)",
    gridColor: null,
  },
  noir: {
    frame: "#121212",
    accent: "#FFFFFF",
    accentText: "#121212",
    pop: "#FF3B3B",
    text: "#FFFFFF",
    shadow: "#FF3B3B",
    slotBorder: "#FFFFFF",
    pattern: "grid",
    dotColor: null,
    gridColor: "rgba(255,255,255,0.16)",
  },
  mint: {
    frame: "#BFE9D8",
    accent: "#0F5C45",
    accentText: "#F2FBF6",
    pop: "#FFD166",
    text: "#0B2E24",
    shadow: "#0B2E24",
    slotBorder: "#FFFFFF",
    pattern: "dots",
    dotColor: "rgba(11,46,36,0.22)",
    gridColor: null,
  },
};
