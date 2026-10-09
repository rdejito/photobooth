import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import GalleryPanel from "./GalleryPanel.jsx";
import PhotoControls from "./PhotoControls.jsx";
import PhotoPreview from "./PhotoPreview.jsx";
import FramePicker from "./FramePicker.jsx";
import VideoPreview from "./VideoPreview.jsx";
import CameraIcon from "./CameraIcon.jsx";
import { useCameraTileSizing } from "../hooks/useCameraTileSizing.js";

const roomStyles = {
  shell: {
    display: "grid",
    width: "min(1600px, 100%)",
    height: "100%",
    minHeight: 0,
    gridTemplateRows: "auto auto minmax(0, 1fr)",
    mx: "auto",
    "@media (min-width: 1600px)": { width: "min(1920px, 100%)" },
  },
  header: {
    display: "flex",
    minHeight: 54,
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.09)",
    "@media (max-width: 640px)": { minHeight: 48 },
  },
  brand: {
    display: "inline-flex",
    alignItems: "center",
    gap: 1.25,
    color: "#fffaf7",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: 18,
    "@media (max-width: 640px)": { gap: 0.875, fontSize: 14 },
    "@media (max-width: 380px)": { gap: 0.75 },
  },
  brandMark: {
    display: "grid",
    width: 34,
    height: 30,
    placeItems: "center",
    border: "1px solid rgba(255,208,170,0.4)",
    borderRadius: "9px",
    color: "#ffc59d",
    backgroundColor: "rgba(233,167,127,0.09)",
    "& svg": { width: 22, height: 19 },
    "@media (max-width: 380px)": {
      width: 29,
      "& svg": { width: 19 },
    },
  },
  connection: {
    display: "inline-flex",
    alignItems: "center",
    gap: 1,
    px: 1.5,
    py: 1,
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "99px",
    backgroundColor: "rgba(255,255,255,0.035)",
    color: "rgba(255,250,247,0.65)",
    fontSize: 11,
    "&[data-connected='true'] .connection-dot": {
      backgroundColor: "#c9dfb2",
      boxShadow: "0 0 10px rgba(201,223,178,0.65)",
    },
    "@media (max-width: 640px)": {
      maxWidth: 142,
      px: 1,
      py: 0.75,
      fontSize: 8,
    },
  },
  connectionDot: {
    width: 7,
    height: 7,
    flexShrink: 0,
    borderRadius: "50%",
    backgroundColor: "#e9b69a",
    boxShadow: "0 0 10px rgba(233,182,154,0.5)",
  },
  intro: {
    display: "flex",
    minHeight: 104,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 3,
    py: 1.5,
    "@media (max-height: 720px) and (min-width: 641px)": {
      minHeight: 84,
      py: 0.875,
    },
    "@media (max-width: 640px)": {
      minHeight: 78,
      gap: 1.125,
      py: 0.875,
      "& > div:first-of-type": { minWidth: 0, flex: 1 },
    },
    "@media (max-width: 640px) and (orientation: portrait)": { minHeight: 78 },
    "@media (max-width: 640px) and (orientation: landscape) and (max-height: 500px)": {
      minHeight: 56,
      py: 0.5,
    },
    "@media (max-width: 360px) and (orientation: portrait)": { minHeight: 70 },
  },
  kicker: {
    mb: 1,
    color: "#e9b69a",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1.8,
    "@media (max-width: 640px)": { mb: 0.5, fontSize: 8 },
    "@media (max-width: 640px) and (orientation: landscape) and (max-height: 500px)": {
      mb: 0.25,
    },
  },
  title: {
    m: 0,
    color: "#fffaf7",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(32px, 4vw, 45px)",
    fontWeight: 400,
    letterSpacing: "-1px",
    "@media (max-height: 720px) and (min-width: 641px)": {
      fontSize: "clamp(28px, 3.4vw, 38px)",
    },
    "@media (max-width: 640px)": {
      fontSize: "clamp(21px, 6vw, 30px)",
      letterSpacing: "-0.6px",
    },
    "@media (max-width: 640px) and (orientation: landscape) and (max-height: 500px)": {
      fontSize: 22,
    },
  },
  description: {
    mt: 1,
    mb: 0,
    color: "rgba(255,250,247,0.6)",
    fontSize: 12,
    lineHeight: 1.6,
    "@media (max-height: 720px) and (min-width: 641px)": { mt: 0.5, fontSize: 11 },
    "@media (max-width: 640px)": { display: "none" },
  },
  codeCard: {
    display: "flex",
    minWidth: 184,
    flexDirection: "column",
    gap: 0.375,
    px: 1.625,
    py: 1.125,
    border: "1px solid rgba(255,255,255,0.11)",
    borderRadius: "13px",
    backgroundColor: "rgba(255,255,255,0.045)",
    "& > span": {
      color: "#e9b69a",
      fontSize: 8,
      fontWeight: 700,
      letterSpacing: 1.5,
    },
    "& > strong": {
      color: "#fffaf7",
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: 20,
      fontWeight: 400,
      letterSpacing: 3,
      userSelect: "all",
    },
    "& > small": { color: "rgba(255,250,247,0.48)", fontSize: 9 },
    "& .MuiButton-root": {
      alignSelf: "flex-start",
      mt: 0.25,
      px: 1,
      py: 0.5,
      borderColor: "rgba(233,182,154,0.26)",
      borderRadius: "7px",
      backgroundColor: "rgba(233,182,154,0.09)",
      color: "#f0c4a8",
      fontSize: 9,
      "&:disabled": { cursor: "default", opacity: 0.5 },
    },
    "@media (max-width: 640px)": {
      width: 124,
      minWidth: 124,
      gap: 0.25,
      px: 1.125,
      py: 0.875,
      "& > span": { fontSize: 7 },
      "& > strong": { fontSize: 17 },
      "& > small": { display: "none" },
      "& .MuiButton-root": { mt: 0.125, px: 0.75, py: 0.375, fontSize: 8 },
    },
    "@media (max-width: 380px)": { width: 112, minWidth: 112 },
    "@media (max-width: 360px) and (orientation: portrait)": { width: 104, minWidth: 104 },
    "@media (max-width: 640px) and (orientation: landscape) and (max-height: 500px)": {
      gap: 0.125,
      px: 0.875,
      py: 0.5,
      "& > strong": { fontSize: 14 },
      "& .MuiButton-root": { px: 0.625, py: 0.25 },
    },
  },
  workspace: {
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
  },
  stage: {
    position: "relative",
    display: "flex",
    minHeight: 0,
    flexDirection: "column",
    p: 1.625,
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "20px",
    background: "linear-gradient(145deg, rgba(47,39,54,0.9), rgba(30,27,40,0.94))",
    boxShadow: "0 22px 60px rgba(0,0,0,0.24), inset 0 1px rgba(255,255,255,0.045)",
    "@media (max-width: 640px)": { p: 1.125, borderRadius: "13px" },
  },
  stageLabel: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    mb: 1.125,
    ml: 0.25,
    color: "rgba(255,250,247,0.55)",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1.4,
  },
  stageDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: "#e9b69a",
    boxShadow: "0 0 10px rgba(233,182,154,0.5)",
  },
  videoGroup: {
    display: "grid",
    flex: 1,
    minHeight: 0,
    gridTemplateColumns: "minmax(0, 1fr)",
    gridTemplateRows: "minmax(0, 1fr)",
    alignItems: "center",
    justifyItems: "center",
    gap: 1.5,
    '&[data-participant-count="2"]': {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      "@media (max-width: 640px)": { gap: 0.75 },
    },
    '&[data-participant-count="3"], &[data-participant-count="4"]': {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gridTemplateRows: "repeat(2, minmax(0, 1fr))",
      "@media (max-width: 640px)": { gap: 0.75 },
    },
    '&[data-participant-count="3"] > :nth-of-type(3)': {
      gridColumn: "1 / -1",
      justifySelf: "center",
    },
  },
  countdown: {
    position: "absolute",
    zIndex: 2,
    top: "50%",
    left: "50%",
    display: "grid",
    width: 104,
    height: 104,
    placeItems: "center",
    border: "1px solid rgba(255,250,247,0.7)",
    borderRadius: "50%",
    backgroundColor: "rgba(23,20,35,0.72)",
    color: "#fffaf7",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: 52,
    boxShadow: "0 0 0 9px rgba(255,255,255,0.08)",
    transform: "translate(-50%, -50%)",
    backdropFilter: "blur(5px)",
  },
  waiting: {
    position: "absolute",
    zIndex: 1,
    right: 2,
    bottom: 2,
    left: 2,
    display: "flex",
    width: "fit-content",
    maxWidth: "calc(100% - 32px)",
    alignItems: "center",
    justifyContent: "center",
    gap: 1.125,
    mx: "auto",
    p: "8px 12px",
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "99px",
    backgroundColor: "rgba(22,19,30,0.78)",
    color: "rgba(255,250,247,0.61)",
    fontSize: 11,
    textAlign: "center",
    backdropFilter: "blur(8px)",
    "& svg": { display: "block", width: 19, height: 16 },
    "@media (max-width: 640px)": {
      right: 1.25,
      bottom: 1.25,
      left: 1.25,
      maxWidth: "calc(100% - 20px)",
      p: "6px 9px",
      fontSize: 9,
    },
  },
};

export default function VideoCallPanel({
  participants,
  participantVideosRef,
  canvasRef,
  roomCode,
  connected,
  isHost,
  cameraEnabled,
  toggleCamera,
  canCapture,
  callStatus,
  frame,
  setFrame,
  countdown,
  showPreview,
  canCustomizePreview,
  photoPending,
  photoDataUrl,
  takePhoto,
  savePhoto,
  leaveRoom,
  hidePreview,
  gallery,
  showGallery,
  setShowGallery,
  deletePhoto,
}) {
  const [copyStatus, setCopyStatus] = useState("");
  const videoGroupRef = useRef(null);
  useCameraTileSizing(videoGroupRef, participants.length);

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Copy failed — select the code and copy it manually.");
    }
  };

  const downloadPhoto = (photo) => {
    const link = document.createElement("a");
    link.href = photo.dataUrl;
    link.download = `little-moments-${photo.id}.png`;
    link.click();
  };

  return (
    <Box component="section" className="room-shell" sx={roomStyles.shell}>
      <Box component="header" sx={roomStyles.header}>
        <Box sx={roomStyles.brand}>
          <Box component="span" sx={roomStyles.brandMark}><CameraIcon /></Box>
          <Typography component="span" sx={{ font: "inherit", color: "inherit" }}>
            Little Moments
          </Typography>
        </Box>
        <Box className="connection-pill" data-connected={connected} sx={roomStyles.connection}>
          <Box component="span" className="connection-dot" sx={roomStyles.connectionDot} />
          {connected
            ? `${participants.length} of 4 in the booth`
            : "Waiting for guests — share your code"}
        </Box>
      </Box>

      <Box sx={roomStyles.intro}>
        <Box>
          <Typography component="p" sx={roomStyles.kicker}>ONLINE PHOTOBOOTH</Typography>
          <Typography component="h1" sx={roomStyles.title}>
            {connected ? "Everyone in frame." : "Your booth is open."}
          </Typography>
          <Typography component="p" sx={roomStyles.description}>
            {connected
              ? "Get everyone ready and capture the whole crew. Choose a frame after the photo."
              : "Share the code. Up to three guests can join, and they will appear here as they arrive."}
          </Typography>
        </Box>
        <Box sx={roomStyles.codeCard}>
          <Typography component="span">PHOTOBOOTH CODE</Typography>
          <Typography component="strong">{roomCode || "------"}</Typography>
          <Typography component="small">Invite up to three guests</Typography>
          <Button variant="outlined" onClick={copyRoomCode} disabled={!roomCode}>
            {copyStatus || "Copy code"}
          </Button>
        </Box>
      </Box>

      <Box sx={roomStyles.workspace}>
        <Box component="section" sx={roomStyles.stage}>
          <Box sx={roomStyles.stageLabel}>
            <Box component="span" sx={roomStyles.stageDot} />
            {connected
              ? `${participants.filter(({ stream }) => stream).length} CAMERAS READY`
              : "CAMERA PREVIEW"}
          </Box>
          <Box
            sx={roomStyles.videoGroup}
            data-participant-count={participants.length}
            ref={videoGroupRef}
          >
            {participants.map((participant) => (
              <VideoPreview
                key={participant.id}
                videoRef={(element) => {
                  if (element) participantVideosRef.current.set(participant.id, element);
                  else participantVideosRef.current.delete(participant.id);
                }}
                stream={participant.stream}
                label={participant.label}
                muted={participant.local}
                cameraEnabled={participant.cameraEnabled}
              />
            ))}
          </Box>
          {countdown !== null && (
            <Box component="div" sx={roomStyles.countdown} aria-live="assertive">
              {countdown}
            </Box>
          )}
          {!connected && (
            <Box component="div" sx={roomStyles.waiting}>
              <Box component="span" sx={{ color: "#e9a77f" }}><CameraIcon /></Box>
              <span>{callStatus || "Share the photobooth code. Guests will appear here as they join."}</span>
            </Box>
          )}
        </Box>

        <PhotoControls
          isHost={isHost}
          cameraEnabled={cameraEnabled}
          toggleCamera={toggleCamera}
          canCapture={canCapture}
          takePhoto={takePhoto}
          leaveRoom={leaveRoom}
          galleryCount={gallery.length}
          toggleGallery={() => setShowGallery((visible) => !visible)}
        />
        {canCustomizePreview && !showPreview && (
          <Box sx={{ mt: 2 }}>
            <FramePicker frame={frame} setFrame={setFrame} />
          </Box>
        )}
      </Box>
      <PhotoPreview
        canvasRef={canvasRef}
        imageData={photoDataUrl}
        visible={showPreview}
        canCustomize={canCustomizePreview}
        photoPending={photoPending}
        frame={frame}
        setFrame={setFrame}
        savePhoto={savePhoto}
        hidePreview={hidePreview}
      />
      <Dialog
        open={showGallery}
        onClose={() => setShowGallery(false)}
        aria-labelledby="snapshots-title"
        maxWidth={false}
        scroll="paper"
        sx={{
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
        }}
      >
        <GalleryPanel
          gallery={gallery}
          deletePhoto={deletePhoto}
          downloadPhoto={downloadPhoto}
          onClose={() => setShowGallery(false)}
        />
      </Dialog>
    </Box>
  );
}
