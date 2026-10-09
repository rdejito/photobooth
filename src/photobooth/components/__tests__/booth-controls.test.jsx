import { render, screen } from "@testing-library/react";
import VideoCallPanel from "../VideoCallPanel.jsx";
import VideoPreview from "../VideoPreview.jsx";

const defaultProps = {
  participants: [],
  participantVideosRef: { current: new Map() },
  canvasRef: { current: null },
  roomCode: "ABCD",
  connected: true,
  isHost: true,
  cameraEnabled: true,
  toggleCamera: () => {},
  canCapture: true,
  callStatus: "ready",
  frame: "classic",
  setFrame: () => {},
  countdown: null,
  showPreview: false,
  canCustomizePreview: true,
  photoPending: false,
  photoDataUrl: "",
  takePhoto: () => {},
  savePhoto: () => {},
  leaveRoom: () => {},
  hidePreview: () => {},
  gallery: [],
  showGallery: false,
  setShowGallery: () => {},
  deletePhoto: () => {},
};

function renderPanel(overrides = {}) {
  return render(<VideoCallPanel {...defaultProps} {...overrides} />);
}

describe("MUI booth controls", () => {
  it("renders room controls and the frame picker with MUI typography", () => {
    renderPanel();

    expect(screen.getByRole("heading", { name: /everyone in frame/i })).toHaveClass(
      "MuiTypography-root",
    );
    expect(screen.getByRole("button", { name: /take photo/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /turn camera off/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByText(/pick a photo frame/i)).toBeInTheDocument();
  });

  it("prevents guests and unready hosts from capturing photos", () => {
    const { rerender } = renderPanel({ isHost: false });

    expect(screen.getByRole("button", { name: /host takes photo/i })).toBeDisabled();

    rerender(
      <VideoCallPanel
        {...defaultProps}
        canCapture={false}
      />,
    );
    expect(screen.getByRole("button", { name: /getting cameras ready/i })).toBeDisabled();
  });

  it("reflects camera state and keeps participant placeholders accessible", () => {
    render(
      <>
        <VideoPreview stream={null} label="You" cameraEnabled={false} />
        <VideoPreview stream={null} label="Guest" cameraEnabled />
      </>,
    );

    expect(screen.getByRole("status", { name: /you's camera is off/i })).toBeInTheDocument();
    expect(screen.getByRole("status", { name: /guest's camera is connecting/i })).toBeInTheDocument();
  });
});
