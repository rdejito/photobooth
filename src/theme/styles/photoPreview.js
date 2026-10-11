/**
 * MUI styles for the photo preview dialog (PhotoPreview): the transparent
 * dialog chrome, the framed image, the optional event-name field and the
 * save/download/take-another action row.
 */
export const photoPreviewEditorStyles = {
  display: "grid",
  width: "min(720px, 100%)",
  justifyItems: "center",
  gap: 1.25,
};

export const photoPreviewImageStyles = {
  display: "block",
  maxWidth: "100%",
  maxHeight: "min(36dvh, 390px)",
  width: "auto",
  height: "auto",
  mx: "auto",
  border: "5px solid #fffaf7",
  borderRadius: "13px",
  boxShadow: "0 22px 60px rgba(0,0,0,0.35)",
};

export const photoPreviewDialogStyles = {
  "& .MuiBackdrop-root": {
    backgroundColor: "rgba(16,14,23,0.93)",
    backdropFilter: "blur(12px)",
  },
  "& .MuiDialog-paper": {
    display: "grid",
    width: "min(720px, calc(100% - 40px))",
    maxWidth: 720,
    maxHeight: "calc(100% - 40px)",
    alignContent: "center",
    justifyItems: "center",
    m: "20px",
    overflow: "auto",
    backgroundColor: "transparent",
    boxShadow: "none",
  },
};

/** Screen-reader-only heading that gives the dialog its accessible name. */
export const photoPreviewTitleStyles = {
  position: "absolute",
  width: "1px",
  height: "1px",
  m: "-1px",
  p: 0,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
};

export const photoPreviewContentStyles = {
  display: "grid",
  justifyItems: "center",
  p: 0,
  overflow: "visible",
};

export const photoPreviewEventFieldStyles = {
  width: "min(320px, 100%)",
  "& .MuiInputBase-root": {
    borderRadius: "11px",
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#fffaf7",
    fontSize: 12,
  },
  "& .MuiInputLabel-root": { color: "rgba(255,250,247,0.6)", fontSize: 12 },
  "& .MuiInputLabel-root.Mui-focused": { color: "#e9b69a" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.14)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(233,167,127,0.45)" },
  "& .MuiInputBase-input::placeholder": { color: "rgba(255,250,247,0.35)", opacity: 1 },
};

export const photoPreviewActionsStyles = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: 1,
  mt: 0.25,
};

export const photoPreviewCaptionStyles = {
  mt: -0.5,
  color: "rgba(255,250,247,0.58)",
  fontSize: 10,
  lineHeight: 1.5,
  textAlign: "center",
};
