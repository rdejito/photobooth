import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StatusDot from "../atoms/StatusDot.jsx";
import { cameraCropRegion } from "../../rendering/cropGuide.js";
import { frameBorderWidth } from "../../lib/constants.js";
import { videoPreviewStyles } from "../../theme/styles/videoPreview.js";

/** Reads the stream's native resolution to size the tile and its crop. */
function readStreamSize(stream) {
  const track = stream?.getVideoTracks?.()[0];
  const { width, height } = track?.getSettings?.() || {};
  return width > 0 && height > 0 ? { width, height } : { width: 4, height: 3 };
}

/**
 * `object-fit: cover` cannot zoom into a crop that trims both axes, so the video
 * is oversized and offset instead: the element is `1 / crop` times the tile and
 * the crop's top-left is pulled to the tile's top-left. The tile's aspect ratio
 * already equals the crop's, so this shows exactly the saved region.
 */
function cropWindowStyle({ x, y, width, height }) {
  return {
    width: `${100 / width}%`,
    height: `${100 / height}%`,
    left: `${(-x * 100) / width}%`,
    top: `${(-y * 100) / height}%`,
  };
}

/**
 * VideoPreview — one participant's camera tile: the mirrored live video (or a
 * placeholder when connecting/camera-off) and a name pill with a green dot.
 *
 * The tile itself is cropped to exactly the region that survives into the final
 * photo, so what a participant frames is what they get. The tile's aspect ratio
 * comes from that region (not from the camera), and the video is scaled and
 * offset so the saved crop fills it.
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

  const cropRegion = useMemo(
    () =>
      cameraCropRegion({
        videoWidth: videoSize.width,
        videoHeight: videoSize.height,
        participantCount,
        participantIndex,
        layout,
        borderWidth: frameBorderWidth(frame),
      }),
    [
      videoSize.width,
      videoSize.height,
      participantCount,
      participantIndex,
      layout,
      frame,
    ],
  );
  const tileAspect = `${cropRegion.width * videoSize.width} / ${
    cropRegion.height * videoSize.height
  }`;

  return (
    <Box
      sx={videoPreviewStyles.tile}
      style={{ "--camera-aspect-ratio": tileAspect }}
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
        style={cropWindowStyle(cropRegion)}
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
