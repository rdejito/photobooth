import Box from "@mui/material/Box";
import { photoArtworkStyles } from "../../theme/styles/photoArtwork.js";

/** One tilted instant photo with its captioned decorative artwork. */
function InstantPhoto({ top, left, rotate, background, caption, children }) {
  return (
    <Box sx={{ ...photoArtworkStyles.instantPhoto, top, left, transform: `rotate(${rotate}deg)` }}>
      <Box sx={{ ...photoArtworkStyles.photoImage, background }}>{children}</Box>
      <Box sx={photoArtworkStyles.photoCaption}>{caption}</Box>
    </Box>
  );
}

/**
 * PhotoArtwork — the decorative polaroid collage on the home hero: two tilted
 * instant photos (a flower and a three-person crew), orbit rings, sparkles and
 * the "UP TO 4 IN ONE FRAME" badge. Purely decorative.
 */
export default function PhotoArtwork() {
  return (
    <Box className="photo-art" sx={photoArtworkStyles.photoArt}>
      <Box sx={{ position: "absolute", zIndex: 2, top: 7, left: 107, color: "#f4c66d", fontSize: 21 }}>
        ✦
      </Box>
      <Box sx={{ position: "absolute", zIndex: 2, top: 142, right: 42, color: "#f1b995", fontSize: 25 }}>
        ✧
      </Box>
      <Box sx={{ ...photoArtworkStyles.orbit, top: 45, left: 10, width: 330, height: 160 }} />
      <Box sx={{ ...photoArtworkStyles.orbit, top: 58, left: 32, width: 300, height: 135, transform: "rotate(19deg)" }} />
      <InstantPhoto
        top={32}
        left={78}
        rotate={-12}
        background="radial-gradient(circle at 70% 31%, rgba(255,222,158,0.9) 0 8%, transparent 9%), linear-gradient(146deg, #e5a985, #b56770 53%, #553c59)"
        caption="a day worth keeping"
      >
        <Box component="span" sx={{ color: "#ffe9c6", fontSize: 42, opacity: 0.86 }}>
          ✿
        </Box>
      </InstantPhoto>
      <InstantPhoto
        top={18}
        left={151}
        rotate={9}
        background="radial-gradient(ellipse at 50% 115%, #867384 0 36%, transparent 37%), linear-gradient(145deg, #f0c4a6, #d88a8f 56%, #756078)"
        caption="the photobooth crew"
      >
        <Box component="span" sx={{ display: "flex", gap: 1 }}>
          {[0, 1, 2].map((person) => (
            <Box
              component="span"
              key={person}
              sx={{
                display: "grid",
                width: 45,
                height: 56,
                alignItems: "start",
                justifyItems: "center",
                pt: 0.625,
                borderRadius: "50% 50% 15% 15%",
                backgroundColor: ["rgba(255,237,216,0.85)", "rgba(247,218,190,0.9)", "rgba(255,237,216,0.85)"][person],
                color: "#835f58",
                fontSize: 24,
              }}
            >
              ☺
            </Box>
          ))}
        </Box>
        <Box sx={{ position: "absolute", top: 19, right: 17, color: "#fff0d9", fontSize: 15 }}>
          ✦
        </Box>
      </InstantPhoto>
      <Box
        sx={{
          position: "absolute",
          zIndex: 2,
          right: 1,
          bottom: 6,
          display: "grid",
          width: 74,
          height: 74,
          placeContent: "center",
          border: "1px solid rgba(255,250,247,0.48)",
          borderRadius: "50%",
          backgroundColor: "#d88c76",
          color: "#fffaf7",
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 11,
          lineHeight: 1.2,
          textAlign: "center",
          transform: "rotate(9deg)",
        }}
      >
        UP TO
        <br />
        4 IN ONE
        <br />
        FRAME
      </Box>
    </Box>
  );
}