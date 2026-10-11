import { render, screen } from "@testing-library/react";
import VideoPreview from "../organisms/VideoPreview.jsx";

/** A minimal MediaStream stand-in exposing only what VideoPreview reads. */
function createStream(width, height) {
  return {
    getVideoTracks: () => [{ getSettings: () => ({ width, height }) }],
  };
}

describe("camera crop indicator", () => {
  it("marks the surviving region of a 16:9 camera shared by two people", () => {
    render(
      <VideoPreview
        stream={createStream(1280, 720)}
        label="Ada"
        participantCount={2}
        participantIndex={0}
        layout="single-horizontal"
      />,
    );

    const guide = screen.getByTestId("camera-crop-guide");
    expect(guide).toBeInTheDocument();
    expect(guide).toHaveStyle({ left: "31.25%", width: "37.5%" });
  });

  it("hides the guide when the camera is off", () => {
    render(
      <VideoPreview
        stream={createStream(1280, 720)}
        label="Ada"
        cameraEnabled={false}
      />,
    );

    expect(screen.queryByTestId("camera-crop-guide")).not.toBeInTheDocument();
  });

  it("hides the guide while the camera is still connecting", () => {
    render(<VideoPreview label="Ada" />);

    expect(screen.queryByTestId("camera-crop-guide")).not.toBeInTheDocument();
  });

  it("updates the guide when the layout changes", () => {
    const { rerender } = render(
      <VideoPreview
        stream={createStream(1280, 720)}
        label="Ada"
        participantCount={2}
        participantIndex={0}
        layout="single-horizontal"
      />,
    );

    const horizontalHeight = screen.getByTestId("camera-crop-guide").style.height;

    rerender(
      <VideoPreview
        stream={createStream(1280, 720)}
        label="Ada"
        participantCount={2}
        participantIndex={0}
        layout="grid-2x2"
      />,
    );

    expect(screen.getByTestId("camera-crop-guide").style.height).not.toBe(
      horizontalHeight,
    );
  });
});
