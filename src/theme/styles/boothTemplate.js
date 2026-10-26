import {
  PHONE,
  SHORT_LANDSCAPE,
  TABLET,
} from "../breakpoints.js";

/**
 * MUI styles for the booth shell (BoothTemplate): the header row plus the
 * workspace holding the stage, share panel, controls and host pickers.
 *
 * The share panel and controls live inside the workspace (as `display:
 * contents` on wide screens) so the portrait layout can order them below the
 * stage and let the share panel absorb the leftover height. Short landscape
 * stacks them in a right-hand rail instead, keeping the stage full-height.
 */
export const boothShellStyles = {
  display: "grid",
  width: "min(1600px, 100%)",
  height: "100%",
  minHeight: 0,
  gridTemplateRows: "auto minmax(0, 1fr)",
  mx: "auto",
  [PHONE]: { px: 0.75 },
  "@media (min-width: 1600px)": { width: "min(1920px, 100%)" },
};

export const boothWorkspaceStyles = {
  display: "grid",
  minHeight: 0,
  gridTemplateColumns: "minmax(0, 1fr)",
  gridTemplateRows: "auto minmax(0, 1fr) auto",
  gap: 1.5,
  [TABLET]: { gap: 1.25 },
  "@media (min-width: 1600px)": { gap: 1.75 },
  [PHONE]: { gap: 0.75 },
  [SHORT_LANDSCAPE]: {
    gridTemplateColumns: "minmax(0, 1fr) 168px",
    gridTemplateRows: "minmax(0, 1fr)",
    gap: 0.75,
  },
};

/**
 * Wrapper around the share panel, controls and host pickers. On wide screens
 * and portrait phones it is `display: contents`, so those children become
 * direct rows of the workspace and their `order` values place them; on a short
 * landscape phone it becomes the right-hand rail.
 */
export const boothSideStyles = {
  order: 3,
  display: "contents",
  [SHORT_LANDSCAPE]: {
    display: "flex",
    minWidth: 0,
    minHeight: 0,
    flexDirection: "column",
    gap: 0.75,
    overflowY: "auto",
  },
};

/** The host-only frame/layout pickers row under the control bar. */
export const photoCustomizeStyles = {
  order: 4,
  mt: 2,
  display: "grid",
  gap: 2,
  // The preview dialog already carries these pickers on phones.
  [PHONE]: { display: "none" },
  [SHORT_LANDSCAPE]: { display: "none" },
};
