import { formatFrameDate, resolveFrameLabels } from "../frames/shared.js";

describe("frame date and event-name labels", () => {
  it("formats the capture time automatically", () => {
    const date = new Date("2026-03-09T15:30:00Z");
    const labels = resolveFrameLabels({ takenAt: date, eventName: "" });

    expect(labels.date).toBe(formatFrameDate(date));
    expect(labels.date).toMatch(/\d{2} \w{3} \d{4}/);
  });

  it("keeps the title constant across frames", () => {
    expect(resolveFrameLabels({}).title).toBe("Little Moments");
  });

  it("trims and exposes an event name when provided", () => {
    const labels = resolveFrameLabels({ eventName: "  Emma's birthday  " });

    expect(labels.event).toBe("Emma's birthday");
    expect(labels.hasEvent).toBe(true);
  });

  it("omits the event label cleanly when the field is empty or whitespace", () => {
    expect(resolveFrameLabels({ eventName: "" })).toMatchObject({ event: "", hasEvent: false });
    expect(resolveFrameLabels({ eventName: "   " })).toMatchObject({ event: "", hasEvent: false });
    expect(resolveFrameLabels({ eventName: null }).hasEvent).toBe(false);
    expect(resolveFrameLabels({ eventName: undefined }).hasEvent).toBe(false);
  });

  it("caps a peer-supplied event name at 40 characters", () => {
    const labels = resolveFrameLabels({
      eventName: "x".repeat(39) + " " + "overflow",
    });

    expect(labels.event).toBe("x".repeat(39));
    expect(labels.hasEvent).toBe(true);
  });

  it("falls back to the current date when no capture time is given", () => {
    const labels = resolveFrameLabels({});
    expect(labels.date).toBe(formatFrameDate(new Date()));
  });

  it("accepts timestamp strings and safely handles invalid dates", () => {
    expect(resolveFrameLabels({ takenAt: "2026-03-09T15:30:00Z" }).date)
      .toBe(formatFrameDate(new Date("2026-03-09T15:30:00Z")));
    expect(resolveFrameLabels({ takenAt: "not a date" }).date).toBe("");
  });
});
