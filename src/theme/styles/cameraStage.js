import {
  COMPACT,
  NARROW,
  PHONE,
  PHONE_PORTRAIT,
  SHORT_LANDSCAPE,
  TABLET,
  TINY_PORTRAIT,
} from "../breakpoints.js";

/**
 * MUI styles for the camera stage (CameraStage): the framed video grid, its
 * label, and the countdown / waiting overlays that float above it.
 *
 * On a portrait phone the stage is ordered above the share panel and takes its
 * content height; `useCameraTileSizing` reads `--tile-max-height` to size the
 * tiles width-first inside that budget.
 */
export const cameraStageStyles = {
  stage: {
    position: "relative",
    order: 2,
    display: "flex",
    minHeight: 0,
    flexDirection: "column",
    p: 1.625,
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "20px",
    background: "linear-gradient(145deg, rgba(47,39,54,0.9), rgba(30,27,40,0.94))",
    boxShadow: "0 22px 60px rgba(0,0,0,0.24), inset 0 1px rgba(255,255,255,0.045)",
    "@media (min-width: 1600px)": { p: 1.75 },
    [TABLET]: { p: 1.375, borderRadius: "16px" },
    [PHONE]: { p: 1.125, borderRadius: "13px" },
    [PHONE_PORTRAIT]: { order: 1, borderRadius: "12px" },
    [TINY_PORTRAIT]: { p: 1 },
  },
  stageLabel: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    mb: 1.125,
    ml: 0.25,
    color: "rgba(255,250,247,0.55)",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1.4,
    // Float the label over the first tile instead of spending a stage row.
    [COMPACT]: {
      position: "absolute",
      zIndex: 2,
      top: 8,
      left: 8,
      mb: 0,
      ml: 0,
      px: 0.875,
      py: "3px",
      border: "1px solid rgba(255,255,255,0.14)",
      borderRadius: "99px",
      backgroundColor: "rgba(22,19,30,0.72)",
      fontSize: 8,
      backdropFilter: "blur(8px)",
    },
  },
  // The stage dot itself is a StatusDot atom rendered by CameraStage.
  //
  // An equal-track grid: useCameraTileSizing sets exactly as many tracks as the
  // scored column count, so rows cannot greedily fit an extra tile. Each tile
  // keeps its computed width inside its centred track (mixed device ratios
  // would overflow a max-content grid), and rows are centred on both axes.
  videoGroup: {
    display: "grid",
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    justifyItems: "center",
    alignItems: "center",
    alignContent: "center",
    justifyContent: "center",
    gap: 1.5,
    "@media (min-width: 1600px)": { gap: 2 },
    [TABLET]: { gap: 1.25 },
    [PHONE]: { gap: 0.75 },
    [NARROW]: { gap: 0.5 },
    [PHONE_PORTRAIT]: {
      // Width-first sizing: the hook fits the tiles inside this height budget,
      // then reports the shorter content height back to the grid.
      "--tile-max-height": "52dvh",
      flex: "0 0 auto",
      gap: 0.5,
    },
    [TINY_PORTRAIT]: { gap: 0.375 },
  },
};

/** The 3-2-1 countdown bubble and its "Shot n of 4" label. */
export const countdownOverlayStyles = {
  wrap: {
    position: "absolute",
    zIndex: 2,
    top: "50%",
    left: "50%",
    display: "grid",
    justifyItems: "center",
    gap: 1,
    transform: "translate(-50%, -50%)",
  },
  countdown: {
    display: "grid",
    width: 104,
    height: 104,
    placeItems: "center",
    border: "1px solid rgba(255,250,247,0.7)",
    borderRadius: "50%",
    backgroundColor: "rgba(23,20,35,0.72)",
    color: "#fffaf7",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: 52,
    boxShadow: "0 0 0 9px rgba(255,255,255,0.08)",
    backdropFilter: "blur(5px)",
  },
  shotLabel: {
    px: 1.25,
    py: "3px",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "99px",
    backgroundColor: "rgba(22,19,30,0.78)",
    color: "rgba(255,250,247,0.86)",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.02em",
    whiteSpace: "nowrap",
    backdropFilter: "blur(8px)",
  },
};

/** The bottom "waiting for guests" banner. */
export const waitingBannerStyles = {
  position: "absolute",
  zIndex: 1,
  right: 2,
  bottom: 2,
  left: 2,
  display: "flex",
  width: "fit-content",
  maxWidth: "calc(100% - 32px)",
  alignItems: "center",
  justifyContent: "center",
  gap: 1.125,
  mx: "auto",
  p: "8px 12px",
  border: "1px solid rgba(255,255,255,0.13)",
  borderRadius: "99px",
  backgroundColor: "rgba(22,19,30,0.78)",
  color: "rgba(255,250,247,0.61)",
  fontSize: 11,
  textAlign: "center",
  backdropFilter: "blur(8px)",
  "& svg": { display: "block", width: 19, height: 16 },
  [PHONE]: {
    right: 1.25,
    bottom: 1.25,
    left: 1.25,
    maxWidth: "calc(100% - 20px)",
    p: "6px 9px",
    fontSize: 10,
  },
  [SHORT_LANDSCAPE]: {
    right: 1,
    bottom: 1,
    left: 1,
    maxWidth: "calc(100% - 16px)",
    p: "4px 8px",
    fontSize: 9,
  },
};
