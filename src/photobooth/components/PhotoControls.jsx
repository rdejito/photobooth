import ActionButton from "./ActionButton.jsx";
import CameraIcon from "./CameraIcon.jsx";

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
    <div className="room-controls-panel">
      <div className="room-actions-bar">
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
      </div>
    </div>
  );
}
