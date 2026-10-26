/**
 * MUI styles for the camera photo-area guide (PhotoAreaGuide): the dashed
 * inset frame and its caption. The frame sits just inside the tile edge so it
 * reads as a marker rather than as the tile's own border.
 */
export const photoAreaGuideStyles = {
  layer: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },
  frame: {
    position: "absolute",
    inset: "5px",
    border: "1.5px dashed rgba(255,250,247,0.6)",
    borderRadius: "9px",
    "@media (max-width: 640px)": {
      inset: "4px",
      borderWidth: 1,
      borderRadius: "6px",
    },
  },
  caption: {
    position: "absolute",
    top: 4,
    left: 4,
    px: 0.5,
    py: "1px",
    borderRadius: "4px",
    backgroundColor: "rgba(22,19,30,0.62)",
    color: "rgba(255,250,247,0.9)",
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.6,
    lineHeight: 1.3,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
};
