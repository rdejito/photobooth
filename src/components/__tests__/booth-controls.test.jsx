import { useState } from "react";
import { fireEvent, render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import FramePicker from "../organisms/FramePicker.jsx";
import LayoutPicker from "../organisms/LayoutPicker.jsx";
import PhotoPreview from "../organisms/PhotoPreview.jsx";
import BoothPage from "../../pages/BoothPage.jsx";
import VideoPreview from "../organisms/VideoPreview.jsx";

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
  layout: "single-horizontal",
  setLayout: () => {},
  countdown: null,
  showPreview: false,
  canCustomizePreview: true,
  photoPending: false,
  photoDataUrl: "",
  takePhoto: () => {},
  savePhoto: () => {},
  leaveRoom: () => {},
  hidePreview: () => {},
  galleryStatus: "",
  gallery: [],
  showGallery: false,
  setShowGallery: () => {},
  deletePhoto: () => {},
};

function renderPanel(overrides = {}) {
  return render(<BoothPage {...defaultProps} {...overrides} />);
}

function GalleryHarness() {
  const [showGallery, setShowGallery] = useState(false);
  return (
    <BoothPage
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

  it("keeps the dock labels one line by only giving the primary an icon", () => {
    renderPanel();

    expect(
      screen.getByRole("button", { name: /take photo/i }).querySelector("svg"),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: /turn camera off/i }).querySelector("svg"),
    ).toBeNull();
  });

  it("prevents guests and unready hosts from capturing photos", () => {
    const { rerender } = renderPanel({ isHost: false });

    expect(screen.getByRole("button", { name: /host takes photo/i })).toBeDisabled();

    rerender(
      <BoothPage
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

  it("selects a layout through an accessible MUI button", () => {
    const setLayout = vi.fn();
    render(<LayoutPicker layout="single-horizontal" setLayout={setLayout} />);

    expect(screen.getByRole("button", { name: /horizontal/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: /2×2 grid/i }));
    expect(setLayout).toHaveBeenCalledWith("grid-2x2");
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

  it("shows the composed burst as one preview instead of single-shot selectors", () => {
    render(
      <PhotoPreview
        canvasRef={{ current: null }}
        imageData="data:image/png;base64,composite"
        visible
        canCustomize
        photoPending={false}
        frame="classic"
        setFrame={() => {}}
        layout="single-horizontal"
        setLayout={() => {}}
        burstShots={Array(4).fill("data:image/png;base64,shot")}
        selectedBurstIndex={3}
        selectBurstShot={() => {}}
        savePhoto={() => {}}
        hidePreview={() => {}}
      />,
    );

    expect(screen.getByRole("img", { name: /latest group photobooth picture/i })).toHaveAttribute(
      "src",
      "data:image/png;base64,composite",
    );
    expect(screen.queryByText(/choose a burst shot/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /burst shot/i })).not.toBeInTheDocument();
  });

  it("gives the photo preview dialog an accessible name", () => {
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
        hidePreview={() => {}}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Latest group photo" })).toBeInTheDocument();
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
