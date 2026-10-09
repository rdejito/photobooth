import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import FlashOverlay from "./photobooth/components/FlashOverlay.jsx";
import HomePage from "./photobooth/components/HomePage.jsx";
import VideoCallPanel from "./photobooth/components/VideoCallPanel.jsx";
import { usePhotoCapture } from "./photobooth/hooks/usePhotoCapture.js";
import { usePhotoGallery } from "./photobooth/hooks/usePhotoGallery.js";
import { usePeerRoom } from "./photobooth/hooks/usePeerRoom.js";
import "./photobooth/room.css";

export default function LivePhotobooth() {
  const [roomInput, setRoomInput] = useState("");
  const [showGallery, setShowGallery] = useState(false);
  const participantVideosRef = useRef(new Map());
  const canvasRef = useRef(null);
  const photoCallbacksRef = useRef({});
  const room = usePeerRoom({
    onPhoto: (photo) => photoCallbacksRef.current.receivePhoto?.(photo),
    onCountdown: (value) => photoCallbacksRef.current.receiveCountdown?.(value),
  });
  const { gallery, addPhoto, deletePhoto } = usePhotoGallery();
  const canCapture =
    room.isHost &&
    room.cameraEnabled &&
    room.participants.length > 1 &&
    room.participants.every((participant) => participant.stream);
  const capture = usePhotoCapture({
    getVideoElements: () =>
      room.participants
        .map((participant) => ({
          video: participantVideosRef.current.get(participant.id),
          label: participant.label,
        }))
        .filter(
          ({ video }) =>
            video?.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0,
        ),
    canvasRef,
    addPhoto,
    setCallStatus: room.setCallStatus,
    expectedParticipantCount: room.participants.length,
    canCapture,
    broadcastPhoto: (photo) => photoCallbacksRef.current.broadcastPhoto?.(photo),
    broadcastCountdown: (value) =>
      photoCallbacksRef.current.broadcastCountdown?.(value),
  });
  photoCallbacksRef.current.receivePhoto = capture.receivePhoto;
  photoCallbacksRef.current.receiveCountdown = capture.receiveCountdown;
  photoCallbacksRef.current.broadcastPhoto = room.broadcastPhoto;
  photoCallbacksRef.current.broadcastCountdown = room.broadcastCountdown;
  const {
    stage,
    joinStatus,
    setJoinStatus,
    callStatus,
    connected,
    participants,
    isHost,
    cameraEnabled,
    toggleCamera,
    createRoom,
    joinRoom,
    leaveRoom,
  } = room;
  const leaveCall = () => {
    capture.cancelCountdown();
    leaveRoom();
    capture.hidePreview();
  };

  return (
    <Box
      component="main"
      sx={
        stage === "join"
          ? undefined
          : {
              position: "relative",
              width: "100%",
              height: "100vh",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              padding: "0 clamp(12px, 2vw, 28px) 10px",
              overflow: "hidden",
              color: "#fffaf7",
              background:
                "radial-gradient(ellipse at 80% 20%, rgba(102,57,77,0.24), transparent 38%), radial-gradient(ellipse at 12% 85%, rgba(95,67,116,0.16), transparent 36%), #171423",
              fontFamily: '"Avenir Next", Avenir, "Segoe UI", sans-serif',
              "@supports (height: 100dvh)": { height: "100dvh" },
              "@media (max-width: 640px)": {
                paddingRight: 12,
                paddingLeft: 12,
              },
              "@media (max-width: 380px)": {
                paddingRight: 8,
                paddingLeft: 8,
              },
            }
      }
    >
      {stage === "join" ? (
        <HomePage
          roomInput={roomInput}
          setRoomInput={setRoomInput}
          joinStatus={joinStatus}
          setJoinStatus={setJoinStatus}
          createRoom={() => createRoom(roomInput, setRoomInput)}
          joinRoom={() => joinRoom(roomInput)}
        />
      ) : (
        <VideoCallPanel
          participants={participants}
          participantVideosRef={participantVideosRef}
          canvasRef={canvasRef}
          roomCode={roomInput}
          connected={connected}
          isHost={isHost}
          cameraEnabled={cameraEnabled}
          toggleCamera={toggleCamera}
          canCapture={canCapture}
          callStatus={callStatus}
          frame={capture.frame}
          setFrame={capture.setFrame}
          countdown={capture.countdown}
          showPreview={capture.showPreview}
          canCustomizePreview={capture.canCustomizePreview}
          photoPending={capture.photoPending}
          photoDataUrl={capture.photoDataUrl}
          takePhoto={capture.takePhoto}
          savePhoto={capture.savePhoto}
          leaveRoom={leaveCall}
          hidePreview={capture.hidePreview}
          gallery={gallery}
          showGallery={showGallery}
          setShowGallery={setShowGallery}
          deletePhoto={deletePhoto}
        />
      )}
      <FlashOverlay visible={capture.showFlash} />
    </Box>
  );
}
