import { PhotoTransfer } from "../PhotoTransfer.js";

function createTransfer() {
  const onPhoto = vi.fn();
  const onHostPhoto = vi.fn();
  return {
    transfer: new PhotoTransfer({ onPhoto, onHostPhoto }),
    onPhoto,
    onHostPhoto,
  };
}

const connection = { peer: "guest-1" };

function receivePhoto(transfer, photo = {}) {
  const id = photo.id || "photo-1";
  transfer.receive(connection, {
    type: "photo-start",
    id,
    frame: "classic",
    layout: "single-horizontal",
    total: 1,
    ...photo,
  });
  transfer.receive(connection, {
    type: "photo-chunk",
    id,
    index: 0,
    data: "data:image/png;base64,AA",
  });
}

describe("PhotoTransfer wire validation", () => {
  it("delivers a photo with a known frame and layout", () => {
    const { transfer, onPhoto } = createTransfer();

    receivePhoto(transfer);

    expect(onPhoto).toHaveBeenCalledWith(
      expect.objectContaining({ frame: "classic", layout: "single-horizontal" }),
    );
  });

  it.each([
    ["an unknown frame", { frame: "constructor" }],
    ["an unknown layout", { layout: "constructor" }],
  ])("drops a transfer carrying %s", (_label, photo) => {
    const { transfer, onPhoto, onHostPhoto } = createTransfer();

    receivePhoto(transfer, photo);

    expect(onPhoto).not.toHaveBeenCalled();
    expect(onHostPhoto).not.toHaveBeenCalled();
  });

  it("drops a payload that is not an image data URL", () => {
    const { transfer, onPhoto, onHostPhoto } = createTransfer();
    transfer.receive(connection, {
      type: "photo-start",
      id: "photo-1",
      frame: "classic",
      layout: "single-horizontal",
      total: 1,
    });

    transfer.receive(connection, {
      type: "photo-chunk",
      id: "photo-1",
      index: 0,
      data: "data:text/html;base64,PHNjcmlwdD4=",
    });

    expect(onPhoto).not.toHaveBeenCalled();
    expect(onHostPhoto).not.toHaveBeenCalled();
  });

  it("caps in-flight transfers per peer", () => {
    const { transfer, onPhoto } = createTransfer();
    for (let index = 0; index < 5; index += 1) {
      transfer.receive(connection, {
        type: "photo-start",
        id: `photo-${index}`,
        frame: "classic",
        layout: "single-horizontal",
        total: 1,
      });
    }

    for (let index = 0; index < 5; index += 1) {
      transfer.receive(connection, {
        type: "photo-chunk",
        id: `photo-${index}`,
        index: 0,
        data: "data:image/png;base64,AA",
      });
    }

    const delivered = onPhoto.mock.calls.map(([photo]) => photo.id);
    expect(delivered).toHaveLength(4);
    expect(delivered).not.toContain("photo-4");
  });

  it("purges only the removed peer's in-flight transfers", () => {
    const { transfer, onPhoto } = createTransfer();
    const guestA = { peer: "guest-a" };
    const guestB = { peer: "guest-b" };
    for (const [source, peer] of [[guestA, "photo-a"], [guestB, "photo-b"]]) {
      transfer.receive(source, {
        type: "photo-start",
        id: peer,
        frame: "classic",
        layout: "single-horizontal",
        total: 1,
      });
    }

    transfer.removePeer("guest-a");

    for (const [source, peer] of [[guestA, "photo-a"], [guestB, "photo-b"]]) {
      transfer.receive(source, {
        type: "photo-chunk",
        id: peer,
        index: 0,
        data: "data:image/png;base64,AA",
      });
    }

    expect(onPhoto).toHaveBeenCalledOnce();
    expect(onPhoto).toHaveBeenCalledWith(expect.objectContaining({ id: "photo-b" }));
  });
});
