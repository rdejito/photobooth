import { render, screen } from "@testing-library/react";
import VideoPreview from "../organisms/VideoPreview.jsx";

/** A minimal MediaStream stand-in exposing only what VideoPreview reads. */
function createStream() {
  return { getVideoTracks: () => [] };
}

describe("disconnected camera tile", () => {
  it("shows an accessible reconnecting status when a peer disconnects", () => {
    render(<VideoPreview stream={null} label="Guest" connected={false} />);

    const status = screen.getByRole("status", { name: /guest's camera is reconnecting/i });
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent(/reconnecting/i);
  });

  it("detaches the srcObject so a stale frame cannot remain on screen", () => {
    const stream = createStream();
    const { rerender } = render(
      <VideoPreview stream={stream} label="Guest" connected />,
    );

    const video = document.querySelector("video");
    expect(video.srcObject).toBe(stream);

    rerender(<VideoPreview stream={stream} label="Guest" connected={false} />);

    expect(video.srcObject).toBeNull();
    expect(
      screen.getByRole("status", { name: /guest's camera is reconnecting/i }),
    ).toBeInTheDocument();
  });

  it("hides the disconnected status again once the peer reconnects", () => {
    const stream = createStream();
    const { rerender } = render(
      <VideoPreview stream={null} label="Guest" connected={false} />,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();

    rerender(<VideoPreview stream={stream} label="Guest" connected />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
