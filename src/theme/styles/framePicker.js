/**
 * MUI styles for the frame picker (FramePicker): its fieldset, the theme-group
 * toggles, the scrollable options grid, and the frame thumbnail preview window.
 */
export const framePickerStyles = {
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
  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
    gap: 1.125,
    maxHeight: 260,
    overflowY: "auto",
    overscrollBehavior: "contain",
    p: 0.125,
    "@media (max-width: 640px)": {
      gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))",
      maxHeight: 220,
    },
  },
  note: { mt: 1, mb: 0, color: "rgba(255,250,247,0.48)", fontSize: 10 },
};

/** The segmented control used to switch frame theme groups. */
export const frameGroupTabsStyles = {
  display: "flex",
  flexWrap: "wrap",
  gap: 0.5,
  mb: 1.25,
  "& .MuiToggleButton-root": {
    minWidth: 0,
    px: 1.25,
    py: 0.5,
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "99px !important",
    color: "rgba(255,250,247,0.72)",
    fontSize: 10,
    fontWeight: 600,
    textTransform: "none",
    "&.Mui-selected": {
      borderColor: "#e9a77f",
      backgroundColor: "rgba(233,167,127,0.16)",
      color: "#fffaf7",
    },
  },
};

/** The frame option's preview window surface and thumbnail image. */
export const framePreviewBoxStyles = { backgroundColor: "rgba(0,0,0,0.35)" };

export function frameThumbnailStyles(compact) {
  return { height: compact ? 52 : 62 };
}

export const frameThumbnailImageStyles = {
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "contain",
};
