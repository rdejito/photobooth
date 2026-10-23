import { fireEvent, render, screen } from "@testing-library/react";
import PhotoPreview from "../organisms/PhotoPreview.jsx";
import BoothPage from "../../pages/BoothPage.jsx";

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

describe("PhotoPreview storage warning and disposal", () => {
  it("confirms before discarding an unsaved host photo with Esc or backdrop", () => {
    const hidePreview = vi.fn();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(
      <PhotoPreview
        canvasRef={{ current: null }}
        imageData="data:image/png;base64,iVBORw0KGgo="
        visible
        canCustomize
        photoPending={false}
        frame="classic"
        setFrame={() => {}}
        savePhoto={() => {}}
        hidePreview={hidePreview}
      />,
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape", code: "Escape" });
    expect(confirmSpy).toHaveBeenCalled();
    expect(hidePreview).not.toHaveBeenCalled();
    confirmSpy.mockReturnValue(true);
    fireEvent.keyDown(screen.getByRole("dialog").closest(".MuiDialog-root"), {
      key: "Escape",
      code: "Escape",
    });
    expect(hidePreview).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("shows the gallery storage warning in the photo preview", () => {
    renderPanel({
      showPreview: true,
      canCustomizePreview: true,
      photoDataUrl: "data:image/png;base64,iVBORw0KGgo=",
      galleryStatus: "Browser storage is full — this photo won't survive a reload.",
    });

    expect(screen.getByRole("status")).toHaveTextContent(/storage is full/i);
  });
});
