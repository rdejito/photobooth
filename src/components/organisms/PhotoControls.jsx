import Box from "@mui/material/Box";
import ActionButton from "../atoms/ActionButton.jsx";
import CameraIcon from "../atoms/CameraIcon.jsx";
import {
  photoControlsActionsStyles,
  photoControlsPanelStyles,
  photoControlSlotStyles,
} from "../../theme/styles/photoControls.js";

/** The capture button's copy: one clear state per readiness combination. */
function captureLabel(isHost, canCapture, participantCount) {
  if (!isHost) return "Host takes the photo";
  if (canCapture) return "Take photo";
  if (participantCount <= 1) return "Waiting for a guest";
  return "Connecting cameras…";
}

/**
 * PhotoControls — the booth's bottom action bar: take photo, camera toggle, the
 * saved-photos counter and the leave-booth button. On a portrait phone the
 * primary action gets a full-width row of its own above the secondary three.
 *
 * The take button is the authority on readiness and always stays visible: a
 * guest sees that the host shoots, a host alone sees it is waiting for a guest,
 * a host with cameras still connecting sees that, and only a fully ready room
 * offers an enabled "Take photo".
 *
 * @param {object} props
 * @param {boolean} props.isHost - Whether this device hosts the room.
 * @param {boolean} props.cameraEnabled - Whether this device's camera is on.
 * @param {() => void} props.toggleCamera - Flips the local camera.
 * @param {boolean} props.canCapture - True when every participant is ready.
 * @param {number} props.participantCount - People currently in the room.
 * @param {() => void} props.takePhoto - Starts the four-shot capture.
 * @param {() => void} props.leaveRoom - Leaves the booth session.
 * @param {number} props.galleryCount - Number of saved snapshots.
 * @param {() => void} props.toggleGallery - Opens/closes the snapshots dialog.
 */
export default function PhotoControls({
  isHost,
  cameraEnabled,
  toggleCamera,
  canCapture,
  participantCount,
  takePhoto,
  leaveRoom,
  galleryCount,
  toggleGallery,
}) {
  return (
    <Box sx={photoControlsPanelStyles}>
      <Box sx={photoControlsActionsStyles}>
        <ActionButton
          onClick={takePhoto}
          disabled={!canCapture || !isHost}
          variant="primary"
          sx={photoControlSlotStyles.takePhoto}
        >
          <CameraIcon className="capture-icon" />
          {captureLabel(isHost, canCapture, participantCount)}
        </ActionButton>
        <ActionButton
          onClick={toggleCamera}
          variant="secondary"
          ariaPressed={!cameraEnabled}
          sx={photoControlSlotStyles.camera}
        >
          {cameraEnabled ? "Camera off" : "Camera on"}
        </ActionButton>
        <ActionButton
          onClick={toggleGallery}
          variant="secondary"
          sx={photoControlSlotStyles.photos}
        >
          Photos {galleryCount > 0 ? `(${galleryCount})` : ""}
        </ActionButton>
        <ActionButton
          onClick={leaveRoom}
          variant="quiet"
          sx={photoControlSlotStyles.leave}
        >
          Leave booth
        </ActionButton>
      </Box>
    </Box>
  );
}
