import { fireEvent, render, screen } from "@testing-library/react";
import GalleryPanel from "../GalleryPanel.jsx";

const photo = {
  id: "photo-1",
  dataUrl: "data:image/png;base64,iVBORw0KGgo=",
  takenAt: "October 9, 2026",
  frame: "classic",
};

describe("GalleryPanel", () => {
  it("explains when the gallery is empty", () => {
    render(
      <GalleryPanel
        gallery={[]}
        deletePhoto={() => {}}
        downloadPhoto={() => {}}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("Your snapshots")).toBeInTheDocument();
    expect(screen.getByText(/gallery is waiting for its first memory/i)).toBeInTheDocument();
    expect(screen.getByText("0 photos")).toBeInTheDocument();
  });

  it("shows a photo and preserves its download and delete callbacks", () => {
    const deletePhoto = vi.fn();
    const downloadPhoto = vi.fn();
    render(
      <GalleryPanel
        gallery={[photo]}
        deletePhoto={deletePhoto}
        downloadPhoto={downloadPhoto}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("1 photo")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: `Snapshot from ${photo.takenAt}` })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: `Download photo from ${photo.takenAt}` }));
    fireEvent.click(screen.getByRole("button", { name: `Delete photo from ${photo.takenAt}` }));

    expect(downloadPhoto).toHaveBeenCalledWith(photo);
    expect(deletePhoto).toHaveBeenCalledWith(photo.id);
  });
});
