import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StatusDot from "../atoms/StatusDot.jsx";
import { videoPreviewStyles } from "../../theme/styles/videoPreview.js";

/** Reads the stream's native resolution to give the tile its aspect ratio. */
function getStreamAspectRatio(stream) {
  const track = stream?.getVideoTracks?.()[0];
  const { width, height } = track?.getSettings?.() || {};
  return width > 0 && height > 0 ? `${width} / ${height}` : "4 / 3";
}

/**
 * VideoPreview — one participant's camera tile: the mirrored live video (or a
 * placeholder when connecting/camera-off) plus a name pill with a green dot.
 *
 * @param {object} props
 * @param {React.Ref} props.videoRef - Forwarded ref so the capture sequence
 *   can snapshot this exact <video> element.
 * @param {MediaStream} [props.stream] - This participant's stream.
 * @param {string} props.label - Participant name.
 * @param {boolean} [props.muted] - Mutes audio and tags the tile "YOU".
 * @param {boolean} [props.cameraEnabled] - False shows the "Camera off" state.
 */
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
      sx={videoPreviewStyles.tile}
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
        sx={videoPreviewStyles.video}
      />
      {(!stream || !cameraEnabled) && (
        <Box
          sx={{
            ...videoPreviewStyles.placeholder,
            ...(cameraEnabled ? {} : videoPreviewStyles.placeholderOff),
          }}
          role="status"
          aria-label={`${label}'s camera is ${cameraEnabled ? "connecting" : "off"}`}
        >
          <Box
            component="span"
            className="participant-placeholder-avatar"
            aria-hidden="true"
            sx={videoPreviewStyles.avatar}
          >
            {label.slice(0, 1).toUpperCase()}
          </Box>
          <Typography component="span" sx={videoPreviewStyles.placeholderMessage}>
            {cameraEnabled ? "Connecting camera…" : "Camera off"}
          </Typography>
        </Box>
      )}
      <Box component="div" sx={videoPreviewStyles.label}>
        <StatusDot size={6} color="#c9dfb2" />
        {label}
        {muted && (
          <Typography component="span" sx={videoPreviewStyles.selfTag}>
            YOU
          </Typography>
        )}
      </Box>
    </Box>
  );
}