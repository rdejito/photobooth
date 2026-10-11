/**
 * MUI styles for the booth shell (BoothTemplate): the three-row grid (header,
 * intro, workspace) and the workspace rows that hold the stage and controls.
 */
export const boothShellStyles = {
  display: "grid",
  width: "min(1600px, 100%)",
  height: "100%",
  minHeight: 0,
  gridTemplateRows: "auto auto minmax(0, 1fr)",
  mx: "auto",
  "@media (min-width: 1600px)": { width: "min(1920px, 100%)" },
};

export const boothWorkspaceStyles = {
  display: "grid",
  minHeight: 0,
  gridTemplateColumns: "minmax(0, 1fr)",
  gridTemplateRows: "minmax(0, 1fr) auto",
  gap: 1.5,
  "@media (min-width: 641px) and (max-width: 1024px)": { gap: 1.25 },
  "@media (min-width: 1600px)": { gap: 1.75 },
  "@media (max-width: 640px)": { gap: 1 },
  "@media (max-width: 640px) and (orientation: portrait)": { gap: 1 },
  "@media (max-width: 640px) and (orientation: landscape) and (max-height: 500px)": {
    gridTemplateColumns: "minmax(0, 1fr) 154px",
    gap: 0.75,
  },
  "@media (max-width: 380px)": {
    gridTemplateColumns: "minmax(0, 1fr) 140px",
    gap: 0.75,
  },
  "@media (max-width: 360px) and (orientation: portrait)": {
    gridTemplateColumns: "minmax(0, 1fr)",
  },
};

/** The host-only frame/layout pickers row under the control bar. */
export const photoCustomizeStyles = { mt: 2, display: "grid", gap: 2 };
