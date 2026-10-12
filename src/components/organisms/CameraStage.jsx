import { useRef } from "react";
import Box from "@mui/material/Box";
import StatusDot from "../atoms/StatusDot.jsx";
import VideoPreview from "./VideoPreview.jsx";
import CountdownOverlay from "../molecules/CountdownOverlay.jsx";
import WaitingBanner from "../molecules/WaitingBanner.jsx";
import { useCameraTileSizing } from "../../hooks/useCameraTileSizing.js";
import { cameraStageStyles } from "../../theme/styles/cameraStage.js";

/**
 * CameraStage — the framed video area: up to four camera tiles in a responsive
 * grid, with the countdown bubble and the "waiting for guests" banner floating
 * above it. Also owns the live per-viewport tile sizing.
 *
 * @param {object} props
 * @param {Array} props.participants - Room participants to show as tiles.
 * @param {React.RefObject} props.participantVideosRef - Map ref filled with the
 *   live <video> elements, indexed by participant id, for snapshots.
 * @param {boolean} props.connected - Whether the session is connected.
 * @param {string} props.callStatus - Room status line for the waiting banner.
 * @param {number|null} props.countdown - 3..1, "📸", or null when idle.
 * @param {number} props.shotNumber - Current burst shot (for the label).
 * @param {number} props.totalShots - Total burst length.
 * @param {string} [props.layout] - Selected frame layout, for the crop guides.
 */
export default function CameraStage({
  participants,
  participantVideosRef,
  connected,
  callStatus,
  countdown,
  shotNumber,
  totalShots,
  layout = "single-horizontal",
}) {
  const videoGroupRef = useRef(null);
  useCameraTileSizing(videoGroupRef, participants.length);

  return (
    <Box component="section" sx={cameraStageStyles.stage}>
      <Box sx={cameraStageStyles.stageLabel}>
        <StatusDot size={6} color="#e9b69a" glowColor="rgba(233,182,154,0.5)" />
        {connected
          ? `${participants.filter(({ stream }) => stream).length} CAMERAS READY`
          : "CAMERA PREVIEW"}
      </Box>
      <Box
        ref={videoGroupRef}
        sx={cameraStageStyles.videoGroup}
        data-participant-count={participants.length}
      >
        {participants.map((participant, index) => (
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
            connected={participant.connected ?? true}
            participantCount={participants.length}
            participantIndex={index}
            layout={layout}
          />
        ))}
      </Box>
      {countdown !== null && (
        <CountdownOverlay
          countdown={countdown}
          shotNumber={shotNumber}
          totalShots={totalShots}
        />
      )}
      {!connected && <WaitingBanner message={callStatus} />}
    </Box>
  );
}