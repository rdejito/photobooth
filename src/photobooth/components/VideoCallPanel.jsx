import { useRef, useState } from "react";
import GalleryPanel from "./GalleryPanel.jsx";
import PhotoControls from "./PhotoControls.jsx";
import PhotoPreview from "./PhotoPreview.jsx";
import VideoPreview from "./VideoPreview.jsx";
import CameraIcon from "./CameraIcon.jsx";
import { useCameraTileSizing } from "../hooks/useCameraTileSizing.js";

export default function VideoCallPanel({
  participants,
  participantVideosRef,
  canvasRef,
  roomCode,
  connected,
  isHost,
  canCapture,
  callStatus,
  frame,
  setFrame,
  countdown,
  showPreview,
  photoDataUrl,
  takePhoto,
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
    <section className="room-shell">
      <header className="room-header">
        <div className="room-brand">
          <span className="room-brand-mark"><CameraIcon /></span>
          <span>Little Moments</span>
        </div>
        <div className={`connection-pill ${connected ? "is-connected" : ""}`}>
          <span className="connection-dot" />
          {connected
            ? `${participants.length} of 4 in the booth`
            : "Waiting for guests — share your code"}
        </div>
      </header>

      <div className="room-intro">
        <div>
          <p className="room-kicker">ONLINE PHOTOBOOTH</p>
          <h1>{connected ? "Everyone in frame." : "Your booth is open."}</h1>
          <p className="room-description">
            {connected
              ? "Pick a frame, get everyone ready, and capture the whole crew."
              : "Share the code. Up to three guests can join, and they will appear here as they arrive."}
          </p>
        </div>
        <div className="room-code-card">
          <span>PHOTOBOOTH CODE</span>
          <strong>{roomCode || "------"}</strong>
          <small>Invite up to three guests</small>
          <button
            className="copy-room-code"
            type="button"
            onClick={copyRoomCode}
            disabled={!roomCode}
          >
            {copyStatus || "Copy code"}
          </button>
        </div>
      </div>

      <div className="room-workspace">
        <div className="video-stage">
          <div className="stage-label">
            <span className="stage-label-dot" />
            {connected
              ? `${participants.filter(({ stream }) => stream).length} CAMERAS READY`
              : "CAMERA PREVIEW"}
          </div>
          <div
            className="video-group"
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
              />
            ))}
          </div>
          {countdown !== null && (
            <div className="room-countdown" aria-live="assertive">
              {countdown}
            </div>
          )}
          {!connected && (
            <div className="waiting-note">
              <span className="waiting-note-icon"><CameraIcon /></span>
              <span>
                {callStatus || "Share the photobooth code. Guests will appear here as they join."}
              </span>
            </div>
          )}
        </div>

        <PhotoControls
          frame={frame}
          setFrame={setFrame}
          isHost={isHost}
          canCapture={canCapture}
          takePhoto={takePhoto}
          leaveRoom={leaveRoom}
          galleryCount={gallery.length}
          toggleGallery={() => setShowGallery((visible) => !visible)}
        />
      </div>
      <PhotoPreview
        canvasRef={canvasRef}
        imageData={photoDataUrl}
        visible={showPreview}
        hidePreview={hidePreview}
      />
      {showGallery && (
        <div className="snapshots-backdrop" onClick={() => setShowGallery(false)}>
          <div className="snapshots-dialog" onClick={(event) => event.stopPropagation()}>
            <GalleryPanel
              gallery={gallery}
              deletePhoto={deletePhoto}
              downloadPhoto={downloadPhoto}
              onClose={() => setShowGallery(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
}
