import {
  NARROW,
  PHONE,
  SHORT_LANDSCAPE,
} from "../breakpoints.js";

/**
 * MUI styles for the booth header (BoothHeader): the brand lockup and the
 * connection-count pill.
 */
export const boothHeaderStyles = {
  header: {
    display: "flex",
    minHeight: 54,
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.09)",
    [PHONE]: { minHeight: 44 },
    [SHORT_LANDSCAPE]: { minHeight: 40 },
  },
  brand: {
    display: "inline-flex",
    alignItems: "center",
    gap: 1.25,
    color: "#fffaf7",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: 18,
    [PHONE]: { gap: 0.875, fontSize: 15 },
    [NARROW]: { gap: 0.75 },
    [SHORT_LANDSCAPE]: { fontSize: 15 },
  },
  brandMark: {
    display: "grid",
    width: 34,
    height: 30,
    placeItems: "center",
    border: "1px solid rgba(255,208,170,0.4)",
    borderRadius: "9px",
    color: "#ffc59d",
    backgroundColor: "rgba(233,167,127,0.09)",
    "& svg": { width: 22, height: 19 },
    [NARROW]: { width: 29, "& svg": { width: 19 } },
  },
};

/** The connection-count pill (ConnectionPill). */
export const connectionPillStyles = {
  display: "inline-flex",
  flexShrink: 0,
  alignItems: "center",
  gap: 0.75,
  px: 1.25,
  py: 0.75,
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "99px",
  backgroundColor: "rgba(255,255,255,0.035)",
  color: "rgba(255,250,247,0.65)",
  fontSize: 11,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  "&[data-connected='true'] .connection-dot": {
    backgroundColor: "#c9dfb2",
    boxShadow: "0 0 10px rgba(201,223,178,0.65)",
  },
  [PHONE]: { gap: 0.625, px: 1, py: 0.5, fontSize: 10 },
  [SHORT_LANDSCAPE]: { gap: 0.5, px: 0.875, py: 0.375, fontSize: 9 },
};

// The connection dot itself is a StatusDot atom rendered inside the pill; the
// "connected" state swaps its colour via the `.connection-dot` class below.
