import Box from "@mui/material/Box";
import ActionButton from "./ActionButton.jsx";
import CameraIcon from "./CameraIcon.jsx";

const panelStyles = {
  display: "flex",
  minWidth: 0,
  alignItems: "center",
  gap: 1.5,
  p: "10px 12px",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "18px",
  background: "linear-gradient(155deg, rgba(47,39,54,0.88), rgba(30,27,40,0.94))",
  boxShadow: "0 18px 45px rgba(0,0,0,0.19), inset 0 1px rgba(255,255,255,0.04)",
  "& .MuiButton-root": {
    width: "100%",
    minHeight: 44,
    px: 1.75,
    borderRadius: "10px",
    fontSize: 11,
    fontWeight: 700,
    "&:focus-visible": { outline: "2px solid #f4c66d", outlineOffset: 3 },
    "&:disabled": { cursor: "not-allowed", opacity: 0.55 },
  },
  "& .capture-icon": { display: "block", width: 17, height: 14, flex: "0 0 auto" },
  "@media (min-width: 641px) and (max-width: 1024px)": { gap: 1.25, p: "9px 11px" },
  "@media (min-width: 1600px)": { gap: 1.75, p: "12px 16px" },
  "@media (max-height: 720px) and (min-width: 641px)": {
    gap: 1,
    p: "8px 10px",
    "& .MuiButton-root": { minHeight: 36 },
  },
  "@media (max-width: 640px)": {
    gap: 1,
    p: 1,
    borderRadius: "13px",
    "& .MuiButton-root": { minHeight: 40, px: 0.625, fontSize: 9 },
  },
  "@media (max-width: 640px) and (orientation: portrait)": {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: 0.875,
    p: 1,
    "& .MuiButton-root": { minHeight: 38, fontSize: "clamp(8px, 2.4vw, 10px)" },
  },
  "@media (max-width: 640px) and (orientation: landscape) and (max-height: 500px)": {
    gap: 0.625,
    p: 0.75,
    "& .MuiButton-root": { minHeight: 25, px: 0.5, fontSize: 7 },
  },
  "@media (max-width: 360px) and (orientation: portrait)": {
    gap: 0.625,
    p: 0.75,
  },
};

const actionsStyles = {
  display: "grid",
  flex: 1,
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 1.125,
  "@media (max-width: 640px) and (orientation: landscape) and (max-height: 500px)": {
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: 0.5,
  },
  "@media (max-width: 640px) and (orientation: portrait)": { gap: 0.75 },
  "@media (max-width: 360px) and (orientation: portrait)": { gap: 0.5 },
};

export default function PhotoControls({
  isHost,
  cameraEnabled,
  toggleCamera,
  canCapture,
  takePhoto,
  leaveRoom,
  galleryCount,
  toggleGallery,
}) {
  return (
    <Box sx={panelStyles}>
      <Box sx={actionsStyles}>
        <ActionButton
          onClick={toggleCamera}
          variant="secondary"
          ariaPressed={!cameraEnabled}
        >
          <CameraIcon className="capture-icon" />
          {cameraEnabled ? "Turn camera off" : "Turn camera on"}
        </ActionButton>
        <ActionButton
          onClick={takePhoto}
          disabled={!canCapture || !isHost}
          variant="primary"
        >
          <CameraIcon className="capture-icon" />
          {isHost ? (canCapture ? "Take photo" : "Getting cameras ready") : "Host takes photo"}
        </ActionButton>
        <ActionButton onClick={toggleGallery} variant="secondary">
          Photos {galleryCount > 0 ? `(${galleryCount})` : ""}
        </ActionButton>
        <ActionButton onClick={leaveRoom} variant="quiet">
          Leave booth
        </ActionButton>
      </Box>
    </Box>
  );
}
