import { useState } from "react";
import { fireEvent, render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import FramePicker from "../FramePicker.jsx";
import PhotoPreview from "../PhotoPreview.jsx";
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

function GalleryHarness() {
  const [showGallery, setShowGallery] = useState(false);
  return (
    <VideoCallPanel
      {...defaultProps}
      showGallery={showGallery}
      setShowGallery={setShowGallery}
    />
  );
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

  it("selects a frame through an accessible MUI button", () => {
    const setFrame = vi.fn();
    render(<FramePicker frame="classic" setFrame={setFrame} />);

    expect(screen.getByRole("button", { name: /classic/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /polaroid/i })).toHaveClass("MuiButton-root");
    fireEvent.click(screen.getByRole("button", { name: /polaroid/i }));
    expect(setFrame).toHaveBeenCalledWith("polaroid");
  });

  it("preserves photo preview download names and the take-another action", () => {
    const hidePreview = vi.fn();
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function () {
      expect(this.download).toBe("little-moments-123456789.png");
    });
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(123456789);

    render(
      <PhotoPreview
        canvasRef={{ current: null }}
        imageData="data:image/png;base64,iVBORw0KGgo="
        visible
        canCustomize={false}
        photoPending={false}
        frame="classic"
        setFrame={() => {}}
        savePhoto={() => {}}
        hidePreview={hidePreview}
      />,
    );

    try {
      fireEvent.click(screen.getByRole("button", { name: "Download photo" }));
      fireEvent.click(screen.getByRole("button", { name: "Take another" }));

      expect(clickSpy).toHaveBeenCalledOnce();
      expect(hidePreview).toHaveBeenCalledOnce();
    } finally {
      clickSpy.mockRestore();
      nowSpy.mockRestore();
    }
  });

  it("closes snapshots with its close control and keeps room controls available", async () => {
    render(<GalleryHarness />);
    fireEvent.click(screen.getByRole("button", { name: /^photos$/i }));

    const dialog = await screen.findByRole("dialog", { name: /your snapshots/i });
    fireEvent.click(screen.getByRole("button", { name: /close snapshots/i }));
    await waitForElementToBeRemoved(dialog);

    expect(screen.getByRole("button", { name: /take photo/i })).toBeEnabled();
  });

  it("closes snapshots on Escape and restores focus to the gallery trigger", async () => {
    render(<GalleryHarness />);
    const trigger = screen.getByRole("button", { name: /^photos$/i });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = await screen.findByRole("dialog", { name: /your snapshots/i });
    expect(dialog).toContainElement(document.activeElement);
    fireEvent.keyDown(dialog.closest(".MuiDialog-root"), {
      key: "Escape",
      code: "Escape",
    });
    await waitForElementToBeRemoved(dialog);

    expect(document.activeElement).toBe(trigger);
    expect(screen.getByRole("button", { name: /take photo/i })).toBeEnabled();
  });
});
