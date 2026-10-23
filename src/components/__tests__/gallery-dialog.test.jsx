import { render, screen } from "@testing-library/react";
import GalleryDialog from "../molecules/GalleryDialog.jsx";

describe("GalleryDialog", () => {
  it("takes its accessible name from the snapshots heading", () => {
    render(
      <GalleryDialog
        open
        onClose={() => {}}
        gallery={[]}
        deletePhoto={() => {}}
        downloadPhoto={() => {}}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "Your snapshots" }),
    ).toBeInTheDocument();
  });
});
