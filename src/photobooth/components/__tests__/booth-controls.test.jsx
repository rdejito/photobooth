import { render, screen } from "@testing-library/react";
import VideoCallPanel from "../VideoCallPanel.jsx";

describe("Flowbite booth controls", () => {
  it("preserves the booth control flow and frame picker while using Flowbite elements", () => {
    render(
      <VideoCallPanel
        participants={[]}
        participantVideosRef={{ current: new Map() }}
        canvasRef={{ current: null }}
        roomCode="ABCD"
        connected={true}
        isHost={true}
        cameraEnabled={true}
        toggleCamera={() => {}}
        canCapture={true}
        callStatus="ready"
        frame="classic"
        setFrame={() => {}}
        countdown={0}
        showPreview={false}
        canCustomizePreview={true}
        photoPending={false}
        photoDataUrl=""
        takePhoto={() => {}}
        savePhoto={() => {}}
        leaveRoom={() => {}}
        hidePreview={() => {}}
        gallery={[]}
        showGallery={false}
        setShowGallery={() => {}}
        deletePhoto={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: /take photo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /turn camera off/i })).toBeInTheDocument();
    expect(screen.getByText(/pick a photo frame/i)).toBeInTheDocument();
  });
});
