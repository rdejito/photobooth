import { NARROW } from "../breakpoints.js";

/**
 * MUI styles for the layout picker (LayoutPicker): its fieldset, the options
 * grid and the miniature layout-sample illustrations drawn inside each option.
 */
export const layoutPickerStyles = {
  fieldset: {
    width: "100%",
    minWidth: 0,
    m: 0,
    p: 0,
    border: 0,
    "& legend": {
      mb: 1.25,
      px: 0.125,
      color: "rgba(255,250,247,0.86)",
      fontSize: 13,
      fontWeight: 600,
    },
  },
  options: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 1.125,
  },
  compactOptions: {
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    [NARROW]: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
  },
  previewBox: {
    backgroundColor: "rgba(255,255,255,0.07)",
  },
};

export function layoutSampleBoxStyles(compact) {
  return { height: compact ? 42 : 52 };
}

/** Base outlines for each layout's miniature sample. */
export const SAMPLE_STYLES = {
  "single-horizontal": { width: "92%", height: 26, borderRadius: 8 },
  "single-vertical": { width: 18, height: 40, borderRadius: 8 },
  "grid-2x2": {
    width: "92%",
    height: 38,
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 2,
    padding: 0,
  },
};

/** One gradient tile inside the sample (the 2x2 grid draws four). */
export const layoutSampleTileStyles = {
  minWidth: 0,
  background: "linear-gradient(145deg, rgba(233,167,127,0.8), rgba(230,216,202,0.72))",
  borderRadius: "4px",
  opacity: 0.9,
};

/** Horizontal / vertical samples use a directional gradient. */
export function layoutSampleFillStyles(key, selected) {
  return {
    background: key === "single-vertical"
      ? "linear-gradient(180deg, rgba(233,167,127,0.9), rgba(196,150,228,0.72))"
      : "linear-gradient(90deg, rgba(233,167,127,0.95), rgba(196,150,228,0.72))",
    borderRadius: 8,
    boxShadow: selected ? "0 0 0 1px rgba(233,167,127,0.45)" : "none",
  };
}

export function layoutGridSampleStyles(selected) {
  return selected ? { boxShadow: "0 0 0 1px rgba(233,167,127,0.45)" } : {};
}
