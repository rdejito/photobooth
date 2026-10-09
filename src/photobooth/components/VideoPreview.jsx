import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function getStreamAspectRatio(stream) {
  const track = stream?.getVideoTracks?.()[0];
  const { width, height } = track?.getSettings?.() || {};
  return width > 0 && height > 0 ? `${width} / ${height}` : "4 / 3";
}

const previewStyles = {
  tile: {
    position: "relative",
    width: "100%",
    minWidth: 0,
    minHeight: 0,
    maxHeight: "100%",
    alignSelf: "center",
    justifySelf: "center",
    overflow: "hidden",
    aspectRatio: "var(--camera-aspect-ratio, 4 / 3)",
    borderRadius: "13px",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.11)",
    background:
      "radial-gradient(ellipse at 50% 40%, rgba(136,111,136,0.16), transparent 62%), #15131d",
    "@media (max-width: 640px)": { borderRadius: "8px" },
  },
  video: {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: "scaleX(-1)",
    "&.is-camera-off": { visibility: "hidden" },
  },
  placeholder: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    alignContent: "center",
    gap: 1.25,
    background:
      "radial-gradient(ellipse at 50% 40%, rgba(233,167,127,0.15), transparent 58%), linear-gradient(145deg, #292331, #1d1a27)",
    color: "rgba(255,250,247,0.65)",
    fontSize: 14,
    fontWeight: 600,
  },
  avatar: {
    display: "grid",
    width: "clamp(52px, 8vw, 88px)",
    aspectRatio: 1,
    placeItems: "center",
    border: "1px solid rgba(255,250,247,0.2)",
    borderRadius: "50%",
    backgroundColor: "rgba(255,250,247,0.08)",
    color: "#f0c4a8",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(24px, 4vw, 40px)",
    fontWeight: 400,
  },
  placeholderMessage: {
    color: "rgba(255,250,247,0.72)",
    fontSize: 12,
    fontWeight: 600,
  },
  label: {
    position: "absolute",
    right: 1.375,
    bottom: 1.375,
    left: 1.375,
    display: "flex",
    width: "max-content",
    alignItems: "center",
    gap: 0.875,
    px: 1.25,
    py: 0.875,
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "99px",
    backgroundColor: "rgba(22,19,30,0.76)",
    color: "#fffaf7",
    fontSize: 10,
    backdropFilter: "blur(8px)",
    "@media (max-width: 640px)": {
      right: 0.625,
      bottom: 0.625,
      left: 0.625,
      gap: 0.5,
      px: 0.75,
      py: 0.5,
      fontSize: 8,
    },
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: "#c9dfb2",
  },
  selfTag: {
    color: "#e9b69a",
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.8,
  },
};

export default function VideoPreview({
  videoRef,
  stream,
  label,
  muted = false,
  cameraEnabled = true,
}) {
  const elementRef = useRef(null);
  const [aspectRatio, setAspectRatio] = useState(() => getStreamAspectRatio(stream));

  useEffect(() => {
    const video = elementRef.current;
    if (video) video.srcObject = stream;
    setAspectRatio(getStreamAspectRatio(stream));
    return () => {
      if (video) video.srcObject = null;
    };
  }, [stream]);

  const updateAspectRatio = (event) => {
    const { videoWidth, videoHeight } = event.currentTarget;
    if (videoWidth > 0 && videoHeight > 0) {
      setAspectRatio(`${videoWidth} / ${videoHeight}`);
    }
  };

  return (
    <Box
      sx={previewStyles.tile}
      style={{ "--camera-aspect-ratio": aspectRatio }}
    >
      <Box
        component="video"
        ref={(element) => {
          elementRef.current = element;
          if (typeof videoRef === "function") videoRef(element);
          else if (videoRef) videoRef.current = element;
        }}
        autoPlay
        playsInline
        muted={muted}
        onLoadedMetadata={updateAspectRatio}
        onResize={updateAspectRatio}
        className={cameraEnabled ? undefined : "is-camera-off"}
        sx={previewStyles.video}
      />
      {(!stream || !cameraEnabled) && (
        <Box
          sx={{
            ...previewStyles.placeholder,
            ...(cameraEnabled
              ? {}
              : {
                  "& .participant-placeholder-avatar": {
                    borderColor: "rgba(233,167,127,0.28)",
                    backgroundColor: "rgba(233,167,127,0.1)",
                  },
                }),
          }}
          role="status"
          aria-label={`${label}'s camera is ${cameraEnabled ? "connecting" : "off"}`}
        >
          <Box
            component="span"
            className="participant-placeholder-avatar"
            aria-hidden="true"
            sx={previewStyles.avatar}
          >
            {label.slice(0, 1).toUpperCase()}
          </Box>
          <Typography component="span" sx={previewStyles.placeholderMessage}>
            {cameraEnabled ? "Connecting camera…" : "Camera off"}
          </Typography>
        </Box>
      )}
      <Box component="div" sx={previewStyles.label}>
        <Box component="span" sx={previewStyles.indicator} />
        {label}
        {muted && <Typography component="span" sx={previewStyles.selfTag}>YOU</Typography>}
      </Box>
    </Box>
  );
}
