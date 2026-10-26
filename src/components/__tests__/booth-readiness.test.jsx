import { render, screen } from "@testing-library/react";
import PhotoControls from "../organisms/PhotoControls.jsx";
import CameraStage from "../organisms/CameraStage.jsx";
import ConnectionPill from "../molecules/ConnectionPill.jsx";

const controlProps = {
  isHost: true,
  cameraEnabled: true,
  toggleCamera: () => {},
  canCapture: true,
  participantCount: 2,
  takePhoto: () => {},
  leaveRoom: () => {},
  galleryCount: 0,
  toggleGallery: () => {},
};

/** The dock in isolation, so each readiness state gets one clear label. */
function renderControls(overrides = {}) {
  return render(<PhotoControls {...controlProps} {...overrides} />);
}

describe("booth readiness states", () => {
  it("offers the shot to a host in a fully ready room", () => {
    renderControls();

    expect(screen.getByRole("button", { name: /^take photo$/i })).toBeEnabled();
  });

  it("tells a guest that the host shoots", () => {
    renderControls({ isHost: false, canCapture: false });

    expect(screen.getByRole("button", { name: /host takes the photo/i })).toBeDisabled();
  });

  it("tells a host alone that a guest is still needed", () => {
    renderControls({ canCapture: false, participantCount: 1 });

    expect(screen.getByRole("button", { name: /waiting for a guest/i })).toBeDisabled();
  });

  it("tells a host with joining guests that cameras are connecting", () => {
    renderControls({ canCapture: false, participantCount: 2 });

    expect(screen.getByRole("button", { name: /connecting cameras/i })).toBeDisabled();
  });

  it("keeps the camera toggle label short and single-line", () => {
    renderControls({ cameraEnabled: false });

    expect(screen.getByRole("button", { name: /^camera on$/i })).toBeInTheDocument();
  });
});

describe("booth status copy", () => {
  it("uses the head count as the header pill's only message", () => {
    const { rerender } = render(<ConnectionPill connected={false} count={1} />);
    expect(screen.getByText("Waiting for guests")).toBeInTheDocument();
    expect(screen.queryByText(/share your code/i)).not.toBeInTheDocument();

    rerender(<ConnectionPill connected count={2} />);
    expect(screen.getByText("2 of 4 in the booth")).toBeInTheDocument();
  });

  it("floats a notice over the stage only when there is one", () => {
    const stageProps = {
      participants: [],
      participantVideosRef: { current: new Map() },
      connected: false,
      countdown: null,
      shotNumber: 0,
      totalShots: 4,
    };
    const { rerender } = render(<CameraStage {...stageProps} callStatus="" />);

    expect(screen.queryByText(/share the photobooth code/i)).not.toBeInTheDocument();

    rerender(
      <CameraStage {...stageProps} callStatus="The room creator ended the photobooth." />,
    );
    expect(screen.getByText(/room creator ended/i)).toBeInTheDocument();
  });
});
