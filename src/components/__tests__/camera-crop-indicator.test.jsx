import { render, screen } from "@testing-library/react";
import VideoPreview from "../organisms/VideoPreview.jsx";

/** A minimal MediaStream stand-in exposing only what VideoPreview reads. */
function createStream(width, height) {
  return {
    getVideoTracks: () => [{ getSettings: () => ({ width, height }) }],
  };
}

/** Reads the tile's inline crop aspect ratio as a number. */
function tileAspect(container) {
  const [width, height] = container.firstElementChild.style
    .getPropertyValue("--camera-aspect-ratio")
    .split("/")
    .map((part) => Number(part.trim()));
  return width / height;
}

/** Reads the video's inline crop window as percentage values. */
function videoCrop(container) {
  const style = container.querySelector("video").style;
  const read = (name) => parseFloat(style.getPropertyValue(name));
  return {
    width: read("width"),
    height: read("height"),
    left: read("left"),
    top: read("top"),
  };
}

describe("camera crop preview", () => {
  it("crops a 16:9 camera shared by two people to the saved region", () => {
    const { container } = render(
      <VideoPreview
        stream={createStream(1280, 720)}
        label="Ada"
        participantCount={2}
        participantIndex={0}
        layout="single-horizontal"
      />,
    );

    // Region is 0.375 x 0.9118 of the camera, so the tile is tall, not 16:9.
    expect(tileAspect(container)).toBeCloseTo(0.731, 3);
    const crop = videoCrop(container);
    expect(crop.width).toBeCloseTo(266.667, 2);
    expect(crop.height).toBeCloseTo(109.677, 2);
    expect(crop.left).toBeCloseTo(-83.333, 2);
    expect(crop.top).toBeCloseTo(-4.839, 2);
  });

  it("keeps a tall camera's head crop instead of showing the full frame", () => {
    const { container } = render(
      <VideoPreview
        stream={createStream(405, 720)}
        label="Ada"
        participantCount={4}
        participantIndex={0}
        layout="single-horizontal"
      />,
    );

    // The saved crop sits above centre, so the video slides up inside it.
    const crop = videoCrop(container);
    expect(crop.width).toBeCloseTo(100, 3);
    expect(crop.height).toBeGreaterThan(250);
    expect(crop.top).toBeCloseTo(-32.222, 2);
  });

  it("matches the selected frame's border inset", () => {
    const { container, rerender } = render(
      <VideoPreview
        stream={createStream(640, 480)}
        label="Ada"
        participantCount={1}
        layout="single-horizontal"
        frame="classic"
      />,
    );

    expect(tileAspect(container)).toBeCloseTo(1.4624, 3);

    rerender(
      <VideoPreview
        stream={createStream(640, 480)}
        label="Ada"
        participantCount={1}
        layout="single-horizontal"
        frame="polaroid"
      />,
    );

    expect(tileAspect(container)).toBeCloseTo(1.4433, 3);
  });

  it("updates the crop when the layout changes", () => {
    const { container, rerender } = render(
      <VideoPreview
        stream={createStream(1280, 720)}
        label="Ada"
        participantCount={2}
        participantIndex={0}
        layout="single-horizontal"
      />,
    );

    expect(tileAspect(container)).toBeCloseTo(0.7312, 3);

    rerender(
      <VideoPreview
        stream={createStream(1280, 720)}
        label="Ada"
        participantCount={2}
        participantIndex={0}
        layout="grid-2x2"
      />,
    );

    expect(tileAspect(container)).toBeCloseTo(0.6782, 3);
  });

  it("renders no separate framing guide over the preview", () => {
    const { container } = render(
      <VideoPreview
        stream={createStream(1280, 720)}
        label="Ada"
        participantCount={2}
        participantIndex={0}
      />,
    );

    expect(container.querySelector("[data-testid='camera-crop-guide']")).toBeNull();
    expect(screen.getByText("Ada")).toBeInTheDocument();
  });
});
