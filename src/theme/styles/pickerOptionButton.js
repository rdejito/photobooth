import { PHONE, NARROW } from "../breakpoints.js";

/**
 * MUI styles for the shared picker option button (PickerOptionButton), used by
 * both the frame and layout pickers. Keeping the shell here is what lets the
 * two pickers share the exact same selection/hover behaviour.
 */

/** The outer selectable button; `selected` drives the accent treatment. */
export function optionButtonStyles(selected, compact) {
  return {
    display: "flex",
    minWidth: 0,
    flexDirection: "column",
    alignItems: "center",
    gap: "7px",
    p: compact ? "7px 5px 6px" : "10px 8px 8px",
    border: `1px solid ${selected ? "#e9a77f" : "rgba(255,255,255,0.12)"}`,
    borderRadius: "11px",
    backgroundColor: selected ? "rgba(233,167,127,0.11)" : "rgba(255,255,255,0.035)",
    boxShadow: selected ? "0 0 0 1px rgba(233,167,127,0.12)" : "none",
    color: "#fffaf7",
    fontSize: 10,
    textAlign: "center",
    transition: "border-color 160ms ease, background 160ms ease, transform 160ms ease",
    "&:hover": {
      borderColor: "rgba(233,167,127,0.52)",
      backgroundColor: selected ? "rgba(233,167,127,0.16)" : "rgba(255,255,255,0.075)",
      transform: "translateY(-1px)",
    },
    [PHONE]: { minHeight: 44, fontSize: 11 },
  };
}

/** The preview window inside an option; callers merge in their own surface. */
export function optionPreviewBoxStyles(compact) {
  return {
    position: "relative",
    display: "grid",
    width: "100%",
    placeItems: "center",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "7px",
  };
}

export const optionCheckStyles = {
  position: "absolute",
  top: 4,
  right: 6,
  color: "#fffaf7",
  fontSize: 12,
};

export const optionCaptionStyles = {
  overflow: "hidden",
  width: "100%",
  fontSize: 10,
  fontWeight: 600,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  [PHONE]: { fontSize: 11 },
  [NARROW]: { fontSize: 10 },
};
