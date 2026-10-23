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

describe("PhotoTransfer sending", () => {
  function createWire(peer = "guest-1") {
    return {
      peer,
      sent: [],
      send(message) {
        this.sent.push(message);
      },
    };
  }

  it("reassembles a photo that spans multiple chunks with its metadata", () => {
    const wire = createWire();
    const sender = new PhotoTransfer({ onPhoto: vi.fn(), onHostPhoto: vi.fn() });
    const dataUrl = `data:image/png;base64,${"A".repeat(12500)}`;

    sender.send(wire, {
      id: "photo-1",
      frame: "classic",
      layout: "grid-2x2",
      captureId: "capture-1",
      revision: 2,
      preview: true,
      eventName: "Emma's birthday",
      dataUrl,
    });

    expect(wire.sent[0]).toMatchObject({
      type: "photo-start",
      id: "photo-1",
      total: 2,
      frame: "classic",
      layout: "grid-2x2",
      captureId: "capture-1",
      revision: 2,
      preview: true,
      eventName: "Emma's birthday",
    });
    expect(wire.sent).toHaveLength(3);

    const { transfer, onPhoto } = createTransfer();
    for (const message of wire.sent) transfer.receive({ peer: "host" }, message);

    expect(onPhoto).toHaveBeenCalledWith({
      id: "photo-1",
      frame: "classic",
      layout: "grid-2x2",
      captureId: "capture-1",
      revision: 2,
      preview: true,
      eventName: "Emma's birthday",
      dataUrl,
    });
  });

  it("refuses to send a photo over the 4 MB limit", () => {
    const wire = createWire();
    const sender = new PhotoTransfer({ onPhoto: vi.fn(), onHostPhoto: vi.fn() });

    expect(() =>
      sender.send(wire, {
        id: "photo-1",
        frame: "classic",
        layout: "single-horizontal",
        dataUrl: `data:image/png;base64,${"A".repeat(4 * 1024 * 1024)}`,
      }),
    ).toThrow(/too large to share/);
    expect(wire.sent).toHaveLength(0);
  });
});

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

  it("drops a photo-start whose id is not a non-empty string", () => {
    for (const id of [undefined, "", 42]) {
      const { transfer, onPhoto, onHostPhoto } = createTransfer();

      transfer.receive(connection, {
        type: "photo-start",
        id,
        frame: "classic",
        layout: "single-horizontal",
        total: 1,
      });
      transfer.receive(connection, {
        type: "photo-chunk",
        id,
        index: 0,
        data: "data:image/png;base64,AA",
      });

      expect(onPhoto).not.toHaveBeenCalled();
      expect(onHostPhoto).not.toHaveBeenCalled();
    }
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
