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

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PhotoPreview dismissal and actions", () => {
  const previewProps = {
    canvasRef: { current: null },
    imageData: "data:image/png;base64,iVBORw0KGgo=",
    visible: true,
    canCustomize: false,
    photoPending: false,
    frame: "classic",
    setFrame: () => {},
    savePhoto: () => {},
    hidePreview: () => {},
  };

  it("lets a guest dismiss the preview without the host's discard confirm", () => {
    const hidePreview = vi.fn();
    const confirmSpy = vi.spyOn(window, "confirm");
    render(<PhotoPreview {...previewProps} hidePreview={hidePreview} />);

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape", code: "Escape" });

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(hidePreview).toHaveBeenCalled();
    expect(
      screen.queryByRole("button", { name: /save and share photo/i }),
    ).not.toBeInTheDocument();
  });

  it("closes a pending capture without warning, since there is nothing to lose", () => {
    const hidePreview = vi.fn();
    const confirmSpy = vi.spyOn(window, "confirm");
    render(
      <PhotoPreview
        {...previewProps}
        canCustomize
        photoPending
        hidePreview={hidePreview}
      />,
    );

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape", code: "Escape" });

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(hidePreview).toHaveBeenCalled();
  });

  it("downloads the current image under the shared filename", () => {
    let downloaded;
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function click() {
      downloaded = this;
    });
    render(<PhotoPreview {...previewProps} />);

    fireEvent.click(screen.getByRole("button", { name: /download photo/i }));

    expect(downloaded.href).toBe(previewProps.imageData);
    expect(downloaded.download).toMatch(/^little-moments-\d+\.png$/);
  });
});

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
