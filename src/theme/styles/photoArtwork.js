/**
 * MUI styles for the Home hero decoration (PhotoArtwork): the tilted instant
 * photos, their captions and the orbit rings behind them.
 */
export const photoArtworkStyles = {
  side: {
    position: "relative",
    width: "100%",
    maxWidth: 440,
    justifySelf: "end",
    pt: "110px",
    "@media (max-width: 850px)": { "& .photo-art": { transform: "translateX(-50%) scale(0.86)" } },
    "@media (max-width: 850px) and (min-width: 681px)": {
      width: "min(560px, 100%)",
      maxWidth: "none",
      alignSelf: "center",
      mt: "96px",
      p: 0,
      "& .photo-art": { top: -105, transform: "translateX(-50%) scale(0.78)" },
    },
    "@media (max-width: 680px)": {
      maxWidth: 440,
      alignSelf: "center",
      mt: "clamp(80px, 25vw, 112px)",
      pt: 0,
      "& .photo-art": { top: -106, transform: "translateX(-50%) scale(0.73)" },
    },
    "@media (max-height: 720px) and (min-width: 851px)": {
      pt: "86px",
      "& .photo-art": { top: -92, transform: "translateX(-50%) scale(0.78)" },
    },
  },
  photoArt: {
    position: "absolute",
    top: -80,
    left: "50%",
    width: 360,
    height: 260,
    transform: "translateX(-50%)",
    transformOrigin: "top center",
  },
  orbit: {
    position: "absolute",
    border: "1px solid rgba(244,198,109,0.16)",
    borderRadius: "50%",
    transform: "rotate(-19deg)",
  },
  instantPhoto: {
    position: "absolute",
    width: 150,
    height: 184,
    px: 1.125,
    pt: 1.125,
    backgroundColor: "#fff9ed",
    boxShadow: "0 18px 45px rgba(0,0,0,0.34)",
  },
  photoImage: {
    position: "relative",
    display: "flex",
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photoCaption: {
    pt: 1.125,
    color: "#6c5551",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
  },
};
