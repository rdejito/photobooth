/**
 * MUI styles for a single saved snapshot card (GalleryCard): the article frame,
 * the image, its frame/layout/time meta and the Download / Remove actions.
 */
export const galleryCardStyles = {
  card: {
    minWidth: 0,
    p: 1,
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "11px",
    backgroundColor: "rgba(10,9,16,0.24)",
  },
  image: {
    display: "block",
    width: "100%",
    aspectRatio: "4 / 3",
    objectFit: "cover",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "7px",
  },
  meta: { display: "flex", flexDirection: "column", gap: 0.5, px: 0.25, py: 1.125 },
  frameLabel: { color: "rgba(255,250,247,0.86)", fontSize: 10, fontWeight: 600 },
  layoutLabel: { color: "rgba(255,250,247,0.48)", fontSize: 9 },
  timeLabel: { color: "rgba(255,250,247,0.48)", fontSize: 9 },
  actions: { display: "flex", gap: 0.75 },
  downloadButton: {
    backgroundColor: "rgba(233,167,127,0.16)",
    color: "#f2c2a3",
    "&:hover": { backgroundColor: "rgba(233,167,127,0.27)" },
  },
  removeButton: {
    color: "rgba(255,250,247,0.62)",
    "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
  },
};
