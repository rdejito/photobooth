import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StatusDot from "../atoms/StatusDot.jsx";
import CropGuide from "../atoms/CropGuide.jsx";
import { cameraCropRegion, ensureVisibleRegion } from "../../rendering/cropGuide.js";
import { frameBorderWidth } from "../../lib/constants.js";
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
 * @param {boolean} [props.connected] - False shows the "Reconnecting…" state.
 * @param {number} [props.participantCount] - Size of the group in the photo.
 * @param {number} [props.participantIndex] - This participant's tile position.
 * @param {string} [props.layout] - Selected frame layout key.
 * @param {string} [props.frame] - Selected frame key, for its slot border inset.
 */
export default function VideoPreview({
  videoRef,
  stream,
  label,
  muted = false,
  cameraEnabled = true,
  connected = true,
  participantCount = 1,
  participantIndex = 0,
  layout = "single-horizontal",
  frame = "classic",
}) {
  const elementRef = useRef(null);
  const [videoSize, setVideoSize] = useState(() => readStreamSize(stream));

  // A disconnected tile must never keep showing its last decoded frame, so the
  // srcObject is detached (not just hidden) until the peer reconnects.
  useEffect(() => {
    const video = elementRef.current;
    if (video) video.srcObject = connected ? stream : null;
    // Keep the last known ratio while disconnected so the tile doesn't resize
    // under the placeholder; a fresh stream refreshes it on reconnect.
    if (stream) setVideoSize(readStreamSize(stream));
    return () => {
      if (video) video.srcObject = null;
    };
  }, [stream, connected]);

  const updateVideoSize = (event) => {
    const { videoWidth, videoHeight } = event.currentTarget;
    if (videoWidth > 0 && videoHeight > 0) {
      setVideoSize({ width: videoWidth, height: videoHeight });
    }
  };

  const showGuide = Boolean(stream) && cameraEnabled && connected;
  const cropRegion = useMemo(() => {
    if (!showGuide) return null;
    return ensureVisibleRegion(
      cameraCropRegion({
        videoWidth: videoSize.width,
        videoHeight: videoSize.height,
        participantCount,
        participantIndex,
        layout,
        borderWidth: frameBorderWidth(frame),
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
    frame,
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
      {(!stream || !cameraEnabled || !connected) && (
        <Box
          sx={{
            ...videoPreviewStyles.placeholder,
            ...(cameraEnabled && connected ? {} : videoPreviewStyles.placeholderOff),
          }}
          role="status"
          aria-label={`${label}'s camera is ${
            !connected ? "reconnecting" : cameraEnabled ? "connecting" : "off"
          }`}
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
            {!connected ? "Reconnecting…" : cameraEnabled ? "Connecting camera…" : "Camera off"}
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
