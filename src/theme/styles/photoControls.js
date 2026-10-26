import {
  PHONE,
  PHONE_PORTRAIT,
  SHORT_LANDSCAPE,
  TABLET,
} from "../breakpoints.js";

/**
 * MUI styles for the booth control bar (PhotoControls): the frosted panel and
 * the action grid. On a portrait phone the primary action takes its own full
 * row above three equal secondary buttons; a short landscape phone stacks the
 * same buttons in the right-hand rail.
 */
export const photoControlsPanelStyles = {
  order: 3,
  display: "flex",
  minWidth: 0,
  alignItems: "center",
  gap: 1.5,
  p: "10px 12px",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "18px",
  background: "linear-gradient(155deg, rgba(47,39,54,0.88), rgba(30,27,40,0.94))",
  boxShadow: "0 18px 45px rgba(0,0,0,0.19), inset 0 1px rgba(255,255,255,0.04)",
  "& .MuiButton-root": {
    width: "100%",
    minHeight: 44,
    px: 1.75,
    borderRadius: "10px",
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1.2,
    "&:focus-visible": { outline: "2px solid #f4c66d", outlineOffset: 3 },
    "&:disabled": { cursor: "not-allowed", opacity: 0.55 },
  },
  "& .capture-icon": { display: "block", width: 17, height: 14, flex: "0 0 auto" },
  [TABLET]: { gap: 1.25, p: "9px 11px" },
  "@media (min-width: 1600px)": { gap: 1.75, p: "12px 16px" },
  "@media (max-height: 720px) and (min-width: 641px)": {
    gap: 1,
    p: "8px 10px",
    "& .MuiButton-root": { minHeight: 36 },
  },
  [PHONE]: {
    gap: 0.75,
    p: "10px",
    borderRadius: "14px",
    borderColor: "rgba(255,255,255,0.10)",
    // One text size and one tap height for every dock button: the secondary
    // labels ("Turn camera off") are long enough to wrap if the primary is
    // allowed to be bigger than its neighbours.
    "& .MuiButton-root": { minHeight: 48, px: 0.5, fontSize: 12 },
  },
  [PHONE_PORTRAIT]: {
    "& .MuiButton-root": { minHeight: 50 },
  },
  [SHORT_LANDSCAPE]: {
    gap: 0.5,
    p: 0.75,
    borderRadius: "12px",
    borderColor: "rgba(255,255,255,0.10)",
    "& .MuiButton-root": { minHeight: 40, px: 0.5, fontSize: 11 },
  },
};

export const photoControlsActionsStyles = {
  display: "grid",
  flex: 1,
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 1.125,
  [PHONE]: { gap: 0.75 },
  [PHONE_PORTRAIT]: {
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 0.625,
  },
  [SHORT_LANDSCAPE]: {
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: 0.5,
  },
};

/**
 * Explicit grid slots for the portrait dock. The primary action spans the
 * first row; camera, photos and leave share the second. `sx` objects with only
 * a media query stay inert on every other layout.
 */
export const photoControlSlotStyles = {
  camera: { [PHONE_PORTRAIT]: { gridColumn: "1", gridRow: "2" } },
  takePhoto: { [PHONE_PORTRAIT]: { gridColumn: "1 / -1", gridRow: "1" } },
  photos: { [PHONE_PORTRAIT]: { gridColumn: "2", gridRow: "2" } },
  leave: { [PHONE_PORTRAIT]: { gridColumn: "3", gridRow: "2" } },
};
