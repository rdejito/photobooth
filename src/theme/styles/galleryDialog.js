/**
 * MUI styles for the snapshots dialog chrome (GalleryDialog): the blurred
 * backdrop and the dark rounded paper. The panel content itself is styled in
 * galleryPanel.js.
 */
export const galleryDialogStyles = {
  "& .MuiBackdrop-root": {
    backgroundColor: "rgba(16,14,23,0.9)",
    backdropFilter: "blur(10px)",
  },
  "& .MuiDialog-paper": {
    width: "min(920px, calc(100% - 28px))",
    maxHeight: "calc(100% - 28px)",
    m: 1.75,
    overflow: "auto",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "16px",
    backgroundColor: "rgba(30,27,40,0.98)",
    color: "#fffaf7",
  },
};
