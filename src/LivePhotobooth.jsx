import { useRef, useState } from "react";
import FlashOverlay from "./photobooth/components/FlashOverlay.jsx";
import HomePage from "./photobooth/components/HomePage.jsx";
import VideoCallPanel from "./photobooth/components/VideoCallPanel.jsx";
import { usePhotoCapture } from "./photobooth/hooks/usePhotoCapture.js";
import { usePhotoGallery } from "./photobooth/hooks/usePhotoGallery.js";
import { usePeerRoom } from "./photobooth/hooks/usePeerRoom.js";
import "./photobooth/home.css";
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
    <main className={stage === "join" ? undefined : "call-page"}>
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
          canCapture={canCapture}
          callStatus={callStatus}
          frame={capture.frame}
          setFrame={capture.setFrame}
          countdown={capture.countdown}
          showPreview={capture.showPreview}
          photoDataUrl={capture.photoDataUrl}
          takePhoto={capture.takePhoto}
          leaveRoom={leaveCall}
          hidePreview={capture.hidePreview}
          gallery={gallery}
          showGallery={showGallery}
          setShowGallery={setShowGallery}
          deletePhoto={deletePhoto}
        />
      )}
      <FlashOverlay visible={capture.showFlash} />
    </main>
  );
}
