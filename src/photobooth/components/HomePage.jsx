import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import JoinRoomPanel from "./JoinRoomPanel.jsx";
import CameraIcon from "./CameraIcon.jsx";

const homeStyles = {
  shell: {
    position: "relative",
    display: "flex",
    minHeight: "100vh",
    flexDirection: "column",
    overflow: "hidden",
    px: "clamp(22px, 7vw, 104px)",
    color: "#fffaf7",
    backgroundColor: "#1f2023",
    "@media (max-width: 850px)": {
      px: "clamp(20px, 6vw, 52px)",
    },
    "@media (max-width: 680px)": {
      minHeight: "100svh",
      overflow: "visible",
      px: "clamp(16px, 5vw, 24px)",
    },
    "@media (max-width: 390px)": {
      px: 2,
    },
    "@media (max-width: 850px) and (min-width: 681px)": {
      minHeight: "100svh",
      overflow: "visible",
      px: "clamp(28px, 6vw, 56px)",
    },
    "@media (max-height: 720px) and (min-width: 851px)": {
      minHeight: "100vh",
    },
  },
  nav: {
    zIndex: 1,
    display: "flex",
    minHeight: 82,
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.09)",
    "@media (max-width: 850px) and (min-width: 681px)": { minHeight: 68 },
    "@media (max-width: 680px)": { minHeight: 62 },
    "@media (max-height: 720px) and (min-width: 851px)": { minHeight: 64 },
  },
  brand: {
    display: "inline-flex",
    alignItems: "center",
    gap: 1.25,
    color: "#fffaf7",
    fontSize: 17,
    fontWeight: 600,
    letterSpacing: "-0.5px",
    textDecoration: "none",
    "&:focus-visible": { outline: "2px solid #f4c66d", outlineOffset: 3 },
    "@media (max-width: 680px)": { gap: 1, fontSize: 15 },
    "@media (max-width: 390px)": { fontSize: 13 },
  },
  brandIcon: {
    display: "grid",
    width: 30,
    height: 30,
    placeItems: "center",
    border: "1px solid rgba(255,208,170,0.45)",
    borderRadius: "9px",
    color: "#ffc59d",
    fontSize: 18,
    "& svg": { width: 21, height: 18 },
  },
  navNote: {
    display: "flex",
    alignItems: "center",
    gap: 1.125,
    color: "rgba(255,250,247,0.58)",
    fontSize: 12,
    "@media (max-width: 680px)": { maxWidth: 138, fontSize: 9 },
    "@media (max-width: 390px)": { maxWidth: 118, gap: 0.75, fontSize: 8 },
  },
  liveDot: {
    width: 7,
    height: 7,
    flexShrink: 0,
    borderRadius: "50%",
    backgroundColor: "#c9dfb2",
    boxShadow: "0 0 12px rgba(201,223,178,0.6)",
  },
  hero: {
    zIndex: 1,
    display: "grid",
    width: "min(1120px, 100%)",
    flex: 1,
    gridTemplateColumns: "minmax(0, 1fr) minmax(360px, 440px)",
    alignItems: "center",
    gap: "clamp(38px, 8vw, 112px)",
    mx: "auto",
    padding: "46px 0 64px",
    "@media (max-width: 850px)": {
      gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 390px)",
      gap: 3.5,
    },
    "@media (max-width: 850px) and (min-width: 681px)": {
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      gap: 3,
      padding: "35px 0 40px",
    },
    "@media (max-width: 680px)": {
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      gap: 0,
      padding: "30px 0 28px",
    },
    "@media (max-height: 720px) and (min-width: 851px)": {
      padding: "22px 0 30px",
    },
    "@media (min-width: 1440px)": {
      width: "min(1320px, 100%)",
      gridTemplateColumns: "minmax(0, 1fr) minmax(400px, 480px)",
      gap: "clamp(72px, 8vw, 140px)",
    },
  },
  copy: {
    maxWidth: 600,
    pb: 2.25,
    "@media (max-width: 850px) and (min-width: 681px)": { maxWidth: 680, p: 0 },
    "@media (max-width: 680px)": { p: 0 },
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: 1.125,
    color: "#e9b69a",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 2,
    "& span": { color: "#f4c66d", fontSize: 16 },
    "@media (max-width: 390px)": { fontSize: 8, letterSpacing: 1.4 },
  },
  title: {
    margin: "22px 0 18px",
    color: "#fffaf7",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(48px, 6.3vw, 78px)",
    fontWeight: 400,
    letterSpacing: "-2.8px",
    lineHeight: 0.99,
    "& span": { color: "#f1b995", fontStyle: "italic" },
    "@media (max-width: 850px)": { fontSize: "clamp(44px, 7vw, 62px)" },
    "@media (max-width: 850px) and (min-width: 681px)": {
      mt: 2.125,
      mb: 1.625,
      fontSize: "clamp(48px, 7vw, 64px)",
    },
    "@media (max-width: 680px)": {
      mt: 2.125,
      fontSize: "clamp(42px, 11.5vw, 60px)",
      letterSpacing: "-2px",
    },
    "@media (max-width: 390px)": { fontSize: "clamp(39px, 11vw, 48px)" },
    "@media (max-height: 720px) and (min-width: 851px)": {
      mt: 2,
      mb: 1.5,
      fontSize: "clamp(46px, 5.5vw, 68px)",
    },
    "@media (min-width: 1440px)": { fontSize: "clamp(72px, 5.5vw, 92px)" },
  },
  description: {
    maxWidth: 450,
    m: 0,
    color: "rgba(255,250,247,0.67)",
    fontSize: 15,
    lineHeight: 1.85,
    "@media (max-width: 850px) and (min-width: 681px)": {
      maxWidth: 560,
      fontSize: 14,
    },
    "@media (max-width: 680px)": {
      maxWidth: 440,
      fontSize: 13,
      lineHeight: 1.65,
    },
  },
  points: {
    display: "flex",
    flexDirection: "column",
    gap: 2.125,
    mt: 4.125,
    "@media (max-width: 850px) and (min-width: 681px)": {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: 2.25,
      mt: 2.75,
    },
    "@media (max-width: 680px)": {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: 1.5,
      mt: 2.375,
    },
    "@media (max-width: 390px)": {
      gridTemplateColumns: "minmax(0, 1fr)",
      gap: 1.25,
    },
    "@media (max-height: 720px) and (min-width: 851px)": {
      gap: 1.5,
      mt: 2.875,
    },
  },
  point: {
    display: "flex",
    alignItems: "center",
    gap: 1.625,
    "@media (max-width: 680px)": { alignItems: "flex-start", gap: 1 },
  },
  pointIcon: {
    display: "grid",
    width: 37,
    height: 37,
    flex: "0 0 auto",
    placeItems: "center",
    border: "1px solid rgba(244,198,109,0.2)",
    borderRadius: 3,
    backgroundColor: "rgba(244,198,109,0.07)",
    color: "#f4c66d",
    fontSize: 19,
    "@media (max-width: 680px)": { width: 30, height: 30, borderRadius: 2.25, fontSize: 16 },
  },
  pointTitle: {
    display: "block",
    color: "rgba(255,250,247,0.94)",
    fontSize: 12,
    fontWeight: 600,
    "@media (max-width: 680px)": { fontSize: 10 },
  },
  pointDescription: {
    display: "block",
    mt: 0.375,
    color: "rgba(255,250,247,0.48)",
    fontSize: 11,
    "@media (max-width: 680px)": { fontSize: 9, lineHeight: 1.4 },
  },
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
  footer: {
    display: "flex",
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    gap: 1.25,
    borderTop: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(255,250,247,0.4)",
    fontSize: 10,
    letterSpacing: 0.2,
    "@media (max-width: 680px)": { minHeight: 48, fontSize: 9 },
    "@media (max-width: 390px)": { gap: 0.75, fontSize: 8 },
  },
};

function PhotoArtwork() {
  return (
    <Box className="photo-art" sx={homeStyles.photoArt}>
      <Box sx={{ position: "absolute", zIndex: 2, top: 7, left: 107, color: "#f4c66d", fontSize: 21 }}>✦</Box>
      <Box sx={{ position: "absolute", zIndex: 2, top: 142, right: 42, color: "#f1b995", fontSize: 25 }}>✧</Box>
      <Box sx={{ ...homeStyles.orbit, top: 45, left: 10, width: 330, height: 160 }} />
      <Box sx={{ ...homeStyles.orbit, top: 58, left: 32, width: 300, height: 135, transform: "rotate(19deg)" }} />
      <Box sx={{ ...homeStyles.instantPhoto, top: 32, left: 78, transform: "rotate(-12deg)" }}>
        <Box
          sx={{
            ...homeStyles.photoImage,
            background: "radial-gradient(circle at 70% 31%, rgba(255,222,158,0.9) 0 8%, transparent 9%), linear-gradient(146deg, #e5a985, #b56770 53%, #553c59)",
            "& span": { color: "#ffe9c6", fontSize: 42, opacity: 0.86 },
          }}
        >
          <span>✿</span>
        </Box>
        <Box sx={homeStyles.photoCaption}>a day worth keeping</Box>
      </Box>
      <Box sx={{ ...homeStyles.instantPhoto, top: 18, left: 151, transform: "rotate(9deg)" }}>
        <Box
          sx={{
            ...homeStyles.photoImage,
            gap: 1,
            background: "radial-gradient(ellipse at 50% 115%, #867384 0 36%, transparent 37%), linear-gradient(145deg, #f0c4a6, #d88a8f 56%, #756078)",
          }}
        >
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
          <Box sx={{ position: "absolute", top: 19, right: 17, color: "#fff0d9", fontSize: 15 }}>✦</Box>
        </Box>
        <Box sx={homeStyles.photoCaption}>the photobooth crew</Box>
      </Box>
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
        UP TO<br />4 IN ONE<br />FRAME
      </Box>
    </Box>
  );
}

export default function HomePage(props) {
  return (
    <Box sx={homeStyles.shell}>
      <Box component="nav" aria-label="Main navigation" sx={homeStyles.nav}>
        <Box
          component="a"
          href="/"
          aria-label="Little Moments home"
          sx={homeStyles.brand}
        >
          <Box component="span" sx={homeStyles.brandIcon}><CameraIcon /></Box>
          <span>Little Moments</span>
        </Box>
        <Box component="span" sx={homeStyles.navNote}>
          <Box component="span" sx={homeStyles.liveDot} />
          A little booth for your people
        </Box>
      </Box>

      <Box component="section" sx={homeStyles.hero}>
        <Box sx={homeStyles.copy}>
          <Typography component="div" sx={homeStyles.eyebrow}>
            <span>✦</span> YOUR ONLINE PHOTOBOOTH
          </Typography>
          <Typography component="h1" sx={homeStyles.title}>
            Get together.
            <br />
            <Box component="span">Make a moment.</Box>
          </Typography>
          <Typography component="p" sx={homeStyles.description}>
            Invite your favorite people, take a photo together, then choose a
            frame. Save every little moment to your snapshots.
          </Typography>
          <Box sx={homeStyles.points}>
            <Box sx={homeStyles.point}>
              <Box component="span" sx={homeStyles.pointIcon}>01</Box>
              <Box>
                <Typography component="strong" sx={homeStyles.pointTitle}>Start or join a room</Typography>
                <Typography component="small" sx={homeStyles.pointDescription}>Share a room code to connect</Typography>
              </Box>
            </Box>
            <Box sx={homeStyles.point}>
              <Box component="span" sx={homeStyles.pointIcon}>02</Box>
              <Box>
                <Typography component="strong" sx={homeStyles.pointTitle}>Take and save photos</Typography>
                <Typography component="small" sx={homeStyles.pointDescription}>Choose a frame after each photo</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={homeStyles.side}>
          <Box aria-hidden="true"><PhotoArtwork /></Box>
          <JoinRoomPanel {...props} />
        </Box>
      </Box>

      <Box component="footer" sx={homeStyles.footer}>
        <span>Little Moments</span>
        <Box component="span" sx={{ color: "#df987f" }}>·</Box>
        <span>Photos are saved in this browser</span>
      </Box>
    </Box>
  );
}
