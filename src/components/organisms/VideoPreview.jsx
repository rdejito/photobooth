import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StatusDot from "../atoms/StatusDot.jsx";
import CropGuide from "../atoms/CropGuide.jsx";
import { cameraCropRegion, ensureVisibleRegion } from "../../rendering/cropGuide.js";
import { videoPreviewStyles } from "../../theme/styles/videoPreview.js";

/** The smallest fractional guide size kept legible on extreme aspect ratios. */
const MIN_GUIDE_FRACTION = 0.12;

/** Reads the stream's native resolution to size the tile and crop guide. */
function readStreamSize(stream) {
  const track = stream?.getVideoTracks?.()[0];
  const { width, height } = track?.getSettings?.() || {};
  return width > 0 && height > 0 ? { width, height } : { width: 4, height: 3 };
}

/**
 * VideoPreview — one participant's camera tile: the mirrored live video (or a
 * placeholder when connecting/camera-off), a framing guide showing the region
 * that will survive into the final photo, and a name pill with a green dot.
 *
 * @param {object} props
 * @param {React.Ref} props.videoRef - Forwarded ref so the capture sequence
 *   can snapshot this exact <video> element.
 * @param {MediaStream} [props.stream] - This participant's stream.
 * @param {string} props.label - Participant name.
 * @param {boolean} [props.muted] - Mutes audio and tags the tile "YOU".
 * @param {boolean} [props.cameraEnabled] - False shows the "Camera off" state.
 * @param {number} [props.participantCount] - Size of the group in the photo.
 * @param {number} [props.participantIndex] - This participant's tile position.
 * @param {string} [props.layout] - Selected frame layout key.
 */
export default function VideoPreview({
  videoRef,
  stream,
  label,
  muted = false,
  cameraEnabled = true,
  participantCount = 1,
  participantIndex = 0,
  layout = "single-horizontal",
}) {
  const elementRef = useRef(null);
  const [videoSize, setVideoSize] = useState(() => readStreamSize(stream));

  useEffect(() => {
    const video = elementRef.current;
    if (video) video.srcObject = stream;
    setVideoSize(readStreamSize(stream));
    return () => {
      if (video) video.srcObject = null;
    };
  }, [stream]);

  const updateVideoSize = (event) => {
    const { videoWidth, videoHeight } = event.currentTarget;
    if (videoWidth > 0 && videoHeight > 0) {
      setVideoSize({ width: videoWidth, height: videoHeight });
    }
  };

  const showGuide = Boolean(stream) && cameraEnabled;
  const cropRegion = useMemo(() => {
    if (!showGuide) return null;
    return ensureVisibleRegion(
      cameraCropRegion({
        videoWidth: videoSize.width,
        videoHeight: videoSize.height,
        participantCount,
        participantIndex,
        layout,
      }),
      MIN_GUIDE_FRACTION,
    );
  }, [
    showGuide,
    videoSize.width,
    videoSize.height,
    participantCount,
    participantIndex,
    layout,
  ]);

  return (
    <Box
      sx={videoPreviewStyles.tile}
      style={{ "--camera-aspect-ratio": `${videoSize.width} / ${videoSize.height}` }}
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
        onLoadedMetadata={updateVideoSize}
        onResize={updateVideoSize}
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
      <CropGuide region={cropRegion} />
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
